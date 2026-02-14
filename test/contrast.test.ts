import { describe, expect, test } from 'vitest';
import { analyzeContrast, getContrastRatio } from '../src';

describe('contrast helpers', () => {
  test('computes expected black/white ratio', () => {
    const ratio = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio).not.toBeNull();
    expect(ratio).toBeCloseTo(21, 5);
  });

  test('returns WCAG flags', () => {
    const result = analyzeContrast('#666666', '#FFFFFF');
    expect(result).not.toBeNull();
    expect(result?.wcagAA).toBe(true);
    expect(result?.wcagAAA).toBe(false);
    expect(result?.ratio).toBeGreaterThan(4.5);
  });

  test('returns null on invalid input', () => {
    expect(getContrastRatio('not-a-color', '#ffffff')).toBeNull();
    expect(analyzeContrast('#ffffff', 'broken')).toBeNull();
  });
});
