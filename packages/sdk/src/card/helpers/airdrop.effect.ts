import { defineCardEffect } from '../card-effect';

export const airdropEffect = () =>
  defineCardEffect({
    text: '@Airdrop@.',
    config: {
      executionContext: 'on_init',
      actions: [{ type: 'airdrop' }]
    }
  });
