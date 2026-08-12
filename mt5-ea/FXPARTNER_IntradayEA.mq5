//+------------------------------------------------------------------+
//|                                        FXPARTNER_IntradayEA.mq5   |
//|  Intraday trend-pullback EA for majors + XAUUSD.                 |
//|                                                                    |
//|  IMPORTANT - READ BEFORE USE:                                    |
//|  No trading system is "flawless" or profit-guaranteed. This EA   |
//|  is a starting framework with real risk controls (ATR-based      |
//|  stops, % risk sizing, a daily loss circuit breaker, a spread    |
//|  filter, and a high-impact-news filter) - not a promise of       |
//|  profit. Backtest it over multiple market regimes, then run it   |
//|  on a DEMO account for weeks before ever considering real money. |
//|  Past/simulated results never guarantee future ones. You are     |
//|  solely responsible for any losses.                              |
//|                                                                    |
//|  STRATEGY (simple and testable on purpose - tune, don't          |
//|  over-optimize):                                                 |
//|  - Trend filter:  price vs EMA(TrendPeriod) on the working TF.   |
//|  - Entry trigger: RSI pulls back into an oversold/overbought     |
//|    zone WITH the trend, then turns back the trend's direction    |
//|    (a pullback-continuation entry, not a countertrend fade).     |
//|  - Stop loss / take profit: ATR-multiple based, so they scale    |
//|    with each symbol's real volatility instead of a fixed pip     |
//|    count that means something different on EURUSD vs XAUUSD.     |
//|  - Position size: computed from % account risk and the ATR stop  |
//|    distance, via the symbol's real tick value - not a fixed lot. |
//|  - Fundamental filter: skips new entries within a configurable   |
//|    window of a HIGH-importance economic-calendar event for       |
//|    either currency in the traded symbol (uses MQL5's built-in    |
//|    Economic Calendar - no external news feed needed).            |
//|  - One position per symbol/magic at a time. Optional daily loss  |
//|    circuit breaker halts new entries for the rest of the day.    |
//|                                                                    |
//|  SETUP:                                                          |
//|  Attach to ONE chart per symbol you want to trade (e.g. one      |
//|  EURUSD chart, one XAUUSD chart, etc.) - this EA only manages    |
//|  the symbol of the chart it's attached to. Recommended working   |
//|  timeframe: M15 (set Period() by opening the EA on an M15        |
//|  chart), which the "intraday, short-interval" style implies.     |
//+------------------------------------------------------------------+
#property copyright "FXPARTNER"
#property version   "1.00"
#property strict

#include <Trade\Trade.mqh>

//--- inputs: identity / risk
input long   InpMagic               = 990001;  // Magic number (unique per chart if running on multiple symbols)
input double InpRiskPercent         = 1.0;     // Risk per trade, % of account balance
input double InpMaxDailyLossPercent = 3.0;     // Daily circuit breaker: stop opening new trades after this much realized loss today (% of day-start balance). 0 = disabled
input int    InpMaxSpreadPoints     = 30;      // Skip entries if current spread exceeds this (points, not pips)
input int    InpMagicOnly           = 1;       // 1 = only manage positions with InpMagic on this symbol; 0 = also count any position on this symbol toward the one-at-a-time rule

//--- inputs: trend / entry
input int    InpTrendEmaPeriod      = 200;     // EMA period defining the intraday trend direction
input int    InpRsiPeriod           = 14;      // RSI period
input double InpRsiOversold         = 35;      // RSI pullback zone (uptrend BUY trigger below this)
input double InpRsiOverbought       = 65;      // RSI pullback zone (downtrend SELL trigger above this)

//--- inputs: stops / targets (ATR-based, so they scale per symbol)
input int    InpAtrPeriod           = 14;      // ATR period
input double InpAtrSlMultiple       = 1.5;     // Stop loss = InpAtrSlMultiple * ATR from entry
input double InpAtrTpMultiple       = 2.25;    // Take profit = InpAtrTpMultiple * ATR from entry (default gives a 1:1.5 reward:risk)

//--- inputs: fundamental filter (MQL5's built-in Economic Calendar)
input bool   InpNewsFilterEnabled   = true;    // Skip new entries near high-impact news for this symbol's currencies
input int    InpNewsMinutesBefore   = 30;      // Don't open a new trade if a high-impact event is due within this many minutes
input int    InpNewsMinutesAfter    = 15;      // ...or happened this many minutes ago (let the initial volatility spike pass)

//--- inputs: session filter (broker/server time, 0-23)
input bool   InpSessionFilterEnabled = true;   // Restrict entries to a trading session window
input int    InpSessionStartHour     = 8;      // Server-time hour entries are allowed from (inclusive)
input int    InpSessionEndHour       = 20;     // Server-time hour entries are allowed until (exclusive)

CTrade trade;

int    g_handleEmaTrend = INVALID_HANDLE;
int    g_handleRsi      = INVALID_HANDLE;
int    g_handleAtr      = INVALID_HANDLE;

datetime g_lastBarTime   = 0;
double   g_dayStartBalance = 0;
int      g_dayStartDate    = -1;

//+------------------------------------------------------------------+
int OnInit()
  {
   if(InpRiskPercent <= 0 || InpRiskPercent > 10)
     {
      Print("FXPARTNER EA: InpRiskPercent looks unsafe (must be >0 and <=10). EA will not trade.");
      return(INIT_PARAMETERS_INCORRECT);
     }

   g_handleEmaTrend = iMA(_Symbol, PERIOD_CURRENT, InpTrendEmaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   g_handleRsi      = iRSI(_Symbol, PERIOD_CURRENT, InpRsiPeriod, PRICE_CLOSE);
   g_handleAtr      = iATR(_Symbol, PERIOD_CURRENT, InpAtrPeriod);

   if(g_handleEmaTrend == INVALID_HANDLE || g_handleRsi == INVALID_HANDLE || g_handleAtr == INVALID_HANDLE)
     {
      Print("FXPARTNER EA: failed to create one or more indicator handles.");
      return(INIT_FAILED);
     }

   trade.SetExpertMagicNumber(InpMagic);
   ResetDailyCounterIfNeeded();

   PrintFormat("FXPARTNER EA initialized on %s %s. Not a guaranteed-profit system - test on demo first.",
               _Symbol, EnumToString((ENUM_TIMEFRAMES)Period()));
   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason)
  {
   if(g_handleEmaTrend != INVALID_HANDLE) IndicatorRelease(g_handleEmaTrend);
   if(g_handleRsi != INVALID_HANDLE)      IndicatorRelease(g_handleRsi);
   if(g_handleAtr != INVALID_HANDLE)      IndicatorRelease(g_handleAtr);
  }

//+------------------------------------------------------------------+
//| Daily circuit breaker bookkeeping                                 |
//+------------------------------------------------------------------+
void ResetDailyCounterIfNeeded()
  {
   MqlDateTime now;
   TimeToStruct(TimeCurrent(), now);
   int today = now.year * 10000 + now.mon * 100 + now.day;
   if(today != g_dayStartDate)
     {
      g_dayStartDate    = today;
      g_dayStartBalance = AccountInfoDouble(ACCOUNT_BALANCE);
     }
  }

bool DailyLossLimitHit()
  {
   if(InpMaxDailyLossPercent <= 0)
      return false;
   ResetDailyCounterIfNeeded();
   if(g_dayStartBalance <= 0)
      return false;
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double lossPercent = (g_dayStartBalance - equity) / g_dayStartBalance * 100.0;
   return lossPercent >= InpMaxDailyLossPercent;
  }

//+------------------------------------------------------------------+
//| Position helpers - one position per symbol (optionally per magic) |
//+------------------------------------------------------------------+
bool HasOpenPosition()
  {
   if(!PositionSelect(_Symbol))
      return false;
   if(InpMagicOnly == 1 && (long)PositionGetInteger(POSITION_MAGIC) != InpMagic)
      return false; // a position exists but it's not ours - don't touch it, don't count it either way here
   return true;
  }

//+------------------------------------------------------------------+
//| Spread filter                                                     |
//+------------------------------------------------------------------+
bool SpreadTooWide()
  {
   long spreadPoints = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
   return spreadPoints > InpMaxSpreadPoints;
  }

//+------------------------------------------------------------------+
//| Session filter (server time)                                      |
//+------------------------------------------------------------------+
bool WithinSession()
  {
   if(!InpSessionFilterEnabled)
      return true;
   MqlDateTime t;
   TimeToStruct(TimeCurrent(), t);
   if(InpSessionStartHour <= InpSessionEndHour)
      return t.hour >= InpSessionStartHour && t.hour < InpSessionEndHour;
   // Wrap-around session (e.g. 22 -> 6)
   return t.hour >= InpSessionStartHour || t.hour < InpSessionEndHour;
  }

//+------------------------------------------------------------------+
//| Fundamental filter - MQL5's built-in Economic Calendar             |
//+------------------------------------------------------------------+
bool HasHighImpactNewsNearby(string currency)
  {
   if(currency == "" )
      return false;
   datetime now  = TimeCurrent();
   datetime from = now - InpNewsMinutesAfter * 60;
   datetime to   = now + InpNewsMinutesBefore * 60;

   MqlCalendarValue values[];
   int total = CalendarValueHistory(values, from, to, NULL, currency);
   if(total <= 0)
      return false;

   for(int i = 0; i < total; i++)
     {
      MqlCalendarEvent ev;
      if(!CalendarEventById(values[i].event_id, ev))
         continue;
      if(ev.importance == CALENDAR_IMPORTANCE_HIGH)
         return true;
     }
   return false;
  }

bool NewsBlocksEntry()
  {
   if(!InpNewsFilterEnabled)
      return false;
   string baseCcy  = SymbolInfoString(_Symbol, SYMBOL_CURRENCY_BASE);
   string quoteCcy = SymbolInfoString(_Symbol, SYMBOL_CURRENCY_PROFIT);
   if(HasHighImpactNewsNearby(baseCcy))
      return true;
   if(quoteCcy != baseCcy && HasHighImpactNewsNearby(quoteCcy))
      return true;
   return false;
  }

//+------------------------------------------------------------------+
//| Position sizing from % risk and the real ATR-based stop distance  |
//+------------------------------------------------------------------+
double CalcLotFromRisk(double slDistancePrice)
  {
   double balance    = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskMoney  = balance * (InpRiskPercent / 100.0);

   double tickSize  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double tickValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   if(tickSize <= 0 || tickValue <= 0 || slDistancePrice <= 0)
      return 0;

   double lossPerLot = (slDistancePrice / tickSize) * tickValue;
   if(lossPerLot <= 0)
      return 0;

   double lots = riskMoney / lossPerLot;

   double minLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   if(lotStep > 0)
      lots = MathFloor(lots / lotStep) * lotStep;
   lots = MathMax(minLot, MathMin(maxLot, lots));

   return lots;
  }

//+------------------------------------------------------------------+
//| New-bar guard - evaluate signals once per closed bar, not every   |
//| tick, so the strategy trades on confirmed bar data.               |
//+------------------------------------------------------------------+
bool IsNewBar()
  {
   datetime barTime = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(barTime == g_lastBarTime)
      return false;
   g_lastBarTime = barTime;
   return true;
  }

//+------------------------------------------------------------------+
//| Main tick handler                                                  |
//+------------------------------------------------------------------+
void OnTick()
  {
   if(!IsNewBar())
      return;

   ResetDailyCounterIfNeeded();

   if(HasOpenPosition())
      return; // one position per symbol at a time - let it play out to its SL/TP

   if(DailyLossLimitHit())
      return; // circuit breaker: no new entries for the rest of the day

   if(SpreadTooWide())
      return;

   if(!WithinSession())
      return;

   if(NewsBlocksEntry())
      return;

   double emaTrend[], rsi[], atr[];
   ArraySetAsSeries(emaTrend, true);
   ArraySetAsSeries(rsi, true);
   ArraySetAsSeries(atr, true);

   // Need a couple of closed bars of history to detect the RSI turning
   // back in the trend's direction, so copy 3 values (index 1 = last
   // closed bar, index 2 = the one before it; index 0 = forming bar,
   // deliberately unused so we only act on confirmed closes).
   if(CopyBuffer(g_handleEmaTrend, 0, 1, 1, emaTrend) < 1)
      return;
   if(CopyBuffer(g_handleRsi, 0, 1, 2, rsi) < 2)
      return;
   if(CopyBuffer(g_handleAtr, 0, 1, 1, atr) < 1)
      return;

   double lastClose = iClose(_Symbol, PERIOD_CURRENT, 1);
   double atrValue   = atr[0];
   if(atrValue <= 0)
      return;

   bool uptrend   = lastClose > emaTrend[0];
   bool downtrend = lastClose < emaTrend[0];

   // rsi[0] = last closed bar's RSI, rsi[1] = the bar before that.
   bool rsiTurningUp   = rsi[1] <= InpRsiOversold  && rsi[0] > rsi[1];
   bool rsiTurningDown = rsi[1] >= InpRsiOverbought && rsi[0] < rsi[1];

   double point = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
   double ask   = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid   = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   int    digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);

   if(uptrend && rsiTurningUp)
     {
      double sl = NormalizeDouble(ask - InpAtrSlMultiple * atrValue, digits);
      double tp = NormalizeDouble(ask + InpAtrTpMultiple * atrValue, digits);
      double slDistance = ask - sl;
      double lots = CalcLotFromRisk(slDistance);
      if(lots > 0)
         trade.Buy(lots, _Symbol, ask, sl, tp, "FXPARTNER EA trend pullback");
     }
   else if(downtrend && rsiTurningDown)
     {
      double sl = NormalizeDouble(bid + InpAtrSlMultiple * atrValue, digits);
      double tp = NormalizeDouble(bid - InpAtrTpMultiple * atrValue, digits);
      double slDistance = sl - bid;
      double lots = CalcLotFromRisk(slDistance);
      if(lots > 0)
         trade.Sell(lots, _Symbol, bid, sl, tp, "FXPARTNER EA trend pullback");
     }
  }
//+------------------------------------------------------------------+
