import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { ASSET_URL } from '@/constants/ASSET_URL';
import { ogImageQuery } from '@/queries/og';
import { cn } from '@/utils';

interface Props {
  title?: string;
  showTitle?: boolean;
  externalUrl?: string;
  imageUrl?: string;
  id?: string;
  type?: 'submission' | 'pow';
  className?: string;
}

const getRandomFallbackImage = (): string => {
  const basePath = ASSET_URL + '/fallback/og';
  const fallbackImages = Array.from(
    { length: 11 },
    (_, i) => `${basePath}/${i + 1}.webp`,
  );

  const randomIndex = Math.floor(Math.random() * fallbackImages.length);
  return fallbackImages[randomIndex]!;
};

export const OgImageViewer = ({
  title,
  showTitle,
  externalUrl,
  imageUrl,
  type,
  id,
  className,
}: Props) => {
  const fallbackImage = getRandomFallbackImage();
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    imageUrl || null,
  );

  const { data: ogData, isLoading } = useQuery(ogImageQuery(externalUrl!));

  useEffect(() => {
    const updateOgImage = async () => {
      if (ogData?.images?.[0]?.url && type && id) {
        try {
          await axios.post('/api/og/update', {
            type,
            url: ogData.images[0].url,
            id,
          });
          setCurrentImageUrl(ogData.images[0].url);
        } catch (error) {
          await axios.post('/api/og/update', {
            type,
            url: 'error',
            id,
          });
          setCurrentImageUrl(fallbackImage);
        }
      } else if (!imageUrl && !externalUrl) {
        setCurrentImageUrl(fallbackImage);
      }
    };

    if (!currentImageUrl) {
      updateOgImage();
    } else if (currentImageUrl === 'error') {
      setCurrentImageUrl(fallbackImage);
    }
  }, [ogData, imageUrl, externalUrl, type, id, fallbackImage]);

  const handleImageError = useCallback(() => {
    setCurrentImageUrl(fallbackImage);
  }, [fallbackImage]);

  if (isLoading) {
    return <Skeleton className={className} />;
  }

  return (
    <div>
      <img
        className={cn('bg-center', className)}
        alt="OG Image"
        onError={handleImageError}
        src={currentImageUrl || fallbackImage}
      />
      {showTitle && (
        <p className="truncate pt-2 text-sm text-slate-500">
          {title || ogData?.title || ''}
        </p>
      )}
    </div>
  );
};
