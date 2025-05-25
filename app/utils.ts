// app/utils.ts

export const generateId = (): string => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const getContrastingTextColor = (hexColor?: string): string => {
  if (!hexColor) return "#000000"; // Default to black for undefined/empty input
  const hex = hexColor.replace("#", "");
  if (!/^(?:[0-9a-fA-F]{3}){1,2}$/.test(hex)) { // Validate hex string
      console.warn(`Invalid hex color "${hexColor}" provided to getContrastingTextColor. Defaulting to black.`);
      return "#000000";
  }

  let r: number, g: number, b: number;
  if (hex.length === 3) {
    r = parseInt(hex.substring(0, 1).repeat(2), 16);
    g = parseInt(hex.substring(1, 2).repeat(2), 16);
    b = parseInt(hex.substring(2, 3).repeat(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // Formula for luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#FFFFFF"; // Return black for light backgrounds, white for dark
};

export const escapeXml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') {
    // Handle non-string inputs gracefully, e.g., by returning them as is or an empty string
    // For XML content, this is crucial as attributes/text nodes must be strings.
    return ''; 
  }
  return unsafe.replace(/[<>&"']/g, (match) => {
    switch (match) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case '"': return "&quot;";
      case "'": return "&apos;";
      default: return match; // Should not happen with the current regex
    }
  });
};
