import { NextResponse } from "next/server";
import { buildWorkoutAnalysisSource, GeminiRequestError, hashSource, requestGeminiWorkoutAnalysis, workoutAnalysisSchema } from "@/lib/gemini-analysis";
import { connectDb } from "@/lib/db";
import { AnalysisReport, User, WorkoutSession } from "@/lib/models";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDb();
    const user = await User.findOne({ displayName: "Local Owner" }).lean() as { _id: unknown } | null;
    const id = new URL(request.url).searchParams.get("id");
    if (!user || !id) return NextResponse.json({ message: "Workout analysis is unavailable." }, { status: 400 });
    const workout = await WorkoutSession.findOne({ _id: id, userId: user._id }).lean() as Record<string, unknown> | null;
    if (!workout) return NextResponse.json({ message: "Workout not found." }, { status: 404 });
    const source = buildWorkoutAnalysisSource(workout);
    const sourceDataHash = hashSource({ version: 2, targetRepRange: "6-10", source });
    const reportType = `workout:${id}`;
    const cached = await AnalysisReport.findOne({ userId: user._id, reportType, sourceDataHash }).lean() as { aiAnalysis?: string; generatedAt?: Date } | null;
    if (cached?.aiAnalysis) {
      const parsed = workoutAnalysisSchema.safeParse(JSON.parse(cached.aiAnalysis));
      if (parsed.success) return NextResponse.json({ status: "ready", cached: true, report: parsed.data, generatedAt: cached.generatedAt });
    }
    const result = await requestGeminiWorkoutAnalysis(source);
    await AnalysisReport.findOneAndUpdate({ userId: user._id, reportType, sourceDataHash }, { userId: user._id, sourceDataHash, reportType, aiAnalysis: JSON.stringify(result.analysis), generatedAt: new Date() }, { upsert: true, new: true });
    return NextResponse.json({ status: "ready", cached: false, report: result.analysis, generatedAt: new Date() });
  } catch (error) {
    logger.warn({ err: error }, "Workout AI analysis unavailable");
    const message = error instanceof GeminiRequestError ? error.message : "Workout analysis is temporarily unavailable. Try again later.";
    return NextResponse.json({ status: "unavailable", message }, { status: 503 });
  }
}
