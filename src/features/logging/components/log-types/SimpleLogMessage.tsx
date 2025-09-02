import { domToReact, type HTMLReactParserOptions } from 'html-react-parser';

import { cn } from '@/utils/cn';

import { parseHtml } from '@/features/sponsor-dashboard/components/InfoBox';

interface SimpleLogMessageProps {
  message: string;
}

const options: HTMLReactParserOptions = {
  replace: ({ name, children, attribs }: any) => {
    if (name === 'p' && (!children || children.length === 0)) {
      return <br />;
    }

    if (name === 'a') {
      return (
        <a
          href={attribs.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex gap-1 text-slate-900 no-underline"
        >
          {domToReact(children, options)}
        </a>
      );
    }

    return { name, children, attribs };
  },
};

export default function SimpleLogMessage({ message }: SimpleLogMessageProps) {
  return (
    <div className={cn('text-slate-500')}>
      {parseHtml(message || '', options)}
    </div>
  );
}
