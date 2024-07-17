import { defineCardEffect, type ActionParams } from '../card-effect';

export const provokeEffect = (
  { params, text }: { params: ActionParams<'provoke'>; text: string } = {
    text: '@Provoke@.',
    params: {}
  }
) =>
  defineCardEffect({
    text,
    config: {
      executionContext: 'immediate',
      actions: [{ type: 'provoke', params }]
    }
  });
