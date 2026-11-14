/* =========================================================================
 * DSA Visualizer – tree.js
 * Slide: Tree_concept.pdf (HCMUT)
 * 1. Binary Tree Traversals (preOrder NLR, inOrder LNR, postOrder LRN, breadthFirst)
 * 2. Expression Tree (infix with parentheses, postfix, prefix, stack build & evaluation)
 * 3. Binary Search Tree – BST (searchBST, iterativeInsertBST, recursiveInsertBST,
 *    deleteBST, findSmallestBST, findLargestBST)
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  function mkNode(key, left, right) {
    return { id: DSA.uid('t'), key, left: left || null, right: right || null };
  }

  function insertBSTPlain(root, key) {
    if (!root) return mkNode(key);
    if (key < root.key) root.left = insertBSTPlain(root.left, key);
    else root.right = insertBSTPlain(root.right, key);
    return root;
  }

  function buildBSTFromArray(arr) {
    let r = null;
    arr.forEach((k) => { r = insertBSTPlain(r, k); });
    return r;
  }

  function balanceFactor(n) {
    return n ? DSA.treeHeight(n.left) - DSA.treeHeight(n.right) : 0;
  }

  /* ---------------------------------------------------------------------
   * 1. Binary Tree Traversals (Tree_concept.pdf p.14-30)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'binary-tree-traversal',
    chapter: 'tree',
    name: 'Duyệt cây nhị phân (NLR, LNR, LRN, Breadth-First)',
    short: 'DFS / BFS',
    complexity: [
      ['Time', 'O(n)'],
      ['Space (DFS stack)', 'O(H) với H ∈ [⌊log₂N⌋+1, N]'],
      ['Space (BFS queue)', 'O(W) chiều rộng lớn nhất'],
      ['Balance factor', 'B = H_L − H_R ∈ {-1, 0, 1}'],
    ],
    description:
      '<p>Cây nhị phân có tối đa 2 cây con mỗi nút. Với <code>N</code> nút, chiều cao tối thiểu <code>H<sub>min</sub> = ⌊log₂ N⌋ + 1</code> và tối đa <code>H<sub>max</sub> = N</code>. Hệ số cân bằng của một nút là <code>B = H<sub>L</sub> − H<sub>R</sub></code>.</p>' +
      '<ul>' +
      '<li><b>Preorder (NLR)</b>: Xử lý gốc (Node) → Duyệt cây con trái (Left) → Duyệt cây con phải (Right).</li>' +
      '<li><b>Inorder (LNR)</b>: Duyệt trái → Xử lý gốc → Duyệt phải (trên BST cho ra dãy tăng dần!).</li>' +
      '<li><b>Postorder (LRN)</b>: Duyệt trái → Duyệt phải → Xử lý gốc.</li>' +
      '<li><b>Breadth-First (Duyệt theo mức)</b>: Dùng hàng đợi <code>bfQueue</code> duyệt từng mức từ trên xuống dưới, trái sang phải.</li>' +
      '</ul>',
    init(ds) {
      // Exact tree from slide p.42: 23, 18, 44, 12, 20, 35, 52
      ds.root = buildBSTFromArray([23, 18, 44, 12, 20, 35, 52]);
    },
    view(ds) {
      return [{
        kind: 'tree', key: 't', title: 'Cây nhị phân (H = ' + DSA.treeHeight(ds.root) + ', hiển thị B = H_L − H_R)',
        root: DSA.treeSnapshot(ds.root, {}, { badge: (n) => 'B=' + balanceFactor(n) }),
      }];
    },
    ops: [
      {
        id: 'preorder',
        label: 'Preorder (NLR)',
        args: [],
        code: {
          cpp: `void preOrder(Node* root) {
    if (root != nullptr) {                          @@check
        process(root->data);                        @@visit
        preOrder(root->left);                       @@goL
        preOrder(root->right);                      @@goR
    }
}`,
          java: `static void preOrder(Node root) {
    if (root != null) {                             @@check
        process(root.data);                         @@visit
        preOrder(root.left);                        @@goL
        preOrder(root.right);                       @@goR
    }
}`,
          python: `def pre_order(root):
    if root is not None:                            @@check
        process(root.data)                          @@visit
        pre_order(root.left)                        @@goL
        pre_order(root.right)                       @@goR`,
          pseudo: `Algorithm preOrder(val root <pointer>)
if root is not null then                            @@check
    process(root)                                   @@visit
    preOrder(root->left)                            @@goL
    preOrder(root->right)                           @@goR
end
Return
End preOrder`,
        },
        run(_, ds) { return runDFS(ds.root, 'NLR'); },
      },
      {
        id: 'inorder',
        label: 'Inorder (LNR)',
        args: [],
        code: {
          cpp: `void inOrder(Node* root) {
    if (root != nullptr) {                          @@check
        inOrder(root->left);                        @@goL
        process(root->data);                        @@visit
        inOrder(root->right);                       @@goR
    }
}`,
          java: `static void inOrder(Node root) {
    if (root != null) {                             @@check
        inOrder(root.left);                         @@goL
        process(root.data);                         @@visit
        inOrder(root.right);                        @@goR
    }
}`,
          python: `def in_order(root):
    if root is not None:                            @@check
        in_order(root.left)                         @@goL
        process(root.data)                          @@visit
        in_order(root.right)                        @@goR`,
          pseudo: `Algorithm inOrder(val root <pointer>)
if root is not null then                            @@check
    inOrder(root->left)                             @@goL
    process(root)                                   @@visit
    inOrder(root->right)                            @@goR
end
Return
End inOrder`,
        },
        run(_, ds) { return runDFS(ds.root, 'LNR'); },
      },
      {
        id: 'postorder',
        label: 'Postorder (LRN)',
        args: [],
        code: {
          cpp: `void postOrder(Node* root) {
    if (root != nullptr) {                          @@check
        postOrder(root->left);                      @@goL
        postOrder(root->right);                     @@goR
        process(root->data);                        @@visit
    }
}`,
          java: `static void postOrder(Node root) {
    if (root != null) {                             @@check
        postOrder(root.left);                       @@goL
        postOrder(root.right);                      @@goR
        process(root.data);                         @@visit
    }
}`,
          python: `def post_order(root):
    if root is not None:                            @@check
        post_order(root.left)                       @@goL
        post_order(root.right)                      @@goR
        process(root.data)                          @@visit`,
          pseudo: `Algorithm postOrder(val root <pointer>)
if root is not null then                            @@check
    postOrder(root->left)                           @@goL
    postOrder(root->right)                          @@goR
    process(root)                                   @@visit
end
Return
End postOrder`,
        },
        run(_, ds) { return runDFS(ds.root, 'LRN'); },
      },
      {
        id: 'bfs',
        label: 'Breadth-First (bfQueue)',
        args: [],
        code: {
          cpp: `void breadthFirst(Node* root) {
    Node* currentNode = root;                       @@init
    std::queue<Node*> bfQueue;                      @@init
    while (currentNode != nullptr) {                @@loop
        process(currentNode->data);                 @@visit
        if (currentNode->left != nullptr)           @@enqL
            bfQueue.push(currentNode->left);        @@enqL
        if (currentNode->right != nullptr)          @@enqR
            bfQueue.push(currentNode->right);       @@enqR
        if (!bfQueue.empty()) {                     @@deq
            currentNode = bfQueue.front(); bfQueue.pop(); @@deq
        } else currentNode = nullptr;               @@deq
    }
}`,
          java: `static void breadthFirst(Node root) {
    Node currentNode = root;                        @@init
    Queue<Node> bfQueue = new ArrayDeque<>();       @@init
    while (currentNode != null) {                   @@loop
        process(currentNode.data);                  @@visit
        if (currentNode.left != null) bfQueue.add(currentNode.left);   @@enqL
        if (currentNode.right != null) bfQueue.add(currentNode.right); @@enqR
        currentNode = bfQueue.isEmpty() ? null : bfQueue.poll();       @@deq
    }
}`,
          python: `from collections import deque
def breadth_first(root):
    current_node = root                             @@init
    bf_queue = deque()                              @@init
    while current_node is not None:                 @@loop
        process(current_node.data)                  @@visit
        if current_node.left: bf_queue.append(current_node.left)   @@enqL
        if current_node.right: bf_queue.append(current_node.right) @@enqR
        current_node = bf_queue.popleft() if bf_queue else None    @@deq`,
          pseudo: `Algorithm breadthFirst(val root <pointer>)
currentNode = root; bfQueue = createQueue()         @@init
while currentNode not null do                       @@loop
    process(currentNode)                            @@visit
    if currentNode->left not null then
        enqueue(bfQueue, currentNode->left)         @@enqL
    end
    if currentNode->right not null then
        enqueue(bfQueue, currentNode->right)        @@enqR
    end
    if not emptyQueue(bfQueue) then
        currentNode = dequeue(bfQueue)              @@deq
    else currentNode = NULL end                     @@deq
end
destroyQueue(bfQueue)
End breadthFirst`,
        },
        run(_, ds) {
          const R = new DSA.Recorder();
          const visited = {};
          const out = [];
          const q = [];
          let cur = ds.root;
          const snap = (extra) => [
            { kind: 'tree', key: 't', title: 'Breadth-First Traversal', root: DSA.treeSnapshot(ds.root, Object.assign({}, visited, extra || {})) },
            { kind: 'list', key: 'q', title: 'bfQueue (Hàng đợi)', style: 'queue', half: true, items: q.map((n) => ({ label: n.key, hl: 'active' })) },
            { kind: 'list', key: 'o', title: 'Thứ tự đã duyệt', half: true, items: out.map((k, i) => ({ label: k, hl: i === out.length - 1 ? 'found' : 'sorted' })) },
          ];

          R.step({ line: 'init', msg: 'Khởi tạo <code>currentNode = root</code>, tạo hàng đợi rỗng <code>bfQueue</code>.', vars: { currentNode: cur ? cur.key : 'NULL' }, panels: snap(cur ? { [cur.id]: 'active' } : {}) });
          while (cur) {
            visited[cur.id] = 'sorted';
            out.push(cur.key);
            R.step({ line: 'visit', msg: '<code>process(' + cur.key + ')</code> → xuất <b>' + cur.key + '</b>.', vars: { currentNode: cur.key, output: out.join(', ') }, panels: snap({ [cur.id]: 'found' }) });
            if (cur.left) {
              q.push(cur.left);
              visited[cur.left.id] = 'visited';
              R.step({ line: 'enqL', msg: '<code>enqueue(bfQueue, ' + cur.left.key + ')</code> (con trái).', vars: { currentNode: cur.key, enqueued: cur.left.key }, panels: snap({ [cur.id]: 'active', [cur.left.id]: 'compare' }) });
            }
            if (cur.right) {
              q.push(cur.right);
              visited[cur.right.id] = 'visited';
              R.step({ line: 'enqR', msg: '<code>enqueue(bfQueue, ' + cur.right.key + ')</code> (con phải).', vars: { currentNode: cur.key, enqueued: cur.right.key }, panels: snap({ [cur.id]: 'active', [cur.right.id]: 'compare' }) });
            }
            cur = q.length ? q.shift() : null;
            R.step({ line: 'deq', msg: cur ? '<code>currentNode = dequeue(bfQueue) = ' + cur.key + '</code>.' : 'Hàng đợi rỗng → <code>currentNode = NULL</code>, kết thúc!', vars: { currentNode: cur ? cur.key : 'NULL', output: out.join(', ') }, panels: snap(cur ? { [cur.id]: 'active' } : {}) });
          }
          return R.steps;
        },
      },
      {
        id: 'setTree',
        label: 'Đổi cây mẫu & Tính H, B = H_L − H_R',
        args: [{ id: 'arr', label: 'Dãy khóa chèn vào cây', type: 'array', value: '23 18 44 12 20 35 52' }],
        code: {
          cpp: `int treeHeight(Node* root) {
    if (root == nullptr) return 0;                  @@base
    int hL = treeHeight(root->left);                @@calc
    int hR = treeHeight(root->right);               @@calc
    return 1 + std::max(hL, hR);                    @@ret
}
int balanceFactor(Node* root) {
    if (root == nullptr) return 0;
    return treeHeight(root->left) - treeHeight(root->right); @@bf
}`,
          java: `static int treeHeight(Node root) {
    if (root == null) return 0;                     @@base
    return 1 + Math.max(treeHeight(root.left), treeHeight(root.right)); @@ret
}
static int balanceFactor(Node root) {
    return root == null ? 0 : treeHeight(root.left) - treeHeight(root.right); @@bf
}`,
          python: `def tree_height(root):
    if root is None: return 0                       @@base
    return 1 + max(tree_height(root.left), tree_height(root.right)) @@ret

def balance_factor(root):
    if root is None: return 0
    return tree_height(root.left) - tree_height(root.right) @@bf`,
          pseudo: `Algorithm treeHeight(val root <pointer>)
// Height & Balance Factor B = H_L - H_R
if root is null then return 0                       @@base
H_L = treeHeight(root->left)                        @@calc
H_R = treeHeight(root->right)                       @@calc
B = H_L - H_R // Balance factor of root             @@bf
return 1 + max(H_L, H_R)                            @@ret
End treeHeight`,
        },
        run({ arr }, ds) {
          const R = new DSA.Recorder();
          ds.root = null;
          arr.forEach((k, idx) => {
            ds.root = insertBSTPlain(ds.root, k);
            R.step({
              line: ['calc', 'bf'],
              msg: 'Bước ' + (idx + 1) + ': thêm <code>' + k + '</code> → chiều cao cây <code>H = ' + DSA.treeHeight(ds.root) + '</code>.',
              vars: { inserted: k, height: DSA.treeHeight(ds.root), rootBalanceB: balanceFactor(ds.root) },
              panels: [{ kind: 'tree', key: 't', title: 'Cây nhị phân (H = ' + DSA.treeHeight(ds.root) + ', B = H_L − H_R)', root: DSA.treeSnapshot(ds.root, {}, { badge: (n) => 'B=' + balanceFactor(n) }) }],
            });
          });
          return R.steps;
        },
      },
    ],
  });

  function runDFS(root, order) {
    const R = new DSA.Recorder();
    const visited = {};
    const out = [];
    const stack = [];
    const snap = (extra) => [
      { kind: 'tree', key: 't', title: 'Duyệt ' + order, root: DSA.treeSnapshot(root, Object.assign({}, visited, extra || {})) },
      { kind: 'list', key: 's', title: 'Call Stack', style: 'stack', half: true, items: stack.map((k, i) => ({ label: k, hl: i === stack.length - 1 ? 'active' : '' })) },
      { kind: 'list', key: 'o', title: 'Thứ tự xuất (' + order + ')', half: true, items: out.map((k, i) => ({ label: k, hl: i === out.length - 1 ? 'found' : 'sorted' })) },
    ];
    function walk(n) {
      if (!n) return;
      stack.push(n.key);
      R.step({ line: 'check', msg: 'Vào nút <code>' + n.key + '</code>.', vars: { node: n.key, output: out.join(', ') }, panels: snap({ [n.id]: 'active' }) });
      if (order === 'NLR') {
        visited[n.id] = 'sorted'; out.push(n.key);
        R.step({ line: 'visit', msg: '<code>process(' + n.key + ')</code> → xuất <b>' + n.key + '</b>.', vars: { node: n.key, output: out.join(', ') }, panels: snap({ [n.id]: 'found' }) });
      }
      if (n.left) {
        R.step({ line: 'goL', msg: 'Gọi đệ quy sang con trái của <code>' + n.key + '</code> (<code>' + n.left.key + '</code>).', vars: { node: n.key, left: n.left.key }, panels: snap({ [n.id]: 'active', [n.left.id]: 'compare' }) });
        walk(n.left);
      }
      if (order === 'LNR') {
        visited[n.id] = 'sorted'; out.push(n.key);
        R.step({ line: 'visit', msg: '<code>process(' + n.key + ')</code> → xuất <b>' + n.key + '</b>.', vars: { node: n.key, output: out.join(', ') }, panels: snap({ [n.id]: 'found' }) });
      }
      if (n.right) {
        R.step({ line: 'goR', msg: 'Gọi đệ quy sang con phải của <code>' + n.key + '</code> (<code>' + n.right.key + '</code>).', vars: { node: n.key, right: n.right.key }, panels: snap({ [n.id]: 'active', [n.right.id]: 'compare' }) });
        walk(n.right);
      }
      if (order === 'LRN') {
        visited[n.id] = 'sorted'; out.push(n.key);
        R.step({ line: 'visit', msg: '<code>process(' + n.key + ')</code> → xuất <b>' + n.key + '</b>.', vars: { node: n.key, output: out.join(', ') }, panels: snap({ [n.id]: 'found' }) });
      }
      stack.pop();
    }
    walk(root);
    R.step({ line: 'check', msg: 'Hoàn tất duyệt ' + order + ': <b>' + out.join(', ') + '</b>.', vars: { result: out.join(', ') }, panels: snap() });
    return R.steps;
  }

  /* ---------------------------------------------------------------------
   * 2. Expression Tree (Tree_concept.pdf p.32-36)
   * ------------------------------------------------------------------- */
  function parseExprToTree(expr) {
    const tokens = String(expr).match(/[A-Za-z0-9]+|[+\-*/^()]/g) || [];
    const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
    const isOp = (t) => prec[t] !== undefined;
    // Detect postfix if last token is operator
    if (tokens.length > 2 && isOp(tokens[tokens.length - 1]) && !tokens.includes('(')) {
      const st = [];
      tokens.forEach((t) => {
        if (isOp(t)) { const r = st.pop(), l = st.pop(); st.push(mkNode(t, l, r)); }
        else st.push(mkNode(t));
      });
      return st[0] || null;
    }
    // Shunting-yard for infix
    const out = [], ops = [];
    tokens.forEach((t) => {
      if (t === '(') ops.push(t);
      else if (t === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          const op = ops.pop(), r = out.pop(), l = out.pop();
          out.push(mkNode(op, l, r));
        }
        ops.pop();
      } else if (isOp(t)) {
        while (ops.length && isOp(ops[ops.length - 1]) && prec[ops[ops.length - 1]] >= prec[t]) {
          const op = ops.pop(), r = out.pop(), l = out.pop();
          out.push(mkNode(op, l, r));
        }
        ops.push(t);
      } else out.push(mkNode(t));
    });
    while (ops.length) {
      const op = ops.pop(), r = out.pop(), l = out.pop();
      out.push(mkNode(op, l, r));
    }
    return out[0] || null;
  }

  DSA.register({
    id: 'expression-tree',
    chapter: 'tree',
    name: 'Cây biểu thức (Expression Tree: Infix / Prefix / Postfix)',
    short: 'Infix / Postfix / Prefix',
    complexity: [
      ['Nút lá (Leaves)', 'Toán hạng (Operands)'],
      ['Nút nội & gốc', 'Toán tử (Operators)'],
      ['Duyệt Infix / Prefix / Postfix', 'O(n)'],
    ],
    description:
      '<p>Trong <b>Expression Tree (Cây biểu thức)</b>:</p>' +
      '<ul>' +
      '<li>Mỗi nút lá (leaf) là một <b>toán hạng (operand)</b>.</li>' +
      '<li>Nút gốc và các nút nội là <b>toán tử (operator)</b>.</li>' +
      '<li>Hàm <code>infix(tree)</code> in thêm cặp ngoặc đơn <code>( ... )</code> bao quanh mỗi biểu thức con để giữ đúng thứ tự ưu tiên phép toán.</li>' +
      '</ul>',
    init(ds) {
      ds.expr = 'a + b * (c - d)';
      ds.root = parseExprToTree(ds.expr);
    },
    view(ds) {
      return [{ kind: 'tree', key: 't', title: 'Cây biểu thức: ' + ds.expr, root: DSA.treeSnapshot(ds.root) }];
    },
    ops: [
      {
        id: 'infix',
        label: 'Duyệt Infix có ngoặc',
        args: [{ id: 'expr', label: 'Biểu thức (Infix hoặc Postfix)', type: 'text', value: 'a + b * (c - d)' }],
        code: {
          cpp: `void infix(Node* tree) {
    if (tree != nullptr) {                          @@check
        if (isOperand(tree->data))                  @@isOpnd
            std::cout << tree->data;                @@printOpnd
        else {
            std::cout << "(";                       @@openP
            infix(tree->left);                      @@goL
            std::cout << tree->data;                @@printOp
            infix(tree->right);                     @@goR
            std::cout << ")";                       @@closeP
        }
    }
}`,
          java: `static void infix(Node tree, StringBuilder out) {
    if (tree != null) {                             @@check
        if (tree.isLeaf()) {                        @@isOpnd
            out.append(tree.data);                  @@printOpnd
        } else {
            out.append("(");                        @@openP
            infix(tree.left, out);                  @@goL
            out.append(tree.data);                  @@printOp
            infix(tree.right, out);                 @@goR
            out.append(")");                        @@closeP
        }
    }
}`,
          python: `def infix(tree):
    if tree is not None:                            @@check
        if is_operand(tree.data):                   @@isOpnd
            print(tree.data, end="")                @@printOpnd
        else:
            print("(", end="")                      @@openP
            infix(tree.left)                        @@goL
            print(tree.data, end="")                @@printOp
            infix(tree.right)                       @@goR
            print(")", end="")                      @@closeP`,
          pseudo: `Algorithm infix(val tree <pointer>)
if tree not empty then                              @@check
    if tree->data is an operand then                @@isOpnd
        print (tree->data)                          @@printOpnd
    else
        print (open parenthesis)                    @@openP
        infix (tree->left)                          @@goL
        print (tree->data)                          @@printOp
        infix (tree->right)                         @@goR
        print (close parenthesis)                   @@closeP
    end
end
End infix`,
        },
        run({ expr }, ds) {
          ds.expr = expr;
          ds.root = parseExprToTree(expr);
          const R = new DSA.Recorder();
          const out = [];
          const visited = {};
          const snap = (extra) => [
            { kind: 'tree', key: 't', title: 'Expression Tree', root: DSA.treeSnapshot(ds.root, Object.assign({}, visited, extra || {})) },
            { kind: 'list', key: 'o', title: 'Chuỗi Infix xuất ra', sep: '', items: out.map((t, i) => ({ label: t, hl: i === out.length - 1 ? 'found' : '' })) },
          ];
          function walk(n) {
            if (!n) return;
            const isLeaf = !n.left && !n.right;
            if (isLeaf) {
              visited[n.id] = 'sorted';
              out.push(n.key);
              R.step({ line: 'printOpnd', msg: 'Nút lá (toán hạng) → in <code>' + n.key + '</code>.', vars: { token: n.key, infix: out.join(' ') }, panels: snap({ [n.id]: 'found' }) });
            } else {
              out.push('(');
              R.step({ line: 'openP', msg: 'Nút toán tử <code>' + n.key + '</code> → in mở ngoặc <code>(</code> rồi duyệt trái.', vars: { operator: n.key, infix: out.join(' ') }, panels: snap({ [n.id]: 'active' }) });
              walk(n.left);
              visited[n.id] = 'sorted';
              out.push(n.key);
              R.step({ line: 'printOp', msg: 'In toán tử <code>' + n.key + '</code> rồi duyệt phải.', vars: { operator: n.key, infix: out.join(' ') }, panels: snap({ [n.id]: 'found' }) });
              walk(n.right);
              out.push(')');
              R.step({ line: 'closeP', msg: 'Hoàn tất biểu thức con của <code>' + n.key + '</code> → in đóng ngoặc <code>)</code>.', vars: { operator: n.key, infix: out.join(' ') }, panels: snap({ [n.id]: 'sorted' }) });
            }
          }
          walk(ds.root);
          return R.steps;
        },
      },
      {
        id: 'postfix',
        label: 'Duyệt Postfix & Prefix',
        args: [{ id: 'expr', label: 'Biểu thức', type: 'text', value: '(3 + 4) * (10 - 2)' }],
        code: {
          cpp: `void postfix(Node* tree) {
    if (tree != nullptr) {                          @@post
        postfix(tree->left);                        @@post
        postfix(tree->right);                       @@post
        std::cout << tree->data << " ";             @@postPrint
    }
}
void prefix(Node* tree) {
    if (tree != nullptr) {                          @@pre
        std::cout << tree->data << " ";             @@prePrint
        prefix(tree->left);                         @@pre
        prefix(tree->right);                        @@pre
    }
}`,
          java: `static void postfix(Node tree, List<String> out) {
    if (tree != null) {                             @@post
        postfix(tree.left, out);                    @@post
        postfix(tree.right, out);                   @@post
        out.add(tree.data);                         @@postPrint
    }
}
static void prefix(Node tree, List<String> out) {
    if (tree != null) {                             @@pre
        out.add(tree.data);                         @@prePrint
        prefix(tree.left, out);                     @@pre
        prefix(tree.right, out);                    @@pre
    }
}`,
          python: `def postfix(tree, out):
    if tree is not None:                            @@post
        postfix(tree.left, out)                     @@post
        postfix(tree.right, out)                    @@post
        out.append(tree.data)                       @@postPrint

def prefix(tree, out):
    if tree is not None:                            @@pre
        out.append(tree.data)                       @@prePrint
        prefix(tree.left, out)                      @@pre
        prefix(tree.right, out)                     @@pre`,
          pseudo: `Algorithm postfix(val tree <pointer>)
if tree not empty then                              @@post
    postfix (tree->left)
    postfix (tree->right)
    print (tree->data)                              @@postPrint
end
End postfix

Algorithm prefix(val tree <pointer>)
if tree not empty then                              @@pre
    print (tree->data)                              @@prePrint
    prefix (tree->left)
    prefix (tree->right)
end
End prefix`,
        },
        run({ expr }, ds) {
          ds.expr = expr;
          ds.root = parseExprToTree(expr);
          const R = new DSA.Recorder();
          const post = [], pre = [];
          (function preW(n) { if (!n) return; pre.push(n.key); preW(n.left); preW(n.right); })(ds.root);
          const visited = {};
          (function postW(n) {
            if (!n) return;
            postW(n.left);
            postW(n.right);
            visited[n.id] = 'sorted';
            post.push(n.key);
            R.step({
              line: 'postPrint',
              msg: 'Postfix: xuất <code>' + n.key + '</code>.',
              vars: { postfix: post.join(' '), prefix: pre.join(' ') },
              panels: [
                { kind: 'tree', key: 't', title: 'Cây biểu thức', root: DSA.treeSnapshot(ds.root, Object.assign({}, visited, { [n.id]: 'found' })) },
                { kind: 'list', key: 'po', title: 'Postfix (LRN – Ký pháp Ba Lan ngược)', half: true, items: post.map((x, i) => ({ label: x, hl: i === post.length - 1 ? 'found' : 'sorted' })) },
                { kind: 'list', key: 'pr', title: 'Prefix (NLR – Ký pháp Ba Lan)', half: true, items: pre.map((x) => ({ label: x, hl: 'active' })) },
              ],
            });
          })(ds.root);
          return R.steps;
        },
      },
      {
        id: 'eval',
        label: 'Tính giá trị cây biểu thức (Evaluate)',
        args: [{ id: 'expr', label: 'Biểu thức số', type: 'text', value: '(3 + 4) * (10 - 2)' }],
        code: {
          cpp: `double evalExprTree(Node* root) {
    if (!root) return 0;
    if (!root->left && !root->right)                @@leafVal
        return std::stod(root->data);               @@leafVal
    double L = evalExprTree(root->left);            @@evalL
    double R = evalExprTree(root->right);           @@evalR
    switch (root->data[0]) {                        @@applyOp
        case '+': return L + R;                     @@applyOp
        case '-': return L - R;                     @@applyOp
        case '*': return L * R;                     @@applyOp
        case '/': return L / R;                     @@applyOp
    }
    return 0;
}`,
          java: `static double evalExprTree(Node root) {
    if (root == null) return 0;
    if (root.left == null && root.right == null)    @@leafVal
        return Double.parseDouble(root.data);       @@leafVal
    double L = evalExprTree(root.left);             @@evalL
    double R = evalExprTree(root.right);            @@evalR
    return switch (root.data) {                     @@applyOp
        case "+" -> L + R; case "-" -> L - R;       @@applyOp
        case "*" -> L * R; default -> L / R;        @@applyOp
    };
}`,
          python: `def eval_expr_tree(root):
    if root is None: return 0
    if not root.left and not root.right:            @@leafVal
        return float(root.data)                     @@leafVal
    L = eval_expr_tree(root.left)                   @@evalL
    R = eval_expr_tree(root.right)                  @@evalR
    if root.data == '+': return L + R               @@applyOp
    if root.data == '-': return L - R               @@applyOp
    if root.data == '*': return L * R               @@applyOp
    return L / R                                    @@applyOp`,
          pseudo: `Algorithm evaluateExpressionTree(val tree <pointer>)
if tree is a leaf (operand) then
    return numericValue(tree->data)                 @@leafVal
end
leftVal = evaluateExpressionTree(tree->left)        @@evalL
rightVal = evaluateExpressionTree(tree->right)      @@evalR
return applyOperator(tree->data, leftVal, rightVal) @@applyOp
End evaluateExpressionTree`,
        },
        run({ expr }, ds) {
          ds.expr = expr;
          ds.root = parseExprToTree(expr);
          const R = new DSA.Recorder();
          const vals = {};
          const visited = {};
          function evalN(n) {
            if (!n) return 0;
            if (!n.left && !n.right) {
              const v = Number(n.key);
              vals[n.id] = isNaN(v) ? 1 : v;
              visited[n.id] = 'sorted';
              R.step({
                line: 'leafVal',
                msg: 'Nút lá <code>' + n.key + '</code> → giá trị = <b>' + vals[n.id] + '</b>.',
                vars: { node: n.key, value: vals[n.id] },
                panels: [{ kind: 'tree', key: 't', title: 'Đánh giá cây biểu thức', root: DSA.treeSnapshot(ds.root, Object.assign({}, visited, { [n.id]: 'found' }), { badge: (x) => vals[x.id] !== undefined ? '=' + vals[x.id] : '' }) }],
              });
              return vals[n.id];
            }
            const L = evalN(n.left);
            const Rv = evalN(n.right);
            let res = 0;
            if (n.key === '+') res = L + Rv;
            else if (n.key === '-') res = L - Rv;
            else if (n.key === '*') res = L * Rv;
            else if (n.key === '/') res = Rv !== 0 ? Math.round((L / Rv) * 100) / 100 : 0;
            else if (n.key === '^') res = Math.pow(L, Rv);
            vals[n.id] = res;
            visited[n.id] = 'sorted';
            R.step({
              line: 'applyOp',
              msg: 'Tính tại nút toán tử <code>' + n.key + '</code>: <code>' + L + ' ' + n.key + ' ' + Rv + ' = ' + res + '</code>.',
              vars: { operator: n.key, leftVal: L, rightVal: Rv, result: res },
              panels: [{ kind: 'tree', key: 't', title: 'Kết quả tại ' + n.key + ' = ' + res, root: DSA.treeSnapshot(ds.root, Object.assign({}, visited, { [n.id]: 'found' }), { badge: (x) => vals[x.id] !== undefined ? '=' + vals[x.id] : '' }) }],
            });
            return res;
          }
          evalN(ds.root);
          return R.steps;
        },
      },
    ],
  });

  /* ---------------------------------------------------------------------
   * 3. Binary Search Tree – BST (Tree_concept.pdf p.38-62)
   * ------------------------------------------------------------------- */
  const CODE_BST_SEARCH = {
    cpp: `Node* searchBST(Node* root, int target) {
    if (root == nullptr) return nullptr;            @@nullCheck
    if (target < root->key)                         @@cmpL
        return searchBST(root->left, target);       @@goL
    else if (target > root->key)                    @@cmpR
        return searchBST(root->right, target);      @@goR
    else
        return root;                                @@found
}
Node* iterativeSearchBST(Node* root, int target) {
    while (root != nullptr && root->key != target) {
        if (target < root->key) root = root->left;
        else root = root->right;
    }
    return root;
}`,
    java: `static Node searchBST(Node root, int target) {
    if (root == null) return null;                  @@nullCheck
    if (target < root.key) return searchBST(root.left, target);   @@goL
    if (target > root.key) return searchBST(root.right, target);  @@goR
    return root;                                    @@found
}`,
    python: `def search_bst(root, target):
    if root is None: return None                    @@nullCheck
    if target < root.key:                           @@cmpL
        return search_bst(root.left, target)        @@goL
    elif target > root.key:                         @@cmpR
        return search_bst(root.right, target)       @@goR
    return root                                     @@found`,
    pseudo: `Algorithm searchBST(val root <pointer>, val target <keyType>)
if root is null then return null                    @@nullCheck
if target < root->data.key then                     @@cmpL
    return searchBST(root->left, target)            @@goL
else if target > root->data.key then                @@cmpR
    return searchBST(root->right, target)           @@goR
else
    return root                                     @@found
end
End searchBST`,
  };

  const CODE_BST_INSERT = {
    cpp: `void iterativeInsertBST(Node*& root, Node* newNode) {
    if (root == nullptr) { root = newNode; return; } @@emptyRoot
    Node* pWalk = root;                              @@initWalk
    Node* parent = nullptr;
    while (pWalk != nullptr) {                       @@walkLoop
        parent = pWalk;                              @@setParent
        if (newNode->key < pWalk->key)               @@cmpKey
            pWalk = pWalk->left;                     @@walkL
        else
            pWalk = pWalk->right;                    @@walkR
    }
    if (newNode->key < parent->key)                  @@attach
        parent->left = newNode;                      @@attach
    else
        parent->right = newNode;                     @@attach
}
void addBST(Node*& root, Node* newNode) { // Recursive
    if (root == nullptr) root = newNode;             @@emptyRoot
    else if (newNode->key < root->key)               @@walkL
        addBST(root->left, newNode);                 @@walkL
    else
        addBST(root->right, newNode);                @@walkR
}`,
    java: `static Node insertBST(Node root, Node newNode) {
    if (root == null) return newNode;               @@emptyRoot
    Node pWalk = root, parent = null;               @@initWalk
    while (pWalk != null) {                         @@walkLoop
        parent = pWalk;                             @@setParent
        if (newNode.key < pWalk.key) pWalk = pWalk.left;  @@walkL
        else pWalk = pWalk.right;                   @@walkR
    }
    if (newNode.key < parent.key) parent.left = newNode;  @@attach
    else parent.right = newNode;                    @@attach
    return root;
}`,
    python: `def iterative_insert_bst(root, new_node):
    if root is None: return new_node                @@emptyRoot
    p_walk, parent = root, None                     @@initWalk
    while p_walk is not None:                       @@walkLoop
        parent = p_walk                             @@setParent
        if new_node.key < p_walk.key: p_walk = p_walk.left   @@walkL
        else: p_walk = p_walk.right                 @@walkR
    if new_node.key < parent.key: parent.left = new_node     @@attach
    else: parent.right = new_node                   @@attach
    return root`,
    pseudo: `Algorithm iterativeInsertBST(ref root <pointer>, val new <pointer>)
if root is null then root = new                     @@emptyRoot
else
    pWalk = root                                    @@initWalk
    while pWalk not null do                         @@walkLoop
        parent = pWalk                              @@setParent
        if new->data.key < pWalk->data.key then     @@cmpKey
            pWalk = pWalk->left                     @@walkL
        else
            pWalk = pWalk->right                    @@walkR
        end
    end
    if new->data.key < parent->data.key then
        parent->left = new                          @@attach
    else parent->right = new end                    @@attach
end
End iterativeInsertBST

Algorithm addBST(ref root <pointer>, val new <pointer>)
if root is null then root = new                     @@emptyRoot
else if new->data.key < root->data.key then         @@walkL
    addBST(root->left, new)                         @@walkL
else addBST(root->right, new) end                   @@walkR
End addBST`,
  };

  const CODE_BST_DELETE = {
    cpp: `bool deleteBST(Node*& root, int dltKey) {
    if (root == nullptr) return false;              @@nullCheck
    if (dltKey < root->key)                         @@goL
        return deleteBST(root->left, dltKey);       @@goL
    else if (dltKey > root->key)                    @@goR
        return deleteBST(root->right, dltKey);      @@goR
    else { // Node found
        if (root->left == nullptr) {                @@noLeft
            Node* dltPtr = root; root = root->right; delete dltPtr; return true; @@noLeft
        } else if (root->right == nullptr) {        @@noRight
            Node* dltPtr = root; root = root->left; delete dltPtr; return true;  @@noRight
        } else { // Both subtrees exist: find largest on left subtree
            Node* dltPtr = root->left;              @@findPred
            while (dltPtr->right != nullptr)        @@findPred
                dltPtr = dltPtr->right;             @@findPred
            root->key = dltPtr->key;                @@copyPred
            return deleteBST(root->left, dltPtr->key); @@delPred
        }
    }
}`,
    java: `static Node deleteBST(Node root, int dltKey) {
    if (root == null) return null;                  @@nullCheck
    if (dltKey < root.key) root.left = deleteBST(root.left, dltKey);   @@goL
    else if (dltKey > root.key) root.right = deleteBST(root.right, dltKey); @@goR
    else {
        if (root.left == null) return root.right;   @@noLeft
        if (root.right == null) return root.left;   @@noRight
        Node dltPtr = root.left;                    @@findPred
        while (dltPtr.right != null) dltPtr = dltPtr.right; @@findPred
        root.key = dltPtr.key;                      @@copyPred
        root.left = deleteBST(root.left, dltPtr.key); @@delPred
    }
    return root;
}`,
    python: `def delete_bst(root, dlt_key):
    if root is None: return None                    @@nullCheck
    if dlt_key < root.key:
        root.left = delete_bst(root.left, dlt_key)  @@goL
    elif dlt_key > root.key:
        root.right = delete_bst(root.right, dlt_key) @@goR
    else:
        if root.left is None: return root.right     @@noLeft
        if root.right is None: return root.left     @@noRight
        dlt_ptr = root.left                         @@findPred
        while dlt_ptr.right: dlt_ptr = dlt_ptr.right @@findPred
        root.key = dlt_ptr.key                      @@copyPred
        root.left = delete_bst(root.left, dlt_ptr.key) @@delPred
    return root`,
    pseudo: `Algorithm deleteBST(ref root <pointer>, val dltKey <keyType>)
if root is null then return false                   @@nullCheck
if dltKey < root->data.key then
    return deleteBST(root->left, dltKey)            @@goL
else if dltKey > root->data.key then
    return deleteBST(root->right, dltKey)           @@goR
else // Deleted node found
    if root->left is null then                      @@noLeft
        dltPtr = root; root = root->right; recycle(dltPtr); return true @@noLeft
    else if root->right is null then                @@noRight
        dltPtr = root; root = root->left; recycle(dltPtr); return true  @@noRight
    else // Find largest node on left subtree (predecessor)
        dltPtr = root->left                         @@findPred
        while dltPtr->right not null do
            dltPtr = dltPtr->right                  @@findPred
        end
        root->data = dltPtr->data                   @@copyPred
        return deleteBST(root->left, dltPtr->data.key) @@delPred
    end
end
End deleteBST`,
  };

  DSA.register({
    id: 'bst',
    chapter: 'tree',
    name: 'Cây tìm kiếm nhị phân (Binary Search Tree – BST)',
    short: 'O(log n) avg',
    complexity: [
      ['Search / Insert / Delete (Avg)', 'O(log₂ n)'],
      ['Worst (cây suy biến)', 'O(n)'],
      ['Tính chất BST', 'Left < Root ≤ Right'],
      ['Inorder(BST)', 'Cho danh sách tăng dần'],
    ],
    description:
      '<p><b>Binary Search Tree (BST)</b> là cây nhị phân thỏa: mọi khóa ở cây con trái <b>nhỏ hơn</b> khóa nút gốc, mọi khóa ở cây con phải <b>lớn hơn hoặc bằng</b> khóa nút gốc, và hai cây con cũng là BST.</p>' +
      '<ul>' +
      '<li><b>Thêm nút (Insert)</b>: Luôn diễn ra tại nút lá hoặc nút gần lá (leaflike node).</li>' +
      '<li><b>Xóa nút (Delete)</b> có 3 trường hợp: (1) nút lá → gán liên kết cha bằng NULL; (2) nút chỉ có 1 cây con → nối thẳng cây con lên cha; (3) nút có đủ 2 cây con → thay thế bằng <b>phần tử lớn nhất của cây con trái (predecessor)</b> <code>dltPtr</code> rồi xóa đệ quy <code>dltPtr</code>.</li>' +
      '</ul>',
    init(ds) {
      ds.root = buildBSTFromArray([23, 18, 44, 12, 20, 35, 52]);
    },
    view(ds) {
      return [{ kind: 'tree', key: 't', title: 'Binary Search Tree (BST)', root: DSA.treeSnapshot(ds.root) }];
    },
    ops: [
      {
        id: 'insert',
        label: 'Thêm nút (Insert)',
        code: CODE_BST_INSERT,
        args: [{ id: 'k', label: 'Khóa cần thêm', type: 'number', value: 19, random: () => DSA.randInt(1, 99) }],
        run({ k }, ds) {
          const R = new DSA.Recorder();
          const newNode = mkNode(k);
          if (!ds.root) {
            ds.root = newNode;
            R.step({ line: 'emptyRoot', msg: 'Cây rỗng → đặt <code>root = ' + k + '</code>.', vars: { newKey: k }, panels: [{ kind: 'tree', key: 't', title: 'BST', root: DSA.treeSnapshot(ds.root, { [newNode.id]: 'found' }) }] });
            return R.steps;
          }
          let pWalk = ds.root, parent = null;
          const path = {};
          R.step({
            line: 'initWalk',
            msg: 'Bắt đầu chèn <code>' + k + '</code>: đặt <code>pWalk = root (' + pWalk.key + ')</code>.',
            vars: { newKey: k, pWalk: pWalk.key, parent: 'NULL' },
            panels: [{ kind: 'tree', key: 't', title: 'Insert ' + k, root: DSA.treeSnapshot(ds.root, { [pWalk.id]: 'active' }), floating: [{ id: 'fl', key: k, label: 'new' }] }],
          });
          while (pWalk) {
            parent = pWalk;
            path[parent.id] = 'visited';
            const goLeft = k < pWalk.key;
            pWalk = goLeft ? pWalk.left : pWalk.right;
            R.step({
              line: goLeft ? 'walkL' : 'walkR',
              msg: 'So sánh <code>' + k + (goLeft ? ' &lt; ' : ' ≥ ') + parent.key + '</code> → đi sang nhánh <b>' + (goLeft ? 'trái' : 'phải') + '</b>' + (pWalk ? ' (tới <code>' + pWalk.key + '</code>)' : ' (gặp <code>NULL</code>)') + '.',
              vars: { newKey: k, parent: parent.key, pWalk: pWalk ? pWalk.key : 'NULL' },
              panels: [{ kind: 'tree', key: 't', title: 'Insert ' + k, root: DSA.treeSnapshot(ds.root, Object.assign({}, path, pWalk ? { [pWalk.id]: 'active' } : { [parent.id]: 'compare' })), floating: [{ id: 'fl', key: k, label: 'new' }] }],
            });
          }
          if (k < parent.key) parent.left = newNode; else parent.right = newNode;
          R.step({
            line: 'attach',
            msg: 'Gắn nút mới <code>' + k + '</code> làm con ' + (k < parent.key ? 'trái' : 'phải') + ' của <code>parent = ' + parent.key + '</code>.',
            vars: { newKey: k, parent: parent.key },
            panels: [{ kind: 'tree', key: 't', title: 'Đã chèn ' + k, root: DSA.treeSnapshot(ds.root, Object.assign({}, path, { [newNode.id]: 'found' })) }],
          });
          return R.steps;
        },
      },
      {
        id: 'search',
        label: 'Tìm kiếm (searchBST)',
        code: CODE_BST_SEARCH,
        args: [{ id: 'k', label: 'Khóa target', type: 'number', value: 20 }],
        run({ k }, ds) {
          const R = new DSA.Recorder();
          let cur = ds.root;
          const path = {};
          while (cur) {
            R.step({
              line: k === cur.key ? 'found' : (k < cur.key ? 'cmpL' : 'cmpR'),
              msg: 'Tại nút <code>' + cur.key + '</code>: so sánh <code>target (' + k + ')</code> với <code>' + cur.key + '</code>.',
              vars: { target: k, 'root->key': cur.key },
              panels: [{ kind: 'tree', key: 't', title: 'searchBST(' + k + ')', root: DSA.treeSnapshot(ds.root, Object.assign({}, path, { [cur.id]: cur.key === k ? 'found' : 'compare' })) }],
            });
            if (k === cur.key) return R.steps;
            path[cur.id] = 'visited';
            cur = k < cur.key ? cur.left : cur.right;
          }
          R.step({
            line: 'nullCheck',
            msg: 'Gặp nhánh <code>NULL</code> → không tìm thấy <code>' + k + '</code> trong BST.',
            vars: { target: k, result: 'NULL' },
            panels: [{ kind: 'tree', key: 't', title: 'Không tìm thấy ' + k, root: DSA.treeSnapshot(ds.root, path) }],
          });
          return R.steps;
        },
      },
      {
        id: 'delete',
        label: 'Xóa nút (deleteBST)',
        code: CODE_BST_DELETE,
        args: [{ id: 'k', label: 'Khóa dltKey', type: 'number', value: 23 }],
        run({ k }, ds) {
          const R = new DSA.Recorder();
          const path = {};

          function del(node, key) {
            if (!node) {
              R.step({ line: 'nullCheck', msg: 'Không tìm thấy khóa <code>' + key + '</code> để xóa.', vars: { dltKey: key, found: false }, panels: [{ kind: 'tree', key: 't', title: 'deleteBST(' + key + ')', root: DSA.treeSnapshot(ds.root, path) }] });
              return null;
            }
            if (key < node.key) {
              path[node.id] = 'visited';
              R.step({ line: 'goL', msg: '<code>' + key + ' &lt; ' + node.key + '</code> → tìm xóa bên cây con trái.', vars: { dltKey: key, current: node.key }, panels: [{ kind: 'tree', key: 't', title: 'deleteBST(' + key + ')', root: DSA.treeSnapshot(ds.root, Object.assign({}, path, { [node.id]: 'compare' })) }] });
              node.left = del(node.left, key);
              return node;
            }
            if (key > node.key) {
              path[node.id] = 'visited';
              R.step({ line: 'goR', msg: '<code>' + key + ' &gt; ' + node.key + '</code> → tìm xóa bên cây con phải.', vars: { dltKey: key, current: node.key }, panels: [{ kind: 'tree', key: 't', title: 'deleteBST(' + key + ')', root: DSA.treeSnapshot(ds.root, Object.assign({}, path, { [node.id]: 'compare' })) }] });
              node.right = del(node.right, key);
              return node;
            }
            // Found node to delete
            R.step({
              line: !node.left ? 'noLeft' : (!node.right ? 'noRight' : 'findPred'),
              msg: 'Đã tìm thấy nút cần xóa <code>' + node.key + '</code>.',
              vars: { dltKey: key, leftChild: node.left ? node.left.key : 'NULL', rightChild: node.right ? node.right.key : 'NULL' },
              panels: [{ kind: 'tree', key: 't', title: 'Xóa nút ' + node.key, root: DSA.treeSnapshot(ds.root, Object.assign({}, path, { [node.id]: 'swap' })) }],
            });
            if (!node.left) return node.right;
            if (!node.right) return node.left;

            // Both children exist: find largest on left subtree (dltPtr)
            let dltPtr = node.left;
            while (dltPtr.right) {
              path[dltPtr.id] = 'visited';
              dltPtr = dltPtr.right;
            }
            R.step({
              line: 'findPred',
              msg: 'Nút <code>' + node.key + '</code> có đủ 2 cây con → tìm phần tử lớn nhất cây con trái (predecessor): <code>dltPtr = ' + dltPtr.key + '</code>.',
              vars: { dltNode: node.key, dltPtr: dltPtr.key },
              panels: [{ kind: 'tree', key: 't', title: 'Predecessor dltPtr = ' + dltPtr.key, root: DSA.treeSnapshot(ds.root, Object.assign({}, path, { [node.id]: 'swap', [dltPtr.id]: 'pivot' })) }],
            });
            node.key = dltPtr.key;
            R.step({
              line: 'copyPred',
              msg: 'Chép dữ liệu <code>root->data = dltPtr->data (' + dltPtr.key + ')</code> rồi xóa đệ quy <code>' + dltPtr.key + '</code> trên cây con trái.',
              vars: { newRootKey: node.key, deleteFromLeft: dltPtr.key },
              panels: [{ kind: 'tree', key: 't', title: 'Chép khóa ' + dltPtr.key, root: DSA.treeSnapshot(ds.root, { [node.id]: 'found', [dltPtr.id]: 'swap' }) }],
            });
            node.left = del(node.left, dltPtr.key);
            return node;
          }

          ds.root = del(ds.root, k);
          R.step({
            line: 'delPred',
            msg: 'Cây BST sau khi xóa <code>' + k + '</code>.',
            vars: { deleted: k },
            panels: [{ kind: 'tree', key: 't', title: 'Kết quả sau khi xóa', root: DSA.treeSnapshot(ds.root) }],
          });
          return R.steps;
        },
      },
      {
        id: 'minmax',
        label: 'Tìm Min / Max (findSmallestBST & findLargestBST)',
        args: [],
        code: {
          cpp: `Node* findSmallestBST(Node* root) {
    if (root->left == nullptr) return root;         @@minBase
    return findSmallestBST(root->left);             @@minRec
}
Node* findLargestBST(Node* root) {
    if (root->right == nullptr) return root;        @@maxBase
    return findLargestBST(root->right);            @@maxRec
}`,
          java: `static Node findSmallestBST(Node root) {
    if (root.left == null) return root;             @@minBase
    return findSmallestBST(root.left);              @@minRec
}
static Node findLargestBST(Node root) {
    if (root.right == null) return root;            @@maxBase
    return findLargestBST(root.right);              @@maxRec
}`,
          python: `def find_smallest_bst(root):
    if root.left is None: return root               @@minBase
    return find_smallest_bst(root.left)             @@minRec

def find_largest_bst(root):
    if root.right is None: return root              @@maxBase
    return find_largest_bst(root.right)             @@maxRec`,
          pseudo: `Algorithm findSmallestBST(val root <pointer>)
if root->left null then return root                 @@minBase
return findSmallestBST(root->left)                  @@minRec
End findSmallestBST

Algorithm findLargestBST(val root <pointer>)
if root->right is null then return root             @@maxBase
return findLargestBST(root->right)                  @@maxRec
End findLargestBST`,
        },
        run(_, ds) {
          const R = new DSA.Recorder();
          if (!ds.root) return [{ msg: 'Cây rỗng.' }];
          let cur = ds.root;
          const hl = {};
          while (cur.left) {
            hl[cur.id] = 'visited';
            R.step({ line: 'minRec', msg: 'Tìm Min: rẽ trái từ <code>' + cur.key + '</code> sang <code>' + cur.left.key + '</code>.', vars: { current: cur.key }, panels: [{ kind: 'tree', key: 't', title: 'findSmallestBST', root: DSA.treeSnapshot(ds.root, Object.assign({}, hl, { [cur.left.id]: 'active' })) }] });
            cur = cur.left;
          }
          hl[cur.id] = 'min';
          const minVal = cur.key;
          R.step({ line: 'minBase', msg: '<code>root->left == null</code> → Phần tử nhỏ nhất là <b>' + minVal + '</b>.', vars: { smallest: minVal }, panels: [{ kind: 'tree', key: 't', title: 'Smallest = ' + minVal, root: DSA.treeSnapshot(ds.root, Object.assign({}, hl)) }] });

          cur = ds.root;
          while (cur.right) {
            R.step({ line: 'maxRec', msg: 'Tìm Max: rẽ phải từ <code>' + cur.key + '</code> sang <code>' + cur.right.key + '</code>.', vars: { smallest: minVal, current: cur.key }, panels: [{ kind: 'tree', key: 't', title: 'findLargestBST', root: DSA.treeSnapshot(ds.root, Object.assign({}, hl, { [cur.right.id]: 'active' })) }] });
            cur = cur.right;
          }
          hl[cur.id] = 'found';
          R.step({ line: 'maxBase', msg: '<code>root->right == null</code> → Phần tử lớn nhất là <b>' + cur.key + '</b> (Min = ' + minVal + ', Max = ' + cur.key + ').', vars: { smallest: minVal, largest: cur.key }, panels: [{ kind: 'tree', key: 't', title: 'Min = ' + minVal + ' · Max = ' + cur.key, root: DSA.treeSnapshot(ds.root, hl) }] });
          return R.steps;
        },
      },
      {
        id: 'build',
        label: 'Dựng BST từ dãy khóa',
        code: CODE_BST_INSERT,
        args: [{ id: 'arr', label: 'Dãy khóa', type: 'array', value: '23 18 44 12 20 35 52' }],
        run({ arr }, ds) {
          const R = new DSA.Recorder();
          ds.root = null;
          arr.forEach((k, idx) => {
            ds.root = insertBSTPlain(ds.root, k);
            R.step({
              line: 'attach',
              msg: 'Bước ' + (idx + 1) + '/' + arr.length + ': chèn khóa <code>' + k + '</code> vào BST.',
              vars: { step: idx + 1, insertedKey: k },
              panels: [{ kind: 'tree', key: 't', title: 'BST (đã chèn ' + (idx + 1) + ' khóa)', root: DSA.treeSnapshot(ds.root) }],
            });
          });
          return R.steps;
        },
      },
    ],
  });
})();
