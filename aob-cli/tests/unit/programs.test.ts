import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OntraportProgramAdapter } from '../../src/adapters/programs.js';

const mockPrograms = {
  data: [
    { id: 'p001', name: 'Teacher Training Level 2', slug: 'tt2', status: 'active' },
    { id: 'p002', name: 'Breathwork Certification', slug: 'breathwork', status: 'active' },
    { id: 'p003', name: 'Legacy Program', slug: 'legacy', status: 'archived' },
  ],
};

const mockProgram = {
  data: { id: 'p001', name: 'Teacher Training Level 2', slug: 'tt2', status: 'active' },
};

const mockCohorts = {
  data: [
    { id: 'c001', name: 'TT2 Spring 2026', status: 'active', start_date: '2026-03-01', end_date: '2026-06-01', enrolled_count: '24', program_id: 'p001' },
    { id: 'c002', name: 'TT2 Fall 2026', status: 'upcoming', start_date: '2026-09-01', enrolled_count: '8', program_id: 'p001' },
  ],
};

const mockCohort = {
  data: { id: 'c001', name: 'TT2 Spring 2026', status: 'active', start_date: '2026-03-01', end_date: '2026-06-01', enrolled_count: '24', program_id: 'p001' },
};

const mockCertifications = {
  data: [
    { id: 'cert001', program_id: 'p001', program_name: 'Teacher Training Level 2', student_id: '1001', issued_at: '2025-12-15', status: 'active' },
  ],
};

const mockNoCerts = { data: [] };

const mockIssuedCert = {
  data: { id: 'cert002', program_id: 'p002', program_name: 'Breathwork Certification', student_id: '1001', issued_at: '2026-04-15', status: 'active' },
};

describe('OntraportProgramAdapter', () => {
  const adapter = new OntraportProgramAdapter({ apiKey: 'test', appId: 'test', baseUrl: 'https://mock.ontraport' });
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => { fetchSpy = vi.spyOn(globalThis, 'fetch'); });
  afterEach(() => { fetchSpy.mockRestore(); });

  function mockFetch(data: unknown) {
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }

  describe('programs', () => {
    it('lists all programs', async () => {
      mockFetch(mockPrograms);
      const programs = await adapter.listPrograms();
      expect(programs).toHaveLength(3);
      expect(programs[0].name).toBe('Teacher Training Level 2');
      expect(programs[0].slug).toBe('tt2');
    });

    it('filters programs by status', async () => {
      mockFetch(mockPrograms);
      const programs = await adapter.listPrograms({ status: 'archived' });
      expect(programs).toHaveLength(1);
      expect(programs[0].slug).toBe('legacy');
    });

    it('gets a single program', async () => {
      mockFetch(mockProgram);
      const program = await adapter.getProgram('p001');
      expect(program.id).toBe('p001');
      expect(program.name).toBe('Teacher Training Level 2');
    });
  });

  describe('cohorts', () => {
    it('lists cohorts for a program', async () => {
      mockFetch(mockCohorts);
      const cohorts = await adapter.listCohorts('p001');
      expect(cohorts).toHaveLength(2);
      expect(cohorts[0].name).toBe('TT2 Spring 2026');
      expect(cohorts[0].enrolledCount).toBe(24);
    });

    it('filters cohorts by status', async () => {
      mockFetch(mockCohorts);
      const cohorts = await adapter.listCohorts('p001', { status: 'upcoming' });
      expect(cohorts).toHaveLength(1);
      expect(cohorts[0].name).toBe('TT2 Fall 2026');
    });

    it('gets a single cohort', async () => {
      mockFetch(mockCohort);
      const cohort = await adapter.getCohort('p001', 'c001');
      expect(cohort.id).toBe('c001');
      expect(cohort.startDate).toBe('2026-03-01');
    });
  });

  describe('certifications', () => {
    it('checks existing certification', async () => {
      mockFetch(mockCertifications);
      const cert = await adapter.checkCertification('1001', 'p001');
      expect(cert).not.toBeNull();
      expect(cert!.status).toBe('active');
      expect(cert!.programName).toBe('Teacher Training Level 2');
    });

    it('returns null when no certification exists', async () => {
      mockFetch(mockNoCerts);
      const cert = await adapter.checkCertification('9999', 'p001');
      expect(cert).toBeNull();
    });

    it('issues a new certification', async () => {
      mockFetch(mockNoCerts); // checkCertification returns none
      mockFetch(mockIssuedCert); // POST creates new
      const cert = await adapter.issueCertification('1001', 'p002');
      expect(cert.id).toBe('cert002');
      expect(cert.status).toBe('active');
    });

    it('throws if student already certified', async () => {
      mockFetch(mockCertifications); // checkCertification returns active cert
      await expect(adapter.issueCertification('1001', 'p001')).rejects.toThrow('already has active certification');
    });

    it('lists all certifications for a student', async () => {
      mockFetch(mockCertifications);
      const certs = await adapter.listCertifications('1001');
      expect(certs).toHaveLength(1);
      expect(certs[0].studentId).toBe('1001');
    });
  });
});
