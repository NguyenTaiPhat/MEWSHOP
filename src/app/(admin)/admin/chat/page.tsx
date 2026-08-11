"use client";

import { useEffect, useState, useRef } from "react";
import { formatTime, getAvatarUrl } from "@/lib/utils";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { QuickReplyChips } from "@/components/chat/quick-reply-chips";

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  function loadConversations() {
    setLoading(true);
    fetch("/api/chat/conversations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setConversations(data);
          if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/chat/messages?conversationId=${selectedId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(() => {});
  }, [selectedId]);

  const isInitialAdminChatLoadRef = useRef(true);

  useEffect(() => {
    isInitialAdminChatLoadRef.current = true;
  }, [selectedId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isInitialAdminChatLoadRef.current || isNearBottom) {
      container.scrollTop = container.scrollHeight;
      isInitialAdminChatLoadRef.current = false;
    }
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;

    const content = input;
    setInput("");

    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId, content, type: "TEXT" }),
    });

    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      loadConversations();
    }
  }

  return (
    <div className="chat-layout">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">Danh sách hội thoại</div>
        <div className="chat-sidebar-list">
          {loading ? (
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: "64px", borderRadius: "10px" }} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Chưa có cuộc hội thoại nào từ khách hàng
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={`chat-conversation-item ${selectedId === c.id ? "active" : ""}`}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="chat-conversation-avatar">
                  <img
                    src={getAvatarUrl(c.user?.email || c.user?.name)}
                    alt={c.user?.name || "Avatar"}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                </div>

                <div className="chat-conversation-info">
                  <div className="chat-conversation-name">{c.user?.name || "Khách hàng"}</div>
                  <div className="chat-conversation-preview">
                    {c.messages && c.messages[0]?.content ? c.messages[0].content : "Chưa có tin nhắn"}
                  </div>
                </div>
                {c.unreadCount > 0 && (
                  <span className="badge badge-accent" style={{ fontSize: "0.75rem", borderRadius: "999px" }}>{c.unreadCount}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedId ? (
          <>
            <div className="chat-messages" ref={messagesContainerRef}>
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                  </svg>
                  <span>Bắt đầu cuộc trò chuyện tư vấn thuê máy ảnh với khách hàng</span>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender?.role === "ADMIN";
                  return <ChatMessageBubble key={msg.id} msg={msg} isOwn={isOwn} />;
                })
              )}
            </div>

            <QuickReplyChips onSelect={(text) => setInput(text)} />

            <form onSubmit={sendMessage} className="chat-input-bar">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn tư vấn & hỗ trợ khách hàng..."
              />
              <button type="submit" className="chat-send-btn" title="Gửi tin nhắn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10l14-7-7 14v-7H3z" fill="currentColor"/>
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Chọn một cuộc hội thoại từ danh sách bên trái</div>
            <div style={{ fontSize: "0.8125rem" }}>Hỗ trợ khách hàng thuê camera, ống kính và tư vấn kỹ thuật 24/7</div>
          </div>
        )}
      </div>
    </div>
  );
}
