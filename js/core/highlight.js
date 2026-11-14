/* =========================================================================
 * DSA Visualizer – highlight.js
 * Tiny syntax highlighter + "@@tag" line-marker extraction.
 *
 * Code strings in algorithm modules may end any line with   @@tag   or
 * @@tag1,tag2  . The marker is stripped before display; steps reference the
 * tag (step.line = 'tag') and the matching lines are highlighted.
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  const KW = {
    cpp: 'if else while for do return break continue switch case default struct class public private protected new delete nullptr true false template typename using namespace const static sizeof this virtual inline operator include define NULL',
    java: 'if else while for do return break continue switch case default class public private protected static final new null true false this import package extends implements interface try catch throw throws',
    python: 'def return if elif else while for in not and or is None True False class import from pass break continue lambda with as yield global nonlocal try except raise del',
    pseudo: 'Algorithm End if then else while do end return loop Pre Post Return AND OR NOT and or not ref val null NULL nil true false True False to for Uses each until repeat break',
  };
  const TYPES = {
    cpp: 'int void bool char double float long short unsigned auto string vector queue stack list pair map set unordered_map priority_queue std size_t Node TreeNode',
    java: 'int void boolean char double float long short String Integer List ArrayList LinkedList Queue Deque ArrayDeque Map HashMap Set HashSet PriorityQueue Node TreeNode Arrays Math System',
    python: 'int float str list dict set tuple bool len range print min max abs deque self',
    pseudo: 'integer boolean pointer array dataType keyType key int',
  };
  const sets = {};
  Object.keys(KW).forEach((l) => { sets[l] = { kw: new Set(KW[l].split(' ')), ty: new Set(TYPES[l].split(' ')) }; });

  const esc = DSA.escape;

  function tokenizeLine(line, lang, state) {
    const S = sets[lang] || sets.cpp;
    let out = '';
    let i = 0;
    const n = line.length;
    const lineComment = lang === 'python' ? '#' : '//';
    while (i < n) {
      // inside block comment
      if (state.block) {
        const end = line.indexOf('*/', i);
        if (end < 0) { out += '<span class="tk-com">' + esc(line.slice(i)) + '</span>'; return out; }
        out += '<span class="tk-com">' + esc(line.slice(i, end + 2)) + '</span>';
        i = end + 2; state.block = false; continue;
      }
      const ch = line[i];
      // comments
      if (line.startsWith(lineComment, i) || (lang === 'pseudo' && line.startsWith('//', i))) {
        out += '<span class="tk-com">' + esc(line.slice(i)) + '</span>'; return out;
      }
      if (lang !== 'python' && line.startsWith('/*', i)) { state.block = true; continue; }
      // preprocessor
      if (lang === 'cpp' && ch === '#' && line.slice(0, i).trim() === '') {
        out += '<span class="tk-pre">' + esc(line.slice(i)) + '</span>'; return out;
      }
      // strings
      if (ch === '"' || ch === "'") {
        let j = i + 1;
        while (j < n && line[j] !== ch) { if (line[j] === '\\') j++; j++; }
        out += '<span class="tk-str">' + esc(line.slice(i, j + 1)) + '</span>';
        i = j + 1; continue;
      }
      // numbers
      if (/[0-9]/.test(ch) && !/[A-Za-z_]/.test(line[i - 1] || '')) {
        let j = i; while (j < n && /[0-9.]/.test(line[j])) j++;
        out += '<span class="tk-num">' + esc(line.slice(i, j)) + '</span>';
        i = j; continue;
      }
      // identifiers
      if (/[A-Za-z_]/.test(ch)) {
        let j = i; while (j < n && /[A-Za-z0-9_]/.test(line[j])) j++;
        const w = line.slice(i, j);
        let k = j; while (k < n && line[k] === ' ') k++;
        let cls = null;
        if (S.kw.has(w)) cls = 'tk-kw';
        else if (S.ty.has(w)) cls = 'tk-ty';
        else if (line[k] === '(') cls = 'tk-fn';
        out += cls ? '<span class="' + cls + '">' + esc(w) + '</span>' : esc(w);
        i = j; continue;
      }
      // operators
      if (/[+\-*/%=<>!&|^~?:]/.test(ch)) {
        let j = i; while (j < n && /[+\-*/%=<>!&|^~?:]/.test(line[j])) j++;
        out += '<span class="tk-op">' + esc(line.slice(i, j)) + '</span>';
        i = j; continue;
      }
      out += esc(ch); i++;
    }
    return out;
  }

  const MARK = /\s*@@([\w\-,]+)\s*$/;

  /**
   * Process a code string → { html:[lineHtml], plain:[lineText], tags:{tag:[lineIndex]} }
   */
  DSA.processCode = function (code, lang) {
    const raw = String(code || '').replace(/\r/g, '').replace(/^\n+/, '').replace(/\s+$/, '');
    // de-indent common leading whitespace
    const lines = raw.split('\n');
    let minIndent = Infinity;
    lines.forEach((l) => {
      const t = l.replace(MARK, '');
      if (t.trim()) minIndent = Math.min(minIndent, t.match(/^ */)[0].length);
    });
    if (!isFinite(minIndent)) minIndent = 0;
    const tags = {};
    const plain = [];
    const html = [];
    const state = { block: false };
    lines.forEach((l, idx) => {
      const m = l.match(MARK);
      if (m) {
        m[1].split(',').forEach((t) => { if (t) (tags[t] = tags[t] || []).push(idx); });
        l = l.replace(MARK, '');
      }
      l = l.slice(Math.min(minIndent, l.match(/^ */)[0].length));
      plain.push(l);
      html.push(tokenizeLine(l, lang, state) || '&nbsp;');
    });
    return { html, plain, tags };
  };
})();
