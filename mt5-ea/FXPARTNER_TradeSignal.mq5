//+------------------------------------------------------------------+
//|                                       FXPARTNER_TradeSignal.mq5   |
//|  Reports every trade this account opens/closes to FXPARTNER's    |
//|  /api/trade-signal and /api/trade-result endpoints, which turn   |
//|  them into styled cards posted to Telegram and X. The close      |
//|  report replies to (quotes) the original open post.              |
//|                                                                    |
//|  SETUP (required, one time):                                     |
//|  1) Tools > Options > Expert Advisors > tick "Allow WebRequest    |
//|     for listed URL" and add your site's URL, e.g.                |
//|     https://fxpartner.global                                     |
//|  2) Attach this EA to any chart (symbol/timeframe don't matter -  |
//|     it reports on every symbol traded on this account) and set   |
//|     the inputs below, especially ApiSecret.                      |
//|                                                                    |
//|  It also pushes the bid/ask of every open position to             |
//|  /api/live-prices every InpQuotePushSeconds, which is what feeds  |
//|  the "SU AN" column beside each signal on the site. Set that to   |
//|  0 to turn it off. Nothing else needs configuring - it reuses the |
//|  same secret and the same allowed URL as the reports above.       |
//+------------------------------------------------------------------+
#property copyright "FXPARTNER"
#property version   "1.30"
#property strict

//--- inputs
input string InpSiteUrl             = "https://fxpartner.global"; // Site base URL
input string InpApiSecret           = "";                          // TRADE_SIGNAL_SECRET (must match the site's env var)
input long   InpMagicFilter         = 0;                           // 0 = report every position on this account, else only this magic number
input long   InpMagicExclude        = 990300;                      // Skip positions with this magic - they publish themselves (FXPARTNER_SignalEngineEA's default magic). 0 = exclude nothing
input int    InpSlTpMaxRetries      = 6;                           // retries while waiting for SL/TP to populate after open
input int    InpSlTpRetryDelayMs    = 500;                         // delay between retries (retries * delay ~= 3s, matches the site's own assumption)
input int    InpWebRequestTimeoutMs = 5000;                        // WebRequest timeout (ms)
input bool   InpReportPending       = true;                        // Bekleyen emir kurulunca siteye bildir (ve iptal edilirse iptali de bildir)
input int    InpQuotePushSeconds    = 15;                          // Sitedeki "SU AN" fiyati icin acik pozisyonlarin bid/ask gonderme araligi (sn). 0 = kapali
input double InpConfidence          = 0;                           // optional confidence 0-100 to include on the open card, 0 = omit

//--- module-level (post-init) config
string g_siteUrl;
string g_encodedSecret;
datetime g_lastQuotePush = 0;

//--- locally tracked open positions, so the close report can reuse the
//    exact entry price/direction the open card used (and so an EA
//    restart mid-trade degrades gracefully to a best-effort standalone
//    result card instead of erroring out)
ulong  g_posTicket[];
string g_posPair[];
double g_posEntry[];
string g_posDirection[];

//+------------------------------------------------------------------+
int OnInit()
  {
   g_siteUrl = InpSiteUrl;
   int len = StringLen(g_siteUrl);
   if(len > 0 && StringGetCharacter(g_siteUrl, len - 1) == '/')
      g_siteUrl = StringSubstr(g_siteUrl, 0, len - 1);

   g_encodedSecret = UrlEncode(InpApiSecret);
   if(InpApiSecret == "")
      Print("FXPARTNER: InpApiSecret is empty - every request will be rejected with 401 until you set it.");

   ArrayResize(g_posTicket, 0);
   ArrayResize(g_posPair, 0);
   ArrayResize(g_posEntry, 0);
   ArrayResize(g_posDirection, 0);

   // This EA was purely event driven. The quote push needs a heartbeat, so
   // a timer is started here; OnTimer does nothing else.
   if(InpQuotePushSeconds > 0)
      EventSetTimer(5);

   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason)
  {
   EventKillTimer();
  }

//+------------------------------------------------------------------+
//| Tiny helpers                                                     |
//+------------------------------------------------------------------+
string UrlEncode(string s)
  {
   string result = "";
   int len = StringLen(s);
   for(int i = 0; i < len; i++)
     {
      ushort c = StringGetCharacter(s, i);
      if((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
         c == '-' || c == '_' || c == '.' || c == '~')
         result += CharToString((uchar)c);
      else
         result += StringFormat("%%%02X", c);
     }
   return result;
  }

string FormatPrice(string symbol, double price)
  {
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   return DoubleToString(price, digits);
  }

double PipSize(string symbol)
  {
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
   return (digits == 3 || digits == 5) ? point * 10.0 : point;
  }

// "Pips" is a currency-pair convention (the digits==3/5 rule in PipSize
// above only means something for those). Applying it to gold, oil, or
// index CFDs produces a meaningless huge number instead of a real pip
// count - e.g. a $27.38 gold move became "-2738.0 pips" because gold's
// 2-digit quote made PipSize() return 0.01 as if it were a pip. Only
// report pips for actual forex symbols; everything else falls back to
// the $ profit figure the site already displays when pips is absent.
bool IsForexSymbol(string symbol)
  {
   ENUM_SYMBOL_CALC_MODE mode = (ENUM_SYMBOL_CALC_MODE)SymbolInfoInteger(symbol, SYMBOL_TRADE_CALC_MODE);
   return mode == SYMBOL_CALC_MODE_FOREX || mode == SYMBOL_CALC_MODE_FOREX_NO_LEVERAGE;
  }

//--- GET request, returns HTTP status (or -1 on failure - check the log for GetLastError())
int HttpGet(string url)
  {
   char   data[];
   char   result[];
   string result_headers;

   ResetLastError();
   int status = WebRequest("GET", url, "", InpWebRequestTimeoutMs, data, result, result_headers);

   if(status == -1)
     {
      int err = GetLastError();
      PrintFormat("FXPARTNER: WebRequest failed (error %d). Make sure %s is added under Tools > Options > "
                  "Expert Advisors > 'Allow WebRequest for listed URL'.", err, g_siteUrl);
     }
   else if(status != 200)
     {
      PrintFormat("FXPARTNER: request returned HTTP %d: %s", status, CharArrayToString(result));
     }
   return status;
  }

//+------------------------------------------------------------------+
//| Tracked-position bookkeeping                                     |
//+------------------------------------------------------------------+
int FindTrackedIndex(ulong ticket)
  {
   for(int i = 0; i < ArraySize(g_posTicket); i++)
      if(g_posTicket[i] == ticket)
         return i;
   return -1;
  }

void TrackPosition(ulong ticket, string pair, double entry, string direction)
  {
   int idx = FindTrackedIndex(ticket);
   if(idx >= 0)
     {
      g_posPair[idx]      = pair;
      g_posEntry[idx]     = entry;
      g_posDirection[idx] = direction;
      return;
     }
   int n = ArraySize(g_posTicket);
   ArrayResize(g_posTicket, n + 1);
   ArrayResize(g_posPair, n + 1);
   ArrayResize(g_posEntry, n + 1);
   ArrayResize(g_posDirection, n + 1);
   g_posTicket[n]      = ticket;
   g_posPair[n]         = pair;
   g_posEntry[n]        = entry;
   g_posDirection[n]    = direction;
  }

void UntrackPosition(ulong ticket)
  {
   int idx = FindTrackedIndex(ticket);
   if(idx < 0)
      return;
   int last = ArraySize(g_posTicket) - 1;
   g_posTicket[idx]      = g_posTicket[last];
   g_posPair[idx]        = g_posPair[last];
   g_posEntry[idx]       = g_posEntry[last];
   g_posDirection[idx]   = g_posDirection[last];
   ArrayResize(g_posTicket, last);
   ArrayResize(g_posPair, last);
   ArrayResize(g_posEntry, last);
   ArrayResize(g_posDirection, last);
  }

//+------------------------------------------------------------------+
//| Position total P/L (price P/L + swap + commission) across every  |
//| deal booked against it, so a partially-closed-then-fully-closed  |
//| trade reports one accurate total instead of just the last fill.  |
//+------------------------------------------------------------------+
// Sums every deal belonging to the position: profit, swap and commission.
//
// HistorySelect over the widest possible window comes first, and it is not
// belt-and-braces. HistorySelectByPosition searches the history the terminal
// currently has cached, and OnTradeTransaction has just called
// HistoryDealSelect on a single deal - so on a position that filled or closed
// in several parts, the by-position query could come back holding only the
// last one. A 39-lot MODERNA short closed for 12,361.80 and was published as
// 950.80: exactly the 3 lots of its final fill. The site under-reported its
// own result by eleven thousand dollars and nothing anywhere said so.
//
// The volume check exists for the same reason. If the deals we summed do not
// account for the whole position, the number is wrong and the Journal has to
// say it out loud rather than let a quiet, plausible figure go out.
double PositionTotalProfit(ulong positionId)
  {
   double total = 0;

   HistorySelect(0, TimeCurrent() + 86400);
   if(!HistorySelectByPosition(positionId))
     {
      PrintFormat("FXPARTNER: no history found for position %I64u - profit reported as 0.", positionId);
      return total;
     }

   double volIn = 0, volOut = 0;
   int deals = HistoryDealsTotal();
   for(int i = 0; i < deals; i++)
     {
      ulong dealTicket = HistoryDealGetTicket(i);
      if(dealTicket == 0)
         continue;

      total += HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
      total += HistoryDealGetDouble(dealTicket, DEAL_SWAP);
      total += HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);

      ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
      double vol = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
      if(entry == DEAL_ENTRY_IN)
         volIn += vol;
      else if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_OUT_BY)
         volOut += vol;
     }

   // A closed position must have gone out with everything it came in with.
   if(volIn <= 0.0 || MathAbs(volIn - volOut) > 0.0000001)
      PrintFormat("FXPARTNER: position %I64u history looks incomplete - %d deal(s), in %.2f lots vs out %.2f lots. Reported profit %.2f may be understated.",
                  positionId, deals, volIn, volOut, total);

   return total;
  }

//+------------------------------------------------------------------+
//| Live quotes for the site's "SU AN" column                        |
//+------------------------------------------------------------------+

// WebRequest wants the body as bytes. StringToCharArray appends a
// terminating zero; sending it makes the body invalid JSON, so the array is
// shortened by one before it goes out.
int HttpPostJson(string url, string body)
  {
   char   data[];
   char   result[];
   string result_headers;

   int len = StringToCharArray(body, data, 0, WHOLE_ARRAY, CP_UTF8);
   if(len > 0)
      ArrayResize(data, len - 1);

   ResetLastError();
   int status = WebRequest("POST", url, "Content-Type: application/json\r\n", InpWebRequestTimeoutMs, data, result, result_headers);
   if(status == -1)
      PrintFormat("FXPARTNER: quote WebRequest failed (error %d). Add %s under Tools > Options > Expert Advisors > 'Allow WebRequest for listed URL'.", GetLastError(), g_siteUrl);
   else if(status != 200)
      PrintFormat("FXPARTNER: quote push returned HTTP %d: %s", status, CharArrayToString(result));
   return status;
  }

string JsonEscape(string value)
  {
   string out = value;
   StringReplace(out, "\\", "\\\\");
   StringReplace(out, "\"", "\\\"");
   return out;
  }

// Pushes bid/ask for every symbol that currently has an open position, so
// the site can show a live price beside each open signal.
//
// Only open positions, because those are exactly the signals the site is
// showing. The symbol is sent raw - PositionGetString(POSITION_SYMBOL) - the
// same string ReportOpen sends as `pair`, so a quote and a signal match on
// plain equality and the site needs no symbol map of its own.
//
// The same magic filter as ReportOpen: quoting an instrument this EA is not
// allowed to report would put a price under a signal it never published.
void ReportQuotes()
  {
   if(InpQuotePushSeconds <= 0 || InpApiSecret == "")
      return;
   if(TimeCurrent() - g_lastQuotePush < InpQuotePushSeconds)
      return;
   g_lastQuotePush = TimeCurrent();

   string seen[];
   string items = "";

   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !PositionSelectByTicket(ticket))
         continue;

      if(InpMagicFilter != 0 && (long)PositionGetInteger(POSITION_MAGIC) != InpMagicFilter)
         continue;
      if(InpMagicExclude != 0 && (long)PositionGetInteger(POSITION_MAGIC) == InpMagicExclude)
         continue;

      string symbol = PositionGetString(POSITION_SYMBOL);

      // Two positions on one instrument are one quote.
      bool dup = false;
      for(int k = 0; k < ArraySize(seen); k++)
         if(seen[k] == symbol) { dup = true; break; }
      if(dup)
         continue;

      double bid = SymbolInfoDouble(symbol, SYMBOL_BID);
      double ask = SymbolInfoDouble(symbol, SYMBOL_ASK);
      // A closed market reports zero rather than a stale tick. Sending it
      // would print 0.00000 under a signal, so it is simply not sent - the
      // site draws a dash for anything it has no fresh quote for.
      if(bid <= 0.0 || ask <= 0.0)
         continue;

      int n = ArraySize(seen);
      ArrayResize(seen, n + 1);
      seen[n] = symbol;

      if(items != "")
         items += ",";
      items += "{\"symbol\":\"" + JsonEscape(symbol) + "\""
             + ",\"bid\":\"" + FormatPrice(symbol, bid) + "\""
             + ",\"ask\":\"" + FormatPrice(symbol, ask) + "\"}";
     }

   if(items == "")
      return;

   HttpPostJson(g_siteUrl + "/api/live-prices?key=" + g_encodedSecret,
                "{\"quotes\":[" + items + "]}");
  }

void OnTimer()
  {
   ReportQuotes();
  }

//+------------------------------------------------------------------+
//| Pending orders                                                   |
//+------------------------------------------------------------------+

// Only the six pending types. TRADE_TRANSACTION_ORDER_ADD also fires for a
// market order on its way to becoming a deal; that one is already reported
// as a position by ReportOpen, and announcing it here as well would post
// every trade twice.
string PendingTypeName(ENUM_ORDER_TYPE t)
  {
   switch(t)
     {
      case ORDER_TYPE_BUY_LIMIT:       return "BUY_LIMIT";
      case ORDER_TYPE_SELL_LIMIT:      return "SELL_LIMIT";
      case ORDER_TYPE_BUY_STOP:        return "BUY_STOP";
      case ORDER_TYPE_SELL_STOP:       return "SELL_STOP";
      case ORDER_TYPE_BUY_STOP_LIMIT:  return "BUY_STOP_LIMIT";
      case ORDER_TYPE_SELL_STOP_LIMIT: return "SELL_STOP_LIMIT";
      default: break;
     }
   return "";
  }

// A pending order has just been placed. This is the announcement worth
// having: telling the channel a buy limit is sitting at 1.3600 lets a
// reader put the same order in and be filled where we are. Reporting the
// trade only after it fills tells them about a price they can no longer get.
void ReportPendingPlaced(ulong orderTicket)
  {
   if(!InpReportPending || InpApiSecret == "")
      return;
   if(!OrderSelect(orderTicket))
      return;

   long magic = OrderGetInteger(ORDER_MAGIC);
   if(InpMagicFilter != 0 && magic != InpMagicFilter)
      return;
   if(InpMagicExclude != 0 && magic == InpMagicExclude)
      return;

   string typeName = PendingTypeName((ENUM_ORDER_TYPE)OrderGetInteger(ORDER_TYPE));
   if(typeName == "")
      return;

   string symbol = OrderGetString(ORDER_SYMBOL);
   double price  = OrderGetDouble(ORDER_PRICE_OPEN);
   double sl     = OrderGetDouble(ORDER_SL);
   double tp     = OrderGetDouble(ORDER_TP);
   double vol    = OrderGetDouble(ORDER_VOLUME_INITIAL);

   string url = g_siteUrl + "/api/pending-order"
      + "?key=" + g_encodedSecret
      + "&action=placed"
      + "&ticket=" + IntegerToString((long)orderTicket)
      + "&pair=" + UrlEncode(symbol)
      + "&type=" + typeName
      + "&price=" + FormatPrice(symbol, price)
      + "&volume=" + DoubleToString(vol, 2);
   if(sl > 0)
      url += "&stop=" + FormatPrice(symbol, sl);
   if(tp > 0)
      url += "&target1=" + FormatPrice(symbol, tp);

   HttpGet(url);
  }

// The order left the book. Either the market reached it, or it was pulled.
//
// Both have to be reported, and the second is the one that matters: an
// order announced and then cancelled leaves the channel holding a signal
// that never happened. The site says nothing is quietly removed, so a
// cancellation gets said out loud. A fill is reported here only to close
// the record  the position itself is announced by ReportOpen.
void ReportPendingResolved(ulong orderTicket)
  {
   if(!InpReportPending || InpApiSecret == "")
      return;
   if(!HistoryOrderSelect(orderTicket))
      return;

   ENUM_ORDER_STATE state = (ENUM_ORDER_STATE)HistoryOrderGetInteger(orderTicket, ORDER_STATE);
   string action = "";
   if(state == ORDER_STATE_FILLED)
      action = "filled";
   else if(state == ORDER_STATE_CANCELED || state == ORDER_STATE_EXPIRED)
      action = "cancelled";
   else
      return;

   HttpGet(g_siteUrl + "/api/pending-order"
           + "?key=" + g_encodedSecret
           + "&action=" + action
           + "&ticket=" + IntegerToString((long)orderTicket));
  }
//+------------------------------------------------------------------+
//| Open report                                                      |
//+------------------------------------------------------------------+
void ReportOpen(ulong positionTicket)
  {
   if(!PositionSelectByTicket(positionTicket))
      return; // closed again before we got to it

   if(InpMagicFilter != 0 && (long)PositionGetInteger(POSITION_MAGIC) != InpMagicFilter)
      return;

   // FXPARTNER_SignalEngineEA reports its own trades with a real confidence
   // score and a TP2 this EA has no way to know about. Without this guard the
   // two publish the same trade and the channel posts it twice - the DB is
   // protected by a unique ticket, the Telegram/X post is not.
   if(InpMagicExclude != 0 && (long)PositionGetInteger(POSITION_MAGIC) == InpMagicExclude)
      return;

   string symbol    = PositionGetString(POSITION_SYMBOL);
   double entry      = PositionGetDouble(POSITION_PRICE_OPEN);
   double volume     = PositionGetDouble(POSITION_VOLUME);
   long   posType    = PositionGetInteger(POSITION_TYPE);
   string direction  = (posType == POSITION_TYPE_SELL) ? "SELL" : "BUY";

   // SL/TP can read as 0 for a moment right after a market order fills -
   // retry briefly rather than posting a card that wrongly shows "no stop
   // loss". The site's own card renderer treats 0/missing the same way,
   // so if it's still 0 after these retries we simply omit it, same as
   // if the trade genuinely has no stop.
   double sl = PositionGetDouble(POSITION_SL);
   double tp = PositionGetDouble(POSITION_TP);
   int retries = 0;
   while((sl <= 0 || tp <= 0) && retries < InpSlTpMaxRetries)
     {
      Sleep(InpSlTpRetryDelayMs);
      if(!PositionSelectByTicket(positionTicket))
         return; // closed during the wait
      sl = PositionGetDouble(POSITION_SL);
      tp = PositionGetDouble(POSITION_TP);
      retries++;
     }

   string url = g_siteUrl + "/api/trade-signal"
      + "?key=" + g_encodedSecret
      + "&pair=" + symbol
      + "&entry=" + FormatPrice(symbol, entry)
      + "&stop=" + FormatPrice(symbol, sl)
      + "&direction=" + direction
      + "&volume=" + DoubleToString(volume, 2)
      + "&ticket=" + IntegerToString((long)positionTicket);
   if(tp > 0)
      url += "&target1=" + FormatPrice(symbol, tp);
   if(InpConfidence > 0)
      url += "&confidence=" + DoubleToString(InpConfidence, 0);

   int status = HttpGet(url);
   if(status == 200)
      TrackPosition(positionTicket, symbol, entry, direction);
  }

//+------------------------------------------------------------------+
//| Close report                                                     |
//+------------------------------------------------------------------+
void ReportClose(ulong positionTicket, ulong closingDeal)
  {
   if(InpMagicFilter != 0 && HistoryDealGetInteger(closingDeal, DEAL_MAGIC) != InpMagicFilter)
      return;
   if(InpMagicExclude != 0 && HistoryDealGetInteger(closingDeal, DEAL_MAGIC) == InpMagicExclude)
      return;

   string symbol     = HistoryDealGetString(closingDeal, DEAL_SYMBOL);
   double closePrice = HistoryDealGetDouble(closingDeal, DEAL_PRICE);

   int    idx = FindTrackedIndex(positionTicket);
   double entry;
   string direction;

   if(idx >= 0)
     {
      entry     = g_posEntry[idx];
      direction = g_posDirection[idx];
     }
   else
     {
      // EA restarted mid-trade, or the open report never went out - fall
      // back to reconstructing from deal history so a result card still
      // goes out (it just can't be threaded under an original post).
      direction = (HistoryDealGetInteger(closingDeal, DEAL_TYPE) == DEAL_TYPE_SELL) ? "BUY" : "SELL";
      entry = 0;
      if(HistorySelectByPosition(positionTicket))
        {
         int deals = HistoryDealsTotal();
         for(int i = 0; i < deals; i++)
           {
            ulong d = HistoryDealGetTicket(i);
            if((ENUM_DEAL_ENTRY)HistoryDealGetInteger(d, DEAL_ENTRY) == DEAL_ENTRY_IN)
              {
               entry = HistoryDealGetDouble(d, DEAL_PRICE);
               break;
              }
           }
        }
     }

   double totalProfit = PositionTotalProfit(positionTicket);
   double pips = 0;
   bool havePips = (entry > 0) && IsForexSymbol(symbol);
   if(havePips)
     {
      double diff = (closePrice - entry) / PipSize(symbol);
      pips = (direction == "SELL") ? -diff : diff;
     }

   string url = g_siteUrl + "/api/trade-result"
      + "?key=" + g_encodedSecret
      + "&ticket=" + IntegerToString((long)positionTicket)
      + "&close=" + FormatPrice(symbol, closePrice)
      + "&profit=" + DoubleToString(totalProfit, 2);
   if(havePips)
      url += "&pips=" + DoubleToString(pips, 1);
   if(idx < 0)
     {
      // No tracked open record on this EA instance - send the fallback
      // fields the route accepts so it can still build a standalone card.
      url += "&pair=" + symbol + "&direction=" + direction;
      if(havePips)
         url += "&entry=" + FormatPrice(symbol, entry);
     }

   int status = HttpGet(url);
   if(status == 200 && idx >= 0)
      UntrackPosition(positionTicket);
  }

//+------------------------------------------------------------------+
//| Fires on every deal booked to this account                       |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                         const MqlTradeRequest &request,
                         const MqlTradeResult &result)
  {
   // Pending orders first: these arrive as ORDER_ADD / ORDER_DELETE and
   // never as a deal, so the DEAL_ADD gate below would drop them.
   if(trans.type == TRADE_TRANSACTION_ORDER_ADD)
     {
      ReportPendingPlaced(trans.order);
      return;
     }
   if(trans.type == TRADE_TRANSACTION_ORDER_DELETE)
     {
      ReportPendingResolved(trans.order);
      return;
     }

   if(trans.type != TRADE_TRANSACTION_DEAL_ADD)
      return;

   if(!HistoryDealSelect(trans.deal))
      return;

   // Ignore non-trading deals (balance ops, credit, etc.) - they have no
   // real position behind them.
   ENUM_DEAL_TYPE dealType = (ENUM_DEAL_TYPE)HistoryDealGetInteger(trans.deal, DEAL_TYPE);
   if(dealType != DEAL_TYPE_BUY && dealType != DEAL_TYPE_SELL)
      return;

   ulong positionId = (ulong)HistoryDealGetInteger(trans.deal, DEAL_POSITION_ID);
   ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(trans.deal, DEAL_ENTRY);

   if(entry == DEAL_ENTRY_IN)
     {
      // Only the deal that actually opens the position - if it's already
      // tracked, this deal is volume being added to an existing position.
      if(FindTrackedIndex(positionId) >= 0)
         return;
      ReportOpen(positionId);
     }
   else if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_OUT_BY)
     {
      // Only report once the position is actually gone - a partial close
      // leaves it open, and we don't want a result card per fill.
      if(PositionSelectByTicket(positionId))
         return;
      ReportClose(positionId, trans.deal);
     }
  }
//+------------------------------------------------------------------+
