import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ReportResponse, type AnalyzeImageResponse } from "@shared/routes";
import { z } from "zod";

// Helper to log and parse Zod schemas
function parseResponse<T>(schema: z.ZodSchema<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod Error] ${context}:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useReports() {
  return useQuery({
    queryKey: [api.reports.list.path],
    queryFn: async () => {
      const res = await fetch(api.reports.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      return parseResponse(api.reports.list.responses[200], data, "Fetch Reports");
    },
  });
}

export function useAnalyzeImage() {
  return useMutation({
    mutationFn: async (base64Image: string) => {
      const payload = api.reports.analyzeImage.input.parse({ image: base64Image });
      
      const res = await fetch(api.reports.analyzeImage.path, {
        method: api.reports.analyzeImage.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to analyze image");
      const data = await res.json();
      return parseResponse(api.reports.analyzeImage.responses[200], data, "Analyze Image");
    },
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { imageUrl: string, latitude?: string, longitude?: string }) => {
      // Use placeholder URL if backend schema strictly requires valid http(s) URL and base64 fails
      let validUrl = input.imageUrl;
      if (input.imageUrl.startsWith("data:")) {
         // Some backends might choke on data URIs if z.string().url() is strict
         // To guarantee success for MVP, we might send a dummy if it fails. 
         // We will try sending the actual data URL first.
      }

      const payload = api.reports.create.input.parse({
        imageUrl: validUrl,
        latitude: input.latitude,
        longitude: input.longitude,
      });

      const res = await fetch(api.reports.create.path, {
        method: api.reports.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        // If the URL validation failed, let's gracefully log it
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create report");
      }
      
      const data = await res.json();
      return parseResponse(api.reports.create.responses[201], data, "Create Report");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
    },
  });
}

export function useUpvoteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.reports.upvote.path, { id });
      const res = await fetch(url, {
        method: api.reports.upvote.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upvote");
      const data = await res.json();
      return parseResponse(api.reports.upvote.responses[200], data, "Upvote Report");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
    },
  });
}
