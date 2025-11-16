export function getColorWithOpacity(color: string, opacity: number): string {
    const a = Math.round(255*(opacity/100))
    const hexa = a.toString(16)

    return color.slice(0, 7) + (hexa.length < 2 ? '0' + hexa : hexa)
}

export function hexToHSL(hex: string) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Find min and max
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  // Calculate lightness
  let h = 0, s, l = (max + min) / 2;
  
  if (diff === 0) {
    h = s = 0; // achromatic (gray)
  } else {
    // Calculate saturation
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    // Calculate hue
    switch (max) {
      case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / diff + 2) / 6; break;
      case b: h = ((r - g) / diff + 4) / 6; break;
    }
  }
  
  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return { h, s, l };
}