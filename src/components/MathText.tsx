import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

export function MathText({ text }: { text: string }) {
  if (!text) return null;

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
        if (part.type === "asy") {
          return null;
        }
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part.content}
          </span>
        );
      })}
    </span>
  );
}

type PartType = "block" | "inline" | "text" | "asy";
type Part = { type: PartType; content: string };

function splitMath(input: string): Part[] {
  const parts: Part[] = [];
  const regex =
    /\[asy\]([\s\S]*?)\[\/asy\]|\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\$([^$\n]+?)\$|\\\(([^)]*?)\\\)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: input.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      parts.push({ type: "asy", content: match[1] });
    } else if (match[2] !== undefined || match[3] !== undefined) {
      parts.push({ type: "block", content: match[2] ?? match[3] });
    } else {
      parts.push({ type: "inline", content: match[4] ?? match[5] ?? "" });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    parts.push({ type: "text", content: input.slice(lastIndex) });
  }

  return parts;
}
