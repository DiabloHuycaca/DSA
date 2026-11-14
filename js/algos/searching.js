/* =========================================================================
 * DSA Visualizer – searching.js
 * Slide: Search+Hash.pdf (trang 1–23)
 * 1. Linear Search (Sequential Search)
 * 2. Binary Search (Iterative & Recursive)
 * 3. Jump Search (block size m = √n)
 * 4. Interpolation Search (probe formula)
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  const FIB16 = '0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 610';

  /* ---------------------------------------------------------------------
   * 1. Linear Search (Search+Hash.pdf p.5-6)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'linear-search',
    chapter: 'searching',
    name: 'Linear Search (Sequential Search)',
    short: 'O(n)',
    complexity: [
      ['Best', 'O(1)'],
      ['Average', 'n / 2 = O(n)'],
      ['Worst', 'n = O(n)'],
      ['Yêu cầu mảng', 'Không cần sắp xếp'],
    ],
    description:
      '<p><b>Sequential Search (Linear Search)</b> duyệt tuần tự từ phần tử đầu tiên (trái sang phải) và so sánh từng phần tử với khóa <code>x</code>. Nếu khớp trả về chỉ số, nếu hết mảng không thấy trả về <code>-1</code>.</p>',
    ops: [{
      id: 'search',
      label: 'Tìm kiếm tuần tự',
      args: [
        { id: 'arr', label: 'Mảng', type: 'array', value: '10 20 80 30 60 50 110 100 130 170' },
        { id: 'x', label: 'Khóa x', type: 'number', value: 110 },
      ],
      code: {
        cpp: `int linearSearch(const int arr[], int n, int x) {
    for (int i = 0; i < n; ++i) {                   @@loop
        if (arr[i] == x)                            @@cmp
            return i;                               @@found
    }
    return -1;                                      @@notFound
}`,
        java: `static int linearSearch(int[] arr, int x) {
    for (int i = 0; i < arr.length; i++) {          @@loop
        if (arr[i] == x)                            @@cmp
            return i;                               @@found
    }
    return -1;                                      @@notFound
}`,
        python: `def linear_search(arr, x):
    for i in range(len(arr)):                       @@loop
        if arr[i] == x:                             @@cmp
            return i                                @@found
    return -1                                       @@notFound`,
        pseudo: `Algorithm LinearSearch(arr, n, x)
1. Start from the leftmost element i = 0            @@loop
2. Compare x with each element arr[i]               @@cmp
3. If x == arr[i], return i                         @@found
4. If x doesn't match any element, return -1        @@notFound`,
      },
      run({ arr, x }) {
        const R = new DSA.Recorder();
        const hl = {};
        for (let i = 0; i < arr.length; i++) {
          const cur = Object.assign({}, hl, { [i]: 'compare' });
          R.step({
            line: 'cmp',
            msg: 'Bước ' + (i + 1) + ': so sánh <code>arr[' + i + '] (' + arr[i] + ') == ' + x + '</code> → <b>' + (arr[i] === x ? 'Khớp!' : 'Không khớp') + '</b>.',
            vars: { i, 'arr[i]': arr[i], x, comparisons: i + 1 },
            panels: [{ kind: 'array', key: 'a', title: 'arr[0..' + (arr.length - 1) + ']', values: arr, hl: cur, pointers: [{ i, label: 'i=' + i, hl: 'compare' }] }],
          });
          if (arr[i] === x) {
            hl[i] = 'found';
            R.step({
              line: 'found',
              msg: 'Tìm thấy <code>x = ' + x + '</code> tại chỉ số <b>i = ' + i + '</b> sau ' + (i + 1) + ' phép so sánh.',
              vars: { result: i, comparisons: i + 1 },
              panels: [{ kind: 'array', key: 'a', title: 'Tìm thấy tại i = ' + i, values: arr, hl, pointers: [{ i, label: 'FOUND', hl: 'found' }] }],
            });
            return R.steps;
          }
          hl[i] = 'dim';
        }
        R.step({
          line: 'notFound',
          msg: 'Đã duyệt hết mảng nhưng không có <code>x = ' + x + '</code> → trả về <b>-1</b>.',
          vars: { result: -1, comparisons: arr.length },
          panels: [{ kind: 'array', key: 'a', title: 'Không tìm thấy (-1)', values: arr, hl }],
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 2. Binary Search (Search+Hash.pdf p.7-8)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'binary-search',
    chapter: 'searching',
    name: 'Binary Search (Iterative & Recursive)',
    short: 'O(log n)',
    complexity: [
      ['Best', 'O(1)'],
      ['Average / Worst', 'O(log₂ n)'],
      ['Space (Iterative)', 'O(1)'],
      ['Space (Recursive)', 'O(log₂ n)'],
      ['Yêu cầu', 'Mảng đã sắp xếp tăng dần'],
    ],
    description:
      '<p><b>Binary Search</b> thuộc nhóm <i>Interval Search</i> trên mảng đã sắp xếp: liên tục chia đôi khoảng tìm kiếm <code>[lo..hi]</code> tại <code>mid = (lo + hi) / 2</code>. Nếu <code>x &lt; arr[mid]</code> thu hẹp về nửa dưới <code>[lo..mid-1]</code>; nếu <code>x &gt; arr[mid]</code> thu hẹp về nửa trên <code>[mid+1..hi]</code>.</p>',
    notes: [
      'Với <code>n = 1,000,000</code> phần tử, Binary Search chỉ cần tối đa <code>⌈log₂(10⁶)⌉ = 20</code> phép so sánh (so với <code>500,000</code> trung bình của Sequential Search).',
    ],
    ops: [
      {
      id: 'search',
      label: 'Tìm kiếm nhị phân (Iterative)',
      args: [
        { id: 'arr', label: 'Mảng (đã sắp)', type: 'array', value: '2 5 8 12 16 23 38 56 72 91', random: () => DSA.randomSortedArray(12, 1, 99) },
        { id: 'x', label: 'Khóa x', type: 'number', value: 23 },
      ],
      code: {
        cpp: `int binarySearch(const int arr[], int n, int x) {
    int lo = 0, hi = n - 1;                         @@init
    while (lo <= hi) {                              @@loop
        int mid = lo + (hi - lo) / 2;               @@mid
        if (arr[mid] == x) return mid;              @@found
        if (x < arr[mid]) hi = mid - 1;             @@goLeft
        else lo = mid + 1;                          @@goRight
    }
    return -1;                                      @@notFound
}`,
        java: `static int binarySearch(int[] arr, int x) {
    int lo = 0, hi = arr.length - 1;                @@init
    while (lo <= hi) {                              @@loop
        int mid = lo + (hi - lo) / 2;               @@mid
        if (arr[mid] == x) return mid;              @@found
        if (x < arr[mid]) hi = mid - 1;             @@goLeft
        else lo = mid + 1;                          @@goRight
    }
    return -1;                                      @@notFound
}`,
        python: `def binary_search(arr, x):
    lo, hi = 0, len(arr) - 1                        @@init
    while lo <= hi:                                 @@loop
        mid = (lo + hi) // 2                        @@mid
        if arr[mid] == x: return mid                @@found
        if x < arr[mid]: hi = mid - 1               @@goLeft
        else: lo = mid + 1                          @@goRight
    return -1                                       @@notFound`,
        pseudo: `Algorithm binarySearch(arr, lo, hi, x)
while lo <= hi do                                   @@loop
    mid = (lo + hi) / 2                             @@mid
    if arr[mid] == x then return mid                @@found
    if x < arr[mid] then hi = mid - 1               @@goLeft
    else lo = mid + 1                               @@goRight
end
return -1                                           @@notFound`,
      },
      run({ arr, x }) {
        const a = arr.slice().sort((p, q) => p - q);
        const n = a.length;
        const R = new DSA.Recorder();
        let lo = 0, hi = n - 1, comps = 0;

        const makeHl = (extra) => {
          const h = {};
          for (let i = 0; i < n; i++) h[i] = (i < lo || i > hi) ? 'dim' : 'active';
          return Object.assign(h, extra || {});
        };

        R.step({
          line: 'init',
          msg: 'Khởi tạo khoảng tìm kiếm <code>[lo=' + lo + ' .. hi=' + hi + ']</code> cho <code>x = ' + x + '</code>.',
          vars: { lo, hi, x, comparisons: comps },
          panels: [{
            kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + ']', values: a, hl: makeHl(),
            pointers: [{ i: lo, label: 'lo' }, { i: hi, label: 'hi' }],
            ranges: [{ from: lo, to: hi, label: '[lo..hi]' }],
          }],
        });

        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          comps++;
          R.step({
            line: 'mid',
            msg: 'Tính <code>mid = ⌊(' + lo + ' + ' + hi + ')/2⌋ = ' + mid + '</code> → <code>arr[' + mid + '] = ' + a[mid] + '</code>.',
            vars: { lo, mid, hi, 'arr[mid]': a[mid], x, comparisons: comps },
            panels: [{
              kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + ']', values: a,
              hl: makeHl({ [mid]: 'compare' }),
              pointers: [{ i: lo, label: 'lo' }, { i: mid, label: 'mid', hl: 'compare' }, { i: hi, label: 'hi' }],
              ranges: [{ from: lo, to: hi, label: '[' + lo + '..' + hi + ']' }],
            }],
          });

          if (a[mid] === x) {
            R.step({
              line: 'found',
              msg: '<code>arr[' + mid + '] == ' + x + '</code> → Tìm thấy tại chỉ số <b>' + mid + '</b>!',
              vars: { lo, mid, hi, result: mid, comparisons: comps },
              panels: [{
                kind: 'array', key: 'a', title: 'Tìm thấy tại mid = ' + mid, values: a,
                hl: makeHl({ [mid]: 'found' }),
                pointers: [{ i: mid, label: 'FOUND', hl: 'found' }],
              }],
            });
            return R.steps;
          }
          if (x < a[mid]) {
            hi = mid - 1;
            R.step({
              line: 'goLeft',
              msg: 'Vì <code>x (' + x + ') &lt; arr[' + mid + '] (' + a[mid] + ')</code> → thu hẹp về nửa trái: <code>hi = mid - 1 = ' + hi + '</code>.',
              vars: { lo, mid, hi, x, comparisons: comps },
              panels: [{
                kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + ']', values: a, hl: makeHl(),
                pointers: [{ i: lo, label: 'lo' }, { i: Math.max(0, hi), label: 'hi' }],
                ranges: lo <= hi ? [{ from: lo, to: hi, label: '[' + lo + '..' + hi + ']' }] : [],
              }],
            });
          } else {
            lo = mid + 1;
            R.step({
              line: 'goRight',
              msg: 'Vì <code>x (' + x + ') &gt; arr[' + mid + '] (' + a[mid] + ')</code> → thu hẹp về nửa phải: <code>lo = mid + 1 = ' + lo + '</code>.',
              vars: { lo, mid, hi, x, comparisons: comps },
              panels: [{
                kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + ']', values: a, hl: makeHl(),
                pointers: [{ i: Math.min(n - 1, lo), label: 'lo' }, { i: hi, label: 'hi' }],
                ranges: lo <= hi ? [{ from: lo, to: hi, label: '[' + lo + '..' + hi + ']' }] : [],
              }],
            });
          }
        }

        R.step({
          line: 'notFound',
          msg: 'Khoảng rỗng (<code>lo &gt; hi</code>) → không tìm thấy <code>' + x + '</code>, trả về <b>-1</b>.',
          vars: { lo, hi, result: -1, comparisons: comps },
          panels: [{ kind: 'array', key: 'a', title: 'Không tìm thấy (-1)', values: a, hl: makeHl() }],
        });
        return R.steps;
      },
      },
      {
        id: 'recursive',
        label: 'Tìm kiếm nhị phân đệ quy (Recursive – Call Stack)',
        args: [
          { id: 'arr', label: 'Mảng (đã sắp)', type: 'array', value: '2 5 8 12 16 23 38 56 72 91', random: () => DSA.randomSortedArray(12, 1, 99) },
          { id: 'x', label: 'Khóa x', type: 'number', value: 23 },
        ],
        code: {
          cpp: `int binarySearchRec(const int arr[], int lo, int hi, int x) {
    if (lo > hi) return -1;                         @@baseNotFound
    int mid = lo + (hi - lo) / 2;                   @@mid
    if (arr[mid] == x) return mid;                  @@found
    if (x < arr[mid])                               @@cmpLeft
        return binarySearchRec(arr, lo, mid - 1, x); @@recLeft
    return binarySearchRec(arr, mid + 1, hi, x);    @@recRight
}`,
          java: `static int binarySearchRec(int[] arr, int lo, int hi, int x) {
    if (lo > hi) return -1;                         @@baseNotFound
    int mid = lo + (hi - lo) / 2;                   @@mid
    if (arr[mid] == x) return mid;                  @@found
    if (x < arr[mid])                               @@cmpLeft
        return binarySearchRec(arr, lo, mid - 1, x); @@recLeft
    return binarySearchRec(arr, mid + 1, hi, x);    @@recRight
}`,
          python: `def binary_search_rec(arr, lo, hi, x):
    if lo > hi: return -1                           @@baseNotFound
    mid = (lo + hi) // 2                            @@mid
    if arr[mid] == x: return mid                    @@found
    if x < arr[mid]:                                @@cmpLeft
        return binary_search_rec(arr, lo, mid - 1, x) @@recLeft
    return binary_search_rec(arr, mid + 1, hi, x)   @@recRight`,
          pseudo: `Algorithm binarySearchRec(arr, lo, hi, x)
if (lo > hi) then return -1                         @@baseNotFound
mid = (lo + hi) / 2                                 @@mid
if (arr[mid] == x) then return mid                  @@found
if (x < arr[mid]) then                              @@cmpLeft
    return binarySearchRec(arr, lo, mid - 1, x)     @@recLeft
else
    return binarySearchRec(arr, mid + 1, hi, x)     @@recRight
end`,
        },
        run({ arr, x }) {
          const a = arr.slice().sort((p, q) => p - q);
          const n = a.length;
          const R = new DSA.Recorder();
          const stack = [];
          let comps = 0;

          const makeHl = (lo, hi, extra) => {
            const h = {};
            for (let i = 0; i < n; i++) h[i] = (i < lo || i > hi) ? 'dim' : 'active';
            return Object.assign(h, extra || {});
          };

          function rec(lo, hi) {
            stack.push(`bSearch(lo=${lo}, hi=${hi})`);
            if (lo > hi) {
              R.step({
                line: 'baseNotFound',
                msg: 'Gọi <code>binarySearchRec(lo=' + lo + ', hi=' + hi + ')</code>: <code>lo &gt; hi</code> → trả về <b>-1</b>.',
                vars: { lo, hi, depth: stack.length, result: -1 },
                panels: [
                  { kind: 'array', key: 'a', title: 'Không tìm thấy (-1)', values: a, hl: makeHl(lo, hi) },
                  { kind: 'list', key: 'st', title: 'Call Stack (O(log n) bộ nhớ)', style: 'stack', items: stack.map((s, i) => ({ label: s, hl: i === stack.length - 1 ? 'swap' : 'active' })) },
                ],
              });
              stack.pop();
              return -1;
            }
            const mid = (lo + hi) >> 1;
            comps++;
            R.step({
              line: 'mid',
              msg: 'Khung gọi <code>binarySearchRec(lo=' + lo + ', hi=' + hi + ')</code>: <code>mid = ' + mid + '</code>, <code>arr[' + mid + '] = ' + a[mid] + '</code>.',
              vars: { lo, mid, hi, 'arr[mid]': a[mid], x, depth: stack.length, comparisons: comps },
              panels: [
                {
                  kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + ']', values: a,
                  hl: makeHl(lo, hi, { [mid]: 'compare' }),
                  pointers: [{ i: lo, label: 'lo' }, { i: mid, label: 'mid', hl: 'compare' }, { i: hi, label: 'hi' }],
                  ranges: [{ from: lo, to: hi, label: '[' + lo + '..' + hi + ']' }],
                },
                { kind: 'list', key: 'st', title: 'Call Stack (O(log n) bộ nhớ)', style: 'stack', items: stack.map((s, i) => ({ label: s, hl: i === stack.length - 1 ? 'compare' : 'active' })) },
              ],
            });
            if (a[mid] === x) {
              R.step({
                line: 'found',
                msg: 'Tìm thấy <code>arr[' + mid + '] == ' + x + '</code> ở độ sâu đệ quy ' + stack.length + ' → trả về <b>' + mid + '</b>!',
                vars: { result: mid, depth: stack.length, comparisons: comps },
                panels: [
                  { kind: 'array', key: 'a', title: 'Tìm thấy tại mid = ' + mid, values: a, hl: makeHl(lo, hi, { [mid]: 'found' }), pointers: [{ i: mid, label: 'FOUND', hl: 'found' }] },
                  { kind: 'list', key: 'st', title: 'Call Stack (O(log n) bộ nhớ)', style: 'stack', items: stack.map((s, i) => ({ label: s, hl: i === stack.length - 1 ? 'found' : 'active' })) },
                ],
              });
              stack.pop();
              return mid;
            }
            if (x < a[mid]) {
              R.step({
                line: ['cmpLeft', 'recLeft'],
                msg: '<code>x (' + x + ') &lt; arr[' + mid + '] (' + a[mid] + ')</code> → gọi đệ quy nửa trái <code>binarySearchRec(' + lo + ', ' + (mid - 1) + ')</code>.',
                vars: { nextLo: lo, nextHi: mid - 1, depth: stack.length },
                panels: [
                  { kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + ']', values: a, hl: makeHl(lo, mid - 1) },
                  { kind: 'list', key: 'st', title: 'Call Stack (O(log n) bộ nhớ)', style: 'stack', items: stack.map((s, i) => ({ label: s, hl: i === stack.length - 1 ? 'active' : '' })) },
                ],
              });
              const r = rec(lo, mid - 1);
              stack.pop();
              return r;
            } else {
              R.step({
                line: 'recRight',
                msg: '<code>x (' + x + ') &gt; arr[' + mid + '] (' + a[mid] + ')</code> → gọi đệ quy nửa phải <code>binarySearchRec(' + (mid + 1) + ', ' + hi + ')</code>.',
                vars: { nextLo: mid + 1, nextHi: hi, depth: stack.length },
                panels: [
                  { kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + ']', values: a, hl: makeHl(mid + 1, hi) },
                  { kind: 'list', key: 'st', title: 'Call Stack (O(log n) bộ nhớ)', style: 'stack', items: stack.map((s, i) => ({ label: s, hl: i === stack.length - 1 ? 'active' : '' })) },
                ],
              });
              const r = rec(mid + 1, hi);
              stack.pop();
              return r;
            }
          }

          rec(0, n - 1);
          return R.steps;
        },
      },
    ],
  });

  /* ---------------------------------------------------------------------
   * 3. Jump Search (Search+Hash.pdf p.9-12)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'jump-search',
    chapter: 'searching',
    name: 'Jump Search',
    short: 'O(√n)',
    complexity: [
      ['Optimal block size', 'm = √n'],
      ['Time Complexity', 'O(√n)'],
      ['Space Complexity', 'O(1)'],
      ['Yêu cầu', 'Mảng đã sắp xếp tăng dần'],
    ],
    description:
      '<p><b>Jump Search</b> chia mảng đã sắp kích thước <code>n</code> thành các khối (blocks) có kích thước cố định <code>m = ⌊√n⌋</code>:</p>' +
      '<ol><li>Nhảy từng bước <code>m</code> (chỉ số <code>0, m, 2m, 3m…</code>) cho đến khi tìm được khối <code>k</code> sao cho phần tử đầu khối <code>k</code> nhỏ hơn hoặc bằng <code>key</code> và phần tử đầu khối <code>k + 1</code> lớn hơn hoặc bằng <code>key</code>.</li>' +
      '<li>Thực hiện <b>Linear Search</b> trên khối <code>k</code>.</li></ol>',
    notes: [
      'Ví dụ: mảng 16 số Fibonacci <code>[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610]</code>, <code>m = 4</code>, tìm <code>x = 55</code>: nhảy <code>0 → 4 → 8 → 12</code> (<code>arr[12]=144 &gt; 55</code>), lùi về <code>8</code> rồi tìm tuyến tính đến chỉ số <code>10</code>.',
    ],
    ops: [{
      id: 'search',
      label: 'Tìm kiếm nhảy bước (Jump Search)',
      args: [
        { id: 'arr', label: 'Mảng (đã sắp)', type: 'array', value: FIB16, random: () => DSA.randomSortedArray(16, 1, 200) },
        { id: 'x', label: 'Khóa x', type: 'number', value: 55 },
        { id: 'm', label: 'Kích thước khối m (0 = √n)', type: 'number', value: 4 },
      ],
      code: {
        cpp: `int jumpSearch(const int arr[], int n, int x) {
    int m = std::sqrt(n);                           @@init
    int prev = 0, curr = 0;                         @@init
    while (curr < n && arr[curr] < x) {             @@jumpCheck
        prev = curr;                                @@jump
        curr += m;                                  @@jump
    }
    int end = std::min(curr, n - 1);                @@linStart
    for (int i = prev; i <= end; ++i) {             @@linLoop
        if (arr[i] == x) return i;                  @@found
        if (arr[i] > x) break;                      @@notFound
    }
    return -1;                                      @@notFound
}`,
        java: `static int jumpSearch(int[] arr, int x) {
    int n = arr.length, m = (int) Math.sqrt(n);     @@init
    int prev = 0, curr = 0;                         @@init
    while (curr < n && arr[curr] < x) {             @@jumpCheck
        prev = curr; curr += m;                     @@jump
    }
    int end = Math.min(curr, n - 1);                @@linStart
    for (int i = prev; i <= end; i++) {             @@linLoop
        if (arr[i] == x) return i;                  @@found
        if (arr[i] > x) break;                      @@notFound
    }
    return -1;                                      @@notFound
}`,
        python: `import math
def jump_search(arr, x):
    n = len(arr); m = int(math.isqrt(n))            @@init
    prev = curr = 0                                 @@init
    while curr < n and arr[curr] < x:               @@jumpCheck
        prev = curr; curr += m                      @@jump
    for i in range(prev, min(curr, n - 1) + 1):     @@linLoop
        if arr[i] == x: return i                    @@found
        if arr[i] > x: break                        @@notFound
    return -1                                       @@notFound`,
        pseudo: `Algorithm JumpSearch(arr, n, key)
m = floor(sqrt(n)); prev = 0; curr = 0              @@init
// Step 1: Jump by fixed step m
while curr < n AND arr[curr] < key do               @@jumpCheck
    prev = curr; curr = curr + m                    @@jump
end
// Step 2: Linear search on block [prev .. min(curr, n-1)] @@linStart
for i = prev to min(curr, n - 1) do                 @@linLoop
    if arr[i] == key then return i                  @@found
end
return -1                                           @@notFound`,
      },
      run({ arr, x, m }) {
        const a = arr.slice().sort((p, q) => p - q);
        const n = a.length;
        const step = m > 0 ? m : Math.max(1, Math.floor(Math.sqrt(n)));
        const R = new DSA.Recorder();
        let prev = 0, curr = 0, comps = 0;
        const jumped = [];

        R.step({
          line: 'init',
          msg: 'Khởi tạo Jump Search với <code>n = ' + n + '</code>, kích thước khối <code>m = ' + step + '</code>, tìm <code>x = ' + x + '</code>.',
          vars: { n, m: step, prev, curr, x },
          panels: [{ kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + '] (m = ' + step + ')', values: a, pointers: [{ i: 0, label: 'curr=0' }] }],
        });

        while (curr < n) {
          comps++;
          jumped.push(curr);
          const hl = {};
          jumped.forEach((j) => { hl[j] = 'visited'; });
          hl[curr] = 'compare';
          const less = a[curr] < x;
          R.step({
            line: 'jumpCheck',
            msg: 'Kiểm tra tại chỉ số nhảy <code>curr = ' + curr + '</code>: <code>arr[' + curr + '] (' + a[curr] + ') &lt; ' + x + '</code> → <b>' + (less ? 'Đúng (nhảy tiếp +' + step + ')' : 'Sai (dừng nhảy)') + '</b>.',
            vars: { prev, curr, 'arr[curr]': a[curr], x, m: step, comparisons: comps },
            panels: [{
              kind: 'array', key: 'a', title: 'Bước 1: Nhảy từng khối m = ' + step, values: a, hl,
              pointers: [{ i: prev, label: 'prev=' + prev }, { i: curr, label: 'curr=' + curr, hl: 'compare' }],
            }],
          });
          if (!less) break;
          prev = curr;
          curr += step;
        }

        const end = Math.min(curr, n - 1);
        const blkHl = {};
        for (let i = 0; i < n; i++) blkHl[i] = (i >= prev && i <= end) ? 'active' : 'dim';
        R.step({
          line: 'linStart',
          msg: 'Lùi về <code>prev = ' + prev + '</code> và thực hiện <b>Linear Search</b> trên khối <code>[' + prev + '..' + end + ']</code>.',
          vars: { prev, end, x, comparisons: comps },
          panels: [{
            kind: 'array', key: 'a', title: 'Bước 2: Linear Search trên khối [' + prev + '..' + end + ']', values: a, hl: blkHl,
            ranges: [{ from: prev, to: end, label: 'block [' + prev + '..' + end + ']' }],
          }],
        });

        for (let i = prev; i <= end; i++) {
          comps++;
          const h = Object.assign({}, blkHl, { [i]: 'compare' });
          R.step({
            line: 'linLoop',
            msg: 'So sánh <code>arr[' + i + '] (' + a[i] + ') == ' + x + '</code>.',
            vars: { i, 'arr[i]': a[i], x, comparisons: comps },
            panels: [{
              kind: 'array', key: 'a', title: 'Linear Search trên khối [' + prev + '..' + end + ']', values: a, hl: h,
              pointers: [{ i, label: 'i=' + i, hl: 'compare' }],
              ranges: [{ from: prev, to: end, label: 'block' }],
            }],
          });
          if (a[i] === x) {
            h[i] = 'found';
            R.step({
              line: 'found',
              msg: 'Tìm thấy <code>x = ' + x + '</code> tại chỉ số <b>' + i + '</b> (tổng ' + comps + ' phép so sánh)!',
              vars: { result: i, comparisons: comps },
              panels: [{ kind: 'array', key: 'a', title: 'Tìm thấy tại i = ' + i, values: a, hl: h, pointers: [{ i, label: 'FOUND', hl: 'found' }] }],
            });
            return R.steps;
          }
          if (a[i] > x) break;
        }

        R.step({
          line: 'notFound',
          msg: 'Không tìm thấy <code>x = ' + x + '</code> trong khối → trả về <b>-1</b>.',
          vars: { result: -1, comparisons: comps },
          panels: [{ kind: 'array', key: 'a', title: 'Không tìm thấy (-1)', values: a, hl: blkHl }],
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 4. Interpolation Search (Search+Hash.pdf p.13-16)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'interpolation-search',
    chapter: 'searching',
    name: 'Interpolation Search (Tìm kiếm nội suy)',
    short: 'O(log log n)',
    complexity: [
      ['Phân bố đều (Uniform)', 'O(log log n)'],
      ['Worst case', 'O(n)'],
      ['Space', 'O(1)'],
      ['Yêu cầu', 'Mảng đã sắp & phân bố đều'],
    ],
    description:
      '<p><b>Interpolation Search</b> cải tiến Binary Search khi các giá trị trong mảng đã sắp có <b>phân bố đều (uniformly distributed)</b>. Thay vì luôn lấy trung điểm, vị trí thăm dò <code>pos</code> được nội suy tuyến tính theo giá trị khóa <code>x</code>:</p>' +
      '<p><code>pos = lo + ⌊((x − arr[lo]) × (hi − lo)) / (arr[hi] − arr[lo])⌋</code></p>',
    ops: [{
      id: 'search',
      label: 'Tìm kiếm nội suy',
      args: [
        { id: 'arr', label: 'Mảng (đã sắp)', type: 'array', value: '10 12 13 16 18 19 20 21 22 23 24 33 35 42 47' },
        { id: 'x', label: 'Khóa x', type: 'number', value: 18 },
      ],
      code: {
        cpp: `int interpolationSearch(const int arr[], int n, int x) {
    int lo = 0, hi = n - 1;                         @@init
    while (lo <= hi && x >= arr[lo] && x <= arr[hi]) { @@loop
        if (arr[hi] == arr[lo])                     @@probe
            return (arr[lo] == x) ? lo : -1;
        int pos = lo + ((long long)(x - arr[lo]) * (hi - lo))
                       / (arr[hi] - arr[lo]);       @@probe
        if (arr[pos] == x) return pos;              @@found
        if (arr[pos] < x) lo = pos + 1;             @@goRight
        else hi = pos - 1;                          @@goLeft
    }
    return -1;                                      @@notFound
}`,
        java: `static int interpolationSearch(int[] arr, int x) {
    int lo = 0, hi = arr.length - 1;                @@init
    while (lo <= hi && x >= arr[lo] && x <= arr[hi]) { @@loop
        if (arr[hi] == arr[lo]) return arr[lo] == x ? lo : -1;
        int pos = lo + (int)((long)(x - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo])); @@probe
        if (arr[pos] == x) return pos;              @@found
        if (arr[pos] < x) lo = pos + 1;             @@goRight
        else hi = pos - 1;                          @@goLeft
    }
    return -1;                                      @@notFound
}`,
        python: `def interpolation_search(arr, x):
    lo, hi = 0, len(arr) - 1                        @@init
    while lo <= hi and arr[lo] <= x <= arr[hi]:     @@loop
        if arr[hi] == arr[lo]:
            return lo if arr[lo] == x else -1
        pos = lo + (x - arr[lo]) * (hi - lo) // (arr[hi] - arr[lo]) @@probe
        if arr[pos] == x: return pos                @@found
        if arr[pos] < x: lo = pos + 1               @@goRight
        else: hi = pos - 1                          @@goLeft
    return -1                                       @@notFound`,
        pseudo: `Algorithm InterpolationSearch(arr, n, x)
lo = 0; hi = n - 1                                  @@init
while lo <= hi AND x >= arr[lo] AND x <= arr[hi] do @@loop
    pos = lo + (x - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo]) @@probe
    if arr[pos] == x then return pos                @@found
    if x < arr[pos] then hi = pos - 1               @@goLeft
    else lo = pos + 1                               @@goRight
end
return -1                                           @@notFound`,
      },
      run({ arr, x }) {
        const a = arr.slice().sort((p, q) => p - q);
        const n = a.length;
        const R = new DSA.Recorder();
        let lo = 0, hi = n - 1, comps = 0;

        const makeHl = (extra) => {
          const h = {};
          for (let i = 0; i < n; i++) h[i] = (i < lo || i > hi) ? 'dim' : 'active';
          return Object.assign(h, extra || {});
        };

        R.step({
          line: 'init',
          msg: 'Khởi tạo <code>lo = 0</code> (<code>' + a[0] + '</code>), <code>hi = ' + hi + '</code> (<code>' + a[hi] + '</code>), tìm <code>x = ' + x + '</code>.',
          vars: { lo, hi, 'arr[lo]': a[lo], 'arr[hi]': a[hi], x },
          panels: [{
            kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + ']', values: a, hl: makeHl(),
            pointers: [{ i: lo, label: 'lo' }, { i: hi, label: 'hi' }],
          }],
        });

        while (lo <= hi && x >= a[lo] && x <= a[hi]) {
          const pos = a[hi] === a[lo] ? lo : lo + Math.floor(((x - a[lo]) * (hi - lo)) / (a[hi] - a[lo]));
          comps++;
          const formula = `${lo} + ⌊(${x} − ${a[lo]})×(${hi} − ${lo}) / (${a[hi]} − ${a[lo]})⌋ = ${pos}`;
          R.step({
            line: 'probe',
            msg: 'Tính vị trí nội suy: <code>pos = ' + formula + '</code> → <code>arr[' + pos + '] = ' + a[pos] + '</code>.',
            vars: { lo, hi, pos, 'arr[pos]': a[pos], x, comparisons: comps },
            panels: [{
              kind: 'array', key: 'a', title: 'pos = ' + formula, values: a,
              hl: makeHl({ [pos]: 'pivot' }),
              pointers: [{ i: lo, label: 'lo' }, { i: pos, label: 'pos=' + pos, hl: 'pivot' }, { i: hi, label: 'hi' }],
              ranges: [{ from: lo, to: hi, label: '[' + lo + '..' + hi + ']' }],
            }],
          });

          if (a[pos] === x) {
            R.step({
              line: 'found',
              msg: '<code>arr[' + pos + '] == ' + x + '</code> → Tìm thấy tại <b>pos = ' + pos + '</b> sau ' + comps + ' bước nội suy!',
              vars: { result: pos, comparisons: comps },
              panels: [{ kind: 'array', key: 'a', title: 'Tìm thấy tại pos = ' + pos, values: a, hl: makeHl({ [pos]: 'found' }), pointers: [{ i: pos, label: 'FOUND', hl: 'found' }] }],
            });
            return R.steps;
          }
          if (a[pos] < x) {
            lo = pos + 1;
            R.step({
              line: 'goRight',
              msg: '<code>arr[' + pos + '] (' + a[pos] + ') &lt; x (' + x + ')</code> → dịch <code>lo = pos + 1 = ' + lo + '</code>.',
              vars: { lo, hi, x, comparisons: comps },
              panels: [{ kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + ']', values: a, hl: makeHl() }],
            });
          } else {
            hi = pos - 1;
            R.step({
              line: 'goLeft',
              msg: '<code>arr[' + pos + '] (' + a[pos] + ') &gt; x (' + x + ')</code> → dịch <code>hi = pos - 1 = ' + hi + '</code>.',
              vars: { lo, hi, x, comparisons: comps },
              panels: [{ kind: 'array', key: 'a', title: 'arr[0..' + (n - 1) + ']', values: a, hl: makeHl() }],
            });
          }
        }

        R.step({
          line: 'notFound',
          msg: 'Không tìm thấy <code>x = ' + x + '</code> → trả về <b>-1</b>.',
          vars: { result: -1, comparisons: comps },
          panels: [{ kind: 'array', key: 'a', title: 'Không tìm thấy (-1)', values: a, hl: makeHl() }],
        });
        return R.steps;
      },
    }],
  });
})();
