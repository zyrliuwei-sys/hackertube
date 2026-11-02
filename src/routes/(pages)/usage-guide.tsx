import { createFileRoute } from '@tanstack/react-router';

import { staticPageRouteOptions } from './-static-page';

export const Route = createFileRoute('/(pages)/usage-guide')(
  staticPageRouteOptions('usage-guide')
);
