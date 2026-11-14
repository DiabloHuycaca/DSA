/* =========================================================================
 * DSA Visualizer – avl.js
 * Slide: Advanced_Trees.pdf (trang 1–68)
 * AVL Tree: rotateRight, rotateLeft, AVLInsert, leftBalance, rightBalance,
 * AVLDelete, deleteRightBalance, deleteLeftBalance, AVLSearch.
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  function h(n) { return n ? 1 + Math.max(h(n.left), h(n.right)) : 0; }
  function bf(n) { return n ? h(n.left) - h(n.right) : 0; }
  function bfLabel(n) {
    const b = bf(n);
    if (b === 1) return 'LH (+1)';
    if (b === 0) return 'EH (0)';
    if (b === -1) return 'RH (-1)';
    return (b > 0 ? 'LH (b=' + b + ')' : 'RH (b=' + b + ')');
  }

  function rotRight(root) {
    const temp = root.left;
    root.left = temp.right;
    temp.right = root;
    return temp;
  }
  function rotLeft(root) {
    const temp = root.right;
    root.right = temp.left;
    temp.left = root;
    return temp;
  }

  function insertSilent(root, key) {
    if (!root) return { id: DSA.uid('avl'), key, left: null, right: null };
    if (key < root.key) root.left = insertSilent(root.left, key);
    else if (key > root.key) root.right = insertSilent(root.right, key);
    const b = bf(root);
    if (b > 1) {
      if (bf(root.left) < 0) root.left = rotLeft(root.left);
      return rotRight(root);
    }
    if (b < -1) {
      if (bf(root.right) > 0) root.right = rotRight(root.right);
      return rotLeft(root);
    }
    return root;
  }

  function snapAVL(root, hl) {
    return [{
      kind: 'tree', key: 'avl',
      title: 'AVL Tree (H = ' + h(root) + ' · nhãn: LH = Left Higher, EH = Equal Height, RH = Right Higher)',
      root: DSA.treeSnapshot(root, hl || {}, { badge: (n) => bfLabel(n) }),
    }];
  }

  const CODE_AVL_INS = {
    cpp: `Node* rotateRight(Node* root) {
    Node* tempPtr = root->left;                     @@rotR
    root->left = tempPtr->right;                    @@rotR
    tempPtr->right = root;                          @@rotR
    return tempPtr;
}
Node* rotateLeft(Node* root) {
    Node* tempPtr = root->right;                    @@rotL
    root->right = tempPtr->left;                    @@rotL
    tempPtr->left = root;                           @@rotL
    return tempPtr;
}
Node* leftBalance(Node* root, bool& taller) {
    Node* leftTree = root->left;
    if (leftTree->balance == LH) { // Case 1: Left of Left @@caseLL
        root = rotateRight(root);                   @@rotR
        root->balance = EH; leftTree->balance = EH;
        taller = false;
    } else { // Case 3: Right of Left (Double rotation) @@caseLR
        root->left = rotateLeft(leftTree);          @@rotL
        root = rotateRight(root);                   @@rotR
        taller = false;
    }
    return root;
}
Node* rightBalance(Node* root, bool& taller) {
    Node* rightTree = root->right;
    if (rightTree->balance == RH) { // Case 2: Right of Right @@caseRR
        root = rotateLeft(root);                    @@rotL
        root->balance = EH; rightTree->balance = EH;
        taller = false;
    } else { // Case 4: Left of Right (Double rotation) @@caseRL
        root->right = rotateRight(rightTree);       @@rotR
        root = rotateLeft(root);                    @@rotL
        taller = false;
    }
    return root;
}
Node* AVLInsert(Node* root, Node* newPtr, bool& taller) {
    if (!root) { taller = true; return newPtr; }    @@insLeaf
    if (newPtr->key < root->key) {                  @@goL
        root->left = AVLInsert(root->left, newPtr, taller);
        if (taller) {
            if (root->balance == LH) root = leftBalance(root, taller); @@chkBal
            else if (root->balance == EH) root->balance = LH;          @@chkBal
            else { root->balance = EH; taller = false; }               @@chkBal
        }
    } else {                                        @@goR
        root->right = AVLInsert(root->right, newPtr, taller);
        if (taller) {
            if (root->balance == LH) { root->balance = EH; taller = false; } @@chkBal
            else if (root->balance == EH) root->balance = RH;                @@chkBal
            else root = rightBalance(root, taller);                          @@chkBal
        }
    }
    return root;
}`,
    java: `static Node rotateRight(Node root) {
    Node tempPtr = root.left;                       @@rotR
    root.left = tempPtr.right; tempPtr.right = root; @@rotR
    return tempPtr;
}
static Node rotateLeft(Node root) {
    Node tempPtr = root.right;                      @@rotL
    root.right = tempPtr.left; tempPtr.left = root; @@rotL
    return tempPtr;
}
static Node leftBalance(Node root) {
    if (bf(root.left) >= 0) { // Case 1: Left of Left @@caseLL
        return rotateRight(root);                   @@rotR
    } else { // Case 3: Right of Left               @@caseLR
        root.left = rotateLeft(root.left);          @@rotL
        return rotateRight(root);                   @@rotR
    }
}
static Node rightBalance(Node root) {
    if (bf(root.right) <= 0) { // Case 2: Right of Right @@caseRR
        return rotateLeft(root);                    @@rotL
    } else { // Case 4: Left of Right               @@caseRL
        root.right = rotateRight(root.right);       @@rotR
        return rotateLeft(root);                    @@rotL
    }
}
static Node avlInsert(Node root, int key) {
    if (root == null) return new Node(key);         @@insLeaf
    if (key < root.key) root.left = avlInsert(root.left, key);   @@goL
    else if (key > root.key) root.right = avlInsert(root.right, key); @@goR
    int b = bf(root);                               @@chkBal
    if (b > 1) return leftBalance(root);            @@chkBal
    if (b < -1) return rightBalance(root);          @@chkBal
    return root;
}`,
    python: `def rotate_right(root):
    temp_ptr = root.left                            @@rotR
    root.left = temp_ptr.right                      @@rotR
    temp_ptr.right = root                           @@rotR
    return temp_ptr

def rotate_left(root):
    temp_ptr = root.right                           @@rotL
    root.right = temp_ptr.left                      @@rotL
    temp_ptr.left = root                            @@rotL
    return temp_ptr

def left_balance(root):
    if bf(root.left) >= 0:                          @@caseLL
        return rotate_right(root)                   @@rotR
    else:                                           @@caseLR
        root.left = rotate_left(root.left)          @@rotL
        return rotate_right(root)                   @@rotR

def right_balance(root):
    if bf(root.right) <= 0:                         @@caseRR
        return rotate_left(root)                    @@rotL
    else:                                           @@caseRL
        root.right = rotate_right(root.right)       @@rotR
        return rotate_left(root)                    @@rotL

def avl_insert(root, key):
    if root is None: return Node(key)               @@insLeaf
    if key < root.key:                              @@goL
        root.left = avl_insert(root.left, key)
    elif key > root.key:                            @@goR
        root.right = avl_insert(root.right, key)
    b = bf(root)                                    @@chkBal
    if b > 1: return left_balance(root)             @@chkBal
    if b < -1: return right_balance(root)           @@chkBal
    return root`,
    pseudo: `Algorithm AVLInsert(ref root <pointer>, val newPtr <pointer>, ref taller <boolean>)
if root null then root = newPtr; taller = true; return root @@insLeaf
if newPtr->data.key < root->data.key then           @@goL
    root->left = AVLInsert(root->left, newPtr, taller)
    if taller then
        if root is LH then root = leftBalance(root, taller) @@chkBal
        else if root is EH then root->balance = LH
        else root->balance = EH; taller = false end
    end
else                                                @@goR
    root->right = AVLInsert(root->right, newPtr, taller)
    if taller then
        if root is LH then root->balance = EH; taller = false
        else if root is EH then root->balance = RH
        else root = rightBalance(root, taller) end  @@chkBal
    end
end
return root
End AVLInsert

Algorithm leftBalance(ref root <pointer>, ref taller <boolean>)
leftTree = root->left
if leftTree is LH then // Case 1: Left of Left      @@caseLL
    root = rotateRight(root)                        @@rotR
    root->balance = EH; leftTree->balance = EH; taller = false
else // Case 2: Right of Left (Double rotation)     @@caseLR
    rightTree = leftTree->right
    // Update balance factors of root, leftTree, rightTree
    root->left = rotateLeft(leftTree)               @@rotL
    root = rotateRight(root)                        @@rotR
    taller = false
end
return root
End leftBalance

Algorithm rightBalance(ref root <pointer>, ref taller <boolean>)
rightTree = root->right
if rightTree is RH then // Case 1: Right of Right   @@caseRR
    root = rotateLeft(root)                         @@rotL
    root->balance = EH; rightTree->balance = EH; taller = false
else // Case 2: Left of Right (Double rotation)     @@caseRL
    leftTree = rightTree->left
    // Update balance factors of root, rightTree, leftTree
    root->right = rotateRight(rightTree)            @@rotR
    root = rotateLeft(root)                         @@rotL
    taller = false
end
return root
End rightBalance`,
  };

  const CODE_AVL_DEL = {
    cpp: `Node* deleteRightBalance(Node* root, bool& shorter) {
    if (root->balance == LH) { root->balance = EH; return root; } @@delRBal
    if (root->balance == EH) { root->balance = RH; shorter = false; return root; } @@delRBal
    Node* rightTree = root->right;                  @@delRBal
    if (rightTree->balance == LH) {                 @@caseRL
        root->right = rotateRight(rightTree);       @@rotR
        root = rotateLeft(root);                    @@rotL
    } else {                                        @@caseRR
        if (rightTree->balance == EH) shorter = false;
        root = rotateLeft(root);                    @@rotL
    }
    return root;
}
Node* deleteLeftBalance(Node* root, bool& shorter) {
    if (root->balance == RH) { root->balance = EH; return root; } @@delLBal
    if (root->balance == EH) { root->balance = LH; shorter = false; return root; } @@delLBal
    Node* leftTree = root->left;                    @@delLBal
    if (leftTree->balance == RH) {                  @@caseLR
        root->left = rotateLeft(leftTree);          @@rotL
        root = rotateRight(root);                   @@rotR
    } else {                                        @@caseLL
        if (leftTree->balance == EH) shorter = false;
        root = rotateRight(root);                   @@rotR
    }
    return root;
}
Node* AVLDelete(Node* root, int deleteKey, bool& shorter, bool& success) {
    if (!root) { shorter = false; success = false; return nullptr; } @@nullCheck
    if (deleteKey < root->key) {                    @@goL
        root->left = AVLDelete(root->left, deleteKey, shorter, success);
        if (shorter) root = deleteRightBalance(root, shorter); @@delRBal
    } else if (deleteKey > root->key) {             @@goR
        root->right = AVLDelete(root->right, deleteKey, shorter, success);
        if (shorter) root = deleteLeftBalance(root, shorter);  @@delLBal
    } else {
        if (!root->right) { shorter = true; success = true; return root->left; }  @@oneChild
        if (!root->left)  { shorter = true; success = true; return root->right; } @@oneChild
        Node* exchPtr = root->left;                 @@findPred
        while (exchPtr->right) exchPtr = exchPtr->right; @@findPred
        root->key = exchPtr->key;                   @@copyPred
        root->left = AVLDelete(root->left, exchPtr->key, shorter, success);
        if (shorter) root = deleteRightBalance(root, shorter); @@delRBal
    }
    return root;
}`,
    java: `static Node rebalanceAfterDelete(Node root) {
    int b = bf(root);
    if (b > 1) { // deleteLeftBalance               @@delLBal
        if (bf(root.left) < 0) {                    @@caseLR
            root.left = rotateLeft(root.left);      @@rotL
        }
        return rotateRight(root);                   @@rotR
    }
    if (b < -1) { // deleteRightBalance             @@delRBal
        if (bf(root.right) > 0) {                   @@caseRL
            root.right = rotateRight(root.right);   @@rotR
        }
        return rotateLeft(root);                    @@rotL
    }
    return root;
}
static Node avlDelete(Node root, int deleteKey) {
    if (root == null) return null;                  @@nullCheck
    if (deleteKey < root.key) {                     @@goL
        root.left = avlDelete(root.left, deleteKey);
    } else if (deleteKey > root.key) {              @@goR
        root.right = avlDelete(root.right, deleteKey);
    } else {
        if (root.right == null) return root.left;   @@oneChild
        if (root.left == null) return root.right;   @@oneChild
        Node exchPtr = root.left;                   @@findPred
        while (exchPtr.right != null) exchPtr = exchPtr.right; @@findPred
        root.key = exchPtr.key;                     @@copyPred
        root.left = avlDelete(root.left, exchPtr.key);
    }
    return rebalanceAfterDelete(root);              @@delRBal
}`,
    python: `def rebalance_delete(root):
    b = bf(root)
    if b > 1:                                       @@delLBal
        if bf(root.left) < 0:                       @@caseLR
            root.left = rotate_left(root.left)      @@rotL
        return rotate_right(root)                   @@rotR
    if b < -1:                                      @@delRBal
        if bf(root.right) > 0:                      @@caseRL
            root.right = rotate_right(root.right)   @@rotR
        return rotate_left(root)                    @@rotL
    return root

def avl_delete(root, delete_key):
    if root is None: return None                    @@nullCheck
    if delete_key < root.key:                       @@goL
        root.left = avl_delete(root.left, delete_key)
    elif delete_key > root.key:                     @@goR
        root.right = avl_delete(root.right, delete_key)
    else:
        if root.right is None: return root.left     @@oneChild
        if root.left is None: return root.right     @@oneChild
        exch_ptr = root.left                        @@findPred
        while exch_ptr.right: exch_ptr = exch_ptr.right @@findPred
        root.key = exch_ptr.key                     @@copyPred
        root.left = avl_delete(root.left, exch_ptr.key)
    return rebalance_delete(root)                   @@delRBal`,
    pseudo: `Algorithm AVLDelete(ref root <pointer>, val deleteKey <key>, ref shorter <boolean>, ref success <boolean>)
if tree null then shorter = false; success = false; return null @@nullCheck
if deleteKey < root->data.key then                  @@goL
    root->left = AVLDelete(root->left, deleteKey, shorter, success)
    if shorter then root = deleteRightBalance(root, shorter) end @@delRBal
else if deleteKey > root->data.key then             @@goR
    root->right = AVLDelete(root->right, deleteKey, shorter, success)
    if shorter then root = deleteLeftBalance(root, shorter) end  @@delLBal
else
    if no right subtree then shorter = true; return root->left   @@oneChild
    else if no left subtree then shorter = true; return root->right @@oneChild
    else
        exchPtr = root->left                        @@findPred
        while exchPtr->right not null do exchPtr = exchPtr->right end @@findPred
        root->data = exchPtr->data                  @@copyPred
        root->left = AVLDelete(root->left, exchPtr->data.key, shorter, success)
        if shorter then root = deleteRightBalance(root, shorter) end @@delRBal
    end
end
return root
End AVLDelete

Algorithm deleteRightBalance(ref root <pointer>, ref shorter <boolean>)
// Subtree is shorter after deletion on left branch
if root is LH then root->balance = EH               @@delRBal
else if root is EH then root->balance = RH; shorter = false @@delRBal
else
    rightTree = root->right
    if rightTree is LH then // Double rotation      @@caseRL
        root->right = rotateRight(rightTree)        @@rotR
        root = rotateLeft(root)                     @@rotL
    else // Single rotation left                    @@caseRR
        if rightTree is EH then shorter = false end
        root = rotateLeft(root)                     @@rotL
    end
end
return root
End deleteRightBalance

Algorithm deleteLeftBalance(ref root <pointer>, ref shorter <boolean>)
// Subtree is shorter after deletion on right branch
if root is RH then root->balance = EH               @@delLBal
else if root is EH then root->balance = LH; shorter = false @@delLBal
else
    leftTree = root->left
    if leftTree is RH then // Double rotation       @@caseLR
        root->left = rotateLeft(leftTree)           @@rotL
        root = rotateRight(root)                    @@rotR
    else // Single rotation right                   @@caseLL
        if leftTree is EH then shorter = false end
        root = rotateRight(root)                    @@rotR
    end
end
return root
End deleteLeftBalance`,
  };

  const CODE_AVL_SEARCH = {
    cpp: `Node* AVLSearch(Node* root, int target) {
    if (!root) return nullptr;                      @@nullCheck
    if (target < root->key)                         @@goL
        return AVLSearch(root->left, target);       @@goL
    if (target > root->key)                         @@goR
        return AVLSearch(root->right, target);      @@goR
    return root;                                    @@found
}`,
    java: `static Node avlSearch(Node root, int target) {
    if (root == null) return null;                  @@nullCheck
    if (target < root.key) return avlSearch(root.left, target);  @@goL
    if (target > root.key) return avlSearch(root.right, target); @@goR
    return root;                                    @@found
}`,
    python: `def avl_search(root, target):
    if root is None: return None                    @@nullCheck
    if target < root.key:                           @@goL
        return avl_search(root.left, target)        @@goL
    if target > root.key:                           @@goR
        return avl_search(root.right, target)       @@goR
    return root                                     @@found`,
    pseudo: `Algorithm AVLSearch(val root <pointer>, val target <key>)
// Guaranteed O(log2 n) height because |H_L - H_R| <= 1
if root is null then return null                    @@nullCheck
if target < root->data.key then                     @@goL
    return AVLSearch(root->left, target)            @@goL
else if target > root->data.key then                @@goR
    return AVLSearch(root->right, target)           @@goR
else
    return root                                     @@found
end
End AVLSearch`,
  };

  function rebalanceWithSteps(R, getRoot, node, setChild) {
    const b = bf(node);
    if (b > 1) {
      if (bf(node.left) >= 0) {
        R.step({
          line: 'caseLL',
          msg: 'Mất cân bằng tại nút <code>' + node.key + '</code> (<code>b = +' + b + '</code>, con trái <code>' + node.left.key + '</code> lệch trái – <b>Case 1: Left of Left</b>) ⇒ <code>rotateRight(' + node.key + ')</code>.',
          vars: { unbalanced: node.key, case: 'Left of Left (LL)', action: 'rotateRight(' + node.key + ')' },
          panels: snapAVL(getRoot(), { [node.id]: 'swap', [node.left.id]: 'pivot' }),
        });
        const nr = rotRight(node);
        setChild(nr);
        R.step({
          line: 'rotR',
          msg: 'Sau <code>rotateRight</code>: nút <code>' + nr.key + '</code> lên làm gốc nhánh, cây cân bằng trở lại.',
          vars: { newSubtreeRoot: nr.key },
          panels: snapAVL(getRoot(), { [nr.id]: 'found' }),
        });
        return nr;
      } else {
        const lNode = node.left, lrNode = lNode.right;
        R.step({
          line: 'caseLR',
          msg: 'Mất cân bằng tại nút <code>' + node.key + '</code> (<code>b = +' + b + '</code>, con trái <code>' + lNode.key + '</code> lệch phải – <b>Case 3: Right of Left</b>) ⇒ xoay kép: <code>rotateLeft(' + lNode.key + ')</code> rồi <code>rotateRight(' + node.key + ')</code>.',
          vars: { unbalanced: node.key, case: 'Right of Left (LR)', step1: 'rotateLeft(' + lNode.key + ')', step2: 'rotateRight(' + node.key + ')' },
          panels: snapAVL(getRoot(), { [node.id]: 'swap', [lNode.id]: 'compare', [lrNode.id]: 'pivot' }),
        });
        node.left = rotLeft(lNode);
        R.step({
          line: 'rotL',
          msg: 'Bước 1 của LR: sau <code>rotateLeft(' + lNode.key + ')</code>.',
          vars: { rotatedLeft: lNode.key },
          panels: snapAVL(getRoot(), { [node.id]: 'swap', [node.left.id]: 'pivot' }),
        });
        const nr = rotRight(node);
        setChild(nr);
        R.step({
          line: 'rotR',
          msg: 'Bước 2 của LR: sau <code>rotateRight(' + node.key + ')</code> → nút <code>' + nr.key + '</code> lên làm gốc nhánh.',
          vars: { newSubtreeRoot: nr.key },
          panels: snapAVL(getRoot(), { [nr.id]: 'found' }),
        });
        return nr;
      }
    }
    if (b < -1) {
      if (bf(node.right) <= 0) {
        R.step({
          line: 'caseRR',
          msg: 'Mất cân bằng tại nút <code>' + node.key + '</code> (<code>b = ' + b + '</code>, con phải <code>' + node.right.key + '</code> lệch phải – <b>Case 2: Right of Right</b>) ⇒ <code>rotateLeft(' + node.key + ')</code>.',
          vars: { unbalanced: node.key, case: 'Right of Right (RR)', action: 'rotateLeft(' + node.key + ')' },
          panels: snapAVL(getRoot(), { [node.id]: 'swap', [node.right.id]: 'pivot' }),
        });
        const nr = rotLeft(node);
        setChild(nr);
        R.step({
          line: 'rotL',
          msg: 'Sau <code>rotateLeft</code>: nút <code>' + nr.key + '</code> lên làm gốc nhánh, cây cân bằng trở lại.',
          vars: { newSubtreeRoot: nr.key },
          panels: snapAVL(getRoot(), { [nr.id]: 'found' }),
        });
        return nr;
      } else {
        const rNode = node.right, rlNode = rNode.left;
        R.step({
          line: 'caseRL',
          msg: 'Mất cân bằng tại nút <code>' + node.key + '</code> (<code>b = ' + b + '</code>, con phải <code>' + rNode.key + '</code> lệch trái – <b>Case 4: Left of Right</b>) ⇒ xoay kép: <code>rotateRight(' + rNode.key + ')</code> rồi <code>rotateLeft(' + node.key + ')</code>.',
          vars: { unbalanced: node.key, case: 'Left of Right (RL)', step1: 'rotateRight(' + rNode.key + ')', step2: 'rotateLeft(' + node.key + ')' },
          panels: snapAVL(getRoot(), { [node.id]: 'swap', [rNode.id]: 'compare', [rlNode.id]: 'pivot' }),
        });
        node.right = rotRight(rNode);
        R.step({
          line: 'rotR',
          msg: 'Bước 1 của RL: sau <code>rotateRight(' + rNode.key + ')</code>.',
          vars: { rotatedRight: rNode.key },
          panels: snapAVL(getRoot(), { [node.id]: 'swap', [node.right.id]: 'pivot' }),
        });
        const nr = rotLeft(node);
        setChild(nr);
        R.step({
          line: 'rotL',
          msg: 'Bước 2 của RL: sau <code>rotateLeft(' + node.key + ')</code> → nút <code>' + nr.key + '</code> lên làm gốc nhánh.',
          vars: { newSubtreeRoot: nr.key },
          panels: snapAVL(getRoot(), { [nr.id]: 'found' }),
        });
        return nr;
      }
    }
    return node;
  }

  DSA.register({
    id: 'avl-tree',
    chapter: 'avl',
    name: 'Cây AVL (Adelson-Velskii & Landis)',
    short: 'O(log n)',
    complexity: [
      ['Search / Insert / Delete', 'O(log₂ n)'],
      ['Balance Factor', 'LH (+1), EH (0), RH (−1)'],
      ['4 trường hợp xoay', 'LL (Right), RR (Left), LR (Left-Right), RL (Right-Left)'],
    ],
    description:
      '<p><b>Cây AVL</b> (1962) là cây tìm kiếm nhị phân tự cân bằng trong đó độ cao của cây con trái và cây con phải của mọi nút chênh lệch nhau <b>không quá 1</b>:</p>' +
      '<ul>' +
      '<li><code>left_higher (LH)</code>: <code>H<sub>L</sub> = H<sub>R</sub> + 1</code>; <code>equal_height (EH)</code>: <code>H<sub>L</sub> = H<sub>R</sub></code>; <code>right_higher (RH)</code>: <code>H<sub>R</sub> = H<sub>L</sub> + 1</code>.</li>' +
      '<li><b>Case 1 – Left of Left (LL)</b>: xoay đơn phải (<code>rotateRight</code>).</li>' +
      '<li><b>Case 2 – Right of Right (RR)</b>: xoay đơn trái (<code>rotateLeft</code>).</li>' +
      '<li><b>Case 3 – Right of Left (LR)</b>: xoay trái cây con trái rồi xoay phải nút gốc.</li>' +
      '<li><b>Case 4 – Left of Right (RL)</b>: xoay phải cây con phải rồi xoay trái nút gốc.</li>' +
      '</ul>',
    notes: [
      'Trên cây mặc định bên dưới: thử bấm <b>Thêm 23</b> (gây mất cân bằng LL tại 29 → xoay phải tại 29) rồi <b>Thêm 55</b> (mất cân bằng RL tại 65 → xoay kép).',
    ],
    init(ds) {
      ds.root = null;
      [41, 20, 65, 11, 29, 50, 26].forEach((k) => { ds.root = insertSilent(ds.root, k); });
    },
    view(ds) { return snapAVL(ds.root); },
    ops: [
      {
        id: 'insert',
        label: 'Thêm nút (AVLInsert)',
        code: CODE_AVL_INS,
        args: [{ id: 'k', label: 'Khóa cần thêm', type: 'number', value: 23, random: () => DSA.randInt(1, 99) }],
        run({ k }, ds) {
          const R = new DSA.Recorder();
          const newNode = { id: DSA.uid('avl'), key: k, left: null, right: null };

          function ins(node, setParentLink) {
            if (!node) {
              setParentLink(newNode);
              R.step({
                line: 'insLeaf',
                msg: 'Chèn nút mới <code>' + k + '</code> tại vị trí lá, đặt <code>taller = true</code>.',
                vars: { inserted: k, taller: true },
                panels: snapAVL(ds.root, { [newNode.id]: 'new' }),
              });
              return newNode;
            }
            if (k === node.key) {
              R.step({ line: 'insLeaf', msg: 'Khóa <code>' + k + '</code> đã tồn tại trong cây.', vars: { key: k }, panels: snapAVL(ds.root, { [node.id]: 'found' }) });
              return node;
            }
            const goL = k < node.key;
            R.step({
              line: goL ? 'goL' : 'goR',
              msg: 'Tại nút <code>' + node.key + '</code>: <code>' + k + (goL ? ' &lt; ' : ' &gt; ') + node.key + '</code> → đi xuống nhánh ' + (goL ? 'trái' : 'phải') + '.',
              vars: { current: node.key, key: k },
              panels: snapAVL(ds.root, { [node.id]: 'active' }),
            });
            if (goL) ins(node.left, (c) => { node.left = c; });
            else ins(node.right, (c) => { node.right = c; });

            const b = bf(node);
            R.step({
              line: 'chkBal',
              msg: 'Quay lui về nút <code>' + node.key + '</code>: kiểm tra hệ số cân bằng <code>B = H_L − H_R = ' + b + '</code> (' + bfLabel(node) + ').',
              vars: { node: node.key, balanceFactor: b },
              panels: snapAVL(ds.root, { [node.id]: Math.abs(b) > 1 ? 'swap' : 'visited' }),
            });
            return rebalanceWithSteps(R, () => ds.root, node, setParentLink);
          }

          ins(ds.root, (c) => { ds.root = c; });
          return R.steps;
        },
      },
      {
        id: 'delete',
        label: 'Xóa nút (AVLDelete)',
        code: CODE_AVL_DEL,
        args: [{ id: 'k', label: 'Khóa cần xóa', type: 'number', value: 50, random: () => DSA.randInt(10, 70) }],
        run({ k }, ds) {
          const R = new DSA.Recorder();

          function del(node, key, setParentLink) {
            if (!node) {
              R.step({ line: 'nullCheck', msg: 'Không tìm thấy khóa <code>' + key + '</code>.', vars: { deleteKey: key }, panels: snapAVL(ds.root) });
              return null;
            }
            if (key < node.key) {
              R.step({ line: 'goL', msg: '<code>' + key + ' &lt; ' + node.key + '</code> → tìm xóa bên nhánh trái.', vars: { current: node.key, deleteKey: key }, panels: snapAVL(ds.root, { [node.id]: 'active' }) });
              del(node.left, key, (c) => { node.left = c; });
            } else if (key > node.key) {
              R.step({ line: 'goR', msg: '<code>' + key + ' &gt; ' + node.key + '</code> → tìm xóa bên nhánh phải.', vars: { current: node.key, deleteKey: key }, panels: snapAVL(ds.root, { [node.id]: 'active' }) });
              del(node.right, key, (c) => { node.right = c; });
            } else {
              if (!node.left || !node.right) {
                const child = node.left || node.right;
                setParentLink(child);
                R.step({ line: 'oneChild', msg: 'Xóa nút <code>' + node.key + '</code> và nối con lên cha (<code>shorter = true</code>).', vars: { deleted: node.key, shorter: true }, panels: snapAVL(ds.root, child ? { [child.id]: 'found' } : {}) });
                return child;
              }
              let exch = node.left;
              while (exch.right) exch = exch.right;
              R.step({ line: 'findPred', msg: 'Nút <code>' + node.key + '</code> có 2 con → tìm nút lớn nhất cây con trái <code>exchPtr = ' + exch.key + '</code>.', vars: { deleteNode: node.key, exchPtr: exch.key }, panels: snapAVL(ds.root, { [node.id]: 'swap', [exch.id]: 'pivot' }) });
              node.key = exch.key;
              R.step({ line: 'copyPred', msg: 'Thay khóa nút thành <code>' + exch.key + '</code> rồi xóa đệ quy <code>' + exch.key + '</code> ở cây con trái.', vars: { newKey: node.key }, panels: snapAVL(ds.root, { [node.id]: 'found' }) });
              del(node.left, exch.key, (c) => { node.left = c; });
            }
            const b = bf(node);
            R.step({
              line: b < 0 ? 'delRBal' : 'delLBal',
              msg: 'Kiểm tra cân bằng tại nút <code>' + node.key + '</code> sau khi xóa: <code>B = ' + b + '</code> (' + bfLabel(node) + ').',
              vars: { node: node.key, balanceFactor: b },
              panels: snapAVL(ds.root, { [node.id]: Math.abs(b) > 1 ? 'swap' : 'visited' }),
            });
            if (Math.abs(b) > 1) {
              return rebalanceWithSteps(R, () => ds.root, node, setParentLink);
            }
            return node;
          }

          del(ds.root, k, (c) => { ds.root = c; });
          R.step({ line: 'delRBal', msg: 'Cây AVL sau khi xóa <code>' + k + '</code>.', vars: { deleted: k }, panels: snapAVL(ds.root) });
          return R.steps;
        },
      },
      {
        id: 'search',
        label: 'Tìm kiếm (AVLSearch)',
        code: CODE_AVL_SEARCH,
        args: [{ id: 'k', label: 'Khóa target', type: 'number', value: 26, random: () => DSA.randInt(10, 70) }],
        run({ k }, ds) {
          const R = new DSA.Recorder();
          let cur = ds.root;
          const visited = {};
          let steps = 0;
          while (cur) {
            steps++;
            if (k === cur.key) {
              R.step({
                line: 'found',
                msg: 'Tìm thấy <code>target = ' + k + '</code> sau ' + steps + ' bước so sánh (chiều cao AVL <code>H = ' + h(ds.root) + '</code>)!',
                vars: { target: k, comparisons: steps, found: true },
                panels: snapAVL(ds.root, Object.assign({}, visited, { [cur.id]: 'found' })),
              });
              return R.steps;
            }
            visited[cur.id] = 'visited';
            const goL = k < cur.key;
            R.step({
              line: goL ? 'goL' : 'goR',
              msg: 'Tại nút <code>' + cur.key + '</code>: <code>' + k + (goL ? ' &lt; ' : ' &gt; ') + cur.key + '</code> → rẽ sang nhánh ' + (goL ? 'trái' : 'phải') + '.',
              vars: { target: k, current: cur.key, comparisons: steps },
              panels: snapAVL(ds.root, Object.assign({}, visited, { [cur.id]: 'compare' })),
            });
            cur = goL ? cur.left : cur.right;
          }
          R.step({ line: 'nullCheck', msg: 'Gặp nhánh NULL → không tìm thấy <code>' + k + '</code> trong cây AVL.', vars: { target: k, comparisons: steps, found: false }, panels: snapAVL(ds.root, visited) });
          return R.steps;
        },
      },
      {
        id: 'presets',
        label: 'Dựng cây AVL / Cây mẫu',
        code: CODE_AVL_INS,
        args: [
          {
            id: 'preset', label: 'Chế độ dựng cây', type: 'select', value: 'ins',
            options: [
              { value: 'ins', label: 'Mẫu AVL Insert: [41, 20, 65, 11, 29, 50, 26] (thử thêm 23, 55)' },
              { value: 'del', label: 'Mẫu AVL Delete: [50, 40, 60, 30, 45, 55, 10] (thử xóa 50)' },
              { value: 'seq', label: 'Chèn dãy tăng dần [10, 20, 30, 40, 50, 60, 70]' },
              { value: 'custom', label: 'Dùng dãy khóa tùy chọn nhập ở ô bên cạnh' },
            ],
          },
          { id: 'arr', label: 'Dãy khóa tùy chọn', type: 'array', value: '41 20 65 11 29 50 26 23 55' },
        ],
        run({ preset, arr }, ds) {
          const R = new DSA.Recorder();
          const seq = preset === 'del' ? [50, 40, 60, 30, 45, 55, 10]
            : (preset === 'seq' ? [10, 20, 30, 40, 50, 60, 70]
              : (preset === 'custom' ? arr : [41, 20, 65, 11, 29, 50, 26]));
          ds.root = null;
          seq.forEach((k, idx) => {
            ds.root = insertSilent(ds.root, k);
            R.step({
              line: 'insLeaf',
              msg: 'Bước ' + (idx + 1) + '/' + seq.length + ': chèn <code>' + k + '</code> và tự động cân bằng AVL.',
              vars: { inserted: k, height: h(ds.root) },
              panels: snapAVL(ds.root),
            });
          });
          return R.steps;
        },
      },
    ],
  });
})();
