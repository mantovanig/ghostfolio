import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { GfSymbolIconModule } from '../symbol-icon/symbol-icon.module';
import { GfValueModule } from '../value/value.module';
import { AccountsTableComponent } from './accounts-table.component';

@NgModule({
  declarations: [AccountsTableComponent],
  exports: [AccountsTableComponent],
  imports: [
    CommonModule,
    GfSymbolIconModule,
    GfValueModule,
    MatButtonModule,
    MatInputModule,
    MatMenuModule,
    MatSortModule,
    MatTableModule,
    NgxSkeletonLoaderModule,
    RouterModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GfAccountsTableModule {}
