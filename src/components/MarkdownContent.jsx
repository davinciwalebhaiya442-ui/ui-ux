'use client';

import React from 'react';
import Link from 'next/link';

function renderInline(text) {
  if (!text) return null;

  // Split by inline markdown: **bold**, `code`, [link](url)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="text-[11px] font-mono bg-white/[0.08] text-blue-300 px-1.5 py-0.5 rounded border border-white/[0.06]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const [, label, href] = match;
        const isExternal = href.startsWith('http');
        if (isExternal) {
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
              {label}
            </a>
          );
        }
        return (
          <Link
            key={index}
            href={href}
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
          >
            {label}
          </Link>
        );
      }
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export default function MarkdownContent({ content = '', className = '' }) {
  if (!content) return null;

  // Normalize line endings
  const rawLines = content.replace(/\r\n/g, '\n').split('\n');

  const elements = [];
  let currentList = [];
  let currentListType = null; // 'ul' | 'ol'

  const flushList = () => {
    if (currentList.length > 0) {
      if (currentListType === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-5 space-y-1.5 text-slate-300 text-xs sm:text-sm my-3 font-sans">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs sm:text-sm my-3 font-sans">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
      }
      currentList = [];
      currentListType = null;
    }
  };

  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      i++;
      continue;
    }

    // Heading 1
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-bold text-white tracking-tight pt-6 pb-2 border-b border-white/[0.08]">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-bold text-white tracking-tight pt-6 pb-2 border-b border-white/[0.08]">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm sm:text-base font-semibold text-blue-300 pt-4 pb-1">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <div key={`quote-${i}`} className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs sm:text-sm text-blue-200 space-y-1 my-4 font-sans">
          {renderInline(trimmed.slice(2))}
        </div>
      );
      i++;
      continue;
    }

    // Unordered List (- or *)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (currentListType && currentListType !== 'ul') flushList();
      currentListType = 'ul';
      currentList.push(ulMatch[1]);
      i++;
      continue;
    }

    // Ordered List (1. ...)
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (currentListType && currentListType !== 'ol') flushList();
      currentListType = 'ol';
      currentList.push(olMatch[1]);
      i++;
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-2 font-sans">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  flushList();

  return <div className={`space-y-4 ${className}`}>{elements}</div>;
}
