import { describe, it, expect } from 'vitest';
import { parseCLIOutput } from '../src/cli-executor.js';
import type { ExecResult } from '../src/cli-executor.js';

describe('parseCLIOutput', () => {
  it('parses valid JSON stdout on success', () => {
    const result: ExecResult = { stdout: '{"items": [1, 2, 3], "total": 3}', stderr: '', exitCode: 0 };
    const parsed = parseCLIOutput(result);
    expect(parsed).toEqual({ items: [1, 2, 3], total: 3 });
  });

  it('returns raw wrapper for non-JSON stdout', () => {
    const result: ExecResult = { stdout: 'Hello, world!', stderr: '', exitCode: 0 };
    expect(parseCLIOutput(result)).toEqual({ raw: 'Hello, world!' });
  });

  it('throws on non-zero exit with non-JSON error', () => {
    const result: ExecResult = { stdout: '', stderr: 'Something went wrong', exitCode: 1 };
    expect(() => parseCLIOutput(result)).toThrow('Something went wrong');
  });

  it('returns parsed error JSON on non-zero exit with JSON stderr', () => {
    const errorJson = JSON.stringify({ success: false, error: { code: 'TEST_ERR', message: 'bad input' } });
    const result: ExecResult = { stdout: '', stderr: errorJson, exitCode: 1 };
    expect(parseCLIOutput(result)).toEqual({ success: false, error: { code: 'TEST_ERR', message: 'bad input' } });
  });

  it('throws generic message when both stdout and stderr are empty on failure', () => {
    const result: ExecResult = { stdout: '', stderr: '', exitCode: 1 };
    expect(() => parseCLIOutput(result)).toThrow('CLI exited with code 1');
  });
});
