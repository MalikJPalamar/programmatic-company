import type { ProgramAdapter, Program, Cohort, Certification } from '../types.js';

export interface ProgramServiceConfig {
  apiKey: string;
  appId: string;
  baseUrl?: string;
}

export class OntraportProgramAdapter implements ProgramAdapter {
  private apiKey: string;
  private appId: string;
  private baseUrl: string;

  constructor(config: ProgramServiceConfig) {
    this.apiKey = config.apiKey;
    this.appId = config.appId;
    this.baseUrl = config.baseUrl ?? 'https://api.ontraport.com/1';
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Api-Key': this.apiKey,
        'Api-Appid': this.appId,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => 'Unknown error');
      throw new Error(`Ontraport API error (${response.status}): ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async listPrograms(options?: { status?: string }): Promise<Program[]> {
    const params = new URLSearchParams({ objectID: '10000' }); // Custom object for programs
    const data = await this.request<{ data: unknown[] }>(`/objects?${params.toString()}`);
    let programs = (data.data ?? []).map((p: any) => this.mapProgram(p));
    if (options?.status) {
      programs = programs.filter((p) => p.status === options.status);
    }
    return programs;
  }

  async getProgram(id: string): Promise<Program> {
    const data = await this.request<{ data: unknown }>(`/object?objectID=10000&id=${id}`);
    return this.mapProgram(data.data);
  }

  async listCohorts(programId: string, options?: { status?: string }): Promise<Cohort[]> {
    const params = new URLSearchParams({
      objectID: '10001', // Custom object for cohorts
      condition: JSON.stringify([{ field: { field: 'program_id' }, op: '=', value: { value: programId } }]),
    });
    const data = await this.request<{ data: unknown[] }>(`/objects?${params.toString()}`);
    let cohorts = (data.data ?? []).map((c: any) => this.mapCohort(c, programId));
    if (options?.status) {
      cohorts = cohorts.filter((c) => c.status === options.status);
    }
    return cohorts;
  }

  async getCohort(programId: string, cohortId: string): Promise<Cohort> {
    const data = await this.request<{ data: unknown }>(`/object?objectID=10001&id=${cohortId}`);
    return this.mapCohort(data.data, programId);
  }

  async checkCertification(studentId: string, programId: string): Promise<Certification | null> {
    const params = new URLSearchParams({
      objectID: '10002', // Custom object for certifications
      condition: JSON.stringify([
        { field: { field: 'student_id' }, op: '=', value: { value: studentId } },
        { field: { field: 'program_id' }, op: '=', value: { value: programId } },
      ]),
    });
    const data = await this.request<{ data: unknown[] }>(`/objects?${params.toString()}`);
    const certs = data.data ?? [];
    if (certs.length === 0) return null;
    return this.mapCertification(certs[0]);
  }

  async issueCertification(studentId: string, programId: string): Promise<Certification> {
    const existing = await this.checkCertification(studentId, programId);
    if (existing && existing.status === 'active') {
      throw new Error(`Student ${studentId} already has active certification for program ${programId}`);
    }

    const data = await this.request<{ data: unknown }>('/objects', {
      method: 'POST',
      body: JSON.stringify({
        objectID: 10002,
        student_id: studentId,
        program_id: programId,
        issued_at: new Date().toISOString(),
        status: 'active',
      }),
    });

    return this.mapCertification(data.data);
  }

  async listCertifications(studentId: string): Promise<Certification[]> {
    const params = new URLSearchParams({
      objectID: '10002',
      condition: JSON.stringify([
        { field: { field: 'student_id' }, op: '=', value: { value: studentId } },
      ]),
    });
    const data = await this.request<{ data: unknown[] }>(`/objects?${params.toString()}`);
    return (data.data ?? []).map((c: any) => this.mapCertification(c));
  }

  private mapProgram(raw: any): Program {
    return {
      id: String(raw.id ?? ''),
      name: raw.name ?? '',
      slug: raw.slug ?? raw.name?.toLowerCase().replace(/\s+/g, '-') ?? '',
      status: raw.status ?? 'active',
      cohorts: [],
    };
  }

  private mapCohort(raw: any, programId: string): Cohort {
    return {
      id: String(raw.id ?? ''),
      programId,
      name: raw.name ?? '',
      status: raw.status ?? 'upcoming',
      startDate: raw.start_date ?? '',
      endDate: raw.end_date,
      enrolledCount: parseInt(raw.enrolled_count ?? '0', 10),
    };
  }

  private mapCertification(raw: any): Certification {
    return {
      id: String(raw.id ?? ''),
      programId: String(raw.program_id ?? ''),
      programName: raw.program_name ?? '',
      studentId: String(raw.student_id ?? ''),
      issuedAt: raw.issued_at ?? '',
      status: raw.status ?? 'active',
    };
  }
}
