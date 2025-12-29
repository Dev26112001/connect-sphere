import { z } from 'zod';
import { insertIntentionSchema, insertConnectionSchema, intentions, connections, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// Response types with included relations
const userSchema = z.custom<typeof users.$inferSelect>();
const intentionSchema = z.custom<typeof intentions.$inferSelect & { creator?: typeof users.$inferSelect }>();
const connectionSchema = z.custom<typeof connections.$inferSelect & { intention?: typeof intentions.$inferSelect, requester?: typeof users.$inferSelect }>();

export const api = {
  intentions: {
    list: {
      method: 'GET' as const,
      path: '/api/intentions',
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(intentionSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/intentions/:id',
      responses: {
        200: intentionSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/intentions',
      input: insertIntentionSchema,
      responses: {
        201: intentionSchema,
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
  },
  connections: {
    create: {
      method: 'POST' as const,
      path: '/api/connections',
      input: z.object({
        intentionId: z.number(),
        message: z.string().optional(),
      }),
      responses: {
        201: connectionSchema,
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/connections', // My connections (both sent and received)
      responses: {
        200: z.object({
          sent: z.array(connectionSchema),
          received: z.array(connectionSchema),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/connections/:id/status',
      input: z.object({
        status: z.enum(['accepted', 'rejected']),
      }),
      responses: {
        200: connectionSchema,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
