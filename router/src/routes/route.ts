import { Hono } from 'hono';
import type { RouteRequest, RouteResponse } from '../types.js';
import { getTarget, listTargets } from '../registry.js';

export const routeRoutes = new Hono();

routeRoutes.post('/route', async (c) => {
  const body = await c.req.json<RouteRequest>().catch(() => null);

  if (!body || !body.target || !body.command) {
    return c.json<RouteResponse>(
      {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Request must include "target" and "command" fields',
        },
      },
      400
    );
  }

  const target = getTarget(body.target);
  if (!target) {
    const available = Object.keys(listTargets());
    return c.json<RouteResponse>(
      {
        success: false,
        error: {
          code: 'TARGET_NOT_FOUND',
          message: `Target "${body.target}" not found. Available: ${available.join(', ') || 'none'}`,
        },
      },
      404
    );
  }

  if (!target.commands.includes(body.command)) {
    return c.json<RouteResponse>(
      {
        success: false,
        error: {
          code: 'COMMAND_NOT_FOUND',
          message: `Command "${body.command}" not found on target "${body.target}". Available: ${target.commands.join(', ')}`,
        },
      },
      404
    );
  }

  const startMs = Date.now();

  try {
    const result = await target.handler(body.command, body.args);
    const duration = Date.now() - startMs;

    return c.json<RouteResponse>({
      success: true,
      data: result,
      meta: {
        target: body.target,
        command: body.command,
        timestamp: new Date().toISOString(),
        duration_ms: duration,
      },
    });
  } catch (err) {
    const duration = Date.now() - startMs;
    const message = err instanceof Error ? err.message : 'Unknown error';

    return c.json<RouteResponse>(
      {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message,
        },
        meta: {
          target: body.target,
          command: body.command,
          timestamp: new Date().toISOString(),
          duration_ms: duration,
        },
      },
      500
    );
  }
});

routeRoutes.get('/targets', (c) => {
  return c.json({
    success: true,
    data: listTargets(),
  });
});
