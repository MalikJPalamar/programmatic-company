export interface OutputOptions {
  json?: boolean;
}

export function formatOutput(data: unknown, opts: OutputOptions): string {
  if (opts.json) {
    return JSON.stringify(data, null, 2);
  }
  return formatHuman(data);
}

export function formatError(code: string, message: string, opts: OutputOptions): string {
  const error = { success: false, error: { code, message } };
  if (opts.json) {
    return JSON.stringify(error, null, 2);
  }
  return `Error [${code}]: ${message}`;
}

function formatHuman(data: unknown): string {
  if (Array.isArray(data)) {
    return formatTable(data);
  }
  if (typeof data === 'object' && data !== null) {
    return formatObject(data as Record<string, unknown>);
  }
  return String(data);
}

function formatTable(items: unknown[]): string {
  if (items.length === 0) return 'No results found.';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first);
  const widths = keys.map((k) =>
    Math.max(k.length, ...items.map((item) => String((item as any)[k] ?? '').length))
  );

  const header = keys.map((k, i) => k.padEnd(widths[i])).join('  ');
  const separator = widths.map((w) => '-'.repeat(w)).join('  ');
  const rows = items.map((item) =>
    keys.map((k, i) => String((item as any)[k] ?? '').padEnd(widths[i])).join('  ')
  );

  return [header, separator, ...rows].join('\n');
}

function formatObject(obj: Record<string, unknown>): string {
  const maxKeyLen = Math.max(...Object.keys(obj).map((k) => k.length));
  return Object.entries(obj)
    .map(([k, v]) => {
      const value = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return `${k.padEnd(maxKeyLen)}  ${value}`;
    })
    .join('\n');
}
