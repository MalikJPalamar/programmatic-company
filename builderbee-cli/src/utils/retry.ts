export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const maxRetries = config?.maxRetries ?? 3;
  const baseDelay = config?.baseDelayMs ?? 1000;
  const maxDelay = config?.maxDelayMs ?? 16000;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const msg = lastError.message;

      if (attempt === maxRetries) break;

      const isRetryable = msg.includes('429') || msg.includes('503') ||
        msg.includes('502') || msg.includes('timeout') ||
        msg.includes('ECONNRESET') || msg.includes('ECONNREFUSED');
      if (!isRetryable) break;

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
