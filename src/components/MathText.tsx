import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

export function MathText({ text }: { text: string }) {
  if (!text) return null;

  let cleaned = text.replace(/\[asy\][\s\S]*?\[\/asy\]/g, "");

  cleaned = cleaned.replace(
    /(\\begin\{[a-z*]+\}[\s\S]*?\\end\{[a-z*]+\})/g,
    "$$\n$1\n$$"
  );

  const parts = splitMath(cleaned);

  return (
    <span className="math-text leading-relaxed">
      {parts.map((part, i) => {
        if (part.type === "block") {
          return (
            <span key={i} className="block my-4 overflow-x-auto text-center">
              <BlockMath math={part.content} />
            </span>
          );
        }
        if (part.type === "inline") {
          return <InlineMath key={i} math={part.content} />;
        }
        return (
          <span key={i}>
            {part.content.split("\n").map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

type Part = { type: "block" | "inline" | "text"; content: string };

function splitMath(input: string): Part[] {
  const parts: Part[] = [];
  const regex =
    /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\$([^$\n]+?)\$|\\\(([^)]*?)\\\)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: input.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined || match[2] !== undefined) {
      parts.push({ type: "block", content: match[1] ?? match[2] });
    } else {
      parts.push({ type: "inline", content: match[3] ?? match[4] ?? "" });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    parts.push({ type: "text", content: input.slice(lastIndex) });
  }

  return parts;
}
