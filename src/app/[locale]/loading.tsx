import BrandLoader from "@/components/BrandLoader";

// Shown by App Router while a route segment's data resolves — the blank
// screen the owner asked to replace. Several pages here are force-dynamic
// and read the database on every request (/signals, /ekonomik-takvim), so
// this is not a theoretical state.
export default function Loading() {
  return <BrandLoader />;
}
