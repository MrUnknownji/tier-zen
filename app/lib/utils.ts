export const generateId = () =>
  `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const getContrastingTextColor = (hexColor?: string): string => {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6 && hex.length !== 3) return "#000000";
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.substring(0, 1).repeat(2), 16);
    g = parseInt(hex.substring(1, 2).repeat(2), 16);
    b = parseInt(hex.substring(2, 3).repeat(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};
