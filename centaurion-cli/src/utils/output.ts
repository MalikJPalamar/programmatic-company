export interface OutputOptions { json?: boolean; }

export function formatOutput(data: unknown, opts: OutputOptions): string {
  if (opts.json) return JSON.stringify(data, null, 2);
  if (Array.isArray(data)) {
    if (data.length === 0) return 'No results found.';
    const keys = Object.keys(data[0] as Record<string, unknown>);
    const widths = keys.map((k) => Math.max(k.length, ...data.map((item) => String((item as any)[k] ?? '').length)));
    const header = keys.map((k, i) => k.padEnd(widths[i])).join('  ');
    const sep = widths.map((w) => '-'.repeat(w)).join('  ');
    const rows = data.map((item) => keys.map((k, i) => String((item as any)[k] ?? '').padEnd(widths[i])).join('  '));
    return [header, sep, ...rows].join('\n');
  }
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    const maxLen = Math.max(...Object.keys(obj).map((k) => k.length));
    return Object.entries(obj).map(([k, v]) => `${k.padEnd(maxLen)}  ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join('\n');
  }
  return String(data);
}

export function formatError(code: string, message: string, opts: OutputOptions): string {
  if (opts.json) return JSON.stringify({ success: false, error: { code, message } }, null, 2);
  return `Error [${code}]: ${message}`;
}
