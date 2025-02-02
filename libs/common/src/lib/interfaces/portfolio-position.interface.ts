import { MarketState } from '@ghostfolio/api/services/interfaces/interfaces';
import { Currency } from '@prisma/client';

export interface PortfolioPosition {
  accounts: {
    [name: string]: { current: number; original: number };
  };
  allocationCurrent: number;
  allocationInvestment: number;
  currency: Currency;
  exchange?: string;
  grossPerformance: number;
  grossPerformancePercent: number;
  industry?: string;
  investment: number;
  marketChange?: number;
  marketChangePercent?: number;
  marketPrice: number;
  marketState: MarketState;
  name: string;
  quantity: number;
  sector?: string;
  transactionCount: number;
  symbol: string;
  type?: string;
  url?: string;
}
