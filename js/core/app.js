/* =========================================================================
 * DSA Visualizer – app.js
 * Navigation, algorithm page, step player, code panel, variables & log.
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;
  const esc = DSA.escape;
  const $ = (sel, root) => (root || document).querySelector(sel);

  const LANGS = [
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'python', label: 'Python' },
    { id: 'pseudo', label: 'Mã giả' },
  ];

  const store = {
    get(k, d) { try { const v = localStorage.getItem('dsa.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dsa.' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };

  const S = {
    algo: null,
    ds: null,
    undo: [],
    op: null,          // selected op (form)
    playOp: null,      // op whose steps are loaded
    steps: [],
    idx: 0,
    playing: false,
    timer: null,
    speed: store.get('speed', 1),
    lang: store.get('lang', 'cpp'),
    args: {},          // algoId.opId.argId -> value
    stage: null,
    codeCache: {},
  };

  /* ===================================================================== */
  /* Sidebar                                                               */
  /* ===================================================================== */
  function buildNav() {
    const nav = $('#nav');
    const filter = ($('#nav-search').value || '').toLowerCase().trim();
    let html = '';
    DSA.chapters.forEach((ch) => {
      const list = DSA.algos.filter((a) => a.chapter === ch.id && (!filter ||
        (a.name + ' ' + (a.short || '') + ' ' + ch.name + ' ' + ch.en).toLowerCase().includes(filter)));
      if (!list.length) return;
      html += '<div class="nav-chapter"><div class="nav-ch-title"><span class="nav-ico">' + ch.icon + '</span>' + esc(ch.name) +
        '<span class="nav-count">' + list.length + '</span></div><ul>';
      list.forEach((a) => {
        html += '<li><a href="#/algo/' + a.id + '" data-id="' + a.id + '"' + (S.algo && S.algo.id === a.id ? ' class="active"' : '') + '>' +
          esc(a.name) + (a.short ? '<small>' + esc(a.short) + '</small>' : '') + '</a></li>';
      });
      html += '</ul></div>';
    });
    if (!html) html = '<div class="nav-empty">Không tìm thấy.</div>';
    nav.innerHTML = html;
  }

  /* ===================================================================== */
  /* Routing                                                               */
  /* ===================================================================== */
  function route() {
    stop();
    const h = location.hash || '';
    const m = h.match(/^#\/algo\/([\w\-]+)/);
    document.body.classList.remove('nav-open');
    if (m && DSA.byId[m[1]]) openAlgo(DSA.byId[m[1]]);
    else if (m && m[1] === 'cheatsheet') renderCheatsheet();
    else renderHome();
    buildNav();
    window.scrollTo(0, 0);
  }

  /* ===================================================================== */
  /* Home                                                                  */
  /* ===================================================================== */
  function renderHome() {
    S.algo = null;
    document.title = 'DSA Visualizer – Ôn tập CTDL & GT';
    let cards = '';
    DSA.chapters.forEach((ch) => {
      const list = DSA.algos.filter((a) => a.chapter === ch.id);
      if (!list.length) return;
      cards += '<div class="home-card"><div class="hc-head"><span class="hc-ico">' + ch.icon + '</span><div><h3>' + esc(ch.name) +
        '</h3><div class="hc-en">' + esc(ch.en) + '</div></div></div><ul>' +
        list.map((a) => '<li><a href="#/algo/' + a.id + '">' + esc(a.name) + '</a></li>').join('') + '</ul></div>';
    });
    $('#view').innerHTML =
      '<div class="home">' +
      '<section class="hero"><h1>Trực quan hóa <span class="grad">Cấu trúc dữ liệu &amp; Giải thuật</span></h1>' +
      '<p>Ôn tập toàn diện các chương: Sorting, Search &amp; Hash, Tree, Heap, AVL, Splay, B-Tree, Graph. ' +
      'Mỗi giải thuật có <b>hoạt ảnh từng bước</b>, <b>tô sáng dòng code đang chạy</b> và xem mã nguồn bằng <b>C++ / Java / Python / Mã giả</b>.</p>' +
      '<div class="hero-actions"><a class="btn primary" href="#/algo/' + (DSA.algos[0] ? DSA.algos[0].id : '') + '">Bắt đầu ôn tập →</a>' +
      '<a class="btn" href="#/algo/cheatsheet">📋 Bảng tổng hợp độ phức tạp</a></div>' +
      '<div class="hero-stats"><div><b>' + DSA.algos.length + '</b><span>giải thuật / thao tác</span></div><div><b>4</b><span>ngôn ngữ hiển thị code</span></div><div><b>' +
      DSA.chapters.filter((c) => DSA.algos.some((a) => a.chapter === c.id)).length + '</b><span>chương</span></div></div></section>' +
      '<section class="howto"><h2>Cách dùng</h2><ol>' +
      '<li>Chọn giải thuật ở thanh bên trái.</li>' +
      '<li>Nhập dữ liệu (hoặc bấm 🎲 để sinh ngẫu nhiên) rồi bấm <b>▶ Chạy</b>.</li>' +
      '<li>Dùng thanh điều khiển để <b>phát / tạm dừng / tiến – lùi từng bước</b> (phím <kbd>Space</kbd>, <kbd>←</kbd>, <kbd>→</kbd>).</li>' +
      '<li>Theo dõi dòng code được tô sáng, bảng biến và nhật ký để hiểu từng bước.</li></ol></section>' +
      '<section class="home-grid">' + cards + '</section></div>';
  }

  function renderCheatsheet() {
    S.algo = null;
    document.title = 'Bảng tổng hợp – DSA Visualizer';
    let rows = '';
    DSA.chapters.forEach((ch) => {
      DSA.algos.filter((a) => a.chapter === ch.id && a.complexity && a.complexity.length).forEach((a) => {
        rows += '<tr><td><span class="tag">' + esc(ch.name) + '</span></td><td><a href="#/algo/' + a.id + '">' + esc(a.name) + '</a></td><td>' +
          a.complexity.map((c) => '<span class="chip"><i>' + esc(c[0]) + '</i> ' + esc(c[1]) + '</span>').join(' ') + '</td></tr>';
      });
    });
    $('#view').innerHTML = '<div class="home"><section class="hero small"><h1>📋 Bảng tổng hợp độ phức tạp</h1>' +
      '<p>Bấm vào tên giải thuật để mở trang trực quan.</p></section>' +
      '<div class="card"><table class="dtable cheat"><thead><tr><th>Chương</th><th>Giải thuật</th><th>Độ phức tạp / Tính chất</th></tr></thead><tbody>' +
      rows + '</tbody></table></div></div>';
  }

  /* ===================================================================== */
  /* Algorithm page                                                        */
  /* ===================================================================== */
  function openAlgo(algo) {
    S.algo = algo;
    S.undo = [];
    S.steps = []; S.idx = 0;
    S.op = algo.ops[0] || null;
    S.playOp = S.op;
    const ch = DSA.chapters.find((c) => c.id === algo.chapter) || { name: '' };
    document.title = algo.name + ' – DSA Visualizer';

    const chips = (algo.complexity || []).map((c) => '<span class="chip"><i>' + esc(c[0]) + '</i> ' + esc(c[1]) + '</span>').join('');
    const notes = (algo.notes || []).length ? '<div class="notes"><h4>💡 Ghi nhớ khi ôn tập</h4><ul>' + algo.notes.map((n) => '<li>' + n + '</li>').join('') + '</ul></div>' : '';
    const infoOpen = store.get('infoOpen', true);

    $('#view').innerHTML =
      '<div class="algo-page">' +
      '<header class="algo-head"><div class="crumbs"><a href="#">Trang chủ</a> › ' + esc(ch.name) + '</div>' +
      '<h1>' + esc(algo.name) + (algo.short ? ' <small>' + esc(algo.short) + '</small>' : '') + '</h1>' +
      '<div class="chips">' + chips + '</div></header>' +
      '<details class="card algo-info"' + (infoOpen ? ' open' : '') + '><summary>📖 Lý thuyết &amp; ý tưởng</summary>' +
      '<div class="info-body">' + (algo.description || '') + notes + '</div></details>' +
      '<div class="algo-grid">' +
      '<div class="col-main">' +
      '<div class="card ops"><div class="op-tabs"></div><div class="op-form"></div></div>' +
      '<div class="card stage-card"><div class="stage" id="stage"></div></div>' +
      '<div class="card player">' +
      '<div class="pl-buttons">' +
      '<button class="btn icon" data-act="first" title="Về đầu (Home)">⏮</button>' +
      '<button class="btn icon" data-act="prev" title="Lùi 1 bước (←)">◀</button>' +
      '<button class="btn icon primary play" data-act="play" title="Phát / Tạm dừng (Space)">▶</button>' +
      '<button class="btn icon" data-act="next" title="Tiến 1 bước (→)">▶|</button>' +
      '<button class="btn icon" data-act="last" title="Đến cuối (End)">⏭</button>' +
      '</div>' +
      '<input type="range" class="pl-progress" min="0" max="0" value="0">' +
      '<span class="pl-count">0 / 0</span>' +
      '<label class="pl-speed" title="Tốc độ">🐢<input type="range" min="0" max="8" step="1" class="pl-speed-in">🐇<span class="pl-speed-val"></span></label>' +
      '</div>' +
      '<div class="card msg"><div class="msg-text">Bấm <b>▶ Chạy</b> để bắt đầu.</div></div>' +
      '</div>' +
      '<div class="col-side">' +
      '<div class="card code-card"><div class="code-head"><div class="lang-tabs"></div><button class="btn ghost small copy-btn" title="Sao chép code">⧉ Copy</button></div>' +
      '<div class="code-op-name"></div><pre class="code"><code></code></pre></div>' +
      '<div class="card vars-card"><h4>🧮 Biến</h4><div class="vars"></div></div>' +
      '<div class="card log-card"><h4>📝 Nhật ký các bước</h4><ol class="log"></ol></div>' +
      '</div></div></div>';

    $('.algo-info').addEventListener('toggle', (e) => store.set('infoOpen', e.target.open));
    S.stage = new DSA.Stage($('#stage'));
    buildOpTabs();
    buildOpForm();
    buildLangTabs();
    bindPlayer();
    S.ds = {};
    try { if (algo.init) algo.init(S.ds); } catch (e) { console.error(e); }
    if (algo.view) {
      showIdle();
      renderCode();
    } else if (S.op) {
      runOp(S.op, false);
    }
  }

  function showIdle(msg) {
    S.steps = []; S.idx = 0;
    const panels = S.algo.view ? S.algo.view(S.ds) : [];
    S.stage.update(panels, { animate: false });
    updatePlayerUI();
    $('.msg-text').innerHTML = msg || (S.algo.idleMsg || 'Chọn thao tác và bấm <b>▶ Chạy</b>.');
    $('.vars').innerHTML = '<div class="muted">—</div>';
    $('.log').innerHTML = '';
  }

  function buildOpTabs() {
    const ops = S.algo.ops;
    const el = $('.op-tabs');
    if (ops.length <= 1) { el.style.display = 'none'; return; }
    el.innerHTML = ops.map((op) => '<button class="op-tab' + (op === S.op ? ' active' : '') + '" data-op="' + op.id + '">' + esc(op.label) + '</button>').join('');
    el.querySelectorAll('.op-tab').forEach((b) => b.addEventListener('click', () => {
      S.op = ops.find((o) => o.id === b.dataset.op);
      el.querySelectorAll('.op-tab').forEach((x) => x.classList.toggle('active', x === b));
      buildOpForm();
      if (!S.steps.length || S.playOp !== S.op) { S.playOp = S.op; renderCode(); highlightCode(null); }
    }));
  }

  function argKey(op, a) { return S.algo.id + '.' + op.id + '.' + a.id; }

  function buildOpForm() {
    const op = S.op;
    const el = $('.op-form');
    if (!op) { el.innerHTML = ''; return; }
    let html = '';
    op.args.forEach((a) => {
      const k = argKey(op, a);
      let v = (typeof a.value === 'function') ? a.value(S.ds) : S.args[k];
      if (v === undefined) v = typeof a.value === 'function' ? a.value(S.ds) : (a.value != null ? a.value : '');
      S.args[k] = v;
      html += '<label class="arg arg-' + a.type + '"><span>' + esc(a.label || a.id) + '</span>';
      if (a.type === 'select') {
        const opts = (typeof a.options === 'function' ? a.options(S.ds) : a.options) || [];
        html += '<select data-arg="' + a.id + '">' + opts.map((o) => {
          const val = typeof o === 'object' ? o.value : o; const lab = typeof o === 'object' ? o.label : o;
          return '<option value="' + esc(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(lab) + '</option>';
        }).join('') + '</select>';
      } else if (a.type === 'checkbox') {
        html += '<input type="checkbox" data-arg="' + a.id + '"' + (v ? ' checked' : '') + '>';
      } else {
        html += '<input type="' + (a.type === 'number' ? 'number' : 'text') + '" data-arg="' + a.id + '" value="' + esc(v) + '"' +
          (a.placeholder ? ' placeholder="' + esc(a.placeholder) + '"' : '') + (a.type === 'array' ? ' class="wide"' : '') + '>';
      }
      if (a.random || a.type === 'array') html += '<button class="btn ghost small rnd" data-rnd="' + a.id + '" title="Sinh ngẫu nhiên">🎲</button>';
      html += '</label>';
    });
    html += '<div class="op-actions"><button class="btn primary run-btn">▶ ' + esc(op.runLabel || 'Chạy') + '</button>';
    if (S.algo.view) {
      html += '<button class="btn ghost undo-btn" title="Hoàn tác thao tác trước">↶ Hoàn tác</button>';
      html += '<button class="btn ghost reset-btn" title="Khôi phục dữ liệu mẫu ban đầu">⟲ Mặc định</button>';
    }
    html += '</div>';
    if (op.hint) html += '<div class="op-hint">' + op.hint + '</div>';
    el.innerHTML = html;
    el.querySelectorAll('[data-arg]').forEach((inp) => {
      const a = op.args.find((x) => x.id === inp.dataset.arg);
      const ev = inp.tagName === 'SELECT' || inp.type === 'checkbox' ? 'change' : 'input';
      inp.addEventListener(ev, () => {
        S.args[argKey(op, a)] = inp.type === 'checkbox' ? inp.checked : inp.value;
        if (a.onChange) {
          a.onChange(inp.value, S.ds);
          if (S.algo && S.algo.view) showIdle();
        }
        if (a.rerender) buildOpForm();
      });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); runOp(op, true); } });
    });
    el.querySelectorAll('[data-rnd]').forEach((b) => b.addEventListener('click', () => {
      const a = op.args.find((x) => x.id === b.dataset.rnd);
      const v = a.random ? a.random(S.ds) : DSA.randomArray(10, 1, 99);
      S.args[argKey(op, a)] = v;
      const inp = el.querySelector('[data-arg="' + a.id + '"]');
      if (inp) inp.value = v;
    }));
    $('.run-btn', el).addEventListener('click', () => runOp(op, true));
    const u = $('.undo-btn', el);
    if (u) u.addEventListener('click', doUndo);
    const r = $('.reset-btn', el);
    if (r) r.addEventListener('click', doReset);
  }

  function getArgs(op) {
    const out = {};
    op.args.forEach((a) => {
      let v = S.args[argKey(op, a)];
      if (v === undefined) v = typeof a.value === 'function' ? a.value(S.ds) : a.value;
      if (a.type === 'array') v = DSA.parseArray(v);
      else if (a.type === 'number') v = DSA.parseNumber(v, typeof a.value === 'number' ? a.value : 0);
      out[a.id] = v;
    });
    return out;
  }

  function runOp(op, autoplay) {
    stop();
    const before = DSA.clone(S.ds);
    let steps;
    try {
      steps = op.run(getArgs(op), S.ds) || [];
    } catch (e) {
      console.error(e);
      S.ds = before;
      toast(e && e.message ? e.message : String(e), 'error');
      return;
    }
    if (S.algo.view) S.undo.push(before);
    S.playOp = op;
    loadSteps(steps);
    renderCode();
    if (autoplay && steps.length > 1) play(); else show(0, false);
  }

  function doUndo() {
    if (!S.undo.length) { toast('Không còn thao tác để hoàn tác.'); return; }
    stop();
    S.ds = S.undo.pop();
    buildOpForm();
    showIdle('Đã hoàn tác thao tác trước.');
  }
  function doReset() {
    stop();
    S.undo = [];
    S.ds = {};
    if (S.algo.init) S.algo.init(S.ds);
    buildOpForm();
    showIdle('Đã khôi phục dữ liệu mẫu.');
  }

  /* ===================================================================== */
  /* Steps / player                                                        */
  /* ===================================================================== */
  function loadSteps(steps) {
    let lastPanels = null;
    steps.forEach((s) => {
      if (s.panels) lastPanels = s.panels; else s.panels = lastPanels;
    });
    if (!steps.length && S.algo.view) steps = [{ msg: 'Hoàn tất.', panels: S.algo.view(S.ds) }];
    S.steps = steps;
    S.idx = 0;
    // log
    $('.log').innerHTML = steps.map((s, i) => '<li data-i="' + i + '">' + stripTags(s.msg || '') + '</li>').join('');
    $('.log').querySelectorAll('li').forEach((li) => li.addEventListener('click', () => { stop(); show(+li.dataset.i, false); }));
    const pr = $('.pl-progress');
    pr.max = Math.max(0, steps.length - 1);
    updatePlayerUI();
  }

  function stripTags(h) { const d = document.createElement('div'); d.innerHTML = h; return esc(d.textContent || ''); }

  function interval() { return 1000 / speedFactor(); }
  const SPEEDS = [0.25, 0.4, 0.6, 0.8, 1, 1.5, 2, 3, 5];
  function speedFactor() { return SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, S.speedIdx != null ? S.speedIdx : SPEEDS.indexOf(S.speed) >= 0 ? SPEEDS.indexOf(S.speed) : 4))]; }

  let prevVars = {};
  function show(i, animate) {
    if (!S.steps.length) return;
    i = Math.max(0, Math.min(S.steps.length - 1, i));
    const st = S.steps[i];
    const prevIdx = S.idx;
    S.idx = i;
    const dur = Math.min(interval() * 0.75, 480);
    S.stage.update(st.panels || [], { animate: animate !== false && Math.abs(i - prevIdx) === 1, duration: dur });
    $('.msg-text').innerHTML = '<span class="step-no">Bước ' + (i + 1) + '/' + S.steps.length + '</span> ' + (st.msg || '');
    highlightCode(st.line);
    renderVars(st.vars, i > 0 ? S.steps[i - 1].vars : null);
    const log = $('.log');
    log.querySelectorAll('li').forEach((li, k) => { li.classList.toggle('cur', k === i); li.classList.toggle('future', k > i); });
    const cur = log.querySelector('li.cur');
    if (cur) { const top = cur.offsetTop - log.offsetTop; if (top < log.scrollTop || top > log.scrollTop + log.clientHeight - 30) log.scrollTop = top - log.clientHeight / 2; }
    updatePlayerUI();
  }

  function renderVars(vars, prev) {
    const el = $('.vars');
    if (!vars || !Object.keys(vars).length) { el.innerHTML = '<div class="muted">—</div>'; return; }
    prev = prev || {};
    el.innerHTML = Object.keys(vars).map((k) => {
      const v = DSA.fmt(vars[k]);
      const changed = prev[k] === undefined || DSA.fmt(prev[k]) !== v;
      return '<div class="var' + (changed ? ' changed' : '') + '"><span class="vn">' + esc(k) + '</span><span class="vv">' + esc(v) + '</span></div>';
    }).join('');
  }

  function updatePlayerUI() {
    const n = S.steps.length;
    const c = $('.pl-count'); if (!c) return;
    c.textContent = (n ? S.idx + 1 : 0) + ' / ' + n;
    const pr = $('.pl-progress'); pr.max = Math.max(0, n - 1); pr.value = S.idx;
    pr.style.setProperty('--p', n > 1 ? (S.idx / (n - 1)) * 100 + '%' : '0%');
    const pb = $('.player .play');
    pb.textContent = S.playing ? '⏸' : '▶';
    pb.classList.toggle('playing', S.playing);
  }

  function play() {
    if (!S.steps.length) { if (S.op) runOp(S.op, true); return; }
    if (S.idx >= S.steps.length - 1) show(0, false);
    S.playing = true;
    updatePlayerUI();
    tick();
  }
  function tick() {
    clearTimeout(S.timer);
    S.timer = setTimeout(() => {
      if (!S.playing) return;
      if (S.idx >= S.steps.length - 1) { stop(); return; }
      show(S.idx + 1, true);
      tick();
    }, interval());
  }
  function stop() {
    S.playing = false;
    clearTimeout(S.timer);
    if ($('.player .play')) updatePlayerUI();
  }
  function toggle() { if (S.playing) stop(); else play(); }

  function bindPlayer() {
    document.querySelectorAll('.player [data-act]').forEach((b) => b.addEventListener('click', () => act(b.dataset.act)));
    const pr = $('.pl-progress');
    pr.addEventListener('input', () => { stop(); show(+pr.value, false); });
    const sp = $('.pl-speed-in');
    let si = SPEEDS.indexOf(S.speed); if (si < 0) si = 4;
    S.speedIdx = si; sp.value = si;
    const upd = () => { S.speedIdx = +sp.value; S.speed = SPEEDS[S.speedIdx]; store.set('speed', S.speed); $('.pl-speed-val').textContent = S.speed + '×'; };
    sp.addEventListener('input', upd); upd();
  }

  function act(a) {
    if (a === 'play') return toggle();
    stop();
    if (a === 'first') show(0, false);
    if (a === 'prev') show(S.idx - 1, true);
    if (a === 'next') { if (!S.steps.length && S.op) runOp(S.op, false); else show(S.idx + 1, true); }
    if (a === 'last') show(S.steps.length - 1, false);
  }

  /* ===================================================================== */
  /* Code panel                                                            */
  /* ===================================================================== */
  function buildLangTabs() {
    const el = $('.lang-tabs');
    el.innerHTML = LANGS.map((l) => '<button class="lang-tab' + (l.id === S.lang ? ' active' : '') + '" data-lang="' + l.id + '">' + l.label + '</button>').join('');
    el.querySelectorAll('.lang-tab').forEach((b) => b.addEventListener('click', () => {
      S.lang = b.dataset.lang; store.set('lang', S.lang);
      el.querySelectorAll('.lang-tab').forEach((x) => x.classList.toggle('active', x === b));
      renderCode();
      if (S.steps.length) highlightCode(S.steps[S.idx].line);
    }));
    $('.copy-btn').addEventListener('click', () => {
      const pc = currentProcessed();
      if (!pc) return;
      const txt = pc.plain.join('\n');
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Đã sao chép code.'), () => {
        const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); toast('Đã sao chép code.'); } catch (e) { /* ignore */ }
        ta.remove();
      });
    });
  }

  function currentCodeSrc() {
    const op = S.playOp || S.op;
    const code = (op && op.code) || S.algo.code || {};
    return { op, src: code[S.lang], all: code };
  }
  function currentProcessed() {
    const { op, src } = currentCodeSrc();
    if (!src) return null;
    const key = S.algo.id + '|' + (op ? op.id : '') + '|' + S.lang;
    if (!S.codeCache[key]) S.codeCache[key] = DSA.processCode(src, S.lang);
    return S.codeCache[key];
  }
  function renderCode() {
    const { op, all } = currentCodeSrc();
    const pc = currentProcessed();
    const el = $('.code code');
    $('.code-op-name').textContent = op && S.algo.ops.length > 1 ? 'Thao tác: ' + op.label : '';
    if (!pc) {
      const avail = LANGS.filter((l) => all[l.id]).map((l) => l.label).join(', ');
      el.innerHTML = '<span class="muted">(Không có code ' + esc(LANGS.find((l) => l.id === S.lang).label) + ' cho thao tác này' + (avail ? ' – có: ' + esc(avail) : '') + ')</span>';
      return;
    }
    el.innerHTML = pc.html.map((h, i) => '<span class="cl" data-l="' + i + '"><span class="ln">' + (i + 1) + '</span><span class="lc">' + h + '</span></span>').join('');
  }
  function highlightCode(line) {
    const el = $('.code code');
    if (!el) return;
    el.querySelectorAll('.cl.hl').forEach((x) => x.classList.remove('hl'));
    const pc = currentProcessed();
    if (!pc || !line) return;
    const tags = Array.isArray(line) ? line : [line];
    let first = null;
    tags.forEach((t) => (pc.tags[t] || []).forEach((li) => {
      const ln = el.querySelector('.cl[data-l="' + li + '"]');
      if (ln) { ln.classList.add('hl'); if (!first) first = ln; }
    }));
    if (first) {
      const pre = el.parentElement;
      const top = first.offsetTop - pre.offsetTop;
      if (top < pre.scrollTop + 20 || top > pre.scrollTop + pre.clientHeight - 40) pre.scrollTop = Math.max(0, top - pre.clientHeight / 3);
    }
  }

  /* ===================================================================== */
  /* Misc UI                                                               */
  /* ===================================================================== */
  function toast(msg, type) {
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
  }
  DSA.toast = toast;

  function showHelp() {
    $('#modal-content').innerHTML = '<h2>⌨ Phím tắt</h2><table class="dtable"><tbody>' +
      [['Space', 'Phát / Tạm dừng'], ['→', 'Bước tiếp theo'], ['←', 'Bước trước'], ['Home / End', 'Về đầu / Đến cuối'], ['Enter (trong ô nhập)', 'Chạy thao tác'], ['Ctrl + K', 'Tìm giải thuật'], ['+ / −', 'Tăng / giảm tốc độ']]
        .map((r) => '<tr><td><kbd>' + r[0] + '</kbd></td><td>' + r[1] + '</td></tr>').join('') + '</tbody></table>' +
      '<h3>Màu sắc</h3><div class="legend">' +
      [['active', 'Đang xét'], ['compare', 'So sánh'], ['swap', 'Hoán đổi / di chuyển'], ['sorted', 'Đã đúng vị trí'], ['pivot', 'Pivot / khóa đặc biệt'], ['found', 'Tìm thấy'], ['visited', 'Đã thăm'], ['dim', 'Bỏ qua']]
        .map((r) => '<span class="lg hl-' + r[0] + '">' + r[1] + '</span>').join('') + '</div>';
    $('#modal').classList.remove('hidden');
  }

  function bindGlobal() {
    $('#nav-search').addEventListener('input', buildNav);
    $('#theme-toggle').addEventListener('click', () => {
      const t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = t; store.set('theme', t);
      if (S.algo && S.steps.length) show(S.idx, false); else if (S.algo && S.algo.view) S.stage.update(S.algo.view(S.ds), { animate: false });
    });
    $('#help-btn').addEventListener('click', showHelp);
    $('#menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') e.target.classList.add('hidden'); });
    window.addEventListener('hashchange', route);
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (!S.algo || !S.stage) return;
        if (S.steps.length) S.stage.update(S.steps[S.idx].panels || [], { animate: false });
        else if (S.algo.view) S.stage.update(S.algo.view(S.ds), { animate: false });
      }, 120);
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#nav-search').focus(); return; }
      if (e.key === 'Escape') { $('#modal').classList.add('hidden'); }
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (!S.algo) return;
      if (e.key === ' ') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); act('next'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); act('prev'); }
      else if (e.key === 'Home') { e.preventDefault(); act('first'); }
      else if (e.key === 'End') { e.preventDefault(); act('last'); }
      else if (e.key === '+' || e.key === '=' || e.key === '-') {
        const sp = $('.pl-speed-in'); if (!sp) return;
        sp.value = Math.max(0, Math.min(8, +sp.value + (e.key === '-' ? -1 : 1)));
        sp.dispatchEvent(new Event('input'));
      }
    });
  }

  DSA.start = function () {
    document.documentElement.dataset.theme = store.get('theme', 'dark');
    bindGlobal();
    route();
  };

  // exposed for tests / debugging
  DSA._state = S;
})();
