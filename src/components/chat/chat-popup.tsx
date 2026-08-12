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
  const [productTitle, setProductTitle] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = useRef(0);

  const isProductPage = pathname.startsWith("/products/") && pathname !== "/products";

  useEffect(() => {
    if (isProductPage) {
      const headingEl = document.querySelector("h1");
      if (headingEl && headingEl.textContent) {
        setProductTitle(headingEl.textContent.trim());
      } else {
        setProductTitle("Thiết Bị Nhiếp Ảnh");
      }
    } else {
      setProductTitle("");
    }
  }, [pathname, isProductPage]);

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

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setToastMessage(null);
    }
  }, [isOpen]);

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

  if (pathname.startsWith("/admin") || pathname.startsWith("/chat") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <>
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

      <button
        type="button"
        className={`chat-floating-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Thu nhỏ khung hỗ trợ" : "Mở khung hỗ trợ trực tuyến"}
      >
        <div className="chat-trigger-icon-wrap">
          {isOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
          {!isOpen && unreadCount > 0 && <span className="chat-unread-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
        </div>
        <div className="chat-trigger-pulse" />
      </button>

      <div className={`chat-popup-window ${isOpen ? "active" : ""}`}>
        <div className="chat-popup-header">
          <div className="chat-popup-header-info">
            <div className="chat-popup-avatar-wrap">
              <img src={getAvatarUrl("Tiệm Của Mew")} alt="Support Avatar" />
              <span className={`chat-presence-dot ${presence.isOnline ? "online" : "offline"}`} />
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
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {isProductPage && (
          <div className="chat-product-context-bar">
            <div className="chat-product-context-info">
              <span className="chat-product-context-tag">ĐANG XEM</span>
              <span className="chat-product-context-title">{productTitle || "Sản Phẩm Nhiếp Ảnh"}</span>
            </div>
            <button
              type="button"
              className="chat-product-context-btn"
              onClick={() => setInput(`Tôi muốn nhận tư vấn thuê thiết bị ${productTitle || "này"}.`)}
            >
              TƯ VẤN MÁY NÀY
            </button>
          </div>
        )}

        <QuickReplyChips
          onSelect={(text) => {
            setInput(text);
          }}
        />

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

        <form className="chat-popup-footer" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim() || sending} aria-label="Gửi">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
