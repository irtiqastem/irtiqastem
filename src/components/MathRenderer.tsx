import { useEffect, useRef } from "react";

interface Props {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = content;
    if ((window as any).MathJax) {
      (window as any).MathJax.typesetPromise([ref.current]).catch(() => {});
    }
  }, [content]);

  return <div ref={ref} className={className} />;
}
