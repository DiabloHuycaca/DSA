/* =========================================================================
 * DSA Visualizer – graph.js
 * Slide: Graph.pdf (trang 1–47)
 * 1. Digraph Representations, ADT Operations (InsertVertex, DeleteVertex,
 *    InsertEdge, DeleteEdge) & Traversals (DepthFirst, BreadthFirst)
 * 2. Topological Sort: DepthTopoSort & BreadthTopoSort
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  function circleCoords(ids, cx, cy, r) {
    const n = ids.length;
    return ids.map((id, i) => {
      const ang = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, n);
      return { id, label: id, x: Math.round(cx + r * Math.cos(ang)), y: Math.round(cy + r * Math.sin(ang)) };
    });
  }

  function computeDegrees(vertices, edges) {
    const indeg = {}, outdeg = {};
    vertices.forEach((v) => { indeg[v] = 0; outdeg[v] = 0; });
    edges.forEach((e) => {
      if (outdeg[e.from] !== undefined) outdeg[e.from]++;
      if (indeg[e.to] !== undefined) indeg[e.to]++;
    });
    return { indeg, outdeg };
  }

  function graphAndAdjPanels(ds, nodeHl, edgeHl, extraPanels) {
    nodeHl = nodeHl || {};
    edgeHl = edgeHl || {};
    const { indeg, outdeg } = computeDegrees(ds.vertices, ds.edges);
    const coords = circleCoords(ds.vertices, 200, 130, 95);
    const nodes = coords.map((c) => ({
      id: c.id, label: c.label, x: c.x, y: c.y,
      hl: nodeHl[c.id] || '',
      badge: `in:${indeg[c.id]} out:${outdeg[c.id]}`,
    }));
    const edges = ds.edges.map((e) => ({
      from: e.from, to: e.to, directed: true,
      hl: edgeHl[e.from + '->' + e.to] || '',
    }));
    const slots = ds.vertices.map((v) => ({
      label: v,
      hl: nodeHl[v] || '',
      items: ds.edges.filter((e) => e.from === v).map((e) => ({ label: e.to, hl: edgeHl[v + '->' + e.to] || '' })),
    }));
    return [
      { kind: 'graph', key: 'g', title: 'Đồ thị có hướng (Digraph – hiển thị indegree / outdegree)', directed: true, nodes, edges },
      { kind: 'buckets', key: 'adj', mode: 'chain', title: 'Danh sách kề (Adjacency List – GraphNode.adjVertex)', slots },
      ...(extraPanels || []),
    ];
  }

  /* ---------------------------------------------------------------------
   * 1. Digraph ADT & Traversals (Graph.pdf p.1-35)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'graph-traversal',
    chapter: 'graph',
    name: 'Biểu diễn Đồ thị, Thao tác Digraph & Duyệt DFS / BFS',
    short: 'O(V + E)',
    complexity: [
      ['Adjacency Table (Ma trận kề)', 'Bộ nhớ O(V²)'],
      ['Adjacency List (Danh sách kề)', 'Bộ nhớ O(V + E)'],
      ['DepthFirst / BreadthFirst', 'O(V + E)'],
    ],
    description:
      '<p>Cấu trúc <b>Digraph</b> dùng <code>List&lt;GraphNode&gt;</code>, trong đó mỗi <code>GraphNode</code> lưu: <code>vertex</code>, <code>adjVertex</code> (danh sách kề), <code>indegree</code>, <code>outdegree</code>, và <code>isMarked</code>:</p>' +
      '<ul>' +
      '<li>Các phương thức ADT: <code>InsertVertex</code>, <code>DeleteVertex</code> (gọi <code>Remove_EdgesToVertex</code> trước khi xóa đỉnh), <code>InsertEdge</code>, <code>DeleteEdge</code>.</li>' +
      '<li><b>DepthFirst</b>: bỏ đánh dấu mọi đỉnh, rồi với mỗi đỉnh <code>v</code> chưa đánh dấu gọi <code>recursiveTraverse(v, Operation)</code> (tương tự Preorder trên cây).</li>' +
      '<li><b>BreadthFirst</b>: dùng hàng đợi <code>queueObj</code> duyệt theo từng lớp kề (kiểm tra <code>if (vertex w is unmarked)</code> khi lấy ra khỏi hàng đợi).</li>' +
      '</ul>',
    init(ds) {
      ds.vertices = ['A', 'B', 'C', 'D', 'E', 'F'];
      ds.edges = [
        { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
        { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
        { from: 'C', to: 'F' }, { from: 'E', to: 'F' },
      ];
    },
    view(ds) { return graphAndAdjPanels(ds); },
    ops: [
      {
        id: 'dfs',
        label: 'Duyệt chiều sâu (DepthFirst)',
        args: [{ id: 'start', label: 'Đỉnh bắt đầu', type: 'text', value: 'A' }],
        code: {
          cpp: `void recursiveTraverse(int v, bool marked[], const std::vector<int> adj[]) {
    marked[v] = true;                               @@mark
    operation(v);                                   @@op
    for (int w : adj[v]) {                          @@adjLoop
        if (!marked[w])                             @@chkW
            recursiveTraverse(w, marked, adj);      @@recCall
    }
}
void depthFirst(int V, const std::vector<int> adj[]) {
    std::vector<bool> marked(V, false);             @@unmarkAll
    for (int v = 0; v < V; ++v)                     @@outerLoop
        if (!marked[v])                             @@outerLoop
            recursiveTraverse(v, marked, adj);      @@recCall
}`,
          java: `static void recursiveTraverse(int v, boolean[] marked, List<Integer>[] adj) {
    marked[v] = true;                               @@mark
    operation(v);                                   @@op
    for (int w : adj[v])                            @@adjLoop
        if (!marked[w]) recursiveTraverse(w, marked, adj); @@recCall
}`,
          python: `def recursive_traverse(v, marked, adj):
    marked.add(v)                                   @@mark
    operation(v)                                    @@op
    for w in adj[v]:                                @@adjLoop
        if w not in marked:                         @@chkW
            recursive_traverse(w, marked, adj)      @@recCall`,
          pseudo: `Algorithm DepthFirst(ref Operation)
loop (more vertex v in Digraph) unmark(v)           @@unmarkAll
loop (more vertex v in Digraph)                     @@outerLoop
    if (v is unmarked) then recursiveTraverse(v, Operation) @@recCall
End DepthFirst

Algorithm recursiveTraverse(ref v, ref Operation)
1. mark(v)                                          @@mark
2. Operation(v)                                     @@op
3. loop (more vertex w adjacent to v)               @@adjLoop
    if (vertex w is unmarked) then                  @@chkW
        recursiveTraverse(w, Operation)             @@recCall
End Traverse`,
        },
        run({ start }, ds) {
          const R = new DSA.Recorder();
          const marked = {};
          const edgeHl = {};
          const order = [];
          const st = String(start || '').trim().toUpperCase();
          const vOrder = ds.vertices.slice();
          if (vOrder.includes(st)) { vOrder.splice(vOrder.indexOf(st), 1); vOrder.unshift(st); }

          R.step({
            line: 'unmarkAll',
            msg: 'Khởi tạo <code>DepthFirst</code>: bỏ đánh dấu (<code>unmark</code>) tất cả các đỉnh.',
            vars: { start: vOrder[0], order: '[]' },
            panels: graphAndAdjPanels(ds),
          });

          function dfs(v) {
            marked[v] = 'sorted';
            order.push(v);
            R.step({
              line: ['mark', 'op'],
              msg: '<code>mark(' + v + ')</code> và thực hiện <code>Operation(' + v + ')</code>.',
              vars: { current: v, visitedOrder: order.join(' → ') },
              panels: graphAndAdjPanels(ds, Object.assign({}, marked, { [v]: 'found' }), edgeHl, [
                { kind: 'list', key: 'ord', title: 'Thứ tự duyệt DepthFirst', items: order.map((x, i) => ({ label: x, hl: i === order.length - 1 ? 'found' : 'sorted' })) },
              ]),
            });
            const neighbors = ds.edges.filter((e) => e.from === v).map((e) => e.to);
            for (const w of neighbors) {
              const ek = v + '->' + w;
              R.step({
                line: 'chkW',
                msg: 'Xét đỉnh kề <code>w = ' + w + '</code> của <code>' + v + '</code>: ' + (marked[w] ? 'đã được đánh dấu (bỏ qua).' : 'chưa đánh dấu → gọi đệ quy <code>recursiveTraverse(' + w + ')</code>.'),
                vars: { v, w, wMarked: !!marked[w] },
                panels: graphAndAdjPanels(ds, Object.assign({}, marked, { [v]: 'active', [w]: marked[w] ? 'visited' : 'compare' }), Object.assign({}, edgeHl, { [ek]: 'compare' }), [
                  { kind: 'list', key: 'ord', title: 'Thứ tự duyệt DepthFirst', items: order.map((x) => ({ label: x, hl: 'sorted' })) },
                ]),
              });
              if (!marked[w]) {
                edgeHl[ek] = 'tree';
                dfs(w);
              }
            }
          }

          vOrder.forEach((v) => { if (!marked[v]) dfs(v); });
          return R.steps;
        },
      },
      {
        id: 'bfs',
        label: 'Duyệt chiều rộng (BreadthFirst)',
        args: [{ id: 'start', label: 'Đỉnh bắt đầu', type: 'text', value: 'A' }],
        code: {
          cpp: `void breadthFirst(int V, const std::vector<int> adj[]) {
    std::vector<bool> marked(V, false);             @@unmarkAll
    std::queue<int> queueObj;                       @@unmarkAll
    for (int v = 0; v < V; ++v) {
        if (!marked[v]) {
            queueObj.push(v);                       @@enqStart
            while (!queueObj.empty()) {             @@qLoop
                int w = queueObj.front(); queueObj.pop(); @@deqW
                if (!marked[w]) {                   @@chkW
                    marked[w] = true;               @@markW
                    operation(w);                   @@markW
                    for (int x : adj[w]) queueObj.push(x); @@enqAdj
                }
            }
        }
    }
}`,
          java: `static void breadthFirst(int V, List<Integer>[] adj) {
    boolean[] marked = new boolean[V];              @@unmarkAll
    Queue<Integer> queueObj = new ArrayDeque<>();   @@unmarkAll
    for (int v = 0; v < V; v++) {
        if (!marked[v]) {
            queueObj.offer(v);                      @@enqStart
            while (!queueObj.isEmpty()) {           @@qLoop
                int w = queueObj.poll();            @@deqW
                if (!marked[w]) {                   @@chkW
                    marked[w] = true;               @@markW
                    operation(w);                   @@markW
                    for (int x : adj[w]) queueObj.offer(x); @@enqAdj
                }
            }
        }
    }
}`,
          python: `from collections import deque
def breadth_first(vertices, adj):
    marked = set()                                  @@unmarkAll
    queue_obj = deque()                             @@unmarkAll
    for v in vertices:
        if v not in marked:
            queue_obj.append(v)                     @@enqStart
            while queue_obj:                        @@qLoop
                w = queue_obj.popleft()             @@deqW
                if w not in marked:                 @@chkW
                    marked.add(w)                   @@markW
                    operation(w)                    @@markW
                    for x in adj[w]: queue_obj.append(x) @@enqAdj`,
          pseudo: `Algorithm BreadthFirst(ref Operation)
1. queueObj <Queue>
2. loop (more vertex v in digraph) unmark(v)        @@unmarkAll
3. loop (more vertex v in Digraph)
    if (vertex v is unmarked)
        queueObj.EnQueue(v)                         @@enqStart
        loop (NOT queueObj.isEmpty())               @@qLoop
            queueObj.QueueFront(w); queueObj.DeQueue() @@deqW
            if (vertex w is unmarked)               @@chkW
                mark(w); Operation(w)               @@markW
                loop (more vertex x adjacent to w)
                    queueObj.EnQueue(x)             @@enqAdj
End BreadthFirst`,
        },
        run({ start }, ds) {
          const R = new DSA.Recorder();
          const marked = {};
          const edgeHl = {};
          const order = [];
          const q = [];
          const st = String(start || '').trim().toUpperCase();
          const vOrder = ds.vertices.slice();
          if (vOrder.includes(st)) { vOrder.splice(vOrder.indexOf(st), 1); vOrder.unshift(st); }

          const extra = () => [
            { kind: 'list', key: 'q', title: 'queueObj (Hàng đợi)', style: 'queue', half: true, items: q.map((x) => ({ label: x, hl: 'active' })) },
            { kind: 'list', key: 'o', title: 'Thứ tự duyệt BreadthFirst', half: true, items: order.map((x, i) => ({ label: x, hl: i === order.length - 1 ? 'found' : 'sorted' })) },
          ];

          R.step({ line: 'unmarkAll', msg: 'Khởi tạo <code>BreadthFirst</code>: bỏ đánh dấu mọi đỉnh và tạo <code>queueObj</code>.', vars: { queue: '[]' }, panels: graphAndAdjPanels(ds, {}, {}, extra()) });

          vOrder.forEach((v) => {
            if (marked[v]) return;
            q.push(v);
            R.step({ line: 'enqStart', msg: 'Đỉnh <code>' + v + '</code> chưa đánh dấu → <code>queueObj.EnQueue(' + v + ')</code>.', vars: { enqueued: v, queue: q.join(',') }, panels: graphAndAdjPanels(ds, Object.assign({}, marked, { [v]: 'active' }), edgeHl, extra()) });
            while (q.length) {
              const w = q.shift();
              if (!marked[w]) {
                marked[w] = 'sorted';
                order.push(w);
                R.step({ line: 'markW', msg: 'Lấy <code>w = ' + w + '</code> ra khỏi hàng đợi: chưa đánh dấu → <code>mark(' + w + ')</code> và <code>Operation(' + w + ')</code>.', vars: { w, visitedOrder: order.join(' → ') }, panels: graphAndAdjPanels(ds, Object.assign({}, marked, { [w]: 'found' }), edgeHl, extra()) });
                const adj = ds.edges.filter((e) => e.from === w).map((e) => e.to);
                adj.forEach((x) => {
                  q.push(x);
                  if (!marked[x]) edgeHl[w + '->' + x] = 'tree';
                });
                if (adj.length) {
                  R.step({ line: 'enqAdj', msg: 'Đưa các đỉnh kề của <code>' + w + '</code> (<code>' + adj.join(', ') + '</code>) vào <code>queueObj</code>.', vars: { w, enqueued: adj.join(','), queue: q.join(',') }, panels: graphAndAdjPanels(ds, marked, edgeHl, extra()) });
                }
              }
            }
          });
          return R.steps;
        },
      },
      {
        id: 'editEdge',
        label: 'InsertEdge / DeleteEdge / InsertVertex / DeleteVertex',
        args: [
          {
            id: 'opType', label: 'Thao tác', type: 'select', value: 'insEdge',
            options: [
              { value: 'insEdge', label: 'InsertEdge(VertexFrom, VertexTo)' },
              { value: 'delEdge', label: 'DeleteEdge(VertexFrom, VertexTo)' },
              { value: 'insV', label: 'InsertVertex(VertexFrom)' },
              { value: 'delV', label: 'DeleteVertex(VertexFrom) + Remove_EdgesToVertex' },
            ],
          },
          { id: 'u', label: 'VertexFrom', type: 'text', value: 'C' },
          { id: 'v', label: 'VertexTo', type: 'text', value: 'D' },
        ],
        code: {
          cpp: `struct GraphNode {
    std::string vertex;
    std::vector<std::string> adjVertex;
    int indegree = 0, outdegree = 0;
    bool isMarked = false;
};
ErrorCode InsertVertex(std::vector<GraphNode>& digraph, const std::string& v) {
    if (findVertex(digraph, v) != -1) return duplicate_error; @@chkDup
    digraph.push_back({v, {}, 0, 0, false});        @@doEdit
    return success;
}
void Remove_EdgesToVertex(std::vector<GraphNode>& digraph, const std::string& v) {
    for (auto& node : digraph)                      @@doEdit
        if (removeAdj(node.adjVertex, v)) node.outdegree--; @@doEdit
}
ErrorCode DeleteVertex(std::vector<GraphNode>& digraph, const std::string& v) {
    int pos = findVertex(digraph, v);
    if (pos == -1) return notFound;                 @@chkV
    if (digraph[pos].indegree > 0) Remove_EdgesToVertex(digraph, v); @@doEdit
    digraph.erase(digraph.begin() + pos);           @@doEdit
    return success;
}
ErrorCode InsertEdge(std::vector<GraphNode>& digraph, const std::string& from, const std::string& to) {
    int pFrom = findVertex(digraph, from), pTo = findVertex(digraph, to);
    if (pFrom == -1) return notFound_VertexFrom;    @@chkV
    if (pTo == -1) return notFound_VertexTo;        @@chkV
    if (hasAdj(digraph[pFrom].adjVertex, to)) return duplicate_error; @@chkDup
    digraph[pFrom].adjVertex.push_back(to);         @@doEdit
    digraph[pFrom].outdegree++; digraph[pTo].indegree++; @@doEdit
    return success;
}
ErrorCode DeleteEdge(std::vector<GraphNode>& digraph, const std::string& from, const std::string& to) {
    int pFrom = findVertex(digraph, from), pTo = findVertex(digraph, to);
    if (pFrom == -1 || pTo == -1) return notFound_Vertex; @@chkV
    if (!removeAdj(digraph[pFrom].adjVertex, to)) return notFound_Edge; @@doEdit
    digraph[pFrom].outdegree--; digraph[pTo].indegree--; @@doEdit
    return success;
}`,
          java: `class Digraph {
    Map<String, List<String>> adj = new LinkedHashMap<>();
    Map<String, Integer> indeg = new HashMap<>(), outdeg = new HashMap<>();

    String insertVertex(String v) {
        if (adj.containsKey(v)) return "duplicate_error"; @@chkDup
        adj.put(v, new ArrayList<>()); indeg.put(v, 0); outdeg.put(v, 0); @@doEdit
        return "success";
    }
    String deleteVertex(String v) {
        if (!adj.containsKey(v)) return "notFound"; @@chkV
        for (String u : adj.keySet())               @@doEdit
            if (adj.get(u).remove(v)) outdeg.put(u, outdeg.get(u) - 1); @@doEdit
        adj.remove(v); indeg.remove(v); outdeg.remove(v); @@doEdit
        return "success";
    }
    String insertEdge(String from, String to) {
        if (!adj.containsKey(from) || !adj.containsKey(to)) return "notFound_Vertex"; @@chkV
        if (adj.get(from).contains(to)) return "duplicate_error"; @@chkDup
        adj.get(from).add(to);                      @@doEdit
        outdeg.put(from, outdeg.get(from) + 1); indeg.put(to, indeg.get(to) + 1); @@doEdit
        return "success";
    }
    String deleteEdge(String from, String to) {
        if (!adj.containsKey(from) || !adj.containsKey(to)) return "notFound_Vertex"; @@chkV
        if (!adj.get(from).remove(to)) return "notFound_Edge"; @@doEdit
        outdeg.put(from, outdeg.get(from) - 1); indeg.put(to, indeg.get(to) - 1); @@doEdit
        return "success";
    }
}`,
          python: `class Digraph:
    def insert_vertex(self, v):
        if v in self.adj: return "duplicate_error"  @@chkDup
        self.adj[v] = []; self.indeg[v] = 0; self.outdeg[v] = 0 @@doEdit
        return "success"

    def delete_vertex(self, v):
        if v not in self.adj: return "notFound"     @@chkV
        for u in self.adj:                          @@doEdit
            if v in self.adj[u]: self.adj[u].remove(v); self.outdeg[u] -= 1 @@doEdit
        del self.adj[v], self.indeg[v], self.outdeg[v] @@doEdit
        return "success"

    def insert_edge(self, u, v):
        if u not in self.adj or v not in self.adj: return "notFound_Vertex" @@chkV
        if v in self.adj[u]: return "duplicate_error" @@chkDup
        self.adj[u].append(v); self.outdeg[u] += 1; self.indeg[v] += 1 @@doEdit
        return "success"

    def delete_edge(self, u, v):
        if u not in self.adj or v not in self.adj: return "notFound_Vertex" @@chkV
        if v not in self.adj[u]: return "notFound_Edge" @@doEdit
        self.adj[u].remove(v); self.outdeg[u] -= 1; self.indeg[v] -= 1 @@doEdit
        return "success"`,
          pseudo: `Algorithm InsertVertex(val VertexFrom)
1. digraph.Search(DataKey, position, newData)
2. if (found) return duplicate_error                @@chkDup
3. DataOut.vertex = VertexFrom; indegree = 0; outdegree = 0
4. digraph.Insert(digraph.size(), DataOut); return success @@doEdit

Algorithm DeleteVertex(val VertexFrom)
1. digraph.Search(DataKey, position, newData)
2. if (not found) return notFound                   @@chkV
3. if (newData.indegree > 0) Remove_EdgesToVertex(VertexFrom) @@doEdit
4. digraph.Remove(position, DataOut); return success @@doEdit

Algorithm InsertEdge(val VertexFrom, val VertexTo)
1. Check VertexFrom & VertexTo exist in digraph     @@chkV
2. Search VertexTo in newData.adjVertex -> if found return duplicate_error @@chkDup
3. newData.adjVertex.Insert(VertexTo); newData.outdegree++ @@doEdit
4. Increase VertexTo.indegree by 1; return success  @@doEdit

Algorithm DeleteEdge(val VertexFrom, val VertexTo)
1. Check VertexFrom & VertexTo exist in digraph     @@chkV
2. Remove VertexTo from newData.adjVertex; outdegree--; indegree-- @@doEdit`,
        },
        run({ opType, u, v }, ds) {
          const from = String(u || '').trim().toUpperCase();
          const to = String(v || '').trim().toUpperCase();
          const R = new DSA.Recorder();
          if (opType === 'insV') {
            if (!from) return [{ msg: 'Hãy nhập tên đỉnh.' }];
            if (ds.vertices.includes(from)) {
              R.step({ line: 'chkDup', msg: 'Đỉnh <code>' + from + '</code> đã tồn tại → trả về <code>duplicate_error</code>.', vars: { return: 'duplicate_error' }, panels: graphAndAdjPanels(ds, { [from]: 'swap' }) });
            } else {
              ds.vertices.push(from);
              R.step({ line: 'doEdit', msg: '<code>InsertVertex(' + from + ')</code> thành công (<code>indegree = 0, outdegree = 0</code>).', vars: { return: 'success', newVertex: from }, panels: graphAndAdjPanels(ds, { [from]: 'found' }) });
            }
          } else if (opType === 'delV') {
            if (!ds.vertices.includes(from)) {
              R.step({ line: 'chkV', msg: 'Không tìm thấy đỉnh <code>' + from + '</code> → trả về <code>notFound</code>.', vars: { return: 'notFound' }, panels: graphAndAdjPanels(ds) });
            } else {
              ds.edges = ds.edges.filter((e) => e.from !== from && e.to !== from);
              ds.vertices = ds.vertices.filter((x) => x !== from);
              R.step({ line: 'doEdit', msg: 'Đã gọi <code>Remove_EdgesToVertex(' + from + ')</code> và xóa đỉnh <code>' + from + '</code> khỏi Digraph.', vars: { return: 'success', deleted: from }, panels: graphAndAdjPanels(ds) });
            }
          } else if (opType === 'insEdge') {
            if (!ds.vertices.includes(from) || !ds.vertices.includes(to)) {
              R.step({ line: 'chkV', msg: 'Đỉnh nguồn hoặc đích không tồn tại → trả về <code>notFound_Vertex</code>.', vars: { from, to }, panels: graphAndAdjPanels(ds) });
            } else if (ds.edges.some((e) => e.from === from && e.to === to)) {
              R.step({ line: 'chkDup', msg: 'Cạnh <code>' + from + ' → ' + to + '</code> đã có → trả về <code>duplicate_error</code>.', vars: { return: 'duplicate_error' }, panels: graphAndAdjPanels(ds, {}, { [from + '->' + to]: 'swap' }) });
            } else {
              ds.edges.push({ from, to });
              R.step({ line: 'doEdit', msg: '<code>InsertEdge(' + from + ', ' + to + ')</code> thành công: tăng <code>outdegree[' + from + ']</code> và <code>indegree[' + to + ']</code>.', vars: { return: 'success', edge: from + '->' + to }, panels: graphAndAdjPanels(ds, { [from]: 'active', [to]: 'found' }, { [from + '->' + to]: 'found' }) });
            }
          } else {
            const before = ds.edges.length;
            ds.edges = ds.edges.filter((e) => !(e.from === from && e.to === to));
            R.step({ line: 'doEdit', msg: ds.edges.length < before ? '<code>DeleteEdge(' + from + ', ' + to + ')</code> thành công.' : 'Không tìm thấy cạnh → trả về <code>notFound_Edge</code>.', vars: { return: ds.edges.length < before ? 'success' : 'notFound_Edge' }, panels: graphAndAdjPanels(ds) });
          }
          return R.steps;
        },
      },
      {
        id: 'preset',
        label: 'Đổi đồ thị mẫu',
        args: [
          {
            id: 'which', label: 'Đồ thị mẫu', type: 'select', value: 'p31',
            options: [
              { value: 'p31', label: 'Đồ thị 9 đỉnh A..I (DFS & BFS)' },
              { value: 'default', label: 'Đồ thị 6 đỉnh A..F mặc định' },
            ],
          },
        ],
        code: {
          cpp: `void buildSampleGraph(Digraph& g) {
    // A->B,C,E; B->D,F; C->D,G,H; D->G; F->I       @@done
    for (char c = 'A'; c <= 'I'; ++c) g.insertVertex(std::string(1, c)); @@done
}`,
          java: `static void buildSampleGraph(Digraph g) {
    for (char c = 'A'; c <= 'I'; c++) g.insertVertex(String.valueOf(c)); @@done
}`,
          python: `def build_sample_graph(g):
    for c in "ABCDEFGHI": g.insert_vertex(c)        @@done`,
          pseudo: `Build Digraph Example:
Vertices: A, B, C, D, E, F, G, H, I                 @@done
Edges: A->B,C,E | B->D,F | C->D,G,H | D->G | F->I   @@done`,
        },
        run({ which }, ds) {
          if (which === 'p31') {
            ds.vertices = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
            ds.edges = [
              { from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'A', to: 'E' },
              { from: 'B', to: 'D' }, { from: 'B', to: 'F' },
              { from: 'C', to: 'D' }, { from: 'C', to: 'G' }, { from: 'C', to: 'H' },
              { from: 'D', to: 'G' },
              { from: 'F', to: 'I' },
            ];
          } else {
            ds.vertices = ['A', 'B', 'C', 'D', 'E', 'F'];
            ds.edges = [
              { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
              { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
              { from: 'C', to: 'F' }, { from: 'E', to: 'F' },
            ];
          }
          return [{
            line: 'done',
            msg: 'Đã nạp đồ thị mẫu (<b>' + ds.vertices.length + ' đỉnh, ' + ds.edges.length + ' cạnh</b>).',
            vars: { V: ds.vertices.length, E: ds.edges.length },
            panels: graphAndAdjPanels(ds),
          }];
        },
      },
    ],
  });

  /* ---------------------------------------------------------------------
   * 2. Topological Sort: DepthTopoSort & BreadthTopoSort
   * ------------------------------------------------------------------- */
  const DAG_NODES = [
    { id: 'C1', label: 'C1', x: 70, y: 55 },
    { id: 'C2', label: 'C2', x: 70, y: 155 },
    { id: 'C3', label: 'C3', x: 200, y: 55 },
    { id: 'C4', label: 'C4', x: 200, y: 155 },
    { id: 'C5', label: 'C5', x: 330, y: 55 },
    { id: 'C6', label: 'C6', x: 330, y: 155 },
  ];
  const DAG_EDGES = [
    { from: 'C1', to: 'C3' }, { from: 'C1', to: 'C4' },
    { from: 'C2', to: 'C4' }, { from: 'C3', to: 'C5' },
    { from: 'C3', to: 'C6' }, { from: 'C4', to: 'C6' },
  ];

  // DAG with vertices A..F
  const DAG_AF_NODES = [
    { id: 'A', label: 'A', x: 65,  y: 105 },
    { id: 'B', label: 'B', x: 185, y: 45  },
    { id: 'C', label: 'C', x: 185, y: 170 },
    { id: 'D', label: 'D', x: 310, y: 105 },
    { id: 'E', label: 'E', x: 410, y: 45  },
    { id: 'F', label: 'F', x: 410, y: 170 },
  ];
  const DAG_AF_EDGES = [
    { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
    { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
    { from: 'C', to: 'D' }, { from: 'C', to: 'F' },
    { from: 'D', to: 'E' }, { from: 'D', to: 'F' },
  ];

  DSA.register({
    id: 'topological-sort',
    chapter: 'graph',
    name: 'Sắp xếp Tô-pô (DepthTopoSort & BreadthTopoSort)',
    short: 'O(V + E)',
    complexity: [
      ['DepthTopoSort (DFS)', 'O(V + E)'],
      ['BreadthTopoSort (Kahn / Queue)', 'O(V + E)'],
      ['Điều kiện áp dụng', 'Đồ thị có hướng không chu trình (DAG)'],
    ],
    description:
      '<p>Một <b>thứ tự tô-pô (topological order)</b> của đồ thị có hướng không chu trình (DAG) là dãy tuyến tính chứa tất cả các đỉnh sao cho nếu có cạnh <code>v → w</code> thì <code>v</code> đứng trước <code>w</code>. Có 2 giải thuật chính:</p>' +
      '<ol>' +
      '<li><b><code>DepthTopoSort</code></b>: dùng đệ quy theo chiều sâu <code>recursiveDepthTopoSort(v, TopologicalOrder)</code> — đặt tất cả các đỉnh kế tiếp (successors) của <code>v</code> vào danh sách trước, sau đó chèn <code>v</code> vào <b>đầu danh sách</b> (<code>TopologicalOrder.Insert(0, v)</code>).</li>' +
      '<li><b><code>BreadthTopoSort</code></b>: đưa tất cả các đỉnh có <code>indegree = 0</code> vào hàng đợi <code>queueObj</code>; mỗi lần lấy <code>v</code> ra thì nối vào cuối <code>TopologicalOrder</code> và giảm <code>indegree</code> của các đỉnh kề <code>w</code> đi 1 (nếu <code>indegree[w] == 0</code> thì đưa <code>w</code> vào hàng đợi).</li>' +
      '</ol>',
    ops: [
      {
        id: 'depth',
        label: 'DepthTopoSort (DFS)',
        args: [
          {
            id: 'preset', label: 'Đồ thị DAG', type: 'select', value: 'courses',
            options: [
              { value: 'courses', label: 'DAG các môn học C1..C6' },
              { value: 'af', label: 'DAG 6 đỉnh A..F' },
            ],
          },
        ],
        code: {
          cpp: `void recursiveDepthTopoSort(int v, bool marked[], const std::vector<int> adj[],
                            std::deque<int>& topoOrder) {
    marked[v] = true;                               @@mark
    for (int w : adj[v]) {                          @@adjLoop
        if (!marked[w])                             @@adjLoop
            recursiveDepthTopoSort(w, marked, adj, topoOrder); @@recCall
    }
    topoOrder.push_front(v); // Insert(0, v)        @@insFront
}
void depthTopoSort(int V, const std::vector<int> adj[], std::deque<int>& topoOrder) {
    std::vector<bool> marked(V, false);             @@init
    topoOrder.clear();                              @@init
    for (int v = 0; v < V; ++v)                     @@outer
        if (!marked[v])                             @@outer
            recursiveDepthTopoSort(v, marked, adj, topoOrder); @@recCall
}`,
          java: `static void recursiveDepthTopoSort(int v, boolean[] marked, List<Integer>[] adj, LinkedList<Integer> topo) {
    marked[v] = true;                               @@mark
    for (int w : adj[v])                            @@adjLoop
        if (!marked[w]) recursiveDepthTopoSort(w, marked, adj, topo); @@recCall
    topo.addFirst(v); // Insert(0, v)               @@insFront
}`,
          python: `def recursive_depth_topo_sort(v, marked, adj, topo):
    marked.add(v)                                   @@mark
    for w in adj[v]:                                @@adjLoop
        if w not in marked:                         @@adjLoop
            recursive_depth_topo_sort(w, marked, adj, topo) @@recCall
    topo.insert(0, v)                               @@insFront`,
          pseudo: `Algorithm DepthTopoSort(ref TopologicalOrder <List>)
1. loop (more vertex v in digraph) unmark(v)        @@init
2. TopologicalOrder.clear()                         @@init
3. loop (more vertex v in Digraph)                  @@outer
    if (vertex v is unmarked)
        recursiveDepthTopoSort(v, TopologicalOrder) @@recCall
End DepthTopoSort

Algorithm recursiveDepthTopoSort(val v, ref TopologicalOrder)
1. mark(v)                                          @@mark
2. loop (more vertex w adjacent to v)               @@adjLoop
    if (vertex w is unmarked)
        recursiveDepthTopoSort(w, TopologicalOrder) @@recCall
3. TopologicalOrder.Insert(0, v)                    @@insFront
End recursiveDepthTopoSort`,
        },
        run({ preset }) {
          const nodes = preset === 'af' ? DAG_AF_NODES : DAG_NODES;
          const edges = preset === 'af' ? DAG_AF_EDGES : DAG_EDGES;
          const R = new DSA.Recorder();
          const marked = {};
          const topo = [];
          const snap = (extra) => [
            {
              kind: 'graph', key: 'g', title: 'DAG (Các môn học / công việc tiên quyết)', directed: true,
              nodes: nodes.map((n) => Object.assign({}, n, { hl: (extra && extra[n.id]) || marked[n.id] || '' })),
              edges: edges.map((e) => ({ from: e.from, to: e.to, directed: true })),
            },
            { kind: 'list', key: 'tp', title: 'TopologicalOrder (chèn vào đầu tại bước hoàn tất đệ quy)', items: topo.map((x, i) => ({ label: x, hl: i === 0 ? 'found' : 'sorted' })) },
          ];

          R.step({ line: 'init', msg: 'Khởi tạo <code>DepthTopoSort</code>: bỏ đánh dấu mọi đỉnh và xóa <code>TopologicalOrder</code>.', vars: { TopologicalOrder: '[]' }, panels: snap() });

          function dfs(v) {
            marked[v] = 'active';
            R.step({ line: 'mark', msg: 'Thăm đỉnh <code>' + v + '</code> (<code>mark(' + v + ')</code>), xét các đỉnh kế tiếp (successors).', vars: { v, TopologicalOrder: topo.join(' → ') }, panels: snap({ [v]: 'active' }) });
            edges.filter((e) => e.from === v).forEach((e) => {
              if (!marked[e.to]) dfs(e.to);
            });
            marked[v] = 'sorted';
            topo.unshift(v);
            R.step({ line: 'insFront', msg: 'Đã xử lý hết các đỉnh kế tiếp của <code>' + v + '</code> → <code>TopologicalOrder.Insert(0, ' + v + ')</code> (chèn vào đầu danh sách).', vars: { finished: v, TopologicalOrder: topo.join(' → ') }, panels: snap({ [v]: 'found' }) });
          }

          nodes.forEach((n) => { if (!marked[n.id]) dfs(n.id); });
          return R.steps;
        },
      },
      {
        id: 'breadth',
        label: 'BreadthTopoSort (Indegree + Queue)',
        args: [
          {
            id: 'preset', label: 'Đồ thị DAG', type: 'select', value: 'courses',
            options: [
              { value: 'courses', label: 'DAG các môn học C1..C6' },
              { value: 'af', label: 'DAG 6 đỉnh A..F' },
            ],
          },
        ],
        code: {
          cpp: `void breadthTopoSort(int V, const std::vector<int> adj[], std::vector<int> indeg,
                     std::vector<int>& topoOrder) {
    topoOrder.clear();                              @@init
    std::queue<int> queueObj;                       @@init
    for (int v = 0; v < V; ++v)                     @@enqZero
        if (indeg[v] == 0) queueObj.push(v);        @@enqZero
    while (!queueObj.empty()) {                     @@qLoop
        int v = queueObj.front(); queueObj.pop();   @@deq
        topoOrder.push_back(v);                     @@append
        for (int w : adj[v]) {                      @@decLoop
            indeg[w]--;                             @@decLoop
            if (indeg[w] == 0) queueObj.push(w);    @@enqNewZero
        }
    }
}`,
          java: `static List<Integer> breadthTopoSort(int V, List<Integer>[] adj, int[] indeg) {
    List<Integer> topoOrder = new ArrayList<>();    @@init
    Queue<Integer> queueObj = new ArrayDeque<>();   @@init
    for (int v = 0; v < V; v++)                     @@enqZero
        if (indeg[v] == 0) queueObj.offer(v);       @@enqZero
    while (!queueObj.isEmpty()) {                   @@qLoop
        int v = queueObj.poll();                    @@deq
        topoOrder.add(v);                           @@append
        for (int w : adj[v]) {                      @@decLoop
            if (--indeg[w] == 0) queueObj.offer(w); @@enqNewZero
        }
    }
    return topoOrder;
}`,
          python: `from collections import deque
def breadth_topo_sort(vertices, adj, indeg):
    topo_order = []                                 @@init
    queue_obj = deque(v for v in vertices if indeg[v] == 0) @@enqZero
    while queue_obj:                                @@qLoop
        v = queue_obj.popleft()                     @@deq
        topo_order.append(v)                        @@append
        for w in adj[v]:                            @@decLoop
            indeg[w] -= 1                           @@decLoop
            if indeg[w] == 0: queue_obj.append(w)   @@enqNewZero
    return topo_order`,
          pseudo: `Algorithm BreadthTopoSort(ref TopologicalOrder <List>)
1. TopologicalOrder.clear(); queueObj <Queue>       @@init
2. loop (more vertex v in digraph)
    if (indegree of v = 0) queueObj.EnQueue(v)      @@enqZero
3. loop (NOT queueObj.isEmpty())                    @@qLoop
    queueObj.QueueFront(v); queueObj.DeQueue()      @@deq
    TopologicalOrder.Insert(TopologicalOrder.size(), v) @@append
    loop (more vertex w adjacent to v)
        decrease the indegree of w by 1             @@decLoop
        if (indegree of w = 0) queueObj.EnQueue(w)  @@enqNewZero
End BreadthTopoSort`,
        },
        run({ preset }) {
          const nodes = preset === 'af' ? DAG_AF_NODES : DAG_NODES;
          const edges = preset === 'af' ? DAG_AF_EDGES : DAG_EDGES;
          const R = new DSA.Recorder();
          const indeg = {};
          nodes.forEach((n) => { indeg[n.id] = 0; });
          edges.forEach((e) => { indeg[e.to]++; });
          const q = [];
          const topo = [];
          const done = {};

          const snap = (extra) => [
            {
              kind: 'graph', key: 'g', title: 'DAG (nhãn hiển thị indegree hiện tại)', directed: true,
              nodes: nodes.map((n) => Object.assign({}, n, {
                hl: (extra && extra[n.id]) || done[n.id] || (q.includes(n.id) ? 'active' : ''),
                badge: 'in=' + indeg[n.id],
              })),
              edges: edges.map((e) => ({ from: e.from, to: e.to, directed: true })),
            },
            { kind: 'list', key: 'q', title: 'queueObj (các đỉnh có indegree = 0)', style: 'queue', half: true, items: q.map((x) => ({ label: x, hl: 'active' })) },
            { kind: 'list', key: 'tp', title: 'TopologicalOrder', half: true, items: topo.map((x, i) => ({ label: x, hl: i === topo.length - 1 ? 'found' : 'sorted' })) },
          ];

          nodes.forEach((n) => { if (indeg[n.id] === 0) q.push(n.id); });
          R.step({ line: 'enqZero', msg: 'Đưa tất cả các đỉnh có <code>indegree = 0</code> vào <code>queueObj</code>: <code>[' + q.join(', ') + ']</code>.', vars: { queue: q.join(',') }, panels: snap() });

          while (q.length) {
            const v = q.shift();
            done[v] = 'sorted';
            topo.push(v);
            R.step({ line: 'append', msg: 'Lấy <code>v = ' + v + '</code> từ <code>queueObj</code> và thêm vào cuối <code>TopologicalOrder</code>.', vars: { v, TopologicalOrder: topo.join(' → ') }, panels: snap({ [v]: 'found' }) });

            edges.filter((e) => e.from === v).forEach((e) => {
              const w = e.to;
              indeg[w]--;
              const zero = indeg[w] === 0;
              if (zero) q.push(w);
              R.step({
                line: zero ? 'enqNewZero' : 'decLoop',
                msg: 'Giảm <code>indegree[' + w + ']</code> đi 1 → còn <code>' + indeg[w] + '</code>' + (zero ? ' ⇒ bằng 0 nên đưa <code>' + w + '</code> vào <code>queueObj</code>!' : '.'),
                vars: { v, w, 'indegree[w]': indeg[w], queue: q.join(',') },
                panels: snap({ [w]: zero ? 'new' : 'compare' }),
              });
            });
          }
          return R.steps;
        },
      },
    ],
  });
})();
