import { z } from 'zod';
import { insertUserSchema, insertAlertSchema, alerts } from './schema';

export const api = {
  users: {
    heartbeat: {
      method: 'POST' as const,
      path: '/api/heartbeat',
      input: insertUserSchema,
      responses: {
        200: z.object({ status: z.string() }),
      },
    },
  },
  alerts: {
    create: {
      method: 'POST' as const,
      path: '/api/alerts',
      input: insertAlertSchema,
      responses: {
        201: z.custom<typeof alerts.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/alerts',
      input: z.object({
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        radius: z.coerce.number().default(5000), // meters
      }),
      responses: {
        200: z.array(z.custom<typeof alerts.$inferSelect>()),
      },
    },
  },
};
