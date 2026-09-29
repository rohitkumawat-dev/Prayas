import React from 'react';

/**
 * Small dependency-free renderer for lesson theory written in Markdown.
 * Supports: headings (# ## ###), paragraphs, bullet/numbered lists, tables,
 * fenced code blocks, blockquotes, **bold**, *italic*, `inline code`, links.
 * The page already renders one <h1> (the lesson title), so "# " is demoted to <h2>.
 */

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (tok.startsWith('`')) {
      nodes.push(<code key={key} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-[13px] font-mono">{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith('**')) {
      nodes.push(<strong key={key} className="font-semibold text-slate-100">{renderInline(tok.slice(2, -2), key)}</strong>);
    } else if (tok.startsWith('*')) {
      nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
    } else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      if (lm) nodes.push(<a key={key} href={lm[2]} target="_blank" rel="noopener noreferrer" className="text-violet-400 underline hover:text-violet-300">{lm[1]}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const splitRow = (row: string) =>
  row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

export function LessonContent({ content }: { content: string }) {
  const lines = (content || '').replace(/\r\n/g, '\n').split('\n');
  const out: React.ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++; }
      i++; // closing fence
      out.push(
        <div key={k++} className="my-4 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
          {lang && <div className="px-4 py-1.5 text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900 border-b border-slate-800">{lang}</div>}
          <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-slate-200"><code>{code.join('\n')}</code></pre>
        </div>
      );
      continue;
    }

    // table
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') { rows.push(splitRow(lines[i])); i++; }
      out.push(
        <div key={k++} className="my-4 overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900 text-slate-300">
              <tr>{header.map((h, hi) => <th key={hi} className="px-4 py-2 font-semibold border-b border-slate-800">{renderInline(h, `th${k}-${hi}`)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-b border-slate-800/60 last:border-0">
                  {r.map((c, ci) => <td key={ci} className="px-4 py-2 text-slate-300 align-top">{renderInline(c, `td${k}-${ri}-${ci}`)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // headings (page already has an <h1>, so # -> h2)
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const text = renderInline(h[2], `h${k}`);
      if (level === 1) out.push(<h2 key={k++} className="text-2xl font-bold text-slate-100 mt-8 mb-4">{text}</h2>);
      else if (level === 2) out.push(<h3 key={k++} className="text-xl font-semibold text-slate-100 mt-8 mb-3">{text}</h3>);
      else out.push(<h4 key={k++} className="text-lg font-medium text-slate-200 mt-5 mb-2">{text}</h4>);
      i++;
      continue;
    }

    // blockquote (key takeaway)
    if (line.startsWith('>')) {
      const q: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(
        <blockquote key={k++} className="my-6 border-l-4 border-violet-500 bg-violet-500/10 rounded-r-lg px-4 py-3 text-slate-200">
          {renderInline(q.join(' '), `bq${k}`)}
        </blockquote>
      );
      continue;
    }

    // lists
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      out.push(<ul key={k++} className="my-3 ml-5 list-disc space-y-1.5 text-slate-300">{items.map((t, ti) => <li key={ti}>{renderInline(t, `li${k}-${ti}`)}</li>)}</ul>);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      out.push(<ol key={k++} className="my-3 ml-5 list-decimal space-y-1.5 text-slate-300">{items.map((t, ti) => <li key={ti}>{renderInline(t, `oi${k}-${ti}`)}</li>)}</ol>);
      continue;
    }

    if (line.trim() === '') { i++; continue; }

    // paragraph (merge consecutive text lines)
    const para: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,3}\s|>|```|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i]) && !(lines[i].includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1]))) {
      para.push(lines[i]); i++;
    }
    out.push(<p key={k++} className="my-3 text-slate-300 leading-relaxed">{renderInline(para.join(' '), `p${k}`)}</p>);
  }

  return <div className="text-[15px]">{out}</div>;
}

export default LessonContent;
