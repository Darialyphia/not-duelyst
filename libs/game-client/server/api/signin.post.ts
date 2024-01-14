// server/api/login.post.ts
import { api } from '@hc/api';
import { ConvexHttpClient } from 'convex/browser';

export default defineEventHandler(async event => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const convexClient = new ConvexHttpClient(config.public.convexUrl);

  try {
    const sessionId = await convexClient.mutation(api.auth.signIn, {
      ...body,
      sessionId: null
    });
    setCookie(event, 'sessionId', sessionId, {
      httpOnly: true,
      secure: import.meta.env.PROD
    });

    return sendRedirect(event, '/play');
  } catch (e) {
    console.log(e);
    throw createError({
      message: 'Incorrect email or password',
      statusCode: 400
    });
  }
});
