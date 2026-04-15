import type { AOBConfig } from '../types.js';

export function loadConfig(): AOBConfig {
  return {
    ontraport: process.env.ONTRAPORT_API_KEY && process.env.ONTRAPORT_APP_ID
      ? { apiKey: process.env.ONTRAPORT_API_KEY, appId: process.env.ONTRAPORT_APP_ID }
      : undefined,
    stripe: process.env.STRIPE_SECRET_KEY
      ? { secretKey: process.env.STRIPE_SECRET_KEY }
      : undefined,
    mighty: process.env.MIGHTY_API_KEY && process.env.MIGHTY_COMMUNITY_ID
      ? { apiKey: process.env.MIGHTY_API_KEY, communityId: process.env.MIGHTY_COMMUNITY_ID }
      : undefined,
  };
}
