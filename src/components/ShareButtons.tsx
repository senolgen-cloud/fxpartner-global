"use client";

import { useState } from "react";

type Locale = "en" | "tr";

const COPY: Record<Locale, { label: string; copy: string; copied: string }> = {
  en: { label: "Share this page", copy: "Copy link", copied: "Link copied" },
  tr: { label: "Bu sayfayı paylaş", copy: "Linki kopyala", copied: "Link kopyalandı" },
};

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="lift-on-hover flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline-light bg-paper text-text-dark transition-colors hover:border-text-dark"
    >
      {children}
    </button>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.78-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.72.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.87.52 3.62 1.42 5.12L2 22l5-1.31A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18.15a8.1 8.1 0 0 1-4.14-1.13l-.3-.18-3.08.81.82-3-.19-.31A8.15 8.15 0 1 1 12 20.15z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M21.94 3.36 18.6 20.1c-.25 1.11-.9 1.38-1.83.86l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.16 9.39-8.49c.41-.36-.09-.56-.63-.2L6.02 12.9l-5.02-1.57c-1.09-.34-1.11-1.09.23-1.61L20.6 2.05c.91-.34 1.7.2 1.34 1.31Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2.25h3.05l-6.67 7.62 7.85 10.38h-6.15l-4.81-6.3-5.51 6.3H3.6l7.13-8.15L3.2 2.25h6.3l4.35 5.76 5.05-5.76Zm-1.07 16.2h1.69L7.28 4.03H5.47L17.83 18.45Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8.44h2.83l.42-3.28h-3.25V8.2c0-.95.26-1.6 1.63-1.6h1.74V3.67C15.98 3.6 15.05 3.5 13.96 3.5c-2.28 0-3.84 1.39-3.84 3.95v2.83H7.28v3.28h2.84V22Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M6.94 8.5H3.56V20.4h3.38ZM5.25 3.6a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 20.4v-6.5c0-3.48-1.86-5.1-4.34-5.1-2 0-2.89 1.1-3.39 1.87V8.5H9.33c.04.96 0 11.9 0 11.9h3.38v-6.64c0-.36.03-.71.13-.97.29-.71.94-1.45 2.04-1.45 1.44 0 2.02 1.1 2.02 2.7v6.36Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.4-1.4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function ShareButtons({
  title,
  text = "",
  locale = "en",
}: {
  title: string;
  text?: string;
  locale?: Locale;
}) {
  const [copied, setCopied] = useState(false);
  const t = COPY[locale];

  function currentUrl(): string {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }

  function openShareWindow(shareUrl: string) {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=640");
  }

  function shareToWhatsApp() {
    const summary = text ? `${title} — ${text}` : title;
    openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${summary}\n${currentUrl()}`)}`);
  }

  function shareToTelegram() {
    const summary = text ? `${title} — ${text}` : title;
    openShareWindow(
      `https://t.me/share/url?url=${encodeURIComponent(currentUrl())}&text=${encodeURIComponent(summary)}`
    );
  }

  function shareToX() {
    openShareWindow(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl())}`
    );
  }

  function shareToFacebook() {
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`);
  }

  function shareToLinkedIn() {
    openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl())}`);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (unsupported browser/permissions) — no-op.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-hairline-light pt-8">
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
        {t.label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <IconButton label="WhatsApp" onClick={shareToWhatsApp}>
          <WhatsAppIcon />
        </IconButton>
        <IconButton label="Telegram" onClick={shareToTelegram}>
          <TelegramIcon />
        </IconButton>
        <IconButton label="X (Twitter)" onClick={shareToX}>
          <XIcon />
        </IconButton>
        <IconButton label="Facebook" onClick={shareToFacebook}>
          <FacebookIcon />
        </IconButton>
        <IconButton label="LinkedIn" onClick={shareToLinkedIn}>
          <LinkedInIcon />
        </IconButton>
        <IconButton label={copied ? t.copied : t.copy} onClick={copyLink}>
          {copied ? <CheckIcon /> : <LinkIcon />}
        </IconButton>
      </div>
    </div>
  );
}
