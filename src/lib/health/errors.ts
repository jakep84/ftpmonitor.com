export function mapErrorToStep(err: any): {
  status: number;
  step: "dns" | "tcp" | "auth" | "list";
  message: string;
  details?: Record<string, any>;
  tips: string[];
} {
  const status = Number(err?.status ?? 400);
  const message = err?.message ?? "Request failed";
  const details = err?.details;

  if (status === 429) {
    return {
      status,
      step: "tcp",
      message: "Too many requests. Please slow down.",
      details,
      tips: ["Try again in a moment."],
    };
  }

  return {
    status,
    step: "tcp",
    message,
    details,
    tips: ["Double-check your inputs and try again."],
  };
}
