'use client';

import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { normalizeMarkdown } from './normalize-markdown';

// Hoisted to module scope so the reference is stable across renders. Passing a
// fresh `components`/`remarkPlugins` object on every render defeats memoization
// and forces react-markdown to re-parse the whole AST each time.
const REMARK_PLUGINS = [remarkGfm];

export const messageMarkdownComponents: Components = {
  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
  ul: ({ className, children, ...props }) => (
    <ul {...props} className={cn('list-disc pl-4 mb-1 space-y-1', className)}>
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }) => (
    <ol {...props} className={cn('list-decimal pl-4 mb-1 space-y-1', className)}>
      {children}
    </ol>
  ),
  li: ({ className, children, ...props }) => (
    <li {...props} className={cn(className)}>
      {children}
    </li>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <p className="font-semibold mb-2">{children}</p>,
  h2: ({ children }) => <p className="font-semibold mb-2">{children}</p>,
  h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
  code: ({ children }) => (
    <code className="px-1 py-0.5 rounded bg-gray-200">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="p-2 rounded-lg overflow-x-auto my-2 bg-[#EDEBE5]">{children}</pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-blue-600"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full border-collapse border border-gray-300">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-[#EDEBE5]">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
  th: ({ children }) => (
    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-3 py-2">{children}</td>
  ),
};

interface MarkdownContentProps {
  text: string;
  /**
   * Custom renderers. Pass a module-level constant (e.g.
   * `messageMarkdownComponents`) — an inline object will break memoization.
   */
  components?: Components;
}

function MarkdownContentImpl({ text, components }: MarkdownContentProps) {
  return (
    <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={components}>
      {normalizeMarkdown(text)}
    </ReactMarkdown>
  );
}

/**
 * Memoized markdown renderer. Markdown parsing (markdown -> mdast -> hast ->
 * React) is the single most expensive thing a message bubble does; memoizing
 * on the raw text keeps unrelated parent re-renders (scroll state, feedback
 * toggles, etc.) from re-parsing every message in the thread.
 */
export const MarkdownContent = memo(MarkdownContentImpl);
