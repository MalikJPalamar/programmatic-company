import type { Context, Next } from 'hono';

export function apiKeyAuth() {
  return async (c: Context, next: Next) => {
    const apiKey = c.req.header('X-API-Key') ?? c.req.header('Authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return c.json(
        {
          success: false,
          error: {
            code: 'AUTH_MISSING',
            message: 'API key required. Provide via X-API-Key header or Authorization: Bearer <key>',
          },
        },
        401
      );
    }

    const validKey = process.env.UAPP_API_KEY;
    if (!validKey) {
      return c.json(
        {
          success: false,
          error: {
            code: 'AUTH_NOT_CONFIGURED',
            message: 'Server API key not configured',
          },
        },
        500
      );
    }

    if (apiKey !== validKey) {
      return c.json(
        {
          success: false,
          error: {
            code: 'AUTH_INVALID',
            message: 'Invalid API key',
          },
        },
        403
      );
    }

    await next();
  };
}
