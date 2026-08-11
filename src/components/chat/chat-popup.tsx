"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatTime, getAvatarUrl } from "@/lib/utils";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { QuickReplyChips } from "@/components/chat/quick-reply-chips";

interface Message {
  id: string;
  content: string;
  type: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; role: string; email?: string };
}

export function ChatPopup() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<Message | null>(null);
  const [presence, setPresence] = useState<{ isOnline: boolean; statusText: string }>({ isOnline: true, statusText: "Đang online" });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = useRef(0);

  // Play subtle audio alert on new message
  function playAlertSound() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  // Hide popup on admin routes and main chat page
  if (pathname.startsWith("/admin") || pathname.startsWith("/chat")) {
    return null;
  }

  // Fetch initial conversation ID & Presence
  useEffect(() => {
    if (!session) return;

    fetch("/api/chat/conversations")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const convId = data.id || data[0]?.id;
        if (convId) {
          setConversationId(convId);
        }
      })
      .catch(() => {});

    // Chỉ check presence và poll messages khi Chat Popup ĐANG MỞ
    if (!isOpen) return;

    function checkPresence() {
      fetch("/api/chat/presence")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setPresence(data);
        })
        .catch(() => {});
    }

    checkPresence();
    const presenceInterval = setInterval(checkPresence, 15000); // 15s/lần khi đang mở chat
    return () => clearInterval(presenceInterval);
  }, [session, isOpen]);

  // Listen for custom "open-chat-popup" trigger event from product detail pages or actions
  useEffect(() => {
    function handleOpenChatPopup(e: any) {
      setIsOpen(true);
      const initialMessage = e.detail?.initialMessage;
      if (initialMessage && conversationId) {
        fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content: initialMessage, type: "TEXT" }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((msg) => {
            if (msg) {
              setMessages((prev) => [...prev, msg]);
              prevMessagesCountRef.current += 1;
            }
          })
          .catch(() => {});
      }
    }

    window.addEventListener("open-chat-popup", handleOpenChatPopup);
    return () => window.removeEventListener("open-chat-popup", handleOpenChatPopup);
  }, [conversationId]);

  // Real-time message polling (chỉ chạy khi isOpen === true)
  useEffect(() => {
    if (!session || !conversationId || !isOpen) return;

    function pollMessages() {
      fetch(`/api/chat/messages?conversationId=${conversationId}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((newMsgs: Message[]) => {
          if (!Array.isArray(newMsgs)) return;

          if (prevMessagesCountRef.current > 0 && newMsgs.length > prevMessagesCountRef.current) {
            const latestMsg = newMsgs[newMsgs.length - 1];
            const currentUserId = (session?.user as any)?.id;

            if (latestMsg && latestMsg.senderId !== currentUserId) {
              playAlertSound();
            }
          }

          prevMessagesCountRef.current = newMsgs.length;
          setMessages(newMsgs);
        })
        .catch(() => {});
    }

    pollMessages();
    const interval = setInterval(pollMessages, 5000); // 5s/lần khi đang mở chat
    return () => clearInterval(interval);
  }, [session, conversationId, isOpen]);

  // Clear unread count when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setToastMessage(null);
    }
  }, [isOpen]);

  // Smart Auto scroll: Only scroll if near bottom or initial load
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!isOpen) {
      isInitialLoadRef.current = true;
      return;
    }

    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isInitialLoadRef.current || isNearBottom) {
      container.scrollTop = container.scrollHeight;
      isInitialLoadRef.current = false;
    }
  }, [messages, isOpen]);

  // Auto hide Toast preview after 6 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !conversationId || sending) return;

    setSending(true);
    const content = input;
    setInput("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content, type: "TEXT" }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        prevMessagesCountRef.current += 1;
      }
    } finally {
      setTimeout(() => setSending(false), 600);
    }
  }

  return (
    <>
      {/* Toast Real-time Notification Banner */}
      {toastMessage && !isOpen && (
        <div className="chat-toast-banner" onClick={() => setIsOpen(true)}>
          <div className="chat-toast-avatar">
            <img
              src={getAvatarUrl(toastMessage.sender?.email || toastMessage.sender?.name || "Admin")}
              alt="Sender"
            />
          </div>
          <div className="chat-toast-content">
            <div className="chat-toast-title">
              <span>{toastMessage.sender?.name || "Tiệm Của Mew Admin"}</span>
              <span className="chat-toast-time">{formatTime(toastMessage.createdAt)}</span>
            </div>
            <div className="chat-toast-text">{toastMessage.content}</div>
          </div>
          <button
            className="chat-toast-close"
            onClick={(e) => {
              e.stopPropagation();
              setToastMessage(null);
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Trigger Button with Unread Badge */}
      <button
        className="chat-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Support Chat Popup"
        style={{ color: "#ffffff" }}
      >
        {unreadCount > 0 && !isOpen && (
          <span className="chat-unread-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        )}
      </button>

      {/* Floating Chat Popup Window */}
      {isOpen && (
        <div className="chat-popup-window">
          <div className="chat-popup-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div className={presence.isOnline ? "chat-online-dot" : "chat-offline-dot"} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Tư vấn Tiệm Của Mew
                </div>
                <div style={{ fontSize: "0.7rem", color: presence.isOnline ? "var(--success)" : "var(--text-muted)", fontWeight: 600 }}>
                  {presence.statusText}
                </div>
              </div>
            </div>
            <button className="modal-close" onClick={() => setIsOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="chat-messages" ref={messagesContainerRef} style={{ padding: "14px", flex: 1 }}>
            {!session ? (
              <div className="chat-empty" style={{ padding: "20px 10px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>Vui lòng đăng nhập</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "12px" }}>
                  Đăng nhập tài khoản để chat trực tiếp với Quản trị viên 24/7.
                </div>
                <a href="/login" className="btn btn-primary btn-sm">Đăng nhập ngay</a>
              </div>
            ) : messages.length === 0 ? (
              <div className="chat-empty" style={{ padding: "20px 10px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>Xin chào!</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center" }}>
                  Nhắn tin cho Tiệm Của Mew để được tư vấn thiết bị máy ảnh phù hợp nhất.
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === (session?.user as any)?.id;
                return (
                  <div key={msg.id} style={{ display: "flex", gap: "6px", alignItems: "flex-end", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
                    {!isOwn && (
                      <div className="header-avatar" style={{ width: "26px", height: "26px", flexShrink: 0 }}>
                        <img
                          src={getAvatarUrl(msg.sender?.email || msg.sender?.name || "Admin")}
                          alt=""
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <ChatMessageBubble msg={msg} isOwn={isOwn} />
                  </div>
                );
              })
            )}
          </div>

          {session && (
            <QuickReplyChips
              onSelect={(text) => setInput(text)}
              userInfo={{
                name: session.user?.name || undefined,
                email: session.user?.email || undefined,
              }}
            />
          )}

          {session && (
            <form onSubmit={sendMessage} className="chat-input-bar" style={{ padding: "10px 12px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                style={{ padding: "8px 14px", fontSize: "0.875rem" }}
              />
              <button type="submit" className="chat-send-btn" disabled={sending} style={{ width: "36px", height: "36px" }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10l14-7-7 14v-7H3z" fill="currentColor"/>
                </svg>
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
