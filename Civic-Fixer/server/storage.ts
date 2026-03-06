import { db } from "./db";
import { reports, type InsertReport, type Report } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  upvoteReport(id: number): Promise<Report | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(reports.createdAt);
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async upvoteReport(id: number): Promise<Report | undefined> {
    const [updatedReport] = await db
      .update(reports)
      .set({ upvotes: sql`${reports.upvotes} + 1` })
      .where(eq(reports.id, id))
      .returning();
    return updatedReport;
  }
}

export const storage = new DatabaseStorage();
