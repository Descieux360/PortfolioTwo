import React, { useState } from 'react';
import { Folder, FolderOpen, File, Lock, Code2, ChevronDown, Loader2 } from 'lucide-react';

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
// as plain text. Anything not on this list — images, fonts, archives,
// binaries — gets locked in the tree instead of fetched.
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
  // Bare dotfiles with no further extension — .env, .gitignore, .npmrc, etc.
  if (name.startsWith('.') && !name.slice(1).includes('.')) return true;
  const ext = name.includes('.') ? name.split('.').pop() : '';
  return TEXT_EXTENSIONS.has(ext);
}

// Turns GitHub's flat recursive tree listing into a nested folder/file tree.
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

// Folders first, then alphabetical within each group.
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

  // File node.
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

// repoUrl: a github.com URL, e.g. project.links.repo.
// fallback: { label, code } — shown instead if there's no public repo to fetch
// (private project, or repoUrl isn't a github.com link).
export default function CodeExplorer({ repoUrl, fallback }) {
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [tree, setTree] = useState(null);
  const [branch, setBranch] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [fileStatus, setFileStatus] = useState('idle'); // idle | loading | ready | error

  const repo = repoUrl ? parseRepo(repoUrl) : null;

  const loadTree = async () => {
    if (!repo || status === 'loading' || status === 'ready') return;
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

  // No public repo to fetch from — fall back to the stored snippet, if any.
  if (!repo) {
    if (!fallback) return null;
    return (
      <details className="code-toggle">
        <summary className="btn btn-ghost">
          <Code2 size={15} /> View code <ChevronDown size={14} className="chevron" />
        </summary>
        <div className="code-block-label">{fallback.label}</div>
        <pre className="code-block"><code>{fallback.code}</code></pre>
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
                <pre><code>{fileContent}</code></pre>
              </div>
            )}
          </div>
        </div>
      )}
    </details>
  );
}