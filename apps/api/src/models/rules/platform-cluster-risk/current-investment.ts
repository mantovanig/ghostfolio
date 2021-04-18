import { PortfolioPosition } from 'apps/api/src/app/portfolio/interfaces/portfolio-position.interface';
import { ExchangeRateDataService } from 'apps/api/src/services/exchange-rate-data.service';

import { Rule } from '../../rule';

export class PlatformClusterRiskCurrentInvestment extends Rule {
  public constructor(public exchangeRateDataService: ExchangeRateDataService) {
    super(exchangeRateDataService, {
      name: 'Current Investment'
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
      aRuleSettingsMap[PlatformClusterRiskCurrentInvestment.name];

    const platforms: {
      [symbol: string]: Pick<PortfolioPosition, 'name'> & {
        investment: number;
      };
    } = {};

    Object.values(aPositions).forEach((position) => {
      for (const [platform, { current }] of Object.entries(
        position.platforms
      )) {
        if (platforms[platform]?.investment) {
          platforms[platform].investment += current;
        } else {
          platforms[platform] = {
            investment: current,
            name: platform
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
        }% of your current investment is at ${maxItem.name} (${(
          maxInvestmentRatio * 100
        ).toPrecision(3)}%)`,
        value: false
      };
    }

    return {
      evaluation: `The major part of your current investment is at ${
        maxItem.name
      } (${(maxInvestmentRatio * 100).toPrecision(3)}%) and does not exceed ${
        ruleSettings.threshold * 100
      }%`,
      value: true
    };
  }
}