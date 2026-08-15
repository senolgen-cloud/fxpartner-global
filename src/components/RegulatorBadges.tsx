import Reveal from "@/components/Reveal";

const regulators = [
  {
    flag: "🇬🇧",
    abbr: "FCA",
    name: "Financial Conduct Authority",
    country: "Birleşik Krallık",
  },
  {
    flag: "🇦🇺",
    abbr: "ASIC",
    name: "Australian Securities & Investments Commission",
    country: "Avustralya",
  },
  {
    flag: "🇭🇰",
    abbr: "SFC",
    name: "Securities and Futures Commission",
    country: "Hong Kong",
  },
  {
    flag: "🇨🇾",
    abbr: "CySEC",
    name: "Cyprus Securities and Exchange Commission",
    country: "Kıbrıs",
  },
  {
    flag: "🇦🇪",
    abbr: "CMA",
    name: "Capital Market Authority",
    country: "Birleşik Arap Emirlikleri",
  },
  {
    flag: "🇨🇴",
    abbr: "SFC",
    name: "Financial Superintendence of Colombia",
    country: "Kolombiya",
  },
  {
    flag: "🇿🇦",
    abbr: "FSCA",
    name: "Financial Sector Conduct Authority",
    country: "Güney Afrika",
  },
  {
    flag: "🇰🇭",
    abbr: "SERC",
    name: "Securities and Exchange Regulator of Cambodia",
    country: "Kamboçya",
  },
  {
    flag: "🇲🇺",
    abbr: "FSC",
    name: "Financial Services Commission",
    country: "Mauritius",
  },
  {
    flag: "🇸🇨",
    abbr: "Seychelles FSA",
    name: "Financial Services Authority Seychelles",
    country: "Seychelles",
  },
];

export default function RegulatorBadges() {
  return (
    <section id="regulators" className="relative overflow-hidden bg-ink-soft">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent"
      />
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            Denetim
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-text-on-ink md:text-4xl">
            Çapraz kontrol ettiğimiz regülatörler
          </h2>
          <p className="mt-4 text-text-on-ink-muted">
            Listelediğimiz her lisans, bir broker sıralamalarda yer almadan
            önce bu otoritelerden birinin kamuya açık siciline karşı
            doğrulanır.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-wrap justify-center gap-5">
          {regulators.map((reg, i) => (
            <Reveal key={`${reg.abbr}-${reg.country}`} delay={i * 40}>
              <div className="lift-on-hover flex w-[280px] items-center gap-4 rounded-2xl border border-hairline bg-ink px-5 py-4 sm:w-[300px]">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline-light bg-ink-soft text-xl"
                >
                  {reg.flag}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold leading-tight text-text-on-ink">
                    {reg.abbr}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] leading-snug text-text-on-ink-muted">
                    {reg.name}
                  </p>
                  <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                    {reg.country}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
