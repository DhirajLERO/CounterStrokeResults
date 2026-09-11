/** Map 8-bit grayscale heat to a teal–amber ramp. */
export function heatColor(t: number, alpha = 1): [number, number, number, number] {
  const x = Math.min(1, Math.max(0, t));
  const r = Math.round(14 + x * (200 - 14));
  const g = Math.round(107 + x * (80 - 107));
  const b = Math.round(92 + x * (40 - 92));
  return [r, g, b, Math.round(alpha * 255)];
}

export function colorizeHeat(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
): ImageData {
  const out = new ImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    const t = gray[i] / 255;
    const [r, g, b, a] = heatColor(t, intensity * t);
    const j = i * 4;
    out.data[j] = r;
    out.data[j + 1] = g;
    out.data[j + 2] = b;
    out.data[j + 3] = a;
  }
  return out;
}

export async function loadGrayPng(url: string): Promise<{ data: Uint8ClampedArray; w: number; h: number } | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(url));
      img.src = url;
    });
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    const id = ctx.getImageData(0, 0, c.width, c.height);
    const gray = new Uint8ClampedArray(c.width * c.height);
    for (let i = 0; i < gray.length; i++) gray[i] = id.data[i * 4];
    return { data: gray, w: c.width, h: c.height };
  } catch {
    return null;
  }
}
