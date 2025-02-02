import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ToggleOption } from '@ghostfolio/client/components/toggle/interfaces/toggle-option.type';
import { DataService } from '@ghostfolio/client/services/data.service';
import { ImpersonationStorageService } from '@ghostfolio/client/services/impersonation-storage.service';
import { UserService } from '@ghostfolio/client/services/user/user.service';
import {
  PortfolioItem,
  PortfolioPosition,
  User
} from '@ghostfolio/common/interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'gf-analysis-page',
  templateUrl: './analysis-page.html',
  styleUrls: ['./analysis-page.scss']
})
export class AnalysisPageComponent implements OnDestroy, OnInit {
  public accounts: {
    [symbol: string]: Pick<PortfolioPosition, 'name'> & { value: number };
  };
  public deviceType: string;
  public period = 'current';
  public periodOptions: ToggleOption[] = [
    { label: 'Initial', value: 'original' },
    { label: 'Current', value: 'current' }
  ];
  public hasImpersonationId: boolean;
  public portfolioItems: PortfolioItem[];
  public portfolioPositions: { [symbol: string]: PortfolioPosition };
  public positions: { [symbol: string]: any };
  public positionsArray: PortfolioPosition[];
  public user: User;

  private unsubscribeSubject = new Subject<void>();

  /**
   * @constructor
   */
  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private deviceService: DeviceDetectorService,
    private impersonationStorageService: ImpersonationStorageService,
    private userService: UserService
  ) {}

  /**
   * Initializes the controller
   */
  public ngOnInit() {
    this.deviceType = this.deviceService.getDeviceInfo().deviceType;

    this.impersonationStorageService
      .onChangeHasImpersonation()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((aId) => {
        this.hasImpersonationId = !!aId;
      });

    this.dataService
      .fetchPortfolio()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((response) => {
        this.portfolioItems = response;

        this.changeDetectorRef.markForCheck();
      });

    this.dataService
      .fetchPortfolioPositions({})
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((response = {}) => {
        this.portfolioPositions = response;
        this.initializeAnalysisData(this.portfolioPositions, this.period);

        this.changeDetectorRef.markForCheck();
      });

    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  public initializeAnalysisData(
    aPortfolioPositions: {
      [symbol: string]: PortfolioPosition;
    },
    aPeriod: string
  ) {
    this.accounts = {};
    this.positions = {};
    this.positionsArray = [];

    for (const [symbol, position] of Object.entries(aPortfolioPositions)) {
      this.positions[symbol] = {
        currency: position.currency,
        exchange: position.exchange,
        industry: position.industry,
        sector: position.sector,
        type: position.type,
        value:
          aPeriod === 'original'
            ? position.allocationInvestment
            : position.allocationCurrent
      };
      this.positionsArray.push(position);

      for (const [account, { current, original }] of Object.entries(
        position.accounts
      )) {
        if (this.accounts[account]?.value) {
          this.accounts[account].value +=
            aPeriod === 'original' ? original : current;
        } else {
          this.accounts[account] = {
            value: aPeriod === 'original' ? original : current,
            name: account
          };
        }
      }
    }
  }

  public onChangePeriod(aValue: string) {
    this.period = aValue;

    this.initializeAnalysisData(this.portfolioPositions, this.period);
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}
