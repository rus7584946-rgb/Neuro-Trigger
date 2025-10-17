// This file is now acting as a proxy to the new RecommendationCard component
// to avoid breaking imports in other parts of the application during the refactor.
// The core logic has moved to RecommendationCard.tsx

export { RecommendationCard as TriggerCard } from './RecommendationCard.tsx';
export type { StrategicRecommendation as Trigger } from '../../types.ts';