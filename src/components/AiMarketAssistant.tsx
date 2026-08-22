"use client";
import { useTr } from "@/components/useTr";

import { Fragment, useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Minimal markdown → JSX: turns [text](url) links and **bold** into real
// elements while leaving everything else as plain text. Good enough for
// Gemini's replies without pulling in a full markdown renderer.
//
// Matched with matchAll (not split+regex) because Gemini often wraps
// links in bold — **[text](url)** — and a split-based single-capture
// approach can't tell that apart from plain **bold**, so it swallowed
// the link markup as literal, non-clickable text. This tries the
// bold-wrapped-link form first, then a plain link, then plain bold.
const TOKEN_RE = /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

function renderContent(text: string, linkClassName: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>);
    }

    const [, boldLinkText, boldLinkUrl, linkText, linkUrl, boldText] = match;
    if (boldLinkText !== undefined) {
      nodes.push(
        <strong key={key++}>
          <a href={boldLinkUrl} target="_blank" rel="noopener noreferrer nofollow sponsored" className={linkClassName}>
            {boldLinkText}
          </a>
        </strong>
      );
    } else if (linkText !== undefined) {
      nodes.push(
        <a key={key++} href={linkUrl} target="_blank" rel="noopener noreferrer nofollow sponsored" className={linkClassName}>
          {linkText}
        </a>
      );
    } else if (boldText !== undefined) {
      nodes.push(<strong key={key++}>{boldText}</strong>);
    }

    lastIndex = TOKEN_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }
  return nodes;
}

const SUGGESTED_QUESTIONS = [
  "TÜFE (CPI) verisi beklenenden düşük gelirse EUR/USD ne olur?",
  "Ons Altın (XAUUSD) güncel destek ve direnç seviyeleri neler?",
  "Forex'te Lot ve Pip hesaplaması nasıl yapılır?",
  "ECB faiz indiriminin EUR üzerine etkileri nelerdir?",
];

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Merhaba! Ben **FXPARTNER Yapay Zeka Piyasa Asistanı**.\n\n" +
    "Forex pariteleri, Altın/Petrol analizi, makroekonomik verilerin piyasa etkileri (CPI, NFP, Faiz Kararları) veya teknik/temel analiz stratejileri hakkında sorularınızı yanıtlayabilirim.\n\n" +
    "Aşağıdaki hazır sorulardan birini seçebilir veya sorunuzu yazabilirsiniz!",
};

function timeLabel() {
  return new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

// Site-wide language selection lives in the same `googtrans` cookie the
// Google Translate widget itself reads (see GoogleTranslateWidget.tsx /
// LanguageSwitcher.tsx) — format "/en/<lang>", absent or "en" means
// English. Reusing it here means the assistant answers in whatever
// language the visitor already picked for the rest of the site, without
// a second language picker.
function currentSiteLang(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return "en";
  const parts = decodeURIComponent(match[1]).split("/");
  return parts[2] || "en";
}

export default function AiMarketAssistant() {
  const tr = useTr();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lang: currentSiteLang() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bilinmeyen hata");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            disabled={loading}
            className="flex items-center gap-2 rounded-full border border-hairline bg-ink-soft px-4 py-2 text-left text-sm text-text-on-ink-muted transition-colors hover:border-signal hover:text-text-on-ink disabled:opacity-50"
          >
            <span className="text-signal">⚡</span>
            {q}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-ink-soft">
        <div ref={scrollRef} className="max-h-[60vh] min-h-[320px] space-y-4 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                  m.role === "assistant" ? "bg-signal/20 text-signal" : "bg-paper-high text-text-on-ink"
                }`}
              >
                {m.role === "assistant" ? "🤖" : "🧑"}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "assistant"
                    ? "bg-paper text-text-on-ink"
                    : "bg-signal text-on-signal"
                }`}
              >
                {renderContent(
                  m.content,
                  m.role === "assistant"
                    ? "text-signal underline underline-offset-2 hover:text-signal-strong"
                    : "text-on-signal underline underline-offset-2"
                )}
                <div
                  className={`mt-1 text-[10px] ${
                    m.role === "assistant" ? "text-text-on-ink-muted" : "text-on-signal/70"
                  }`}
                >
                  {timeLabel()}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal/20 text-sm text-signal">
                🤖
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-paper px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-on-ink-muted [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-on-ink-muted [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-on-ink-muted" />
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-alert/40 bg-alert/10 px-4 py-2 text-sm text-alert">
              {error}
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-3 border-t border-hairline p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tr("Piyasalar, CPI, Altın, EURUSD veya stratejiler hakkında soru sorun...")}
            className="flex-1 rounded-full border border-hairline bg-paper px-4 py-2.5 text-sm text-text-on-ink placeholder:text-text-on-ink-muted focus:border-signal focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-50"
          >
            {tr("Gönder")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-text-on-ink-muted">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
        </svg>
        {tr("Yapay zeka analizleri eğitim amaçlıdır, doğrudan yatırım tavsiyesi içermez.")}
      </p>
    </div>
  );
}
