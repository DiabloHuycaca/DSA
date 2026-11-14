/* =========================================================================
 * DSA Visualizer – sorting.js
 * Slide: Sorting.pdf (HCMUT)
 * 1. Straight Insertion Sort
 * 2. Shell Sort (SortSegment with k = 3k+1 or 2k+1)
 * 3. Straight Selection Sort
 * 4. Bubble Sort (smallest bubbles from right to left + flag)
 * 5. Quick Sort (recursiveQuickSort + Partition)
 * 6. Merge Sort (Linked List Divide/Merge from slide + Array Merge Sort)
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  const DEFAULT_ARR = '42 23 74 11 65 58 94 36 99 87';

  function makeIds(a) { return a.map((_, i) => 'e' + i); }

  /* ---------------------------------------------------------------------
   * 1. Straight Insertion Sort (Sorting.pdf p.10-17)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'insertion-sort',
    chapter: 'sorting',
    name: 'Straight Insertion Sort',
    short: 'O(n²)',
    complexity: [
      ['Best', 'O(n)'],
      ['Average', 'O(n²)'],
      ['Worst', 'f(n) = n(n+1)/2 = O(n²)'],
      ['Space', 'O(1)'],
      ['Ổn định', 'Có (Stable)'],
    ],
    description:
      '<p>Danh sách được chia làm 2 phần: <b>đã sắp xếp (sorted)</b> bên trái và <b>chưa sắp xếp (unsorted)</b> bên phải.</p>' +
      '<p>Ở mỗi bước (<code>current</code> từ <code>1</code> đến <code>count - 1</code>), lấy phần tử đầu tiên của dãy chưa sắp (<code>temp = data[current]</code>) và dịch các phần tử lớn hơn nó sang phải bằng con trỏ <code>walker</code> để chèn <code>temp</code> vào đúng vị trí trong dãy đã sắp.</p>',
    notes: [
      'Độ hiệu quả (Sort efficiency) = <b>số phép so sánh (comparisons) + số phép dời chỗ (moves)</b>.',
      'Điều kiện dừng vòng lặp trong: <code>walker &gt;= 0 &amp;&amp; temp.key &lt; data[walker].key</code> (dấu <code>&lt;</code> nghiêm ngặt giúp thuật toán <b>ổn định - stable</b>).',
    ],
    ops: [{
      id: 'sort',
      label: 'Sắp xếp (InsertionSort)',
      args: [
        { id: 'arr', label: 'Mảng', type: 'array', value: DEFAULT_ARR },
        { id: 'bars', label: 'Dạng cột', type: 'checkbox', value: true },
      ],
      code: {
        cpp: `void insertionSort(int data[], int count) {
    if (count <= 1) return;                     @@init
    int current = 1;                            @@init
    while (current < count) {                   @@outer
        int temp = data[current];               @@pick
        int walker = current - 1;               @@pick
        while (walker >= 0 && temp < data[walker]) { @@cmp
            data[walker + 1] = data[walker];    @@shift
            walker = walker - 1;                @@shift
        }
        data[walker + 1] = temp;                @@insert
        current = current + 1;                  @@next
    }
}`,
        java: `static void insertionSort(int[] data) {
    int count = data.length;
    if (count <= 1) return;                     @@init
    int current = 1;                            @@init
    while (current < count) {                   @@outer
        int temp = data[current];               @@pick
        int walker = current - 1;               @@pick
        while (walker >= 0 && temp < data[walker]) { @@cmp
            data[walker + 1] = data[walker];    @@shift
            walker = walker - 1;                @@shift
        }
        data[walker + 1] = temp;                @@insert
        current = current + 1;                  @@next
    }
}`,
        python: `def insertion_sort(data):
    count = len(data)
    if count <= 1: return                       @@init
    current = 1                                 @@init
    while current < count:                      @@outer
        temp = data[current]                    @@pick
        walker = current - 1                    @@pick
        while walker >= 0 and temp < data[walker]: @@cmp
            data[walker + 1] = data[walker]     @@shift
            walker -= 1                         @@shift
        data[walker + 1] = temp                 @@insert
        current += 1                            @@next`,
        pseudo: `Algorithm InsertionSort()
if count > 1 then                               @@init
    current = 1                                 @@init
    while current < count do                    @@outer
        temp = data[current]                    @@pick
        walker = current - 1                    @@pick
        while walker >= 0 AND temp.key < data[walker].key do @@cmp
            data[walker+1] = data[walker]       @@shift
            walker = walker - 1                 @@shift
        end
        data[walker+1] = temp                   @@insert
        current = current + 1                   @@next
    end
end
End InsertionSort`,
      },
      run({ arr, bars }) {
        const a = arr.slice();
        const ids = makeIds(a);
        const n = a.length;
        const R = new DSA.Recorder();
        let comps = 0, moves = 0;

        const snap = (hl, ptrs, ranges, note) => [{
          kind: 'array', key: 'arr', title: 'data[0..' + (n - 1) + ']',
          values: a, ids, bars, hl, pointers: ptrs, ranges, note,
        }];

        R.step({
          line: 'init',
          msg: 'Khởi tạo: phần tử <code>data[0] = ' + a[0] + '</code> coi như dãy con đã sắp ban đầu.',
          vars: { count: n, current: 1, comparisons: comps, moves },
          panels: snap({ 0: 'sorted' }, [{ i: 1, label: 'current' }], [{ from: 0, to: 0, label: 'sorted', hl: 'sorted' }]),
        });

        for (let current = 1; current < n; current++) {
          const temp = a[current];
          const tempId = ids[current];
          let walker = current - 1;
          moves++;
          const baseHl = {};
          for (let k = 0; k < current; k++) baseHl[k] = 'sorted';
          baseHl[current] = 'pivot';

          R.step({
            line: 'pick',
            msg: 'Bước <code>current = ' + current + '</code>: lấy <code>temp = data[' + current + '] = ' + temp + '</code>, đặt <code>walker = ' + walker + '</code>.',
            vars: { current, walker, temp, comparisons: comps, moves },
            panels: snap(baseHl, [{ i: current, label: 'current', hl: 'pivot' }, { i: walker, label: 'walker', hl: 'compare' }], [{ from: 0, to: current - 1, label: 'sorted' }]),
          });

          while (walker >= 0) {
            comps++;
            const cmpHl = {};
            for (let k = 0; k <= current; k++) cmpHl[k] = 'sorted';
            cmpHl[walker] = 'compare';
            cmpHl[walker + 1] = 'pivot';
            const less = temp < a[walker];
            R.step({
              line: 'cmp',
              msg: 'So sánh <code>temp (' + temp + ') &lt; data[' + walker + '] (' + a[walker] + ')</code> → <b>' + (less ? 'Đúng' : 'Sai') + '</b>.',
              vars: { current, walker, temp, 'data[walker]': a[walker], comparisons: comps, moves },
              panels: snap(cmpHl, [{ i: walker, label: 'walker', hl: 'compare' }, { i: walker + 1, label: 'hole', hl: 'pivot' }]),
            });
            if (!less) break;
            a[walker + 1] = a[walker];
            ids[walker + 1] = ids[walker];
            a[walker] = temp;
            ids[walker] = tempId;
            moves++;
            const shHl = {};
            for (let k = 0; k <= current; k++) shHl[k] = 'sorted';
            shHl[walker + 1] = 'swap';
            shHl[walker] = 'pivot';
            walker--;
            R.step({
              line: 'shift',
              msg: 'Dời <code>data[' + (walker + 1) + ']</code> sang <code>data[' + (walker + 2) + ']</code>, lùi <code>walker = ' + walker + '</code>.',
              vars: { current, walker, temp, comparisons: comps, moves },
              panels: snap(shHl, [{ i: walker, label: 'walker' }, { i: walker + 1, label: 'temp', hl: 'pivot' }]),
            });
          }

          a[walker + 1] = temp;
          ids[walker + 1] = tempId;
          moves++;
          const insHl = {};
          for (let k = 0; k <= current; k++) insHl[k] = 'sorted';
          insHl[walker + 1] = 'found';
          R.step({
            line: 'insert',
            msg: 'Chèn <code>temp = ' + temp + '</code> vào <code>data[' + (walker + 1) + ']</code>.',
            vars: { current, 'walker+1': walker + 1, temp, comparisons: comps, moves },
            panels: snap(insHl, [{ i: walker + 1, label: 'inserted', hl: 'found' }], [{ from: 0, to: current, label: 'sorted [0..' + current + ']' }]),
          });
        }

        const doneHl = {};
        for (let k = 0; k < n; k++) doneHl[k] = 'sorted';
        R.step({
          line: 'next',
          msg: 'Hoàn tất Straight Insertion Sort! Tổng so sánh = <b>' + comps + '</b>, tổng dời chỗ = <b>' + moves + '</b>.',
          vars: { count: n, comparisons: comps, moves, efficiency: comps + moves },
          panels: snap(doneHl, [], [{ from: 0, to: n - 1, label: 'Đã sắp xếp' }]),
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 2. Shell Sort (Sorting.pdf p.18-27)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'shell-sort',
    chapter: 'sorting',
    name: 'Shell Sort',
    short: 'O(n^1.25)',
    complexity: [
      ['Empirical', 'O(n^1.25)'],
      ['Worst (Knuth)', 'O(n^(3/2))'],
      ['Space', 'O(1)'],
      ['Ổn định', 'Không (Unstable)'],
    ],
    description:
      '<p>Do Donald L. Shell đề xuất (1959), còn gọi là <b>diminishing-increment sort</b>. Danh sách <code>N</code> phần tử được chia thành <code>K</code> phân đoạn (segments) cách nhau bước nhảy <code>K</code> (increment).</p>' +
      '<p>Ở mỗi vòng lặp với bước nhảy <code>K</code>, gọi <code>SortSegment(segment, k)</code> (chính là Insertion Sort với bước nhảy <code>K</code>) cho từng <code>segment</code> từ <code>0</code> đến <code>K − 1</code>. Sau đó giảm <code>K</code> cho tới khi <code>K = 1</code> ở lượt cuối.</p>',
    notes: [
      'Các giá trị <code>K</code> không nên là bội số của nhau. Lượt cuối bắt buộc <code>K = 1</code>.',
      'Hai dãy bước nhảy thông dụng: <b>Knuth</b> <code>k<sub>i−1</sub> = 3k<sub>i</sub> + 1 ⇒ 1, 4, 13, 40…</code> và <b>Hibbard</b> <code>k<sub>i−1</sub> = 2k<sub>i</sub> + 1 ⇒ 1, 3, 7, 15…</code>',
    ],
    ops: [{
      id: 'sort',
      label: 'Sắp xếp (ShellSort)',
      args: [
        { id: 'arr', label: 'Mảng', type: 'array', value: '77 62 14 9 30 21 80 25 70 55' },
        {
          id: 'seq', label: 'Dãy bước nhảy K', type: 'select', value: 'knuth',
          options: [
            { value: 'knuth', label: '3k + 1 (1, 4, 13, ...)' },
            { value: 'hibbard', label: '2k + 1 (1, 3, 7, 15, ...)' },
            { value: 'half', label: 'N/2, N/4, ..., 1' },
          ],
        },
        { id: 'bars', label: 'Dạng cột', type: 'checkbox', value: true },
      ],
      code: {
        cpp: `void sortSegment(int data[], int count, int segment, int k) {
    for (int current = segment + k; current < count; current += k) { @@segLoop
        int temp = data[current];                                    @@pick
        int walker = current - k;                                    @@pick
        while (walker >= 0 && temp < data[walker]) {                 @@cmp
            data[walker + k] = data[walker];                         @@shift
            walker -= k;                                             @@shift
        }
        data[walker + k] = temp;                                     @@insert
    }
}
void shellSort(int data[], int count) {
    int k = 1; while (3 * k + 1 < count) k = 3 * k + 1;              @@initK
    while (k >= 1) {                                                 @@kLoop
        for (int segment = 0; segment < k; ++segment)                @@segCall
            sortSegment(data, count, segment, k);                    @@segCall
        k = (k - 1) / 3;                                             @@nextK
    }
}`,
        java: `static void sortSegment(int[] data, int segment, int k) {
    for (int current = segment + k; current < data.length; current += k) { @@segLoop
        int temp = data[current];                                    @@pick
        int walker = current - k;                                    @@pick
        while (walker >= 0 && temp < data[walker]) {                 @@cmp
            data[walker + k] = data[walker];                         @@shift
            walker -= k;                                             @@shift
        }
        data[walker + k] = temp;                                     @@insert
    }
}
static void shellSort(int[] data) {
    int k = 1; while (3 * k + 1 < data.length) k = 3 * k + 1;        @@initK
    while (k >= 1) {                                                 @@kLoop
        for (int seg = 0; seg < k; seg++) sortSegment(data, seg, k); @@segCall
        k = (k - 1) / 3;                                             @@nextK
    }
}`,
        python: `def sort_segment(data, segment, k):
    current = segment + k
    while current < len(data):                       @@segLoop
        temp = data[current]                         @@pick
        walker = current - k                         @@pick
        while walker >= 0 and temp < data[walker]:   @@cmp
            data[walker + k] = data[walker]          @@shift
            walker -= k                              @@shift
        data[walker + k] = temp                      @@insert
        current += k

def shell_sort(data):
    k = 1
    while 3 * k + 1 < len(data): k = 3 * k + 1       @@initK
    while k >= 1:                                    @@kLoop
        for seg in range(k):                         @@segCall
            sort_segment(data, seg, k)               @@segCall
        k = (k - 1) // 3                             @@nextK`,
        pseudo: `Algorithm ShellSort()
k = first_incremental_value                     @@initK
while k >= 1 do                                 @@kLoop
    segment = 0
    while segment < k do                        @@segCall
        SortSegment(segment, k)                 @@segCall
        segment = segment + 1
    end
    k = next_incremental_value                  @@nextK
end
End ShellSort

Algorithm SortSegment(val segment <int>, val k <int>)
current = segment + k                           @@segLoop
while current < count do                        @@segLoop
    temp = data[current]                        @@pick
    walker = current - k                        @@pick
    while walker >= 0 AND temp.key < data[walker].key do @@cmp
        data[walker + k] = data[walker]         @@shift
        walker = walker - k                     @@shift
    end
    data[walker + k] = temp                     @@insert
    current = current + k
end
End SortSegment`,
      },
      run({ arr, seq, bars }) {
        const a = arr.slice();
        const ids = makeIds(a);
        const n = a.length;
        const R = new DSA.Recorder();
        let comps = 0, moves = 0;

        // Build increment list
        const ks = [];
        if (seq === 'hibbard') {
          let k = 1; while (k < n) { ks.unshift(k); k = 2 * k + 1; }
          if (ks.length > 1 && ks[0] >= n) ks.shift();
        } else if (seq === 'half') {
          for (let k = Math.floor(n / 2); k >= 1; k = Math.floor(k / 2)) ks.push(k);
        } else {
          let k = 1; while (k < n) { ks.unshift(k); k = 3 * k + 1; }
          if (ks.length > 1 && ks[0] >= n) ks.shift();
        }
        if (!ks.length) ks.push(1);

        const segHighlight = (seg, k, extra) => {
          const h = {};
          for (let i = 0; i < n; i++) h[i] = (i % k === seg) ? 'active' : 'dim';
          Object.assign(h, extra || {});
          return h;
        };

        R.step({
          line: 'initK',
          msg: 'Chuỗi bước nhảy <code>K = [' + ks.join(', ') + ']</code>.',
          vars: { count: n, increments: ks.join(', '), comparisons: 0, moves: 0 },
          panels: [{ kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars }],
        });

        for (const k of ks) {
          R.step({
            line: 'kLoop',
            msg: 'Bắt đầu lượt với bước nhảy <code>k = ' + k + '</code> (chia mảng thành ' + k + ' phân đoạn).',
            vars: { k, comparisons: comps, moves },
            panels: [{ kind: 'array', key: 'a', title: 'k = ' + k, values: a, ids, bars }],
          });

          for (let seg = 0; seg < k; seg++) {
            const indices = [];
            for (let i = seg; i < n; i += k) indices.push(i);
            if (indices.length <= 1) continue;
            R.step({
              line: 'segCall',
              msg: 'Gọi <code>SortSegment(segment = ' + seg + ', k = ' + k + ')</code> trên các vị trí <code>[' + indices.join(', ') + ']</code>.',
              vars: { k, segment: seg, indices: indices.join(','), comparisons: comps, moves },
              panels: [{ kind: 'array', key: 'a', title: 'k = ' + k + ' · segment ' + seg, values: a, ids, bars, hl: segHighlight(seg, k) }],
            });

            for (let current = seg + k; current < n; current += k) {
              const temp = a[current];
              const tempId = ids[current];
              let walker = current - k;
              moves++;
              R.step({
                line: 'pick',
                msg: 'Xét <code>current = ' + current + '</code> (<code>temp = ' + temp + '</code>), <code>walker = ' + walker + '</code> (bước nhảy <code>k = ' + k + '</code>).',
                vars: { k, segment: seg, current, walker, temp, comparisons: comps, moves },
                panels: [{
                  kind: 'array', key: 'a', title: 'k = ' + k + ' · segment ' + seg,
                  values: a, ids, bars,
                  hl: segHighlight(seg, k, { [current]: 'pivot', [walker]: 'compare' }),
                  pointers: [{ i: current, label: 'current', hl: 'pivot' }, { i: walker, label: 'walker', hl: 'compare' }],
                }],
              });

              while (walker >= 0) {
                comps++;
                const less = temp < a[walker];
                R.step({
                  line: 'cmp',
                  msg: 'So sánh <code>temp (' + temp + ') &lt; data[' + walker + '] (' + a[walker] + ')</code> → <b>' + (less ? 'Đúng' : 'Sai') + '</b>.',
                  vars: { k, segment: seg, current, walker, temp, comparisons: comps, moves },
                  panels: [{
                    kind: 'array', key: 'a', title: 'k = ' + k + ' · segment ' + seg,
                    values: a, ids, bars,
                    hl: segHighlight(seg, k, { [walker]: 'compare', [walker + k]: 'pivot' }),
                    pointers: [{ i: walker, label: 'walker', hl: 'compare' }, { i: walker + k, label: 'walker+k', hl: 'pivot' }],
                  }],
                });
                if (!less) break;
                a[walker + k] = a[walker]; ids[walker + k] = ids[walker];
                a[walker] = temp; ids[walker] = tempId;
                moves++;
                walker -= k;
                R.step({
                  line: 'shift',
                  msg: 'Dời <code>data[' + (walker + k) + ']</code> sang <code>data[' + (walker + 2 * k) + ']</code>; lùi <code>walker = ' + walker + '</code>.',
                  vars: { k, segment: seg, current, walker, temp, comparisons: comps, moves },
                  panels: [{
                    kind: 'array', key: 'a', title: 'k = ' + k + ' · segment ' + seg,
                    values: a, ids, bars,
                    hl: segHighlight(seg, k, { [walker + k]: 'pivot', [walker + 2 * k]: 'swap' }),
                    pointers: [{ i: walker + k, label: 'temp', hl: 'pivot' }],
                  }],
                });
              }
              a[walker + k] = temp; ids[walker + k] = tempId;
              moves++;
              R.step({
                line: 'insert',
                msg: 'Đặt <code>temp = ' + temp + '</code> vào <code>data[' + (walker + k) + ']</code>.',
                vars: { k, segment: seg, 'walker+k': walker + k, temp, comparisons: comps, moves },
                panels: [{
                  kind: 'array', key: 'a', title: 'k = ' + k + ' · segment ' + seg,
                  values: a, ids, bars,
                  hl: segHighlight(seg, k, { [walker + k]: 'found' }),
                  pointers: [{ i: walker + k, label: 'inserted', hl: 'found' }],
                }],
              });
            }
          }
        }

        const doneHl = {}; for (let i = 0; i < n; i++) doneHl[i] = 'sorted';
        R.step({
          line: 'nextK',
          msg: 'Hoàn tất Shell Sort! Tổng so sánh = <b>' + comps + '</b>, tổng dời chỗ = <b>' + moves + '</b>.',
          vars: { comparisons: comps, moves, efficiency: comps + moves },
          panels: [{ kind: 'array', key: 'a', title: 'Hoàn tất', values: a, ids, bars, hl: doneHl }],
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 3. Straight Selection Sort (Sorting.pdf p.28-38)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'selection-sort',
    chapter: 'sorting',
    name: 'Straight Selection Sort',
    short: 'O(n²)',
    complexity: [
      ['Best / Avg / Worst', 'O(n²)'],
      ['Số phép so sánh', 'n(n-1)/2'],
      ['Số phép hoán đổi', 'Tối đa n - 1'],
      ['Ổn định', 'Không (Unstable)'],
    ],
    description:
      '<p>Danh sách được chia làm 2 phần: <b>sorted</b> (bên trái) và <b>unsorted</b> (bên phải).</p>' +
      '<p>Ở mỗi bước <code>current</code> (từ <code>0</code> đến <code>count - 2</code>), dùng con trỏ <code>walker</code> quét hết dãy chưa sắp để tìm vị trí <code>smallest</code> có khóa nhỏ nhất, sau đó hoán đổi <code>swap(current, smallest)</code>.</p>',
    notes: [
      'Số phép so sánh luôn cố định là <code>n(n − 1)/2 = O(n²)</code> bất kể dữ liệu đầu vào.',
      'Ưu điểm: số lần hoán đổi (swap) rất ít, tối đa <code>n − 1</code> lần.',
    ],
    ops: [{
      id: 'sort',
      label: 'Sắp xếp (SelectionSort)',
      args: [
        { id: 'arr', label: 'Mảng', type: 'array', value: DEFAULT_ARR },
        { id: 'bars', label: 'Dạng cột', type: 'checkbox', value: true },
      ],
      code: {
        cpp: `void selectionSort(int data[], int count) {
    int current = 0;                                @@init
    while (current < count - 1) {                   @@outer
        int smallest = current;                     @@initMin
        int walker = current + 1;                   @@initMin
        while (walker < count) {                    @@inner
            if (data[walker] < data[smallest])      @@cmp
                smallest = walker;                  @@newMin
            walker = walker + 1;                    @@walkNext
        }
        std::swap(data[current], data[smallest]);   @@swap
        current = current + 1;                      @@next
    }
}`,
        java: `static void selectionSort(int[] data) {
    int count = data.length, current = 0;           @@init
    while (current < count - 1) {                   @@outer
        int smallest = current, walker = current + 1; @@initMin
        while (walker < count) {                    @@inner
            if (data[walker] < data[smallest])      @@cmp
                smallest = walker;                  @@newMin
            walker++;                               @@walkNext
        }
        int t = data[current]; data[current] = data[smallest]; data[smallest] = t; @@swap
        current++;                                  @@next
    }
}`,
        python: `def selection_sort(data):
    count = len(data)
    current = 0                                     @@init
    while current < count - 1:                      @@outer
        smallest = current                          @@initMin
        walker = current + 1                        @@initMin
        while walker < count:                       @@inner
            if data[walker] < data[smallest]:       @@cmp
                smallest = walker                   @@newMin
            walker += 1                             @@walkNext
        data[current], data[smallest] = data[smallest], data[current] @@swap
        current += 1                                @@next`,
        pseudo: `Algorithm SelectionSort()
current = 0                                         @@init
while current < count - 1 do                        @@outer
    smallest = current                              @@initMin
    walker = current + 1                            @@initMin
    while walker < count do                         @@inner
        if data[walker].key < data[smallest].key then @@cmp
            smallest = walker                       @@newMin
        end
        walker = walker + 1                         @@walkNext
    end
    swap(current, smallest)                         @@swap
    current = current + 1                           @@next
end
End SelectionSort`,
      },
      run({ arr, bars }) {
        const a = arr.slice();
        const ids = makeIds(a);
        const n = a.length;
        const R = new DSA.Recorder();
        let comps = 0, swaps = 0;

        for (let current = 0; current < n - 1; current++) {
          let smallest = current;
          const baseHl = (extra) => {
            const h = {};
            for (let k = 0; k < current; k++) h[k] = 'sorted';
            h[current] = 'active';
            h[smallest] = 'min';
            return Object.assign(h, extra || {});
          };

          R.step({
            line: 'initMin',
            msg: 'Lượt <code>current = ' + current + '</code>: đặt <code>smallest = ' + current + '</code> (giá trị <code>' + a[smallest] + '</code>).',
            vars: { current, smallest, 'data[smallest]': a[smallest], comparisons: comps, swaps },
            panels: [{
              kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars,
              hl: baseHl(),
              pointers: [{ i: current, label: 'current', hl: 'active' }, { i: smallest, label: 'smallest', hl: 'min' }],
            }],
          });

          for (let walker = current + 1; walker < n; walker++) {
            comps++;
            const less = a[walker] < a[smallest];
            R.step({
              line: 'cmp',
              msg: 'So sánh <code>data[walker=' + walker + '] (' + a[walker] + ') &lt; data[smallest=' + smallest + '] (' + a[smallest] + ')</code> → <b>' + (less ? 'Đúng' : 'Sai') + '</b>.',
              vars: { current, walker, smallest, 'data[smallest]': a[smallest], comparisons: comps, swaps },
              panels: [{
                kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars,
                hl: baseHl({ [walker]: 'compare' }),
                pointers: [{ i: current, label: 'current', hl: 'active' }, { i: smallest, label: 'smallest', hl: 'min' }, { i: walker, label: 'walker', hl: 'compare' }],
              }],
            });
            if (less) {
              smallest = walker;
              R.step({
                line: 'newMin',
                msg: 'Cập nhật <code>smallest = ' + smallest + '</code> (giá trị mới <code>' + a[smallest] + '</code>).',
                vars: { current, walker, smallest, 'data[smallest]': a[smallest], comparisons: comps, swaps },
                panels: [{
                  kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars,
                  hl: baseHl(),
                  pointers: [{ i: current, label: 'current', hl: 'active' }, { i: smallest, label: 'smallest', hl: 'min' }],
                }],
              });
            }
          }

          if (smallest !== current) {
            const t = a[current]; a[current] = a[smallest]; a[smallest] = t;
            const ti = ids[current]; ids[current] = ids[smallest]; ids[smallest] = ti;
            swaps++;
          }
          const swHl = {};
          for (let k = 0; k <= current; k++) swHl[k] = 'sorted';
          if (smallest !== current) swHl[smallest] = 'swap';
          R.step({
            line: 'swap',
            msg: 'Hoán đổi <code>swap(current=' + current + ', smallest=' + smallest + ')</code> → <code>data[' + current + '] = ' + a[current] + '</code> đã cố định.',
            vars: { current, smallest, comparisons: comps, swaps },
            panels: [{
              kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars,
              hl: swHl,
              pointers: [{ i: current, label: 'sorted', hl: 'sorted' }],
              ranges: [{ from: 0, to: current, label: 'sorted' }],
            }],
          });
        }

        const doneHl = {}; for (let i = 0; i < n; i++) doneHl[i] = 'sorted';
        R.step({
          line: 'next',
          msg: 'Hoàn tất Straight Selection Sort! Tổng so sánh = <b>' + comps + '</b>, tổng hoán đổi = <b>' + swaps + '</b>.',
          vars: { comparisons: comps, swaps },
          panels: [{ kind: 'array', key: 'a', title: 'Hoàn tất', values: a, ids, bars, hl: doneHl }],
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 4. Bubble Sort (Sorting.pdf p.40-45)
   * Note: Slide version walks from count-1 down to current+1, bubbling
   * the smallest element to `current`, and uses `flag` for early exit.
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'bubble-sort',
    chapter: 'sorting',
    name: 'Bubble Sort (Exchange Sort)',
    short: 'O(n²)',
    complexity: [
      ['Best (đã sắp)', 'O(n) nhờ biến cờ flag'],
      ['Average / Worst', 'f(n) = n(n+1)/2 = O(n²)'],
      ['Space', 'O(1)'],
      ['Ổn định', 'Có (Stable)'],
    ],
    description:
      '<p>Ở mỗi lượt <code>current</code>, con trỏ <code>walker</code> chạy ngược từ <code>count - 1</code> về <code>current + 1</code>, so sánh <code>data[walker]</code> với <code>data[walker - 1]</code> để đẩy ("nổi bọt") phần tử nhỏ nhất về đầu dãy chưa sắp (vị trí <code>current</code>).</p>' +
      '<p>Biến <code>flag</code> kiểm tra xem trong lượt có phép hoán đổi nào không; nếu <code>flag = true</code> (không có hoán đổi) thì mảng đã được sắp xếp xong và dừng sớm.</p>',
    notes: [
      'Chú ý chiều chạy của <code>walker</code> trong giáo trình HCMUT: từ <code>count - 1</code> giảm về <code>current + 1</code> (phần tử nhỏ nhất nổi về bên trái).',
      'Nếu không có hoán đổi nào trong cả 1 lượt thì <code>flag = True</code> → dừng ngay vòng lặp ngoài.',
    ],
    ops: [{
      id: 'sort',
      label: 'Sắp xếp (BubbleSort)',
      args: [
        { id: 'arr', label: 'Mảng', type: 'array', value: '42 23 74 11 65 58 94 36' },
        { id: 'bars', label: 'Dạng cột', type: 'checkbox', value: true },
      ],
      code: {
        cpp: `void bubbleSort(int data[], int count) {
    int current = 0;                                @@init
    bool flag = false;                              @@init
    while (current < count && flag == false) {      @@outer
        int walker = count - 1;                     @@initWalk
        flag = true;                                @@initWalk
        while (walker > current) {                  @@inner
            if (data[walker] < data[walker - 1]) {  @@cmp
                flag = false;                       @@swap
                std::swap(data[walker], data[walker - 1]); @@swap
            }
            walker = walker - 1;                    @@decWalk
        }
        current = current + 1;                      @@next
    }
}`,
        java: `static void bubbleSort(int[] data) {
    int count = data.length, current = 0;           @@init
    boolean flag = false;                           @@init
    while (current < count && !flag) {              @@outer
        int walker = count - 1;                     @@initWalk
        flag = true;                                @@initWalk
        while (walker > current) {                  @@inner
            if (data[walker] < data[walker - 1]) {  @@cmp
                flag = false;                       @@swap
                int t = data[walker]; data[walker] = data[walker - 1]; data[walker - 1] = t; @@swap
            }
            walker--;                               @@decWalk
        }
        current++;                                  @@next
    }
}`,
        python: `def bubble_sort(data):
    count = len(data)
    current = 0                                     @@init
    flag = False                                    @@init
    while current < count and not flag:             @@outer
        walker = count - 1                          @@initWalk
        flag = True                                 @@initWalk
        while walker > current:                     @@inner
            if data[walker] < data[walker - 1]:     @@cmp
                flag = False                        @@swap
                data[walker], data[walker - 1] = data[walker - 1], data[walker] @@swap
            walker -= 1                             @@decWalk
        current += 1                                @@next`,
        pseudo: `Algorithm BubbleSort()
current = 0                                         @@init
flag = False                                        @@init
while current < count AND flag = False do           @@outer
    walker = count - 1                              @@initWalk
    flag = True                                     @@initWalk
    while walker > current do                       @@inner
        if data[walker].key < data[walker-1].key then @@cmp
            flag = False                            @@swap
            swap(walker, walker - 1)                @@swap
        end
        walker = walker - 1                         @@decWalk
    end
    current = current + 1                           @@next
end
End BubbleSort`,
      },
      run({ arr, bars }) {
        const a = arr.slice();
        const ids = makeIds(a);
        const n = a.length;
        const R = new DSA.Recorder();
        let comps = 0, swaps = 0;
        let current = 0, flag = false;

        R.step({
          line: 'init',
          msg: 'Khởi tạo <code>current = 0</code>, <code>flag = false</code>.',
          vars: { current, flag, comparisons: comps, swaps },
          panels: [{ kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars }],
        });

        while (current < n && !flag) {
          let walker = n - 1;
          flag = true;
          const baseHl = (extra) => {
            const h = {};
            for (let k = 0; k < current; k++) h[k] = 'sorted';
            return Object.assign(h, extra || {});
          };

          R.step({
            line: 'initWalk',
            msg: 'Lượt <code>current = ' + current + '</code>: đặt <code>walker = ' + walker + '</code>, <code>flag = true</code>.',
            vars: { current, walker, flag, comparisons: comps, swaps },
            panels: [{
              kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars,
              hl: baseHl({ [walker]: 'active' }),
              pointers: [{ i: current, label: 'current' }, { i: walker, label: 'walker', hl: 'active' }],
            }],
          });

          while (walker > current) {
            comps++;
            const less = a[walker] < a[walker - 1];
            R.step({
              line: 'cmp',
              msg: 'So sánh <code>data[' + walker + '] (' + a[walker] + ') &lt; data[' + (walker - 1) + '] (' + a[walker - 1] + ')</code> → <b>' + (less ? 'Đúng' : 'Sai') + '</b>.',
              vars: { current, walker, flag, comparisons: comps, swaps },
              panels: [{
                kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars,
                hl: baseHl({ [walker]: 'compare', [walker - 1]: 'compare' }),
                pointers: [{ i: current, label: 'current' }, { i: walker, label: 'walker', hl: 'compare' }],
              }],
            });
            if (less) {
              flag = false;
              const t = a[walker]; a[walker] = a[walker - 1]; a[walker - 1] = t;
              const ti = ids[walker]; ids[walker] = ids[walker - 1]; ids[walker - 1] = ti;
              swaps++;
              R.step({
                line: 'swap',
                msg: 'Hoán đổi <code>swap(' + walker + ', ' + (walker - 1) + ')</code>, đặt <code>flag = false</code>.',
                vars: { current, walker, flag, comparisons: comps, swaps },
                panels: [{
                  kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars,
                  hl: baseHl({ [walker]: 'swap', [walker - 1]: 'swap' }),
                  pointers: [{ i: current, label: 'current' }, { i: walker - 1, label: 'walker-1', hl: 'swap' }],
                }],
              });
            }
            walker--;
          }
          current++;
          R.step({
            line: 'next',
            msg: flag
              ? 'Không có hoán đổi nào trong lượt này (<code>flag = true</code>) → dãy đã được sắp xếp, dừng sớm!'
              : 'Kết thúc lượt: <code>data[' + (current - 1) + '] = ' + a[current - 1] + '</code> đã nổi về đúng vị trí.',
            vars: { current, flag, comparisons: comps, swaps },
            panels: [{
              kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars,
              hl: baseHl(),
              ranges: [{ from: 0, to: current - 1, label: 'sorted' }],
            }],
          });
        }

        const doneHl = {}; for (let i = 0; i < n; i++) doneHl[i] = 'sorted';
        R.step({
          line: 'outer',
          msg: 'Hoàn tất Bubble Sort! Tổng so sánh = <b>' + comps + '</b>, tổng hoán đổi = <b>' + swaps + '</b>.',
          vars: { comparisons: comps, swaps },
          panels: [{ kind: 'array', key: 'a', title: 'Hoàn tất', values: a, ids, bars, hl: doneHl }],
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 5. Quick Sort (Sorting.pdf p.47-52)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'quick-sort',
    chapter: 'sorting',
    name: 'Quick Sort (Divide & Conquer)',
    short: 'O(n log n)',
    complexity: [
      ['Best / Average', 'O(n log₂ n)'],
      ['Worst (mảng đã sắp)', 'O(n²)'],
      ['Space (ngăn xếp đệ quy)', 'O(log n)'],
      ['Partition / Combine', 'Partition khó – Combine dễ'],
    ],
    description:
      '<p>Thuật toán Chia để trị (Divide-and-Conquer): chọn một phần tử chốt (<code>pivot</code>), phân hoạch (<code>Partition(left, right)</code>) đoạn <code>[left..right]</code> thành 2 phần: các phần tử <code>&lt; pivot</code> ở bên trái và <code>&gt;= pivot</code> ở bên phải <code>pivot_position</code>, rồi gọi đệ quy <code>recursiveQuickSort(left, pivot_position - 1)</code> và <code>recursiveQuickSort(pivot_position + 1, right)</code>.</p>',
    notes: [
      'So sánh: <b>Quick Sort</b> có bước <i>Partition khó, Combine dễ</i>; ngược lại <b>Merge Sort</b> có <i>Partition dễ, Combine khó</i>.',
    ],
    ops: [{
      id: 'sort',
      label: 'Sắp xếp (QuickSort)',
      args: [
        { id: 'arr', label: 'Mảng', type: 'array', value: '54 26 93 17 77 31 44 55 20' },
        { id: 'bars', label: 'Dạng cột', type: 'checkbox', value: true },
      ],
      code: {
        cpp: `int partition(int data[], int left, int right) {
    int pivot = data[left];                         @@pivot
    int i = left + 1, j = right;                    @@pivot
    while (i <= j) {                                @@partLoop
        while (i <= right && data[i] < pivot) i++;  @@scanL
        while (j > left && data[j] >= pivot) j--;   @@scanR
        if (i < j) std::swap(data[i++], data[j--]); @@swapIJ
    }
    std::swap(data[left], data[j]);                 @@placePivot
    return j;                                       @@placePivot
}
void recursiveQuickSort(int data[], int left, int right) {
    if (left < right) {                             @@base
        int pivot_position = partition(data, left, right); @@callPart
        recursiveQuickSort(data, left, pivot_position - 1);  @@recL
        recursiveQuickSort(data, pivot_position + 1, right); @@recR
    }
}`,
        java: `static int partition(int[] data, int left, int right) {
    int pivot = data[left], i = left + 1, j = right; @@pivot
    while (i <= j) {                                 @@partLoop
        while (i <= right && data[i] < pivot) i++;   @@scanL
        while (j > left && data[j] >= pivot) j--;    @@scanR
        if (i < j) { int t = data[i]; data[i++] = data[j]; data[j--] = t; } @@swapIJ
    }
    int t = data[left]; data[left] = data[j]; data[j] = t; @@placePivot
    return j;                                        @@placePivot
}
static void recursiveQuickSort(int[] data, int left, int right) {
    if (left < right) {                              @@base
        int pivot_position = partition(data, left, right); @@callPart
        recursiveQuickSort(data, left, pivot_position - 1);  @@recL
        recursiveQuickSort(data, pivot_position + 1, right); @@recR
    }
}`,
        python: `def partition(data, left, right):
    pivot = data[left]                              @@pivot
    i, j = left + 1, right                          @@pivot
    while i <= j:                                   @@partLoop
        while i <= right and data[i] < pivot: i += 1 @@scanL
        while j > left and data[j] >= pivot: j -= 1  @@scanR
        if i < j:
            data[i], data[j] = data[j], data[i]     @@swapIJ
            i += 1; j -= 1
    data[left], data[j] = data[j], data[left]       @@placePivot
    return j                                        @@placePivot

def recursive_quick_sort(data, left, right):
    if left < right:                                @@base
        pivot_pos = partition(data, left, right)    @@callPart
        recursive_quick_sort(data, left, pivot_pos - 1)  @@recL
        recursive_quick_sort(data, pivot_pos + 1, right) @@recR`,
        pseudo: `Algorithm QuickSort()
    recursiveQuickSort(0, count - 1)
End QuickSort

Algorithm recursiveQuickSort(val left <int>, val right <int>)
if left < right then                                @@base
    pivot_position = Partition(left, right)         @@callPart
    recursiveQuickSort(left, pivot_position - 1)    @@recL
    recursiveQuickSort(pivot_position + 1, right)   @@recR
end
End recursiveQuickSort`,
      },
      run({ arr, bars }) {
        const a = arr.slice();
        const ids = makeIds(a);
        const n = a.length;
        const fixed = new Set();
        const stack = [];
        const R = new DSA.Recorder();
        let comps = 0, swaps = 0;

        const snap = (extraHl, ptrs, ranges) => {
          const hl = {};
          fixed.forEach((idx) => { hl[idx] = 'sorted'; });
          Object.assign(hl, extraHl || {});
          return [
            { kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, ids, bars, hl, pointers: ptrs, ranges },
            { kind: 'list', key: 'st', title: 'Ngăn xếp gọi đệ quy (Call Stack)', style: 'stack', items: stack.map((s, i) => ({ label: s, hl: i === stack.length - 1 ? 'active' : '' })) },
          ];
        };

        function qsort(left, right) {
          stack.push('qsort(' + left + ',' + right + ')');
          if (left >= right) {
            if (left === right) fixed.add(left);
            R.step({
              line: 'base',
              msg: 'Đoạn <code>[' + left + '..' + right + ']</code> có ≤ 1 phần tử → dừng nhánh đệ quy.',
              vars: { left, right, comparisons: comps, swaps },
              panels: snap(left === right ? { [left]: 'sorted' } : {}, [], []),
            });
            stack.pop();
            return;
          }

          const pivot = a[left];
          let i = left + 1, j = right;
          const dimOutside = () => {
            const h = {};
            for (let k = 0; k < n; k++) if (k < left || k > right) h[k] = fixed.has(k) ? 'sorted' : 'dim';
            h[left] = 'pivot';
            return h;
          };

          R.step({
            line: 'pivot',
            msg: 'Phân hoạch <code>Partition(' + left + ', ' + right + ')</code>: chọn <code>pivot = data[' + left + '] = ' + pivot + '</code>, đặt <code>i = ' + i + '</code>, <code>j = ' + j + '</code>.',
            vars: { left, right, pivot, i, j, comparisons: comps, swaps },
            panels: snap(dimOutside(), [{ i: left, label: 'pivot', hl: 'pivot' }, { i, label: 'i', hl: 'active' }, { i: j, label: 'j', hl: 'active' }], [{ from: left, to: right, label: 'Partition[' + left + '..' + right + ']' }]),
          });

          while (i <= j) {
            while (i <= right) {
              comps++;
              if (a[i] < pivot) i++; else break;
            }
            while (j > left) {
              comps++;
              if (a[j] >= pivot) j--; else break;
            }
            R.step({
              line: ['scanL', 'scanR'],
              msg: 'Quét <code>i = ' + i + '</code>, <code>j = ' + j + '</code> (tìm <code>data[i] &gt;= pivot</code> và <code>data[j] &lt; pivot</code>).',
              vars: { left, right, pivot, i, j, comparisons: comps, swaps },
              panels: snap(Object.assign(dimOutside(), i <= right ? { [i]: 'compare' } : {}, j > left ? { [j]: 'compare' } : {}),
                [{ i: left, label: 'pivot', hl: 'pivot' }, { i: Math.min(i, n - 1), label: 'i', hl: 'compare' }, { i: j, label: 'j', hl: 'compare' }],
                [{ from: left, to: right, label: 'Partition[' + left + '..' + right + ']' }]),
            });
            if (i < j) {
              const t = a[i]; a[i] = a[j]; a[j] = t;
              const ti = ids[i]; ids[i] = ids[j]; ids[j] = ti;
              swaps++;
              R.step({
                line: 'swapIJ',
                msg: 'Vì <code>i &lt; j</code>, hoán đổi <code>data[' + i + '] ↔ data[' + j + ']</code>.',
                vars: { left, right, pivot, i, j, comparisons: comps, swaps },
                panels: snap(Object.assign(dimOutside(), { [i]: 'swap', [j]: 'swap' }),
                  [{ i, label: 'i', hl: 'swap' }, { i: j, label: 'j', hl: 'swap' }],
                  [{ from: left, to: right, label: 'Partition[' + left + '..' + right + ']' }]),
              });
              i++; j--;
            }
          }

          if (left !== j) {
            const t = a[left]; a[left] = a[j]; a[j] = t;
            const ti = ids[left]; ids[left] = ids[j]; ids[j] = ti;
            swaps++;
          }
          fixed.add(j);
          const pHl = dimOutside();
          pHl[j] = 'sorted';
          const rngs = [{ from: j, to: j, label: 'pivot', hl: 'pivot' }];
          if (left <= j - 1) rngs.push({ from: left, to: j - 1, label: '< pivot' });
          if (j + 1 <= right) rngs.push({ from: j + 1, to: right, label: '≥ pivot' });
          R.step({
            line: 'placePivot',
            msg: 'Đưa <code>pivot = ' + pivot + '</code> về <code>pivot_position = ' + j + '</code>. Bên trái <code>&lt; ' + pivot + '</code>, bên phải <code>&gt;= ' + pivot + '</code>.',
            vars: { left, right, pivot, pivot_position: j, comparisons: comps, swaps },
            panels: snap(pHl, [{ i: j, label: 'pivot_pos=' + j, hl: 'sorted' }], rngs),
          });

          qsort(left, j - 1);
          qsort(j + 1, right);
          stack.pop();
        }

        qsort(0, n - 1);
        const doneHl = {}; for (let i = 0; i < n; i++) doneHl[i] = 'sorted';
        R.step({
          line: 'base',
          msg: 'Hoàn tất Quick Sort! Tổng so sánh = <b>' + comps + '</b>, tổng hoán đổi = <b>' + swaps + '</b>.',
          vars: { comparisons: comps, swaps },
          panels: [{ kind: 'array', key: 'a', title: 'Hoàn tất', values: a, ids, bars, hl: doneHl }],
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 6. Merge Sort (Sorting.pdf p.54-59)
   * Both Linked List Merge Sort (Divide with midpoint/position + Merge)
   * and Contiguous Array Merge Sort.
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'merge-sort',
    chapter: 'sorting',
    name: 'Merge Sort (Linked List & Array)',
    short: 'O(n log n)',
    complexity: [
      ['Best / Avg / Worst', 'O(n log₂ n)'],
      ['Space (Linked List)', 'O(log n) ngăn xếp, nối con trỏ O(1)'],
      ['Space (Array)', 'O(n) mảng phụ'],
      ['Ổn định', 'Có (Stable)'],
    ],
    description:
      '<p>Merge Sort trên <b>danh sách liên kết (Linked List)</b> gồm 2 hàm chính:</p>' +
      '<ul><li><code>Divide(sublist, second_list)</code>: dùng 2 con trỏ <code>midpoint</code> (bước 1) và <code>position</code> (bước 2) để tìm trung điểm và cắt danh sách thành 2 nửa.</li>' +
      '<li><code>Merge(first, second)</code>: trộn 2 danh sách con đã sắp thành 1 danh sách bằng con trỏ <code>lastSorted</code>.</li></ul>' +
      '<p>Bạn có thể chọn xem cả hai phiên bản: <b>trên Linked List</b> và <b>trên Mảng (Array)</b>.</p>',
    ops: [
      {
        id: 'linked',
        label: 'Merge Sort trên Linked List',
        args: [
          { id: 'arr', label: 'Danh sách liên kết', type: 'array', value: '38 27 43 3 9 82 10' },
        ],
        code: {
          cpp: `void divide(Node* sublist, Node*& second_list) {
    Node* midpoint = sublist;                       @@divInit
    Node* position = sublist->link;                 @@divInit
    while (position != nullptr) {                   @@divLoop
        position = position->link;                  @@divStep
        if (position != nullptr) {                  @@divStep
            midpoint = midpoint->link;              @@divStep
            position = position->link;              @@divStep
        }
    }
    second_list = midpoint->link;                   @@divCut
    midpoint->link = nullptr;                       @@divCut
}
Node* merge(Node* first, Node* second) {
    Node combined; Node* lastSorted = &combined;    @@mInit
    while (first != nullptr && second != nullptr) { @@mLoop
        if (first->key <= second->key) {            @@mCmp
            lastSorted->link = first; lastSorted = first; first = first->link; @@mPick1
        } else {
            lastSorted->link = second; lastSorted = second; second = second->link; @@mPick2
        }
    }
    lastSorted->link = (first == nullptr) ? second : first; @@mRem
    return combined.link;                           @@mRet
}
void recursiveMergeSort(Node*& sublist) {
    if (sublist != nullptr && sublist->link != nullptr) { @@base
        Node* second_list = nullptr;
        divide(sublist, second_list);               @@callDiv
        recursiveMergeSort(sublist);                @@rec1
        recursiveMergeSort(second_list);            @@rec2
        sublist = merge(sublist, second_list);      @@callMerge
    }
}`,
          java: `static Node divide(Node sublist) {
    Node midpoint = sublist, position = sublist.link; @@divInit
    while (position != null) {                        @@divLoop
        position = position.link;                     @@divStep
        if (position != null) {                       @@divStep
            midpoint = midpoint.link;                 @@divStep
            position = position.link;                 @@divStep
        }
    }
    Node second = midpoint.link;                      @@divCut
    midpoint.link = null;                             @@divCut
    return second;
}
static Node merge(Node first, Node second) {
    Node combined = new Node(0), last = combined;     @@mInit
    while (first != null && second != null) {         @@mLoop
        if (first.key <= second.key) {                @@mCmp
            last.link = first; last = first; first = first.link; @@mPick1
        } else {
            last.link = second; last = second; second = second.link; @@mPick2
        }
    }
    last.link = (first == null) ? second : first;     @@mRem
    return combined.link;                             @@mRet
}`,
          python: `def divide(sublist):
    midpoint = sublist                              @@divInit
    position = sublist.link                         @@divInit
    while position is not None:                     @@divLoop
        position = position.link                    @@divStep
        if position is not None:                    @@divStep
            midpoint = midpoint.link                @@divStep
            position = position.link                @@divStep
    second_list = midpoint.link                     @@divCut
    midpoint.link = None                            @@divCut
    return second_list

def merge(first, second):
    combined = Node(0); last_sorted = combined      @@mInit
    while first and second:                         @@mLoop
        if first.key <= second.key:                 @@mCmp
            last_sorted.link = first; last_sorted = first; first = first.link @@mPick1
        else:
            last_sorted.link = second; last_sorted = second; second = second.link @@mPick2
    last_sorted.link = second if first is None else first @@mRem
    return combined.link                            @@mRet`,
          pseudo: `Algorithm recursiveMergeSort(ref sublist <pointer>)
if sublist is not NULL AND sublist->link is not NULL then @@base
    Divide(sublist, second_list)                    @@callDiv
    recursiveMergeSort(sublist)                     @@rec1
    recursiveMergeSort(second_list)                 @@rec2
    Merge(sublist, second_list)                     @@callMerge
end
End recursiveMergeSort

Algorithm Divide(val sublist <pointer>, ref second_list <pointer>)
midpoint = sublist; position = sublist->link        @@divInit
while position is not NULL do                       @@divLoop
    position = position->link                       @@divStep
    if position is not NULL then
        midpoint = midpoint->link; position = position->link @@divStep
    end
end
second_list = midpoint->link; midpoint->link = NULL @@divCut
End Divide

Algorithm Merge(ref first <pointer>, ref second <pointer>)
lastSorted = address of combined                    @@mInit
while first is not NULL AND second is not NULL do   @@mLoop
    if first->data.key <= second->data.key then     @@mCmp
        lastSorted->link = first; lastSorted = first; first = first->link @@mPick1
    else
        lastSorted->link = second; lastSorted = second; second = second->link @@mPick2
    end
end
if first is NULL then lastSorted->link = second else lastSorted->link = first @@mRem
first = combined.link                               @@mRet
End Merge`,
        },
        run({ arr }) {
          const R = new DSA.Recorder();
          const asItems = (list, hlMap) => list.map((v, i) => ({ label: v, hl: (hlMap && hlMap[i]) || '' }));

          function msort(list, depth) {
            if (list.length <= 1) return list.slice();
            // Simulate Divide with midpoint & position
            let mid = 0, pos = 1;
            R.step({
              line: 'divInit',
              msg: '<code>Divide</code> trên <code>[' + list.join(' → ') + ']</code>: khởi tạo <code>midpoint = idx 0 (' + list[0] + ')</code>, <code>position = idx 1 (' + list[1] + ')</code>.',
              vars: { depth, midpoint: list[mid], position: list[pos] },
              panels: [{ kind: 'list', key: 'sub', title: 'sublist (độ sâu ' + depth + ')', items: asItems(list, { [mid]: 'pivot', [pos]: 'active' }) }],
            });
            while (pos < list.length) {
              pos++;
              if (pos < list.length) { mid++; pos++; }
              R.step({
                line: 'divStep',
                msg: 'Di chuyển <code>midpoint → ' + list[mid] + '</code>, <code>position → ' + (pos < list.length ? list[pos] : 'NULL') + '</code>.',
                vars: { depth, midpoint: list[mid], position: pos < list.length ? list[pos] : 'NULL' },
                panels: [{ kind: 'list', key: 'sub', title: 'sublist (độ sâu ' + depth + ')', items: asItems(list, Object.assign({ [mid]: 'pivot' }, pos < list.length ? { [pos]: 'active' } : {})) }],
              });
            }
            const left = list.slice(0, mid + 1);
            const right = list.slice(mid + 1);
            R.step({
              line: 'divCut',
              msg: 'Cắt tại <code>midpoint (' + list[mid] + ')</code> → <code>sublist = [' + left.join(' → ') + ']</code> và <code>second_list = [' + right.join(' → ') + ']</code>.',
              vars: { depth, sublist: left.join(','), second_list: right.join(',') },
              panels: [
                { kind: 'list', key: 'l', title: 'sublist', half: true, items: asItems(left, {}) },
                { kind: 'list', key: 'r', title: 'second_list', half: true, items: asItems(right, {}) },
              ],
            });

            const sLeft = msort(left, depth + 1);
            const sRight = msort(right, depth + 1);

            // Merge
            const combined = [];
            let i = 0, j = 0;
            R.step({
              line: 'mInit',
              msg: '<code>Merge</code> hai danh sách đã sắp: <code>[' + sLeft.join(' → ') + ']</code> và <code>[' + sRight.join(' → ') + ']</code>.',
              vars: { depth, first: sLeft[0], second: sRight[0] },
              panels: [
                { kind: 'list', key: 'l', title: 'first', half: true, items: asItems(sLeft, { 0: 'compare' }) },
                { kind: 'list', key: 'r', title: 'second', half: true, items: asItems(sRight, { 0: 'compare' }) },
                { kind: 'list', key: 'c', title: 'combined (kết quả trộn)', items: [] },
              ],
            });

            while (i < sLeft.length && j < sRight.length) {
              const takeFirst = sLeft[i] <= sRight[j];
              if (takeFirst) combined.push(sLeft[i++]); else combined.push(sRight[j++]);
              R.step({
                line: takeFirst ? 'mPick1' : 'mPick2',
                msg: 'So sánh <code>' + (takeFirst ? sLeft[i - 1] + ' ≤ ' + sRight[j] : sLeft[i] + ' &gt; ' + sRight[j - 1]) + '</code> → nối <b>' + combined[combined.length - 1] + '</b> vào <code>lastSorted</code>.',
                vars: { first: i < sLeft.length ? sLeft[i] : 'NULL', second: j < sRight.length ? sRight[j] : 'NULL', lastSorted: combined[combined.length - 1] },
                panels: [
                  { kind: 'list', key: 'l', title: 'first', half: true, items: asItems(sLeft.slice(i), { 0: 'compare' }) },
                  { kind: 'list', key: 'r', title: 'second', half: true, items: asItems(sRight.slice(j), { 0: 'compare' }) },
                  { kind: 'list', key: 'c', title: 'combined', items: asItems(combined, { [combined.length - 1]: 'sorted' }) },
                ],
              });
            }
            while (i < sLeft.length) combined.push(sLeft[i++]);
            while (j < sRight.length) combined.push(sRight[j++]);
            const allSorted = {}; combined.forEach((_, k) => { allSorted[k] = 'sorted'; });
            R.step({
              line: 'mRem',
              msg: 'Nối phần còn lại → kết quả trộn: <code>[' + combined.join(' → ') + ']</code>.',
              vars: { combined: combined.join(' → ') },
              panels: [{ kind: 'list', key: 'c', title: 'combined (độ sâu ' + depth + ')', items: asItems(combined, allSorted) }],
            });
            return combined;
          }

          const res = msort(arr.slice(), 0);
          const allSorted = {}; res.forEach((_, k) => { allSorted[k] = 'sorted'; });
          R.step({
            line: 'mRet',
            msg: 'Hoàn tất Merge Sort trên Linked List: <code>[' + res.join(' → ') + ']</code>.',
            vars: { result: res.join(' → ') },
            panels: [{ kind: 'list', key: 'c', title: 'Danh sách liên kết sau khi sắp xếp', items: asItems(res, allSorted) }],
          });
          return R.steps;
        },
      },
      {
        id: 'array',
        label: 'Merge Sort trên Mảng (Array)',
        args: [
          { id: 'arr', label: 'Mảng', type: 'array', value: DEFAULT_ARR },
          { id: 'bars', label: 'Dạng cột', type: 'checkbox', value: true },
        ],
        code: {
          cpp: `void merge(int a[], int l, int m, int r) {
    std::vector<int> tmp;
    int i = l, j = m + 1;                           @@mInit
    while (i <= m && j <= r) {                      @@mLoop
        if (a[i] <= a[j]) tmp.push_back(a[i++]);    @@mPick
        else tmp.push_back(a[j++]);                 @@mPick
    }
    while (i <= m) tmp.push_back(a[i++]);           @@mRem
    while (j <= r) tmp.push_back(a[j++]);           @@mRem
    for (int k = l; k <= r; ++k) a[k] = tmp[k - l]; @@mCopy
}
void mergeSort(int a[], int l, int r) {
    if (l >= r) return;                             @@base
    int m = (l + r) / 2;                            @@split
    mergeSort(a, l, m);                             @@recL
    mergeSort(a, m + 1, r);                         @@recR
    merge(a, l, m, r);                              @@callMerge
}`,
          java: `static void mergeSort(int[] a, int l, int r) {
    if (l >= r) return;                             @@base
    int m = (l + r) / 2;                            @@split
    mergeSort(a, l, m);                             @@recL
    mergeSort(a, m + 1, r);                         @@recR
    int[] tmp = new int[r - l + 1];                 @@mInit
    int i = l, j = m + 1, k = 0;
    while (i <= m && j <= r)                        @@mLoop
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++]; @@mPick
    while (i <= m) tmp[k++] = a[i++];               @@mRem
    while (j <= r) tmp[k++] = a[j++];               @@mRem
    System.arraycopy(tmp, 0, a, l, tmp.length);     @@mCopy
}`,
          python: `def merge_sort(a, l, r):
    if l >= r: return                               @@base
    m = (l + r) // 2                                @@split
    merge_sort(a, l, m)                             @@recL
    merge_sort(a, m + 1, r)                         @@recR
    tmp, i, j = [], l, m + 1                        @@mInit
    while i <= m and j <= r:                        @@mLoop
        if a[i] <= a[j]: tmp.append(a[i]); i += 1   @@mPick
        else: tmp.append(a[j]); j += 1              @@mPick
    tmp.extend(a[i:m+1]); tmp.extend(a[j:r+1])      @@mRem
    a[l:r+1] = tmp                                  @@mCopy`,
          pseudo: `Algorithm DevideAndConquer(left, right)
if left < right then                                @@base
    mid = (left + right) / 2                        @@split
    DevideAndConquer(left, mid)                     @@recL
    DevideAndConquer(mid + 1, right)                @@recR
    Combine(left, mid, right)                       @@mCopy
end`,
        },
        run({ arr, bars }) {
          const a = arr.slice();
          const n = a.length;
          const R = new DSA.Recorder();
          let comps = 0;

          function msort(l, r) {
            if (l >= r) return;
            const m = (l + r) >> 1;
            const hlSplit = {};
            for (let k = 0; k < n; k++) hlSplit[k] = (k >= l && k <= r) ? (k <= m ? 'active' : 'pivot') : 'dim';
            R.step({
              line: 'split',
              msg: 'Chia đoạn <code>[' + l + '..' + r + ']</code> tại <code>m = ' + m + '</code> thành <code>[' + l + '..' + m + ']</code> và <code>[' + (m + 1) + '..' + r + ']</code>.',
              vars: { l, m, r, comparisons: comps },
              panels: [{
                kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, bars, hl: hlSplit,
                ranges: [{ from: l, to: m, label: 'left' }, { from: m + 1, to: r, label: 'right' }],
              }],
            });
            msort(l, m);
            msort(m + 1, r);

            const tmp = [];
            let i = l, j = m + 1;
            while (i <= m && j <= r) {
              comps++;
              if (a[i] <= a[j]) tmp.push(a[i++]); else tmp.push(a[j++]);
            }
            while (i <= m) tmp.push(a[i++]);
            while (j <= r) tmp.push(a[j++]);
            for (let k = l; k <= r; k++) a[k] = tmp[k - l];

            const hlM = {};
            for (let k = 0; k < n; k++) hlM[k] = (k >= l && k <= r) ? 'sorted' : 'dim';
            R.step({
              line: 'mCopy',
              msg: 'Trộn xong đoạn <code>[' + l + '..' + r + '] → [' + tmp.join(', ') + ']</code>.',
              vars: { l, m, r, comparisons: comps },
              panels: [{
                kind: 'array', key: 'a', title: 'data[0..' + (n - 1) + ']', values: a, bars, hl: hlM,
                ranges: [{ from: l, to: r, label: 'merged [' + l + '..' + r + ']' }],
              }],
            });
          }

          msort(0, n - 1);
          const doneHl = {}; for (let i = 0; i < n; i++) doneHl[i] = 'sorted';
          R.step({
            line: 'mCopy',
            msg: 'Hoàn tất Merge Sort! Tổng phép so sánh = <b>' + comps + '</b>.',
            vars: { comparisons: comps },
            panels: [{ kind: 'array', key: 'a', title: 'Hoàn tất', values: a, bars, hl: doneHl }],
          });
          return R.steps;
        },
      },
    ],
  });
})();
