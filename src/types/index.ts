export type DayKey = "push-a" | "pull-a" | "legs-a" | "push-b" | "pull-b" | "legs-b";
export type Status = "positive" | "neutral" | "caution" | "negative";
export type Measurement = { measuredAt: string; bodyWeightKg?: number; leftArmCm?: number; rightArmCm?: number; chestCm?: number; waistCm?: number; shouldersCm?: number; leftThighCm?: number; rightThighCm?: number; notes?: string };
