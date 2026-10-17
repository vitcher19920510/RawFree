import { SetMetadata } from '@nestjs/common';

export const REQUIRE_SUBSCRIPTION_KEY = 'requireSubscription';

export const RequireSubscription = (require = true) => SetMetadata(REQUIRE_SUBSCRIPTION_KEY, require);
