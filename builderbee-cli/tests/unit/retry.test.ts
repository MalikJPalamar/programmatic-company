import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../src/utils/retry.js';

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('API error (503): Service Unavailable'))
      .mockResolvedValue('recovered');

    const result = await withRetry(fn, { baseDelayMs: 1, maxDelayMs: 10 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on non-retryable errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('API error (400): Bad Request'));

    await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow('400');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('gives up after maxRetries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('API error (503): down'));

    await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 1, maxDelayMs: 10 }))
      .rejects.toThrow('503');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('retries on timeout errors', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValue('ok');

    const result = await withRetry(fn, { baseDelayMs: 1 });
    expect(result).toBe('ok');
  });
});
