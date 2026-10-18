"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef, Suspense } from "react";
import { useLang } from "@/components/LangProvider";

// ── Sidebar element ──────────────────────────────────────────
function SidebarItem({ icon, label, active, href, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; href?: string; onClick?: () => void;
}) {
  const cls = `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer w-full ${
    active ? "bg-yellow-400 text-black shadow-sm" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2b30] hover:text-gray-900 dark:hover:text-white"
  }`;
  if (href) return <Link href={href} className={cls}>{icon}{label}</Link>;
  return <button className={cls} onClick={onClick}>{icon}{label}</button>;
}

// ── Avatar ────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 10 }: { name: string; avatar?: string | null; size?: number }) {
  if (avatar) return <img src={avatar} className={`w-${size} h-${size} rounded-full object-cover shrink-0`} alt={name} />;
  return (
    <div className={`w-${size} h-${size} rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold shrink-0`}
      style={{ fontSize: size * 1.6 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Vaqt formati ──────────────────────────────────────────────
function timeStr(d: string, lang = "uz") {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return lang === "ru" ? "Только что" : lang === "en" ? "Just now" : "Hozirgina";
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return lang === "ru" ? `${mins} мин` : lang === "en" ? `${mins}m ago` : `${mins} daqiqa`;
  }
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ";
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

// ── Asosiy Chat komponenti ────────────────────────────────────
function ChatContent() {
  const { t, lang } = useLang();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [activeConv, setActiveConv] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<any>(null);
  const prevMsgCount = useRef(0);
  const isFirstLoad = useRef(true);

  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  // Suhbatlarni yuklash
  const loadConversations = async () => {
    const res = await fetch("/api/conversations");
    if (res.ok) {
      const data = await res.json();
      setConversations(data);
      return data;
    }
    return [];
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    const init = async () => {
      // URL'dan recipientId bo'lsa, suhbat ochish
      const recipientId = searchParams.get("recipientId");
      const listingId = searchParams.get("listingId");
      if (recipientId) {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId, listingId }),
        });
        if (res.ok) {
          const conv = await res.json();
          const convs = await loadConversations();
          setActiveConvId(conv.id);
          const found = convs.find((c: any) => c.id === conv.id);
          setActiveConv(found || conv);
          router.replace("/profile/messages");
          return;
        }
      }
      loadConversations();
    };
    init();
  }, [status, searchParams]);

  // Xabarlarni yuklash va polling
  useEffect(() => {
    if (!activeConvId) return;

    isFirstLoad.current = true;
    prevMsgCount.current = 0;

    const loadMessages = async () => {
      const res = await fetch(`/api/conversations/${activeConvId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        // Faqat birinchi yuklashda yoki yangi xabar kelganda pastga scroll
        if (isFirstLoad.current || data.length > prevMsgCount.current) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: isFirstLoad.current ? "auto" : "smooth" }), 50);
          isFirstLoad.current = false;
        }
        prevMsgCount.current = data.length;
      }
    };

    loadMessages();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [activeConvId]);

  const openConversation = (conv: any) => {
    setActiveConvId(conv.id);
    setActiveConv(conv);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConvId || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeConvId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setText("");
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        loadConversations();
      }
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!confirm(t.deleteChatConfirm)) return;
    try {
      const res = await fetch(`/api/conversations/${convId}`, { method: "DELETE" });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== convId));
        if (activeConvId === convId) {
          setActiveConvId(null);
          setActiveConv(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Server tomonidan hisoblangan — endi client tomonda ID taqqoslab o'tirmaymiz
  const getOtherParticipant = (conv: any) => {
    return conv?.otherParticipant || conv?.participants?.[0] || null;
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-gray-50 dark:bg-[#111113] border-r border-gray-200 dark:border-white/5 py-6 px-3 gap-1">
        <SidebarItem href="/profile"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>}
          label={t.profile} />
        <SidebarItem href="#"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
          label={t.balance} />
        <SidebarItem href="/profile/messages" active
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>}
          label={t.messages} />
        <SidebarItem href="#"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>}
          label={t.confirmProfile} />
        <SidebarItem href="/profile?tab=sessions"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
          label={t.activeSessions} />
        <div className="mt-auto">
          <SidebarItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>}
            label={t.logout}
            onClick={() => signOut({ callbackUrl: window.location.origin })} />
        </div>
      </aside>

      {/* Asosiy kontent */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Chap: Suhbatlar ro'yxati */}
          <div className={`${activeConvId ? "hidden md:flex" : "flex"} w-full md:w-72 border-r border-gray-200 dark:border-white/5 flex-col shrink-0`}>
            <div className="px-4 py-4 border-b border-gray-200 dark:border-white/5">
              <h2 className="text-gray-900 dark:text-white font-bold text-lg">{t.messages}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <p className="text-gray-600 text-sm">{t.noConversations}</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const other = getOtherParticipant(conv);
                  const lastMsg = conv.messages?.[0];
                  return (
                    <div key={conv.id}
                      onClick={() => openConversation(conv)}
                      className={`group w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-white/5 cursor-pointer relative ${
                        activeConvId === conv.id ? "bg-gray-100 dark:bg-white/10" : ""
                      }`}>
                      <Avatar name={other?.name || "?"} avatar={other?.avatar} size={10} />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-gray-900 dark:text-white font-semibold text-sm truncate">{other?.name || (lang === 'ru' ? "Пользователь" : lang === 'en' ? "User" : "Foydalanuvchi")}</p>
                        {conv.listingTitle && (
                          <p className="text-yellow-500 dark:text-yellow-400 font-medium text-[10px] truncate mb-0.5">{conv.listingTitle}</p>
                        )}
                        <p className="text-gray-500 text-xs truncate">{lastMsg?.text || (lang === 'ru' ? "Беседа начата" : lang === 'en' ? "Conversation started" : "Suhbat boshlandi")}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {lastMsg && (
                          <span className="text-gray-400 dark:text-gray-500 text-[10px]">{timeStr(lastMsg.createdAt, lang)}</span>
                        )}
                        <button
                          onClick={(e) => deleteConversation(e, conv.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity rounded-full hover:bg-gray-200 dark:hover:bg-white/10"
                          title={t.deleteChat}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* O'ng: Chat oynasi */}
          {activeConvId && activeConv ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-white/5 shrink-0 bg-gray-50 dark:bg-[#111113]">
                <button onClick={() => { setActiveConvId(null); setActiveConv(null); }}
                  className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
                  </svg>
                </button>
                {(() => { const other = getOtherParticipant(activeConv); return other ? (
                  <>
                    <Avatar name={other.name} avatar={other.avatar} size={9} />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 dark:text-white font-bold text-sm truncate">{other.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-500 text-xs">{t.chatWith}</p>
                        {activeConv.listingTitle && (
                          <>
                            <span className="text-gray-600 text-[10px]">•</span>
                            <Link href={`/listing/${activeConv.listingId}`} className="text-yellow-400/80 hover:text-yellow-400 hover:underline text-[11px] truncate">
                              {activeConv.listingTitle}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Siz kim ekanligi */}
                    <div className="flex items-center gap-2 shrink-0 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        {t.you}: <span className="text-yellow-500 dark:text-yellow-400">{session?.user?.name || "?"}</span>
                      </span>
                    </div>
                  </>
                ) : null; })()}
              </div>

              {/* Xabarlar */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-[#0d0d0f]">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-600 text-sm">{t.startChat}</p>
                  </div>
                )}
                {messages.map((msg: any) => {
                  const isMe = msg.senderId === currentUserId;
                  const senderName = isMe ? t.you : (msg.sender?.name || "?");
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-0.5`}>
                      {/* Kim yuborgani */}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
                        {senderName}
                      </span>
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2 w-full`}>
                        {!isMe && <Avatar name={msg.sender?.name || "?"} avatar={msg.sender?.avatar} size={7} />}
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                          isMe ? "bg-yellow-400 text-black rounded-br-sm" : "bg-gray-100 dark:bg-[#2a2b30] text-gray-900 dark:text-white rounded-bl-sm"
                        }`}>
                          <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? "text-black/50" : "text-gray-500"} text-right`}>
                            {timeStr(msg.createdAt, lang)}
                            {isMe && <span className="ml-1">{msg.read ? "✓✓" : "✓"}</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Xabar yozish maydon */}
              <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#111113] shrink-0">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={t.writeMessage}
                  className="flex-1 bg-white dark:bg-[#1e1f23] text-gray-900 dark:text-white placeholder-gray-500 rounded-full px-4 py-3 text-sm outline-none border border-gray-300 dark:border-white/10 focus:border-yellow-400/50 transition-colors"
                />
                <button type="submit" disabled={!text.trim() || sending}
                  className="w-11 h-11 rounded-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-5 h-5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
                  </svg>
                </button>
              </form>
            </div>
          ) : (
            /* Bo'sh holat */
            <div className="hidden md:flex flex-1 items-center justify-center bg-white dark:bg-[#0d0d0f]">
              <div className="flex flex-col items-center gap-4 text-center px-8">
                <div className="w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-12 h-12">
                    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold text-[15px]">{t.selectChatHint}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex items-center justify-center"><div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
