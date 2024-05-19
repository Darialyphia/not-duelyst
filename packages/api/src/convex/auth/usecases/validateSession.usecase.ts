import { mutationWithAuth } from '../auth.utils';

export const validateSessionUsecase = mutationWithAuth({
  args: {},
  handler({ session }) {
    if (!session) return null;

    return {
      sessionId: session.sessionId,
      expiresAt: session.activePeriodExpiresAt.getTime()
    };
  }
});
