"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, clearError } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || (status !== "ready" && status !== "error")) return;
    if (status === "error") clearError();
    sendMessage({ text });
    setInput("");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open FXPARTNER assistant"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-text-on-ink shadow-2xl transition-transform hover:scale-105"
      >
        <span className="font-mono text-xl">?</span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-40 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-hairline bg-ink text-text-on-ink shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="FXPARTNER assistant"
    >
      <div className="flex items-center justify-between border-b border-hairline/40 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
          FXPARTNER Assistant
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="font-mono text-lg text-text-on-ink-muted transition-colors hover:text-text-on-ink"
        >
          ×
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-sm leading-relaxed text-text-on-ink-muted">
            Ask me about brokers, spreads, regulation, or opening an account —
            I&apos;ll point you to the right comparison.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`text-sm leading-relaxed ${
              message.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl bg-signal px-3 py-2 text-paper-high"
                : "mr-auto max-w-[85%] rounded-2xl bg-ink-soft px-3 py-2 text-text-on-ink"
            }`}
          >
            {message.parts
              .filter((part) => part.type === "text")
              .map((part, i) => (
                <span key={i} className="whitespace-pre-wrap">
                  {part.text}
                </span>
              ))}
          </div>
        ))}
        {(status === "submitted" || status === "streaming") &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="mr-auto max-w-[85%] rounded-2xl bg-ink-soft px-3 py-2 text-sm text-text-on-ink-muted">
              …
            </div>
          )}
        {status === "error" && (
          <div className="mr-auto max-w-[85%] rounded-2xl bg-ink-soft px-3 py-2 text-sm text-red-300">
            {error?.message || "Something went wrong — please try again."}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-hairline/40 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            className="flex-1 rounded-full border border-hairline/40 bg-ink-soft px-3 py-2 text-sm text-text-on-ink outline-none placeholder:text-text-on-ink-muted focus:border-signal"
          />
          <button
            type="submit"
            disabled={(status !== "ready" && status !== "error") || !input.trim()}
            className="rounded-full bg-signal px-4 py-2 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-text-on-ink-muted">
          AI-generated, not investment advice · Verify terms with each broker directly
        </p>
      </form>
    </div>
  );
}
