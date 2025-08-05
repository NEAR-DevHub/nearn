interface SimpleLogMessageProps {
  message: string;
}

export default function SimpleLogMessage({ message }: SimpleLogMessageProps) {
  return (
    <p className="inline-flex items-center gap-1 text-slate-500">{message}</p>
  );
}
