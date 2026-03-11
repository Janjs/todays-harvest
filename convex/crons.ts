import { cronJobs } from 'convex/server';
import { api } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'prefill-seasonal-fruit-cache',
  { hours: 24 },
  api.seasonal.prefillSeasonalFruit,
  {}
);

export default crons;
