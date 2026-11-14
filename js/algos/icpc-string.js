/* =========================================================================
 * DSA Visualizer – icpc-string.js
 * Xử lý xâu (String Algorithms) – ICPC Classics
 * 1. KMP – Knuth-Morris-Pratt Pattern Matching
 * ========================================================================= */
(function () {
  'use strict';
  var DSA = window.DSA;
  var esc = DSA.escape;

  /* =====================================================================
   * KMP – Knuth-Morris-Pratt
   * =================================================================== */
  DSA.register({
    id: 'kmp',
    chapter: 'icpc-str',
    name: 'KMP (Knuth-Morris-Pratt)',
    short: 'O(n + m)',
    complexity: [
      ['Xây failure', 'O(m)  — m = |pattern|'],
      ['Tìm kiếm', 'O(n)  — n = |text|'],
      ['Tổng', 'O(n + m)'],
      ['Space', 'O(m)'],
    ],
    description:
      '<p><b>KMP</b> là thuật toán so khớp chuỗi tuyến tính. Ý tưởng chính: khi gặp mismatch, ' +
      'dùng <b>mảng failure (KMP table)</b> để biết nhảy bao xa thay vì quay lại từ đầu.</p>' +
      '<p><b>Failure function</b> <code>fail[i]</code> = độ dài tiền tố thực sự dài nhất của <code>pattern[0..i]</code> ' +
      'mà cũng là hậu tố của nó (proper prefix = suffix).</p>' +
      '<p>Nhờ vậy, mỗi ký tự trong text chỉ cần xét tối đa 1 lần → O(n + m).</p>',
    notes: [
      'Mảng failure (hay "prefix function") là trái tim của KMP.',
      'Failure function cũng dùng cho nhiều bài khác: tìm period, palindrome, …',
      'So với Rabin-Karp (hashing): KMP không bị hash collision, luôn O(n+m).',
      'Biến thể: Aho-Corasick (tìm nhiều pattern cùng lúc), Z-function.',
    ],
    ops: [
      /* ─── Op 1: Xây mảng Failure ─── */
      {
        id: 'failure',
        label: '① Xây Failure Function',
        args: [
          { id: 'pattern', label: 'Pattern', type: 'text', value: 'ABABCABAB', random: function () { var s = ''; for (var i = 0; i < DSA.randInt(5, 8); i++) s += 'ABC'[DSA.randInt(0, 2)]; return s; } },
        ],
        code: {
          cpp: `vector<int> buildFailure(const string& P) {
    int m = P.size();
    vector<int> fail(m, 0);                         @@init
    int k = 0;                                      @@initK
    for (int i = 1; i < m; i++) {                   @@loop
        while (k > 0 && P[k] != P[i])               @@fallback
            k = fail[k - 1];
        if (P[k] == P[i])                           @@match
            k++;                                    @@inc
        fail[i] = k;                                @@assign
    }
    return fail;
}`,
          java: `static int[] buildFailure(String P) {
    int m = P.length();
    int[] fail = new int[m];                        @@init
    int k = 0;                                      @@initK
    for (int i = 1; i < m; i++) {                   @@loop
        while (k > 0 && P.charAt(k) != P.charAt(i)) @@fallback
            k = fail[k - 1];
        if (P.charAt(k) == P.charAt(i))             @@match
            k++;                                    @@inc
        fail[i] = k;                                @@assign
    }
    return fail;
}`,
          python: `def build_failure(P):
    m = len(P)
    fail = [0] * m                                  @@init
    k = 0                                           @@initK
    for i in range(1, m):                           @@loop
        while k > 0 and P[k] != P[i]:               @@fallback
            k = fail[k - 1]
        if P[k] == P[i]:                            @@match
            k += 1                                  @@inc
        fail[i] = k                                 @@assign
    return fail`,
          pseudo: `Algorithm BuildFailure(P)
1. fail[0..m-1] ← 0                                 @@init
2. k ← 0                                            @@initK
3. For i = 1 to m-1:                                 @@loop
4.   While k > 0 AND P[k] ≠ P[i]:                   @@fallback
5.     k ← fail[k-1]
6.   If P[k] == P[i]: k ← k + 1                     @@match,@@inc
7.   fail[i] ← k                                    @@assign`,
        },
        run: function (args) {
          var P = String(args.pattern || '').toUpperCase().slice(0, 15);
          if (P.length < 2) throw new Error('Pattern cần ≥ 2 ký tự.');
          var m = P.length;
          var R = new DSA.Recorder();
          var fail = []; for (var i = 0; i < m; i++) fail[i] = 0;
          var patArr = P.split('');

          function panel(curI, curK, failArr) {
            var hl = {};
            if (curI >= 0) hl[curI] = 'active';
            if (curK >= 0 && curK !== curI) hl[curK] = 'compare';
            var ptrs = [];
            if (curI >= 0) ptrs.push({ i: curI, label: 'i=' + curI, hl: 'active' });
            if (curK >= 0) ptrs.push({ i: curK, label: 'k=' + curK, hl: 'compare' });
            return [
              { kind: 'array', key: 'pat', title: 'Pattern', values: patArr, hl: hl, pointers: ptrs },
              { kind: 'array', key: 'fail', title: 'fail[] (prefix function)', values: failArr.slice(), cellLabels: patArr },
            ];
          }

          R.step({
            line: 'init',
            msg: 'Khởi tạo: <code>fail[0..m-1] = 0</code>, <code>k = 0</code>. Pattern = "<b>' + esc(P) + '</b>".',
            vars: { m: m, k: 0, pattern: P },
            panels: panel(-1, -1, fail),
          });

          var k = 0;
          for (var i = 1; i < m; i++) {
            while (k > 0 && P[k] !== P[i]) {
              R.step({
                line: 'fallback',
                msg: 'P[' + k + ']="' + P[k] + '" ≠ P[' + i + ']="' + P[i] + '", fallback: <code>k = fail[' + (k - 1) + '] = ' + fail[k - 1] + '</code>',
                vars: { i: i, k: k, 'P[k]': P[k], 'P[i]': P[i] },
                panels: panel(i, k, fail),
              });
              k = fail[k - 1];
            }
            if (P[k] === P[i]) {
              k++;
              R.step({
                line: 'match',
                msg: 'P[' + (k - 1) + ']="' + P[k - 1] + '" == P[' + i + ']="' + P[i] + '" → <code>k++ = ' + k + '</code>',
                vars: { i: i, k: k, 'P[k-1]': P[k - 1], 'P[i]': P[i] },
                panels: panel(i, k - 1, fail),
              });
            }
            fail[i] = k;
            R.step({
              line: 'assign',
              msg: '<code>fail[' + i + '] = <b>' + k + '</b></code>' + (k > 0 ? ' → tiền tố "' + P.slice(0, k) + '" = hậu tố "' + P.slice(i - k + 1, i + 1) + '"' : ''),
              vars: { i: i, 'fail[i]': k },
              panels: panel(i, -1, fail),
            });
          }

          R.step({
            line: 'init',
            msg: 'Hoàn tất xây failure function! <code>fail = [' + fail.join(', ') + ']</code>',
            vars: { fail: '[' + fail.join(', ') + ']' },
            panels: panel(-1, -1, fail),
          });
          return R.steps;
        },
      },

      /* ─── Op 2: Tìm kiếm KMP ─── */
      {
        id: 'search',
        label: '② Tìm kiếm mẫu',
        args: [
          { id: 'text', label: 'Text', type: 'text', value: 'ABABDABACDABABCABAB', random: function () { var s = ''; for (var i = 0; i < DSA.randInt(15, 25); i++) s += 'ABCD'[DSA.randInt(0, 3)]; return s; } },
          { id: 'pattern', label: 'Pattern', type: 'text', value: 'ABABCABAB', random: function () { var s = ''; for (var i = 0; i < DSA.randInt(3, 6); i++) s += 'ABC'[DSA.randInt(0, 2)]; return s; } },
        ],
        code: {
          cpp: `void kmpSearch(const string& T, const string& P) {
    vector<int> fail = buildFailure(P);              @@build
    int j = 0;                                       @@initJ
    for (int i = 0; i < (int)T.size(); i++) {        @@loop
        while (j > 0 && T[i] != P[j])                @@mismatch
            j = fail[j - 1];
        if (T[i] == P[j])                            @@charMatch
            j++;
        if (j == (int)P.size()) {                    @@found
            cout << "Found at " << i - j + 1;
            j = fail[j - 1];                         @@continue
        }
    }
}`,
          java: `static List<Integer> kmpSearch(String T, String P) {
    int[] fail = buildFailure(P);                    @@build
    List<Integer> res = new ArrayList<>();
    int j = 0;                                       @@initJ
    for (int i = 0; i < T.length(); i++) {           @@loop
        while (j > 0 && T.charAt(i) != P.charAt(j))  @@mismatch
            j = fail[j - 1];
        if (T.charAt(i) == P.charAt(j))              @@charMatch
            j++;
        if (j == P.length()) {                       @@found
            res.add(i - j + 1);
            j = fail[j - 1];                         @@continue
        }
    }
    return res;
}`,
          python: `def kmp_search(T, P):
    fail = build_failure(P)                          @@build
    results = []
    j = 0                                            @@initJ
    for i in range(len(T)):                          @@loop
        while j > 0 and T[i] != P[j]:                @@mismatch
            j = fail[j - 1]
        if T[i] == P[j]:                             @@charMatch
            j += 1
        if j == len(P):                              @@found
            results.append(i - j + 1)
            j = fail[j - 1]                          @@continue
    return results`,
          pseudo: `Algorithm KMPSearch(T, P)
1. fail ← BuildFailure(P)                           @@build
2. j ← 0                                            @@initJ
3. For i = 0 to |T|-1:                               @@loop
4.   While j > 0 AND T[i] ≠ P[j]:                   @@mismatch
5.     j ← fail[j-1]
6.   If T[i] == P[j]: j ← j + 1                     @@charMatch
7.   If j == |P|: Found tại i-j+1, j ← fail[j-1]   @@found,@@continue`,
        },
        run: function (args) {
          var T = String(args.text || '').toUpperCase().slice(0, 30);
          var P = String(args.pattern || '').toUpperCase().slice(0, 12);
          if (T.length < 1 || P.length < 1) throw new Error('Cần nhập text và pattern.');
          if (P.length > T.length) throw new Error('Pattern dài hơn text!');
          var nT = T.length, nP = P.length;
          var R = new DSA.Recorder();

          // Build failure
          var fail = []; for (var i = 0; i < nP; i++) fail[i] = 0;
          var k = 0;
          for (var i = 1; i < nP; i++) {
            while (k > 0 && P[k] !== P[i]) k = fail[k - 1];
            if (P[k] === P[i]) k++;
            fail[i] = k;
          }

          var textArr = T.split('');
          var patArr = P.split('');

          function panel(ti, pj, foundAt) {
            var hlT = {};
            var hlP = {};
            var ptrsT = [];
            // Show pattern aligned under text
            var offset = ti - pj;  // pattern starts at this text index
            // Highlight text chars that have been matched so far
            for (var x = 0; x < pj; x++) {
              if (offset + x >= 0 && offset + x < nT) hlT[offset + x] = 'sorted';
            }
            if (ti >= 0 && ti < nT) {
              hlT[ti] = 'compare';
              ptrsT.push({ i: ti, label: 'i=' + ti, hl: 'compare' });
            }
            // Found positions
            if (foundAt) {
              for (var f = 0; f < foundAt.length; f++) {
                for (var x = 0; x < nP; x++) {
                  hlT[foundAt[f] + x] = 'found';
                }
              }
            }
            for (var x = 0; x < nP; x++) {
              if (x < pj) hlP[x] = 'sorted';
              else if (x === pj) hlP[x] = 'compare';
            }
            var ptrsP = [];
            if (pj >= 0 && pj < nP) ptrsP.push({ i: pj, label: 'j=' + pj, hl: 'compare' });

            return [
              { kind: 'array', key: 'text', title: 'Text (n=' + nT + ')', values: textArr, hl: hlT, pointers: ptrsT },
              { kind: 'array', key: 'pat', title: 'Pattern (m=' + nP + ') — offset=' + Math.max(0, offset), values: patArr, hl: hlP, pointers: ptrsP },
              { kind: 'array', key: 'fail', title: 'fail[]', values: fail, cellLabels: patArr },
            ];
          }

          R.step({
            line: 'build',
            msg: 'Đã xây failure function: <code>[' + fail.join(', ') + ']</code>. Bắt đầu tìm kiếm.',
            vars: { fail: '[' + fail.join(', ') + ']', j: 0 },
            panels: panel(-1, 0, null),
          });

          var j = 0;
          var foundPositions = [];
          for (var i = 0; i < nT; i++) {
            while (j > 0 && T[i] !== P[j]) {
              R.step({
                line: 'mismatch',
                msg: 'Mismatch: T[' + i + ']="' + T[i] + '" ≠ P[' + j + ']="' + P[j] + '". Fallback: <code>j = fail[' + (j - 1) + '] = ' + fail[j - 1] + '</code>.',
                vars: { i: i, j: j, 'T[i]': T[i], 'P[j]': P[j] },
                panels: panel(i, j, foundPositions.slice()),
              });
              j = fail[j - 1];
            }
            if (T[i] === P[j]) {
              R.step({
                line: 'charMatch',
                msg: 'Match: T[' + i + ']="' + T[i] + '" == P[' + j + ']="' + P[j] + '" → <code>j++ = ' + (j + 1) + '</code>',
                vars: { i: i, j: j + 1, 'T[i]': T[i], 'P[j]': P[j], matched: j + 1 },
                panels: panel(i, j, foundPositions.slice()),
              });
              j++;
            } else {
              R.step({
                line: 'loop',
                msg: 'Mismatch: T[' + i + ']="' + T[i] + '" ≠ P[0]="' + P[0] + '". j vẫn = 0, tiếp tục.',
                vars: { i: i, j: 0 },
                panels: panel(i, j, foundPositions.slice()),
              });
            }
            if (j === nP) {
              var pos = i - nP + 1;
              foundPositions.push(pos);
              R.step({
                line: 'found',
                msg: '🎯 <b>Tìm thấy pattern tại vị trí ' + pos + '!</b> (T[' + pos + '..' + i + ']). Tiếp tục: <code>j = fail[' + (j - 1) + '] = ' + fail[j - 1] + '</code>.',
                vars: { 'vị trí': pos, j: fail[j - 1], 'tìm thấy': foundPositions.length },
                panels: panel(i, j, foundPositions.slice()),
              });
              j = fail[j - 1];
            }
          }

          R.step({
            line: 'build',
            msg: foundPositions.length > 0
              ? 'Hoàn tất! Tìm thấy <b>' + foundPositions.length + '</b> lần tại vị trí: <code>[' + foundPositions.join(', ') + ']</code>.'
              : 'Hoàn tất! <b>Không tìm thấy</b> pattern trong text.',
            vars: { 'Số lần': foundPositions.length, 'Vị trí': foundPositions.join(', ') || 'N/A' },
            panels: panel(-1, 0, foundPositions),
          });
          return R.steps;
        },
      },
    ],
  });

})();
