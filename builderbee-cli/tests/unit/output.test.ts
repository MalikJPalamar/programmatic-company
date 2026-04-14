import { describe, it, expect } from 'vitest';
import { formatOutput, formatError } from '../../src/utils/output.js';

describe('formatOutput', () => {
  it('returns JSON string when json option is true', () => {
    const data = { name: 'test', value: 42 };
    const result = formatOutput(data, { json: true });
    expect(JSON.parse(result)).toEqual(data);
  });

  it('formats array as table for human output', () => {
    const data = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];
    const result = formatOutput(data, { json: false });
    expect(result).toContain('id');
    expect(result).toContain('name');
    expect(result).toContain('Alice');
    expect(result).toContain('Bob');
  });

  it('formats object as key-value pairs for human output', () => {
    const data = { name: 'Acme Corp', status: 'active' };
    const result = formatOutput(data, { json: false });
    expect(result).toContain('name');
    expect(result).toContain('Acme Corp');
    expect(result).toContain('status');
    expect(result).toContain('active');
  });

  it('handles empty array', () => {
    const result = formatOutput([], { json: false });
    expect(result).toBe('No results found.');
  });

  it('handles empty array as JSON', () => {
    const result = formatOutput([], { json: true });
    expect(JSON.parse(result)).toEqual([]);
  });
});

describe('formatError', () => {
  it('returns structured JSON error when json option is true', () => {
    const result = formatError('TEST_ERR', 'Something went wrong', { json: true });
    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(false);
    expect(parsed.error.code).toBe('TEST_ERR');
    expect(parsed.error.message).toBe('Something went wrong');
  });

  it('returns human-readable error when json is false', () => {
    const result = formatError('TEST_ERR', 'Something went wrong', { json: false });
    expect(result).toBe('Error [TEST_ERR]: Something went wrong');
  });
});
