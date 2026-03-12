import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * Renders a string that may contain LaTeX math:
 *   - Block math:  $$...$$ or \[...\]
 *   - Inline math: $...$ or \(...\)
 * Plain text between math is rendered normally.
 */
export function MathText({ text }: { text: string }) {
  if (!text) return null;

  // Split on block math first ($$...$$), then inline ($...$)
  const parts = splitMath(text);

  return (
    <span className="math-text leading-relaxed">
      {parts.map((part, i) => {
        if (part.type === "block") {
          return (
            <span key={i} className="block my-3 overflow-x-auto">
              <BlockMath math={part.content} />
            </span>
          );
        }
        if (part.type === "inline") {
          return <InlineMath key={i} math={part.content} />;
        }
        // Plain text — preserve newlines
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part.content}
          </span>
        );
      })}
    </span>
  );
}

type Part = { type: "block" | "inline" | "text"; content: string };

function splitMath(input: string): Part[] {
  const parts: Part[] = [];
  // Regex: match $$...$$ (block), \[...\] (block), $...$ (inline), \(...\) (inline)
  const regex = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\$([^$\n]+?)\$|\\\(([^)]*?)\\\)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    // Push plain text before this match
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: input.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined || match[2] !== undefined) {
      // Block math
      parts.push({ type: "block", content: match[1] ?? match[2] });
    } else {
      // Inline math
      parts.push({ type: "inline", content: match[3] ?? match[4] ?? "" });
    }

    lastIndex = regex.lastIndex;
  }

  // Push remaining plain text
  if (lastIndex < input.length) {
    parts.push({ type: "text", content: input.slice(lastIndex) });
  }

  return parts;
}
