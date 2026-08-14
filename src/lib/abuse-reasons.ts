export const ABUSE_REASONS = ["ILLEGAL", "ADULT", "FRAUD", "HATE", "COPYRIGHT", "OTHER"] as const;
export type AbuseReasonInput = (typeof ABUSE_REASONS)[number];
