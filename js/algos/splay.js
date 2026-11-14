/* =========================================================================
 * DSA Visualizer – splay.js
 * Slide: Advanced_Trees.pdf (trang 69–103)
 * Splay Tree: splay(N) with Zig, Zag, Zig-Zig, Zag-Zag, Zig-Zag, Zag-Zig;
 * search(k, R), insert(k, R), delete(k, R), and Slide problem presets.
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  function mk(key, left, right) { return { id: DSA.uid('sp'), key, left: left || null, right: right || null }; }

  function rotR(y) { const x = y.left; y.left = x.right; x.right = y; return x; }
  function rotL(x) { const y = x.right; x.right = y.left; y.left = x; return y; }

  /** Find path of nodes from root to key (or last visited node) */
  function findPath(root, key) {
    const path = [];
    let cur = root;
    while (cur) {
      path.push(cur);
      if (key === cur.key) break;
      cur = key < cur.key ? cur.left : cur.right;
    }
    return path;
  }

  function replaceChild(parent, oldChild, newChild, ds) {
    if (!parent) ds.root = newChild;
    else if (parent.left === oldChild) parent.left = newChild;
    else parent.right = newChild;
  }

  const CODE_SPLAY = {
    cpp: `void splay(Node*& root, Node* N) {
    while (N != root) {                             @@loop
        Node* P = N->parent;
        Node* Q = P->parent;
        if (Q == nullptr) { // P is root -> Zig or Zag @@zigCase
            if (N == P->left) rotateRight(P);       @@zig
            else rotateLeft(P);                     @@zag
        } else if (N == P->left && P == Q->left) {  @@zigZig
            rotateRight(Q);                         @@zigZig
            rotateRight(P);                         @@zigZig
        } else if (N == P->right && P == Q->right) { @@zagZag
            rotateLeft(Q);                          @@zagZag
            rotateLeft(P);                          @@zagZag
        } else if (N == P->right && P == Q->left) { @@zigZag
            rotateLeft(P);                          @@zigZag
            rotateRight(Q);                         @@zigZag
        } else { // N == P->left && P == Q->right   @@zagZig
            rotateRight(P);                         @@zagZig
            rotateLeft(Q);                          @@zagZig
        }
    }
}
Node* search(Node*& R, int k) {
    Node* N = findBST(R, k);                        @@bstFind
    if (N) splay(R, N);                             @@callSplay
    return R;
}
void insert(Node*& R, int k) {
    Node* N = insertBST(R, k);                      @@bstIns
    splay(R, N);                                    @@callSplay
}
void splayDelete(Node*& R, int k) {
    if (!R) return;
    search(R, k); // Splay k (or closest node) to root @@bstFind
    if (R->key != k) return;                        @@delCheck
    Node* L = R->left; Node* Right = R->right;      @@delSplit
    delete R;                                       @@delSplit
    if (!L) { R = Right; return; }                  @@delJoin
    // Splay max element in L to root of L, then attach Right
    Node* maxL = L; while (maxL->right) maxL = maxL->right; @@delJoin
    splay(L, maxL);                                 @@delJoin
    L->right = Right; R = L;                        @@delJoin
}`,
    java: `static void splay(SplayTree tree, Node N) {
    while (N.parent != null) {                      @@loop
        Node P = N.parent, Q = P.parent;
        if (Q == null) {                            @@zigCase
            if (N == P.left) tree.rotateRight(P);   @@zig
            else tree.rotateLeft(P);                @@zag
        } else if (N == P.left && P == Q.left) {    @@zigZig
            tree.rotateRight(Q); tree.rotateRight(P); @@zigZig
        } else if (N == P.right && P == Q.right) {  @@zagZag
            tree.rotateLeft(Q); tree.rotateLeft(P); @@zagZag
        } else if (N == P.right && P == Q.left) {   @@zigZag
            tree.rotateLeft(P); tree.rotateRight(Q); @@zigZag
        } else {                                    @@zagZig
            tree.rotateRight(P); tree.rotateLeft(Q); @@zagZig
        }
    }
}
static Node search(SplayTree tree, int k) {
    Node N = tree.findBST(k);                       @@bstFind
    if (N != null) splay(tree, N);                  @@callSplay
    return tree.root;
}
static void insert(SplayTree tree, int k) {
    Node N = tree.insertBST(k);                     @@bstIns
    splay(tree, N);                                 @@callSplay
}
static void delete(SplayTree tree, int k) {
    search(tree, k);                                @@bstFind
    if (tree.root == null || tree.root.key != k) return; @@delCheck
    Node L = tree.root.left, R = tree.root.right;   @@delSplit
    if (L == null) { tree.root = R; return; }       @@delJoin
    Node maxL = L; while (maxL.right != null) maxL = maxL.right; @@delJoin
    splaySubtree(L, maxL); maxL.right = R; tree.root = maxL; @@delJoin
}`,
    python: `def splay(tree, N):
    while N.parent is not None:                     @@loop
        P = N.parent; Q = P.parent
        if Q is None:                               @@zigCase
            if N == P.left: tree.rotate_right(P)    @@zig
            else: tree.rotate_left(P)               @@zag
        elif N == P.left and P == Q.left:           @@zigZig
            tree.rotate_right(Q); tree.rotate_right(P) @@zigZig
        elif N == P.right and P == Q.right:         @@zagZag
            tree.rotate_left(Q); tree.rotate_left(P) @@zagZag
        elif N == P.right and P == Q.left:          @@zigZag
            tree.rotate_left(P); tree.rotate_right(Q) @@zigZag
        else:                                       @@zagZig
            tree.rotate_right(P); tree.rotate_left(Q) @@zagZig

def splay_search(tree, k):
    N = tree.find_bst(k)                            @@bstFind
    if N is not None: splay(tree, N)                @@callSplay
    return tree.root

def splay_insert(tree, k):
    N = tree.insert_bst(k)                          @@bstIns
    splay(tree, N)                                  @@callSplay

def splay_delete(tree, k):
    splay_search(tree, k)                           @@bstFind
    if tree.root is None or tree.root.key != k: return @@delCheck
    L, R = tree.root.left, tree.root.right          @@delSplit
    if L is None: tree.root = R; return             @@delJoin
    max_l = L
    while max_l.right: max_l = max_l.right          @@delJoin
    splay_subtree(L, max_l); max_l.right = R; tree.root = max_l @@delJoin`,
    pseudo: `Algorithm splay(N)
Determine proper case                               @@loop
Apply Zig-Zig, Zig-Zag, or Zig as appropriate:
- P is root:        Zig(N) or Zag(P)                @@zig
- Same direction:   Zig-Zig(N) or Zag-Zag(Q)        @@zigZig
- Opposite dir:     Zig-Zag(N) or Zag-Zig(N)        @@zigZag
if N.parent != NULL then
    splay(N)
End splay

Algorithm search(k, R)
N = Find k in the tree R like in BSTs               @@bstFind
splay(N)                                            @@callSplay
return R

Algorithm insert(k, R)
Insert k into the tree R like in BSTs               @@bstIns
find(k, R) // Splay newly inserted node k to root   @@callSplay

Algorithm delete(k, R)
search(k, R) // Bring k to root                     @@bstFind
if R->key != k then return R                        @@delCheck
Split R into left subtree L and right subtree Right @@delSplit
if L is not empty then
    Splay largest key in L to root of L             @@delJoin
    Attach Right as right child of L                @@delJoin
end`,
  };

  function traceSplay(R, ds, targetKey) {
    while (ds.root && ds.root.key !== targetKey) {
      const path = findPath(ds.root, targetKey);
      const N = path[path.length - 1];
      if (!N || N.key !== targetKey || path.length < 2) break;
      const P = path[path.length - 2];
      const Q = path.length >= 3 ? path[path.length - 3] : null;
      const G = path.length >= 4 ? path[path.length - 4] : null;

      if (!Q) {
        const isLeft = P.left === N;
        R.step({
          line: isLeft ? 'zig' : 'zag',
          msg: 'Cha <code>P = ' + P.key + '</code> là nút gốc → thực hiện phép xoay đơn <b>' + (isLeft ? 'Zig (Rotate Right)' : 'Zag (Rotate Left)') + '</b> đưa <code>N = ' + N.key + '</code> lên gốc.',
          vars: { N: N.key, P: P.key, case: isLeft ? 'Zig' : 'Zag' },
          panels: [{ kind: 'tree', key: 'sp', title: (isLeft ? 'Zig' : 'Zag') + ' tại P = ' + P.key, root: DSA.treeSnapshot(ds.root, { [N.id]: 'pivot', [P.id]: 'swap' }) }],
        });
        ds.root = isLeft ? rotR(P) : rotL(P);
        R.step({
          line: isLeft ? 'zig' : 'zag',
          msg: 'Sau phép xoay <b>' + (isLeft ? 'Zig' : 'Zag') + '</b>: <code>' + N.key + '</code> đã trở thành nút gốc!',
          vars: { root: ds.root.key },
          panels: [{ kind: 'tree', key: 'sp', title: 'Splay hoàn tất: root = ' + ds.root.key, root: DSA.treeSnapshot(ds.root, { [N.id]: 'found' }) }],
        });
      } else if (P.left === N && Q.left === P) {
        R.step({
          line: 'zigZig',
          msg: '<code>N = ' + N.key + '</code> là con trái của <code>P = ' + P.key + '</code>, <code>P</code> là con trái của <code>Q = ' + Q.key + '</code> → <b>Zig-Zig</b>: xoay phải <code>Q (' + Q.key + ')</code> trước rồi xoay phải <code>P (' + P.key + ')</code>.',
          vars: { N: N.key, P: P.key, Q: Q.key, case: 'Zig-Zig' },
          panels: [{ kind: 'tree', key: 'sp', title: 'Zig-Zig(' + N.key + ')', root: DSA.treeSnapshot(ds.root, { [N.id]: 'pivot', [P.id]: 'compare', [Q.id]: 'swap' }) }],
        });
        const step1 = rotR(Q);
        const step2 = rotR(step1);
        replaceChild(G, Q, step2, ds);
        R.step({
          line: 'zigZig',
          msg: 'Sau <b>Zig-Zig</b>: <code>N = ' + N.key + '</code> nhảy lên thay vị trí của <code>Q = ' + Q.key + '</code>.',
          vars: { N: N.key },
          panels: [{ kind: 'tree', key: 'sp', title: 'Sau Zig-Zig', root: DSA.treeSnapshot(ds.root, { [N.id]: 'found' }) }],
        });
      } else if (P.right === N && Q.right === P) {
        R.step({
          line: 'zagZag',
          msg: '<code>N = ' + N.key + '</code> là con phải của <code>P = ' + P.key + '</code>, <code>P</code> là con phải của <code>Q = ' + Q.key + '</code> → <b>Zag-Zag</b>: xoay trái <code>Q (' + Q.key + ')</code> trước rồi xoay trái <code>P (' + P.key + ')</code>.',
          vars: { N: N.key, P: P.key, Q: Q.key, case: 'Zag-Zag' },
          panels: [{ kind: 'tree', key: 'sp', title: 'Zag-Zag(' + N.key + ')', root: DSA.treeSnapshot(ds.root, { [N.id]: 'pivot', [P.id]: 'compare', [Q.id]: 'swap' }) }],
        });
        const step1 = rotL(Q);
        const step2 = rotL(step1);
        replaceChild(G, Q, step2, ds);
        R.step({
          line: 'zagZag',
          msg: 'Sau <b>Zag-Zag</b>: <code>N = ' + N.key + '</code> nhảy lên thay vị trí của <code>Q = ' + Q.key + '</code>.',
          vars: { N: N.key },
          panels: [{ kind: 'tree', key: 'sp', title: 'Sau Zag-Zag', root: DSA.treeSnapshot(ds.root, { [N.id]: 'found' }) }],
        });
      } else if (P.right === N && Q.left === P) {
        R.step({
          line: 'zigZag',
          msg: '<code>N = ' + N.key + '</code> là con phải của <code>P = ' + P.key + '</code>, <code>P</code> là con trái của <code>Q = ' + Q.key + '</code> → <b>Zig-Zag</b>: xoay trái <code>P (' + P.key + ')</code> rồi xoay phải <code>Q (' + Q.key + ')</code>.',
          vars: { N: N.key, P: P.key, Q: Q.key, case: 'Zig-Zag' },
          panels: [{ kind: 'tree', key: 'sp', title: 'Zig-Zag(' + N.key + ')', root: DSA.treeSnapshot(ds.root, { [N.id]: 'pivot', [P.id]: 'compare', [Q.id]: 'swap' }) }],
        });
        Q.left = rotL(P);
        const step2 = rotR(Q);
        replaceChild(G, Q, step2, ds);
        R.step({
          line: 'zigZag',
          msg: 'Sau <b>Zig-Zag</b>: <code>N = ' + N.key + '</code> lên giữa, <code>P = ' + P.key + '</code> làm con trái và <code>Q = ' + Q.key + '</code> làm con phải.',
          vars: { N: N.key },
          panels: [{ kind: 'tree', key: 'sp', title: 'Sau Zig-Zag', root: DSA.treeSnapshot(ds.root, { [N.id]: 'found' }) }],
        });
      } else {
        R.step({
          line: 'zagZig',
          msg: '<code>N = ' + N.key + '</code> là con trái của <code>P = ' + P.key + '</code>, <code>P</code> là con phải của <code>Q = ' + Q.key + '</code> → <b>Zag-Zig</b>: xoay phải <code>P (' + P.key + ')</code> rồi xoay trái <code>Q (' + Q.key + ')</code>.',
          vars: { N: N.key, P: P.key, Q: Q.key, case: 'Zag-Zig' },
          panels: [{ kind: 'tree', key: 'sp', title: 'Zag-Zig(' + N.key + ')', root: DSA.treeSnapshot(ds.root, { [N.id]: 'pivot', [P.id]: 'compare', [Q.id]: 'swap' }) }],
        });
        Q.right = rotR(P);
        const step2 = rotL(Q);
        replaceChild(G, Q, step2, ds);
        R.step({
          line: 'zagZig',
          msg: 'Sau <b>Zag-Zig</b>: <code>N = ' + N.key + '</code> lên giữa, <code>Q = ' + Q.key + '</code> làm con trái và <code>P = ' + P.key + '</code> làm con phải.',
          vars: { N: N.key },
          panels: [{ kind: 'tree', key: 'sp', title: 'Sau Zag-Zig', root: DSA.treeSnapshot(ds.root, { [N.id]: 'found' }) }],
        });
      }
    }
  }

  function buildPlainFromPreorder(arr) {
    let r = null;
    arr.forEach((k) => {
      if (!r) { r = mk(k); return; }
      let cur = r;
      while (true) {
        if (k === cur.key) break;
        if (k < cur.key) { if (!cur.left) { cur.left = mk(k); break; } cur = cur.left; }
        else { if (!cur.right) { cur.right = mk(k); break; } cur = cur.right; }
      }
    });
    return r;
  }

  DSA.register({
    id: 'splay-tree',
    chapter: 'splay',
    name: 'Splay Tree (Zig-Zig, Zig-Zag, Zig)',
    short: 'O(log n) amortized',
    complexity: [
      ['Amortized Search / Insert / Delete', 'O(log₂ n)'],
      ['Worst case 1 thao tác', 'O(n)'],
      ['Ý tưởng chính', 'Đưa nút vừa truy vấn lên làm gốc (Splay)'],
    ],
    description:
      '<p><b>Splay Tree</b> tận dụng tính cục bộ của dữ liệu (những phần tử vừa truy cập có xác suất cao được truy cập lại): sau mỗi thao tác tìm kiếm hoặc chèn nút <code>N</code>, thực hiện <code>splay(N)</code> để đưa <code>N</code> lên làm nút gốc thông qua 3 nhóm phép xoay:</p>' +
      '<ul>' +
      '<li><b>Zig / Zag</b>: khi cha <code>P</code> của <code>N</code> đã là nút gốc (xoay đơn).</li>' +
      '<li><b>Zig-Zig / Zag-Zag</b>: khi <code>N</code> và <code>P</code> nằm <b>cùng phía</b> so với ông <code>Q</code> — <i>chú ý xoay <code>Q</code> trước rồi mới xoay <code>P</code></i> (nhờ vậy giảm một nửa chiều cao đường dẫn!).</li>' +
      '<li><b>Zig-Zag / Zag-Zig</b>: khi <code>N</code> và <code>P</code> nằm <b>khác phía</b> so với <code>Q</code> — xoay <code>P</code> trước rồi xoay <code>Q</code>.</li>' +
      '</ul>',
    notes: [
      'Trên cây mặc định bên dưới: bấm <b>Tìm kiếm 5</b> (sẽ thực hiện Zig-Zig rồi Zig đưa 5 lên gốc), tiếp theo bấm <b>Chèn 15</b> (sẽ thực hiện Zig-Zag đưa 15 lên gốc).',
    ],
    init(ds) {
      ds.root = buildPlainFromPreorder([20, 16, 11, 5, 27, 23]);
    },
    view(ds) {
      return [{ kind: 'tree', key: 'sp', title: 'Splay Tree', root: DSA.treeSnapshot(ds.root) }];
    },
    ops: [
      {
        id: 'search',
        label: 'Tìm kiếm + Splay (search)',
        code: CODE_SPLAY,
        args: [{ id: 'k', label: 'Khóa k', type: 'number', value: 5 }],
        run({ k }, ds) {
          const R = new DSA.Recorder();
          const path = findPath(ds.root, k);
          const hl = {};
          path.forEach((n, i) => {
            hl[n.id] = i === path.length - 1 ? (n.key === k ? 'pivot' : 'compare') : 'visited';
          });
          const last = path[path.length - 1];
          R.step({
            line: 'bstFind',
            msg: last && last.key === k
              ? 'Tìm thấy nút <code>N = ' + k + '</code> theo đường dẫn BST: <code>' + path.map((x) => x.key).join(' → ') + '</code>. Bắt đầu <code>splay(' + k + ')</code>.'
              : 'Không có <code>' + k + '</code>, dừng tại nút cuối <code>' + (last ? last.key : 'NULL') + '</code> và splay nút đó.',
            vars: { target: k, found: !!(last && last.key === k), splayTarget: last ? last.key : 'NULL' },
            panels: [{ kind: 'tree', key: 'sp', title: 'Tìm k = ' + k, root: DSA.treeSnapshot(ds.root, hl) }],
          });
          if (last) traceSplay(R, ds, last.key);
          return R.steps;
        },
      },
      {
        id: 'insert',
        label: 'Chèn + Splay (insert)',
        code: CODE_SPLAY,
        args: [{ id: 'k', label: 'Khóa cần chèn k', type: 'number', value: 15, random: () => DSA.randInt(1, 99) }],
        run({ k }, ds) {
          const R = new DSA.Recorder();
          let N = null;
          if (!ds.root) {
            ds.root = N = mk(k);
          } else {
            let cur = ds.root;
            while (true) {
              if (k === cur.key) { N = cur; break; }
              if (k < cur.key) {
                if (!cur.left) { cur.left = N = mk(k); break; }
                cur = cur.left;
              } else {
                if (!cur.right) { cur.right = N = mk(k); break; }
                cur = cur.right;
              }
            }
          }
          R.step({
            line: 'bstIns',
            msg: 'Bước 1: Chèn <code>' + k + '</code> vào cây như BST thông thường. Bước 2: Gọi <code>splay(' + k + ')</code>.',
            vars: { inserted: k },
            panels: [{ kind: 'tree', key: 'sp', title: 'Đã chèn ' + k + ' ở lá, chuẩn bị Splay', root: DSA.treeSnapshot(ds.root, { [N.id]: 'new' }) }],
          });
          traceSplay(R, ds, k);
          return R.steps;
        },
      },
      {
        id: 'delete',
        label: 'Xóa nút + Splay (delete)',
        code: CODE_SPLAY,
        args: [{ id: 'k', label: 'Khóa cần xóa k', type: 'number', value: 16 }],
        run({ k }, ds) {
          const R = new DSA.Recorder();
          if (!ds.root) return [{ msg: 'Cây đang rỗng.' }];
          const path = findPath(ds.root, k);
          const last = path[path.length - 1];
          R.step({
            line: 'bstFind',
            msg: 'Bước 1: Tìm <code>' + k + '</code> và thực hiện <code>splay</code> đưa nút lên gốc.',
            vars: { target: k, reached: last.key },
            panels: [{ kind: 'tree', key: 'sp', title: 'Tìm ' + k, root: DSA.treeSnapshot(ds.root, { [last.id]: 'pivot' }) }],
          });
          traceSplay(R, ds, last.key);
          if (ds.root.key !== k) {
            R.step({
              line: 'delCheck',
              msg: 'Khóa <code>' + k + '</code> không tồn tại trong cây (nút gần nhất <code>' + ds.root.key + '</code> đã được đưa lên gốc).',
              vars: { deleted: 'none', newRoot: ds.root.key },
              panels: [{ kind: 'tree', key: 'sp', title: 'Không tìm thấy ' + k, root: DSA.treeSnapshot(ds.root, { [ds.root.id]: 'compare' }) }],
            });
            return R.steps;
          }
          const L = ds.root.left;
          const Right = ds.root.right;
          if (!L) {
            ds.root = Right;
            R.step({
              line: 'delJoin',
              msg: 'Đã xóa gốc <code>' + k + '</code> (không có cây con trái → cây con phải lên làm gốc).',
              vars: { deleted: k, newRoot: ds.root ? ds.root.key : 'NULL' },
              panels: [{ kind: 'tree', key: 'sp', title: 'Sau khi xóa ' + k, root: DSA.treeSnapshot(ds.root) }],
            });
            return R.steps;
          }
          ds.root = L;
          let maxL = L;
          while (maxL.right) maxL = maxL.right;
          R.step({
            line: 'delSplit',
            msg: 'Tách gốc <code>' + k + '</code>: splay khóa lớn nhất bên cây con trái (<code>' + maxL.key + '</code>) lên làm gốc mới rồi nối cây con phải vào.',
            vars: { deleted: k, maxLeft: maxL.key },
            panels: [{ kind: 'tree', key: 'sp', title: 'Cây con trái L (splay ' + maxL.key + ')', root: DSA.treeSnapshot(ds.root, { [maxL.id]: 'pivot' }) }],
          });
          traceSplay(R, ds, maxL.key);
          ds.root.right = Right;
          R.step({
            line: 'delJoin',
            msg: 'Gắn cây con phải vào bên phải của gốc mới <code>' + ds.root.key + '</code> → hoàn tất xóa <code>' + k + '</code>!',
            vars: { deleted: k, newRoot: ds.root.key },
            panels: [{ kind: 'tree', key: 'sp', title: 'Splay Tree sau khi xóa ' + k, root: DSA.treeSnapshot(ds.root, { [ds.root.id]: 'found' }) }],
          });
          return R.steps;
        },
      },
      {
        id: 'presets',
        label: 'Nạp cây mẫu / Tùy chỉnh',
        code: CODE_SPLAY,
        args: [
          {
            id: 'p', label: 'Ví dụ', type: 'select', value: 'p89',
            options: [
              { value: 'p89', label: 'Cây mẫu 1: [20, 16, 11, 5, 27, 23] (thử Find 5 rồi Insert 15)' },
              { value: 'p85', label: 'Cây suy biến: [5, 1, 2, 3, 4] (thử Find 4: Zag-Zag + Zig)' },
              { value: 'p86', label: 'Cây mẫu 2: [5, 1, 4, 3, 2] (thử Find 2: Zig-Zig + Zig)' },
              { value: 'p87', label: 'Cây mẫu 3: [4, 1, 3, 2, 5] (thử Find 2: Zag-Zig + Zig)' },
              { value: 'custom', label: 'Dùng dãy khóa tùy chọn nhập ở ô bên cạnh' },
            ],
          },
          { id: 'arr', label: 'Dãy khóa tùy chọn', type: 'array', value: '20 16 11 5 27 23' },
        ],
        run({ p, arr }, ds) {
          const seq = p === 'p85' ? [5, 1, 2, 3, 4]
            : (p === 'p86' ? [5, 1, 4, 3, 2]
              : (p === 'p87' ? [4, 1, 3, 2, 5]
                : (p === 'custom' ? arr : [20, 16, 11, 5, 27, 23])));
          ds.root = buildPlainFromPreorder(seq);
          return [{
            line: 'loop',
            msg: 'Đã nạp cây mẫu từ dãy <code>[' + seq.join(', ') + ']</code>.',
            vars: { keys: seq.join(', '), root: ds.root ? ds.root.key : 'NULL' },
            panels: [{ kind: 'tree', key: 'sp', title: 'Splay Tree', root: DSA.treeSnapshot(ds.root) }],
          }];
        },
      },
    ],
  });
})();
