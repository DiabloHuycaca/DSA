/* =========================================================================
 * DSA Visualizer – graph2.js
 * Slide: Graph.pdf (trang 48–85)
 * 1. Dijkstra's Shortest Path (ShortestPath – Slide p.48–60)
 * 2. Prim's Minimum Spanning Tree (MinimumSpanningTree – Slide p.61–70)
 * 3. Maximum Flow (Pipeline Network S..T – Slide p.71–75)
 * 4. Bipartite Matching (Applicants p..t & Jobs a..e – Slide p.76–80)
 * 5. Graph Coloring (Map Coloring – Slide p.81–85)
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;
  const INF = Infinity;

  // Graph A..F used in Slide p.60 (Dijkstra) and Slide p.66 (Prim)
  const AF_NODES = [
    { id: 'A', label: 'A', x: 55,  y: 120 },
    { id: 'B', label: 'B', x: 165, y: 45  },
    { id: 'C', label: 'C', x: 165, y: 195 },
    { id: 'D', label: 'D', x: 295, y: 45  },
    { id: 'E', label: 'E', x: 295, y: 195 },
    { id: 'F', label: 'F', x: 405, y: 120 },
  ];
  const AF_EDGES = [
    { from: 'A', to: 'B', w: 6 },
    { from: 'A', to: 'C', w: 3 },
    { from: 'B', to: 'C', w: 2 },
    { from: 'B', to: 'D', w: 5 },
    { from: 'C', to: 'D', w: 3 },
    { from: 'C', to: 'E', w: 4 },
    { from: 'D', to: 'E', w: 2 },
    { from: 'D', to: 'F', w: 3 },
    { from: 'E', to: 'F', w: 5 },
  ];

  // Digraph 0..4 used in Slide p.51-56 (Dijkstra)
  const G04_NODES = [
    { id: '0', label: '0', x: 220, y: 35  },
    { id: '4', label: '4', x: 65,  y: 115 },
    { id: '1', label: '1', x: 375, y: 115 },
    { id: '3', label: '3', x: 130, y: 220 },
    { id: '2', label: '2', x: 310, y: 220 },
  ];
  const G04_EDGES = [
    { from: '0', to: '4', w: 2 },
    { from: '0', to: '2', w: 3 },
    { from: '0', to: '1', w: 5 },
    { from: '4', to: '1', w: 6 },
    { from: '4', to: '2', w: 10 },
    { from: '4', to: '3', w: 4 },
    { from: '1', to: '3', w: 6 },
    { from: '1', to: '2', w: 2, curve: 22 },
    { from: '2', to: '1', w: 1, curve: 22 },
    { from: '2', to: '3', w: 2 },
  ];

  /* ---------------------------------------------------------------------
   * 1. Dijkstra's Shortest Path (Graph.pdf p.48-60)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'dijkstra',
    chapter: 'graph',
    name: "Dijkstra's Shortest Path (Đường đi ngắn nhất)",
    short: 'O(V²) / O(E log V)',
    complexity: [
      ['Ma trận / Danh sách', 'O(V²)'],
      ['Binary Heap Priority Queue', 'O((V + E) log V)'],
      ['Điều kiện trọng số', 'Không âm (w ≥ 0)'],
    ],
    description:
      '<p>Thuật toán tham lam <b>Dijkstra (1959)</b> tìm đường đi ngắn nhất từ đỉnh nguồn <code>source</code> tới mọi đỉnh khác trong đồ thị có trọng số không âm:</p>' +
      '<ul>' +
      '<li>Duy trì tập <code>S</code> chứa các đỉnh đã biết khoảng cách ngắn nhất từ <code>source</code>, và danh sách <code>listOfShortestPath</code> lưu <code>DistanceNode { destination, distance }</code>.</li>' +
      '<li>Ở mỗi bước, chọn đỉnh <code>v ∉ S</code> có <code>distance</code> nhỏ nhất đưa vào <code>S</code>, rồi cập nhật (relax) khoảng cách cho mọi <code>w ∉ S</code> nếu <code>minWeight + weight(v, w) &lt; distance[w]</code>.</li>' +
      '</ul>',
    ops: [{
      id: 'run',
      label: 'Chạy ShortestPath (Dijkstra)',
      args: [
        {
          id: 'preset', label: 'Đồ thị mẫu', type: 'select', value: 'p60',
          options: [
            { value: 'p60', label: 'Đồ thị vô hướng A..F (mặc định source = A)' },
            { value: 'p51', label: 'Đồ thị có hướng 0..4 (mặc định source = 0)' },
          ],
        },
        { id: 'srcInput', label: 'Đỉnh nguồn (source, để trống = mặc định)', type: 'text', value: '' },
      ],
      code: {
        cpp: `void shortestPath(int src, int V, const int weight[][MAXV], int dist[]) {
    std::vector<bool> inS(V, false);
    inS[src] = true;                                @@initS
    for (int v = 0; v < V; ++v)                     @@initDist
        dist[v] = weight[src][v]; // INF if no edge @@initDist
    dist[src] = 0;
    for (int step = 1; step < V; ++step) {          @@outer
        int v = -1, minWeight = INF;                @@pickMin
        for (int w = 0; w < V; ++w)                 @@pickMin
            if (!inS[w] && dist[w] < minWeight)     @@pickMin
                { v = w; minWeight = dist[w]; }     @@pickMin
        if (v == -1) break;
        inS[v] = true;                              @@addS
        for (int w = 0; w < V; ++w)                 @@relaxLoop
            if (!inS[w] && minWeight + weight[v][w] < dist[w]) @@relaxCmp
                dist[w] = minWeight + weight[v][w]; @@relaxUpd
    }
}`,
        java: `static int[] shortestPath(int src, int[][] weight) {
    int V = weight.length;
    boolean[] inS = new boolean[V];
    int[] dist = new int[V];
    inS[src] = true;                                @@initS
    for (int v = 0; v < V; v++) dist[v] = weight[src][v]; @@initDist
    dist[src] = 0;
    for (int step = 1; step < V; step++) {          @@outer
        int v = -1, minW = INF;                     @@pickMin
        for (int w = 0; w < V; w++)                 @@pickMin
            if (!inS[w] && dist[w] < minW) { v = w; minW = dist[w]; } @@pickMin
        if (v == -1) break;
        inS[v] = true;                              @@addS
        for (int w = 0; w < V; w++)                 @@relaxLoop
            if (!inS[w] && minW + weight[v][w] < dist[w]) @@relaxCmp
                dist[w] = minW + weight[v][w];      @@relaxUpd
    }
    return dist;
}`,
        python: `def shortest_path(src, vertices, weight):
    S = {src}                                       @@initS
    dist = {v: weight.get((src, v), float('inf')) for v in vertices} @@initDist
    dist[src] = 0
    while len(S) < len(vertices):                   @@outer
        v = min((w for w in vertices if w not in S), key=lambda w: dist[w]) @@pickMin
        min_weight = dist[v]
        S.add(v)                                    @@addS
        for w in vertices:                          @@relaxLoop
            if w not in S and min_weight + weight.get((v, w), float('inf')) < dist[w]: @@relaxCmp
                dist[w] = min_weight + weight[(v, w)] @@relaxUpd
    return dist`,
        pseudo: `Algorithm ShortestPath(val source, ref listOfShortestPath)
1. listOfShortestPath.clear(); Add source to set S  @@initS
2. loop (more vertex v in digraph)                  @@initDist
    distanceNode.destination = v
    distanceNode.distance = weight of edge(source, v) // = infinity if not in digraph @@initDist
    listOfShortestPath.Insert(distanceNode)
3. loop (more vertex not in S)                      @@outer
    minWeight = infinity                            @@pickMin
    loop (more vertex w not in S)                   @@pickMin
        if (distance(source, w) < minWeight) v = w; minWeight = distance(source, w) @@pickMin
    Add v to S                                      @@addS
    loop (more vertex w not in S)                   @@relaxLoop
        if (minWeight + weight(v, w) < distance(source, w)) @@relaxCmp
            Update distance(source, w) to minWeight + weight(v, w) @@relaxUpd
End ShortestPath`,
      },
      run({ preset, srcInput }) {
        const directed = preset === 'p51';
        const baseNodes = directed ? G04_NODES : AF_NODES;
        const baseEdges = directed ? G04_EDGES : AF_EDGES;
        const V = baseNodes.map((n) => n.id);
        const sTrim = String(srcInput || '').trim().toUpperCase();
        const src = V.includes(sTrim) ? sTrim : (directed ? '0' : 'A');
        const R = new DSA.Recorder();

        const getW = (u, v) => {
          const e = baseEdges.find((x) => (x.from === u && x.to === v) || (!directed && x.from === v && x.to === u));
          return e ? e.w : INF;
        };
        const edgeKey = (u, v) => {
          const idx = baseEdges.findIndex((x) => (x.from === u && x.to === v) || (!directed && x.from === v && x.to === u));
          return idx;
        };

        const S = new Set([src]);
        const dist = {}, parent = {};
        V.forEach((v) => {
          dist[v] = v === src ? 0 : getW(src, v);
          parent[v] = (v !== src && dist[v] < INF) ? src : null;
        });

        const snap = (activeV, cmpEdgeIdx) => {
          const treeEdges = new Set();
          V.forEach((v) => { if (parent[v]) treeEdges.add(edgeKey(parent[v], v)); });
          return [
            {
              kind: 'graph', key: 'g', directed,
              title: 'Dijkstra ShortestPath (màu đỏ = cây đường đi ngắn nhất, nhãn đỉnh = dist)',
              nodes: baseNodes.map((n) => ({
                id: n.id, label: n.label, x: n.x, y: n.y,
                hl: n.id === activeV ? 'found' : (S.has(n.id) ? 'sorted' : (dist[n.id] < INF ? 'active' : '')),
                badge: 'd=' + (dist[n.id] === INF ? '∞' : dist[n.id]),
              })),
              edges: baseEdges.map((e, idx) => ({
                from: e.from, to: e.to, w: e.w, curve: e.curve, directed,
                hl: idx === cmpEdgeIdx ? 'compare' : (treeEdges.has(idx) && S.has(e.from) && S.has(e.to) ? 'path' : (treeEdges.has(idx) ? 'frontier' : '')),
              })),
            },
            {
              kind: 'table', key: 'tb', title: 'listOfShortestPath (DistanceNode)', compact: true,
              headers: ['Đỉnh (destination)', 'Thuộc S?', 'distance', 'Đỉnh trước (parent)'],
              rows: V.map((v) => [v, S.has(v) ? '✓' : '—', dist[v] === INF ? '∞' : dist[v], parent[v] || '—']),
              rowHl: Object.fromEntries(V.map((v, i) => [i, v === activeV ? 'found' : (S.has(v) ? 'sorted' : '')])),
            },
          ];
        };

        R.step({
          line: ['initS', 'initDist'],
          msg: 'Khởi tạo <code>S = {' + src + '}</code> và <code>listOfShortestPath</code> từ các cạnh kề trực tiếp với <code>source = ' + src + '</code>.',
          vars: { S: Array.from(S).join(','), source: src },
          panels: snap(src, -1),
        });

        while (S.size < V.length) {
          let v = null, minW = INF;
          V.forEach((w) => { if (!S.has(w) && dist[w] < minW) { minW = dist[w]; v = w; } });
          if (!v) break;
          S.add(v);
          R.step({
            line: ['pickMin', 'addS'],
            msg: 'Chọn đỉnh <code>v = ' + v + '</code> ngoài <code>S</code> có <code>minWeight = ' + minW + '</code> nhỏ nhất và thêm vào <code>S</code>.',
            vars: { v, minWeight: minW, S: '{' + Array.from(S).join(', ') + '}' },
            panels: snap(v, -1),
          });

          for (const w of V) {
            if (S.has(w)) continue;
            const wuv = getW(v, w);
            if (wuv === INF) continue;
            const ek = edgeKey(v, w);
            const cand = minW + wuv;
            const better = cand < dist[w];
            R.step({
              line: better ? 'relaxUpd' : 'relaxCmp',
              msg: 'Xét đỉnh kề <code>w = ' + w + '</code>: <code>minWeight + w(' + v + ',' + w + ') = ' + minW + ' + ' + wuv + ' = ' + cand + (better ? ' &lt; ' : ' ≥ ') + (dist[w] === INF ? '∞' : dist[w]) + '</code> → ' + (better ? '<b>Cập nhật distance[' + w + '] = ' + cand + '</b>!' : 'Giữ nguyên.'),
              vars: { v, w, candidate: cand, oldDist: dist[w] === INF ? '∞' : dist[w] },
              panels: snap(v, ek),
            });
            if (better) {
              dist[w] = cand;
              parent[w] = v;
              R.step({
                line: 'relaxUpd',
                msg: 'Đã cập nhật <code>distance[' + w + '] = ' + cand + '</code> (đi qua <code>' + v + '</code>).',
                vars: { w, 'distance[w]': cand, via: v },
                panels: snap(w, ek),
              });
            }
          }
        }

        R.step({
          line: 'outer',
          msg: 'Hoàn tất thuật toán Dijkstra! Đã tìm được đường đi ngắn nhất từ <code>' + src + '</code> đến mọi đỉnh.',
          vars: { S: '{' + Array.from(S).join(', ') + '}' },
          panels: snap(null, -1),
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 2. Prim's Minimum Spanning Tree (Graph.pdf p.61-70)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'prim',
    chapter: 'graph',
    name: "Prim's Minimum Spanning Tree (Cây khung nhỏ nhất)",
    short: 'O(V²) / O(E log V)',
    complexity: [
      ['Time (Ma trận / Danh sách)', 'O(V²)'],
      ['Time (Priority Queue)', 'O(E log V)'],
      ['Số cạnh của MST', 'V − 1 cạnh'],
    ],
    description:
      '<p><b>Cây khung nhỏ nhất (Minimum Spanning Tree – MST)</b> là cây con chứa tất cả các đỉnh của đồ thị liên thông có tổng trọng số các cạnh nhỏ nhất.</p>' +
      '<p>Thuật toán <b>Prim (1957)</b> chỉ thay đổi nhỏ so với Dijkstra: với mỗi đỉnh <code>w ∉ S</code>, <code>listOfDistanceNode</code> lưu cạnh <b>ngắn nhất nối trực tiếp từ một đỉnh thuộc <code>S</code> tới <code>w</code></b> (<code>DistanceNode { vertexFrom, vertexTo, distance }</code>) thay vì tổng đường đi từ nguồn.</p>',
    ops: [{
      id: 'run',
      label: 'Chạy MinimumSpanningTree (Prim)',
      args: [{ id: 'src', label: 'Đỉnh bắt đầu (source)', type: 'text', value: 'A' }],
      code: {
        cpp: `void minimumSpanningTree(int src, int V, const int weight[][MAXV]) {
    std::vector<bool> inS(V, false);
    std::vector<int> dist(V, INF), from(V, src);
    inS[src] = true;                                @@init
    for (int v = 0; v < V; ++v) dist[v] = weight[src][v]; @@init
    for (int step = 1; step < V; ++step) {          @@outer
        int v = -1, minWeight = INF;                @@pickMin
        for (int w = 0; w < V; ++w)                 @@pickMin
            if (!inS[w] && dist[w] < minWeight)     @@pickMin
                { v = w; minWeight = dist[w]; }     @@pickMin
        if (v == -1) break;
        inS[v] = true; // Add v and edge(from[v], v) to MST @@addMST
        for (int w = 0; w < V; ++w)                 @@updLoop
            if (!inS[w] && weight[v][w] < dist[w]) { @@updCmp
                from[w] = v;                        @@updNode
                dist[w] = weight[v][w];             @@updNode
            }
    }
}`,
        java: `static void minimumSpanningTree(int src, int[][] weight) {
    int V = weight.length;
    boolean[] inS = new boolean[V];
    int[] dist = new int[V], from = new int[V];
    inS[src] = true;                                @@init
    for (int v = 0; v < V; v++) { dist[v] = weight[src][v]; from[v] = src; } @@init
    for (int step = 1; step < V; step++) {          @@outer
        int v = -1, minW = INF;                     @@pickMin
        for (int w = 0; w < V; w++)                 @@pickMin
            if (!inS[w] && dist[w] < minW) { v = w; minW = dist[w]; } @@pickMin
        if (v == -1) break;
        inS[v] = true;                              @@addMST
        for (int w = 0; w < V; w++)                 @@updLoop
            if (!inS[w] && weight[v][w] < dist[w]) { from[w] = v; dist[w] = weight[v][w]; } @@updNode
    }
}`,
        python: `def prim_mst(src, vertices, weight):
    S = {src}                                       @@init
    dist = {v: weight.get((src, v), float('inf')) for v in vertices} @@init
    frm = {v: src for v in vertices}
    mst_edges = []
    while len(S) < len(vertices):                   @@outer
        v = min((w for w in vertices if w not in S), key=lambda w: dist[w]) @@pickMin
        S.add(v); mst_edges.append((frm[v], v, dist[v])) @@addMST
        for w in vertices:                          @@updLoop
            if w not in S and weight.get((v, w), float('inf')) < dist[w]: @@updCmp
                frm[w] = v; dist[w] = weight[(v, w)] @@updNode
    return mst_edges`,
        pseudo: `Algorithm MinimumSpanningTree(val source, ref tree <Graph>)
1. tree.clear(); tree.InsertVertex(source); Add source to S @@init
2. Initiate listOfDistanceNode: vertexFrom = source, vertexTo = v, distance = weight(source, v) @@init
3. loop (more vertex not in S) and (continue)       @@outer
    Choose vertex v not in S with smallest node.distance @@pickMin
    if (minWeight < infinity)
        Add v to S; tree.InsertVertex(v); tree.InsertEdge(vertexFrom, v) @@addMST
        loop (more vertex w not in S)               @@updLoop
            if (node.distance > weight of edge(v, w)) @@updCmp
                node.vertexFrom = v; node.distance = weight(v, w) @@updNode
End MinimumSpanningTree`,
      },
      run({ src }) {
        const V = AF_NODES.map((n) => n.id);
        const start = V.includes(String(src || '').trim().toUpperCase()) ? String(src).trim().toUpperCase() : 'A';
        const R = new DSA.Recorder();
        const getW = (u, v) => {
          const e = AF_EDGES.find((x) => (x.from === u && x.to === v) || (x.from === v && x.to === u));
          return e ? e.w : INF;
        };
        const edgeIdx = (u, v) => AF_EDGES.findIndex((x) => (x.from === u && x.to === v) || (x.from === v && x.to === u));

        const S = new Set([start]);
        const from = {}, dist = {};
        const mstEdges = new Set();
        let totalWeight = 0;
        V.forEach((v) => {
          from[v] = start;
          dist[v] = v === start ? 0 : getW(start, v);
        });

        const snap = (activeV, cmpIdx) => {
          const frontier = new Set();
          V.forEach((w) => { if (!S.has(w) && dist[w] < INF) frontier.add(edgeIdx(from[w], w)); });
          return [
            {
              kind: 'graph', key: 'g', directed: false,
              title: 'Prim MST (tổng trọng số hiện tại = ' + totalWeight + ')',
              nodes: AF_NODES.map((n) => ({
                id: n.id, label: n.label, x: n.x, y: n.y,
                hl: n.id === activeV ? 'found' : (S.has(n.id) ? 'sorted' : (dist[n.id] < INF ? 'active' : '')),
                badge: S.has(n.id) ? 'in S' : (dist[n.id] === INF ? '∞' : `${from[n.id]}:${dist[n.id]}`),
              })),
              edges: AF_EDGES.map((e, idx) => ({
                from: e.from, to: e.to, w: e.w,
                hl: idx === cmpIdx ? 'compare' : (mstEdges.has(idx) ? 'path' : (frontier.has(idx) ? 'frontier' : '')),
              })),
            },
            {
              kind: 'table', key: 'tb', title: 'listOfDistanceNode (DistanceNode { vertexFrom, vertexTo, distance })', compact: true,
              headers: ['vertexTo', 'Thuộc S?', 'vertexFrom', 'distance (từ S)'],
              rows: V.map((v) => [v, S.has(v) ? '✓' : '—', from[v], dist[v] === INF ? '∞' : dist[v]]),
              rowHl: Object.fromEntries(V.map((v, i) => [i, v === activeV ? 'found' : (S.has(v) ? 'sorted' : '')])),
            },
          ];
        };

        R.step({
          line: 'init',
          msg: 'Khởi tạo <code>S = {' + start + '}</code> và <code>listOfDistanceNode</code> từ <code>' + start + '</code>.',
          vars: { S: start, totalWeight: 0 },
          panels: snap(start, -1),
        });

        while (S.size < V.length) {
          let v = null, minW = INF;
          V.forEach((w) => { if (!S.has(w) && dist[w] < minW) { minW = dist[w]; v = w; } });
          if (!v) break;
          S.add(v);
          mstEdges.add(edgeIdx(from[v], v));
          totalWeight += minW;
          R.step({
            line: ['pickMin', 'addMST'],
            msg: 'Chọn cạnh nhỏ nhất nối từ <code>S</code> ra ngoài: <b>(' + from[v] + ', ' + v + ') = ' + minW + '</b> → thêm đỉnh <code>' + v + '</code> vào <code>S</code>.',
            vars: { addedVertex: v, edge: from[v] + '-' + v, weight: minW, totalWeight },
            panels: snap(v, -1),
          });

          for (const w of V) {
            if (S.has(w)) continue;
            const wvw = getW(v, w);
            if (wvw === INF) continue;
            const idx = edgeIdx(v, w);
            if (wvw < dist[w]) {
              from[w] = v;
              dist[w] = wvw;
              R.step({
                line: 'updNode',
                msg: 'Cạnh <code>(' + v + ', ' + w + ') = ' + wvw + '</code> nhỏ hơn khoảng cách cũ tới <code>' + w + '</code> → cập nhật <code>vertexFrom[' + w + '] = ' + v + ', distance = ' + wvw + '</code>.',
                vars: { w, newFrom: v, newDist: wvw, totalWeight },
                panels: snap(w, idx),
              });
            }
          }
        }

        R.step({
          line: 'outer',
          msg: 'Hoàn tất thuật toán Prim! Cây khung nhỏ nhất (MST) có tổng trọng số = <b>' + totalWeight + '</b>.',
          vars: { totalWeight, edgesInMST: mstEdges.size },
          panels: snap(null, -1),
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 3. Maximum Flow (Graph.pdf p.71-75)
   *    Exact pipeline network S, A, B, C, D, E, F, T from slide p.74-75
   * ------------------------------------------------------------------- */
  const FLOW_NODES = [
    { id: 'S', label: 'S', x: 45,  y: 120 },
    { id: 'A', label: 'A', x: 165, y: 40  },
    { id: 'C', label: 'C', x: 165, y: 120 },
    { id: 'E', label: 'E', x: 165, y: 200 },
    { id: 'B', label: 'B', x: 315, y: 40  },
    { id: 'D', label: 'D', x: 315, y: 120 },
    { id: 'F', label: 'F', x: 315, y: 200 },
    { id: 'T', label: 'T', x: 435, y: 120 },
  ];
  const FLOW_EDGES = [
    { from: 'S', to: 'A', cap: 2 },
    { from: 'S', to: 'C', cap: 4 },
    { from: 'S', to: 'E', cap: 1 },
    { from: 'C', to: 'A', cap: 2 },
    { from: 'C', to: 'F', cap: 3, labelPos: 0.35 },
    { from: 'E', to: 'D', cap: 2, labelPos: 0.65 },
    { from: 'E', to: 'F', cap: 3 },
    { from: 'A', to: 'B', cap: 5 },
    { from: 'D', to: 'B', cap: 5 },
    { from: 'B', to: 'T', cap: 3 },
    { from: 'D', to: 'T', cap: 2 },
    { from: 'F', to: 'T', cap: 1 },
  ];

  DSA.register({
    id: 'max-flow',
    chapter: 'graph',
    name: 'Luồng cực đại trên mạng (Maximum Flow – Edmonds-Karp)',
    short: 'Max Flow',
    complexity: [
      ['Ford-Fulkerson', 'O(E · |f*|)'],
      ['Edmonds-Karp (BFS)', 'O(V · E²)'],
      ['Định lý Max-Flow Min-Cut', 'Luồng cực đại = Lát cắt cực tiểu'],
    ],
    description:
      '<p>Bài toán <b>Maximum Flow</b>: cho mạng đường ống từ một nguồn <code>S</code> (source) đến một đích <code>T</code> (destination) với sức chứa (capacity) trên từng cạnh:</p>' +
      '<ul>' +
      '<li>Luồng qua mỗi ống không vượt quá sức chứa của nó (<code>0 ≤ f(u,v) ≤ c(u,v)</code>).</li>' +
      '<li>Tổng luồng đi vào một trạm trung gian bằng tổng luồng đi ra khỏi trạm đó.</li>' +
      '<li>Mục tiêu: cực đại hóa tổng luồng đi tới đích <code>T</code> (trên mạng mẫu này, luồng cực đại bằng <b>5</b>).</li>' +
      '</ul>',
    ops: [{
      id: 'run',
      label: 'Tìm luồng cực đại từ S đến T',
      args: [],
      code: {
        cpp: `int maxFlow(int s, int t, int V, int cap[][MAXV], int flow[][MAXV]) {
    int totalFlow = 0;                              @@init
    while (true) {                                  @@loop
        // Find augmenting path using BFS in residual graph
        std::vector<int> parent(V, -1);             @@bfs
        if (!bfsResidual(s, t, V, cap, flow, parent)) break; @@bfs
        int neck = INF;                             @@neck
        for (int v = t; v != s; v = parent[v])      @@neck
            neck = std::min(neck, cap[parent[v]][v] - flow[parent[v]][v]); @@neck
        for (int v = t; v != s; v = parent[v]) {    @@augment
            int u = parent[v];
            flow[u][v] += neck;                     @@augment
            flow[v][u] -= neck;                     @@augment
        }
        totalFlow += neck;                          @@augment
    }
    return totalFlow;                               @@done
}`,
        java: `static int maxFlow(int s, int t, int V, int[][] cap, int[][] flow) {
    int totalFlow = 0;                              @@init
    int[] parent = new int[V];
    while (bfsResidual(s, t, V, cap, flow, parent)) { @@bfs
        int neck = Integer.MAX_VALUE;               @@neck
        for (int v = t; v != s; v = parent[v])      @@neck
            neck = Math.min(neck, cap[parent[v]][v] - flow[parent[v]][v]); @@neck
        for (int v = t; v != s; v = parent[v]) {    @@augment
            int u = parent[v];
            flow[u][v] += neck; flow[v][u] -= neck; @@augment
        }
        totalFlow += neck;                          @@augment
    }
    return totalFlow;                               @@done
}`,
        python: `def max_flow(cap, s, t):
    total_flow = 0                                  @@init
    while True:                                     @@loop
        path = bfs_residual(cap, flow, s, t)        @@bfs
        if not path: break
        neck = min(cap[u][v] - flow[u][v] for u, v in path) @@neck
        for u, v in path:                           @@augment
            flow[u][v] += neck; flow[v][u] -= neck  @@augment
        total_flow += neck                          @@augment
    return total_flow                               @@done`,
        pseudo: `Algorithm FordFulkerson_MaxFlow(Network G, source S, sink T)
1. For each pipeline (u, v) in G: flow[u][v] = 0; totalFlow = 0 @@init
2. loop (there exists an augmenting path P from S to T in residual graph): @@bfs
    Δ = min { cap(u, v) - flow(u, v) : (u, v) in P } @@neck
    For each edge (u, v) on path P:                 @@augment
        flow[u][v] = flow[u][v] + Δ                 @@augment
        flow[v][u] = flow[v][u] - Δ                 @@augment
    totalFlow = totalFlow + Δ                       @@augment
3. Return totalFlow                                 @@done`,
      },
      run() {
        const R = new DSA.Recorder();
        const flow = {};
        FLOW_EDGES.forEach((e) => { flow[e.from + '->' + e.to] = 0; });
        let total = 0;

        const snap = (pathSet, hlNodes) => [{
          kind: 'graph', key: 'mf', directed: true,
          title: 'Mạng đường ống S → T (nhãn cạnh: flow / capacity · Tổng luồng = ' + total + ')',
          nodes: FLOW_NODES.map((n) => ({
            id: n.id, label: n.label, x: n.x, y: n.y,
            hl: (hlNodes && hlNodes[n.id]) || (n.id === 'S' || n.id === 'T' ? 'sorted' : ''),
          })),
          edges: FLOW_EDGES.map((e) => {
            const k = e.from + '->' + e.to;
            const f = flow[k];
            return {
              from: e.from, to: e.to, directed: true, labelPos: e.labelPos,
              label: f + '/' + e.cap,
              hl: pathSet && pathSet.has(k) ? 'path' : (f > 0 ? 'active' : ''),
            };
          }),
        }];

        R.step({
          line: 'init',
          msg: 'Khởi tạo luồng bằng 0 trên toàn bộ mạng đường ống.',
          vars: { totalFlow: 0 },
          panels: snap(null, {}),
        });

        const paths = [
          ['S', 'A', 'B', 'T'],
          ['S', 'C', 'A', 'B', 'T'],
          ['S', 'C', 'F', 'T'],
          ['S', 'E', 'D', 'T'],
        ];

        paths.forEach((p) => {
          const edgesInP = [];
          let neck = INF;
          const nodeHl = {};
          for (let i = 0; i < p.length - 1; i++) {
            const k = p[i] + '->' + p[i + 1];
            edgesInP.push(k);
            const e = FLOW_EDGES.find((x) => x.from === p[i] && x.to === p[i + 1]);
            neck = Math.min(neck, e.cap - flow[k]);
            nodeHl[p[i]] = 'compare';
            nodeHl[p[i + 1]] = 'compare';
          }
          const pSet = new Set(edgesInP);
          R.step({
            line: ['bfs', 'neck'],
            msg: 'Tìm được đường tăng luồng: <code>' + p.join(' → ') + '</code> với nút cổ chai <code>Δ = ' + neck + '</code>.',
            vars: { augmentingPath: p.join('→'), bottleneck: neck, totalFlow: total },
            panels: snap(pSet, nodeHl),
          });
          edgesInP.forEach((k) => { flow[k] += neck; });
          total += neck;
          R.step({
            line: 'augment',
            msg: 'Tăng luồng thêm <code>Δ = ' + neck + '</code> dọc theo <code>' + p.join(' → ') + '</code> → tổng luồng hiện tại = <b>' + total + '</b>.',
            vars: { augmentingPath: p.join('→'), added: neck, totalFlow: total },
            panels: snap(pSet, { S: 'sorted', T: 'found' }),
          });
        });

        R.step({
          line: 'done',
          msg: 'Không còn đường tăng luồng nào từ <code>S</code> tới <code>T</code>! <b>Luồng cực đại = ' + total + '</b>.',
          vars: { maxFlow: total },
          panels: snap(null, { S: 'found', T: 'found' }),
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 4. Bipartite Matching
   *    Applicants {p, q, r, s, t} & Jobs {a, b, c, d, e}
   * ------------------------------------------------------------------- */
  const MATCH_NODES = [
    { id: 'p', label: 'p', x: 70,  y: 45  },
    { id: 'q', label: 'q', x: 155, y: 45  },
    { id: 'r', label: 'r', x: 240, y: 45  },
    { id: 's', label: 's', x: 325, y: 45  },
    { id: 't', label: 't', x: 410, y: 45  },
    { id: 'a', label: 'a', x: 70,  y: 190 },
    { id: 'b', label: 'b', x: 155, y: 190 },
    { id: 'c', label: 'c', x: 240, y: 190 },
    { id: 'd', label: 'd', x: 325, y: 190 },
    { id: 'e', label: 'e', x: 410, y: 190 },
  ];
  const MATCH_ADJ = {
    p: ['a', 'b', 'c'],
    q: ['b', 'd'],
    r: ['a', 'e'],
    s: ['e'],
    t: ['c', 'd', 'e'],
  };

  DSA.register({
    id: 'bipartite-matching',
    chapter: 'graph',
    name: 'Ghép cặp cực đại trên đồ thị hai phía (Maximum Bipartite Matching)',
    short: 'O(V · E)',
    complexity: [
      ['DFS / Augmenting Path', 'O(V · E)'],
      ['Hopcroft-Karp', 'O(√V · E)'],
      ['Perfect Matching', 'Mọi đỉnh đều được ghép'],
    ],
    description:
      '<p>Bài toán <b>Matching</b>: có 5 ứng viên <code>p, q, r, s, t</code> và 5 công việc <code>a, b, c, d, e</code>:</p>' +
      '<ul>' +
      '<li>Công việc phù hợp: <code>p: {a, b, c}</code>, <code>q: {b, d}</code>, <code>r: {a, e}</code>, <code>s: {e}</code>, <code>t: {c, d, e}</code>.</li>' +
      '<li>Mỗi ứng viên chỉ nhận tối đa 1 việc và mỗi việc chỉ giao cho tối đa 1 người.</li>' +
      '<li><b>Maximum matching</b>: ghép nhiều cặp nhất có thể; <b>Perfect matching</b> (bài toán hôn nhân): không ai bị lẻ cặp.</li>' +
      '</ul>',
    ops: [{
      id: 'run',
      label: 'Tìm cặp ghép cực đại',
      args: [],
      code: {
        cpp: `bool dfsAugment(int u, const std::vector<int> adj[],
                std::vector<bool>& visited, std::vector<int>& matchJob) {
    for (int job : adj[u]) {                        @@tryJob
        if (visited[job]) continue;
        visited[job] = true;                        @@tryJob
        if (matchJob[job] == -1 || dfsAugment(matchJob[job], adj, visited, matchJob)) { @@augCheck
            matchJob[job] = u;                      @@assign
            return true;                            @@assign
        }
    }
    return false;
}
int maxBipartiteMatching(int U, int J, const std::vector<int> adj[]) {
    std::vector<int> matchJob(J, -1);               @@init
    int count = 0;
    for (int u = 0; u < U; ++u) {                   @@uLoop
        std::vector<bool> visited(J, false);
        if (dfsAugment(u, adj, visited, matchJob)) count++; @@uLoop
    }
    return count;                                   @@done
}`,
        java: `static boolean dfsAugment(int u, List<Integer>[] adj, boolean[] visited, int[] matchJob) {
    for (int job : adj[u]) {                        @@tryJob
        if (visited[job]) continue;
        visited[job] = true;                        @@tryJob
        if (matchJob[job] == -1 || dfsAugment(matchJob[job], adj, visited, matchJob)) { @@augCheck
            matchJob[job] = u;                      @@assign
            return true;                            @@assign
        }
    }
    return false;
}
static int maxBipartiteMatching(int U, int J, List<Integer>[] adj) {
    int[] matchJob = new int[J]; Arrays.fill(matchJob, -1); @@init
    int count = 0;
    for (int u = 0; u < U; u++) {                   @@uLoop
        if (dfsAugment(u, adj, new boolean[J], matchJob)) count++; @@uLoop
    }
    return count;                                   @@done
}`,
        python: `def max_matching(applicants, adj):
    match_job = {}                                  @@init
    def dfs(u, visited):
        for job in adj[u]:                          @@tryJob
            if job in visited: continue
            visited.add(job)
            if job not in match_job or dfs(match_job[job], visited): @@augCheck
                match_job[job] = u                  @@assign
                return True
        return False
    for u in applicants:                            @@uLoop
        dfs(u, set())
    return match_job                                @@done`,
        pseudo: `Algorithm MaxBipartiteMatching(Applicants U, Jobs J, Adj)
1. For each job j in J: matchJob[j] = NONE          @@init
2. For each applicant u in {p, q, r, s, t}:         @@uLoop
    Find an augmenting path from u using DFS(u, visited):
        For each suitable job j in Adj[u]:          @@tryJob
            if j is unvisited:
                mark j visited
                if matchJob[j] == NONE or DFS(matchJob[j], visited): @@augCheck
                    matchJob[j] = u; return true    @@assign
3. Return matchJob (Perfect matching: 5/5 pairs)    @@done`,
      },
      run() {
        const R = new DSA.Recorder();
        const applicants = ['p', 'q', 'r', 's', 't'];
        const matchJob = {}; // job -> applicant
        const allEdges = [];
        applicants.forEach((u) => MATCH_ADJ[u].forEach((j) => allEdges.push({ from: u, to: j })));

        const snap = (activeU, tryEdge) => {
          const matchedPairs = Object.entries(matchJob).map(([j, u]) => u + ' — ' + j);
          return [
            {
              kind: 'graph', key: 'bm', directed: false,
              title: 'Đồ thị 2 phía: Ứng viên {p,q,r,s,t} – Công việc {a,b,c,d,e} (đỏ = cặp được ghép)',
              nodes: MATCH_NODES.map((n) => ({
                id: n.id, label: n.label, x: n.x, y: n.y,
                hl: n.id === activeU ? 'active' : (Object.values(matchJob).includes(n.id) || matchJob[n.id] ? 'sorted' : ''),
              })),
              edges: allEdges.map((e) => {
                const isM = matchJob[e.to] === e.from;
                const isTry = tryEdge && tryEdge.from === e.from && tryEdge.to === e.to;
                return { from: e.from, to: e.to, hl: isTry ? 'compare' : (isM ? 'path' : '') };
              }),
            },
            {
              kind: 'list', key: 'mp', title: 'Các cặp đã ghép (' + matchedPairs.length + '/5)',
              items: matchedPairs.map((s) => ({ label: s, hl: 'found' })),
            },
          ];
        };

        R.step({ line: 'init', msg: 'Khởi tạo đồ thị hai phía với 5 ứng viên <code>p, q, r, s, t</code> và 5 công việc <code>a, b, c, d, e</code>.', vars: { matched: 0 }, panels: snap(null, null) });

        function dfs(u, visited) {
          for (const job of MATCH_ADJ[u]) {
            if (visited.has(job)) continue;
            visited.add(job);
            const prevU = matchJob[job];
            R.step({
              line: 'tryJob',
              msg: 'Xét ứng viên <code>' + u + '</code> thử công việc <code>' + job + '</code>' + (prevU ? ' (đang ghép với <code>' + prevU + '</code> → tìm đường mở rộng cho <code>' + prevU + '</code>)' : ' (đang trống!)') + '.',
              vars: { applicant: u, job, currentHolder: prevU || 'none' },
              panels: snap(u, { from: u, to: job }),
            });
            if (!prevU || dfs(prevU, visited)) {
              matchJob[job] = u;
              R.step({
                line: 'assign',
                msg: 'Ghép thành công <b>' + u + ' — ' + job + '</b>!',
                vars: { assigned: u + ' — ' + job, totalMatched: Object.keys(matchJob).length },
                panels: snap(u, null),
              });
              return true;
            }
          }
          return false;
        }

        applicants.forEach((u) => dfs(u, new Set()));

        R.step({
          line: 'done',
          msg: 'Hoàn tất! Tìm được <b>Perfect Matching (5/5 cặp)</b>: <code>' +
            Object.entries(matchJob).map(([j, u]) => u + '—' + j).join(', ') + '</code>.',
          vars: { pairs: Object.entries(matchJob).map(([j, u]) => u + '-' + j).join(', ') },
          panels: snap(null, null),
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 5. Graph Coloring
   * ------------------------------------------------------------------- */
  const COLOR_NODES = [
    { id: 'WA', label: 'WA', x: 85,  y: 35  },
    { id: 'OR', label: 'OR', x: 65,  y: 100 },
    { id: 'CA', label: 'CA', x: 75,  y: 215 },
    { id: 'ID', label: 'ID', x: 165, y: 70  },
    { id: 'NV', label: 'NV', x: 145, y: 155 },
    { id: 'MT', label: 'MT', x: 280, y: 45  },
    { id: 'WY', label: 'WY', x: 265, y: 120 },
    { id: 'UT', label: 'UT', x: 235, y: 165 },
    { id: 'AZ', label: 'AZ', x: 220, y: 240 },
    { id: 'CO', label: 'CO', x: 350, y: 175 },
    { id: 'NM', label: 'NM', x: 340, y: 235 },
  ];
  const COLOR_EDGES = [
    { from: 'WA', to: 'OR' }, { from: 'WA', to: 'ID' },
    { from: 'OR', to: 'ID' }, { from: 'OR', to: 'NV' }, { from: 'OR', to: 'CA' },
    { from: 'CA', to: 'NV' }, { from: 'CA', to: 'AZ' },
    { from: 'ID', to: 'MT' }, { from: 'ID', to: 'WY' }, { from: 'ID', to: 'UT' }, { from: 'ID', to: 'NV' },
    { from: 'NV', to: 'UT' }, { from: 'NV', to: 'AZ' },
    { from: 'MT', to: 'WY' },
    { from: 'WY', to: 'UT' }, { from: 'WY', to: 'CO' },
    { from: 'UT', to: 'CO' }, { from: 'UT', to: 'AZ' },
    { from: 'AZ', to: 'NM' },
    { from: 'CO', to: 'NM' },
  ];
  const COLOR_NAMES = ['Đỏ (C0)', 'Vàng (C1)', 'Tím (C2)', 'Xanh (C3)'];

  DSA.register({
    id: 'graph-coloring',
    chapter: 'graph',
    name: 'Tô màu đồ thị (Graph / Map Coloring)',
    short: 'Chromatic Number',
    complexity: [
      ['Định lý 4 màu (Đồ thị phẳng)', 'Tối đa 4 màu'],
      ['Greedy Coloring', 'O(V + E)'],
      ['Exact Minimum Coloring', 'NP-Hard'],
    ],
    description:
      '<p>Bài toán <b>Graph Coloring</b>: cho bản đồ các vùng lãnh thổ kề nhau, hãy mô hình hóa mỗi vùng thành một đỉnh và hai vùng có chung biên giới nối với nhau bằng một cạnh. Cần tìm số màu ít nhất sao cho <b>hai đỉnh kề nhau không có cùng màu</b> (tức phân hoạch tập đỉnh thành số lượng ít nhất các tập độc lập).</p>',
    ops: [{
      id: 'run',
      label: 'Tô màu bản đồ 11 bang miền Tây Hoa Kỳ',
      args: [
        {
          id: 'orderMode', label: 'Thứ tự xét đỉnh', type: 'select', value: 'wp',
          options: [
            { value: 'wp', label: 'Welsh-Powell: Bậc giảm dần (tối ưu – 4 màu)' },
            { value: 'alpha', label: 'Thứ tự bản đồ từ Tây sang Đông (WA, OR, CA...)' },
          ],
        },
      ],
      code: {
        cpp: `void greedyColoring(int V, const std::vector<int> adj[], int color[]) {
    for (int u = 0; u < V; ++u) color[u] = -1;      @@init
    for (int u = 0; u < V; ++u) {                   @@uLoop
        std::vector<bool> used(V, false);           @@checkAdj
        for (int w : adj[u])                        @@checkAdj
            if (color[w] != -1) used[color[w]] = true; @@checkAdj
        int c = 0;                                  @@pickColor
        while (used[c]) c++;                        @@pickColor
        color[u] = c;                               @@assignColor
    }
}`,
        java: `static int[] greedyColoring(int V, List<Integer>[] adj) {
    int[] color = new int[V];
    Arrays.fill(color, -1);                         @@init
    for (int u = 0; u < V; u++) {                   @@uLoop
        boolean[] used = new boolean[V];            @@checkAdj
        for (int w : adj[u])                        @@checkAdj
            if (color[w] != -1) used[color[w]] = true; @@checkAdj
        int c = 0;                                  @@pickColor
        while (used[c]) c++;                        @@pickColor
        color[u] = c;                               @@assignColor
    }
    return color;
}`,
        python: `def greedy_coloring(vertices, adj):
    color = {}                                      @@init
    for u in vertices:                              @@uLoop
        used = {color[w] for w in adj[u] if w in color} @@checkAdj
        c = 0                                       @@pickColor
        while c in used: c += 1                     @@pickColor
        color[u] = c                                @@assignColor
    return color`,
        pseudo: `Algorithm GraphColoring(Graph G)
1. Model each region as a vertex and shared borders as edges @@init
2. Order vertices by decreasing degree (Welsh-Powell) @@init
3. For each vertex u in order:                      @@uLoop
    usedColors = { color[w] : w adjacent to u and colored } @@checkAdj
    c = smallest color index not in usedColors      @@pickColor
    color[u] = c                                    @@assignColor
4. Return partition of vertices into color classes  @@uLoop`,
      },
      run({ orderMode }) {
        const R = new DSA.Recorder();
        const color = {};
        const adj = {};
        COLOR_NODES.forEach((n) => { adj[n.id] = []; });
        COLOR_EDGES.forEach((e) => { adj[e.from].push(e.to); adj[e.to].push(e.from); });

        const snap = (curU) => {
          const numColors = Object.keys(color).length ? Math.max(...Object.values(color)) + 1 : 0;
          return [
            {
              kind: 'graph', key: 'gc', directed: false,
              title: 'Đồ thị bản đồ (Số màu đã dùng = ' + numColors + ')',
              nodes: COLOR_NODES.map((n) => ({
                id: n.id, label: n.label, x: n.x, y: n.y,
                hl: color[n.id] !== undefined ? 'c' + color[n.id] : (n.id === curU ? 'active' : ''),
                badge: color[n.id] !== undefined ? COLOR_NAMES[color[n.id]] : 'deg=' + adj[n.id].length,
              })),
              edges: COLOR_EDGES.map((e) => ({
                from: e.from, to: e.to,
                hl: (e.from === curU || e.to === curU) ? 'compare' : '',
              })),
            },
            {
              kind: 'table', key: 'ct', title: 'Phân hoạch các tập đỉnh độc lập (cùng màu)', compact: true,
              headers: ['Màu', 'Các đỉnh (không kề nhau)'],
              rows: [0, 1, 2, 3].map((c) => [
                COLOR_NAMES[c],
                COLOR_NODES.filter((n) => color[n.id] === c).map((n) => n.id).join(', ') || '—',
              ]),
              rowHl: { 0: 'c0', 1: 'c1', 2: 'c2', 3: 'c3' },
            },
          ];
        };

        R.step({ line: 'init', msg: 'Mô hình hóa bản đồ thành đồ thị vô hướng 11 đỉnh.', vars: { vertices: COLOR_NODES.length, edges: COLOR_EDGES.length }, panels: snap(null) });

        // Order by degree descending (Welsh-Powell) or map order
        const order = orderMode === 'alpha'
          ? COLOR_NODES.map((n) => n.id)
          : COLOR_NODES.map((n) => n.id).sort((a, b) => adj[b].length - adj[a].length);
        order.forEach((u) => {
          const used = new Set();
          adj[u].forEach((w) => { if (color[w] !== undefined) used.add(color[w]); });
          let c = 0;
          while (used.has(c)) c++;
          color[u] = c;
          R.step({
            line: 'assignColor',
            msg: 'Đỉnh <code>' + u + '</code> (kề với <code>' + adj[u].join(', ') + '</code>): gán màu nhỏ nhất chưa bị hàng xóm dùng → <b>' + COLOR_NAMES[c] + '</b>.',
            vars: { vertex: u, neighborColorsUsed: Array.from(used).map((x) => COLOR_NAMES[x]).join(', ') || 'none', assigned: COLOR_NAMES[c] },
            panels: snap(u),
          });
        });

        R.step({
          line: 'uLoop',
          msg: 'Hoàn tất tô màu bản đồ với đúng <b>4 màu</b> (không có 2 đỉnh kề nhau nào trùng màu)!',
          vars: { chromaticNumber: Math.max(...Object.values(color)) + 1 },
          panels: snap(null),
        });
        return R.steps;
      },
    }],
  });
})();
