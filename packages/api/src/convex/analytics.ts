import { getGlobalStatsUsecase } from './analytics/usecases/getGlobalStats.usecase';
import { initGlobalStatsUsecase } from './analytics/usecases/initGlobalStats.usecase';
import { procesGameInsightsUsecase } from './analytics/usecases/processGameInsights.usecase';

export const init = initGlobalStatsUsecase;
export const processGame = procesGameInsightsUsecase;
export const globalStats = getGlobalStatsUsecase;
