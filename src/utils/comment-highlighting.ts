const HIGHLIGHT_CLASSES = [
  'bg-slate-100',
  'border-l-4',
  'border-slate-300',
  'pl-3',
  '-ml-3',
  'rounded-md',
  'transition-all',
  'duration-300',
] as const;

/**
 * Scrolls to and highlights a comment element
 */
export const scrollToAndHighlightComment = (element: HTMLElement): void => {
  // Check if comment is inside collapsed replies and expand if needed
  const repliesContainer = element.closest('[data-replies-container]');
  if (repliesContainer?.classList.contains('hidden')) {
    const showRepliesButton = repliesContainer.parentElement?.querySelector(
      '[data-show-replies-button]',
    );
    if (showRepliesButton instanceof HTMLElement) {
      showRepliesButton.click();
      setTimeout(() => scrollToAndHighlightComment(element), 300);
      return;
    }
  }

  // Scroll to comment
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });

  // Add highlight
  element.classList.add(...HIGHLIGHT_CLASSES);

  // Remove highlight after 4 seconds
  setTimeout(() => {
    element.classList.remove(...HIGHLIGHT_CLASSES);
  }, 4000);
};

/**
 * Sets up comment linking for a page
 */
export const setupCommentLinking = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const hash = window.location.hash;
  if (!hash.startsWith('#comment-')) return () => {};

  const commentId = hash.substring('#comment-'.length);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const targetComment =
              element.id === `comment-${commentId}`
                ? element
                : element.querySelector(`#comment-${commentId}`);

            if (targetComment) {
              observer.disconnect();
              setTimeout(
                () => scrollToAndHighlightComment(targetComment as HTMLElement),
                100,
              );
              return;
            }
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Try immediate check
  setTimeout(() => {
    const commentElement = document.getElementById(`comment-${commentId}`);
    if (commentElement) {
      observer.disconnect();
      scrollToAndHighlightComment(commentElement);
    } else {
      // Stop observing after 10 seconds
      setTimeout(() => observer.disconnect(), 10000);
    }
  }, 100);

  return () => observer.disconnect();
};
