import { createHash } from "node:crypto";
import { z } from "zod";
import { env } from "@/lib/config";

export const workoutAnalysisSchema = z.object({
  headline: z.string().min(1).max(160),
  summary: z.string().min(1).max(900),
  confidence: z.enum(["low", "moderate", "high"]),
  metrics: z.array(z.object({ value: z.string().min(1).max(30), label: z.string().min(1).max(80) })).max(5),
  flags: z.array(z.object({ label: z.string().min(1).max(80), detail: z.string().min(1).max(300), status: z.enum(["positive", "neutral", "caution"]) })).max(6),
  exerciseRecommendations: z.array(z.object({ exercise: z.string().min(1).max(120), status: z.enum(["positive", "neutral", "caution"]), repPattern: z.string().min(1).max(180), suggestedWeight: z.string().min(1).max(60), recommendation: z.string().min(1).max(300) })).max(20),
  recommendation: z.string().min(1).max(500),
});

export type WorkoutAnalysis = z.infer<typeof workoutAnalysisSchema>;

export class GeminiRequestError extends Error {
  constructor(public readonly kind: "config" | "network" | "remote" | "response", message: string, public readonly retryAfterSeconds?: number) {
    super(message);
  }
}

export async function requestGeminiWorkoutAnalysis(source: ReturnType<typeof buildWorkoutAnalysisSource>) {
  if (!env.GEMINI_API_KEY) throw new GeminiRequestError("config", "GEMINI_API_KEY is not configured in the server environment.");
  const prompt = [
    "You are analyzing one completed hypertrophy workout for one athlete.",
    "Analyze the overall workout and every exercise in the supplied record. The athlete's target rep range is 6–10 reps and they usually perform 2–3 hard sets near 1–0 RIR.",
    "For each exercise, compare every logged set with the 6–10 target. Identify large rep variation, sets outside the range, or signs the load is too heavy or too light. Suggest a practical next weight that would make the next sets more consistent. Use the actual logged weights; do not invent plates or equipment increments. If the data is insufficient, say so.",
    "Return valid JSON with headline, summary, confidence (low|moderate|high), metrics (array of value and label), flags (array of label, detail, status), exerciseRecommendations (one item per exercise with exercise, status, repPattern, suggestedWeight, recommendation), and recommendation. Use positive, neutral, or caution status.",
    `Workout record: ${JSON.stringify(source)}`,
  ].join("\n\n");
  let response: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }),
      });
      if (response.ok || ![500, 502, 503, 504].includes(response.status) || attempt === 2) break;
    } catch {
      if (attempt === 2) break;
    }
    await pause(800 * (attempt + 1));
  }
  if (!response) throw new GeminiRequestError("network", "The server cannot reach Google Gemini right now. Check the network or DNS connection.");
  if (!response.ok) {
    if (response.status === 429) throw new GeminiRequestError("remote", "Gemini free-tier rate limit reached.");
    throw new GeminiRequestError("remote", `Google Gemini is temporarily unavailable (HTTP ${response.status}). Please try again.`);
  }
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new GeminiRequestError("response", "Gemini returned no analysis. Try again.");
  try { return { analysis: workoutAnalysisSchema.parse(JSON.parse(text)) }; }
  catch { throw new GeminiRequestError("response", "Gemini returned an unexpected analysis format. Try again."); }
}

export function hashSource(source: unknown) {
  return createHash("sha256").update(JSON.stringify(source)).digest("hex");
}

export function buildWorkoutAnalysisSource(workout: Record<string, unknown>) {
  return {
    date: workout.startedAt,
    workout: workout.dayKey,
    notes: workout.notes ?? "",
    exercises: (workout.exercises as Array<Record<string, unknown>> | undefined)?.map((exercise) => ({
      name: exercise.exerciseName,
      prescribedSets: exercise.prescribedSets,
      sets: (exercise.sets as Array<Record<string, unknown>> | undefined)?.map((set) => ({ weight: set.weight, reps: set.repetitions, rir: set.actualRIR, completed: set.completed })),
    })),
  };
}

async function pause(milliseconds: number) {
  await new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

