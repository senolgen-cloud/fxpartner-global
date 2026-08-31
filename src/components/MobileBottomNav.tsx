import { optionalSession } from "@/lib/optionalSession";
import MobileBottomNavClient from "@/components/MobileBottomNavClient";

export default async function MobileBottomNav() {
  const session = await optionalSession();
  const accountHref = session?.user ? "/account" : "/account/login";
  return <MobileBottomNavClient accountHref={accountHref} />;
}
