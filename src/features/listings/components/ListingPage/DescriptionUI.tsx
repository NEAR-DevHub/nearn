import parse, { type HTMLReactParserOptions } from 'html-react-parser';
import { ChevronDown } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { domPurify } from '@/lib/domPurify';
import { cn } from '@/utils/cn';

interface Props {
  description?: string;
  showMoreHeight?: number;
}

export function DescriptionUI({ description, showMoreHeight }: Props) {
  const options: HTMLReactParserOptions = {
    replace: ({ name, children, attribs }: any) => {
      if (name === 'p' && (!children || children.length === 0)) {
        return <br />;
      }
      return { name, children, attribs };
    },
  };

  //to resolve a chain of hydration errors
  const [isMounted, setIsMounted] = useState(false);
  const [showMore, setShowMore] = useState(true);
  const [showCollapser, setShowCollapser] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const isNotMD = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkIfTruncationNeeded = useCallback(() => {
    if (!descriptionRef.current) return;
    const limitHeight = showMoreHeight || window.innerHeight / 2;

    const container = descriptionRef.current;

    // Check if content exceeds the height limit
    if (container.scrollHeight > limitHeight) {
      setShowCollapser(true);
      setShowMore(false);
    } else {
      setShowCollapser(false);
      setShowMore(true);
    }
  }, [showMoreHeight]);

  useEffect(() => {
    // Use a timeout to ensure the DOM has been updated
    const timer = setTimeout(() => {
      if (isNotMD || showMoreHeight) {
        checkIfTruncationNeeded();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [checkIfTruncationNeeded, isMounted, isNotMD, showMoreHeight]);

  if (!isMounted) {
    return null;
  }

  const height = showMoreHeight ? `${showMoreHeight}px` : `50vh`;

  return (
    <div
      className={cn(
        'w-full overflow-visible border-b border-slate-100 md:border-0',
        showMore && 'pb-4',
      )}
    >
      <div
        ref={descriptionRef}
        className="relative w-full overflow-visible rounded-xl bg-white"
      >
        <div
          className={cn(
            'relative transition-all duration-200',
            !showMore && 'overflow-hidden',
          )}
          style={{
            height: !showMore ? height : 'auto',
          }}
        >
          <div className="minimal-tiptap-editor tiptap ProseMirror h-full w-full overflow-visible !px-0 pb-7">
            <div className="tiptap ProseMirror listing-description !mt-0 !px-0">
              {parse(
                domPurify(
                  description?.startsWith('"')
                    ? JSON.parse(description || '')
                    : (description ?? ''),
                ),
                options,
              )}
            </div>
          </div>
          {/* Fade-out gradient overlay when truncated */}
          {!showMore && showCollapser && (
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"
              style={{ marginBottom: '-1px' }}
            />
          )}
        </div>
        {showCollapser && (
          <Button
            className={cn(
              'absolute -bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-md border-slate-300 bg-white font-medium text-slate-500',
              showMore && '-bottom-8',
            )}
            onClick={() => setShowMore(!showMore)}
            size="sm"
            variant="outline"
          >
            Read {showMore ? 'Less' : 'More'}
            <ChevronDown
              className={`ml-2 h-5 w-5 text-slate-300 transition-transform duration-200 ${
                showMore ? 'rotate-180' : ''
              }`}
            />
          </Button>
        )}
      </div>
    </div>
  );
}
