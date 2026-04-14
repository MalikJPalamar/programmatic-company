export interface RouteRequest {
  target: string;
  command: string;
  args?: Record<string, unknown>;
}

export interface RouteResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    target: string;
    command: string;
    timestamp: string;
    duration_ms: number;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime_seconds: number;
  targets: Record<string, TargetHealth>;
}

export interface TargetHealth {
  status: 'available' | 'unavailable';
  commands: number;
}

export interface TargetRegistry {
  [name: string]: TargetConfig;
}

export interface TargetConfig {
  name: string;
  description: string;
  commands: string[];
  handler: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
}
