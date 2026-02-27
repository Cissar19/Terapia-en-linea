/**
 * Compress and resize an image file to a base64 JPEG string.
 * Target: 200x200 avatar at 0.8 quality → typically 10-30 KB.
 */
export function compressImageToBase64(
  file: File,
  maxSize = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate dimensions keeping aspect ratio, cropping to square
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = maxSize;
      canvas.height = maxSize;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, sx, sy, min, min, 0, 0, maxSize, maxSize);

      const base64 = canvas.toDataURL("image/jpeg", 0.8);
      resolve(base64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Error al cargar la imagen"));
    };

    img.src = url;
  });
}
