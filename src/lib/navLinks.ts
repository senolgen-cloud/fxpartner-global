// Shared between HeaderNav (desktop bar + tablet dropdown) and
// MoreMenuOverlay (the full-screen menu opened from the tablet hamburger
// or the mobile bottom nav's "Daha Fazla" tab) so both always list the
// same set of pages instead of drifting out of sync.
export const primaryLinks = [
  { href: "/#brokers", label: "Broker Rankings" },
  { href: "/signals", label: "Signals" },
  { href: "/ai-asistan", label: "AI Assistant" },
  { href: "/topluluk", label: "Community" },
  { href: "/blog", label: "Blog" },
];

export const resourceLinks = [
  {
    href: "/about",
    label: "About Us",
    description: "Who we are, our principles, and how partnerships work",
  },
  {
    href: "/ekonomik-takvim",
    label: "Economic Calendar",
    description: "Live macro events and their expected market impact",
  },
  {
    href: "/categories",
    label: "Categories",
    description: "Brokers grouped by what they're best suited for",
  },
  {
    href: "/piyasa-analizi",
    label: "Market Analysis",
    description: "Daily market commentary and technical outlook",
  },
  {
    href: "/partners",
    label: "Become a Partner",
    description: "Open a Sub-IB account and earn on clients you refer",
  },
  {
    href: "/copytrade",
    label: "Copytrade",
    description: "Auto-copy FXPARTNER's tracked trades onto your own MT5 account",
  },
  {
    href: "/cashback",
    label: "Cashback",
    description: "Rebate programs from partner brokers",
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    description: "Active referral and deposit promotions",
  },
  {
    href: "/broker-lookup",
    label: "Broker Lookup",
    description: "Search any broker for a sourced trust verdict",
  },
  {
    href: "/blacklist",
    label: "Risk Warnings",
    description: "Brokers that need extra due diligence",
  },
  {
    href: "/complaint",
    label: "Complaint",
    description: "Report an issue with a broker",
  },
];
