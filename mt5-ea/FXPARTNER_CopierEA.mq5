//+------------------------------------------------------------------+
//|                                          FXPARTNER_CopierEA.mq5   |
//|  Mirrors FXPARTNER's real tracked-account trades onto YOUR OWN   |
//|  MT5 account, automatically.                                     |
//|                                                                    |
//|  HOW IT WORKS:                                                   |
//|  This EA polls https://fxpartner.global/api/signals (the same    |
//|  public, read-only endpoint that powers the /signals page - no   |
//|  API key needed) every InpPollSeconds. For every currently ACTIVE|
//|  trade on FXPARTNER's tracked master account, it opens a matching|
//|  position on THIS account, sized as InpLotMultiplier times the   |
//|  master's reported lot size. When a master trade closes, this EA |
//|  closes the matching local position too (if InpCloseWithMaster). |
//|                                                                    |
//|  YOUR ACCOUNT IS ALWAYS YOURS. FXPARTNER never has access to it, |
//|  never touches your funds, and you can disable/remove this EA at |
//|  any moment to stop copying instantly. That's the entire point   |
//|  of copy-trading over discretionary account management.          |
//|                                                                    |
//|  IMPORTANT - READ BEFORE USE:                                    |
//|  Copying real trades means copying real losses too - the master  |
//|  account is a genuine trading account, not a simulation, and it  |
//|  loses money on plenty of individual trades even when profitable |
//|  overall. Past results never guarantee future ones. Only copy    |
//|  with capital you can afford to lose, start with a small         |
//|  InpLotMultiplier, and test on a DEMO account first. You remain  |
//|  fully responsible for every trade this EA places on your        |
//|  account - review FXPARTNER's own performance history on         |
//|  /signals before enabling this on a live account.                |
//|                                                                    |
//|  SETUP (required, one time):                                     |
//|  1) Tools > Options > Expert Advisors > tick "Allow WebRequest    |
//|     for listed URL" and add: https://fxpartner.global             |
//|  2) Attach this EA to ANY ONE chart (symbol/timeframe don't       |
//|     matter - it manages every symbol it sees in the signal feed, |
//|     independent of which chart it's running on).                 |
//|  3) If your broker names symbols differently (e.g. "EURUSDm"     |
//|     instead of "EURUSD"), set InpSymbolSuffix accordingly.        |
//+------------------------------------------------------------------+
#property copyright "FXPARTNER"
#property version   "1.00"
#property strict

#include <Trade\Trade.mqh>

//--- inputs
input string InpApiUrl            = "https://fxpartner.global/api/signals"; // Signal feed (public, read-only)
input long   InpMagic             = 990100;  // Magic number for copier-managed positions (never touches your other trades)
input double InpLotMultiplier     = 1.0;     // Your lot = master's reported lot * this. Start small (e.g. 0.1-0.5) until you trust it
input double InpMinLot            = 0.01;    // Floor applied after multiplying, so a tiny master lot doesn't round to zero
input double InpMaxLot            = 5.0;     // Safety cap - never open a single position larger than this regardless of multiplier
input string InpSymbolSuffix      = "";      // Appended to each pair name for brokers with suffixed symbols (e.g. "m", ".raw")
input int    InpPollSeconds       = 15;      // How often to check the feed (matches the site's own /signals page refresh rate)
input int    InpMaxSlippagePoints = 20;      // Max acceptable slippage on entry
input bool   InpCloseWithMaster   = true;    // Close a local position automatically once its master trade closes
input int    InpMaxOpenPositions  = 10;      // Safety cap on simultaneous copier-managed positions
input int    InpWebRequestTimeoutMs = 5000;  // WebRequest timeout (ms)

CTrade trade;

//+------------------------------------------------------------------+
//| Minimal, purpose-built JSON helpers                              |
//| (not a general-purpose parser - just enough for the fixed shape  |
//| of /api/signals' response, so this EA has zero external          |
//| dependencies to install.)                                        |
//+------------------------------------------------------------------+
bool JsonExtractArray(const string &json, const string key, string &result)
  {
   string pattern = "\"" + key + "\":[";
   int pos = StringFind(json, pattern);
   if(pos < 0)
      return false;
   int start = pos + StringLen(pattern) - 1; // index of '['
   int depth = 0;
   int len = StringLen(json);
   for(int i = start; i < len; i++)
     {
      ushort c = StringGetCharacter(json, i);
      if(c == '[')
         depth++;
      else if(c == ']')
        {
         depth--;
         if(depth == 0)
           {
            result = StringSubstr(json, start + 1, i - start - 1);
            return true;
           }
        }
     }
   return false;
  }

int JsonSplitObjects(const string &arrayContent, string &objects[])
  {
   int count = 0;
   int depth = 0;
   int start = -1;
   int len = StringLen(arrayContent);
   for(int i = 0; i < len; i++)
     {
      ushort c = StringGetCharacter(arrayContent, i);
      if(c == '{')
        {
         if(depth == 0)
            start = i;
         depth++;
        }
      else if(c == '}')
        {
         depth--;
         if(depth == 0 && start >= 0)
           {
            ArrayResize(objects, count + 1);
            objects[count] = StringSubstr(arrayContent, start, i - start + 1);
            count++;
            start = -1;
           }
        }
     }
   return count;
  }

// Returns "" for both a missing key and a JSON null - callers treat both
// as "no value", which is correct for every field this EA reads (stop/
// target1/target2/volume/direction can all legitimately be null).
string JsonGetString(const string &obj, const string key)
  {
   string pattern = "\"" + key + "\":";
   int pos = StringFind(obj, pattern);
   if(pos < 0)
      return "";
   pos += StringLen(pattern);
   int len = StringLen(obj);
   while(pos < len && StringGetCharacter(obj, pos) == ' ')
      pos++;
   if(pos >= len)
      return "";
   if(StringGetCharacter(obj, pos) != '"')
      return ""; // null, number, or malformed - this schema only ever has strings/null here
   pos++; // skip opening quote
   int endPos = pos;
   while(endPos < len)
     {
      ushort c = StringGetCharacter(obj, endPos);
      if(c == '\\')
        {
         endPos += 2;
         continue;
        }
      if(c == '"')
         break;
      endPos++;
     }
   return StringSubstr(obj, pos, endPos - pos);
  }

//+------------------------------------------------------------------+
int OnInit()
  {
   trade.SetExpertMagicNumber(InpMagic);
   EventSetTimer(MathMax(5, InpPollSeconds));
   PrintFormat("FXPARTNER Copier EA initialized. Polling %s every %d s. "
               "Copying real trades means copying real losses - test on demo first.",
               InpApiUrl, InpPollSeconds);
   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason)
  {
   EventKillTimer();
  }

void OnTick()
  {
  }

//+------------------------------------------------------------------+
//| Local position <-> master ticket bookkeeping via comment          |
//+------------------------------------------------------------------+
string CopierComment(string masterTicket)
  {
   return "FXP:" + masterTicket;
  }

bool FindLocalPositionByMasterTicket(string masterTicket, ulong &positionTicket)
  {
   string tag = CopierComment(masterTicket);
   int total = PositionsTotal();
   for(int i = 0; i < total; i++)
     {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket))
         continue;
      if((long)PositionGetInteger(POSITION_MAGIC) != InpMagic)
         continue;
      if(PositionGetString(POSITION_COMMENT) == tag)
        {
         positionTicket = ticket;
         return true;
        }
     }
   return false;
  }

int CountCopierPositions()
  {
   int count = 0;
   int total = PositionsTotal();
   for(int i = 0; i < total; i++)
     {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket))
         continue;
      if((long)PositionGetInteger(POSITION_MAGIC) == InpMagic)
         count++;
     }
   return count;
  }

//+------------------------------------------------------------------+
//| Open/close                                                        |
//+------------------------------------------------------------------+
double NormalizeLot(string symbol, double rawLot)
  {
   double lot = rawLot * InpLotMultiplier;
   if(lot < InpMinLot)
      lot = InpMinLot;
   if(lot > InpMaxLot)
      lot = InpMaxLot;

   double minLot  = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MIN);
   double maxLot  = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(symbol, SYMBOL_VOLUME_STEP);
   if(lotStep > 0)
      lot = MathRound(lot / lotStep) * lotStep;
   lot = MathMax(minLot, MathMin(maxLot, lot));
   return lot;
  }

void TryOpenCopy(string masterTicket, string pair, string direction, string stopStr, string target1Str, string volumeStr)
  {
   if(CountCopierPositions() >= InpMaxOpenPositions)
      return;

   ulong existing;
   if(FindLocalPositionByMasterTicket(masterTicket, existing))
      return; // already copied

   double masterVolume = (volumeStr == "") ? 0 : StringToDouble(volumeStr);
   if(masterVolume <= 0)
      return; // nothing to scale from - skip rather than guess a size

   string symbol = pair + InpSymbolSuffix;
   if(!SymbolSelect(symbol, true))
     {
      PrintFormat("FXPARTNER Copier: symbol %s not found on this broker (check InpSymbolSuffix). Skipping ticket %s.",
                  symbol, masterTicket);
      return;
     }

   double lot = NormalizeLot(symbol, masterVolume);
   if(lot <= 0)
      return;

   bool isBuy = (direction == "BUY");
   bool isSell = (direction == "SELL");
   if(!isBuy && !isSell)
      return; // direction missing/unknown - nothing safe to do

   double price = isBuy ? SymbolInfoDouble(symbol, SYMBOL_ASK) : SymbolInfoDouble(symbol, SYMBOL_BID);
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   double sl = (stopStr == "") ? 0 : NormalizeDouble(StringToDouble(stopStr), digits);
   double tp = (target1Str == "") ? 0 : NormalizeDouble(StringToDouble(target1Str), digits);

   trade.SetDeviationInPoints(InpMaxSlippagePoints);
   string comment = CopierComment(masterTicket);
   bool ok = isBuy
      ? trade.Buy(lot, symbol, price, sl, tp, comment)
      : trade.Sell(lot, symbol, price, sl, tp, comment);

   if(!ok)
      PrintFormat("FXPARTNER Copier: failed to copy ticket %s on %s (%s), retcode=%d",
                  masterTicket, symbol, direction, trade.ResultRetcode());
  }

void CloseIfOrphaned(string masterTicket)
  {
   if(!InpCloseWithMaster)
      return;
   ulong positionTicket;
   if(!FindLocalPositionByMasterTicket(masterTicket, positionTicket))
      return;
   trade.PositionClose(positionTicket);
  }

//+------------------------------------------------------------------+
//| Main sync                                                         |
//+------------------------------------------------------------------+
void SyncFromFeed()
  {
   char   data[];
   char   result[];
   string resultHeaders;

   ResetLastError();
   int status = WebRequest("GET", InpApiUrl, "", InpWebRequestTimeoutMs, data, result, resultHeaders);
   if(status == -1)
     {
      int err = GetLastError();
      PrintFormat("FXPARTNER Copier: WebRequest failed (error %d). Make sure %s is added under Tools > Options > "
                  "Expert Advisors > 'Allow WebRequest for listed URL'.", err, InpApiUrl);
      return;
     }
   if(status != 200)
     {
      PrintFormat("FXPARTNER Copier: feed returned HTTP %d", status);
      return;
     }

   string body = CharArrayToString(result);

   string activeContent;
   if(!JsonExtractArray(body, "active", activeContent))
     {
      Print("FXPARTNER Copier: could not find 'active' array in feed response.");
      return;
     }

   string objects[];
   int count = JsonSplitObjects(activeContent, objects);

   string activeTickets[];
   ArrayResize(activeTickets, count);

   for(int i = 0; i < count; i++)
     {
      string ticket    = JsonGetString(objects[i], "ticket");
      string pair      = JsonGetString(objects[i], "pair");
      string direction = JsonGetString(objects[i], "direction");
      string stopStr   = JsonGetString(objects[i], "stop");
      string t1Str      = JsonGetString(objects[i], "target1");
      string volumeStr = JsonGetString(objects[i], "volume");

      activeTickets[i] = ticket;
      if(ticket == "" || pair == "")
         continue;

      TryOpenCopy(ticket, pair, direction, stopStr, t1Str, volumeStr);
     }

   // Close any locally-copied position whose master ticket is no longer
   // in the active list (i.e. the master trade closed).
   int total = PositionsTotal();
   for(int i = total - 1; i >= 0; i--)
     {
      ulong posTicket = PositionGetTicket(i);
      if(!PositionSelectByTicket(posTicket))
         continue;
      if((long)PositionGetInteger(POSITION_MAGIC) != InpMagic)
         continue;

      string tag = PositionGetString(POSITION_COMMENT);
      if(StringFind(tag, "FXP:") != 0)
         continue;
      string masterTicket = StringSubstr(tag, 4);

      bool stillActive = false;
      for(int j = 0; j < count; j++)
        {
         if(activeTickets[j] == masterTicket)
           {
            stillActive = true;
            break;
           }
        }
      if(!stillActive)
         CloseIfOrphaned(masterTicket);
     }
  }

void OnTimer()
  {
   SyncFromFeed();
  }
//+------------------------------------------------------------------+
