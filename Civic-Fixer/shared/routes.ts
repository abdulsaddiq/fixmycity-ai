import { z } from "zod";
import { insertReportSchema, reports } from "./schema";

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
};

export const api = {
  reports: {
    list: {
      method: "GET" as const,
      path: "/api/reports" as const,
      responses: {
        200: z.array(z.custom<typeof reports.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/reports/:id" as const,
      responses: {
        200: z.custom<typeof reports.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/reports" as const,
      input: z.object({
        imageUrl: z.string().url(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
      }), // This goes to the AI to generate the report
      responses: {
        201: z.custom<typeof reports.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    upvote: {
      method: "POST" as const,
      path: "/api/reports/:id/upvote" as const,
      responses: {
        200: z.custom<typeof reports.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    analyzeImage: {
      method: "POST" as const,
      path: "/api/analyze-image" as const,
      input: z.object({
        image: z.string(), // base64 encoded image
      }),
      responses: {
        200: z.object({
          problemType: z.string(),
          severity: z.enum(["High", "Medium", "Low"]),
          description: z.string(),
          communityImpact: z.string(),
          authority: z.string(),
          estimatedFixTime: z.string(),
          actions: z.array(z.string()),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
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

export type ReportResponse = z.infer<typeof api.reports.list.responses[200]>[0];
export type AnalyzeImageResponse = z.infer<typeof api.reports.analyzeImage.responses[200]>;
