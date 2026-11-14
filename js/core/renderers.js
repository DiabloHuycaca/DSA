/* =========================================================================
 * DSA Visualizer – renderers.js
 * Panel renderers: array | tree | graph | table | list | buckets | html
 *
 * A step contains `panels: [ {kind:'array', ...}, {kind:'tree', ...} ]`.
 * DSA.Stage keeps one renderer instance per panel key and updates it.
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;
  const esc = DSA.escape;
  const fmt = DSA.fmt;

  const HL_CLASSES = ['active', 'compare', 'swap', 'sorted', 'done', 'pivot', 'found', 'visited', 'dim', 'new', 'min', 'path', 'current', 'key', 'fail', 'tree', 'frontier', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
  function hlClass(h) { return h ? ' hl-' + String(h).split(' ').join(' hl-') : ''; }
  DSA.HL_CLASSES = HL_CLASSES;

  function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ===================================================================== */
  /* Stage                                                                 */
  /* ===================================================================== */
  class Stage {
    constructor(el) {
      this.el = el;
      this.items = new Map(); // key -> {wrap, renderer, kind}
    }
    clear() { this.el.innerHTML = ''; this.items.clear(); }
    update(panels, opts) {
      opts = opts || {};
      panels = (panels || []).filter(Boolean);
      const used = new Set();
      const kindCount = {};
      panels.forEach((p, idx) => {
        kindCount[p.kind] = (kindCount[p.kind] || 0) + 1;
        const key = p.kind + ':' + (p.key || p.title || ('#' + kindCount[p.kind]));
        used.add(key);
        let it = this.items.get(key);
        if (!it) {
          const wrap = document.createElement('section');
          wrap.className = 'panel panel-' + p.kind;
          wrap.innerHTML = '<header class="panel-title"></header><div class="panel-body"></div><footer class="panel-note"></footer>';
          const Ctor = RENDERERS[p.kind] || HtmlPanel;
          it = { wrap, kind: p.kind, renderer: new Ctor(wrap.querySelector('.panel-body')) };
          this.items.set(key, it);
        }
        // keep order
        if (this.el.children[idx] !== it.wrap) this.el.insertBefore(it.wrap, this.el.children[idx] || null);
        it.wrap.classList.toggle('half', !!p.half);
        const t = it.wrap.querySelector('.panel-title');
        t.innerHTML = p.title ? p.title : '';
        t.style.display = p.title ? '' : 'none';
        const nt = it.wrap.querySelector('.panel-note');
        nt.innerHTML = p.note || '';
        nt.style.display = p.note ? '' : 'none';
        try { it.renderer.update(p, opts); } catch (e) { console.error('Render error', p, e); }
      });
      for (const [key, it] of this.items) {
        if (!used.has(key)) { it.wrap.remove(); if (it.renderer.destroy) it.renderer.destroy(); this.items.delete(key); }
      }
    }
  }
  DSA.Stage = Stage;

  /* ===================================================================== */
  /* Array panel                                                           */
  /* ===================================================================== */
  class ArrayPanel {
    constructor(el) {
      this.el = el;
      el.classList.add('arr-wrap');
      this.track = document.createElement('div');
      this.track.className = 'arr-track';
      el.appendChild(this.track);
      this.cells = new Map();
    }
    update(d, opts) {
      const vals = d.values || [];
      const n = vals.length;
      const ids = d.ids || vals.map((_, i) => 'i' + i);
      const W = Math.max(this.el.clientWidth || 600, 280) - 16;
      const gap = n > 24 ? 2 : 4;
      let cw = Math.floor((W - gap * (n - 1)) / Math.max(n, 1));
      cw = Math.max(18, Math.min(d.cellWidth || 56, cw));
      const bars = !!d.bars;
      const nums = vals.filter((v) => typeof v === 'number' && isFinite(v));
      const maxV = d.maxValue || Math.max(1, ...nums.map(Math.abs));
      const barMax = d.barHeight || 150;
      const cellH = bars ? barMax + 24 : 44;
      const hasRanges = d.ranges && d.ranges.length;
      const topPad = hasRanges ? 26 * Math.max(1, ...d.ranges.map((r) => (r.row || 0) + 1)) : 4;
      const ptrRows = {};
      (d.pointers || []).forEach((p) => {
        if (p == null || p.i == null) return;
        ptrRows[p.i] = (ptrRows[p.i] || 0) + 1;
      });
      const maxStack = Math.max(0, ...Object.values(ptrRows));
      const idxH = d.showIndex === false ? 0 : 16;
      const totalW = n * cw + (n - 1) * gap;
      const offsetX = Math.max(0, (W - totalW) / 2);
      this.track.style.height = topPad + cellH + idxH + maxStack * 20 + 10 + 'px';
      this.track.style.setProperty('--dur', (opts.duration || 300) + 'ms');
      this.track.classList.toggle('noanim', !opts.animate);

      const seen = new Set();
      const hl = d.hl || {};
      const base = d.indexBase || 0;
      vals.forEach((v, i) => {
        const id = ids[i];
        seen.add(id);
        let c = this.cells.get(id);
        if (!c) {
          c = document.createElement('div');
          c.className = 'arr-cell';
          c.innerHTML = '<div class="arr-box"><span class="arr-val"></span><span class="arr-sub"></span></div>';
          this.track.appendChild(c);
          this.cells.set(id, c);
          c.style.transform = 'translate(' + (offsetX + i * (cw + gap)) + 'px,' + topPad + 'px)';
        }
        c.className = 'arr-cell' + hlClass(hl[i]) + (bars ? ' bar' : '') + (v === null || v === undefined || v === '' ? ' empty' : '');
        c.style.width = cw + 'px';
        c.style.height = cellH + 'px';
        c.style.transform = 'translate(' + (offsetX + i * (cw + gap)) + 'px,' + topPad + 'px)';
        const box = c.firstChild;
        if (bars) {
          const h = typeof v === 'number' ? 14 + (Math.abs(v) / maxV) * (barMax - 14) : 14;
          box.style.height = h + 'px';
        } else box.style.height = '';
        box.querySelector('.arr-val').textContent = v === null || v === undefined ? '' : fmt(v);
        box.querySelector('.arr-val').style.fontSize = cw < 30 ? '11px' : '';
        const sub = d.cellLabels ? d.cellLabels[i] : null;
        box.querySelector('.arr-sub').textContent = sub == null ? '' : sub;
        c.dataset.idx = d.showIndex === false ? '' : String(i + base);
      });
      for (const [id, c] of this.cells) if (!seen.has(id)) { c.remove(); this.cells.delete(id); }

      // ranges & pointers (re-created)
      this.track.querySelectorAll('.arr-range,.arr-ptr').forEach((e) => e.remove());
      (d.ranges || []).forEach((r) => {
        if (r.from == null || r.to == null || r.to < r.from) return;
        const e = document.createElement('div');
        e.className = 'arr-range' + hlClass(r.hl || 'active');
        const x1 = offsetX + r.from * (cw + gap);
        const x2 = offsetX + r.to * (cw + gap) + cw;
        e.style.left = x1 + 'px';
        e.style.width = x2 - x1 + 'px';
        e.style.top = topPad - 22 - (r.row || 0) * 24 + 'px';
        e.textContent = r.label || '';
        this.track.appendChild(e);
      });
      const stackAt = {};
      (d.pointers || []).forEach((p) => {
        if (p == null || p.i == null || p.i < -1 || p.i > n) return;
        const k = stackAt[p.i] = (stackAt[p.i] || 0) + 1;
        const e = document.createElement('div');
        e.className = 'arr-ptr' + hlClass(p.hl || 'active');
        e.style.left = offsetX + p.i * (cw + gap) + cw / 2 + 'px';
        e.style.top = topPad + cellH + idxH + (k - 1) * 20 + 'px';
        e.innerHTML = (k === 1 ? '▲' : '') + esc(p.label);
        this.track.appendChild(e);
      });
    }
  }

  /* ===================================================================== */
  /* Tree panel (binary + multiway/B-tree)                                 */
  /* ===================================================================== */
  const R = 19;          // node radius
  const LEVEL_H = 70;
  const XGAP = 46;
  const KEY_W = 34, KEY_H = 30;

  function layoutBinary(root) {
    const pos = {}; const edges = []; const nodes = [];
    let idx = 0;
    (function walk(n, depth, parent) {
      if (!n) return;
      walk(n.left, depth + 1, n);
      const x = idx++ * XGAP;
      pos[n.id] = { x, y: depth * LEVEL_H };
      nodes.push(n);
      walk(n.right, depth + 1, n);
    })(root, 0, null);
    (function walkE(n) {
      if (!n) return;
      [n.left, n.right].forEach((c, side) => {
        if (c) { edges.push({ from: n.id, to: c.id, hl: c.edgeHl, side, label: c.edgeLabel }); walkE(c); }
      });
    })(root);
    return { pos, edges, nodes };
  }

  function nodeWidth(n) { return Math.max(1, (n.keys || []).length) * KEY_W; }

  function layoutMulti(root) {
    const pos = {}; const edges = []; const nodes = [];
    const SIB = 18;
    let cursor = 0;
    function walk(n, depth) {
      nodes.push(n);
      const w = nodeWidth(n);
      const kids = (n.children || []).filter(Boolean);
      if (!kids.length) {
        pos[n.id] = { x: cursor + w / 2, y: depth * (LEVEL_H + 10), w };
        cursor += w + SIB;
        return;
      }
      const start = cursor;
      kids.forEach((c) => walk(c, depth + 1));
      const first = pos[kids[0].id].x, last = pos[kids[kids.length - 1].id].x;
      let cx = (first + last) / 2;
      if (cursor - SIB - start < w) { cx = start + w / 2; cursor = Math.max(cursor, start + w + SIB); }
      pos[n.id] = { x: cx, y: depth * (LEVEL_H + 10), w };
    }
    if (root) walk(root, 0);
    nodes.forEach((n) => {
      (n.children || []).forEach((c, i) => { if (c) edges.push({ from: n.id, to: c.id, slot: i, hl: c.edgeHl }); });
    });
    return { pos, edges, nodes };
  }

  class TreePanel {
    constructor(el) {
      this.el = el;
      el.classList.add('svg-wrap');
      this.prev = {}; // id -> {x,y}
      this.prevVB = null;
      this.raf = null;
    }
    destroy() { if (this.raf) cancelAnimationFrame(this.raf); }
    update(d, opts) {
      const multi = d.mode === 'multi' || (d.root && Array.isArray(d.root.keys));
      const L = d.root ? (multi ? layoutMulti(d.root) : layoutBinary(d.root)) : { pos: {}, edges: [], nodes: [] };
      // extra floating nodes (e.g. node waiting to be inserted)
      const floats = d.floating || [];
      // bounding box
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      Object.values(L.pos).forEach((p) => {
        const hw = multi ? p.w / 2 : R;
        minX = Math.min(minX, p.x - hw); maxX = Math.max(maxX, p.x + hw);
        minY = Math.min(minY, p.y - R); maxY = Math.max(maxY, p.y + R);
      });
      if (!isFinite(minX)) { minX = 0; maxX = 200; minY = 0; maxY = 40; }
      floats.forEach((f, i) => {
        f._x = maxX + 50 + i * 50; f._y = minY + R;
        L.pos[f.id] = { x: f._x, y: f._y, w: KEY_W };
      });
      if (floats.length) maxX = maxX + 50 * floats.length + 20;
      const pad = 34;
      const target = { x: minX - pad, y: minY - pad - 6, w: Math.max(maxX - minX + pad * 2, 260), h: Math.max(maxY - minY + pad * 2 + 14, 120) };
      if (target.w < 260) target.x -= (260 - target.w) / 2;
      const animate = opts.animate && Object.keys(this.prev).length > 0;
      const dur = Math.min(opts.duration || 350, 600);
      const from = {};
      const parentOf = {};
      L.edges.forEach((e) => { parentOf[e.to] = e.from; });
      Object.keys(L.pos).forEach((id) => {
        if (this.prev[id]) from[id] = this.prev[id];
        else if (parentOf[id] && this.prev[parentOf[id]]) from[id] = this.prev[parentOf[id]];
        else from[id] = L.pos[id];
      });
      const vbFrom = this.prevVB || target;
      const draw = (t) => {
        const cur = {};
        Object.keys(L.pos).forEach((id) => {
          const a = from[id], b = L.pos[id];
          cur[id] = { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: b.w };
        });
        const vb = { x: lerp(vbFrom.x, target.x, t), y: lerp(vbFrom.y, target.y, t), w: lerp(vbFrom.w, target.w, t), h: lerp(vbFrom.h, target.h, t) };
        this.el.innerHTML = this.svg(d, L, cur, vb, multi, floats);
      };
      if (this.raf) cancelAnimationFrame(this.raf);
      if (!animate) { draw(1); }
      else {
        const t0 = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - t0) / dur);
          draw(ease(t));
          if (t < 1) this.raf = requestAnimationFrame(tick); else this.raf = null;
        };
        this.raf = requestAnimationFrame(tick);
        draw(0);
      }
      this.prev = {};
      Object.keys(L.pos).forEach((id) => { this.prev[id] = { x: L.pos[id].x, y: L.pos[id].y }; });
      this.prevVB = target;
    }
    svg(d, L, P, vb, multi, floats) {
      const cw = Math.max(this.el.clientWidth || 600, 260);
      const scale = Math.min(d.maxScale || 1.15, cw / vb.w);
      const w = vb.w * scale, h = vb.h * scale;
      let s = '<svg class="tree-svg" width="' + w.toFixed(0) + '" height="' + h.toFixed(0) + '" viewBox="' + [vb.x, vb.y, vb.w, vb.h].map((v) => v.toFixed(1)).join(' ') + '">';
      if (!d.root && !floats.length) {
        s += '<text class="empty-text" x="' + (vb.x + vb.w / 2) + '" y="' + (vb.y + vb.h / 2) + '">(cây rỗng)</text>';
      }
      // edges
      L.edges.forEach((e) => {
        const a = P[e.from], b = P[e.to];
        if (!a || !b) return;
        let x1 = a.x, y1 = a.y;
        if (multi) {
          x1 = a.x - a.w / 2 + e.slot * KEY_W; y1 = a.y + KEY_H / 2;
          s += '<line class="t-edge' + hlClass(e.hl) + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + b.x + '" y2="' + (b.y - KEY_H / 2) + '"/>';
        } else {
          s += '<line class="t-edge' + hlClass(e.hl) + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + b.x + '" y2="' + b.y + '"/>';
          if (e.label) s += '<text class="t-elabel" x="' + ((x1 + b.x) / 2 + (e.side ? 8 : -8)) + '" y="' + ((y1 + b.y) / 2) + '">' + esc(e.label) + '</text>';
        }
      });
      // nodes
      L.nodes.forEach((n) => {
        const p = P[n.id]; if (!p) return;
        if (multi) {
          const keys = n.keys || [];
          const wN = p.w, x0 = p.x - wN / 2, y0 = p.y - KEY_H / 2;
          s += '<g class="t-mnode' + hlClass(n.hl) + '">';
          s += '<rect class="t-mrect" x="' + x0 + '" y="' + y0 + '" width="' + wN + '" height="' + KEY_H + '" rx="5"/>';
          keys.forEach((k, i) => {
            const kh = n.keyHl && n.keyHl[i];
            if (kh) s += '<rect class="t-mkey' + hlClass(kh) + '" x="' + (x0 + i * KEY_W + 1.5) + '" y="' + (y0 + 1.5) + '" width="' + (KEY_W - 3) + '" height="' + (KEY_H - 3) + '" rx="4"/>';
            if (i > 0) s += '<line class="t-msep" x1="' + (x0 + i * KEY_W) + '" y1="' + y0 + '" x2="' + (x0 + i * KEY_W) + '" y2="' + (y0 + KEY_H) + '"/>';
            s += '<text class="t-mtext" x="' + (x0 + i * KEY_W + KEY_W / 2) + '" y="' + (p.y + 1) + '">' + esc(fmt(k)) + '</text>';
          });
          if (n.badge) s += '<text class="t-badge" x="' + (x0 + wN + 4) + '" y="' + (y0 + 2) + '">' + esc(n.badge) + '</text>';
          s += '</g>';
        } else {
          s += '<g class="t-node' + hlClass(n.hl) + '">';
          s += '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + R + '"/>';
          const label = fmt(n.key);
          s += '<text class="t-text' + (label.length > 3 ? ' small' : '') + '" x="' + p.x + '" y="' + (p.y + 1) + '">' + esc(label) + '</text>';
          if (n.badge) s += '<text class="t-badge" x="' + (p.x + R + 2) + '" y="' + (p.y - R + 4) + '">' + esc(n.badge) + '</text>';
          if (n.sub) s += '<text class="t-sub" x="' + p.x + '" y="' + (p.y + R + 13) + '">' + esc(n.sub) + '</text>';
          s += '</g>';
        }
      });
      floats.forEach((f) => {
        const p = P[f.id];
        s += '<g class="t-node float' + hlClass(f.hl || 'new') + '"><circle cx="' + p.x + '" cy="' + p.y + '" r="' + R + '"/>' +
          '<text class="t-text" x="' + p.x + '" y="' + (p.y + 1) + '">' + esc(fmt(f.key)) + '</text>' +
          (f.label ? '<text class="t-sub" x="' + p.x + '" y="' + (p.y + R + 13) + '">' + esc(f.label) + '</text>' : '') + '</g>';
      });
      s += '</svg>';
      return s;
    }
  }

  /* ===================================================================== */
  /* Graph panel                                                           */
  /* ===================================================================== */
  const GR = 20;
  class GraphPanel {
    constructor(el) { this.el = el; el.classList.add('svg-wrap'); }
    update(d) {
      const nodes = d.nodes || [];
      const edges = d.edges || [];
      const map = {};
      nodes.forEach((n) => { map[n.id] = n; });
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach((n) => { minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x); minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y); });
      if (!nodes.length) { minX = 0; maxX = 200; minY = 0; maxY = 100; }
      const pad = 44;
      const vb = { x: minX - pad, y: minY - pad - 6, w: maxX - minX + 2 * pad, h: maxY - minY + 2 * pad + 6 };
      const cw = Math.max(this.el.clientWidth || 600, 260);
      const scale = Math.min(d.maxScale || 1.3, cw / vb.w);
      const pairSet = new Set(edges.map((e) => e.from + '→' + e.to));
      let s = '<svg class="graph-svg" width="' + (vb.w * scale).toFixed(0) + '" height="' + (vb.h * scale).toFixed(0) + '" viewBox="' + [vb.x, vb.y, vb.w, vb.h].join(' ') + '">';
      const labels = [];
      edges.forEach((e) => {
        const a = map[e.from], b = map[e.to];
        if (!a || !b) return;
        const directed = e.directed != null ? e.directed : d.directed;
        const curved = e.curve != null ? e.curve : (directed && pairSet.has(e.to + '→' + e.from));
        const dx = b.x - a.x, dy = b.y - a.y; const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len; const nx = -uy, ny = ux;
        const off = curved ? (typeof curved === 'number' ? curved : 22) : 0;
        const cx = (a.x + b.x) / 2 + nx * off, cy = (a.y + b.y) / 2 + ny * off;
        // start/end on circle boundary toward control point
        const s1 = norm(cx - a.x, cy - a.y), s2 = norm(b.x - cx, b.y - cy);
        const x1 = a.x + s1.x * GR, y1 = a.y + s1.y * GR;
        const x2 = b.x - s2.x * (GR + (directed ? 2 : 0)), y2 = b.y - s2.y * (GR + (directed ? 2 : 0));
        const cls = 'g-edge' + hlClass(e.hl);
        if (off) s += '<path class="' + cls + '" d="M' + x1 + ',' + y1 + ' Q' + cx + ',' + cy + ' ' + x2 + ',' + y2 + '"/>';
        else s += '<line class="' + cls + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
        if (directed) {
          const ax = s2.x, ay = s2.y; const L2 = 11, Wd = 5.5;
          const p1 = [x2, y2], p2 = [x2 - ax * L2 + -ay * Wd, y2 - ay * L2 + ax * Wd], p3 = [x2 - ax * L2 - -ay * Wd, y2 - ay * L2 - ax * Wd];
          s += '<polygon class="g-arrow' + hlClass(e.hl) + '" points="' + [p1, p2, p3].map((p) => p.join(',')).join(' ') + '"/>';
        }
        const lab = e.label != null ? e.label : (e.w != null ? fmt(e.w) : null);
        if (lab != null && lab !== '') {
          let lx, ly;
          if (off) { lx = 0.25 * a.x + 0.5 * cx + 0.25 * b.x; ly = 0.25 * a.y + 0.5 * cy + 0.25 * b.y; }
          else { lx = (a.x + b.x) / 2; ly = (a.y + b.y) / 2; }
          const pos = e.labelPos;
          if (typeof pos === 'number') { lx = a.x + (b.x - a.x) * pos; ly = a.y + (b.y - a.y) * pos; }
          labels.push({ lx, ly, lab: String(lab), hl: e.hl });
        }
      });
      labels.forEach((l) => {
        const wl = Math.max(16, l.lab.length * 7.4 + 8);
        s += '<g class="g-elabel' + hlClass(l.hl) + '"><rect x="' + (l.lx - wl / 2) + '" y="' + (l.ly - 9) + '" width="' + wl + '" height="18" rx="5"/><text x="' + l.lx + '" y="' + (l.ly + 1) + '">' + esc(l.lab) + '</text></g>';
      });
      nodes.forEach((n) => {
        s += '<g class="g-node' + hlClass(n.hl) + '"><circle cx="' + n.x + '" cy="' + n.y + '" r="' + GR + '"/>' +
          '<text class="g-text" x="' + n.x + '" y="' + (n.y + 1) + '">' + esc(n.label != null ? n.label : n.id) + '</text>';
        if (n.badge != null && n.badge !== '') {
          const bw = Math.max(18, String(n.badge).length * 7 + 8);
          const by = n.badgePos === 'bottom' ? n.y + GR + 12 : n.y - GR - 12;
          s += '<rect class="g-badge-bg" x="' + (n.x - bw / 2) + '" y="' + (by - 9) + '" width="' + bw + '" height="17" rx="8"/>' +
            '<text class="g-badge" x="' + n.x + '" y="' + (by + 1) + '">' + esc(n.badge) + '</text>';
        }
        s += '</g>';
      });
      s += '</svg>';
      this.el.innerHTML = s;
    }
  }
  function norm(x, y) { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; }

  /* ===================================================================== */
  /* Table panel                                                           */
  /* ===================================================================== */
  class TablePanel {
    constructor(el) { this.el = el; el.classList.add('tbl-wrap'); }
    update(d) {
      const rowHl = d.rowHl || {}, cellHl = d.cellHl || {}, colHl = d.colHl || {};
      let s = '<table class="dtable' + (d.compact ? ' compact' : '') + '">';
      if (d.headers) {
        s += '<thead><tr>' + d.headers.map((h, c) => '<th class="' + hlClass(colHl[c]).trim() + '">' + esc(fmt(h)) + '</th>').join('') + '</tr></thead>';
      }
      s += '<tbody>';
      (d.rows || []).forEach((row, r) => {
        s += '<tr class="' + hlClass(rowHl[r]).trim() + '">';
        row.forEach((cell, c) => {
          const h = cellHl[r + ',' + c] || colHl[c];
          const html = cell && typeof cell === 'object' && cell.html != null ? cell.html : esc(fmt(cell));
          s += '<td class="' + hlClass(h).trim() + '">' + html + '</td>';
        });
        s += '</tr>';
      });
      s += '</tbody></table>';
      this.el.innerHTML = s;
    }
  }

  /* ===================================================================== */
  /* List panel (queue / stack / sequence)                                 */
  /* ===================================================================== */
  class ListPanel {
    constructor(el) { this.el = el; el.classList.add('list-wrap'); }
    update(d) {
      const items = (d.items || []).map((it) => (it && typeof it === 'object' ? it : { label: it }));
      const style = d.style || 'seq';
      let s = '<div class="dlist ' + style + '">';
      if (style === 'queue') s += '<span class="dlist-end">front →</span>';
      if (style === 'stack') s += '<span class="dlist-end">bottom</span>';
      if (!items.length) s += '<span class="dlist-empty">(rỗng)</span>';
      items.forEach((it, i) => {
        if (i > 0 && style === 'seq') s += '<span class="dlist-arrow">' + (d.sep != null ? esc(d.sep) : '→') + '</span>';
        s += '<span class="dlist-item' + hlClass(it.hl) + '">' + esc(fmt(it.label)) + (it.sub != null ? '<small>' + esc(it.sub) + '</small>' : '') + '</span>';
      });
      if (style === 'queue') s += '<span class="dlist-end">← rear</span>';
      if (style === 'stack') s += '<span class="dlist-end">← top</span>';
      s += '</div>';
      this.el.innerHTML = s;
    }
  }

  /* ===================================================================== */
  /* Buckets panel (hash tables: open addressing / chaining / buckets)     */
  /* ===================================================================== */
  class BucketsPanel {
    constructor(el) { this.el = el; el.classList.add('bk-wrap'); }
    update(d) {
      const mode = d.mode || 'chain';
      const slots = d.slots || [];
      let s = '<div class="buckets ' + mode + (slots.length > 16 ? ' dense' : '') + '">';
      slots.forEach((sl, i) => {
        const items = (sl.items || []).map((it) => (it && typeof it === 'object' ? it : { label: it }));
        s += '<div class="bk-row' + hlClass(sl.hl) + '"><div class="bk-idx">' + esc(sl.label != null ? sl.label : i) + '</div><div class="bk-items">';
        if (mode === 'bucket') {
          const cap = sl.capacity || d.capacity || items.length || 1;
          for (let k = 0; k < cap; k++) {
            const it = items[k];
            s += '<span class="bk-item' + (it ? hlClass(it.hl) : ' empty') + '">' + (it ? esc(fmt(it.label)) : '') + '</span>';
          }
        } else if (mode === 'open') {
          const it = items[0];
          s += '<span class="bk-item wide' + (it ? hlClass(it.hl) : ' empty') + '">' + (it ? esc(fmt(it.label)) : '') + '</span>';
        } else {
          if (!items.length) s += '<span class="bk-null">∅</span>';
          items.forEach((it, k) => {
            if (k > 0) s += '<span class="bk-arrow">→</span>';
            s += '<span class="bk-item' + hlClass(it.hl) + '">' + esc(fmt(it.label)) + '</span>';
          });
        }
        s += '</div>' + (sl.note ? '<div class="bk-note">' + esc(sl.note) + '</div>' : '') + '</div>';
      });
      s += '</div>';
      this.el.innerHTML = s;
    }
  }

  /* ===================================================================== */
  /* HTML panel                                                            */
  /* ===================================================================== */
  class HtmlPanel {
    constructor(el) { this.el = el; el.classList.add('html-wrap'); }
    update(d) { this.el.innerHTML = d.html || ''; }
  }

  const RENDERERS = { array: ArrayPanel, tree: TreePanel, graph: GraphPanel, table: TablePanel, list: ListPanel, buckets: BucketsPanel, html: HtmlPanel };
  DSA.RENDERERS = RENDERERS;
})();
