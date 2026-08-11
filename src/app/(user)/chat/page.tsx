"use client";

import { useEffect, useRef, useState } from "react";
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

export default function UserChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [presence, setPresence] = useState<{ isOnline: boolean; statusText: string }>({ isOnline: true, statusText: "Đang online" });
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat/conversations")
      .then((r) => r.json())
      .then((data) => {
        const convId = data.id || data[0]?.id;
        if (convId) {
          setConversationId(convId);
          return fetch(`/api/chat/messages?conversationId=${convId}`);
        }
      })
      .then((r) => r?.json())
      .then((msgs) => { if (msgs) setMessages(msgs); })
      .catch(() => {})
      .finally(() => setLoading(false));

    function checkPresence() {
      fetch("/api/chat/presence")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setPresence(data);
        })
        .catch(() => {});
    }

    checkPresence();
    const interval = setInterval(checkPresence, 5000);
    return () => clearInterval(interval);
  }, []);

  const isInitialUserChatLoadRef = useRef(true);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isInitialUserChatLoadRef.current || isNearBottom) {
      container.scrollTop = container.scrollHeight;
      isInitialUserChatLoadRef.current = false;
    }
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(() => {
      fetch(`/api/chat/messages?conversationId=${conversationId}`)
        .then((r) => r.json())
        .then(setMessages)
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

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
      }
    } finally {
      setTimeout(() => setSending(false), 800);
    }
  }

  if (loading) {
    return <div className="skeleton" style={{ height: "calc(100vh - var(--header-height) - 64px)" }} />;
  }

  return (
    <div className="user-chat-container">
      <div className="chat-header-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
          <div className={presence.isOnline ? "chat-online-dot" : "chat-offline-dot"} />
          <span className="chat-header-title">Hỗ trợ - Tiệm Của Mew Admin</span>
        </div>
        <span className="chat-header-status" style={{ color: presence.isOnline ? "var(--success)" : "var(--text-muted)" }}>
          {presence.statusText}
        </span>
      </div>

      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              <path d="M8 10h8M8 14h5" strokeWidth="2"/>
            </svg>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Bắt đầu cuộc trò chuyện</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", maxWidth: "280px" }}>
              Gửi tin nhắn trực tiếp cho Quản trị viên để được tư vấn chọn máy ảnh & ống kính ưng ý nhất.
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === (session?.user as any)?.id;
            return (
              <div key={msg.id} style={{ display: "flex", gap: "8px", alignItems: "flex-end", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
                {!isOwn && (
                  <div className="header-avatar" style={{ width: "32px", height: "32px", flexShrink: 0 }}>
                    <img
                      src={getAvatarUrl(msg.sender?.email || msg.sender?.name || "Admin")}
                      alt=""
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <ChatMessageBubble msg={msg} isOwn={isOwn} />
                {isOwn && (
                  <div className="header-avatar" style={{ width: "32px", height: "32px", flexShrink: 0 }}>
                    <img
                      src={getAvatarUrl(session?.user?.email || session?.user?.name)}
                      alt=""
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <QuickReplyChips
        onSelect={(text) => setInput(text)}
        userInfo={{
          name: session?.user?.name || undefined,
          email: session?.user?.email || undefined,
        }}
      />

      <form onSubmit={sendMessage} className="chat-input-bar">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
        />
        <button type="submit" className="chat-send-btn" disabled={sending} style={{ opacity: sending ? 0.6 : 1 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10l14-7-7 14v-7H3z" fill="currentColor"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
