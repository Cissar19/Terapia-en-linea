"use client";

import { useRef, useEffect } from "react";

interface ToolbarAction {
  label: string;
  title: string;
  icon: React.ReactNode;
  action: (textarea: HTMLTextAreaElement) => { value: string; selectionStart: number; selectionEnd: number };
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = before + (selected || "texto") + after;
  const newValue =
    textarea.value.substring(0, start) +
    replacement +
    textarea.value.substring(end);
  const newCursor = selected
    ? start + replacement.length
    : start + before.length + "texto".length;
  return {
    value: newValue,
    selectionStart: selected ? start + before.length : start + before.length,
    selectionEnd: selected ? start + before.length + selected.length : start + before.length + "texto".length,
  };
}

function prefixLines(
  textarea: HTMLTextAreaElement,
  getPrefix: (lineIndex: number) => string
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const selected = textarea.value.substring(start, end) || "";
  const after = textarea.value.substring(end);

  // Find the start of the first selected line
  const lineStart = before.lastIndexOf("\n") + 1;
  const fullText = textarea.value;
  const linesBefore = fullText.substring(0, lineStart);
  const selectedBlock = fullText.substring(lineStart, end);
  const linesAfter = fullText.substring(end);

  const lines = selectedBlock.split("\n");
  const prefixed = lines.map((line, i) => {
    // If line already has the prefix pattern, remove it; otherwise add it
    const prefix = getPrefix(i);
    if (line.startsWith(prefix)) return line.substring(prefix.length);
    return prefix + line;
  });

  const newBlock = prefixed.join("\n");
  const newValue = linesBefore + newBlock + linesAfter;
  return {
    value: newValue,
    selectionStart: lineStart,
    selectionEnd: lineStart + newBlock.length,
  };
}

function insertAtCursor(textarea: HTMLTextAreaElement, text: string) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const newValue =
    textarea.value.substring(0, start) + text + textarea.value.substring(end);
  return {
    value: newValue,
    selectionStart: start + text.length,
    selectionEnd: start + text.length,
  };
}

const ACTIONS: ToolbarAction[] = [
  {
    label: "B",
    title: "Negrita (Ctrl+B)",
    icon: <span className="font-black text-sm">B</span>,
    action: (ta) => wrapSelection(ta, "**", "**"),
  },
  {
    label: "I",
    title: "Cursiva (Ctrl+I)",
    icon: <span className="italic text-sm font-semibold">I</span>,
    action: (ta) => wrapSelection(ta, "*", "*"),
  },
  {
    label: "ul",
    title: "Lista con viñetas",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        <circle cx="2" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="2" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="2" cy="14" r="1" fill="currentColor" stroke="none" />
        <circle cx="2" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    action: (ta) => prefixLines(ta, () => "- "),
  },
  {
    label: "ol",
    title: "Lista numerada",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
    action: (ta) => prefixLines(ta, (i) => `${i + 1}. `),
  },
  {
    label: "---",
    title: "Separador",
    icon: <span className="text-xs font-mono leading-none">—</span>,
    action: (ta) => insertAtCursor(ta, "\n---\n"),
  },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
}

export default function RichTextarea({
  value,
  onChange,
  placeholder = "Escribe aquí...",
  minRows = 4,
  className = "",
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [value]);

  function applyAction(action: ToolbarAction["action"]) {
    const ta = textareaRef.current;
    if (!ta) return;
    const result = action(ta);
    onChange(result.value);
    // Restore selection after React re-render
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "b" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      applyAction(ACTIONS[0].action);
    }
    if (e.key === "i" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      applyAction(ACTIONS[1].action);
    }
    // Auto-continue list on Enter
    if (e.key === "Enter") {
      const ta = e.currentTarget;
      const pos = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf("\n", pos - 1) + 1;
      const currentLine = ta.value.substring(lineStart, pos);
      const bulletMatch = currentLine.match(/^(- )/);
      const numberedMatch = currentLine.match(/^(\d+)\. /);
      if (bulletMatch && currentLine.trim() !== "-") {
        e.preventDefault();
        const result = insertAtCursor(ta, "\n- ");
        onChange(result.value);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(result.selectionStart, result.selectionEnd);
        });
      } else if (numberedMatch && currentLine.trim() !== `${numberedMatch[1]}.`) {
        e.preventDefault();
        const nextNum = parseInt(numberedMatch[1], 10) + 1;
        const result = insertAtCursor(ta, `\n${nextNum}. `);
        onChange(result.value);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(result.selectionStart, result.selectionEnd);
        });
      }
    }
  }

  return (
    <div className={`rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue/30 focus-within:border-blue transition-colors ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/80">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.title}
            onMouseDown={(e) => {
              e.preventDefault(); // don't blur textarea
              applyAction(action.action);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-foreground hover:shadow-sm transition-all"
          >
            {action.icon}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-gray-300 pr-1 hidden sm:block">
          **negrita** · *cursiva* · - lista
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={minRows}
        className="w-full px-4 py-3 text-sm text-foreground placeholder-gray-400 resize-none focus:outline-none bg-white font-mono leading-relaxed"
        style={{ minHeight: `${minRows * 1.75}rem` }}
      />
    </div>
  );
}
