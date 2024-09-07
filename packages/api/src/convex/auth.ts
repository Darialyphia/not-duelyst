import { generatePasswordResetLinkUseCase } from './auth/usecases/generatePasswordResetLink.usecase';
import { resetUserPasswordUsecase } from './auth/usecases/resetUserPassword.usecase';
import { sendPasswordResetLinkUsecase } from './auth/usecases/sendPasswordResetLink.usecase';
import { signinUsecase } from './auth/usecases/signin.usecase';
import { signoffUsecase } from './auth/usecases/signoff.usecase';
import { signupUsecase } from './auth/usecases/signup.usecase';
import { validateSessionUsecase } from './auth/usecases/validateSession.usecase';

export const signIn = signinUsecase;
export const signOff = signoffUsecase;
export const signUp = signupUsecase;
export const validateSession = validateSessionUsecase;
export const sendPasswordResetLink = sendPasswordResetLinkUsecase;
export const generatePasswordResetLink = generatePasswordResetLinkUseCase;
export const resetPassword = resetUserPasswordUsecase;
