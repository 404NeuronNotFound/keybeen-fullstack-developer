import { IMAGE_ASSETS } from '../data/imageManifest';

export function imageAttributes(src: string, sizes = '100vw') {
  const variants = IMAGE_ASSETS[src as keyof typeof IMAGE_ASSETS];
  if (!variants) return { src };
  const largest = variants.at(-1)!;
  return {
    src: largest.src,
    srcSet: variants.map(image => `${image.src} ${image.width}w`).join(', '),
    sizes,
    width: largest.width,
    height: largest.height,
  };
}
