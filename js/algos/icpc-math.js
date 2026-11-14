/* =========================================================================
 * DSA Visualizer – icpc-math.js
 * Số học (Number Theory) – ICPC Classics
 * 1. Sàng Eratosthenes (Sieve of Eratosthenes)
 * 2. Thuật toán Euclid (GCD)
 * 3. Lũy thừa nhanh (Binary Exponentiation)
 * ========================================================================= */
(function () {
  'use strict';
  var DSA = window.DSA;
  var esc = DSA.escape;

  /* =====================================================================
   * 1. Sàng Eratosthenes
   * =================================================================== */
  DSA.register({
    id: 'sieve-eratosthenes',
    chapter: 'icpc-math',
    name: 'Sàng Eratosthenes',
    short: 'O(n log log n)',
    complexity: [
      ['Time', 'O(n log log n)'],
      ['Space', 'O(n)'],
    ],
    description:
      '<p><b>Sàng Eratosthenes</b> là thuật toán tìm tất cả số nguyên tố ≤ N. Bắt đầu đánh dấu mọi số là "tiềm năng nguyên tố", ' +
      'rồi với mỗi số nguyên tố p tìm được, loại bỏ tất cả bội của p (p², p²+p, p²+2p, …).</p>' +
      '<p>Chỉ cần duyệt p ≤ √N. Sau khi sàng xong, các số chưa bị loại chính là số nguyên tố.</p>',
    notes: [
      'Chỉ cần duyệt p ≤ √N vì mọi hợp số ≤ N đều có ước nguyên tố ≤ √N.',
      'Bắt đầu đánh dấu bội từ p² (vì p×k với k < p đã bị đánh dấu bởi số nhỏ hơn).',
      'Có thể tối ưu bằng cách chỉ xét số lẻ (sàng chẵn-lẻ), giảm bộ nhớ 50%.',
      'Biến thể: Sieve of Euler (linear sieve) chạy O(n), Segmented Sieve cho khoảng [L, R].',
    ],
    ops: [{
      id: 'sieve',
      label: 'Sàng tìm số nguyên tố',
      args: [
        { id: 'n', label: 'N (giới hạn)', type: 'number', value: 50, random: function () { return String(DSA.randInt(20, 80)); } },
      ],
      code: {
        cpp: `vector<bool> sieve(int n) {
    vector<bool> is_prime(n + 1, true);
    is_prime[0] = is_prime[1] = false;              @@init
    for (int p = 2; p * p <= n; ++p) {              @@loop
        if (is_prime[p]) {                          @@check
            for (int j = p * p; j <= n; j += p)     @@mark
                is_prime[j] = false;
        }
    }
    return is_prime;                                @@done
}`,
        java: `static boolean[] sieve(int n) {
    boolean[] isPrime = new boolean[n + 1];
    Arrays.fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;                @@init
    for (int p = 2; p * p <= n; p++) {              @@loop
        if (isPrime[p]) {                           @@check
            for (int j = p * p; j <= n; j += p)     @@mark
                isPrime[j] = false;
        }
    }
    return isPrime;                                 @@done
}`,
        python: `def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False               @@init
    p = 2
    while p * p <= n:                               @@loop
        if is_prime[p]:                             @@check
            for j in range(p*p, n+1, p):            @@mark
                is_prime[j] = False
        p += 1
    return is_prime                                 @@done`,
        pseudo: `Algorithm Sieve(n)
1. Đánh dấu tất cả 2..n là nguyên tố               @@init
2. For p = 2 to √n:                                 @@loop
3.   If is_prime[p]:                                @@check
4.     Đánh dấu p², p²+p, p²+2p,… là hợp số        @@mark
5. Trả về danh sách số nguyên tố                    @@done`,
      },
      run: function (args) {
        var n = Math.max(10, Math.min(100, args.n | 0));
        var R = new DSA.Recorder();
        var isPrime = [];
        var vals = [];
        for (var i = 0; i <= n; i++) { isPrime[i] = (i >= 2); vals[i] = i; }
        // Display values 2..n
        var dVals = vals.slice(2);

        function makeHl(cur, marking) {
          var hl = {};
          for (var x = 0; x < dVals.length; x++) {
            var num = dVals[x];
            if (num === cur) hl[x] = 'active';
            else if (marking && marking.has(num)) hl[x] = 'swap';
            else if (!isPrime[num]) hl[x] = 'dim';
            else hl[x] = 'found';
          }
          return hl;
        }

        R.step({
          line: 'init',
          msg: 'Khởi tạo: đánh dấu tất cả số từ 2 đến ' + n + ' là <b>tiềm năng nguyên tố</b>.',
          vars: { N: n },
          panels: [{ kind: 'array', key: 'sv', title: 'Sàng [2..' + n + ']', values: dVals, hl: makeHl(-1), showIndex: false }],
        });

        var sqrtN = Math.floor(Math.sqrt(n));
        for (var p = 2; p <= sqrtN; p++) {
          if (!isPrime[p]) continue;
          R.step({
            line: 'check',
            msg: '<code>p = ' + p + '</code> chưa bị loại → <b>là số nguyên tố</b>. Loại các bội bắt đầu từ ' + p + '² = ' + (p * p) + '.',
            vars: { p: p, 'p²': p * p },
            panels: [{ kind: 'array', key: 'sv', title: 'Sàng [2..' + n + '] — p = ' + p, values: dVals, hl: makeHl(p), showIndex: false }],
          });

          var marked = new Set();
          for (var j = p * p; j <= n; j += p) {
            if (isPrime[j]) marked.add(j);
            isPrime[j] = false;
          }
          if (marked.size > 0) {
            var markedArr = []; marked.forEach(function (v) { markedArr.push(v); });
            R.step({
              line: 'mark',
              msg: 'Đánh dấu bội của ' + p + ': <code>' + markedArr.join(', ') + '</code> → hợp số.',
              vars: { p: p, 'bội bị loại': markedArr.join(', ') },
              panels: [{ kind: 'array', key: 'sv', title: 'Sàng [2..' + n + '] — loại bội ' + p, values: dVals, hl: makeHl(p, marked), showIndex: false }],
            });
          }
        }

        var primes = [];
        for (var x = 2; x <= n; x++) if (isPrime[x]) primes.push(x);
        R.step({
          line: 'done',
          msg: 'Hoàn tất! Tìm được <b>' + primes.length + ' số nguyên tố</b> ≤ ' + n + ': <code>' + primes.join(', ') + '</code>.',
          vars: { 'Số lượng': primes.length, 'Danh sách': primes.join(', ') },
          panels: [{ kind: 'array', key: 'sv', title: '✓ ' + primes.length + ' số nguyên tố ≤ ' + n, values: dVals, hl: makeHl(-1), showIndex: false }],
        });
        return R.steps;
      },
    }],
  });

  /* =====================================================================
   * 2. Thuật toán Euclid (GCD)
   * =================================================================== */
  DSA.register({
    id: 'euclidean-gcd',
    chapter: 'icpc-math',
    name: 'Thuật toán Euclid (GCD)',
    short: 'O(log min(a,b))',
    complexity: [
      ['Time', 'O(log min(a, b))'],
      ['Space', 'O(1) iterative / O(log) recursive'],
    ],
    description:
      '<p><b>Thuật toán Euclid</b> tìm ước chung lớn nhất (GCD) của hai số nguyên dương a, b.</p>' +
      '<p>Ý tưởng: <code>gcd(a, b) = gcd(b, a mod b)</code>. Lặp cho đến khi <code>b = 0</code>, khi đó <code>a</code> chính là GCD.</p>' +
      '<p>Đây là một trong những thuật toán cổ nhất (khoảng 300 TCN) và xuất hiện rất nhiều trong ICPC.</p>',
    notes: [
      '<code>gcd(a, 0) = a</code> — trường hợp cơ sở.',
      '<code>lcm(a, b) = a × b / gcd(a, b)</code> — tính LCM từ GCD.',
      'Extended Euclid: tìm x, y sao cho <code>ax + by = gcd(a, b)</code> (dùng trong Modular Inverse).',
      'Trường hợp xấu nhất: hai số Fibonacci liên tiếp (cần ~log₁.₆₁₈(n) bước).',
    ],
    ops: [{
      id: 'gcd',
      label: 'GCD(a, b)',
      args: [
        { id: 'a', label: 'a', type: 'number', value: 252, random: function () { return String(DSA.randInt(50, 500)); } },
        { id: 'b', label: 'b', type: 'number', value: 105, random: function () { return String(DSA.randInt(50, 500)); } },
      ],
      code: {
        cpp: `int gcd(int a, int b) {
    while (b != 0) {                                @@loop
        int r = a % b;                              @@mod
        a = b;                                      @@shift
        b = r;
    }
    return a;                                       @@done
}`,
        java: `static int gcd(int a, int b) {
    while (b != 0) {                                @@loop
        int r = a % b;                              @@mod
        a = b;                                      @@shift
        b = r;
    }
    return a;                                       @@done
}`,
        python: `def gcd(a, b):
    while b != 0:                                   @@loop
        r = a % b                                   @@mod
        a, b = b, r                                 @@shift
    return a                                        @@done`,
        pseudo: `Algorithm GCD(a, b)
1. While b ≠ 0:                                     @@loop
2.   r ← a mod b                                    @@mod
3.   a ← b, b ← r                                   @@shift
4. Return a                                         @@done`,
      },
      run: function (args) {
        var a = Math.abs(args.a | 0) || 1;
        var b = Math.abs(args.b | 0) || 1;
        var origA = a, origB = b;
        var R = new DSA.Recorder();

        var rows = [];
        var step = 0;

        function makeHtml(activeRow) {
          var h = '<div style="font-family:monospace;padding:8px;">';
          h += '<table style="border-collapse:collapse;font-size:14px;">';
          h += '<tr><th style="padding:6px 12px;border:1px solid var(--border,#555);background:var(--bg3,#333);">Bước</th>';
          h += '<th style="padding:6px 12px;border:1px solid var(--border,#555);background:var(--bg3,#333);">a</th>';
          h += '<th style="padding:6px 12px;border:1px solid var(--border,#555);background:var(--bg3,#333);">b</th>';
          h += '<th style="padding:6px 12px;border:1px solid var(--border,#555);background:var(--bg3,#333);">a mod b</th></tr>';
          for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var bg = i === activeRow ? 'background:#fbbf24;color:#000;font-weight:700;' : '';
            var cs = 'padding:6px 12px;border:1px solid var(--border,#555);text-align:center;' + bg;
            h += '<tr><td style="' + cs + '">' + (i + 1) + '</td>';
            h += '<td style="' + cs + '">' + r[0] + '</td>';
            h += '<td style="' + cs + '">' + r[1] + '</td>';
            h += '<td style="' + cs + '">' + r[2] + '</td></tr>';
          }
          h += '</table></div>';
          return h;
        }

        R.step({
          line: 'loop',
          msg: 'Tính <code>GCD(' + origA + ', ' + origB + ')</code>. Lặp cho đến khi <code>b = 0</code>.',
          vars: { a: a, b: b },
          panels: [{ kind: 'html', key: 'gcd', title: 'Thuật toán Euclid', html: makeHtml(-1) }],
        });

        while (b !== 0) {
          var r = a % b;
          rows.push([a, b, r]);
          step++;
          R.step({
            line: 'mod',
            msg: 'Bước ' + step + ': <code>' + a + ' mod ' + b + ' = <b>' + r + '</b></code>',
            vars: { a: a, b: b, 'a mod b': r, bước: step },
            panels: [{ kind: 'html', key: 'gcd', title: 'Thuật toán Euclid', html: makeHtml(rows.length - 1) }],
          });
          a = b;
          b = r;
          R.step({
            line: 'shift',
            msg: 'Gán: <code>a ← ' + a + '</code>, <code>b ← ' + b + '</code>',
            vars: { a: a, b: b, bước: step },
            panels: [{ kind: 'html', key: 'gcd', title: 'Thuật toán Euclid', html: makeHtml(rows.length - 1) }],
          });
        }

        R.step({
          line: 'done',
          msg: '<code>b = 0</code> → dừng. <b>GCD(' + origA + ', ' + origB + ') = ' + a + '</b>. LCM = ' + (origA * origB / a) + '.',
          vars: { GCD: a, LCM: origA * origB / a, 'Số bước': step },
          panels: [{ kind: 'html', key: 'gcd', title: '✓ GCD(' + origA + ', ' + origB + ') = ' + a, html: makeHtml(-1) }],
        });
        return R.steps;
      },
    }],
  });

  /* =====================================================================
   * 3. Lũy thừa nhanh (Binary Exponentiation)
   * =================================================================== */
  DSA.register({
    id: 'fast-power',
    chapter: 'icpc-math',
    name: 'Lũy thừa nhanh (Fast Power)',
    short: 'O(log n)',
    complexity: [
      ['Time', 'O(log n)  — n là số mũ'],
      ['Space', 'O(1)'],
    ],
    description:
      '<p><b>Binary Exponentiation</b> tính <code>base^exp mod m</code> trong O(log exp) bằng cách phân tích exp thành nhị phân.</p>' +
      '<p>Ý tưởng: <code>a^13 = a^(1101₂) = a^8 × a^4 × a^1</code>. Mỗi bước: nếu bit cuối = 1 → nhân result, rồi bình phương base và dịch exp.</p>',
    notes: [
      'Sử dụng rất phổ biến trong ICPC: tính modular exponentiation, nhân ma trận nhanh, …',
      '<code>a^(p-1) ≡ 1 (mod p)</code> (Fermat\'s little theorem) → <code>a^(-1) ≡ a^(p-2) (mod p)</code>.',
      'Ma trận lũy thừa: tính số Fibonacci thứ n trong O(log n) bằng nhân ma trận nhanh.',
    ],
    ops: [{
      id: 'pow',
      label: 'base^exp mod m',
      args: [
        { id: 'base', label: 'Cơ số (base)', type: 'number', value: 3, random: function () { return String(DSA.randInt(2, 10)); } },
        { id: 'exp', label: 'Số mũ (exp)', type: 'number', value: 13, random: function () { return String(DSA.randInt(5, 30)); } },
        { id: 'mod', label: 'Modulo (m)', type: 'number', value: 1000 },
      ],
      code: {
        cpp: `long long power(long long base, long long exp, long long mod) {
    long long result = 1;                           @@init
    base %= mod;
    while (exp > 0) {                               @@loop
        if (exp & 1)                                @@check
            result = result * base % mod;           @@mult
        base = base * base % mod;                   @@square
        exp >>= 1;                                  @@shift
    }
    return result;                                  @@done
}`,
        java: `static long power(long base, long exp, long mod) {
    long result = 1;                                @@init
    base %= mod;
    while (exp > 0) {                               @@loop
        if ((exp & 1) == 1)                         @@check
            result = result * base % mod;           @@mult
        base = base * base % mod;                   @@square
        exp >>= 1;                                  @@shift
    }
    return result;                                  @@done
}`,
        python: `def power(base, exp, mod):
    result = 1                                      @@init
    base %= mod
    while exp > 0:                                  @@loop
        if exp & 1:                                 @@check
            result = result * base % mod            @@mult
        base = base * base % mod                    @@square
        exp >>= 1                                   @@shift
    return result                                   @@done`,
        pseudo: `Algorithm FastPower(base, exp, mod)
1. result ← 1, base ← base mod m                    @@init
2. While exp > 0:                                    @@loop
3.   If bit cuối exp = 1:                            @@check
4.     result ← result × base mod m                  @@mult
5.   base ← base × base mod m                        @@square
6.   exp ← exp >> 1 (dịch phải 1 bit)                @@shift
7. Return result                                     @@done`,
      },
      run: function (args) {
        var base = Math.abs(args.base | 0) || 2;
        var exp = Math.abs(args.exp | 0) || 1;
        var mod = Math.abs(args.mod | 0) || 1000;
        var origBase = base, origExp = exp;
        var R = new DSA.Recorder();
        var result = 1;
        base = base % mod;

        // Compute binary of exp
        var bits = [];
        var tmp = origExp;
        while (tmp > 0) { bits.push(tmp & 1); tmp >>= 1; }
        bits.reverse();

        function makeHtml(curBit, rows) {
          var h = '<div style="font-family:monospace;padding:8px;">';
          // Binary representation
          h += '<div style="margin-bottom:12px;">Số mũ <b>' + origExp + '</b> = <span style="font-size:16px;">';
          for (var i = 0; i < bits.length; i++) {
            var bg = '';
            if (curBit >= 0 && (bits.length - 1 - i) === curBit) bg = 'background:#fbbf24;color:#000;border-radius:4px;padding:1px 4px;font-weight:700;';
            else if (curBit >= 0 && (bits.length - 1 - i) > curBit) bg = 'opacity:0.3;';
            h += '<span style="' + bg + '">' + bits[i] + '</span> ';
          }
          h += '</span>₂</div>';
          // Step table
          h += '<table style="border-collapse:collapse;font-size:13px;">';
          h += '<tr>';
          var headers = ['Bước', 'exp (bit)', 'Bit=1?', 'result', 'base'];
          for (var j = 0; j < headers.length; j++) {
            h += '<th style="padding:5px 10px;border:1px solid var(--border,#555);background:var(--bg3,#333);">' + headers[j] + '</th>';
          }
          h += '</tr>';
          for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var isLast = (i === rows.length - 1 && curBit >= 0);
            var bg2 = isLast ? 'background:#fbbf24;color:#000;font-weight:700;' : '';
            var cs = 'padding:5px 10px;border:1px solid var(--border,#555);text-align:center;' + bg2;
            h += '<tr>';
            for (var j = 0; j < r.length; j++) h += '<td style="' + cs + '">' + r[j] + '</td>';
            h += '</tr>';
          }
          h += '</table></div>';
          return h;
        }

        var rows = [];
        R.step({
          line: 'init',
          msg: 'Tính <code>' + origBase + '^' + origExp + ' mod ' + mod + '</code>. result = 1, base = ' + base + '.',
          vars: { result: result, base: base, exp: exp, mod: mod },
          panels: [{ kind: 'html', key: 'fp', title: 'Lũy thừa nhanh', html: makeHtml(-1, rows) }],
        });

        var step = 0;
        var e = exp;
        while (e > 0) {
          var bit = e & 1;
          var oldResult = result;
          var oldBase = base;
          if (bit) result = (result * base) % mod;
          rows.push([step + 1, e, bit ? '✓ Có' : '✗ Không', result, base]);
          R.step({
            line: bit ? 'mult' : 'check',
            msg: 'Bước ' + (step + 1) + ': exp = ' + e + ', bit cuối = <b>' + bit + '</b>' +
              (bit ? ' → <code>result = ' + oldResult + ' × ' + oldBase + ' mod ' + mod + ' = ' + result + '</code>' : ' → không nhân.'),
            vars: { bước: step + 1, exp: e, bit: bit, result: result, base: base },
            panels: [{ kind: 'html', key: 'fp', title: 'Lũy thừa nhanh', html: makeHtml(step, rows) }],
          });

          base = (base * base) % mod;
          rows[rows.length - 1][4] = base;  // update base in last row for display
          e >>= 1;
          step++;

          if (e > 0) {
            R.step({
              line: 'square',
              msg: 'Bình phương: <code>base = ' + oldBase + '² mod ' + mod + ' = ' + base + '</code>. Dịch exp: ' + e + '.',
              vars: { base: base, exp: e },
              panels: [{ kind: 'html', key: 'fp', title: 'Lũy thừa nhanh', html: makeHtml(step, rows) }],
            });
          }
        }

        R.step({
          line: 'done',
          msg: '<b>' + origBase + '<sup>' + origExp + '</sup> mod ' + mod + ' = ' + result + '</b>.',
          vars: { 'Kết quả': result },
          panels: [{ kind: 'html', key: 'fp', title: '✓ ' + origBase + '^' + origExp + ' mod ' + mod + ' = ' + result, html: makeHtml(-1, rows) }],
        });
        return R.steps;
      },
    }],
  });

})();
