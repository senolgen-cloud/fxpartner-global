import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";

// The 404 copy, in every tree. Kept here rather than in the chrome.json
// overlays because one of its two callers, app/global-not-found.tsx, renders
// outside the locale layout: there is no LocaleProvider and no server locale
// for tr() to read, and shipping a whole overlay to the client for five
// sentences would be the wrong trade.
const COPY: Record<
  Locale,
  { title: string; body: string; home: string; nav: string; links: string[] }
> = {
  tr: {
    title: "Aradığınız sayfa bulunamadı",
    body: "Bağlantı eskimiş ya da adres yanlış yazılmış olabilir. Aşağıdaki bölümlerden devam edebilirsiniz.",
    home: "Ana sayfaya dön",
    nav: "Popüler bölümler",
    links: ["Broker karşılaştırması", "Sinyaller", "Blog", "Eğitim", "Broker sorgula"],
  },
  en: {
    title: "The page you were looking for could not be found",
    body: "The link may be out of date or the address mistyped. You can carry on from one of the sections below.",
    home: "Back to the home page",
    nav: "Popular sections",
    links: ["Broker comparison", "Signals", "Blog", "Education", "Look up a broker"],
  },
  ua: {
    title: "Сторінку, яку ви шукали, не знайдено",
    body: "Можливо, посилання застаріло або адресу введено з помилкою. Продовжте з одного з розділів нижче.",
    home: "На головну сторінку",
    nav: "Популярні розділи",
    links: ["Порівняння брокерів", "Сигнали", "Блог", "Навчання", "Перевірити брокера"],
  },
  ar: {
    title: "لم يتم العثور على الصفحة التي تبحث عنها",
    body: "ربما يكون الرابط قديماً أو العنوان مكتوباً بشكل خاطئ. يمكنك المتابعة من أحد الأقسام أدناه.",
    home: "العودة إلى الصفحة الرئيسية",
    nav: "الأقسام الشائعة",
    links: ["مقارنة الوسطاء", "الإشارات", "المدونة", "التعليم", "البحث عن وسيط"],
  },
};

// The sections people most often arrive looking for, in the same order as
// the labels above. A dead link from Telegram or an old search result should
// end one tap away from what the reader wanted, not at a wall.
const HREFS = ["/brokerlar", "/signals", "/blog", "/egitim", "/broker-lookup"];

export function notFoundTitle(locale: Locale): string {
  return COPY[locale].title;
}

/**
 * The body of the 404 page. No hooks and no server-only imports, so the
 * server not-found boundary and the client global 404 can both render it.
 * Plain next/link with an explicit locale prefix rather than LocaleLink,
 * which needs a LocaleProvider the global page does not have.
 */
export default function NotFoundBody({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-5 px-6 py-24">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">404</span>
        <h1 className="text-2xl font-semibold text-text-dark sm:text-3xl">{t.title}</h1>
        <p className="text-text-muted">{t.body}</p>
        <Link
          href={localePath(locale, "/")}
          className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-text-on-ink transition-colors hover:bg-signal-strong"
        >
          {t.home}
        </Link>
        <nav aria-label={t.nav} className="w-full">
          <ul className="flex flex-wrap gap-2">
            {HREFS.map((href, i) => (
              <li key={href}>
                <Link
                  href={localePath(locale, href)}
                  className="inline-block rounded-md border border-hairline-light px-3 py-1.5 text-sm text-text-dark transition-colors hover:border-signal"
                >
                  {t.links[i]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
