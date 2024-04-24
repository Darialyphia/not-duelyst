import type { Auth, Session } from 'lucia';
import type { UseCase } from '../../usecase';
import type { Nullable } from '@game/shared';

type Input = undefined;

type Output = {
  ok: true;
};

export class LogoutUseCase implements UseCase<Input, Output> {
  constructor(
    private auth: Auth,
    private session: Nullable<Session>
  ) {}

  async execute() {
    if (this.session) {
      await this.auth.invalidateSession(this.session.sessionId);
    }

    return { ok: true } as const;
  }
}
