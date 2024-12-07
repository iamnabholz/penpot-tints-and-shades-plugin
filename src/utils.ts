export const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.replace(/^#/, ''), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

export const rgbToHex = (r: number, g: number, b: number) => {
  // Ensure RGB values are integers and within the valid range
  r = Math.round(r);
  g = Math.round(g);
  b = Math.round(b);

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export const getContrast = (hexColor: string): string => {
  // Convert hex to RGB
  const rgb = hexToRgb(hexColor);

  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);

  // Return black or white based on luminance
  return luminance >= 128 ? '#000000' : '#FFFFFF';
}