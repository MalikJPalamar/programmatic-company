import { execFile } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function execCLI(
  cliName: string,
  command: string,
  args?: Record<string, unknown>,
  options?: { timeout?: number }
): Promise<ExecResult> {
  return new Promise((resolve_, reject) => {
    const cliPaths: Record<string, string> = {
      builderbee: resolve(__dirname, '../../builderbee-cli/src/index.ts'),
    };

    const entryPoint = cliPaths[cliName];
    if (!entryPoint) {
      reject(new Error(`Unknown CLI: ${cliName}`));
      return;
    }

    const commandParts = command.split('.');

    const cliArgs: string[] = [...commandParts, '--json'];
    if (args) {
      for (const [key, value] of Object.entries(args)) {
        if (typeof value === 'boolean') {
          if (value) cliArgs.push(`--${key}`);
        } else if (value !== undefined && value !== null) {
          cliArgs.push(`--${key}`, String(value));
        }
      }
    }

    const runner = process.env.NODE_ENV === 'production' ? 'node' : 'tsx';
    const entry =
      process.env.NODE_ENV === 'production'
        ? entryPoint.replace('/src/', '/dist/').replace('.ts', '.js')
        : entryPoint;

    execFile(runner, [entry, ...cliArgs], {
      timeout: options?.timeout ?? 30000,
      env: { ...process.env },
      cwd: resolve(__dirname, '../..'),
    }, (error, stdout, stderr) => {
      const exitCode = error && 'code' in error ? (error.code as number) : error ? 1 : 0;
      resolve_({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode });
    });
  });
}

export function parseCLIOutput(result: ExecResult): unknown {
  if (result.exitCode !== 0) {
    const errorSource = result.stderr || result.stdout;
    try {
      return JSON.parse(errorSource);
    } catch {
      throw new Error(errorSource || `CLI exited with code ${result.exitCode}`);
    }
  }

  try {
    return JSON.parse(result.stdout);
  } catch {
    return { raw: result.stdout };
  }
}
