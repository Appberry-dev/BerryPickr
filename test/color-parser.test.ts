import { describe, expect, test } from 'vitest';
import { parseColor } from '../src/core/color';

describe('parseColor', () => {
    test('parses css4 rgb/hsl space syntax', () => {
        expect(parseColor('rgb(255 0 0 / 50%)')?.to('hexa')).toBe('#FF000080');
        expect(parseColor('rgb(10% 20% 30% / 0.5)')?.to('hexa')).toBe('#1A334D80');
        expect(parseColor('hsl(210 40% 50% / 0.5)')).not.toBeNull();
        expect(parseColor('hsl(0.5turn 40% 50%)')).not.toBeNull();
    });

    test('rejects malformed syntax', () => {
        expect(parseColor('rgb(255, 0 0)')).toBeNull();
        expect(parseColor('rgb(255 0 0 / nope)')).toBeNull();
        expect(parseColor('rgba(255, 0, 0)')).toBeNull();
        expect(parseColor('rgb(255, 0, 0, 0.5)')).toBeNull();
        expect(parseColor('hsl(210 40%)')).toBeNull();
        expect(parseColor('cmyk(0, 0, 0)')).toBeNull();
        expect(parseColor('rgb(255 0 0 / 1 0)')).toBeNull();
    });

    test('clamps out of range values', () => {
        expect(parseColor('rgba(300, -10, 20, 1.4)')?.to('rgba')).toBe('rgba(255, 0, 20, 1)');
        expect(parseColor('hsl(390, 120%, -10%)')?.to('hsla')).toBe('hsla(30, 0%, 0%, 1)');
    });

    test('respects lockAlpha during parsing', () => {
        expect(parseColor('rgb(0 0 0 / 0.2)', { lockAlpha: true })?.to('hexa')).toBe('#000000FF');
    });
});
