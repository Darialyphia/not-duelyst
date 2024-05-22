import { completeSignupUsecase } from './users/usecases/completeSignup.usecase';
import { getMeUsecase } from './users/usecases/getMe.usecase';
import { completeOnboardingUsecase } from './users/usecases/completeOnboarding.usecase';
import { getAllUsersUsecase } from './users/usecases/getAllUsers.usecase';
import { getMySettingsUecase } from './users/usecases/getMySettings.usecase';
import { saveSettingsUsecase } from './users/usecases/saveSettings.usecase';
import { getProfileUsecase } from './users/usecases/getProfile.usecase';
import { updatePresenceUsecase } from './users/usecases/updatePresence.usecase';

export const me = getMeUsecase;
export const completeSignUp = completeSignupUsecase;
export const completeOnboarding = completeOnboardingUsecase;
export const all = getAllUsersUsecase;
export const settings = getMySettingsUecase;
export const saveSettings = saveSettingsUsecase;
export const profile = getProfileUsecase;
export const updatePresence = updatePresenceUsecase;
