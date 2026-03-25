import { describe, it, expect } from 'vitest';
import { getDailySeedHash, getDailyRandom } from '../lib/puzzleEngine';

describe('Puzzle Engine Determinism', () => {
  it('should generate deterministic hashes for the same date', async () => {
    const hash1 = await getDailySeedHash('2026-03-24');
    const hash2 = await getDailySeedHash('2026-03-24');
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBeGreaterThan(0);
  });

  it('should generate different hashes for different dates', async () => {
    const hash1 = await getDailySeedHash('2026-03-24');
    const hash2 = await getDailySeedHash('2026-03-25');
    expect(hash1).not.toBe(hash2);
  });

  it('should generate deterministic pseudorandom values between 0 and 1', async () => {
    const r1 = await getDailyRandom('2026-03-24', 'test-salt');
    const r2 = await getDailyRandom('2026-03-24', 'test-salt');
    const r3 = await getDailyRandom('2026-03-25', 'test-salt');

    expect(r1).toBe(r2);
    expect(r1).not.toBe(r3);
    expect(r1).toBeGreaterThanOrEqual(0);
    expect(r1).toBeLessThanOrEqual(1);
  });
});