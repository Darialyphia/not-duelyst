import { defineCardEffect } from '../card-effect';

export const airdropEffect = () =>
  defineCardEffect({
    text: '@Airdrop@.',
    config: {
      executionContext: 'while_in_hand',
      actions: [{ type: 'airdrop', params: {} }]
    }
  });
