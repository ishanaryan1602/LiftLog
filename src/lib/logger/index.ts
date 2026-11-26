import pino from "pino";
export const logger = pino({ name: "form", level: process.env.LOG_LEVEL ?? "info" });
