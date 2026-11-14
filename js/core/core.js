/* =========================================================================
 * DSA Visualizer – core.js
 * Namespace, registry & helpers shared by all algorithm modules.
 * ========================================================================= */
(function () {
  'use strict';

  const DSA = (window.DSA = window.DSA || {});

  /* ---------------------------------------------------------------------
   * Chapters (match the PDF slide decks)
   * ------------------------------------------------------------------- */
  DSA.chapters = [
    { id: 'sorting',   icon: '⇅',  name: 'Sắp xếp',            en: 'Sorting' },
    { id: 'searching', icon: '🔍', name: 'Tìm kiếm',           en: 'Searching' },
    { id: 'hashing',   icon: '#',  name: 'Bảng băm',           en: 'Hashing' },
    { id: 'tree',      icon: '🌳', name: 'Cây nhị phân & BST', en: 'Tree concepts / BST' },
    { id: 'heap',      icon: '△',  name: 'Heap',               en: 'Heap' },
    { id: 'avl',       icon: '⚖',  name: 'Cây AVL',            en: 'AVL Tree' },
    { id: 'splay',     icon: '↺',  name: 'Splay Tree',         en: 'Splay Tree' },
    { id: 'btree',     icon: '▤',  name: 'B-Tree',             en: 'Multiway / B-Tree' },
    { id: 'graph',     icon: '◎',  name: 'Đồ thị',             en: 'Graph' },
    { id: 'bitwise',   icon: '⊕',  name: 'Toán tử Bit',        en: 'Bitwise Operators' },
    { id: 'icpc-math', icon: '🔢', name: 'Số học',              en: 'Number Theory' },
    { id: 'icpc-dp',   icon: '📐', name: 'Quy hoạch động',      en: 'Dynamic Programming' },
    { id: 'icpc-str',  icon: '🔤', name: 'Xử lý xâu',          en: 'String Algorithms' },
    { id: 'bitwise',   icon: '⊕',  name: 'Toán tử Bit',        en: 'Bitwise Operators' },
    { id: 'icpc-math', icon: '🔢', name: 'Số học',              en: 'Number Theory' },
    { id: 'icpc-dp',   icon: '📐', name: 'Quy hoạch động',      en: 'Dynamic Programming' },
    { id: 'icpc-str',  icon: '🔤', name: 'Xử lý xâu',          en: 'String Algorithms' },
  ];

  DSA.algos = [];
  DSA.byId = {};

  /**
   * Register an algorithm / data structure page.
   * See CONTRACT in the project docs. Minimal shape:
   * { id, chapter, name, description, complexity:[[label,value]], ops:[{id,label,args,code,run}] }
   */
  DSA.register = function (def) {
    if (!def || !def.id) throw new Error('register(): missing id');
    if (DSA.byId[def.id]) console.warn('Duplicate algo id', def.id);
    def.ops = def.ops || [];
    def.ops.forEach((op) => { op.args = op.args || []; });
    DSA.algos.push(def);
    DSA.byId[def.id] = def;
    return def;
  };

  /* ---------------------------------------------------------------------
   * Generic helpers
   * ------------------------------------------------------------------- */
  DSA.clone = function (o) {
    if (o === undefined) return undefined;
    try { return structuredClone(o); } catch (e) { return JSON.parse(JSON.stringify(o)); }
  };

  /** Parse "5 3, 8;1" -> [5,3,8,1]. Non-numbers are kept as strings. */
  DSA.parseArray = function (s) {
    if (Array.isArray(s)) return s.slice();
    return String(s == null ? '' : s)
      .split(/[\s,;]+/)
      .filter((t) => t.length)
      .map((t) => (isFinite(Number(t)) ? Number(t) : t));
  };

  DSA.parseNumber = function (s, fallback) {
    const n = Number(String(s).trim());
    return isFinite(n) && String(s).trim() !== '' ? n : fallback;
  };

  DSA.randInt = function (lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); };

  /** Random array as a string (for input boxes). */
  DSA.randomArray = function (n, lo, hi, unique) {
    n = n || 10; lo = lo == null ? 1 : lo; hi = hi == null ? 99 : hi;
    const out = [];
    const seen = new Set();
    let guard = 0;
    while (out.length < n && guard++ < 10000) {
      const v = DSA.randInt(lo, hi);
      if (unique && seen.has(v)) continue;
      seen.add(v); out.push(v);
    }
    return out.join(' ');
  };

  DSA.randomSortedArray = function (n, lo, hi) {
    const a = DSA.parseArray(DSA.randomArray(n, lo, hi, true));
    a.sort((x, y) => x - y);
    return a.join(' ');
  };

  DSA.escape = function (s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  };

  /* ---------------------------------------------------------------------
   * Recorder – convenience for building step lists.
   *   const R = new DSA.Recorder();
   *   R.step({ line:'cmp', msg:'So sánh …', vars:{i,j}, panels:[…] });
   *   return R.steps;
   * Panels passed to step() are deep-cloned so callers can keep mutating.
   * ------------------------------------------------------------------- */
  DSA.Recorder = class Recorder {
    constructor() { this.steps = []; }
    step(s) {
      const st = Object.assign({}, s);
      if (st.panels) st.panels = DSA.clone(st.panels);
      if (st.vars) st.vars = DSA.clone(st.vars);
      this.steps.push(st);
      return st;
    }
    get length() { return this.steps.length; }
  };

  /* ---------------------------------------------------------------------
   * Tree helpers (binary nodes: {id,key,left,right,...})
   * ------------------------------------------------------------------- */
  let _uid = 1;
  DSA.uid = function (prefix) { return (prefix || 'n') + (_uid++); };

  /** Deep copy a binary tree into a plain render object, applying highlight map {id: cls}. */
  DSA.treeSnapshot = function (root, hl, opts) {
    hl = hl || {};
    opts = opts || {};
    function cp(n) {
      if (!n) return null;
      const o = { id: n.id, key: n.key };
      if (hl[n.id]) o.hl = hl[n.id];
      if (opts.badge) { const b = opts.badge(n); if (b !== undefined && b !== null && b !== '') o.badge = String(b); }
      if (opts.sub) { const s = opts.sub(n); if (s !== undefined && s !== null && s !== '') o.sub = String(s); }
      if (opts.edgeHl && opts.edgeHl[n.id]) o.edgeHl = opts.edgeHl[n.id];
      o.left = cp(n.left);
      o.right = cp(n.right);
      return o;
    }
    return cp(root);
  };

  DSA.treeHeight = function (n) { return n ? 1 + Math.max(DSA.treeHeight(n.left), DSA.treeHeight(n.right)) : 0; };

  /* ---------------------------------------------------------------------
   * Misc
   * ------------------------------------------------------------------- */
  DSA.INF = Infinity;
  DSA.fmt = function (v) {
    if (v === Infinity) return '∞';
    if (v === -Infinity) return '-∞';
    if (v === null || v === undefined) return '—';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (Array.isArray(v)) return '[' + v.map(DSA.fmt).join(', ') + ']';
    return String(v);
  };
})();
