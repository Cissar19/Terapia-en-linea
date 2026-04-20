import React from "react";

interface Props {
  content: string;
  className?: string;
}

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[0].startsWith("**")) {
      parts.push(<strong key={`${keyPrefix}-${match.index}`}>{match[2]}</strong>);
    } else {
      parts.push(<em key={`${keyPrefix}-${match.index}`}>{match[3]}</em>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts.length > 0 ? parts : [text];
}

export default function MarkdownContent({ content, className = "" }: Props) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "---") {
      elements.push(<hr key={i} className="border-gray-200 my-1" />);
      i++;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: React.ReactNode[] = [];
      const startI = i;
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(
          <li key={i}>{parseInline(lines[i].slice(2), `ul-${i}`)}</li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${startI}`} className="list-disc list-inside space-y-0.5">
          {items}
        </ul>
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = [];
      const startI = i;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const text = lines[i].replace(/^\d+\. /, "");
        items.push(
          <li key={i}>{parseInline(text, `ol-${i}`)}</li>
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${startI}`} className="list-decimal list-inside space-y-0.5">
          {items}
        </ol>
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    elements.push(<p key={i}>{parseInline(line, `p-${i}`)}</p>);
    i++;
  }

  return (
    <div className={`space-y-1 leading-relaxed ${className}`}>
      {elements}
    </div>
  );
}
