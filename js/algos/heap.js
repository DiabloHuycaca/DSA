/* =========================================================================
 * DSA Visualizer – heap.js
 * Slide: Heap (1).pdf (HCMUT)
 * 1. Binary Heap (reheapUp, reheapDown, buildHeap, insertHeap, deleteHeap)
 * 2. Heap Applications: selectK (k-th largest) & Priority Queue (3998..1996)
 * 3. Heap Sort (phase 1 ReheapDown from count/2-1..0 + phase 2 swap & ReheapDown)
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  /** Convert array [0..size-1] into binary tree object for TreePanel */
  function arrayToHeapTree(arr, size, hlMap) {
    size = size == null ? arr.length : size;
    hlMap = hlMap || {};
    function build(i) {
      if (i >= size) return null;
      return {
        id: 'h' + i,
        key: arr[i],
        hl: hlMap[i] || '',
        sub: '[' + i + ']',
        left: build(2 * i + 1),
        right: build(2 * i + 2),
      };
    }
    return build(0);
  }

  function heapPanels(arr, size, hlMap, ptrs, ranges, title) {
    const fullHl = Object.assign({}, hlMap);
    for (let i = size; i < arr.length; i++) if (!fullHl[i]) fullHl[i] = 'sorted';
    return [
      { kind: 'tree', key: 'htree', title: title || ('Cây Heap (size = ' + size + ')'), root: arrayToHeapTree(arr, size, hlMap) },
      {
        kind: 'array', key: 'harr', title: 'Biểu diễn mảng heap[0..' + (arr.length - 1) + '] (left = 2i+1, right = 2i+2, parent = ⌊(i−1)/2⌋)',
        values: arr, hl: fullHl, pointers: ptrs, ranges,
      },
    ];
  }

  /* ---------------------------------------------------------------------
   * 1. Binary Heap Operations (Heap (1).pdf p.5-33)
   * ------------------------------------------------------------------- */
  const CODE_HEAP = {
    cpp: `void reheapUp(int heap[], int position) {
    if (position > 0) {                             @@upCheck
        int parent = (position - 1) / 2;            @@upParent
        if (heap[position] > heap[parent]) {        @@upCmp
            std::swap(heap[position], heap[parent]); @@upSwap
            reheapUp(heap, parent);                 @@upRec
        }
    }
}
void reheapDown(int heap[], int pos, int lastPos) {
    int leftChild = pos * 2 + 1;                    @@dnChildren
    int rightChild = pos * 2 + 2;                   @@dnChildren
    if (leftChild <= lastPos) {                     @@dnHasL
        int largeChild = (rightChild <= lastPos && heap[rightChild] > heap[leftChild])
                         ? rightChild : leftChild;  @@dnPickChild
        if (heap[largeChild] > heap[pos]) {         @@dnCmp
            std::swap(heap[largeChild], heap[pos]); @@dnSwap
            reheapDown(heap, largeChild, lastPos);  @@dnRec
        }
    }
}
bool insertHeap(int heap[], int& last, int data) {
    last = last + 1;                                @@insLast
    heap[last] = data;                              @@insPlace
    reheapUp(heap, last);                           @@insUp
    return true;
}
bool deleteHeap(int heap[], int& last, int& dataOut) {
    if (last < 0) return false;
    dataOut = heap[0];                              @@delSave
    heap[0] = heap[last];                           @@delMove
    last = last - 1;                                @@delMove
    reheapDown(heap, 0, last);                      @@delDown
    return true;
}
void buildHeap(int heap[], int size) {
    int walker = 1;                                 @@bInit
    while (walker < size) {                         @@bLoop
        reheapUp(heap, walker);                     @@bUp
        walker = walker + 1;                        @@bNext
    }
}`,
    java: `static void reheapUp(int[] heap, int position) {
    if (position > 0) {                             @@upCheck
        int parent = (position - 1) / 2;            @@upParent
        if (heap[position] > heap[parent]) {        @@upCmp
            int t = heap[position]; heap[position] = heap[parent]; heap[parent] = t; @@upSwap
            reheapUp(heap, parent);                 @@upRec
        }
    }
}
static void reheapDown(int[] heap, int pos, int lastPos) {
    int left = pos * 2 + 1, right = pos * 2 + 2;    @@dnChildren
    if (left <= lastPos) {                          @@dnHasL
        int large = (right <= lastPos && heap[right] > heap[left]) ? right : left; @@dnPickChild
        if (heap[large] > heap[pos]) {              @@dnCmp
            int t = heap[large]; heap[large] = heap[pos]; heap[pos] = t; @@dnSwap
            reheapDown(heap, large, lastPos);       @@dnRec
        }
    }
}
static int insertHeap(int[] heap, int last, int data) {
    last = last + 1;                                @@insLast
    heap[last] = data;                              @@insPlace
    reheapUp(heap, last);                           @@insUp
    return last;
}
static int deleteHeap(int[] heap, int last) {
    int dataOut = heap[0];                          @@delSave
    heap[0] = heap[last];                           @@delMove
    last = last - 1;                                @@delMove
    reheapDown(heap, 0, last);                      @@delDown
    return dataOut;
}
static void buildHeap(int[] heap, int size) {
    int walker = 1;                                 @@bInit
    while (walker < size) {                         @@bLoop
        reheapUp(heap, walker);                     @@bUp
        walker++;                                   @@bNext
    }
}`,
    python: `def reheap_up(heap, position):
    if position > 0:                                @@upCheck
        parent = (position - 1) // 2                @@upParent
        if heap[position] > heap[parent]:           @@upCmp
            heap[position], heap[parent] = heap[parent], heap[position] @@upSwap
            reheap_up(heap, parent)                 @@upRec

def reheap_down(heap, position, last_position):
    left = position * 2 + 1                         @@dnChildren
    right = position * 2 + 2                        @@dnChildren
    if left <= last_position:                       @@dnHasL
        large = right if (right <= last_position and heap[right] > heap[left]) else left @@dnPickChild
        if heap[large] > heap[position]:            @@dnCmp
            heap[large], heap[position] = heap[position], heap[large] @@dnSwap
            reheap_down(heap, large, last_position) @@dnRec

def insert_heap(heap, data):
    heap.append(data)                               @@insPlace
    reheap_up(heap, len(heap) - 1)                  @@insUp

def delete_heap(heap):
    data_out = heap[0]                              @@delSave
    heap[0] = heap[-1]; heap.pop()                  @@delMove
    if heap: reheap_down(heap, 0, len(heap) - 1)    @@delDown
    return data_out

def build_heap(heap):
    walker = 1                                      @@bInit
    while walker < len(heap):                       @@bLoop
        reheap_up(heap, walker)                     @@bUp
        walker += 1                                 @@bNext`,
    pseudo: `Algorithm reheapUp(ref heap <array>, val position <integer>)
if position > 0 then                                @@upCheck
    parent = (position - 1) / 2                     @@upParent
    if heap[position].key > heap[parent].key then   @@upCmp
        swap(position, parent)                      @@upSwap
        reheapUp(heap, parent)                      @@upRec
    end
end
End reheapUp

Algorithm reheapDown(ref heap <array>, val position <integer>, val lastPosition <integer>)
leftChild = position * 2 + 1; rightChild = position * 2 + 2 @@dnChildren
if leftChild <= lastPosition then                   @@dnHasL
    if (rightChild <= lastPosition) AND (heap[rightChild].key > heap[leftChild].key) then
        largeChild = rightChild                     @@dnPickChild
    else largeChild = leftChild end                 @@dnPickChild
    if heap[largeChild].key > heap[position].key then @@dnCmp
        swap(largeChild, position)                  @@dnSwap
        reheapDown(heap, largeChild, lastPosition)  @@dnRec
    end
end
End reheapDown

Algorithm insertHeap(ref heap <array>, ref last <integer>, val data <Type>)
if heap full then return false end
last = last + 1; heap[last] = data                  @@insPlace
reheapUp(heap, last)                                @@insUp
return true
End insertHeap

Algorithm deleteHeap(ref heap <array>, ref last <integer>, ref dataOut <Type>)
if heap empty then return false end
dataOut = heap[0]; heap[0] = heap[last]             @@delSave
last = last - 1                                     @@delMove
reheapDown(heap, 0, last)                           @@delDown
return true
End deleteHeap

Algorithm buildHeap(ref heap <array>, val size <integer>)
walker = 1                                          @@bInit
while walker < size do                              @@bLoop
    reheapUp(heap, walker)                          @@bUp
    walker = walker + 1                             @@bNext
end
End buildHeap`,
  };

  function traceReheapUp(R, arr, pos, size) {
    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      const gt = arr[pos] > arr[parent];
      R.step({
        line: 'upCmp',
        msg: '<code>reheapUp(pos=' + pos + ')</code>: so sánh <code>heap[' + pos + '] (' + arr[pos] + ') &gt; heap[parent=' + parent + '] (' + arr[parent] + ')</code> → <b>' + (gt ? 'Đúng (swap)' : 'Sai (dừng)') + '</b>.',
        vars: { position: pos, parent, 'heap[pos]': arr[pos], 'heap[parent]': arr[parent] },
        panels: heapPanels(arr, size, { [pos]: 'compare', [parent]: 'compare' }, [{ i: parent, label: 'parent', hl: 'compare' }, { i: pos, label: 'pos', hl: 'compare' }]),
      });
      if (!gt) break;
      const t = arr[pos]; arr[pos] = arr[parent]; arr[parent] = t;
      R.step({
        line: 'upSwap',
        msg: 'Hoán đổi <code>heap[' + pos + '] ↔ heap[' + parent + ']</code>; tiếp tục <code>reheapUp(' + parent + ')</code>.',
        vars: { position: parent, swapped: arr[parent] },
        panels: heapPanels(arr, size, { [parent]: 'swap', [pos]: 'visited' }, [{ i: parent, label: 'floated up', hl: 'swap' }]),
      });
      pos = parent;
    }
  }

  function traceReheapDown(R, arr, pos, lastPos, totalSize) {
    const sz = lastPos + 1;
    while (true) {
      const left = pos * 2 + 1, right = pos * 2 + 2;
      if (left > lastPos) break;
      const large = (right <= lastPos && arr[right] > arr[left]) ? right : left;
      const gt = arr[large] > arr[pos];
      const hl = { [pos]: 'active', [left]: 'compare' };
      if (right <= lastPos) hl[right] = 'compare';
      hl[large] = 'pivot';
      R.step({
        line: 'dnCmp',
        msg: '<code>reheapDown(pos=' + pos + ')</code>: con lớn hơn là <code>largeChild = ' + large + ' (' + arr[large] + ')</code>. So sánh <code>' + arr[large] + ' &gt; ' + arr[pos] + '</code> → <b>' + (gt ? 'Đúng (swap)' : 'Sai (dừng)') + '</b>.',
        vars: { position: pos, leftChild: left, rightChild: right <= lastPos ? right : '—', largeChild: large, lastPosition: lastPos },
        panels: heapPanels(arr, sz, hl, [{ i: pos, label: 'pos' }, { i: large, label: 'largeChild', hl: 'pivot' }]),
      });
      if (!gt) break;
      const t = arr[pos]; arr[pos] = arr[large]; arr[large] = t;
      R.step({
        line: 'dnSwap',
        msg: 'Hoán đổi <code>heap[' + pos + '] ↔ heap[' + large + ']</code>; tiếp tục <code>reheapDown(' + large + ', ' + lastPos + ')</code>.',
        vars: { position: large, lastPosition: lastPos },
        panels: heapPanels(arr, sz, { [large]: 'swap', [pos]: 'visited' }, [{ i: large, label: 'pushed down', hl: 'swap' }]),
      });
      pos = large;
    }
  }

  DSA.register({
    id: 'binary-heap',
    chapter: 'heap',
    name: 'Cấu trúc Heap & các thao tác cơ bản',
    short: 'O(log n)',
    complexity: [
      ['reheapUp / reheapDown', 'O(log₂ n)'],
      ['insertHeap / deleteHeap', 'O(log₂ n)'],
      ['buildHeap (reheapUp)', 'O(n log₂ n)'],
      ['Quan hệ chỉ số', 'L = 2i+1, R = 2i+2, P = ⌊(i−1)/2⌋'],
    ],
    description:
      '<p><b>Max-Heap</b> là cây nhị phân hoàn chỉnh (complete) hoặc gần hoàn chỉnh (nearly complete – các nút ở mức cuối dồn hết về bên trái) sao cho khóa của mỗi nút <b>lớn hơn hoặc bằng</b> khóa của các nút con cháu.</p>' +
      '<ul>' +
      '<li>Nhờ tính gần hoàn chỉnh, Heap được lưu gọn trong mảng: nút tại chỉ số <code>i</code> có con trái tại <code>2i + 1</code>, con phải tại <code>2i + 2</code>, cha tại <code>⌊(i − 1)/2⌋</code>; nút lá đầu tiên ở <code>⌊N/2⌋</code>.</li>' +
      '<li><code>insertHeap</code>: đặt phần tử mới vào lá trống đầu tiên (<code>last + 1</code>) rồi gọi <code>reheapUp</code>.</li>' +
      '<li><code>deleteHeap</code>: lấy gốc <code>heap[0]</code> ra, chuyển phần tử cuối <code>heap[last]</code> lên gốc rồi gọi <code>reheapDown(0, last)</code>.</li>' +
      '<li><code>buildHeap</code>: dịch "bức tường" <code>walker</code> từ <code>1</code> đến <code>N − 1</code>, mỗi bước gọi <code>reheapUp(heap, walker)</code>.</li>' +
      '</ul>',
    init(ds) {
      ds.heap = [78, 56, 63, 32, 45, 23, 19];
    },
    view(ds) {
      return heapPanels(ds.heap, ds.heap.length, {}, [], []);
    },
    ops: [
      {
        id: 'insert',
        label: 'Thêm nút (insertHeap + reheapUp)',
        code: CODE_HEAP,
        args: [{ id: 'val', label: 'Giá trị cần thêm', type: 'number', value: 70, random: () => DSA.randInt(10, 99) }],
        run({ val }, ds) {
          const R = new DSA.Recorder();
          ds.heap.push(val);
          const last = ds.heap.length - 1;
          R.step({
            line: 'insPlace',
            msg: 'Tăng <code>last = ' + last + '</code>, đặt <code>heap[' + last + '] = ' + val + '</code> ở lá trống đầu tiên rồi gọi <code>reheapUp</code>.',
            vars: { last, data: val },
            panels: heapPanels(ds.heap, ds.heap.length, { [last]: 'new' }, [{ i: last, label: 'last=' + last, hl: 'new' }]),
          });
          traceReheapUp(R, ds.heap, last, ds.heap.length);
          R.step({
            line: 'insUp',
            msg: 'Hoàn tất <code>insertHeap(' + val + ')</code>!',
            vars: { size: ds.heap.length, root: ds.heap[0] },
            panels: heapPanels(ds.heap, ds.heap.length, { 0: 'found' }),
          });
          return R.steps;
        },
      },
      {
        id: 'delete',
        label: 'Xóa nút gốc (deleteHeap + reheapDown)',
        code: CODE_HEAP,
        args: [],
        run(_, ds) {
          const R = new DSA.Recorder();
          if (!ds.heap.length) return [{ msg: 'Heap đang rỗng!' }];
          const dataOut = ds.heap[0];
          const lastVal = ds.heap[ds.heap.length - 1];
          R.step({
            line: 'delSave',
            msg: 'Lưu giá trị gốc cần xóa <code>dataOut = heap[0] = ' + dataOut + '</code>.',
            vars: { dataOut, last: ds.heap.length - 1 },
            panels: heapPanels(ds.heap, ds.heap.length, { 0: 'swap', [ds.heap.length - 1]: 'pivot' }),
          });
          ds.heap[0] = lastVal;
          ds.heap.pop();
          if (ds.heap.length > 0) {
            R.step({
              line: 'delMove',
              msg: 'Chuyển phần tử cuối <code>' + lastVal + '</code> lên <code>heap[0]</code>, giảm <code>last = ' + (ds.heap.length - 1) + '</code> rồi gọi <code>reheapDown</code>.',
              vars: { dataOut, newRoot: lastVal, last: ds.heap.length - 1 },
              panels: heapPanels(ds.heap, ds.heap.length, { 0: 'active' }),
            });
            traceReheapDown(R, ds.heap, 0, ds.heap.length - 1, ds.heap.length);
          }
          R.step({
            line: 'delDown',
            msg: 'Hoàn tất <code>deleteHeap</code> → trả về <b>dataOut = ' + dataOut + '</b>.',
            vars: { dataOut, remainingSize: ds.heap.length },
            panels: heapPanels(ds.heap, ds.heap.length, {}),
          });
          return R.steps;
        },
      },
      {
        id: 'build',
        label: 'Dựng Heap từ mảng (buildHeap)',
        code: CODE_HEAP,
        args: [{ id: 'arr', label: 'Mảng bất kỳ', type: 'array', value: '23 45 19 78 56 32 63' }],
        run({ arr }, ds) {
          ds.heap = arr.slice();
          const n = ds.heap.length;
          const R = new DSA.Recorder();
          R.step({
            line: 'bInit',
            msg: 'Bắt đầu <code>buildHeap</code>: coi <code>heap[0] = ' + ds.heap[0] + '</code> là Heap 1 nút, đặt bức tường tại <code>walker = 1</code>.',
            vars: { size: n, walker: 1 },
            panels: heapPanels(ds.heap, 1, { 0: 'sorted' }, [{ i: 1, label: 'walker=1' }], [{ from: 0, to: 0, label: 'Heap' }]),
          });
          for (let walker = 1; walker < n; walker++) {
            R.step({
              line: 'bLoop',
              msg: 'Đưa <code>heap[walker=' + walker + '] = ' + ds.heap[walker] + '</code> vào Heap và gọi <code>reheapUp(heap, ' + walker + ')</code>.',
              vars: { walker, 'heap[walker]': ds.heap[walker] },
              panels: heapPanels(ds.heap, walker + 1, { [walker]: 'new' }, [{ i: walker, label: 'walker=' + walker, hl: 'new' }], [{ from: 0, to: walker, label: 'Heap [0..' + walker + ']' }]),
            });
            traceReheapUp(R, ds.heap, walker, walker + 1);
          }
          R.step({
            line: 'bNext',
            msg: 'Hoàn tất <code>buildHeap</code>! Mảng đã thỏa tính chất Max-Heap.',
            vars: { heap: ds.heap.join(', ') },
            panels: heapPanels(ds.heap, n, { 0: 'found' }),
          });
          return R.steps;
        },
      },
      {
        id: 'reheap',
        label: 'Thử nghiệm reheapUp / reheapDown tại vị trí pos',
        code: CODE_HEAP,
        args: [
          {
            id: 'mode', label: 'Hàm', type: 'select', value: 'up',
            options: [
              { value: 'up', label: 'reheapUp(heap, pos) – Sau khi tăng khóa tại pos' },
              { value: 'down', label: 'reheapDown(heap, pos, last) – Sau khi giảm khóa tại pos' },
            ],
          },
          { id: 'pos', label: 'Chỉ số pos', type: 'number', value: 4 },
          { id: 'newVal', label: 'Gán giá trị mới tại heap[pos]', type: 'number', value: 90 },
        ],
        run({ mode, pos, newVal }, ds) {
          const R = new DSA.Recorder();
          const n = ds.heap.length;
          if (!n) return [{ msg: 'Heap đang rỗng.' }];
          const idx = Math.max(0, Math.min(n - 1, pos));
          ds.heap[idx] = newVal;
          R.step({
            line: mode === 'up' ? 'upCheck' : 'dnChildren',
            msg: 'Đặt <code>heap[' + idx + '] = ' + newVal + '</code> rồi gọi <code>' + (mode === 'up' ? 'reheapUp(heap, ' + idx + ')' : 'reheapDown(heap, ' + idx + ', ' + (n - 1) + ')') + '</code>.',
            vars: { pos: idx, newValue: newVal },
            panels: heapPanels(ds.heap, n, { [idx]: 'pivot' }, [{ i: idx, label: 'pos=' + idx, hl: 'pivot' }]),
          });
          if (mode === 'up') traceReheapUp(R, ds.heap, idx, n);
          else traceReheapDown(R, ds.heap, idx, n - 1, n);
          return R.steps;
        },
      },
    ],
  });

  /* ---------------------------------------------------------------------
   * 2. Heap Applications: selectK & Priority Queue (Heap (1).pdf p.35-43)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'heap-apps',
    chapter: 'heap',
    name: 'Ứng dụng Heap: Tìm phần tử lớn thứ k (selectK) & Priority Queue',
    short: 'selectK / Priority Queue',
    complexity: [
      ['selectK', 'O(n log₂ n)'],
      ['Priority Queue Enqueue / Dequeue', 'O(log₂ n)'],
      ['Mã hóa ưu tiên', 'priority × 1000 + (1000 − arrival)'],
    ],
    description:
      '<p>Hai ứng dụng kinh điển của Heap:</p>' +
      '<ol>' +
      '<li><b>Thuật toán <code>selectK</code> (tìm phần tử lớn thứ <code>k</code>)</b>: xóa tạm <code>k − 1</code> phần tử lớn nhất ở đỉnh Heap và cất vào cuối mảng (<code>heap[last + 1] = temp</code>), khi đó đỉnh <code>heap[0]</code> chính là phần tử lớn thứ <code>k</code> (<code>holdOut = heap[0]</code>); sau cùng khôi phục lại Heap bằng vòng lặp <code>reheapUp</code>.</li>' +
      '<li><b>Hàng đợi ưu tiên (Priority Queue)</b>: ví dụ 5 khách hàng đến theo thứ tự với mức ưu tiên Cao (3), Trung bình (2), Thấp (1). Khóa được mã hóa thành <code>priority*1000 + (1000 - serial)</code> để người đến trước trong cùng mức ưu tiên có khóa lớn hơn: KH2 (<code>3998</code>), KH5 (<code>3995</code>), KH3 (<code>2997</code>), KH1 (<code>1999</code>), KH4 (<code>1996</code>).</li>' +
      '</ol>',
    ops: [
      {
        id: 'selectK',
        label: 'Tìm phần tử lớn thứ k (selectK)',
        args: [
          { id: 'arr', label: 'Danh sách đầu vào', type: 'array', value: '23 78 45 8 32 56 63 19' },
          { id: 'k', label: 'Thứ hạng k (1 = lớn nhất)', type: 'number', value: 3 },
        ],
        code: {
          cpp: `int selectK(int heap[], int k, int& last) {
    if (k > last + 1) return 0;                     @@chk
    int i = 1, originalSize = last + 1;             @@init
    while (i < k) {                                 @@delLoop
        int temp = heap[0], dataOut;                @@delStep
        deleteHeap(heap, last, dataOut);            @@delStep
        heap[last + 1] = temp;                      @@storeEnd
        i = i + 1;
    }
    int holdOut = heap[0];                          @@hold
    while (last < originalSize - 1) {               @@restore
        last = last + 1;                            @@restore
        reheapUp(heap, last);                       @@restore
    }
    return holdOut;                                 @@ret
}`,
          java: `static int selectK(int[] heap, int k, int last) {
    if (k > last + 1) return 0;                     @@chk
    int i = 1, originalSize = last + 1;             @@init
    while (i < k) {                                 @@delLoop
        int temp = heap[0];                         @@delStep
        last = deleteHeap(heap, last);              @@delStep
        heap[last + 1] = temp;                      @@storeEnd
        i++;
    }
    int holdOut = heap[0];                          @@hold
    while (last < originalSize - 1) {               @@restore
        last++; reheapUp(heap, last);               @@restore
    }
    return holdOut;                                 @@ret
}`,
          python: `def select_k(heap, k, last):
    if k > last + 1: return 0                       @@chk
    i, original_size = 1, last + 1                  @@init
    while i < k:                                    @@delLoop
        temp = heap[0]                              @@delStep
        last = delete_heap_in_place(heap, last)     @@delStep
        heap[last + 1] = temp                       @@storeEnd
        i += 1
    hold_out = heap[0]                              @@hold
    while last < original_size - 1:                 @@restore
        last += 1                                   @@restore
        reheap_up(heap, last)                       @@restore
    return hold_out                                 @@ret`,
          pseudo: `Algorithm selectK(ref heap <array>, ref k <integer>, ref last <integer>)
if k > last + 1 then return 0 end                   @@chk
i = 1; originalSize = last + 1                      @@init
while i < k do                                      @@delLoop
    temp = heap[0]                                  @@delStep
    deleteHeap(heap, last, dataOut)                 @@delStep
    heap[last + 1] = temp                           @@storeEnd
    i = i + 1
end
holdOut = heap[0] // Desired k-th largest element   @@hold
while last < originalSize - 1 do                    @@restore
    last = last + 1; reheapUp(heap, last)           @@restore
end
return holdOut                                      @@ret
End selectK`,
        },
        run({ arr, k }) {
          const R = new DSA.Recorder();
          const h = arr.slice();
          const n = h.length;
          // Build heap first
          for (let w = 1; w < n; w++) {
            let p = w;
            while (p > 0 && h[p] > h[(p - 1) >> 1]) {
              const par = (p - 1) >> 1;
              const t = h[p]; h[p] = h[par]; h[par] = t;
              p = par;
            }
          }
          let last = n - 1;
          const kk = Math.max(1, Math.min(n, k));

          R.step({
            line: 'init',
            msg: 'Sau khi tạo Max-Heap ban đầu, bắt đầu <code>selectK(k = ' + kk + ')</code> với <code>originalSize = ' + n + '</code>.',
            vars: { k: kk, last, originalSize: n },
            panels: heapPanels(h, last + 1, { 0: 'active' }),
          });

          for (let i = 1; i < kk; i++) {
            const temp = h[0];
            h[0] = h[last];
            last--;
            traceReheapDown(R, h, 0, last, n);
            h[last + 1] = temp;
            R.step({
              line: 'storeEnd',
              msg: 'Lượt <code>i = ' + i + '</code>: xóa đỉnh <code>' + temp + '</code> và cất tạm vào <code>heap[' + (last + 1) + '] = ' + temp + '</code>.',
              vars: { i, k: kk, last, tempStoredAt: last + 1 },
              panels: heapPanels(h, last + 1, { 0: 'active', [last + 1]: 'pivot' }, [{ i: last + 1, label: 'saved #' + i, hl: 'pivot' }]),
            });
          }

          const holdOut = h[0];
          R.step({
            line: 'hold',
            msg: 'Đỉnh Heap hiện tại chính là phần tử lớn thứ ' + kk + ': <b>holdOut = heap[0] = ' + holdOut + '</b>!',
            vars: { k: kk, holdOut, last },
            panels: heapPanels(h, last + 1, { 0: 'found' }, [{ i: 0, label: 'k-th = ' + holdOut, hl: 'found' }]),
          });

          while (last < n - 1) {
            last++;
            let p = last;
            while (p > 0 && h[p] > h[(p - 1) >> 1]) {
              const par = (p - 1) >> 1;
              const t = h[p]; h[p] = h[par]; h[par] = t;
              p = par;
            }
          }
          R.step({
            line: 'restore',
            msg: 'Khôi phục lại toàn bộ Heap ban đầu bằng <code>reheapUp</code> và trả về <b>holdOut = ' + holdOut + '</b>.',
            vars: { holdOut, restoredSize: n },
            panels: heapPanels(h, n, { [h.indexOf(holdOut)]: 'found' }),
          });
          return R.steps;
        },
      },
      {
        id: 'pq',
        label: 'Mô phỏng Priority Queue (Ví dụ 5 khách hàng)',
        args: [
          {
            id: 'priorities', label: 'Độ ưu tiên các khách đến (1=Low, 2=Med, 3=High)',
            type: 'array', value: '1 3 2 1 3',
          },
        ],
        code: {
          cpp: `struct Customer { int id, priority, key; };
int encodeKey(int priority, int serial) {
    // priority: 3=High, 2=Medium, 1=Low
    return priority * 1000 + (1000 - serial);       @@encode
}
void enqueuePQ(int heap[], int& last, int priority, int serial) {
    int key = encodeKey(priority, serial);          @@encode
    insertHeap(heap, last, key);                    @@encode
}
int dequeuePQ(int heap[], int& last) {
    int dataOut = 0;
    deleteHeap(heap, last, dataOut);                @@serve
    return dataOut;                                 @@serve
}`,
          java: `static int encodeKey(int priority, int serial) {
    return priority * 1000 + (1000 - serial);       @@encode
}
static int enqueuePQ(int[] heap, int last, int priority, int serial) {
    int key = encodeKey(priority, serial);          @@encode
    return insertHeap(heap, last, key);             @@encode
}
static int dequeuePQ(int[] heap, int last) {
    return deleteHeap(heap, last);                  @@serve
}`,
          python: `def encode_key(priority, serial):
    # priority: 3=High, 2=Medium, 1=Low
    return priority * 1000 + (1000 - serial)        @@encode

def enqueue_pq(heap, priority, serial):
    key = encode_key(priority, serial)              @@encode
    insert_heap(heap, key)                          @@encode

def dequeue_pq(heap):
    return delete_heap(heap)                        @@serve`,
          pseudo: `Algorithm PriorityQueue_Simulation()
// Encode key so FIFO order is preserved within same priority:
// key = priority * 1000 + (1000 - serial)
1. For each arriving customer #serial with priority ∈ {1, 2, 3}:
    key = priority * 1000 + (1000 - serial)         @@encode
    insertHeap(pqHeap, last, key)                   @@encode
2. While pqHeap not empty do
    deleteHeap(pqHeap, last, topCustomerKey)        @@serve
    Serve customer with topCustomerKey              @@serve
End PriorityQueue_Simulation`,
        },
        run({ priorities }) {
          const pNames = { 1: 'Low', 2: 'Med', 3: 'High' };
          const list = (priorities && priorities.length ? priorities : [1, 3, 2, 1, 3]).map((pr, i) => {
            const p = Math.max(1, Math.min(9, Math.trunc(pr)));
            const serial = i + 1;
            return {
              name: 'KH' + serial + ' (' + (pNames[p] || ('P' + p)) + ')',
              key: p * 1000 + (1000 - serial),
            };
          });
          const R = new DSA.Recorder();
          const h = [];
          list.forEach((c, idx) => {
            h.push(c.key);
            let p = h.length - 1;
            while (p > 0 && h[p] > h[(p - 1) >> 1]) {
              const par = (p - 1) >> 1;
              const t = h[p]; h[p] = h[par]; h[par] = t;
              p = par;
            }
            R.step({
              line: 'encode',
              msg: 'Khách hàng đến #' + (idx + 1) + ': <b>' + c.name + '</b> → mã hóa khóa <code>' + c.key + '</code> và đưa vào Priority Queue (<code>insertHeap</code>).',
              vars: { customer: c.name, encodedKey: c.key, topOfQueue: h[0] },
              panels: heapPanels(h, h.length, { [h.indexOf(c.key)]: 'found' }, [], [], 'Priority Queue (Max-Heap)'),
            });
          });

          const served = [];
          while (h.length) {
            const top = h[0];
            const cust = list.find((c) => c.key === top) || { name: 'KH', key: top };
            served.push(cust.name + ' [' + top + ']');
            const last = h.pop();
            if (h.length) {
              h[0] = last;
              let pos = 0;
              while (pos * 2 + 1 < h.length) {
                const l = pos * 2 + 1, r = pos * 2 + 2;
                const lg = (r < h.length && h[r] > h[l]) ? r : l;
                if (h[lg] <= h[pos]) break;
                const t = h[pos]; h[pos] = h[lg]; h[lg] = t;
                pos = lg;
              }
            }
            R.step({
              line: 'serve',
              msg: 'Phục vụ khách ở đỉnh Heap: <b>' + cust.name + ' (' + top + ')</b>.',
              vars: { servedNow: cust.name, servedOrder: served.join(' → ') },
              panels: [
                ...heapPanels(h, h.length, {}, [], [], 'Priority Queue còn lại'),
                { kind: 'list', key: 'sv', title: 'Thứ tự khách đã được phục vụ', items: served.map((s, i) => ({ label: s, hl: i === served.length - 1 ? 'found' : 'sorted' })) },
              ],
            });
          }
          return R.steps;
        },
      },
    ],
  });

  /* ---------------------------------------------------------------------
   * 3. Heap Sort (Heap (1).pdf p.44-47)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'heap-sort',
    chapter: 'heap',
    name: 'Heap Sort',
    short: 'O(n log n)',
    complexity: [
      ['Phase 1 (Build Heap)', 'O(n)'],
      ['Phase 2 (Extract Max)', 'O(n log₂ n)'],
      ['Total Time (Best/Avg/Worst)', 'O(n log₂ n)'],
      ['Space', 'O(1) tại chỗ (in-place)'],
    ],
    description:
      '<p><b>Heap Sort</b> gồm 2 giai đoạn ngay trên mảng:</p>' +
      '<ol>' +
      '<li><b>Tạo Heap</b>: cho <code>position</code> chạy từ <code>count/2 - 1</code> (nút nội cuối cùng) ngược về <code>0</code>, mỗi bước gọi <code>ReheapDown(position, count - 1)</code>.</li>' +
      '<li><b>Sắp xếp</b>: cho <code>last</code> chạy từ <code>count - 1</code> về <code>1</code>: hoán đổi phần tử lớn nhất ở gốc <code>swap(0, last)</code> để đưa về cuối mảng, giảm vùng Heap đi 1 và gọi <code>ReheapDown(0, last - 1)</code>.</li>' +
      '</ol>',
    ops: [{
      id: 'sort',
      label: 'Sắp xếp (HeapSort)',
      args: [{ id: 'arr', label: 'Mảng', type: 'array', value: '23 78 45 8 32 56 63 19' }],
      code: {
        cpp: `void reheapDown(int data[], int pos, int lastPos) {
    int left = pos * 2 + 1, right = pos * 2 + 2;    @@dnCmp
    if (left <= lastPos) {
        int large = (right <= lastPos && data[right] > data[left]) ? right : left; @@dnCmp
        if (data[large] > data[pos]) {              @@dnCmp
            std::swap(data[large], data[pos]);      @@dnSwap
            reheapDown(data, large, lastPos);       @@dnSwap
        }
    }
}
void heapSort(int data[], int count) {
    int position = count / 2 - 1;                   @@p1Init
    while (position >= 0) {                         @@p1Loop
        reheapDown(data, position, count - 1);      @@p1Down
        position = position - 1;                    @@p1Next
    }
    int last = count - 1;                           @@p2Init
    while (last > 0) {                              @@p2Loop
        std::swap(data[0], data[last]);             @@p2Swap
        last = last - 1;                            @@p2Swap
        reheapDown(data, 0, last);                  @@p2Down
    }
}`,
        java: `static void reheapDown(int[] data, int pos, int lastPos) {
    int left = pos * 2 + 1, right = pos * 2 + 2;    @@dnCmp
    if (left <= lastPos) {
        int large = (right <= lastPos && data[right] > data[left]) ? right : left; @@dnCmp
        if (data[large] > data[pos]) {              @@dnCmp
            int t = data[large]; data[large] = data[pos]; data[pos] = t; @@dnSwap
            reheapDown(data, large, lastPos);       @@dnSwap
        }
    }
}
static void heapSort(int[] data) {
    int count = data.length;
    for (int pos = count / 2 - 1; pos >= 0; pos--)  @@p1Init
        reheapDown(data, pos, count - 1);           @@p1Down
    for (int last = count - 1; last > 0; last--) {  @@p2Init
        int t = data[0]; data[0] = data[last]; data[last] = t; @@p2Swap
        reheapDown(data, 0, last - 1);              @@p2Down
    }
}`,
        python: `def reheap_down(data, pos, last_pos):
    left, right = pos * 2 + 1, pos * 2 + 2          @@dnCmp
    if left <= last_pos:
        large = right if (right <= last_pos and data[right] > data[left]) else left @@dnCmp
        if data[large] > data[pos]:                 @@dnCmp
            data[large], data[pos] = data[pos], data[large] @@dnSwap
            reheap_down(data, large, last_pos)      @@dnSwap

def heap_sort(data):
    count = len(data)
    for pos in range(count // 2 - 1, -1, -1):       @@p1Init
        reheap_down(data, pos, count - 1)           @@p1Down
    last = count - 1                                @@p2Init
    while last > 0:                                 @@p2Loop
        data[0], data[last] = data[last], data[0]   @@p2Swap
        last -= 1                                   @@p2Swap
        reheap_down(data, 0, last)                  @@p2Down`,
        pseudo: `Algorithm HeapSort()
position = count/2 - 1                              @@p1Init
while position >= 0 do                              @@p1Loop
    ReheapDown(position, count - 1)                 @@dnCmp
    position = position - 1                         @@p1Next
end
last = count - 1                                    @@p2Init
while last > 0 do                                   @@p2Loop
    swap(0, last)                                   @@p2Swap
    last = last - 1                                 @@p2Swap
    ReheapDown(0, last)                             @@dnSwap
end
End HeapSort`,
      },
      run({ arr }) {
        const a = arr.slice();
        const n = a.length;
        const R = new DSA.Recorder();

        let pos = Math.floor(n / 2) - 1;
        R.step({
          line: 'p1Init',
          msg: 'Giai đoạn 1 (Tạo Heap): bắt đầu từ nút không phải lá cuối cùng <code>position = ⌊' + n + '/2⌋ - 1 = ' + pos + '</code>.',
          vars: { count: n, position: pos },
          panels: heapPanels(a, n, { [pos]: 'active' }, [{ i: pos, label: 'pos=' + pos }]),
        });

        while (pos >= 0) {
          traceReheapDown(R, a, pos, n - 1, n);
          pos--;
        }

        R.step({
          line: 'p2Init',
          msg: 'Đã tạo xong Max-Heap! Bắt đầu Giai đoạn 2 với <code>last = ' + (n - 1) + '</code>.',
          vars: { last: n - 1, maxAtRoot: a[0] },
          panels: heapPanels(a, n, { 0: 'found' }),
        });

        let last = n - 1;
        while (last > 0) {
          const t = a[0]; a[0] = a[last]; a[last] = t;
          R.step({
            line: 'p2Swap',
            msg: 'Hoán đổi <code>swap(0, last=' + last + ')</code>: đưa giá trị lớn nhất <code>' + a[last] + '</code> về vị trí cố định <code>' + last + '</code>.',
            vars: { last: last - 1, sortedValue: a[last] },
            panels: heapPanels(a, last, { 0: 'swap', [last]: 'sorted' }, [{ i: last, label: 'sorted', hl: 'sorted' }], [{ from: last, to: n - 1, label: 'sorted' }]),
          });
          last--;
          traceReheapDown(R, a, 0, last, n);
        }

        const doneHl = {}; for (let i = 0; i < n; i++) doneHl[i] = 'sorted';
        R.step({
          line: 'p2Loop',
          msg: 'Hoàn tất Heap Sort! Mảng đã được sắp xếp tăng dần.',
          vars: { result: a.join(', ') },
          panels: heapPanels(a, 0, doneHl, [], [{ from: 0, to: n - 1, label: 'Đã sắp xếp' }], 'Heap rỗng (đã lấy hết phần tử)'),
        });
        return R.steps;
      },
    }],
  });
})();
