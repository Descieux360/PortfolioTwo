import React, { useMemo, useState } from 'react';
import { Folder, FolderOpen, File, Lock, Code2, ChevronDown, Loader2, ExternalLink } from 'lucide-react';

/* ==========================================================================
   Syntax highlighting
   --------------------------------------------------------------------------
   A tiny, dependency-free tokenizer. It emits spans with `tok-*` classes;
   the colours live in syntax-theme.css so they follow your site tokens and
   the light/dark switch. It is not a full parser — it aims to look right
   for typical project files, and falls back to plain text for anything it
   doesn't know.
   ========================================================================== */

const MAX_HIGHLIGHT_CHARS = 100000; // bigger files (e.g. lockfiles) render as plain text

const words = (s) => new Set(s.split(/\s+/).filter(Boolean));

const EXT_TO_LANG = {
  js: 'js', jsx: 'js', mjs: 'ts', cjs: 'ts', ts: 'ts', tsx: 'tsx',
  json: 'json', jsonc: 'json',
  css: 'css', scss: 'css', sass: 'css', less: 'css',
  html: 'markup', htm: 'markup', xml: 'markup', svg: 'markup',
  vue: 'markup', svelte: 'markup', astro: 'markup',
  py: 'py',
  yml: 'hash', yaml: 'hash', toml: 'hash', ini: 'hash', cfg: 'hash', conf: 'hash', env: 'hash',
  sh: 'hash', bash: 'hash', zsh: 'hash', fish: 'hash', ps1: 'hash', rb: 'hash',
  go: 'clike', rs: 'clike', java: 'clike', kt: 'clike', kts: 'clike', c: 'clike', h: 'clike',
  cc: 'clike', cpp: 'clike', hpp: 'clike', cs: 'clike', php: 'clike', swift: 'clike',
};

function getLang(path = '') {
  const name = path.split('/').pop().toLowerCase();
  if (['dockerfile', 'makefile', 'procfile'].includes(name)) return 'hash';
  if (name.startsWith('.env')) return 'hash';
  if (name.startsWith('.') && !name.slice(1).includes('.')) return 'hash';
  const ext = name.includes('.') ? name.split('.').pop() : '';
  return EXT_TO_LANG[ext] || 'plain';
}

/* ---------- word lists ---------- */

const JS_KEYWORDS = words(`
  as async await break case catch class const continue debugger default delete do else enum
  export extends finally for from function get if implements import in instanceof interface let
  new of package private protected public readonly return set static switch throw try type
  typeof var void while with yield abstract declare namespace satisfies keyof
`);
const PY_KEYWORDS = words(`
  and as assert async await break class continue def del elif else except finally for from
  global if import in is lambda nonlocal not or pass raise return try while with yield
`);
const CLIKE_KEYWORDS = words(`
  abstract as async await break case catch class const continue default defer do else enum
  export extends final finally fn for func function if impl import in interface let loop match
  mod mut namespace new override package private protected pub public return static struct
  switch throw trait try type typedef typeof unsafe use using var virtual void while yield
`);

// Words that are only keywords when followed by something keyword-like (`type Foo`, `from 'x'`),
// so `entry.type` or `{ type: 'tree' }` don't light up.
const CONTEXTUAL = words('as from of type get set readonly declare namespace satisfies keyof abstract');

const JS_CONSTANTS = words('true false null undefined NaN Infinity');
const PY_CONSTANTS = words('True False None');
const CLIKE_CONSTANTS = words('true false null nil NULL None');

const JS_BUILTINS = words(`
  this super console window document navigator localStorage sessionStorage globalThis process
  module exports require Math JSON Object Array Promise Set Map WeakMap WeakSet String Number
  Boolean Date Error RegExp Symbol Intl URL
`);
const PY_BUILTINS = words('self cls');
const CLIKE_BUILTINS = words('this self super');

const TYPE_WORDS = words(`
  string number boolean any unknown never object bigint symbol int float double char bool byte
  long short u8 u16 u32 u64 usize i8 i16 i32 i64 isize f32 f64 str
`);
const NONE = new Set();

const CLASS_INTRO = words('class extends implements new interface enum instanceof');
const DECL_INTRO = words('const let var val');
const FUNC_INTRO = words('function def fn func');

// Tokens after which a `<` starts JSX rather than being a comparison / generic.
const JSX_PREV = words('( { [ , = : ? && || ?? => return ! ;');
JSX_PREV.add('');

/* ---------- regexes (all sticky) ---------- */

const C_COMMENT = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y;
const HASH_COMMENT = /#[^\n]*/y;
const STR_C = /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\[\s\S])*`?/y;
const STR_PY = /[fFrRbBuU]{0,2}(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)/y;

const R = {
  ws: /\s+/y,
  ident: /[A-Za-z_$][\w$]*/y,
  number: /0[xX][\da-fA-F_]+n?|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.\d[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?n?/y,
  operator: /=>|\.\.\.|\?\?=?|\?\.(?!\d)|&&=?|\|\|=?|[!=]==|[<>!=]=|\+\+|--|<<=?|>>>?=?|\*\*=?|[+\-*/%&|^]=?|[~!?:=<>]/y,
  punct: /[()\[\];,.]/y,
  decorator: /@[A-Za-z_][\w.]*/y,
  fnAssign: /\s*=\s*(?:async\s*)?(?:function\b|\([^()]*\)\s*=>|[\w$]+\s*=>)/y,
  jsxOpen: /<(?=[A-Za-z>])([A-Za-z][\w.]*)?/y,
  jsxClose: /(<\/)([A-Za-z][\w.]*)?(\s*>)/y,
  jsxText: /[^<{]+/y,
  jsxAttr: /[\w:.-]+/y,
};

const SCRIPT = {
  js: {
    keywords: JS_KEYWORDS, constants: JS_CONSTANTS, builtins: JS_BUILTINS, types: NONE,
    comment: C_COMMENT, string: STR_C, jsx: true, decorators: false,
  },
  ts: {
    keywords: JS_KEYWORDS, constants: JS_CONSTANTS, builtins: JS_BUILTINS, types: TYPE_WORDS,
    comment: C_COMMENT, string: STR_C, jsx: false, decorators: true,
  },
  tsx: {
    keywords: JS_KEYWORDS, constants: JS_CONSTANTS, builtins: JS_BUILTINS, types: TYPE_WORDS,
    comment: C_COMMENT, string: STR_C, jsx: true, decorators: true,
  },
  py: {
    keywords: PY_KEYWORDS, constants: PY_CONSTANTS, builtins: PY_BUILTINS, types: NONE,
    comment: HASH_COMMENT, string: STR_PY, jsx: false, decorators: true,
  },
  clike: {
    keywords: CLIKE_KEYWORDS, constants: CLIKE_CONSTANTS, builtins: CLIKE_BUILTINS, types: TYPE_WORDS,
    comment: C_COMMENT, string: STR_C, jsx: false, decorators: true,
  },
};

/* ---------- script languages (JS / TS / JSX / Python / C-likes) ---------- */

const tagType = (name) => (/^[A-Z]/.test(name) || name.includes('.') ? 'class' : 'tag');

function classifyIdent(word, prev, next, isFnAssign, cfg) {
  // obj.prop / obj.method()
  if (prev === '.' || prev === '?.') return next === '(' ? 'function' : 'property';

  if (cfg.constants.has(word)) return 'constant';
  if (cfg.keywords.has(word) && (!CONTEXTUAL.has(word) || /[A-Za-z_$'"`{*[]/.test(next))) return 'keyword';

  if (FUNC_INTRO.has(prev)) return 'function';                 // function foo / def foo
  if (CLASS_INTRO.has(prev)) return 'class';                   // class Foo / extends Bar / new Baz
  if (DECL_INTRO.has(prev)) return isFnAssign || next === '(' ? 'function' : 'variable';

  if (cfg.builtins.has(word)) return 'builtin';
  if (next === '(') return 'function';                         // foo(...)
  if (next === ':' && (prev === '{' || prev === ',')) return 'property'; // { key: value }
  if (cfg.types.has(word)) return 'class';
  if (/^[A-Z][A-Z0-9_]+$/.test(word)) return 'constant';       // MAX_SIZE
  if (/^[A-Z]/.test(word)) return 'class';                     // PascalCase: classes, components, types
  return 'variable';
}

function tokenizeScript(code, cfg) {
  const out = [];
  const stack = []; // 'tag' | 'children' | 'brace' — lets JSX and `{ ... }` nest correctly
  const len = code.length;
  let i = 0;
  let prev = ''; // last significant token, used for context

  const emit = (type, text) => out.push([type, text]);
  const exec = (re) => {
    re.lastIndex = i;
    const m = re.exec(code);
    return m && m[0].length ? m : null;
  };

  while (i < len) {
    const mode = stack[stack.length - 1];
    const ch = code[i];
    let m;

    /* ----- JSX: text between tags ----- */
    if (mode === 'children') {
      if ((m = exec(R.jsxText))) { emit('plain', m[0]); i += m[0].length; continue; }
      if (ch === '{') { stack.push('brace'); emit('punct', ch); i++; prev = ''; continue; }
      if ((m = exec(R.jsxClose))) {
        emit('punct', m[1]);
        if (m[2]) emit(tagType(m[2]), m[2]);
        emit('punct', m[3]);
        i += m[0].length; stack.pop(); prev = ')';
        continue;
      }
      if ((m = exec(R.jsxOpen))) {
        emit('punct', '<');
        if (m[1]) emit(tagType(m[1]), m[1]);
        stack.push('tag'); i += m[0].length;
        continue;
      }
      emit('plain', ch); i++;
      continue;
    }

    /* ----- JSX: inside <Tag ...> ----- */
    if (mode === 'tag') {
      if ((m = exec(R.ws))) { emit('plain', m[0]); i += m[0].length; continue; }
      if (code.startsWith('/>', i)) { emit('punct', '/>'); i += 2; stack.pop(); prev = ')'; continue; }
      if (ch === '>') { emit('punct', ch); i++; stack[stack.length - 1] = 'children'; continue; }
      if (ch === '{') { stack.push('brace'); emit('punct', ch); i++; prev = ''; continue; }
      if ((m = exec(cfg.string))) { emit('string', m[0]); i += m[0].length; continue; }
      if ((m = exec(R.jsxAttr))) { emit('attribute', m[0]); i += m[0].length; continue; }
      emit(ch === '=' ? 'operator' : 'plain', ch); i++;
      continue;
    }

    /* ----- regular code ----- */
    if ((m = exec(R.ws))) { emit('plain', m[0]); i += m[0].length; continue; }
    if ((m = exec(cfg.comment))) { emit('comment', m[0]); i += m[0].length; continue; }

    if (cfg.jsx && ch === '<' && JSX_PREV.has(prev) && (m = exec(R.jsxOpen))) {
      emit('punct', '<');
      if (m[1]) emit(tagType(m[1]), m[1]);
      stack.push('tag'); i += m[0].length;
      continue;
    }

    if ((m = exec(cfg.string))) { emit('string', m[0]); i += m[0].length; prev = 'literal'; continue; }

    if (cfg.decorators && ch === '@' && (m = exec(R.decorator))) {
      emit('function', m[0]); i += m[0].length; prev = '@';
      continue;
    }

    if (/\d/.test(ch) || (ch === '.' && /\d/.test(code[i + 1] || ''))) {
      if ((m = exec(R.number))) { emit('number', m[0]); i += m[0].length; prev = 'literal'; continue; }
    }

    if ((m = exec(R.ident))) {
      const word = m[0];
      const end = i + word.length;
      let j = end;
      while (j < len && (code[j] === ' ' || code[j] === '\t')) j++;
      const next = code[j] || '';
      let isFnAssign = false;
      if (DECL_INTRO.has(prev)) {
        R.fnAssign.lastIndex = end;
        isFnAssign = R.fnAssign.test(code);
      }
      emit(classifyIdent(word, prev, next, isFnAssign, cfg), word);
      prev = word; i = end;
      continue;
    }

    if (ch === '{') { stack.push('brace'); emit('punct', ch); i++; prev = ch; continue; }
    if (ch === '}') {
      if (stack[stack.length - 1] === 'brace') stack.pop();
      emit('punct', ch); i++; prev = ch;
      continue;
    }
    if ((m = exec(R.operator))) { emit('operator', m[0]); i += m[0].length; prev = m[0]; continue; }
    if ((m = exec(R.punct))) { emit('punct', m[0]); i += m[0].length; prev = m[0]; continue; }

    emit('plain', ch); i++;
  }
  return out;
}

/* ---------- rule-based languages (JSON / CSS / HTML / YAML & shell) ---------- */
// Each rule is [type, stickyRegex, optionalSplitFn]. First match at a position wins.

const RULES = {
  json: [
    ['comment', /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y],
    ['property', /"(?:[^"\\\n]|\\.)*"(?=\s*:)/y],
    ['string', /"(?:[^"\\\n]|\\.)*"?/y],
    ['number', /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y],
    ['constant', /\b(?:true|false|null)\b/y],
    ['punct', /[{}[\],:]/y],
  ],

  css: [
    ['comment', /\/\*[\s\S]*?(?:\*\/|$)/y],
    ['string', /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?/y],
    ['keyword', /@[\w-]+/y],                                   // @media, @theme, @apply
    ['variable', /--[\w-]+/y],                                 // custom properties
    ['number', /#[\da-fA-F]{3,8}\b/y],                         // hex colours
    ['constant', /#[A-Za-z_-][\w-]*/y],                        // #id selectors
    ['property', /[\w-]+(?=\s*:(?!:))(?=[^{};]*[;}])/y],       // color: red;
    ['function', /[\w-]+(?=\()/y],                             // var(), rgba()
    ['class', /\.[A-Za-z_-][\w-]*/y],                          // .selector
    ['number', /-?(?:\d+\.?\d*|\.\d+)(?:%|[A-Za-z]+)?/y],
    ['plain', /[\w-]+/y],
    ['punct', /[{}();:,]/y],
  ],

  markup: [
    ['comment', /<!--[\s\S]*?(?:-->|$)/y],
    ['keyword', /<![A-Za-z][^>]*>/y],
    ['tag', /(<\/?)([A-Za-z][\w:.-]*)/y, (m) => [['punct', m[1]], [tagType(m[2]), m[2]]]],
    ['punct', /\/?>/y],
    ['attribute', /([\w:@.-]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'<>]+)/y,
      (m) => [['attribute', m[1]], ['operator', m[2]], ['string', m[3]]]],
    ['constant', /&#?\w+;/y],
  ],

  hash: [
    ['comment', /#[^\n]*/y],
    ['class', /^\[[^\]\n]+\]/ym],                              // [section]
    ['property', /^([ \t]*(?:-[ \t]+)?)([\w./-]+)(?=[ \t]*[:=])/ym,
      (m) => [['plain', m[1]], ['property', m[2]]]],           // key: / KEY=
    ['string', /"(?:[^"\\\n]|\\.)*"?|'[^'\n]*'?/y],
    ['variable', /\$\{?[A-Za-z_]\w*\}?/y],
    ['constant', /\b(?:true|false|null)\b/y],
    ['keyword', /\b(?:if|then|else|elif|fi|for|while|do|done|case|esac|in|function|export|return|local|source)\b/y],
    ['number', /-?\b\d+(?:\.\d+)?\b/y],
    ['plain', /[\w.-]+/y],
  ],
};

function scanRules(code, rules) {
  const out = [];
  const len = code.length;
  let i = 0;
  outer: while (i < len) {
    for (const [type, re, split] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m[0].length) {
        if (split) out.push(...split(m));
        else out.push([type, m[0]]);
        i += m[0].length;
        continue outer;
      }
    }
    out.push(['plain', code[i]]);
    i++;
  }
  return out;
}

/* ---------- entry point ---------- */

// Merge neighbours so the DOM stays small: whitespace joins the previous token,
// and consecutive tokens of the same type become one span.
function compact(tokens) {
  const out = [];
  for (const [type, text] of tokens) {
    const last = out[out.length - 1];
    if (last && type === 'plain' && !text.trim()) last[1] += text;
    else if (last && last[0] === type) last[1] += text;
    else out.push([type, text]);
  }
  return out;
}

function highlight(code, lang) {
  if (!code || code.length > MAX_HIGHLIGHT_CHARS) return [['plain', code || '']];
  if (SCRIPT[lang]) return compact(tokenizeScript(code, SCRIPT[lang]));
  if (RULES[lang]) return compact(scanRules(code, RULES[lang]));
  return [['plain', code]];
}

function HighlightedCode({ code, lang }) {
  const tokens = useMemo(() => highlight(code, lang), [code, lang]);
  return (
    <>
      {tokens.map(([type, text], i) =>
        type === 'plain' ? text : <span key={i} className={`tok-${type}`}>{text}</span>
      )}
    </>
  );
}

/* ==========================================================================
   Repo helpers
   ========================================================================== */

// Pulls { owner, repo } out of a github.com URL.
function parseRepo(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') return null;
    const [, owner, repoRaw] = u.pathname.split('/');
    if (!owner || !repoRaw) return null;
    return { owner, repo: repoRaw.replace(/\.git$/, '') };
  } catch {
    return null;
  }
}

// Extensions (and a few bare filenames) that are safe to fetch and render
const TEXT_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'json', 'jsonc',
  'md', 'mdx', 'txt', 'rst', 'log',
  'css', 'scss', 'sass', 'less',
  'html', 'htm', 'xml', 'svg',
  'yml', 'yaml', 'toml', 'ini', 'cfg', 'conf', 'env',
  'sh', 'bash', 'zsh', 'fish', 'ps1',
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'kts', 'c', 'h', 'cc', 'cpp', 'hpp',
  'cs', 'php', 'swift', 'sql', 'graphql', 'gql', 'vue', 'svelte', 'astro',
  'lock', 'gitignore', 'gitattributes', 'editorconfig',
]);

const TEXT_FILENAMES = new Set([
  'readme', 'license', 'licence', 'dockerfile', 'makefile', 'procfile',
  'changelog', 'contributing', 'notice',
]);

function isTextFile(path) {
  const name = path.split('/').pop().toLowerCase();
  if (TEXT_FILENAMES.has(name)) return true;
  if (name.startsWith('.') && !name.slice(1).includes('.')) return true;
  const ext = name.includes('.') ? name.split('.').pop() : '';
  return TEXT_EXTENSIONS.has(ext);
}

function buildTree(entries) {
  const root = { name: '', type: 'tree', path: '', children: {} };
  for (const entry of entries) {
    const parts = entry.path.split('/');
    let node = root;
    parts.forEach((part, i) => {
      const isLast = i === parts.length - 1;
      if (!node.children[part]) {
        node.children[part] = {
          name: part,
          type: isLast ? entry.type : 'tree',
          path: parts.slice(0, i + 1).join('/'),
          children: {},
        };
      }
      node = node.children[part];
    });
  }
  return root;
}

function sortedChildren(node) {
  return Object.values(node.children).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function TreeNode({ node, depth, onSelectFile, selectedPath }) {
  const [open, setOpen] = useState(depth === 0);
  const indent = { paddingLeft: `${depth * 14 + 10}px` };

  if (node.type === 'tree') {
    return (
      <div>
        {node.name && (
          <button type="button" className="file-tree-row" style={indent} onClick={() => setOpen((o) => !o)}>
            {open ? <FolderOpen size={14} /> : <Folder size={14} />}
            {node.name}
          </button>
        )}
        {open && sortedChildren(node).map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={node.name ? depth + 1 : depth}
            onSelectFile={onSelectFile}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    );
  }

  if (!isTextFile(node.path)) {
    return (
      <div
        className="file-tree-row file-tree-row-locked"
        style={indent}
        title="Preview isn't available for this file type"
      >
        <Lock size={13} />
        {node.name}
      </div>
    );
  }

  return (
    <button
      type="button"
      style={indent}
      className={`file-tree-row${selectedPath === node.path ? ' file-tree-row-active' : ''}`}
      onClick={() => onSelectFile(node.path)}
    >
      <File size={14} />
      {node.name}
    </button>
  );
}

/* ==========================================================================
   Component
   ========================================================================== */

// `fallback` = { label, code, lang? } — pass `lang` ('tsx', 'py', 'css'…) if the label has no file extension.
export default function CodeExplorer({ repoUrl, fallback, proprietary, liveUrl }) {
  const [status, setStatus] = useState('idle');
  const [tree, setTree] = useState(null);
  const [branch, setBranch] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [fileStatus, setFileStatus] = useState('idle');

  const repo = repoUrl ? parseRepo(repoUrl) : null;

  const loadTree = async () => {
    if (!repo || status === 'loading' || status === 'ready' || proprietary) return;
    setStatus('loading');
    try {
      const infoRes = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`);
      if (!infoRes.ok) throw new Error('repo lookup failed');
      const info = await infoRes.json();
      const defaultBranch = info.default_branch;

      const treeRes = await fetch(
        `https://api.github.com/repos/${repo.owner}/${repo.repo}/git/trees/${defaultBranch}?recursive=1`
      );
      if (!treeRes.ok) throw new Error('tree fetch failed');
      const data = await treeRes.json();
      const entries = (data.tree || []).filter((e) => e.type === 'blob' || e.type === 'tree');

      setBranch(defaultBranch);
      setTree(buildTree(entries));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  const selectFile = async (path) => {
    if (!repo || !branch || !isTextFile(path)) return;
    setSelectedPath(path);
    setFileStatus('loading');
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${branch}/${path}`);
      if (!res.ok) throw new Error('file fetch failed');
      setFileContent(await res.text());
      setFileStatus('ready');
    } catch {
      setFileStatus('error');
    }
  };

  // Trigger fallback if no public repo OR if explicitly marked as proprietary
  if (!repo || proprietary) {
    if (!fallback && !proprietary) return null;

    const fallbackLang = fallback
      ? fallback.lang || (getLang(fallback.label) !== 'plain' ? getLang(fallback.label) : 'js')
      : 'plain';

    return (
      <details className="code-toggle">
        <summary className="btn btn-ghost">
          <Code2 size={15} /> {proprietary ? 'Code Snippet' : 'View code'} <ChevronDown size={14} className="chevron" />
        </summary>

        {/* Proprietary Notification Banner */}
        {proprietary && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 mb-4 mt-2 rounded-lg bg-pine-tint border border-pine/20 text-ink-soft text-[0.88rem]">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-pine shrink-0" />
              <span>
                This codebase is proprietary to <strong>{proprietary}</strong>. The full source repository is closed, but here is a featured snippet.
              </span>
            </div>
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 text-pine font-medium hover:underline shrink-0 px-3 py-1.5 bg-bg rounded-md border border-line">
                <ExternalLink size={14} /> View Live Project
              </a>
            )}
          </div>
        )}

        {fallback && (
          <div className="mt-2">
            <div className="code-block-label">{fallback.label}</div>
            <pre className="code-block">
              <code><HighlightedCode code={fallback.code} lang={fallbackLang} /></code>
            </pre>
          </div>
        )}
      </details>
    );
  }

  return (
    <details className="code-toggle" onToggle={(e) => { if (e.target.open) loadTree(); }}>
      <summary className="btn btn-ghost">
        <Code2 size={15} /> View code <ChevronDown size={14} className="chevron" />
      </summary>

      {status === 'loading' && (
        <div className="code-explorer-status">
          <Loader2 size={14} className="animate-spin" /> Loading repository…
        </div>
      )}

      {status === 'error' && (
        <div className="code-explorer-status">
          Couldn&rsquo;t load the file tree from GitHub — the repo may be private or renamed, or
          GitHub&rsquo;s unauthenticated rate limit (60 requests/hour) may have been hit.{' '}
          <a href={repoUrl} target="_blank" rel="noreferrer" className="text-pine underline">
            Open it on GitHub instead →
          </a>
        </div>
      )}

      {status === 'ready' && tree && (
        <div className="code-explorer">
          <div className="file-tree">
            <TreeNode node={tree} depth={0} onSelectFile={selectFile} selectedPath={selectedPath} />
          </div>

          <div className="code-pane">
            {!selectedPath && (
              <div className="code-pane-status">Select a file to view its contents.</div>
            )}

            {selectedPath && fileStatus === 'loading' && (
              <div className="code-pane-status">
                <Loader2 size={14} className="animate-spin" /> Loading {selectedPath}…
              </div>
            )}

            {selectedPath && fileStatus === 'error' && (
              <div className="code-pane-status">Couldn&rsquo;t load this file.</div>
            )}

            {selectedPath && fileStatus === 'ready' && (
              <div className="code-pane-inner">
                <div className="code-block-label">{selectedPath}</div>
                <pre>
                  <code><HighlightedCode code={fileContent} lang={getLang(selectedPath)} /></code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </details>
  );
}