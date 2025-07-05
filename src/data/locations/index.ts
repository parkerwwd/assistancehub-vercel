
import { usStates } from './states';
import { majorCounties } from './counties';
import { comprehensiveCities } from './cities';

export type { USLocation } from './types';
export { usStates, majorCounties, comprehensiveCities };

// Combined comprehensive locations
export const allUSLocations = [
  ...usStates,
  ...majorCounties,
  ...comprehensiveCities
];
