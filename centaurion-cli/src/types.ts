// --- Three Laws ---
// Law 1 (Hierarchy): Human > Centaurion > Business CLIs
// Law 2 (Routing): Given a task, route to the correct CLI with correct params
// Law 3 (Coupling): CLIs must not depend on each other directly

// --- Agent Registry ---

export interface Agent {
  id: string;
  name: string;
  target: string; // 'builderbee' | 'aob' | 'centaurion'
  description: string;
  commands: string[];
  status: 'active' | 'inactive' | 'degraded';
  lastHealthCheck?: string;
  metadata?: Record<string, unknown>;
}

export interface RouteDecision {
  target: string;
  command: string;
  args: Record<string, unknown>;
  confidence: number;
  reasoning: string;
}

// --- Memory Layer ---

export interface MemoryEntity {
  id: string;
  name: string;
  type: string; // 'client' | 'student' | 'program' | 'business' | 'agent'
  properties: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryRelation {
  id: string;
  sourceId: string;
  targetId: string;
  relation: string; // 'client_of' | 'enrolled_in' | 'certified_by' | 'managed_by'
  properties?: Record<string, unknown>;
  createdAt: string;
}

export interface MemoryQuery {
  entity?: string;
  type?: string;
  relation?: string;
  depth?: number;
}

export interface MemoryGraph {
  entities: MemoryEntity[];
  relations: MemoryRelation[];
}

// --- SA Scanner ---

export interface ScanResult {
  ticker: string;
  date: string;
  signals: Signal[];
  compositeScore: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
}

export interface Signal {
  source: string;
  indicator: string;
  value: number;
  weight: number;
  interpretation: string;
}

export interface ScanReport {
  date: string;
  tickers: ScanResult[];
  summary: string;
  generatedAt: string;
}

// --- Inference ---

export interface InferenceInput {
  signal: string;
  context?: Record<string, unknown>;
}

export interface InferenceResult {
  prediction: string;
  surprise: number; // 0-1, how unexpected this signal is
  action: string;
  confidence: number;
  reasoning: string;
}
