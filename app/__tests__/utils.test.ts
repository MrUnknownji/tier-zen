// app/__tests__/utils.test.ts
import { generateId, getContrastingTextColor, escapeXml } from '../utils';

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('should generate a string ID', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('should start with "id_"', () => {
      expect(generateId()).toMatch(/^id_/);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('getContrastingTextColor', () => {
    it('should return black for light backgrounds', () => {
      expect(getContrastingTextColor('#FFFFFF')).toBe('#000000'); // White
      expect(getContrastingTextColor('#FFF')).toBe('#000000');    // White (short)
      expect(getContrastingTextColor('#ABEBC6')).toBe('#000000'); // Light Green
    });

    it('should return white for dark backgrounds', () => {
      expect(getContrastingTextColor('#000000')).toBe('#FFFFFF'); // Black
      expect(getContrastingTextColor('#000')).toBe('#FFFFFF');    // Black (short)
      expect(getContrastingTextColor('#C0392B')).toBe('#FFFFFF'); // Dark Red
      expect(getContrastingTextColor('#273746')).toBe('#FFFFFF'); // Dark Blue/Grey
    });

    it('should handle undefined or empty input', () => {
      expect(getContrastingTextColor(undefined)).toBe('#000000');
      expect(getContrastingTextColor('')).toBe('#000000');
    });
    
    it('should handle invalid hex colors and default to black', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(getContrastingTextColor('#12345')).toBe('#000000'); 
      expect(getContrastingTextColor('blue')).toBe('#000000');   
      expect(getContrastingTextColor('#XYZ')).toBe('#000000');    
      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
      consoleWarnSpy.mockRestore();
    });
  });

  describe('escapeXml', () => {
    it('should escape special XML characters', () => {
      // Corrected line: 'more\'s'
      expect(escapeXml('<tag attr="value">text & more\'s</tag>'))
        .toBe('&lt;tag attr=&quot;value&quot;&gt;text &amp; more&apos;s&lt;/tag&gt;');
    });

    it('should return empty string for non-string input', () => {
      expect(escapeXml(null as any)).toBe('');
      expect(escapeXml(undefined as any)).toBe('');
      expect(escapeXml(123 as any)).toBe('');
    });

    it('should return the same string if no special characters are present', () => {
      expect(escapeXml('Simple text with no special chars.')).toBe('Simple text with no special chars.');
    });

    it('should handle empty string input', () => {
      expect(escapeXml('')).toBe('');
    });
  });
});
