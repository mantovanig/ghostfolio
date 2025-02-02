import { PortfolioPosition } from '@ghostfolio/common/interfaces';
import { ExchangeRateDataService } from 'apps/api/src/services/exchange-rate-data.service';

import { Rule } from '../../rule';

export class AccountClusterRiskInitialInvestment extends Rule {
  public constructor(public exchangeRateDataService: ExchangeRateDataService) {
    super(exchangeRateDataService, {
      name: 'Initial Investment'
    });
  }

  public evaluate(
    aPositions: { [symbol: string]: PortfolioPosition },
    aFees: number,
    aRuleSettingsMap?: {
      [key: string]: any;
    }
  ) {
    const ruleSettings =
      aRuleSettingsMap[AccountClusterRiskInitialInvestment.name];

    const platforms: {
      [symbol: string]: Pick<PortfolioPosition, 'name'> & {
        investment: number;
      };
    } = {};

    Object.values(aPositions).forEach((position) => {
      for (const [account, { original }] of Object.entries(position.accounts)) {
        if (platforms[account]?.investment) {
          platforms[account].investment += original;
        } else {
          platforms[account] = {
            investment: original,
            name: account
          };
        }
      }
    });

    let maxItem;
    let totalInvestment = 0;

    Object.values(platforms).forEach((platform) => {
      if (!maxItem) {
        maxItem = platform;
      }

      // Calculate total investment
      totalInvestment += platform.investment;

      // Find maximum
      if (platform.investment > maxItem?.investment) {
        maxItem = platform;
      }
    });

    const maxInvestmentRatio = maxItem.investment / totalInvestment;

    if (maxInvestmentRatio > ruleSettings.threshold) {
      return {
        evaluation: `Over ${
          ruleSettings.threshold * 100
        }% of your initial investment is at ${maxItem.name} (${(
          maxInvestmentRatio * 100
        ).toPrecision(3)}%)`,
        value: false
      };
    }

    return {
      evaluation: `The major part of your initial investment is at ${
        maxItem.name
      } (${(maxInvestmentRatio * 100).toPrecision(3)}%) and does not exceed ${
        ruleSettings.threshold * 100
      }%`,
      value: true
    };
  }
}
