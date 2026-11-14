/* =========================================================================
 * DSA Visualizer – bitwise.js
 * 1. Bitwise Operators & Bit Tricks (AND, OR, XOR, NOT, Shift, Get/Set/Clear/Toggle,
 *    Brian Kernighan popcount, Power of 2, Lowbit n & -n)
 * 2. Bitmask & Subset Enumeration (2^n subsets & Submask Enumeration (sub - 1) & mask)
 * 3. Classic ICPC Bitwise Problems:
 *    - Single Number I & II (XOR Cancellation & Lowbit Partition)
 *    - Binary Exponentiation (a^b mod m)
 *    - Bitmask DP: Traveling Salesman Problem (TSP)
 *    - Fenwick Tree / Binary Indexed Tree (i += i & -i, i -= i & -i)
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  const BITS = 8;

  function toBitArray(val, width) {
    width = width || BITS;
    const u = val >>> 0;
    const out = [];
    for (let b = width - 1; b >= 0; b--) {
      out.push((u >>> b) & 1);
    }
    return out;
  }

  function toBinStr(val, width) {
    return toBitArray(val, width || BITS).join('');
  }

  function bitRowPanel(key, title, val, hlMap, ptrs, width) {
    width = width || BITS;
    const arr = toBitArray(val, width);
    const cellLabels = [];
    for (let b = width - 1; b >= 0; b--) cellLabels.push('b' + b);
    return {
      kind: 'array',
      key,
      title: `${title}  [dec = ${val} | bin = 0b${arr.join('')}]`,
      values: arr,
      showIndex: false,
      cellWidth: 40,
      cellLabels,
      hl: hlMap || {},
      pointers: ptrs || [],
    };
  }

  /* ---------------------------------------------------------------------
   * 1. Bitwise Operators & Bit Tricks
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'bitwise-basics',
    chapter: 'bitwise',
    name: 'Toán tử Bit cơ bản & Kỹ thuật Bit Tricks',
    short: 'O(1) / O(k)',
    complexity: [
      ['& | ^ ~ << >>', 'O(1) trên thanh ghi'],
      ['Get / Set / Clear / Toggle bit i', 'O(1)'],
      ['Xóa bit 1 thấp nhất', 'n & (n − 1)'],
      ['Trích xuất Lowbit (bit 1 thấp nhất)', 'n & (−n)'],
    ],
    description:
      '<p>Các toán tử thao tác trực tiếp trên từng bit nhị phân của số nguyên:</p>' +
      '<ul>' +
      '<li><b><code>&amp;</code> (AND)</b>: bằng <code>1</code> khi cả hai bit đều bằng <code>1</code> (dùng để kiểm tra bit, xóa bit).</li>' +
      '<li><b><code>|</code> (OR)</b>: bằng <code>1</code> khi có ít nhất một bit bằng <code>1</code> (dùng để bật bit).</li>' +
      '<li><b><code>^</code> (XOR)</b>: bằng <code>1</code> khi hai bit khác nhau; tính chất <code>x ^ x = 0</code>, <code>x ^ 0 = x</code>.</li>' +
      '<li><b><code>~</code> (NOT)</b>: đảo ngược toàn bộ bit (trong bù 2: <code>~x = -x - 1</code>).</li>' +
      '<li><b><code>&lt;&lt;</code> / <code>&gt;&gt;</code></b>: dịch trái <code>k</code> bit tương đương nhân <code>2<sup>k</sup></code>; dịch phải <code>k</code> bit tương đương chia nguyên cho <code>2<sup>k</sup></code>.</li>' +
      '<li><b>Kỹ thuật kinh điển</b>: <code>n &amp; (n - 1)</code> xóa bit <code>1</code> phải cùng (<i>Brian Kernighan</i>); <code>n &amp; -n</code> giữ lại duy nhất bit <code>1</code> phải cùng (<i>Lowbit</i>).</li>' +
      '</ul>',
    ops: [
      {
        id: 'operators',
        label: 'Phép toán Bit (&, |, ^, ~, <<, >>)',
        args: [
          { id: 'a', label: 'Số nguyên A (0..255)', type: 'number', value: 45, random: () => DSA.randInt(1, 255) },
          { id: 'b', label: 'Số nguyên B (0..255)', type: 'number', value: 27, random: () => DSA.randInt(1, 255) },
          {
            id: 'op', label: 'Toán tử', type: 'select', value: 'xor',
            options: [
              { value: 'and', label: 'A & B (Bitwise AND)' },
              { value: 'or', label: 'A | B (Bitwise OR)' },
              { value: 'xor', label: 'A ^ B (Bitwise XOR)' },
              { value: 'not', label: '~A (Bitwise NOT – 8-bit)' },
              { value: 'shl', label: 'A << k (Dịch trái k = B mod 8 bit)' },
              { value: 'shr', label: 'A >> k (Dịch phải k = B mod 8 bit)' },
            ],
          },
        ],
        code: {
          cpp: `int bitwiseOp(int a, int b, int mode) {
    if (mode == 0) return a & b;                    @@and
    if (mode == 1) return a | b;                    @@or
    if (mode == 2) return a ^ b;                    @@xor
    if (mode == 3) return (~a) & 0xFF;              @@not
    int k = b & 7;
    if (mode == 4) return (a << k) & 0xFF;          @@shl
    return a >> k;                                  @@shr
}`,
          java: `static int bitwiseOp(int a, int b, String op) {
    return switch (op) {
        case "and" -> a & b;                        @@and
        case "or"  -> a | b;                        @@or
        case "xor" -> a ^ b;                        @@xor
        case "not" -> (~a) & 0xFF;                  @@not
        case "shl" -> (a << (b & 7)) & 0xFF;        @@shl
        default    -> a >> (b & 7);                 @@shr
    };
}`,
          python: `def bitwise_op(a, b, op):
    if op == 'and': return a & b                    @@and
    if op == 'or':  return a | b                    @@or
    if op == 'xor': return a ^ b                    @@xor
    if op == 'not': return (~a) & 0xFF              @@not
    k = b & 7
    if op == 'shl': return (a << k) & 0xFF          @@shl
    return a >> k                                   @@shr`,
          pseudo: `Algorithm BitwiseOperator(val A, val B, val op)
1. AND: C = A & B  (1 iff both bits are 1)          @@and
2. OR:  C = A | B  (1 iff at least one bit is 1)    @@or
3. XOR: C = A ^ B  (1 iff two bits are different)   @@xor
4. NOT: C = ~A     (invert every bit)               @@not
5. SHL: C = A << k (multiply by 2^k)                @@shl
6. SHR: C = A >> k (floor divide by 2^k)            @@shr
End BitwiseOperator`,
        },
        run({ a, b, op }) {
          const R = new DSA.Recorder();
          const A = (Math.trunc(a) & 0xFF) >>> 0;
          const B = (Math.trunc(b) & 0xFF) >>> 0;
          const k = B & 7;

          let res = 0;
          let expr = '';
          if (op === 'and') { res = (A & B) >>> 0; expr = `${A} & ${B}`; }
          else if (op === 'or') { res = (A | B) >>> 0; expr = `${A} | ${B}`; }
          else if (op === 'xor') { res = (A ^ B) >>> 0; expr = `${A} ^ ${B}`; }
          else if (op === 'not') { res = (~A) & 0xFF; expr = `~${A} (8-bit)`; }
          else if (op === 'shl') { res = (A << k) & 0xFF; expr = `${A} << ${k}`; }
          else { res = (A >>> k) & 0xFF; expr = `${A} >> ${k}`; }

          const bitsA = toBitArray(A);
          const bitsB = toBitArray(B);
          const bitsR = toBitArray(res);

          R.step({
            line: op,
            msg: `Biểu diễn nhị phân 8-bit của <code>A = ${A}</code> (<code>${toBinStr(A)}</code>)` +
              (['and', 'or', 'xor'].includes(op) ? ` và <code>B = ${B}</code> (<code>${toBinStr(B)}</code>).` : ` với tham số dịch <code>k = ${k}</code>.`),
            vars: { A, B, expr, result: res },
            panels: [
              bitRowPanel('pa', 'Toán hạng A', A),
              ['and', 'or', 'xor'].includes(op) ? bitRowPanel('pb', 'Toán hạng B', B) : null,
            ],
          });

          const hlA = {}, hlB = {}, hlR = {};
          for (let col = 0; col < BITS; col++) {
            const bitIdx = BITS - 1 - col;
            if (op === 'and' && bitsA[col] === 1 && bitsB[col] === 1) {
              hlA[col] = 'found'; hlB[col] = 'found'; hlR[col] = 'found';
            } else if (op === 'or' && (bitsA[col] === 1 || bitsB[col] === 1)) {
              if (bitsA[col]) hlA[col] = 'active';
              if (bitsB[col]) hlB[col] = 'active';
              hlR[col] = 'found';
            } else if (op === 'xor' && bitsA[col] !== bitsB[col]) {
              hlA[col] = 'compare'; hlB[col] = 'compare'; hlR[col] = 'found';
            } else if (op === 'not') {
              hlA[col] = 'compare'; hlR[col] = 'found';
            } else if ((op === 'shl' || op === 'shr') && bitsR[col] === 1) {
              hlR[col] = 'found';
            }
            void bitIdx;
          }

          R.step({
            line: op,
            msg: `Kết quả <code>${expr} = <b>${res}</b></code> (nhị phân <code>${toBinStr(res)}</code>).`,
            vars: { A, B, expr, resultDec: res, resultBin: toBinStr(res) },
            panels: [
              bitRowPanel('pa', 'Toán hạng A', A, hlA),
              ['and', 'or', 'xor'].includes(op) ? bitRowPanel('pb', 'Toán hạng B', B, hlB) : null,
              bitRowPanel('pr', 'Kết quả (' + expr + ')', res, hlR),
            ],
          });
          return R.steps;
        },
      },
      {
        id: 'bit-pos',
        label: 'Thao tác Bit thứ i (Get / Set / Clear / Toggle)',
        args: [
          { id: 'n', label: 'Số nguyên n (0..255)', type: 'number', value: 42 },
          { id: 'i', label: 'Vị trí bit i (0..7, từ phải sang)', type: 'number', value: 3 },
          {
            id: 'action', label: 'Thao tác', type: 'select', value: 'toggle',
            options: [
              { value: 'get', label: 'Get bit i: (n >> i) & 1' },
              { value: 'set', label: 'Set bit i (bật thành 1): n | (1 << i)' },
              { value: 'clear', label: 'Clear bit i (xóa thành 0): n & ~(1 << i)' },
              { value: 'toggle', label: 'Toggle bit i (đảo bit): n ^ (1 << i)' },
            ],
          },
        ],
        code: {
          cpp: `int getBit(int n, int i)    { return (n >> i) & 1; }      @@get
int setBit(int n, int i)    { return n | (1 << i); }      @@set
int clearBit(int n, int i)  { return n & ~(1 << i); }     @@clear
int toggleBit(int n, int i) { return n ^ (1 << i); }      @@toggle`,
          java: `static int getBit(int n, int i)    { return (n >> i) & 1; }  @@get
static int setBit(int n, int i)    { return n | (1 << i); }  @@set
static int clearBit(int n, int i)  { return n & ~(1 << i); } @@clear
static int toggleBit(int n, int i) { return n ^ (1 << i); }  @@toggle`,
          python: `def get_bit(n, i):    return (n >> i) & 1                 @@get
def set_bit(n, i):    return n | (1 << i)                 @@set
def clear_bit(n, i):  return n & ~(1 << i)                @@clear
def toggle_bit(n, i): return n ^ (1 << i)                 @@toggle`,
          pseudo: `Algorithm BitAtPosition(val n, val i)
1. GetBit(n, i)    = (n >> i) & 1                   @@get
2. SetBit(n, i)    = n | (1 << i)                   @@set
3. ClearBit(n, i)  = n & ~(1 << i)                  @@clear
4. ToggleBit(n, i) = n ^ (1 << i)                   @@toggle
End BitAtPosition`,
        },
        run({ n, i, action }) {
          const R = new DSA.Recorder();
          const N = (Math.trunc(n) & 0xFF) >>> 0;
          const pos = Math.max(0, Math.min(7, Math.trunc(i)));
          const col = BITS - 1 - pos;
          const mask = (1 << pos) >>> 0;

          R.step({
            line: action,
            msg: `Tạo mặt nạ <code>mask = 1 &lt;&lt; ${pos} = ${mask}</code> (chỉ có bit <code>b${pos}</code> bằng <code>1</code>).`,
            vars: { n: N, i: pos, mask },
            panels: [
              bitRowPanel('pn', 'Số ban đầu n', N, { [col]: 'compare' }, [{ i: col, label: 'b' + pos, hl: 'compare' }]),
              bitRowPanel('pm', 'Mặt nạ (1 << ' + pos + ')', mask, { [col]: 'pivot' }),
            ],
          });

          if (action === 'get') {
            const bit = (N >>> pos) & 1;
            R.step({
              line: 'get',
              msg: `<code>(n &gt;&gt; ${pos}) &amp; 1 = <b>${bit}</b></code> → bit thứ <code>${pos}</code> của <code>${N}</code> là <b>${bit}</b>.`,
              vars: { n: N, i: pos, bitValue: bit },
              panels: [
                bitRowPanel('pn', 'Số n', N, { [col]: 'found' }, [{ i: col, label: 'bit=' + bit, hl: 'found' }]),
              ],
            });
          } else if (action === 'set') {
            const res = (N | mask) & 0xFF;
            R.step({
              line: 'set',
              msg: `<code>n | (1 &lt;&lt; ${pos}) = ${N} | ${mask} = <b>${res}</b></code> (bit <code>b${pos}</code> được bật thành <code>1</code>).`,
              vars: { before: N, i: pos, after: res },
              panels: [
                bitRowPanel('pn', 'Trước (n)', N, { [col]: 'compare' }),
                bitRowPanel('pm', 'Mặt nạ (1 << ' + pos + ')', mask, { [col]: 'pivot' }),
                bitRowPanel('pr', 'Sau khi Set bit ' + pos, res, { [col]: 'found' }, [{ i: col, label: 'set=1', hl: 'found' }]),
              ],
            });
          } else if (action === 'clear') {
            const invMask = (~mask) & 0xFF;
            const res = (N & invMask) & 0xFF;
            R.step({
              line: 'clear',
              msg: `<code>n &amp; ~(1 &lt;&lt; ${pos}) = ${N} &amp; ${invMask} = <b>${res}</b></code> (bit <code>b${pos}</code> bị xóa về <code>0</code>).`,
              vars: { before: N, i: pos, invMask, after: res },
              panels: [
                bitRowPanel('pn', 'Trước (n)', N, { [col]: 'compare' }),
                bitRowPanel('pm', 'Mặt nạ đảo ~(1 << ' + pos + ')', invMask, { [col]: 'swap' }),
                bitRowPanel('pr', 'Sau khi Clear bit ' + pos, res, { [col]: 'found' }, [{ i: col, label: 'clear=0', hl: 'found' }]),
              ],
            });
          } else {
            const res = (N ^ mask) & 0xFF;
            R.step({
              line: 'toggle',
              msg: `<code>n ^ (1 &lt;&lt; ${pos}) = ${N} ^ ${mask} = <b>${res}</b></code> (bit <code>b${pos}</code> bị đảo trạng thái).`,
              vars: { before: N, i: pos, after: res },
              panels: [
                bitRowPanel('pn', 'Trước (n)', N, { [col]: 'compare' }),
                bitRowPanel('pm', 'Mặt nạ (1 << ' + pos + ')', mask, { [col]: 'pivot' }),
                bitRowPanel('pr', 'Sau khi Toggle bit ' + pos, res, { [col]: 'found' }, [{ i: col, label: 'toggled', hl: 'found' }]),
              ],
            });
          }
          return R.steps;
        },
      },
      {
        id: 'kernighan',
        label: 'Brian Kernighan: Đếm bit 1 & Lowbit (n & -n)',
        args: [{ id: 'n', label: 'Số nguyên dương n (1..255)', type: 'number', value: 108, random: () => DSA.randInt(1, 255) }],
        code: {
          cpp: `int countSetBits(int n) { // Brian Kernighan's Algorithm
    int count = 0;                                  @@init
    while (n > 0) {                                 @@loop
        int lowbit = n & -n; // rightmost set bit   @@lowbit
        n = n & (n - 1);     // clear rightmost 1   @@clearLow
        count++;                                    @@inc
    }
    return count;                                   @@done
}
bool isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;             @@done
}`,
          java: `static int countSetBits(int n) {
    int count = 0;                                  @@init
    while (n > 0) {                                 @@loop
        int lowbit = n & -n;                        @@lowbit
        n = n & (n - 1);                            @@clearLow
        count++;                                    @@inc
    }
    return count;                                   @@done
}`,
          python: `def count_set_bits(n):
    count = 0                                       @@init
    while n > 0:                                    @@loop
        lowbit = n & -n                             @@lowbit
        n &= (n - 1)                                @@clearLow
        count += 1                                  @@inc
    return count                                    @@done`,
          pseudo: `Algorithm BrianKernighan_Popcount(val n)
count = 0                                           @@init
while n > 0 do                                      @@loop
    lowbit = n & (-n)      // isolate lowest 1-bit  @@lowbit
    n = n & (n - 1)        // strip lowest 1-bit    @@clearLow
    count = count + 1                               @@inc
end
// Note: n is power of 2 iff n > 0 and (n & (n - 1)) == 0
return count                                        @@done`,
        },
        run({ n }) {
          const R = new DSA.Recorder();
          const orig = Math.max(1, Math.min(255, Math.trunc(n)));
          let cur = orig;
          let count = 0;

          R.step({
            line: 'init',
            msg: `Khởi tạo <code>n = ${cur}</code> (<code>0b${toBinStr(cur)}</code>), <code>count = 0</code>. Mỗi bước <code>n &amp; (n - 1)</code> sẽ xóa đúng 1 bit <code>1</code> thấp nhất.`,
            vars: { n: cur, count },
            panels: [bitRowPanel('pn', 'n hiện tại', cur)],
          });

          while (cur > 0) {
            const lowbit = cur & -cur;
            const pos = Math.round(Math.log2(lowbit));
            const col = BITS - 1 - pos;
            const prev = cur;
            const next = cur & (cur - 1);
            count++;

            R.step({
              line: ['lowbit', 'clearLow', 'inc'],
              msg: `Lượt ${count}: <code>lowbit = ${prev} &amp; -${prev} = ${lowbit}</code> (tại <code>b${pos}</code>) → xóa bằng <code>${prev} &amp; ${prev - 1} = <b>${next}</b></code> (<code>count = ${count}</code>).`,
              vars: { prevN: prev, 'n - 1': prev - 1, lowbit, nextN: next, count },
              panels: [
                bitRowPanel('pp', 'n trước bước ' + count, prev, { [col]: 'swap' }, [{ i: col, label: 'lowbit=' + lowbit, hl: 'swap' }]),
                bitRowPanel('pm', 'n - 1', prev - 1, { [col]: 'compare' }),
                bitRowPanel('pn', 'n & (n - 1)', next, {}),
              ],
            });
            cur = next;
          }

          const isPow2 = (orig & (orig - 1)) === 0;
          R.step({
            line: 'done',
            msg: `Hoàn tất! Số bit 1 của <code>${orig}</code> là <b>${count}</b> (${isPow2 ? 'là lũy thừa của 2 vì chỉ có 1 bit 1' : 'không phải lũy thừa của 2'}).`,
            vars: { originalN: orig, popcount: count, isPowerOfTwo: isPow2 },
            panels: [bitRowPanel('po', 'Giá trị ban đầu n = ' + orig, orig)],
          });
          return R.steps;
        },
      },
    ],
  });

  /* ---------------------------------------------------------------------
   * 2. Bitmask & Subset Enumeration (O(2^n) & O(3^n) Submask)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'bitwise-subset',
    chapter: 'bitwise',
    name: 'Mặt nạ Bit & Sinh tập con (Bitmask & Submask)',
    short: 'O(2^n) / O(3^n)',
    complexity: [
      ['Duyệt mọi tập con của N phần tử', 'O(N · 2^N)'],
      ['Duyệt mọi tập con của mọi mask', '∑ 2^|mask| = O(3^N)'],
      ['Kỹ thuật nhảy Submask', 'sub = (sub - 1) & mask'],
    ],
    description:
      '<p>Một số nguyên <code>mask</code> độ dài <code>n</code> bit biểu diễn một tập con của <code>n</code> phần tử: bit thứ <code>i</code> bằng <code>1</code> nghĩa là phần tử <code>A[i]</code> được chọn.</p>' +
      '<ul>' +
      '<li><b>Sinh toàn bộ tập con (<code>0 .. 2<sup>n</sup> − 1</code>)</b>: kiểm tra bit <code>i</code> bằng <code>(mask &gt;&gt; i) &amp; 1</code>.</li>' +
      '<li><b>Duyệt mọi tập con của một <code>mask</code> (Submask Enumeration)</b>: bắt đầu từ <code>sub = mask</code>, mỗi bước cập nhật <code>sub = (sub - 1) &amp; mask</code> — kỹ thuật kinh điển giúp tổng số phép lặp qua tất cả các <code>mask</code> chỉ là <code>O(3<sup>n</sup>)</code> thay vì <code>O(4<sup>n</sup>)</code> trong Quy hoạch động Bitmask ICPC.</li>' +
      '</ul>',
    ops: [
      {
        id: 'all-subsets',
        label: 'Duyệt toàn bộ 2^n tập con (0 .. (1 << n) - 1)',
        args: [
          { id: 'arr', label: 'Tập hợp phần tử (tối đa 5 phần tử)', type: 'array', value: 'A B C D' },
        ],
        code: {
          cpp: `void enumerateSubsets(const std::vector<std::string>& A) {
    int n = A.size();
    for (int mask = 0; mask < (1 << n); ++mask) {    @@maskLoop
        std::vector<std::string> subset;
        for (int i = 0; i < n; ++i) {               @@bitLoop
            if ((mask >> i) & 1)                    @@chkBit
                subset.push_back(A[i]);             @@pick
        }
        process(mask, subset);                      @@emit
    }
}`,
          java: `static void enumerateSubsets(String[] A) {
    int n = A.length;
    for (int mask = 0; mask < (1 << n); mask++) {   @@maskLoop
        List<String> subset = new ArrayList<>();
        for (int i = 0; i < n; i++) {               @@bitLoop
            if (((mask >> i) & 1) == 1)             @@chkBit
                subset.add(A[i]);                   @@pick
        }
        process(mask, subset);                      @@emit
    }
}`,
          python: `def enumerate_subsets(A):
    n = len(A)
    for mask in range(1 << n):                      @@maskLoop
        subset = []
        for i in range(n):                          @@bitLoop
            if (mask >> i) & 1:                     @@chkBit
                subset.append(A[i])                 @@pick
        process(mask, subset)                       @@emit`,
          pseudo: `Algorithm EnumerateSubsets(A[0..n-1])
for mask = 0 to (1 << n) - 1 do                     @@maskLoop
    subset = {}
    for i = 0 to n - 1 do                           @@bitLoop
        if (mask >> i) & 1 == 1 then                @@chkBit
            add A[i] to subset                      @@pick
        end
    end
    output(mask, subset)                            @@emit
end`,
        },
        run({ arr }) {
          const items = (arr && arr.length ? arr : ['A', 'B', 'C', 'D']).slice(0, 5);
          const n = items.length;
          const total = 1 << n;
          const R = new DSA.Recorder();
          const rows = [];

          for (let mask = 0; mask < total; mask++) {
            const sub = [];
            const arrHl = {};
            const bitHl = {};
            for (let i = 0; i < n; i++) {
              if ((mask >> i) & 1) {
                sub.push(items[i]);
                arrHl[i] = 'found';
                bitHl[n - 1 - i] = 'found';
              } else {
                arrHl[i] = 'dim';
              }
            }
            const subStr = sub.length ? '{ ' + sub.join(', ') + ' }' : '∅';
            rows.push([mask, toBinStr(mask, n), subStr]);

            R.step({
              line: 'emit',
              msg: `<code>mask = ${mask}</code> (<code>0b${toBinStr(mask, n)}</code>) → Tập con: <b>${subStr}</b>.`,
              vars: { mask, binary: toBinStr(mask, n), subset: subStr },
              panels: [
                {
                  kind: 'array', key: 'el', half: true,
                  title: 'Tập gốc A[0..' + (n - 1) + ']',
                  values: items, hl: arrHl,
                },
                Object.assign(bitRowPanel('bm', 'Bitmask (' + n + '-bit)', mask, bitHl, [], n), { half: true }),
                {
                  kind: 'table', key: 'tb', compact: true,
                  title: `Danh sách tập con đã sinh (${mask + 1}/${total})`,
                  headers: ['mask (dec)', 'Bitmask', 'Tập con tương ứng'],
                  rows: rows.slice(),
                  rowHl: { [mask]: 'found' },
                },
              ],
            });
          }
          return R.steps;
        },
      },
      {
        id: 'submask',
        label: 'Submask Enumeration: sub = (sub - 1) & mask',
        args: [
          { id: 'mask', label: 'Mặt nạ gốc mask (1..31)', type: 'number', value: 21 },
          { id: 'arr', label: 'Nhãn 5 bit (b0..b4)', type: 'array', value: 'x0 x1 x2 x3 x4' },
        ],
        code: {
          cpp: `void enumerateSubmasks(int mask) {
    // Visits every submask of 'mask' in decreasing order: O(2^popcount(mask))
    for (int sub = mask; sub > 0; sub = (sub - 1) & mask) { @@subStep
        process(sub);                               @@emit
    }
    process(0); // empty submask                     @@empty
}`,
          java: `static void enumerateSubmasks(int mask) {
    for (int sub = mask; sub > 0; sub = (sub - 1) & mask) { @@subStep
        process(sub);                               @@emit
    }
    process(0);                                     @@empty
}`,
          python: `def enumerate_submasks(mask):
    sub = mask
    while sub > 0:                                  @@subStep
        process(sub)                                @@emit
        sub = (sub - 1) & mask                      @@subStep
    process(0)                                      @@empty`,
          pseudo: `Algorithm EnumerateSubmasks(val mask)
sub = mask                                          @@subStep
while sub > 0 do
    process(sub)                                    @@emit
    sub = (sub - 1) & mask // jump directly to next valid submask @@subStep
end
process(0)                                          @@empty
End EnumerateSubmasks`,
        },
        run({ mask, arr }) {
          const R = new DSA.Recorder();
          const M = Math.max(1, Math.min(31, Math.trunc(mask)));
          const labels = (arr && arr.length >= 5 ? arr : ['x0', 'x1', 'x2', 'x3', 'x4']).slice(0, 5);
          const rows = [];
          const maskHl = {};
          for (let i = 0; i < 5; i++) if ((M >> i) & 1) maskHl[4 - i] = 'active';

          const decode = (s) => {
            const pick = [];
            for (let i = 0; i < 5; i++) if ((s >> i) & 1) pick.push(labels[i]);
            return pick.length ? '{ ' + pick.join(', ') + ' }' : '∅';
          };

          let sub = M;
          while (true) {
            const subHl = {};
            for (let i = 0; i < 5; i++) if ((sub >> i) & 1) subHl[4 - i] = 'found';
            const nextSub = sub > 0 ? ((sub - 1) & M) : -1;
            rows.push([sub, toBinStr(sub, 5), decode(sub), nextSub >= 0 ? `(${sub} - 1) & ${M} = ${nextSub}` : 'Dừng']);

            R.step({
              line: sub > 0 ? 'emit' : 'empty',
              msg: sub > 0
                ? `Submask <code>sub = ${sub}</code> (<code>${toBinStr(sub, 5)}</code>) → bước nhảy kế tiếp: <code>(${sub} − 1) &amp; ${M} = <b>${nextSub}</b></code>.`
                : `Đạt tới tập con rỗng <code>sub = 0</code> (<code>00000</code>) → kết thúc!`,
              vars: { mask: M, sub, nextSub: nextSub >= 0 ? nextSub : 'END', subset: decode(sub) },
              panels: [
                Object.assign(bitRowPanel('pm', 'Mask cố định', M, maskHl, [], 5), { half: true }),
                Object.assign(bitRowPanel('ps', 'Submask hiện tại', sub, subHl, [], 5), { half: true }),
                {
                  kind: 'table', key: 'tb', compact: true,
                  title: `Chuỗi submask của mask = ${M} (${toBinStr(M, 5)})`,
                  headers: ['sub', 'Nhị phân', 'Tập con', 'Công thức nhảy tiếp'],
                  rows: rows.slice(),
                  rowHl: { [rows.length - 1]: 'found' },
                },
              ],
            });
            if (sub === 0) break;
            sub = nextSub;
          }
          return R.steps;
        },
      },
    ],
  });

  /* ---------------------------------------------------------------------
   * 3. Classic ICPC Bitwise Problems
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'bitwise-icpc',
    chapter: 'bitwise',
    name: 'Bài toán kinh điển ICPC (XOR, Binary Exp, Bitmask DP, Fenwick BIT)',
    short: 'ICPC Classics',
    complexity: [
      ['Single Number (XOR)', 'Time O(n), Space O(1)'],
      ['Binary Exponentiation', 'O(log b) phép nhân'],
      ['TSP Bitmask DP', 'Time O(2^n · n²), Space O(2^n · n)'],
      ['Fenwick Tree (BIT)', 'Update / Query O(log n) dùng i & -i'],
    ],
    description:
      '<p>4 mẫu bài toán kinh điển xuất hiện thường xuyên trong các kỳ thi lập trình đối kháng <b>ICPC / Competitive Programming</b>:</p>' +
      '<ol>' +
      '<li><b>Single Number I &amp; II (XOR Tricks)</b>: dùng tính chất <code>x ^ x = 0</code> để triệt tiêu các phần tử xuất hiện chẵn lần trong <code>O(1)</code> bộ nhớ; khi có 2 phần tử xuất hiện lẻ lần, dùng <code>lowbit = xorAll &amp; -xorAll</code> để chia mảng thành 2 nhóm.</li>' +
      '<li><b>Lũy thừa nhị phân (Binary Exponentiation)</b>: tính <code>a<sup>b</sup> mod m</code> bằng cách duyệt từng bit của số mũ <code>b</code> trong <code>O(log b)</code>.</li>' +
      '<li><b>Quy hoạch động Bitmask – Bài toán Người du lịch (TSP)</b>: trạng thái <code>dp[mask][u]</code> lưu chi phí đường đi ngắn nhất thăm tập thành phố <code>mask</code> và kết thúc tại <code>u</code>.</li>' +
      '<li><b>Cây chỉ số nhị phân (Fenwick Tree / BIT)</b>: cập nhật điểm <code>i += i &amp; -i</code> và truy vấn tổng tiền tố <code>i -= i &amp; -i</code> trong <code>O(log n)</code>.</li>' +
      '</ol>',
    ops: [
      {
        id: 'single-number',
        label: 'ICPC 1: Tìm phần tử xuất hiện lẻ lần (XOR & Lowbit)',
        args: [
          {
            id: 'mode', label: 'Biến thể bài toán', type: 'select', value: 'two',
            options: [
              { value: 'one', label: 'Single Number I: 1 phần tử xuất hiện lẻ lần' },
              { value: 'two', label: 'Single Number II: 2 phần tử xuất hiện lẻ lần (tách bằng Lowbit)' },
            ],
          },
          { id: 'arr', label: 'Mảng số nguyên', type: 'array', value: '4 1 2 1 2 7' },
        ],
        code: {
          cpp: `// Variant 1: Single unique element
int singleNumber(const std::vector<int>& a) {
    int ans = 0;                                    @@init
    for (int x : a) ans ^= x;                       @@xorLoop
    return ans;                                     @@done1
}
// Variant 2: Two unique elements (a != b)
std::pair<int,int> singleNumberTwo(const std::vector<int>& nums) {
    int xorAll = 0;                                 @@init
    for (int x : nums) xorAll ^= x;                 @@xorLoop
    int lowbit = xorAll & -xorAll; // bit where a and b differ @@lowbit
    int a = 0, b = 0;
    for (int x : nums) {
        if (x & lowbit) a ^= x;                     @@splitA
        else b ^= x;                                @@splitB
    }
    return {a, b};                                  @@done2
}`,
          java: `static int[] singleNumberTwo(int[] nums) {
    int xorAll = 0;                                 @@init
    for (int x : nums) xorAll ^= x;                 @@xorLoop
    int lowbit = xorAll & -xorAll;                  @@lowbit
    int a = 0, b = 0;
    for (int x : nums) {
        if ((x & lowbit) != 0) a ^= x;              @@splitA
        else b ^= x;                                @@splitB
    }
    return new int[]{a, b};                         @@done2
}`,
          python: `def single_number_two(nums):
    xor_all = 0                                     @@init
    for x in nums: xor_all ^= x                     @@xorLoop
    lowbit = xor_all & -xor_all                     @@lowbit
    a = b = 0
    for x in nums:
        if x & lowbit: a ^= x                       @@splitA
        else: b ^= x                                @@splitB
    return a, b                                     @@done2`,
          pseudo: `Algorithm SingleNumber_ICPC(nums[0..n-1])
xorAll = 0                                          @@init
for each x in nums do xorAll = xorAll ^ x end       @@xorLoop
// If 1 unique element -> return xorAll              @@done1
// If 2 unique elements (a, b):
lowbit = xorAll & (-xorAll)                         @@lowbit
a = 0; b = 0
for each x in nums do
    if (x & lowbit) != 0 then a = a ^ x             @@splitA
    else b = b ^ x end                              @@splitB
end
return (a, b)                                       @@done2`,
        },
        run({ mode, arr }) {
          const R = new DSA.Recorder();
          const nums = arr && arr.length ? arr.map((x) => Math.trunc(x) & 0xFF) : [4, 1, 2, 1, 2, 7];
          let xorAll = 0;

          R.step({
            line: 'init',
            msg: 'Khởi tạo thanh ghi tích lũy <code>xorAll = 0</code>. Các cặp số giống nhau sẽ tự triệt tiêu vì <code>x ^ x = 0</code>.',
            vars: { xorAll: 0 },
            panels: [
              { kind: 'array', key: 'a', title: 'Mảng đầu vào', values: nums },
              bitRowPanel('bx', 'Thanh ghi xorAll', 0),
            ],
          });

          nums.forEach((x, idx) => {
            const prev = xorAll;
            xorAll = (xorAll ^ x) & 0xFF;
            R.step({
              line: 'xorLoop',
              msg: `<code>xorAll = ${prev} ^ ${x} = <b>${xorAll}</b></code> (<code>0b${toBinStr(xorAll)}</code>).`,
              vars: { index: idx, 'nums[i]': x, prevXor: prev, xorAll },
              panels: [
                { kind: 'array', key: 'a', title: 'Mảng đầu vào', values: nums, hl: { [idx]: 'active' }, pointers: [{ i: idx, label: 'i=' + idx }] },
                bitRowPanel('bx', 'Thanh ghi xorAll', xorAll),
              ],
            });
          });

          if (mode === 'one' || xorAll === 0) {
            R.step({
              line: 'done1',
              msg: `Hoàn tất! Phần tử xuất hiện lẻ lần duy nhất là <b>${xorAll}</b>.`,
              vars: { answer: xorAll },
              panels: [
                { kind: 'array', key: 'a', title: 'Kết quả = ' + xorAll, values: nums, hl: Object.fromEntries(nums.map((v, i) => [i, v === xorAll ? 'found' : 'dim'])) },
                bitRowPanel('bx', 'Kết quả xorAll', xorAll),
              ],
            });
            return R.steps;
          }

          const lowbit = xorAll & -xorAll;
          const bitPos = Math.round(Math.log2(lowbit));
          R.step({
            line: 'lowbit',
            msg: `Tổng <code>xorAll = a ^ b = ${xorAll}</code> (<code>0b${toBinStr(xorAll)}</code>). Lấy <code>lowbit = ${xorAll} &amp; -${xorAll} = <b>${lowbit}</b></code> (bit <code>b${bitPos}</code>): tại bit này <code>a</code> và <code>b</code> chắc chắn khác nhau!`,
            vars: { xorAll, lowbit, differingBit: 'b' + bitPos },
            panels: [
              bitRowPanel('bx', 'xorAll = a ^ b', xorAll, { [BITS - 1 - bitPos]: 'pivot' }),
              bitRowPanel('bl', 'lowbit = xorAll & -xorAll', lowbit, { [BITS - 1 - bitPos]: 'found' }),
            ],
          });

          let gA = 0, gB = 0;
          const hlGroup = {};
          nums.forEach((x, idx) => {
            const inA = (x & lowbit) !== 0;
            if (inA) gA = (gA ^ x) & 0xFF;
            else gB = (gB ^ x) & 0xFF;
            hlGroup[idx] = inA ? 'active' : 'pivot';
            R.step({
              line: inA ? 'splitA' : 'splitB',
              msg: `<code>${x} &amp; ${lowbit} ${inA ? '≠ 0 → Nhóm A' : '= 0 → Nhóm B'}</code>: cập nhật <code>a = ${gA}</code>, <code>b = ${gB}</code>.`,
              vars: { x, group: inA ? 'Nhóm A (bit=1)' : 'Nhóm B (bit=0)', a: gA, b: gB },
              panels: [
                { kind: 'array', key: 'a', title: 'Phân nhóm theo bit b' + bitPos + ' (Xanh: nhóm A, Cam: nhóm B)', values: nums, hl: Object.assign({}, hlGroup), pointers: [{ i: idx, label: inA ? 'A' : 'B' }] },
              ],
            });
          });

          R.step({
            line: 'done2',
            msg: `Hoàn tất! Hai phần tử xuất hiện lẻ lần là <b>a = ${gA}</b> và <b>b = ${gB}</b>.`,
            vars: { a: gA, b: gB },
            panels: [
              { kind: 'array', key: 'a', title: `Tìm thấy: a = ${gA}, b = ${gB}`, values: nums, hl: Object.fromEntries(nums.map((v, i) => [i, (v === gA || v === gB) ? 'found' : 'dim'])) },
            ],
          });
          return R.steps;
        },
      },
      {
        id: 'binpow',
        label: 'ICPC 2: Lũy thừa nhị phân (a^b mod m – O(log b))',
        args: [
          { id: 'a', label: 'Cơ số a', type: 'number', value: 3 },
          { id: 'b', label: 'Số mũ b (1..255)', type: 'number', value: 13 },
          { id: 'm', label: 'Modulo m', type: 'number', value: 1000 },
        ],
        code: {
          cpp: `long long binPow(long long a, long long b, long long m) {
    long long res = 1;                              @@init
    a %= m;                                         @@init
    while (b > 0) {                                 @@loop
        if (b & 1)                                  @@chkBit
            res = (res * a) % m;                    @@mulRes
        a = (a * a) % m;                            @@sqBase
        b >>= 1;                                    @@shiftB
    }
    return res;                                     @@done
}`,
          java: `static long binPow(long a, long b, long m) {
    long res = 1;                                   @@init
    a %= m;                                         @@init
    while (b > 0) {                                 @@loop
        if ((b & 1) == 1)                           @@chkBit
            res = (res * a) % m;                    @@mulRes
        a = (a * a) % m;                            @@sqBase
        b >>= 1;                                    @@shiftB
    }
    return res;                                     @@done
}`,
          python: `def bin_pow(a, b, m):
    res = 1                                         @@init
    a %= m                                          @@init
    while b > 0:                                    @@loop
        if b & 1:                                   @@chkBit
            res = (res * a) % m                     @@mulRes
        a = (a * a) % m                             @@sqBase
        b >>= 1                                     @@shiftB
    return res                                      @@done`,
          pseudo: `Algorithm BinaryExponentiation(val a, val b, val m)
res = 1; a = a mod m                                @@init
while b > 0 do                                      @@loop
    if (b & 1) == 1 then                            @@chkBit
        res = (res * a) mod m                       @@mulRes
    end
    a = (a * a) mod m                               @@sqBase
    b = b >> 1                                      @@shiftB
end
return res                                          @@done`,
        },
        run({ a, b, m }) {
          const R = new DSA.Recorder();
          const mod = Math.max(2, Math.trunc(m));
          const origA = Math.trunc(a);
          const origB = Math.max(1, Math.min(255, Math.trunc(b)));
          let curA = ((origA % mod) + mod) % mod;
          let curB = origB;
          let res = 1;
          let bitIdx = 0;
          const rows = [];

          R.step({
            line: 'init',
            msg: `Tính <code>${origA}<sup>${origB}</sup> mod ${mod}</code>: phân rã nhị phân <code>b = ${origB} = 0b${toBinStr(origB)}</code>, khởi tạo <code>res = 1</code>.`,
            vars: { a: curA, b: curB, m: mod, res },
            panels: [
              bitRowPanel('bb', 'Số mũ b (dịch phải dần từng bit)', curB, { [BITS - 1]: 'compare' }),
            ],
          });

          while (curB > 0) {
            const lsb = curB & 1;
            const prevA = curA;
            const prevRes = res;
            if (lsb === 1) res = (res * curA) % mod;
            const nextA = (curA * curA) % mod;
            const nextB = curB >>> 1;

            rows.push([
              `b${bitIdx} (2^${bitIdx})`,
              String(lsb),
              String(prevA),
              lsb === 1 ? `${prevRes} × ${prevA} ≡ ${res}` : `Giữ nguyên (${res})`,
              `b → ${nextB}`,
            ]);

            R.step({
              line: lsb === 1 ? 'mulRes' : 'sqBase',
              msg: `Bit <code>b${bitIdx} = ${lsb}</code>: ` +
                (lsb === 1 ? `nhân <code>res = (${prevRes} × ${prevA}) mod ${mod} = <b>${res}</b></code>; ` : `bỏ qua nhân; `) +
                `bình phương cơ số <code>a = ${nextA}</code> và dịch <code>b &gt;&gt;= 1 → ${nextB}</code>.`,
              vars: { bitIndex: bitIdx, 'b & 1': lsb, res, nextA, nextB },
              panels: [
                bitRowPanel('bb', 'Thanh ghi số mũ b', curB, { [BITS - 1]: lsb === 1 ? 'found' : 'compare' }, [{ i: BITS - 1, label: 'b&1=' + lsb }]),
                {
                  kind: 'table', key: 'tb', compact: true,
                  title: `Lũy thừa nhị phân ${origA}^${origB} mod ${mod}`,
                  headers: ['Bit', 'b & 1', 'Cơ số a^(2^i)', 'Cập nhật res', 'Dịch b'],
                  rows: rows.slice(),
                  rowHl: { [rows.length - 1]: 'found' },
                },
              ],
            });

            curA = nextA;
            curB = nextB;
            bitIdx++;
          }

          R.step({
            line: 'done',
            msg: `Hoàn tất sau <b>${bitIdx} bước</b> (thay vì ${origB} phép nhân)! Kết quả: <code>${origA}<sup>${origB}</sup> mod ${mod} = <b>${res}</b></code>.`,
            vars: { result: res, stepsUsed: bitIdx },
            panels: [
              {
                kind: 'table', key: 'tb', compact: true,
                title: `Kết quả: ${origA}^${origB} mod ${mod} = ${res}`,
                headers: ['Bit', 'b & 1', 'Cơ số a^(2^i)', 'Cập nhật res', 'Dịch b'],
                rows,
              },
            ],
          });
          return R.steps;
        },
      },
      {
        id: 'tsp-bitmask',
        label: 'ICPC 3: Bitmask DP – Người du lịch (TSP – O(2^n · n²))',
        args: [],
        code: {
          cpp: `int tspBitmaskDP(int n, const int dist[][4]) {
    int FULL = (1 << n) - 1;
    std::vector<std::vector<int>> dp(1 << n, std::vector<int>(n, INF)); @@init
    dp[1][0] = 0; // Start at city 0 (mask = 0001) @@init
    for (int mask = 1; mask <= FULL; ++mask) {      @@maskLoop
        for (int u = 0; u < n; ++u) {               @@uLoop
            if (!(mask & (1 << u)) || dp[mask][u] == INF) continue;
            for (int v = 0; v < n; ++v) {           @@vLoop
                if (mask & (1 << v)) continue;      // v already visited
                int nmask = mask | (1 << v);        @@trans
                dp[nmask][v] = std::min(dp[nmask][v], dp[mask][u] + dist[u][v]); @@trans
            }
        }
    }
    int ans = INF;
    for (int u = 1; u < n; ++u)                     @@retTour
        ans = std::min(ans, dp[FULL][u] + dist[u][0]); @@retTour
    return ans;
}`,
          java: `static int tspBitmaskDP(int n, int[][] dist) {
    int FULL = (1 << n) - 1;
    int[][] dp = new int[1 << n][n];
    for (int[] row : dp) Arrays.fill(row, INF);     @@init
    dp[1][0] = 0;                                   @@init
    for (int mask = 1; mask <= FULL; mask++) {      @@maskLoop
        for (int u = 0; u < n; u++) {               @@uLoop
            if ((mask & (1 << u)) == 0 || dp[mask][u] == INF) continue;
            for (int v = 0; v < n; v++) {           @@vLoop
                if ((mask & (1 << v)) != 0) continue;
                int nmask = mask | (1 << v);        @@trans
                dp[nmask][v] = Math.min(dp[nmask][v], dp[mask][u] + dist[u][v]); @@trans
            }
        }
    }
    int ans = INF;
    for (int u = 1; u < n; u++) ans = Math.min(ans, dp[FULL][u] + dist[u][0]); @@retTour
    return ans;
}`,
          python: `def tsp_bitmask_dp(n, dist):
    FULL = (1 << n) - 1
    dp = [[float('inf')] * n for _ in range(1 << n)] @@init
    dp[1][0] = 0                                    @@init
    for mask in range(1, FULL + 1):                 @@maskLoop
        for u in range(n):                          @@uLoop
            if not (mask & (1 << u)) or dp[mask][u] == float('inf'): continue
            for v in range(n):                      @@vLoop
                if mask & (1 << v): continue
                nmask = mask | (1 << v)             @@trans
                dp[nmask][v] = min(dp[nmask][v], dp[mask][u] + dist[u][v]) @@trans
    return min(dp[FULL][u] + dist[u][0] for u in range(1, n)) @@retTour`,
          pseudo: `Algorithm TSP_BitmaskDP(n, dist[0..n-1][0..n-1])
dp[0..(1<<n)-1][0..n-1] = INF
dp[1][0] = 0 // visited = {0}                       @@init
for mask = 1 to (1 << n) - 1 do                     @@maskLoop
    for u = 0 to n - 1 where (mask & (1 << u)) != 0 do @@uLoop
        for v = 0 to n - 1 where (mask & (1 << v)) == 0 do @@vLoop
            nmask = mask | (1 << v)                 @@trans
            dp[nmask][v] = min(dp[nmask][v], dp[mask][u] + dist[u][v]) @@trans
        end
    end
end
return min_{u} (dp[(1<<n)-1][u] + dist[u][0])       @@retTour`,
        },
        run() {
          const R = new DSA.Recorder();
          const n = 4;
          const dist = [
            [0, 10, 15, 20],
            [10, 0, 35, 25],
            [15, 35, 0, 30],
            [20, 25, 30, 0],
          ];
          const FULL = (1 << n) - 1;
          const dp = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
          dp[1][0] = 0;

          const makeTable = (hlRow) => {
            const rows = [];
            for (let m = 1; m <= FULL; m++) {
              if ((m & 1) === 0) continue;
              const setCities = [];
              for (let i = 0; i < n; i++) if ((m >> i) & 1) setCities.push('C' + i);
              rows.push([
                `${toBinStr(m, n)} ({${setCities.join(',')}})`,
                ...dp[m].map((v) => (v === Infinity ? '∞' : v)),
              ]);
            }
            return {
              kind: 'table', key: 'dp', compact: true,
              title: 'Bảng quy hoạch động dp[mask][u] (4 thành phố C0..C3, xuất phát tại C0)',
              headers: ['mask (Tập đã thăm)', 'u = C0', 'u = C1', 'u = C2', 'u = C3'],
              rows,
              rowHl: hlRow != null ? { [hlRow]: 'found' } : {},
            };
          };

          R.step({
            line: 'init',
            msg: 'Khởi tạo bài toán Người du lịch (TSP) 4 thành phố <code>C0..C3</code>: bắt đầu tại <code>C0</code> nên <code>dp[0001][0] = 0</code>.',
            vars: { n: 4, startMask: '0001', 'dp[0001][0]': 0 },
            panels: [makeTable(0)],
          });

          let rowCounter = 0;
          for (let mask = 1; mask <= FULL; mask++) {
            if ((mask & 1) === 0) continue;
            for (let u = 0; u < n; u++) {
              if (!((mask >> u) & 1) || dp[mask][u] === Infinity) continue;
              for (let v = 0; v < n; v++) {
                if ((mask >> v) & 1) continue;
                const nmask = mask | (1 << v);
                const cand = dp[mask][u] + dist[u][v];
                if (cand < dp[nmask][v]) {
                  dp[nmask][v] = cand;
                  const rIdx = (nmask - 1) >> 1;
                  R.step({
                    line: 'trans',
                    msg: `Chuyển trạng thái <code>mask = ${toBinStr(mask, n)}</code> (tại <code>C${u}</code>) → thăm thêm <code>C${v}</code>: <code>nmask = ${toBinStr(mask, n)} | (1 &lt;&lt; ${v}) = <b>${toBinStr(nmask, n)}</b></code>, cập nhật <code>dp[${toBinStr(nmask, n)}][${v}] = ${cand}</code>.`,
                    vars: { mask: toBinStr(mask, n), u: 'C' + u, v: 'C' + v, nmask: toBinStr(nmask, n), cost: cand },
                    panels: [makeTable(rIdx)],
                  });
                }
              }
            }
            rowCounter++;
          }
          void rowCounter;

          let best = Infinity, lastU = -1;
          for (let u = 1; u < n; u++) {
            if (dp[FULL][u] + dist[u][0] < best) {
              best = dp[FULL][u] + dist[u][0];
              lastU = u;
            }
          }
          R.step({
            line: 'retTour',
            msg: `Hoàn tất! Khép kín chu trình từ <code>mask = 1111</code> quay về <code>C0</code> (qua <code>C${lastU}</code>): chi phí nhỏ nhất = <b>${best}</b> (hành trình <code>C0 → C1 → C3 → C2 → C0</code>).`,
            vars: { fullMask: '1111', minTourCost: best },
            panels: [makeTable((FULL - 1) >> 1)],
          });
          return R.steps;
        },
      },
      {
        id: 'fenwick-bit',
        label: 'ICPC 4: Fenwick Tree / BIT (i += i & -i, i -= i & -i)',
        args: [
          { id: 'arr', label: 'Mảng A[1..8]', type: 'array', value: '3 2 -1 6 5 4 -3 3' },
          {
            id: 'opType', label: 'Thao tác BIT', type: 'select', value: 'query',
            options: [
              { value: 'query', label: 'Prefix Sum Query(idx): cộng dồn với i -= i & -i' },
              { value: 'update', label: 'Point Update(idx, +delta): cập nhật với i += i & -i' },
            ],
          },
          { id: 'idx', label: 'Chỉ số idx (1..8)', type: 'number', value: 7 },
          { id: 'delta', label: 'Giá trị cộng thêm delta (cho Update)', type: 'number', value: 5 },
        ],
        code: {
          cpp: `// 1-indexed Fenwick Tree (Binary Indexed Tree)
void update(int bit[], int n, int i, int delta) {
    while (i <= n) {                                @@updLoop
        bit[i] += delta;                            @@updAdd
        i += i & -i; // jump to parent range        @@updJump
    }
}
int query(const int bit[], int i) {
    int sum = 0;                                    @@qInit
    while (i > 0) {                                 @@qLoop
        sum += bit[i];                              @@qAdd
        i -= i & -i; // strip lowest set bit        @@qJump
    }
    return sum;                                     @@qDone
}`,
          java: `static void update(int[] bit, int i, int delta) {
    while (i < bit.length) {                        @@updLoop
        bit[i] += delta;                            @@updAdd
        i += i & -i;                                @@updJump
    }
}
static int query(int[] bit, int i) {
    int sum = 0;                                    @@qInit
    while (i > 0) {                                 @@qLoop
        sum += bit[i];                              @@qAdd
        i -= i & -i;                                @@qJump
    }
    return sum;                                     @@qDone
}`,
          python: `def update(bit, i, delta):
    while i < len(bit):                             @@updLoop
        bit[i] += delta                             @@updAdd
        i += i & -i                                 @@updJump

def query(bit, i):
    total = 0                                       @@qInit
    while i > 0:                                    @@qLoop
        total += bit[i]                             @@qAdd
        i -= i & -i                                 @@qJump
    return total                                    @@qDone`,
          pseudo: `Algorithm Fenwick_Update(ref BIT[1..n], val i, val delta)
while i <= n do                                     @@updLoop
    BIT[i] = BIT[i] + delta                         @@updAdd
    i = i + (i & (-i)) // move up to covering range @@updJump
end

Algorithm Fenwick_PrefixSum(val BIT[1..n], val i)
sum = 0                                             @@qInit
while i > 0 do                                      @@qLoop
    sum = sum + BIT[i]                              @@qAdd
    i = i - (i & (-i)) // jump to preceding block   @@qJump
end
return sum                                          @@qDone`,
        },
        run({ arr, opType, idx, delta }) {
          const R = new DSA.Recorder();
          const raw = (arr && arr.length ? arr : [3, 2, -1, 6, 5, 4, -3, 3]).slice(0, 8);
          while (raw.length < 8) raw.push(0);
          const n = 8;
          const bit = Array(n + 1).fill(0);
          for (let i = 1; i <= n; i++) {
            for (let j = i; j <= n; j += j & -j) bit[j] += raw[i - 1];
          }

          const bitRanges = Array.from({ length: n }, (_, k) => {
            const p = k + 1;
            const lb = p & -p;
            return `[${p - lb + 1}..${p}]`;
          });

          const startIdx = Math.max(1, Math.min(n, Math.trunc(idx)));

          if (opType === 'query') {
            let i = startIdx;
            let sum = 0;
            const visited = {};
            R.step({
              line: 'qInit',
              msg: `Truy vấn tổng tiền tố <code>query(${startIdx}) = A[1..${startIdx}]</code>: xuất phát tại <code>i = ${startIdx}</code> (<code>0b${toBinStr(startIdx, 4)}</code>).`,
              vars: { i, sum: 0 },
              panels: [
                { kind: 'array', key: 'a', title: 'Mảng gốc A[1..8]', indexBase: 1, values: raw },
                { kind: 'array', key: 'b', title: 'Mảng Fenwick BIT[1..8] (mỗi nút quản lý đoạn độ dài i & -i)', indexBase: 1, cellLabels: bitRanges, values: bit.slice(1) },
              ],
            });

            while (i > 0) {
              const lb = i & -i;
              sum += bit[i];
              visited[i - 1] = 'found';
              const nextI = i - lb;
              R.step({
                line: ['qAdd', 'qJump'],
                msg: `Cộng <code>BIT[${i}] = ${bit[i]}</code> (đoạn <code>[${i - lb + 1}..${i}]</code>) → <code>sum = <b>${sum}</b></code>; nhảy lùi <code>i = ${i} − (${i} &amp; -${i}) = ${i} − ${lb} = <b>${nextI}</b></code>.`,
                vars: { i, 'i & -i': lb, 'BIT[i]': bit[i], sum, nextI },
                panels: [
                  { kind: 'array', key: 'b', title: 'Mảng Fenwick BIT[1..8]', indexBase: 1, cellLabels: bitRanges, values: bit.slice(1), hl: Object.assign({}, visited), pointers: [{ i: i - 1, label: 'i=' + i, hl: 'found' }] },
                  bitRowPanel('bi', 'Chỉ số i (4-bit)', i, {}, [], 4),
                ],
              });
              i = nextI;
            }

            R.step({
              line: 'qDone',
              msg: `Hoàn tất! Tổng tiền tố <code>A[1..${startIdx}] = <b>${sum}</b></code>.`,
              vars: { queryIndex: startIdx, prefixSum: sum },
              panels: [
                { kind: 'array', key: 'b', title: `query(${startIdx}) = ${sum}`, indexBase: 1, cellLabels: bitRanges, values: bit.slice(1), hl: visited },
              ],
            });
          } else {
            const d = Math.trunc(delta) || 5;
            let i = startIdx;
            const visited = {};
            R.step({
              line: 'updLoop',
              msg: `Cập nhật điểm <code>update(idx = ${startIdx}, delta = +${d})</code>: bắt đầu tại <code>i = ${startIdx}</code> (<code>0b${toBinStr(startIdx, 4)}</code>).`,
              vars: { i, delta: d },
              panels: [
                { kind: 'array', key: 'b', title: 'Mảng Fenwick BIT[1..8] trước cập nhật', indexBase: 1, cellLabels: bitRanges, values: bit.slice(1) },
              ],
            });

            while (i <= n) {
              const lb = i & -i;
              bit[i] += d;
              visited[i - 1] = 'found';
              const nextI = i + lb;
              R.step({
                line: ['updAdd', 'updJump'],
                msg: `Cộng <code>delta = +${d}</code> vào <code>BIT[${i}]</code> (thành <b>${bit[i]}</b>); nhảy lên nút cha <code>i = ${i} + (${i} &amp; -${i}) = ${i} + ${lb} = <b>${nextI}</b></code>.`,
                vars: { i, 'i & -i': lb, 'BIT[i]': bit[i], nextI },
                panels: [
                  { kind: 'array', key: 'b', title: 'Mảng Fenwick BIT[1..8]', indexBase: 1, cellLabels: bitRanges, values: bit.slice(1), hl: Object.assign({}, visited), pointers: [{ i: i - 1, label: 'i=' + i, hl: 'found' }] },
                  bitRowPanel('bi', 'Chỉ số i (4-bit)', i, {}, [], 4),
                ],
              });
              i = nextI;
            }
          }
          return R.steps;
        },
      },
    ],
  });
})();