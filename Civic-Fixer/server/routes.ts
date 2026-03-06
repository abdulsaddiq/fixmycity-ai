import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // GET all reports
  app.get(api.reports.list.path, async (req, res) => {
    try {
      const reportsList = await storage.getReports();
      res.status(200).json(reportsList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // GET single report
  app.get(api.reports.get.path, async (req, res) => {
    try {
      const report = await storage.getReport(Number(req.params.id));
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  // POST create report
  app.post(api.reports.create.path, async (req, res) => {
    try {
      const input = api.reports.create.input.parse(req.body);
      
      // Basic mock since we might not actually have a fully working image processor here without analyzing first
      // The frontend should call analyze first, then send the analysis results here ideally.
      // But based on the schema, create report takes image url, lat, lng and we'd create it.
      // Let's assume the frontend sends the whole report schema actually. Wait, the input schema in shared/routes says:
      // imageUrl, latitude, longitude
      // This means we should do the analysis here or accept the analysis from the frontend.
      // Ah! The requirements said: 
      // POST /api/analyze-image -> returns JSON
      // User clicks Submit -> calls POST /api/reports with image URL, lat, long... wait, how does the report get the other fields?
      // I should update shared/schema.ts or just handle it if it sends the full object.
      // Let's modify the create route to accept the full InsertReport.
      
      const report = await storage.createReport(req.body);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          field: error.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // POST upvote report
  app.post(api.reports.upvote.path, async (req, res) => {
    try {
      const report = await storage.upvoteReport(Number(req.params.id));
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to upvote report" });
    }
  });

  // POST analyze image
  app.post(api.reports.analyzeImage.path, async (req, res) => {
    try {
      const input = api.reports.analyzeImage.input.parse(req.body);
      
      // Clean base64 string
      const base64Data = input.image.replace(/^data:image\/\w+;base64,/, "");
      
      const prompt = `You are a city infrastructure inspector. Analyze this image and identify any civic problem. 
      Respond only in JSON format with exactly this structure:
      {
        "problemType": string,
        "severity": "High" | "Medium" | "Low",
        "description": string,
        "communityImpact": string,
        "authority": string,
        "estimatedFixTime": string,
        "actions": [string, string, string, string]
      }`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: "image/jpeg", // Assuming jpeg, could be png
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);

      res.status(200).json(result);
    } catch (error) {
      console.error("AI Analysis error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          field: error.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // Seed database
  async function seedDatabase() {
    try {
      const existingReports = await storage.getReports();
      if (existingReports.length === 0) {
        console.log("Seeding database with initial reports...");
        await storage.createReport({
          imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80",
          problemType: "Large Pothole",
          severity: "High",
          description: "Deep pothole on the main avenue, causing severe traffic slowdowns and potential vehicle damage.",
          communityImpact: "High risk of accidents and tire damage",
          authority: "Road Works Department",
          estimatedFixTime: "2-3 Days",
          actions: ["Drive carefully around the area", "Report exact location if changed"],
          latitude: "40.7128",
          longitude: "-74.0060",
        });
        await storage.createReport({
          imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80",
          problemType: "Overflowing Garbage Dump",
          severity: "Medium",
          description: "Garbage bins are overflowing onto the sidewalk, creating an unsanitary environment.",
          communityImpact: "Health hazard and unpleasant odor",
          authority: "Municipal Sanitation",
          estimatedFixTime: "1 Day",
          actions: ["Use alternative bins nearby", "Avoid leaving more trash"],
          latitude: "40.7200",
          longitude: "-74.0100",
        });
        await storage.createReport({
          imageUrl: "https://images.unsplash.com/photo-1584985223846-930438ea1203?auto=format&fit=crop&q=80",
          problemType: "Broken Streetlight",
          severity: "Medium",
          description: "Streetlight is completely out, making the intersection dangerous at night.",
          communityImpact: "Reduced visibility for pedestrians and drivers",
          authority: "Electricity Department",
          estimatedFixTime: "3-5 Days",
          actions: ["Use reflective clothing at night", "Drive with high beams cautiously"],
          latitude: "40.7300",
          longitude: "-73.9900",
        });
      }
    } catch (e) {
      console.error("Error seeding database:", e);
    }
  }

  seedDatabase();

  return httpServer;
}
