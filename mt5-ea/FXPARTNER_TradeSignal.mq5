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
//+------------------------------------------------------------------+
#property copyright "FXPARTNER"
#property version   "1.00"
#property strict

//--- inputs
input string InpSiteUrl             = "https://fxpartner.global"; // Site base URL
input string InpApiSecret           = "";                          // TRADE_SIGNAL_SECRET (must match the site's env var)
input long   InpMagicFilter         = 0;                           // 0 = report every position on this account, else only this magic number
input int    InpSlTpMaxRetries      = 6;                           // retries while waiting for SL/TP to populate after open
input int    InpSlTpRetryDelayMs    = 500;                         // delay between retries (retries * delay ~= 3s, matches the site's own assumption)
input int    InpWebRequestTimeoutMs = 5000;                        // WebRequest timeout (ms)
input double InpConfidence          = 0;                           // optional confidence 0-100 to include on the open card, 0 = omit

//--- module-level (post-init) config
string g_siteUrl;
string g_encodedSecret;

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

   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason)
  {
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
double PositionTotalProfit(ulong positionId)
  {
   double total = 0;
   if(!HistorySelectByPosition(positionId))
      return total;
   int deals = HistoryDealsTotal();
   for(int i = 0; i < deals; i++)
     {
      ulong dealTicket = HistoryDealGetTicket(i);
      total += HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
      total += HistoryDealGetDouble(dealTicket, DEAL_SWAP);
      total += HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
     }
   return total;
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
