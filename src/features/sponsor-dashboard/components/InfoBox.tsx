import parse, {
  domToReact,
  type HTMLReactParserOptions,
} from 'html-react-parser';

import { LinkTextParser } from '@/components/shared/LinkTextParser';
import { domPurify } from '@/lib/domPurify';
import { cn } from '@/utils/cn';

const options: HTMLReactParserOptions = {
  replace: ({ name, children, attribs }: any) => {
    if (name === 'p' && (!children || children.length === 0)) {
      return <br />;
    }
    return { name, children, attribs };
  },
};

export const tableOptions: HTMLReactParserOptions = {
  replace: (node: any) => {
    const { name, children } = node ?? {};

    if (name === 'p' && (!children || children.length === 0)) {
      return <br />;
    }

    // Render <a> tags as plain text so they are not clickable (useful for titles / table headers).
    if (name === 'a') {
      return <span>{domToReact(children, options)}</span>;
    }

    return undefined; // use default rendering for other nodes
  },
};

export function parseHtml(
  content: string,
  parseOptions: HTMLReactParserOptions = options,
) {
  return parse(domPurify(content) || '', parseOptions);
}

export const InfoBox = ({
  label,
  content,
  isHtml = false,
  className,
  contentClassName,
}: {
  label?: string | null;
  content?: string | null;
  isHtml?: boolean;
  className?: string;
  contentClassName?: string;
}) => (
  <div className={cn('mb-4', className)}>
    {label && (
      <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
        {label}
      </p>
    )}
    {isHtml ? (
      <div
        id="reset-des"
        className={cn('h-full w-full overflow-visible', contentClassName)}
      >
        {parseHtml(content || '', options)}
      </div>
    ) : (
      <LinkTextParser text={content || ''} />
    )}
  </div>
);
