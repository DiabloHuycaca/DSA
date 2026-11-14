/* =========================================================================
 * DSA Visualizer – btree.js
 * Slide: Advanced_Trees.pdf (trang 104–134)
 * Multiway Search Trees & B-Trees (order m):
 * 1. BTreeInsert (insertNode, searchNode, splitNode, insertEntry – p.115–122)
 * 2. BTreeDelete (Predecessor replacement & Reflow: Balance / Combine – p.123–129)
 * 3. BTreeSearch (p.132–133)
 * 4. BTreeTraversal (Inorder scanCount traversal – p.130–131)
 * 5. Build B-Tree from custom sequence / Slide presets
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  function mkBNode(keys, children) {
    return { id: DSA.uid('bt'), keys: keys || [], children: children || [] };
  }
  function isLeaf(n) { return !n.children || n.children.length === 0; }

  function collectKeysInorder(n, out) {
    if (!n) return out;
    for (let i = 0; i < n.keys.length; i++) {
      if (n.children && n.children[i]) collectKeysInorder(n.children[i], out);
      out.push(n.keys[i]);
    }
    if (n.children && n.children[n.keys.length]) collectKeysInorder(n.children[n.keys.length], out);
    return out;
  }

  function snapBTree(root, m, hlMap, keyHlMap, extraPanels, note) {
    hlMap = hlMap || {};
    keyHlMap = keyHlMap || {};
    function cp(n) {
      if (!n) return null;
      return {
        id: n.id,
        keys: n.keys.slice(),
        hl: hlMap[n.id] || '',
        keyHl: keyHlMap[n.id] || {},
        children: (n.children || []).map(cp),
      };
    }
    const minEntries = Math.ceil(m / 2) - 1;
    return [
      {
        kind: 'tree', key: 'bt', mode: 'multi',
        title: `B-Tree bậc m = ${m} (số khóa mỗi nút khác gốc: tối thiểu ⌈m/2⌉−1 = ${minEntries}, tối đa m−1 = ${m - 1})`,
        root: cp(root),
        note,
      },
      ...(extraPanels || []),
    ];
  }

  /** Silent insert for initial tree building */
  function insertBTreeSilent(root, k, m) {
    const maxKeys = m - 1;
    function ins(node) {
      let i = 0;
      while (i < node.keys.length && k >= node.keys[i]) {
        if (k === node.keys[i]) return null; // no duplicates
        i++;
      }
      if (isLeaf(node)) {
        node.keys.splice(i, 0, k);
      } else {
        const up = ins(node.children[i]);
        if (up) {
          node.keys.splice(i, 0, up.key);
          node.children.splice(i + 1, 0, up.right);
        }
      }
      if (node.keys.length > maxKeys) {
        const mid = Math.floor(node.keys.length / 2);
        const upKey = node.keys[mid];
        const right = mkBNode(
          node.keys.slice(mid + 1),
          isLeaf(node) ? [] : node.children.slice(mid + 1)
        );
        node.keys = node.keys.slice(0, mid);
        if (!isLeaf(node)) node.children = node.children.slice(0, mid + 1);
        return { key: upKey, right };
      }
      return null;
    }
    if (!root) return mkBNode([k], []);
    const up = ins(root);
    if (up) return mkBNode([up.key], [root, up.right]);
    return root;
  }

  /** Shared Bậc m selector used across all B-Tree operations */
  function makeOrderMArg() {
    return {
      id: 'm',
      label: 'Bậc m (Order)',
      type: 'select',
      value: (ds) => ds.m || 4,
      options: [
        { value: 3, label: 'm = 3 (2-3 Tree: min 1, max 2 khóa/nút)' },
        { value: 4, label: 'm = 4 (2-3-4 Tree: min 1, max 3 khóa/nút)' },
        { value: 5, label: 'm = 5 (Bậc 5: min 2, max 4 khóa/nút)' },
        { value: 6, label: 'm = 6 (Bậc 6: min 2, max 5 khóa/nút)' },
      ],
      onChange(v, ds) {
        const nm = Number(v) || 4;
        if (nm !== ds.m) {
          ds.m = nm;
          const keys = collectKeysInorder(ds.root, []);
          ds.root = null;
          keys.forEach((x) => { ds.root = insertBTreeSilent(ds.root, x, ds.m); });
        }
      },
    };
  }

  /* ---------------------------------------------------------------------
   * Code Definitions (All 4 languages: C++, Java, Python, Slide Pseudocode)
   * ------------------------------------------------------------------- */
  const CODE_BTREE_INS = {
    cpp: `struct Entry { int key; BNode* rightPtr; };
int searchNode(BNode* nodePtr, int target) {
    if (target < nodePtr->entries[1].key) return 0; @@searchNode
    int walker = nodePtr->numEntries;               @@searchNode
    while (target < nodePtr->entries[walker].key)   @@searchNode
        walker = walker - 1;                        @@searchNode
    return walker;                                  @@searchNode
}
void insertEntry(BNode* node, int entryNdx, Entry newEntry) {
    int shifter = node->numEntries + 1;             @@insEntry
    while (shifter > entryNdx + 1) {                @@insEntry
        node->entries[shifter] = node->entries[shifter - 1]; @@insEntry
        shifter = shifter - 1;                      @@insEntry
    }
    node->entries[shifter] = newEntry;              @@insEntry
    node->numEntries = node->numEntries + 1;        @@insEntry
}
void splitNode(BNode* node, int entryNdx, Entry& upEntry) {
    int minEntries = (M + 1) / 2 - 1;               @@split
    BNode* rightPtr = new BNode();                  @@split
    // Move upper half of entries to rightPtr & insert upEntry
    int medianNdx = minEntries + 1;                 @@split
    upEntry = node->entries[medianNdx];             @@split
    rightPtr->firstPtr = upEntry.rightPtr;          @@split
    upEntry.rightPtr = rightPtr;                    @@split
}
bool insertNode(BNode* root, int key, Entry& upEntry) {
    if (!root) { upEntry = {key, nullptr}; return true; } @@leafReached
    int ndx = searchNode(root, key);                @@searchNode
    BNode* sub = (ndx > 0) ? root->entries[ndx].rightPtr : root->firstPtr;
    bool taller = insertNode(sub, key, upEntry);    @@recIns
    if (taller) {
        if (root->numEntries == M - 1) {            @@checkFull
            splitNode(root, ndx, upEntry);          @@split
            taller = true;
        } else {
            insertEntry(root, ndx, upEntry);        @@insEntry
            taller = false;
        }
    }
    return taller;
}
BNode* BTreeInsert(BNode* root, int data) {
    Entry upEntry;
    bool taller = insertNode(root, data, upEntry);  @@callIns
    if (taller) { // Tree has grown -> create new root @@newRoot
        BNode* newPtr = new BNode();                @@newRoot
        newPtr->entries[1] = upEntry;               @@newRoot
        newPtr->firstPtr = root;                    @@newRoot
        newPtr->numEntries = 1;                     @@newRoot
        root = newPtr;                              @@newRoot
    }
    return root;
}`,
    java: `static int searchNode(BNode node, int target) {
    int i = 0;                                      @@searchNode
    while (i < node.keys.size() && target >= node.keys.get(i)) i++; @@searchNode
    return i;                                       @@searchNode
}
static UpEntry splitNode(BNode node, int m) {
    int mid = node.keys.size() / 2;                 @@split
    int upKey = node.keys.get(mid);                 @@split
    BNode right = new BNode();                      @@split
    right.keys.addAll(node.keys.subList(mid + 1, node.keys.size())); @@split
    if (!node.isLeaf()) right.children.addAll(node.children.subList(mid + 1, node.children.size()));
    node.keys.subList(mid, node.keys.size()).clear();
    if (!node.isLeaf()) node.children.subList(mid + 1, node.children.size()).clear();
    return new UpEntry(upKey, right);               @@split
}
static UpEntry insertNode(BNode root, int key, int m) {
    int i = searchNode(root, key);                  @@searchNode
    if (root.isLeaf()) {
        root.keys.add(i, key);                      @@insEntry
    } else {
        UpEntry up = insertNode(root.children.get(i), key, m); @@recIns
        if (up != null) {
            root.keys.add(i, up.key);               @@insEntry
            root.children.add(i + 1, up.right);     @@insEntry
        }
    }
    if (root.keys.size() > m - 1) return splitNode(root, m); @@split
    return null;
}
static BNode bTreeInsert(BNode root, int key, int m) {
    if (root == null) return new BNode(key);        @@newRoot
    UpEntry up = insertNode(root, key, m);          @@callIns
    if (up != null) {                               @@newRoot
        BNode nr = new BNode();                     @@newRoot
        nr.keys.add(up.key); nr.children.add(root); nr.children.add(up.right); @@newRoot
        return nr;
    }
    return root;
}`,
    python: `def search_node(node, target):
    i = 0                                           @@searchNode
    while i < len(node.keys) and target >= node.keys[i]: @@searchNode
        i += 1                                      @@searchNode
    return i                                        @@searchNode

def split_node(node):
    mid = len(node.keys) // 2                       @@split
    up_key = node.keys[mid]                         @@split
    right = BNode(node.keys[mid + 1:], node.children[mid + 1:] if node.children else []) @@split
    node.keys = node.keys[:mid]                     @@split
    if node.children: node.children = node.children[:mid + 1]
    return up_key, right                            @@split

def insert_node(node, key, m):
    i = search_node(node, key)                      @@searchNode
    if not node.children:
        node.keys.insert(i, key)                    @@insEntry
    else:
        up = insert_node(node.children[i], key, m)  @@recIns
        if up is not None:
            up_key, right = up
            node.keys.insert(i, up_key)             @@insEntry
            node.children.insert(i + 1, right)      @@insEntry
    if len(node.keys) > m - 1:                      @@checkFull
        return split_node(node)                     @@split
    return None

def btree_insert(root, key, m):
    if root is None: return BNode([key], [])        @@newRoot
    up = insert_node(root, key, m)                  @@callIns
    if up is not None:                              @@newRoot
        return BNode([up[0]], [root, up[1]])        @@newRoot
    return root`,
    pseudo: `Algorithm BTreeInsert(ref root <pointer>, val data <record>)
taller = insertNode(root, data, upEntry)            @@callIns
if taller then // Tree has grown. Create new root.
    allocate(newPtr)                                @@newRoot
    newPtr->entries[1] = upEntry                    @@newRoot
    newPtr->firstPtr = root; newPtr->numEntries = 1 @@newRoot
    root = newPtr                                   @@newRoot
end
return root
End BTreeInsert

Algorithm insertNode(ref root <pointer>, val data <record>, ref upEntry <entry>)
if root null then
    upEntry.data = data; upEntry.rightPtr = null; return true @@leafReached
end
entryNdx = searchNode(root, data.key)               @@searchNode
subTree = (entryNdx > 0) ? root->entries[entryNdx].rightPtr : root->firstPtr
taller = insertNode(subTree, data, upEntry)         @@recIns
if taller then
    if node full then
        splitNode(root, entryNdx, upEntry); taller = true @@split
    else
        insertEntry(root, entryNdx, upEntry); taller = false @@insEntry
        root->numEntries = root->numEntries + 1
    end
end
return taller
End insertNode

Algorithm searchNode(val nodePtr <pointer>, val target <key>)
if target < nodePtr->entry[1].data.key then walker = 0 @@searchNode
else
    walker = nodePtr->numEntries                    @@searchNode
    while target < nodePtr->entries[walker].data.key do
        walker = walker - 1                         @@searchNode
    end
end
return walker
End searchNode

Algorithm splitNode(val node <pointer>, val entryNdx <index>, ref upEntry <entry>)
minEntries = ceil(m / 2) - 1; allocate(rightPtr)    @@split
// Move entries > medianNdx to rightPtr and insert upEntry
medianNdx = minEntries + 1                          @@split
upEntry.data = node->entries[medianNdx].data        @@split
upEntry.rightPtr = rightPtr                         @@split
rightPtr->firstPtr = node->entries[medianNdx].rightPtr @@split
End splitNode`,
  };

  const CODE_BTREE_DEL = {
    cpp: `// B-Tree Deletion & Reflow
void reflow(BNode* parent, int idx, int m) {
    int minKeys = (m + 1) / 2 - 1;                  @@checkUnder
    BNode* ch = parent->children[idx];
    if ((int)ch->keys.size() >= minKeys) return;    @@checkUnder
    // Case 1: Balance (borrow from left sibling through parent)
    if (idx > 0 && (int)parent->children[idx - 1]->keys.size() > minKeys) { @@balanceL
        BNode* leftSib = parent->children[idx - 1]; @@balanceL
        ch->keys.insert(ch->keys.begin(), parent->keys[idx - 1]); @@balanceL
        parent->keys[idx - 1] = leftSib->keys.back(); @@balanceL
        leftSib->keys.pop_back();                   @@balanceL
        if (!leftSib->isLeaf()) {
            ch->children.insert(ch->children.begin(), leftSib->children.back());
            leftSib->children.pop_back();
        }
        return;
    }
    // Case 2: Balance (borrow from right sibling through parent)
    if (idx + 1 < (int)parent->children.size() &&
        (int)parent->children[idx + 1]->keys.size() > minKeys) { @@balanceR
        BNode* rightSib = parent->children[idx + 1]; @@balanceR
        ch->keys.push_back(parent->keys[idx]);      @@balanceR
        parent->keys[idx] = rightSib->keys.front(); @@balanceR
        rightSib->keys.erase(rightSib->keys.begin()); @@balanceR
        if (!rightSib->isLeaf()) {
            ch->children.push_back(rightSib->children.front());
            rightSib->children.erase(rightSib->children.begin());
        }
        return;
    }
    // Case 3: Combine (merge left node + parent separator + right node)
    int mergeIdx = (idx > 0) ? idx - 1 : idx;       @@combine
    BNode* leftNode = parent->children[mergeIdx];   @@combine
    BNode* rightNode = parent->children[mergeIdx + 1]; @@combine
    int sep = parent->keys[mergeIdx];               @@combine
    parent->keys.erase(parent->keys.begin() + mergeIdx); @@combine
    leftNode->keys.push_back(sep);                  @@combine
    leftNode->keys.insert(leftNode->keys.end(), rightNode->keys.begin(), rightNode->keys.end()); @@combine
    if (!leftNode->isLeaf())
        leftNode->children.insert(leftNode->children.end(), rightNode->children.begin(), rightNode->children.end());
    parent->children.erase(parent->children.begin() + mergeIdx + 1); @@combine
}
void deleteNode(BNode* node, int dltKey, int m) {
    if (!node) return;
    int idx = findKeyIndex(node, dltKey);           @@searchDel
    if (idx >= 0 && node->keys[idx] == dltKey) {
        if (node->isLeaf()) {                       @@delLeaf
            node->keys.erase(node->keys.begin() + idx); @@delLeaf
        } else { // Internal node: replace by largest entry on left subtree
            BNode* cur = node->children[idx];       @@pred
            while (!cur->isLeaf()) cur = cur->children.back(); @@pred
            int predKey = cur->keys.back();         @@pred
            node->keys[idx] = predKey;              @@pred
            deleteNode(node->children[idx], predKey, m); @@pred
            reflow(node, idx, m);                   @@checkUnder
        }
        return;
    }
    if (node->isLeaf()) return; // Not found        @@notFound
    int cIdx = 0;
    while (cIdx < (int)node->keys.size() && dltKey > node->keys[cIdx]) cIdx++; @@searchDel
    deleteNode(node->children[cIdx], dltKey, m);    @@searchDel
    reflow(node, cIdx, m);                          @@checkUnder
}
BNode* BTreeDelete(BNode* root, int dltKey, int m) {
    deleteNode(root, dltKey, m);
    if (root && root->keys.empty() && !root->children.empty())
        root = root->children[0]; // Tree height decreases by 1 @@shrinkRoot
    return root;
}`,
    java: `static void reflow(BNode parent, int idx, int m) {
    int minKeys = (m + 1) / 2 - 1;                  @@checkUnder
    BNode ch = parent.children.get(idx);
    if (ch.keys.size() >= minKeys) return;          @@checkUnder
    // 1. Balance from left sibling
    if (idx > 0 && parent.children.get(idx - 1).keys.size() > minKeys) { @@balanceL
        BNode leftSib = parent.children.get(idx - 1); @@balanceL
        ch.keys.add(0, parent.keys.get(idx - 1));   @@balanceL
        parent.keys.set(idx - 1, leftSib.keys.remove(leftSib.keys.size() - 1)); @@balanceL
        if (!leftSib.isLeaf()) ch.children.add(0, leftSib.children.remove(leftSib.children.size() - 1));
        return;
    }
    // 2. Balance from right sibling
    if (idx + 1 < parent.children.size() && parent.children.get(idx + 1).keys.size() > minKeys) { @@balanceR
        BNode rightSib = parent.children.get(idx + 1); @@balanceR
        ch.keys.add(parent.keys.get(idx));          @@balanceR
        parent.keys.set(idx, rightSib.keys.remove(0)); @@balanceR
        if (!rightSib.isLeaf()) ch.children.add(rightSib.children.remove(0));
        return;
    }
    // 3. Combine (merge) with sibling and parent separator
    int mIdx = (idx > 0) ? idx - 1 : idx;           @@combine
    BNode left = parent.children.get(mIdx);         @@combine
    BNode right = parent.children.remove(mIdx + 1); @@combine
    int sep = parent.keys.remove(mIdx);             @@combine
    left.keys.add(sep); left.keys.addAll(right.keys); @@combine
    if (!left.isLeaf()) left.children.addAll(right.children);
}
static void deleteNode(BNode node, int key, int m) {
    int idx = node.keys.indexOf(key);               @@searchDel
    if (idx >= 0) {
        if (node.isLeaf()) {
            node.keys.remove(idx);                  @@delLeaf
        } else {
            BNode cur = node.children.get(idx);     @@pred
            while (!cur.isLeaf()) cur = cur.children.get(cur.children.size() - 1); @@pred
            int pred = cur.keys.get(cur.keys.size() - 1); @@pred
            node.keys.set(idx, pred);               @@pred
            deleteNode(node.children.get(idx), pred, m); @@pred
            reflow(node, idx, m);                   @@checkUnder
        }
        return;
    }
    if (node.isLeaf()) return;                      @@notFound
    int cIdx = 0;
    while (cIdx < node.keys.size() && key > node.keys.get(cIdx)) cIdx++; @@searchDel
    deleteNode(node.children.get(cIdx), key, m);    @@searchDel
    reflow(node, cIdx, m);                          @@checkUnder
}
static BNode bTreeDelete(BNode root, int key, int m) {
    if (root == null) return null;
    deleteNode(root, key, m);
    if (root.keys.isEmpty() && !root.children.isEmpty())
        root = root.children.get(0);                @@shrinkRoot
    return root;
}`,
    python: `def reflow(parent, idx, m):
    min_keys = (m + 1) // 2 - 1                     @@checkUnder
    ch = parent.children[idx]
    if len(ch.keys) >= min_keys: return             @@checkUnder
    # 1. Balance (borrow from left sibling)
    if idx > 0 and len(parent.children[idx - 1].keys) > min_keys: @@balanceL
        left_sib = parent.children[idx - 1]         @@balanceL
        ch.keys.insert(0, parent.keys[idx - 1])     @@balanceL
        parent.keys[idx - 1] = left_sib.keys.pop()  @@balanceL
        if left_sib.children: ch.children.insert(0, left_sib.children.pop())
        return
    # 2. Balance (borrow from right sibling)
    if idx + 1 < len(parent.children) and len(parent.children[idx + 1].keys) > min_keys: @@balanceR
        right_sib = parent.children[idx + 1]        @@balanceR
        ch.keys.append(parent.keys[idx])            @@balanceR
        parent.keys[idx] = right_sib.keys.pop(0)    @@balanceR
        if right_sib.children: ch.children.append(right_sib.children.pop(0))
        return
    # 3. Combine (merge left + parent separator + right)
    m_idx = idx - 1 if idx > 0 else idx             @@combine
    left_node = parent.children[m_idx]              @@combine
    right_node = parent.children.pop(m_idx + 1)     @@combine
    sep = parent.keys.pop(m_idx)                    @@combine
    left_node.keys.extend([sep] + right_node.keys)  @@combine
    if left_node.children: left_node.children.extend(right_node.children)

def delete_node(node, key, m):
    if key in node.keys:                            @@searchDel
        idx = node.keys.index(key)
        if not node.children:
            node.keys.pop(idx)                      @@delLeaf
        else:
            cur = node.children[idx]                @@pred
            while cur.children: cur = cur.children[-1] @@pred
            pred = cur.keys[-1]                     @@pred
            node.keys[idx] = pred                   @@pred
            delete_node(node.children[idx], pred, m) @@pred
            reflow(node, idx, m)                    @@checkUnder
        return
    if not node.children: return                    @@notFound
    c_idx = 0
    while c_idx < len(node.keys) and key > node.keys[c_idx]: c_idx += 1 @@searchDel
    delete_node(node.children[c_idx], key, m)       @@searchDel
    reflow(node, c_idx, m)                          @@checkUnder

def btree_delete(root, key, m):
    if root is None: return None
    delete_node(root, key, m)
    if not root.keys and root.children:
        root = root.children[0]                     @@shrinkRoot
    return root`,
    pseudo: `Algorithm BTreeDelete(ref root <pointer>, val deleteKey <key>)
// Deletion & Reflow (Balance / Combine)
underflow = delete(root, deleteKey)
if underflow AND root->numEntries = 0 then          @@shrinkRoot
    newRoot = root->firstPtr; recycle(root)         @@shrinkRoot
    root = newRoot // Tree height decreases by 1    @@shrinkRoot
end
return root
End BTreeDelete

Algorithm delete(ref root <pointer>, val deleteKey <key>)
entryNdx = searchNode(root, deleteKey)              @@searchDel
if found in current node then
    if root is a leaf node then
        deleteEntry(root, entryNdx)                 @@delLeaf
    else // Replace by largest entry on left subtree (predecessor)
        deleteMid(root, entryNdx, leftSubTree)      @@pred
        if underflow then reflow(root, entryNdx)    @@checkUnder
    end
else
    if root is a leaf then return false // not found @@notFound
    underflow = delete(subTree, deleteKey)          @@searchDel
    if underflow then reflow(root, entryNdx) end    @@checkUnder
end
return (root->numEntries < minEntries)              @@checkUnder
End delete

Algorithm reflow(ref root <pointer>, val entryNdx <index>)
if left sibling has > minEntries keys then
    balanceLeft(root, entryNdx)  // Rotate right through parent @@balanceL
else if right sibling has > minEntries keys then
    balanceRight(root, entryNdx) // Rotate left through parent  @@balanceR
else
    combine(root, entryNdx)      // Join left, parent sep, right @@combine
end
End reflow`,
  };

  const CODE_BTREE_SEARCH = {
    cpp: `bool BTreeSearch(BNode* root, int target, BNode*& outNode, int& entryNo) {
    if (!root) { outNode = nullptr; entryNo = 0; return false; } @@nullCheck
    if (target < root->entries[1].key)              @@goFirst
        return BTreeSearch(root->firstPtr, target, outNode, entryNo); @@goFirst
    entryNo = root->numEntries;                     @@scanBack
    while (target < root->entries[entryNo].key)     @@scanBack
        entryNo = entryNo - 1;                      @@scanBack
    if (target == root->entries[entryNo].key) {     @@found
        outNode = root; return true;                @@found
    }
    return BTreeSearch(root->entries[entryNo].rightPtr, target, outNode, entryNo); @@goChild
}`,
    java: `static SearchResult bTreeSearch(BNode root, int target) {
    if (root == null) return new SearchResult(null, 0, false); @@nullCheck
    if (target < root.keys.get(0))                  @@goFirst
        return bTreeSearch(root.isLeaf() ? null : root.children.get(0), target); @@goFirst
    int entryNo = root.keys.size() - 1;             @@scanBack
    while (entryNo >= 0 && target < root.keys.get(entryNo)) @@scanBack
        entryNo--;                                  @@scanBack
    if (target == root.keys.get(entryNo))           @@found
        return new SearchResult(root, entryNo + 1, true); @@found
    BNode next = root.isLeaf() ? null : root.children.get(entryNo + 1);
    return bTreeSearch(next, target);               @@goChild
}`,
    python: `def btree_search(root, target):
    if root is None:                                @@nullCheck
        return None, 0, False                       @@nullCheck
    if target < root.keys[0]:                       @@goFirst
        nxt = root.children[0] if root.children else None
        return btree_search(nxt, target)            @@goFirst
    entry_no = len(root.keys) - 1                   @@scanBack
    while entry_no >= 0 and target < root.keys[entry_no]: @@scanBack
        entry_no -= 1                               @@scanBack
    if target == root.keys[entry_no]:               @@found
        return root, entry_no + 1, True             @@found
    nxt = root.children[entry_no + 1] if root.children else None
    return btree_search(nxt, target)                @@goChild`,
    pseudo: `Algorithm BTreeSearch(val root <pointer>, val target <key>, ref node <pointer>, ref entryNo <index>)
if root is null then
    node = null; entryNo = 0; return false          @@nullCheck
end
if target < first entry then
    return BTreeSearch(root->firstPtr, target, node, entryNo) @@goFirst
else
    entryNo = root->numEntries                      @@scanBack
    while target < root->entries[entryNo].data.key do
        entryNo = entryNo - 1                       @@scanBack
    end
    if target = root->entries[entryNo].data.key then
        found = true; node = root                   @@found
    else
        return BTreeSearch(root->entries[entryNo].rightPtr, target, node, entryNo) @@goChild
    end
end
return found
End BTreeSearch`,
  };

  const CODE_BTREE_TRAV = {
    cpp: `void BTreeTraversal(BNode* root) {
    if (!root) return;
    int scanCount = 0;                              @@initScan
    BNode* ptr = root->firstPtr;                    @@initScan
    while (scanCount <= root->numEntries) {         @@loopScan
        if (ptr != nullptr)                         @@recSub
            BTreeTraversal(ptr);                    @@recSub
        scanCount = scanCount + 1;                  @@incScan
        if (scanCount <= root->numEntries) {        @@chkProc
            process(root->entries[scanCount].data); @@procEntry
            ptr = root->entries[scanCount].rightPtr; @@nextPtr
        }
    }
}`,
    java: `static void bTreeTraversal(BNode root, List<Integer> out) {
    if (root == null) return;
    int scanCount = 0;                              @@initScan
    BNode ptr = root.isLeaf() ? null : root.children.get(0); @@initScan
    while (scanCount <= root.keys.size()) {         @@loopScan
        if (ptr != null) bTreeTraversal(ptr, out);  @@recSub
        scanCount = scanCount + 1;                  @@incScan
        if (scanCount <= root.keys.size()) {        @@chkProc
            out.add(root.keys.get(scanCount - 1));  @@procEntry
            ptr = root.isLeaf() ? null : root.children.get(scanCount); @@nextPtr
        }
    }
}`,
    python: `def btree_traversal(root, out):
    if root is None: return
    scan_count = 0                                  @@initScan
    ptr = root.children[0] if root.children else None @@initScan
    while scan_count <= len(root.keys):             @@loopScan
        if ptr is not None:                         @@recSub
            btree_traversal(ptr, out)               @@recSub
        scan_count += 1                             @@incScan
        if scan_count <= len(root.keys):            @@chkProc
            out.append(root.keys[scan_count - 1])   @@procEntry
            ptr = root.children[scan_count] if root.children else None @@nextPtr`,
    pseudo: `Algorithm BTreeTraversal(val root <pointer>)
// Processes B-Tree using inorder traversal
scanCount = 0                                       @@initScan
ptr = root->firstPtr                                @@initScan
while scanCount <= root->numEntries do              @@loopScan
    if ptr not null then
        BTreeTraversal(ptr)                         @@recSub
    end
    scanCount = scanCount + 1                       @@incScan
    if scanCount <= root->numEntries then           @@chkProc
        process(root->entries[scanCount].data)      @@procEntry
        ptr = root->entries[scanCount].rightPtr     @@nextPtr
    end
end
return
End BTreeTraversal`,
  };

  DSA.register({
    id: 'btree',
    chapter: 'btree',
    name: 'M-Way Search Tree & B-Tree',
    short: 'O(log_m n)',
    complexity: [
      ['Search / Insert / Delete', 'O(log_m n)'],
      ['Số khóa mỗi nút (khác gốc)', '[⌈m/2⌉ − 1 .. m − 1]'],
      ['Số cây con mỗi nút nội', '[⌈m/2⌉ .. m]'],
      ['Độ sâu các nút lá', 'Bằng nhau (cùng mức)'],
    ],
    description:
      '<p><b>B-Tree</b> (Bayer &amp; McCreight, 1970) là cây tìm kiếm <code>m</code>-nhánh (<code>m ≥ 3</code>) tự cân bằng lý tưởng cho bộ nhớ ngoài:</p>' +
      '<ul>' +
      '<li>Mỗi nút chứa tối đa <code>m − 1</code> khóa được sắp tăng dần và tối đa <code>m</code> con trỏ cây con.</li>' +
      '<li>Nút gốc hoặc là lá hoặc có ít nhất <code>2</code> cây con; mọi nút khác có ít nhất <code>⌈m/2⌉ − 1</code> khóa; <b>mọi nút lá đều ở cùng một mức</b>.</li>' +
      '<li><b>Chèn (Insert)</b>: luôn chèn vào nút lá; nếu nút bị tràn (<code>m</code> khóa) thì <code>splitNode</code> tách làm đôi và đẩy khóa trung vị (median) <code>upEntry</code> lên nút cha.</li>' +
      '<li><b>Xóa (Delete &amp; Reflow)</b>: nếu khóa ở nút nội thì thay bằng khóa lớn nhất của cây con trái (predecessor); nếu nút sau khi xóa bị thiếu khóa (underflow <code>&lt; ⌈m/2⌉ − 1</code>) thì thực hiện <b>Reflow</b>: <code>Balance</code> (mượn khóa từ anh em kề qua nút cha) hoặc <code>Combine</code> (gộp với anh em và kéo khóa phân cách từ cha xuống).</li>' +
      '<li><b>Biến thể</b>: <b>B*Tree</b> (mỗi nút đầy ít nhất <code>2/3</code>) và <b>B+Tree</b> (mọi khóa đều có mặt ở mức lá và các lá nối nhau thành danh sách liên kết).</li>' +
      '</ul>',
    notes: [
      'Bạn có thể đổi <b>Bậc m (Order m = 3, 4, 5, 6)</b> ngay trên mọi tab (Insert, Delete, Search, Traversal, Build). Cây sẽ tự động cập nhật theo bậc <code>m</code> đã chọn.',
      'Để quan sát đủ 3 trường hợp khi xóa (<b>Xóa tại nút nội → Predecessor</b>, <b>Reflow – Balance</b> và <b>Reflow – Combine</b>): trên cây mặc định <code>m = 4</code>, thử xóa <code>40</code> (Combine), hoặc chọn tab <b>Dựng B-Tree / Cây mẫu</b> để nạp cây mẫu <code>m = 5</code>.',
    ],
    init(ds) {
      ds.m = 4;
      ds.root = null;
      [10, 20, 30, 40, 50, 60, 70, 80, 90].forEach((k) => {
        ds.root = insertBTreeSilent(ds.root, k, ds.m);
      });
    },
    view(ds) {
      return snapBTree(ds.root, ds.m);
    },
    ops: [
      {
        id: 'insert',
        label: 'Chèn khóa (BTreeInsert)',
        code: CODE_BTREE_INS,
        args: [
          { id: 'k', label: 'Khóa cần chèn', type: 'number', value: 45, random: () => DSA.randInt(1, 99) },
          makeOrderMArg(),
        ],
        run({ k, m }, ds) {
          ds.m = Number(m) || ds.m;
          const maxKeys = ds.m - 1;
          const R = new DSA.Recorder();

          if (!ds.root) {
            ds.root = mkBNode([k], []);
            R.step({ line: 'newRoot', msg: 'Cây rỗng → tạo nút gốc chứa khóa <code>' + k + '</code>.', vars: { key: k, m: ds.m }, panels: snapBTree(ds.root, ds.m, { [ds.root.id]: 'found' }) });
            return R.steps;
          }

          function ins(node) {
            let i = 0;
            while (i < node.keys.length && k >= node.keys[i]) {
              if (k === node.keys[i]) {
                R.step({ line: 'searchNode', msg: 'Khóa <code>' + k + '</code> đã có sẵn trong nút.', vars: { key: k, m: ds.m }, panels: snapBTree(ds.root, ds.m, { [node.id]: 'found' }, { [node.id]: { [i]: 'found' } }) });
                return null;
              }
              i++;
            }
            R.step({
              line: 'searchNode',
              msg: 'Tại nút <code>[' + node.keys.join(' | ') + ']</code>: <code>searchNode</code> trả về <code>entryNdx = ' + i + '</code>.',
              vars: { key: k, m: ds.m, nodeKeys: node.keys.join(','), entryNdx: i },
              panels: snapBTree(ds.root, ds.m, { [node.id]: 'active' }),
            });

            if (isLeaf(node)) {
              node.keys.splice(i, 0, k);
              R.step({
                line: 'insEntry',
                msg: '<code>insertEntry</code>: chèn khóa <code>' + k + '</code> vào nút lá → <code>[' + node.keys.join(' | ') + ']</code>.',
                vars: { key: k, m: ds.m, leafKeys: node.keys.join(','), maxEntries: maxKeys },
                panels: snapBTree(ds.root, ds.m, { [node.id]: node.keys.length > maxKeys ? 'swap' : 'found' }, { [node.id]: { [i]: 'new' } }),
              });
            } else {
              const up = ins(node.children[i]);
              if (up) {
                node.keys.splice(i, 0, up.key);
                node.children.splice(i + 1, 0, up.right);
                R.step({
                  line: 'insEntry',
                  msg: '<code>insertEntry</code>: chèn <code>upEntry = ' + up.key + '</code> từ con đẩy lên vào nút cha → <code>[' + node.keys.join(' | ') + ']</code>.',
                  vars: { upEntry: up.key, m: ds.m, parentKeys: node.keys.join(',') },
                  panels: snapBTree(ds.root, ds.m, { [node.id]: node.keys.length > maxKeys ? 'swap' : 'found' }, { [node.id]: { [i]: 'pivot' } }),
                });
              }
            }

            if (node.keys.length > maxKeys) {
              const mid = Math.floor(node.keys.length / 2);
              const upKey = node.keys[mid];
              R.step({
                line: 'split',
                msg: 'Nút bị tràn (<code>' + node.keys.length + ' &gt; ' + maxKeys + '</code> khóa) → <code>splitNode</code>: tách tại khóa trung vị <b>median = ' + upKey + '</b>.',
                vars: { overflowNode: node.keys.join(','), medianKey: upKey, m: ds.m },
                panels: snapBTree(ds.root, ds.m, { [node.id]: 'swap' }, { [node.id]: { [mid]: 'pivot' } }),
              });
              const right = mkBNode(
                node.keys.slice(mid + 1),
                isLeaf(node) ? [] : node.children.slice(mid + 1)
              );
              node.keys = node.keys.slice(0, mid);
              if (!isLeaf(node)) node.children = node.children.slice(0, mid + 1);
              return { key: upKey, right };
            }
            return null;
          }

          const up = ins(ds.root);
          if (up) {
            ds.root = mkBNode([up.key], [ds.root, up.right]);
            R.step({
              line: 'newRoot',
              msg: 'Nút gốc bị tách → tạo nút gốc mới chứa <code>upEntry = ' + up.key + '</code> (chiều cao B-Tree tăng thêm 1).',
              vars: { newRootKey: up.key, m: ds.m },
              panels: snapBTree(ds.root, ds.m, { [ds.root.id]: 'found' }),
            });
          }
          return R.steps;
        },
      },
      {
        id: 'delete',
        label: 'Xóa khóa (BTreeDelete: Balance / Combine)',
        code: CODE_BTREE_DEL,
        args: [
          { id: 'k', label: 'Khóa cần xóa', type: 'number', value: 40, random: (ds) => { const ks = collectKeysInorder(ds.root, []); return ks.length ? ks[DSA.randInt(0, ks.length - 1)] : 40; } },
          makeOrderMArg(),
        ],
        run({ k, m }, ds) {
          ds.m = Number(m) || ds.m;
          const R = new DSA.Recorder();
          const minKeys = Math.ceil(ds.m / 2) - 1;

          if (!ds.root) {
            R.step({ line: 'notFound', msg: 'B-Tree đang rỗng.', vars: { m: ds.m }, panels: snapBTree(ds.root, ds.m) });
            return R.steps;
          }

          function fixChild(parent, i) {
            const ch = parent.children[i];
            R.step({
              line: 'checkUnder',
              msg: 'Kiểm tra số khóa tại nút con <code>[' + ch.keys.join(' | ') + ']</code>: có <code>' + ch.keys.length + '</code> khóa (tối thiểu <code>minEntries = ⌈' + ds.m + '/2⌉ − 1 = ' + minKeys + '</code>).',
              vars: { childKeys: ch.keys.join(',') || 'rỗng', count: ch.keys.length, minEntries: minKeys, underflow: ch.keys.length < minKeys },
              panels: snapBTree(ds.root, ds.m, { [ch.id]: ch.keys.length < minKeys ? 'swap' : 'visited', [parent.id]: 'active' }),
            });
            if (ch.keys.length >= minKeys) return;

            // Try borrow from left sibling
            if (i > 0 && parent.children[i - 1].keys.length > minKeys) {
              const leftSib = parent.children[i - 1];
              const downKey = parent.keys[i - 1];
              const upKey = leftSib.keys.pop();
              ch.keys.unshift(downKey);
              parent.keys[i - 1] = upKey;
              if (!isLeaf(leftSib)) ch.children.unshift(leftSib.children.pop());
              R.step({
                line: 'balanceL',
                msg: '<b>Reflow – Balance (mượn từ anh em trái)</b>: hạ khóa <code>' + downKey + '</code> từ cha xuống nút thiếu và đẩy khóa lớn nhất của anh em trái <code>' + upKey + '</code> lên cha.',
                vars: { action: 'balanceLeft', borrowedUp: upKey, movedDown: downKey, minEntries: minKeys },
                panels: snapBTree(ds.root, ds.m, { [ch.id]: 'found', [leftSib.id]: 'compare', [parent.id]: 'active' }),
              });
              return;
            }
            // Try borrow from right sibling
            if (i + 1 < parent.children.length && parent.children[i + 1].keys.length > minKeys) {
              const rightSib = parent.children[i + 1];
              const downKey = parent.keys[i];
              const upKey = rightSib.keys.shift();
              ch.keys.push(downKey);
              parent.keys[i] = upKey;
              if (!isLeaf(rightSib)) ch.children.push(rightSib.children.shift());
              R.step({
                line: 'balanceR',
                msg: '<b>Reflow – Balance (mượn từ anh em phải)</b>: hạ khóa <code>' + downKey + '</code> từ cha xuống nút thiếu và đẩy khóa nhỏ nhất của anh em phải <code>' + upKey + '</code> lên cha.',
                vars: { action: 'balanceRight', borrowedUp: upKey, movedDown: downKey, minEntries: minKeys },
                panels: snapBTree(ds.root, ds.m, { [ch.id]: 'found', [rightSib.id]: 'compare', [parent.id]: 'active' }),
              });
              return;
            }
            // Combine (merge)
            const mergeIdx = i > 0 ? i - 1 : i;
            const leftNode = parent.children[mergeIdx];
            const rightNode = parent.children[mergeIdx + 1];
            const sep = parent.keys.splice(mergeIdx, 1)[0];
            leftNode.keys.push(sep, ...rightNode.keys);
            if (!isLeaf(leftNode)) leftNode.children.push(...rightNode.children);
            parent.children.splice(mergeIdx + 1, 1);
            R.step({
              line: 'combine',
              msg: '<b>Reflow – Combine (gộp nút)</b>: anh em đều chỉ có tối thiểu <code>' + minKeys + '</code> khóa → hạ khóa phân cách <code>' + sep + '</code> từ cha xuống và gộp 2 nút con thành <code>[' + leftNode.keys.join(' | ') + ']</code>.',
              vars: { action: 'combine', separator: sep, mergedKeys: leftNode.keys.join(',') },
              panels: snapBTree(ds.root, ds.m, { [leftNode.id]: 'found', [parent.id]: 'active' }),
            });
          }

          function del(node, target) {
            if (!node) return;
            const idx = node.keys.indexOf(target);
            R.step({
              line: 'searchDel',
              msg: 'Tìm khóa cần xóa <code>' + target + '</code> tại nút <code>[' + node.keys.join(' | ') + ']</code>.',
              vars: { target, nodeKeys: node.keys.join(','), m: ds.m, minEntries: minKeys },
              panels: snapBTree(ds.root, ds.m, { [node.id]: 'active' }, idx >= 0 ? { [node.id]: { [idx]: 'swap' } } : {}),
            });
            if (idx >= 0) {
              if (isLeaf(node)) {
                node.keys.splice(idx, 1);
                R.step({
                  line: 'delLeaf',
                  msg: 'Xóa trực tiếp khóa <code>' + target + '</code> tại nút lá → còn <code>[' + node.keys.join(' | ') + ']</code>.',
                  vars: { deleted: target, remainingInLeaf: node.keys.join(',') || 'rỗng' },
                  panels: snapBTree(ds.root, ds.m, { [node.id]: 'swap' }),
                });
              } else {
                // Find largest on left subtree
                let cur = node.children[idx];
                while (!isLeaf(cur)) cur = cur.children[cur.children.length - 1];
                const pred = cur.keys[cur.keys.length - 1];
                node.keys[idx] = pred;
                R.step({
                  line: 'pred',
                  msg: 'Khóa <code>' + target + '</code> nằm ở nút nội → thay bằng khóa lớn nhất trên cây con trái (<b>predecessor = ' + pred + '</b>) rồi xóa đệ quy <code>' + pred + '</code> ở lá.',
                  vars: { deleted: target, predecessor: pred },
                  panels: snapBTree(ds.root, ds.m, { [node.id]: 'pivot', [cur.id]: 'swap' }, { [node.id]: { [idx]: 'pivot' } }),
                });
                del(node.children[idx], pred);
                fixChild(node, idx);
              }
              return;
            }
            if (isLeaf(node)) {
              R.step({ line: 'notFound', msg: 'Đã tới nút lá nhưng không tìm thấy khóa <code>' + target + '</code>.', vars: { target, found: false }, panels: snapBTree(ds.root, ds.m, { [node.id]: 'visited' }) });
              return;
            }
            let cIdx = 0;
            while (cIdx < node.keys.length && target > node.keys[cIdx]) cIdx++;
            del(node.children[cIdx], target);
            fixChild(node, cIdx);
          }

          del(ds.root, k);
          if (ds.root && ds.root.keys.length === 0 && ds.root.children.length > 0) {
            ds.root = ds.root.children[0];
            R.step({
              line: 'shrinkRoot',
              msg: 'Nút gốc bị rỗng sau khi <code>Combine</code> → hạ nút con duy nhất lên làm gốc mới (chiều cao B-Tree giảm đi 1).',
              vars: { newRoot: ds.root.keys.join(','), m: ds.m },
              panels: snapBTree(ds.root, ds.m, { [ds.root.id]: 'found' }),
            });
          }
          return R.steps;
        },
      },
      {
        id: 'search',
        label: 'Tìm kiếm (BTreeSearch)',
        code: CODE_BTREE_SEARCH,
        args: [
          { id: 'k', label: 'Khóa target', type: 'number', value: 50, random: () => DSA.randInt(10, 95) },
          makeOrderMArg(),
        ],
        run({ k, m }, ds) {
          ds.m = Number(m) || ds.m;
          const R = new DSA.Recorder();
          let cur = ds.root;
          const visited = {};
          while (cur) {
            let idx = cur.keys.length - 1;
            while (idx >= 0 && k < cur.keys[idx]) idx--;
            R.step({
              line: 'scanBack',
              msg: 'Tại nút <code>[' + cur.keys.join(' | ') + ']</code>: quét ngược từ <code>numEntries = ' + cur.keys.length + '</code> → dừng tại <code>entryNo = ' + (idx + 1) + '</code>.',
              vars: { target: k, nodeKeys: cur.keys.join(','), entryNo: idx + 1 },
              panels: snapBTree(ds.root, ds.m, Object.assign({}, visited, { [cur.id]: 'compare' }), idx >= 0 ? { [cur.id]: { [idx]: 'compare' } } : {}),
            });
            if (idx >= 0 && cur.keys[idx] === k) {
              R.step({
                line: 'found',
                msg: 'Tìm thấy <code>target = ' + k + '</code> tại nút <code>[' + cur.keys.join(' | ') + ']</code> (vị trí <code>entryNo = ' + (idx + 1) + '</code>)!',
                vars: { target: k, entryNo: idx + 1, found: true },
                panels: snapBTree(ds.root, ds.m, Object.assign({}, visited, { [cur.id]: 'active' }), { [cur.id]: { [idx]: 'found' } }),
              });
              return R.steps;
            }
            visited[cur.id] = 'visited';
            const childIdx = idx + 1;
            R.step({
              line: childIdx === 0 ? 'goFirst' : 'goChild',
              msg: childIdx === 0
                ? 'Vì <code>target (' + k + ') &lt; first entry (' + cur.keys[0] + ')</code> → rẽ xuống con trỏ đầu <code>root->firstPtr</code> (nhánh 0).'
                : 'Rẽ xuống <code>root->entries[' + childIdx + '].rightPtr</code> (nhánh con thứ ' + childIdx + ').',
              vars: { target: k, branch: childIdx },
              panels: snapBTree(ds.root, ds.m, Object.assign({}, visited, { [cur.id]: 'active' })),
            });
            cur = cur.children ? cur.children[childIdx] : null;
          }
          R.step({ line: 'nullCheck', msg: 'Gặp nhánh NULL → không tìm thấy <code>' + k + '</code> trong B-Tree (trả về <code>found = false</code>).', vars: { target: k, found: false }, panels: snapBTree(ds.root, ds.m, visited) });
          return R.steps;
        },
      },
      {
        id: 'traverse',
        label: 'Duyệt Inorder (BTreeTraversal)',
        code: CODE_BTREE_TRAV,
        args: [makeOrderMArg()],
        run({ m }, ds) {
          ds.m = Number(m) || ds.m;
          const R = new DSA.Recorder();
          const out = [];
          const doneKeyHl = {};

          function makeOutPanel() {
            return [{
              kind: 'list', key: 'out', title: 'Thứ tự xuất BTreeTraversal (tăng dần)',
              items: out.map((x, i) => ({ label: x, hl: i === out.length - 1 ? 'found' : 'sorted' })),
            }];
          }

          function walk(node) {
            if (!node) return;
            let scanCount = 0;
            let ptr = !isLeaf(node) ? node.children[0] : null;
            R.step({
              line: 'initScan',
              msg: 'Vào nút <code>[' + node.keys.join(' | ') + ']</code>: khởi tạo <code>scanCount = 0</code>, <code>ptr = firstPtr</code>.',
              vars: { node: '[' + node.keys.join('|') + ']', scanCount: 0, outputCount: out.length },
              panels: snapBTree(ds.root, ds.m, { [node.id]: 'active' }, doneKeyHl, makeOutPanel()),
            });
            while (scanCount <= node.keys.length) {
              if (ptr) {
                R.step({
                  line: 'recSub',
                  msg: 'Gọi đệ quy <code>BTreeTraversal(ptr)</code> cho nhánh con thứ <code>' + scanCount + '</code> của nút <code>[' + node.keys.join(' | ') + ']</code>.',
                  vars: { node: '[' + node.keys.join('|') + ']', scanCount },
                  panels: snapBTree(ds.root, ds.m, { [node.id]: 'compare', [ptr.id]: 'active' }, doneKeyHl, makeOutPanel()),
                });
                walk(ptr);
              }
              scanCount++;
              if (scanCount <= node.keys.length) {
                const k = node.keys[scanCount - 1];
                out.push(k);
                if (!doneKeyHl[node.id]) doneKeyHl[node.id] = {};
                doneKeyHl[node.id][scanCount - 1] = 'sorted';
                const curKeyHl = JSON.parse(JSON.stringify(doneKeyHl));
                curKeyHl[node.id][scanCount - 1] = 'found';
                R.step({
                  line: ['procEntry', 'nextPtr'],
                  msg: '<code>scanCount = ' + scanCount + '</code>: xử lý <code>process(entries[' + scanCount + '] = ' + k + ')</code> và chuyển <code>ptr = entries[' + scanCount + '].rightPtr</code>.',
                  vars: { scanCount, processedKey: k, output: out.join(', ') },
                  panels: snapBTree(ds.root, ds.m, { [node.id]: 'active' }, curKeyHl, makeOutPanel()),
                });
                ptr = !isLeaf(node) ? node.children[scanCount] : null;
              }
            }
          }

          walk(ds.root);
          R.step({
            line: 'loopScan',
            msg: 'Hoàn tất <code>BTreeTraversal</code>! Đã duyệt toàn bộ <b>' + out.length + ' khóa</b> theo đúng thứ tự tăng dần.',
            vars: { totalKeys: out.length, inorder: out.join(', ') },
            panels: snapBTree(ds.root, ds.m, {}, doneKeyHl, makeOutPanel()),
          });
          return R.steps;
        },
      },
      {
        id: 'build',
        label: 'Dựng B-Tree / Cây mẫu',
        code: CODE_BTREE_INS,
        args: [
          {
            id: 'preset', label: 'Ví dụ mẫu', type: 'select', value: 'custom',
            options: [
              { value: 'custom', label: 'Dùng dãy khóa nhập ở ô bên cạnh' },
              { value: 'p113', label: 'B-Tree bậc m = 4 (chèn 9 khóa)' },
              { value: 'p111', label: 'B-Tree bậc m = 5 (min 2, max 4 khóa/nút)' },
              { value: 'm3', label: '2-3 Tree bậc m = 3 (chèn 10..80)' },
            ],
          },
          { id: 'arr', label: 'Dãy khóa', type: 'array', value: '10 20 30 40 50 60 70 80 90' },
          makeOrderMArg(),
        ],
        run({ preset, arr, m }, ds) {
          let seq = arr;
          if (preset === 'p113') { ds.m = 4; seq = [21, 42, 63, 14, 31, 52, 74, 85, 96]; }
          else if (preset === 'p111') { ds.m = 5; seq = [10, 20, 30, 40, 50, 60, 70, 80, 90, 15, 25, 35, 45, 55, 65]; }
          else if (preset === 'm3') { ds.m = 3; seq = [10, 20, 30, 40, 50, 60, 70, 80]; }
          else { ds.m = Number(m) || ds.m; }

          const R = new DSA.Recorder();
          ds.root = null;
          seq.forEach((k, idx) => {
            ds.root = insertBTreeSilent(ds.root, k, ds.m);
            R.step({
              line: 'callIns',
              msg: 'Bước ' + (idx + 1) + '/' + seq.length + ': chèn khóa <code>' + k + '</code> vào B-Tree bậc <code>m = ' + ds.m + '</code>.',
              vars: { step: idx + 1, insertedKey: k, m: ds.m },
              panels: snapBTree(ds.root, ds.m),
            });
          });
          return R.steps;
        },
      },
    ],
  });
})();
