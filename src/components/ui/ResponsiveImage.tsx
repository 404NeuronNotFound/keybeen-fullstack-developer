import type { ImgHTMLAttributes } from 'react';
import { imageAttributes } from '../../utils/imageAssets';

export function ResponsiveImage({ src = '', sizes, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...imageAttributes(src, sizes)} loading="lazy" decoding="async" {...props} />;
}
