import { auth } from "@/auth";
import MobileBottomNavClient from "@/components/MobileBottomNavClient";

export default async function MobileBottomNav() {
  const session = await auth();
  const accountHref = session?.user ? "/account" : "/account/login";
  return <MobileBottomNavClient accountHref={accountHref} />;
}
