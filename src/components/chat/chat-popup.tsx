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

  // Fetch initial conversation ID & Presence
  useEffect(() => {
    if (!session || pathname.startsWith("/admin") || pathname.startsWith("/chat")) return;

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
    const presenceInterval = setInterval(checkPresence, 15000);
    return () => clearInterval(presenceInterval);
  }, [session, isOpen, pathname]);

  // Listen for custom "open-chat-popup" trigger event
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/chat")) return;

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
  }, [conversationId, pathname]);

  // Real-time message polling
  useEffect(() => {
    if (!session || !conversationId || !isOpen || pathname.startsWith("/admin") || pathname.startsWith("/chat")) return;

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
    const interval = setInterval(pollMessages, 5000);
    return () => clearInterval(interval);
  }, [session, conversationId, isOpen, pathname]);

  // Clear unread count when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setToastMessage(null);
    }
  }, [isOpen]);

  // Smart Auto scroll
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

  // Hide popup on admin routes and main chat page (moved AFTER all hooks to follow React Rules of Hooks)
  if (pathname.startsWith("/admin") || pathname.startsWith("/chat")) {
    return null;
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
            <div className="chat-toast-snippet">{toastMessage.content}</div>
          </div>
        </div>
      )}

      {/* Floating Trigger Pill Icon */}
      {!isOpen && (
        <button
          type="button"
          className="chat-floating-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Mở khung hỗ trợ trực tuyến"
        >
          <div className="chat-trigger-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {unreadCount > 0 && <span className="chat-unread-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </div>
          <div className="chat-trigger-pulse"></div>
        </button>
      )}

      {/* Expanded Floating Window */}
      {isOpen && (
        <div className="chat-popup-window">
          {/* Header */}
          <div className="chat-popup-header">
            <div className="chat-popup-header-info">
              <div className="chat-popup-avatar-wrap">
                <img src={getAvatarUrl("Tiệm Của Mew")} alt="Support Avatar" />
                <span className={`chat-presence-dot ${presence.isOnline ? "online" : "offline"}`}></span>
              </div>
              <div className="chat-popup-header-text">
                <h3>Hỗ Trợ Tiệm Của Mew</h3>
                <p className="chat-presence-status">{presence.statusText}</p>
              </div>
            </div>

            <div className="chat-popup-header-actions">
              <button
                type="button"
                className="chat-header-btn"
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Reply Chips */}
          <QuickReplyChips
            onSelect={(text) => {
              setInput(text);
            }}
          />

          {/* Messages Feed */}
          <div className="chat-popup-messages" ref={messagesContainerRef}>
            {messages.length === 0 ? (
              <div className="chat-empty-state">
                <p>Xin chào! Tiệm Của Mew có thể giúp gì cho bạn hôm nay?</p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.senderId === (session?.user as any)?.id}
                />
              ))
            )}
          </div>

          {/* Input Form */}
          <form className="chat-popup-footer" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim() || sending} aria-label="Gửi">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
