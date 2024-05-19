import { completeSignupUsecase } from './users/usecases/complete-signup.usecase';
import { getMeUsecase } from './users/usecases/get-me.usecase';
import { completeOnboardingUsecase } from './users/usecases/complete-onboarding.usecase';
import { getAllUsersUsecase } from './users/usecases/get-all-users.usecase';
import { getMySettingsUecase } from './users/usecases/get-my-settings.usecase';
import { saveGameMapUsecase } from './gameMap/usecases/save-game-map.usecase';

export const me = getMeUsecase;
export const completeSignUp = completeSignupUsecase;
export const completeOnboarding = completeOnboardingUsecase;
export const all = getAllUsersUsecase;
export const settings = getMySettingsUecase;
export const saveSettings = saveGameMapUsecase;
