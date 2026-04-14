import type { GHLConfig } from '../types.js';

export function loadConfig(): GHLConfig {
  const apiKey = process.env.GHL_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GHL_API_KEY environment variable is required. Set it with: export GHL_API_KEY=your-key'
    );
  }

  return {
    apiKey,
    locationId: process.env.GHL_LOCATION_ID,
    baseUrl: process.env.GHL_BASE_URL,
  };
}
