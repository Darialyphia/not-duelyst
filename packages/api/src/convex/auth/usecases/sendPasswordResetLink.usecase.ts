import { Resend } from 'resend';
import { internalAction } from '../../_generated/server';
import { v } from 'convex/values';
import { isDev } from '../../utils/constants.utils';

export const sendPasswordResetLinkUsecase = internalAction({
  args: {
    token: v.string(),
    email: v.string()
  },
  async handler(ctx, args) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const from = isDev ? 'delivered@resend.dev' : process.env.RESEND_DOMAIN;
    const to = isDev ? (process.env.RESEND_ACCOUNT_EMAIL as string) : args.email;

    const { data, error } = await resend.emails.send({
      from: `Daria <${from}>`,
      to: [to],
      subject: 'Password reset link',
      html: `Click <a href="${process.env.CLIENT_URL}/reset-password?token=${args.token}">this password reset link</a> to reset your password`
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
});
