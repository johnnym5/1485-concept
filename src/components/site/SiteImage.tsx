import Image from 'next/image';
import { siteImages, type SiteImageKey } from '@/lib/siteImages';

type SiteImageProps = {
  image: SiteImageKey;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  objectPosition?: string;
};

export default function SiteImage({
  image: imageKey,
  alt,
  sizes,
  priority = false,
  className = '',
  objectPosition,
}: SiteImageProps) {
  const image = siteImages[imageKey];
  const imageAlt = alt ?? image.alt;
  const sourceSet = image.smallSrc === image.largeSrc
    ? `${image.largeSrc} ${image.largeWidth}w`
    : `${image.smallSrc} ${image.smallWidth}w, ${image.largeSrc} ${image.largeWidth}w`;

  return (
    <picture className={`site-image relative block overflow-hidden ${className}`}>
      <source type="image/webp" srcSet={sourceSet} sizes={sizes} />
      <Image
        src={image.largeSrc}
        alt={imageAlt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
        className="h-full w-full object-cover"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </picture>
  );
}
