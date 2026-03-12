import { useEffect, useRef } from "react";

interface Props {
  content: string;
  className?: string;
}

declare global {
  interface Window {
    MathJax: any;
  }
}

export function MathRenderer({ content, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = content;

    const render = () => {
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise([ref.current]).catch(() => {});
      }
    };

    if (window.MathJax?.typesetPromise) {
      render();
    } else {
      // Wait for MathJax to load
      const interval = setInterval(() => {
        if (window.MathJax?.typesetPromise) {
          clearInterval(interval);
          render();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [content]);

  return <div ref={ref} className={className} />;
}
