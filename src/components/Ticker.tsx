import { getTickerPairs } from "@/lib/rates";
import TickerClient from "@/components/TickerClient";

export default async function Ticker() {
  const pairs = await getTickerPairs();
  if (pairs.length === 0) return null;

  return <TickerClient pairs={pairs} />;
}
