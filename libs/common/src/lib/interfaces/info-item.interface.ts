import { Currency } from '@prisma/client';

export interface InfoItem {
  currencies: Currency[];
  demoAuthToken: string;
  globalPermissions: string[];
  lastDataGathering?: Date;
  message?: {
    text: string;
    type: string;
  };
  platforms: { id: string; name: string }[];
}
