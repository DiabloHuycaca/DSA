/* =========================================================================
 * DSA Visualizer – icpc-dp.js
 * Quy hoạch động (Dynamic Programming) – ICPC Classics
 * 1. Dãy con chung dài nhất (LCS)
 * 2. Bài toán cái túi 0/1 (Knapsack)
 * 3. Dãy con tăng dài nhất (LIS)
 * ========================================================================= */
(function () {
  'use strict';
  var DSA = window.DSA;
  var esc = DSA.escape;

  /* -----------------------------------------------------------------------
   * Helper: DP table HTML renderer
   * --------------------------------------------------------------------- */
  function dpTableHtml(cfg) {
    var dp = cfg.dp, nR = cfg.nR, nC = cfg.nC;
    var rLbl = cfg.rLbl, cLbl = cfg.cLbl;
    var curR = cfg.cur ? cfg.cur[0] : -1, curC = cfg.cur ? cfg.cur[1] : -1;
    var filledR = cfg.filled ? cfg.filled[0] : nR - 1;
    var filledC = cfg.filled ? cfg.filled[1] : nC - 1;
    var deps = cfg.deps || [];
    var path = cfg.path || null;
    var bs = 'border:1px solid var(--border,#555);';
    var hs = 'padding:4px 8px;text-align:center;font-weight:700;background:var(--bg3,#333);color:var(--fg,#eee);' + bs + 'font-size:13px;';
    var h = '<div style="overflow-x:auto;padding:4px;"><table style="border-collapse:collapse;font-family:monospace;">';
    h += '<tr><td style="' + hs + '"></td>';
    for (var j = 0; j < nC; j++) h += '<td style="' + hs + '">' + esc(String(cLbl[j])) + '</td>';
    h += '</tr>';
    for (var i = 0; i < nR; i++) {
      h += '<tr><td style="' + hs + '">' + esc(String(rLbl[i])) + '</td>';
      for (var j = 0; j < nC; j++) {
        var isFilled = (i < filledR) || (i === filledR && j <= filledC);
        var isCur = (i === curR && j === curC);
        var isDep = false;
        for (var d = 0; d < deps.length; d++) { if (deps[d][0] === i && deps[d][1] === j) { isDep = true; break; } }
        var isPath = path && path.has(i + ',' + j);
        var s = 'padding:4px 8px;text-align:center;' + bs + 'font-size:13px;min-width:28px;';
        if (isCur) s += 'background:#fbbf24;color:#000;font-weight:700;';
        else if (isDep) s += 'background:#60a5fa;color:#000;';
        else if (isPath) s += 'background:#34d399;color:#000;font-weight:700;';
        else if (isFilled) s += 'background:var(--bg2,#2a2a2a);';
        else s += 'opacity:0.2;';
        var val = (isFilled || isCur) ? dp[i][j] : '';
        h += '<td style="' + s + '">' + val + '</td>';
      }
      h += '</tr>';
    }
    h += '</table></div>';
    return h;
  }

  /* =====================================================================
   * 1. LCS – Dãy con chung dài nhất
   * =================================================================== */
  DSA.register({
    id: 'lcs',
    chapter: 'icpc-dp',
    name: 'Dãy con chung dài nhất (LCS)',
    short: 'O(m·n)',
    complexity: [
      ['Time', 'O(m × n)'],
      ['Space', 'O(m × n)  —  tối ưu O(min(m,n))'],
    ],
    description:
      '<p><b>LCS (Longest Common Subsequence)</b> tìm dãy con chung dài nhất của hai chuỗi X và Y.</p>' +
      '<p>Quan hệ DP: nếu <code>X[i] = Y[j]</code> thì <code>dp[i][j] = dp[i-1][j-1] + 1</code>, ' +
      'ngược lại <code>dp[i][j] = max(dp[i-1][j], dp[i][j-1])</code>.</p>' +
      '<p>Sau khi điền bảng, truy vết (backtrack) từ dp[m][n] để xây dựng LCS.</p>',
    notes: [
      'LCS ≠ Longest Common Substring (dãy con không cần liên tiếp).',
      'Biến thể: Edit Distance (Levenshtein), Diff tool trong Git.',
      'Tối ưu space: dùng 2 hàng dp thay vì bảng đầy đủ → O(min(m,n)) space.',
      'Bài ICPC thường yêu cầu in ra LCS, không chỉ độ dài → cần backtrack.',
    ],
    ops: [{
      id: 'lcs',
      label: 'Tìm LCS',
      args: [
        { id: 'x', label: 'Chuỗi X', type: 'text', value: 'ABCBDAB', random: function () { var s = ''; for (var i = 0; i < DSA.randInt(4, 7); i++) s += 'ABCDE'[DSA.randInt(0, 4)]; return s; } },
        { id: 'y', label: 'Chuỗi Y', type: 'text', value: 'BDCAB', random: function () { var s = ''; for (var i = 0; i < DSA.randInt(4, 7); i++) s += 'ABCDE'[DSA.randInt(0, 4)]; return s; } },
      ],
      code: {
        cpp: `int lcs(string X, string Y) {
    int m = X.size(), n = Y.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));  @@init
    for (int i = 1; i <= m; i++)                        @@loopI
      for (int j = 1; j <= n; j++) {                    @@loopJ
        if (X[i-1] == Y[j-1])                           @@match
          dp[i][j] = dp[i-1][j-1] + 1;                  @@diag
        else
          dp[i][j] = max(dp[i-1][j], dp[i][j-1]);       @@maxSkip
      }
    return dp[m][n];                                     @@done
}`,
        java: `static int lcs(String X, String Y) {
    int m = X.length(), n = Y.length();
    int[][] dp = new int[m+1][n+1];                     @@init
    for (int i = 1; i <= m; i++)                        @@loopI
      for (int j = 1; j <= n; j++) {                    @@loopJ
        if (X.charAt(i-1) == Y.charAt(j-1))             @@match
          dp[i][j] = dp[i-1][j-1] + 1;                  @@diag
        else
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);  @@maxSkip
      }
    return dp[m][n];                                     @@done
}`,
        python: `def lcs(X, Y):
    m, n = len(X), len(Y)
    dp = [[0]*(n+1) for _ in range(m+1)]                @@init
    for i in range(1, m+1):                             @@loopI
      for j in range(1, n+1):                           @@loopJ
        if X[i-1] == Y[j-1]:                            @@match
          dp[i][j] = dp[i-1][j-1] + 1                   @@diag
        else:
          dp[i][j] = max(dp[i-1][j], dp[i][j-1])        @@maxSkip
    return dp[m][n]                                      @@done`,
        pseudo: `Algorithm LCS(X, Y)
1. Tạo bảng dp[0..m][0..n] = 0                         @@init
2. For i = 1 to m:                                      @@loopI
3.   For j = 1 to n:                                    @@loopJ
4.     If X[i-1] == Y[j-1]:                             @@match
5.       dp[i][j] = dp[i-1][j-1] + 1                    @@diag
6.     Else:
7.       dp[i][j] = max(dp[i-1][j], dp[i][j-1])         @@maxSkip
8. Return dp[m][n]                                       @@done`,
      },
      run: function (args) {
        var X = String(args.x || '').toUpperCase().slice(0, 10);
        var Y = String(args.y || '').toUpperCase().slice(0, 10);
        if (!X || !Y) throw new Error('Cần nhập 2 chuỗi.');
        var m = X.length, n = Y.length;
        var R = new DSA.Recorder();
        var dp = [];
        for (var i = 0; i <= m; i++) { dp[i] = []; for (var j = 0; j <= n; j++) dp[i][j] = 0; }
        var cLbl = ['ε']; for (var j = 0; j < n; j++) cLbl.push(Y[j]);
        var rLbl = ['ε']; for (var i = 0; i < m; i++) rLbl.push(X[i]);

        R.step({
          line: 'init',
          msg: 'Tạo bảng DP kích thước <code>(' + (m + 1) + ' × ' + (n + 1) + ')</code>. Hàng/cột đầu = 0.',
          vars: { m: m, n: n, X: X, Y: Y },
          panels: [{ kind: 'html', key: 'dp', title: 'Bảng DP — LCS("' + X + '", "' + Y + '")', html: dpTableHtml({ dp: dp, nR: m + 1, nC: n + 1, rLbl: rLbl, cLbl: cLbl, filled: [m, n] }) }],
        });

        for (var i = 1; i <= m; i++) {
          for (var j = 1; j <= n; j++) {
            var deps;
            var lineTag;
            if (X[i - 1] === Y[j - 1]) {
              dp[i][j] = dp[i - 1][j - 1] + 1;
              deps = [[i - 1, j - 1]];
              lineTag = 'diag';
            } else {
              dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
              deps = [[i - 1, j], [i, j - 1]];
              lineTag = 'maxSkip';
            }
            R.step({
              line: lineTag,
              msg: X[i - 1] === Y[j - 1]
                ? '<code>X[' + (i - 1) + ']="' + X[i - 1] + '" == Y[' + (j - 1) + ']="' + Y[j - 1] + '"</code> → <code>dp[' + i + '][' + j + '] = dp[' + (i - 1) + '][' + (j - 1) + '] + 1 = <b>' + dp[i][j] + '</b></code>'
                : '<code>X[' + (i - 1) + ']="' + X[i - 1] + '" ≠ Y[' + (j - 1) + ']="' + Y[j - 1] + '"</code> → <code>dp[' + i + '][' + j + '] = max(' + dp[i - 1][j] + ', ' + dp[i][j - 1] + ') = <b>' + dp[i][j] + '</b></code>',
              vars: { i: i, j: j, 'X[i-1]': X[i - 1], 'Y[j-1]': Y[j - 1], 'dp[i][j]': dp[i][j] },
              panels: [{ kind: 'html', key: 'dp', title: 'LCS — dp[' + i + '][' + j + ']', html: dpTableHtml({ dp: dp, nR: m + 1, nC: n + 1, rLbl: rLbl, cLbl: cLbl, cur: [i, j], deps: deps, filled: [i, j] }) }],
            });
          }
        }

        // Backtrack
        var path = new Set();
        var lcsStr = '';
        var bi = m, bj = n;
        while (bi > 0 && bj > 0) {
          path.add(bi + ',' + bj);
          if (X[bi - 1] === Y[bj - 1]) { lcsStr = X[bi - 1] + lcsStr; bi--; bj--; }
          else if (dp[bi - 1][bj] >= dp[bi][bj - 1]) bi--;
          else bj--;
        }

        R.step({
          line: 'done',
          msg: 'Hoàn tất! <b>LCS = "' + lcsStr + '"</b>, độ dài = <b>' + dp[m][n] + '</b>. Đường truy vết được tô xanh.',
          vars: { LCS: lcsStr, 'Độ dài': dp[m][n] },
          panels: [{ kind: 'html', key: 'dp', title: '✓ LCS = "' + lcsStr + '" (dài ' + dp[m][n] + ')', html: dpTableHtml({ dp: dp, nR: m + 1, nC: n + 1, rLbl: rLbl, cLbl: cLbl, path: path, filled: [m, n] }) }],
        });
        return R.steps;
      },
    }],
  });

  /* =====================================================================
   * 2. 0/1 Knapsack – Bài toán cái túi
   * =================================================================== */
  DSA.register({
    id: 'knapsack-01',
    chapter: 'icpc-dp',
    name: 'Bài toán cái túi 0/1 (Knapsack)',
    short: 'O(n·W)',
    complexity: [
      ['Time', 'O(n × W)  —  pseudo-polynomial'],
      ['Space', 'O(n × W)  —  tối ưu O(W)'],
    ],
    description:
      '<p>Cho <b>n</b> vật phẩm, vật thứ i có trọng lượng <code>w[i]</code> và giá trị <code>v[i]</code>. ' +
      'Túi có sức chứa <code>W</code>. Chọn các vật sao cho tổng giá trị <b>lớn nhất</b> mà tổng trọng lượng ≤ W.</p>' +
      '<p>DP: <code>dp[i][w] = max(dp[i-1][w], dp[i-1][w-w[i]] + v[i])</code> nếu <code>w ≥ w[i]</code>.</p>',
    notes: [
      'Bài toán NP-hard nhưng có lời giải pseudo-polynomial O(n×W).',
      'Tối ưu space: duyệt ngược w → chỉ cần 1 mảng dp[0..W].',
      'Biến thể: Unbounded Knapsack (lấy nhiều lần), Fractional Knapsack (tham lam).',
      'Truy vết: từ dp[n][W] ngược lên để xác định vật nào được chọn.',
    ],
    ops: [{
      id: 'solve',
      label: 'Giải Knapsack',
      args: [
        { id: 'weights', label: 'Trọng lượng w[]', type: 'array', value: '2 3 4 5', random: function () { return DSA.randomArray(DSA.randInt(3, 5), 1, 6, true); } },
        { id: 'values', label: 'Giá trị v[]', type: 'array', value: '3 4 5 6', random: function () { return DSA.randomArray(DSA.randInt(3, 5), 2, 10); } },
        { id: 'cap', label: 'Sức chứa W', type: 'number', value: 8, random: function () { return String(DSA.randInt(5, 12)); } },
      ],
      code: {
        cpp: `int knapsack(int W, int w[], int v[], int n) {
    vector<vector<int>> dp(n+1, vector<int>(W+1, 0));   @@init
    for (int i = 1; i <= n; i++)                         @@loopI
      for (int j = 0; j <= W; j++) {                     @@loopJ
        dp[i][j] = dp[i-1][j];                           @@skip
        if (j >= w[i-1])                                 @@checkW
          dp[i][j] = max(dp[i][j],
                         dp[i-1][j-w[i-1]] + v[i-1]);   @@take
      }
    return dp[n][W];                                     @@done
}`,
        java: `static int knapsack(int W, int[] w, int[] v, int n) {
    int[][] dp = new int[n+1][W+1];                     @@init
    for (int i = 1; i <= n; i++)                         @@loopI
      for (int j = 0; j <= W; j++) {                     @@loopJ
        dp[i][j] = dp[i-1][j];                           @@skip
        if (j >= w[i-1])                                 @@checkW
          dp[i][j] = Math.max(dp[i][j],
                     dp[i-1][j-w[i-1]] + v[i-1]);        @@take
      }
    return dp[n][W];                                     @@done
}`,
        python: `def knapsack(W, w, v, n):
    dp = [[0]*(W+1) for _ in range(n+1)]                @@init
    for i in range(1, n+1):                              @@loopI
      for j in range(W+1):                               @@loopJ
        dp[i][j] = dp[i-1][j]                            @@skip
        if j >= w[i-1]:                                  @@checkW
          dp[i][j] = max(dp[i][j],
                     dp[i-1][j-w[i-1]] + v[i-1])         @@take
    return dp[n][W]                                      @@done`,
        pseudo: `Algorithm Knapsack(W, w[], v[], n)
1. Tạo dp[0..n][0..W] = 0                               @@init
2. For i = 1 to n:                                       @@loopI
3.   For j = 0 to W:                                     @@loopJ
4.     dp[i][j] = dp[i-1][j]  (bỏ qua vật i)            @@skip
5.     If j ≥ w[i-1]:                                    @@checkW
6.       dp[i][j] = max(dp[i][j],                        @@take
         dp[i-1][j-w[i-1]] + v[i-1])
7. Return dp[n][W]                                       @@done`,
      },
      run: function (args) {
        var w = DSA.parseArray(args.weights).map(Number);
        var v = DSA.parseArray(args.values).map(Number);
        var W = Math.max(1, Math.min(15, args.cap | 0));
        var n = Math.min(w.length, v.length, 6);
        w = w.slice(0, n); v = v.slice(0, n);
        if (!n) throw new Error('Cần ít nhất 1 vật phẩm.');
        var R = new DSA.Recorder();
        var dp = [];
        for (var i = 0; i <= n; i++) { dp[i] = []; for (var j = 0; j <= W; j++) dp[i][j] = 0; }
        var cLbl = []; for (var j = 0; j <= W; j++) cLbl.push('w=' + j);
        var rLbl = ['∅']; for (var i = 0; i < n; i++) rLbl.push('v' + (i + 1) + '=' + v[i] + ',w=' + w[i]);

        var itemInfo = '<div style="font-family:monospace;font-size:13px;margin-bottom:8px;">';
        for (var i = 0; i < n; i++) itemInfo += 'Vật ' + (i + 1) + ': w=' + w[i] + ', v=' + v[i] + '&nbsp;&nbsp;';
        itemInfo += '| Sức chứa W=' + W + '</div>';

        R.step({
          line: 'init',
          msg: 'Tạo bảng DP kích thước <code>(' + (n + 1) + ' × ' + (W + 1) + ')</code>. ' + n + ' vật phẩm, sức chứa W = ' + W + '.',
          vars: { n: n, W: W },
          panels: [{ kind: 'html', key: 'dp', title: 'Knapsack 0/1', html: itemInfo + dpTableHtml({ dp: dp, nR: n + 1, nC: W + 1, rLbl: rLbl, cLbl: cLbl, filled: [n, W] }) }],
        });

        for (var i = 1; i <= n; i++) {
          for (var j = 0; j <= W; j++) {
            dp[i][j] = dp[i - 1][j];
            var deps = [[i - 1, j]];
            var tag = 'skip';
            var took = false;
            if (j >= w[i - 1] && dp[i - 1][j - w[i - 1]] + v[i - 1] > dp[i][j]) {
              dp[i][j] = dp[i - 1][j - w[i - 1]] + v[i - 1];
              deps.push([i - 1, j - w[i - 1]]);
              tag = 'take';
              took = true;
            } else if (j >= w[i - 1]) {
              deps.push([i - 1, j - w[i - 1]]);
            }
            R.step({
              line: tag,
              msg: took
                ? 'Vật ' + i + ': w=' + w[i - 1] + ', v=' + v[i - 1] + '. Capacity ' + j + ' ≥ ' + w[i - 1] + ' → <b>lấy</b>: dp = max(' + dp[i - 1][j] + ', ' + (dp[i - 1][j - w[i - 1]]) + '+' + v[i - 1] + ') = <b>' + dp[i][j] + '</b>'
                : 'Vật ' + i + ': capacity ' + j + (j < w[i - 1] ? ' < ' + w[i - 1] + ' → <b>không lấy</b>' : ' → bỏ qua tốt hơn') + '. dp[' + i + '][' + j + '] = <b>' + dp[i][j] + '</b>',
              vars: { i: i, j: j, 'dp[i][j]': dp[i][j], 'chọn': took ? 'Lấy' : 'Bỏ' },
              panels: [{ kind: 'html', key: 'dp', title: 'Knapsack — dp[' + i + '][' + j + ']', html: itemInfo + dpTableHtml({ dp: dp, nR: n + 1, nC: W + 1, rLbl: rLbl, cLbl: cLbl, cur: [i, j], deps: deps, filled: [i, j] }) }],
            });
          }
        }

        // Backtrack
        var chosen = [];
        var path = new Set();
        var bi = n, bj = W;
        while (bi > 0 && bj > 0) {
          path.add(bi + ',' + bj);
          if (dp[bi][bj] !== dp[bi - 1][bj]) {
            chosen.push(bi);
            bj -= w[bi - 1];
          }
          bi--;
        }
        chosen.reverse();
        var totalW = 0, totalV = 0;
        for (var k = 0; k < chosen.length; k++) { totalW += w[chosen[k] - 1]; totalV += v[chosen[k] - 1]; }

        R.step({
          line: 'done',
          msg: 'Hoàn tất! Giá trị tối đa = <b>' + dp[n][W] + '</b>. Chọn vật: <b>' + chosen.join(', ') + '</b> (tổng w=' + totalW + ', v=' + totalV + ').',
          vars: { 'Max value': dp[n][W], 'Vật chọn': chosen.join(', '), 'Tổng w': totalW },
          panels: [{ kind: 'html', key: 'dp', title: '✓ Max = ' + dp[n][W] + ' — chọn vật {' + chosen.join(',') + '}', html: itemInfo + dpTableHtml({ dp: dp, nR: n + 1, nC: W + 1, rLbl: rLbl, cLbl: cLbl, path: path, filled: [n, W] }) }],
        });
        return R.steps;
      },
    }],
  });

  /* =====================================================================
   * 3. LIS – Dãy con tăng dài nhất
   * =================================================================== */
  DSA.register({
    id: 'lis',
    chapter: 'icpc-dp',
    name: 'Dãy con tăng dài nhất (LIS)',
    short: 'O(n²) / O(n log n)',
    complexity: [
      ['DP cơ bản', 'O(n²) time, O(n) space'],
      ['Patience Sort', 'O(n log n) time, O(n) space'],
    ],
    description:
      '<p><b>LIS (Longest Increasing Subsequence)</b> tìm dãy con tăng nghiêm ngặt dài nhất.</p>' +
      '<p>DP O(n²): <code>dp[i]</code> = độ dài LIS kết thúc tại i. ' +
      '<code>dp[i] = max(dp[j] + 1)</code> với mọi j &lt; i mà <code>a[j] &lt; a[i]</code>.</p>' +
      '<p>Tối ưu O(n log n) dùng binary search + mảng tails.</p>',
    notes: [
      'O(n²): duyệt mọi cặp (j, i), cập nhật dp[i] nếu a[j] < a[i].',
      'O(n log n): duy trì mảng tails[], dùng <code>lower_bound</code> để cập nhật.',
      'Truy vết: lưu mảng parent[] để khôi phục dãy LIS.',
      'Biến thể: Longest Non-decreasing, Longest Decreasing, …',
    ],
    ops: [{
      id: 'lis',
      label: 'Tìm LIS (DP O(n²))',
      args: [
        { id: 'arr', label: 'Mảng', type: 'array', value: '10 22 9 33 21 50 41 60', random: function () { return DSA.randomArray(DSA.randInt(6, 10), 1, 60); } },
      ],
      code: {
        cpp: `int lis(int arr[], int n) {
    vector<int> dp(n, 1);                            @@init
    int maxLen = 1;
    for (int i = 1; i < n; i++) {                    @@loopI
      for (int j = 0; j < i; j++)                    @@loopJ
        if (arr[j] < arr[i])                         @@cmp
          dp[i] = max(dp[i], dp[j] + 1);             @@update
      maxLen = max(maxLen, dp[i]);                   @@maxLen
    }
    return maxLen;                                   @@done
}`,
        java: `static int lis(int[] arr) {
    int n = arr.length;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);                             @@init
    int maxLen = 1;
    for (int i = 1; i < n; i++) {                    @@loopI
      for (int j = 0; j < i; j++)                    @@loopJ
        if (arr[j] < arr[i])                         @@cmp
          dp[i] = Math.max(dp[i], dp[j] + 1);        @@update
      maxLen = Math.max(maxLen, dp[i]);              @@maxLen
    }
    return maxLen;                                   @@done
}`,
        python: `def lis(arr):
    n = len(arr)
    dp = [1] * n                                     @@init
    for i in range(1, n):                            @@loopI
      for j in range(i):                             @@loopJ
        if arr[j] < arr[i]:                          @@cmp
          dp[i] = max(dp[i], dp[j] + 1)              @@update
    return max(dp)                                   @@done`,
        pseudo: `Algorithm LIS(arr, n)
1. dp[0..n-1] ← 1 (mỗi phần tử tự tạo LIS dài 1)  @@init
2. For i = 1 to n-1:                                 @@loopI
3.   For j = 0 to i-1:                               @@loopJ
4.     If arr[j] < arr[i]:                            @@cmp
5.       dp[i] = max(dp[i], dp[j] + 1)               @@update
6. Return max(dp)                                    @@done`,
      },
      run: function (args) {
        var arr = DSA.parseArray(args.arr).map(Number).slice(0, 12);
        if (arr.length < 2) throw new Error('Cần ít nhất 2 phần tử.');
        var n = arr.length;
        var R = new DSA.Recorder();
        var dp = []; for (var i = 0; i < n; i++) dp[i] = 1;
        var parent = []; for (var i = 0; i < n; i++) parent[i] = -1;

        function makePanel(curI, curJ, bestJ) {
          var hl = {};
          for (var k = 0; k < n; k++) {
            if (k === curI) hl[k] = 'active';
            else if (k === curJ) hl[k] = 'compare';
            else if (k === bestJ) hl[k] = 'found';
          }
          var ptrs = [];
          if (curI >= 0) ptrs.push({ i: curI, label: 'i=' + curI, hl: 'active' });
          if (curJ >= 0 && curJ !== curI) ptrs.push({ i: curJ, label: 'j=' + curJ, hl: 'compare' });
          return [
            { kind: 'array', key: 'arr', title: 'Mảng arr[]', values: arr, hl: hl, pointers: ptrs },
            { kind: 'array', key: 'dp', title: 'dp[] (độ dài LIS kết thúc tại i)', values: dp.slice(), cellLabels: arr.map(function (v, i) { return 'a[' + i + ']=' + v; }) },
          ];
        }

        R.step({
          line: 'init',
          msg: 'Khởi tạo: <code>dp[0..n-1] = 1</code>. Mỗi phần tử tự tạo LIS dài 1.',
          vars: { n: n },
          panels: makePanel(-1, -1, -1),
        });

        for (var i = 1; i < n; i++) {
          var bestJ = -1;
          for (var j = 0; j < i; j++) {
            if (arr[j] < arr[i]) {
              if (dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                parent[i] = j;
                bestJ = j;
              }
            }
          }
          R.step({
            line: bestJ >= 0 ? 'update' : 'loopI',
            msg: 'i=' + i + ': <code>arr[' + i + ']=' + arr[i] + '</code>. ' +
              (bestJ >= 0
                ? 'Nối sau arr[' + bestJ + ']=' + arr[bestJ] + ' → <code>dp[' + i + '] = <b>' + dp[i] + '</b></code>'
                : 'Không có phần tử nhỏ hơn trước đó → <code>dp[' + i + '] = 1</code>'),
            vars: { i: i, 'arr[i]': arr[i], 'dp[i]': dp[i], 'best j': bestJ },
            panels: makePanel(i, bestJ, bestJ),
          });
        }

        // Reconstruct
        var maxLen = 0, maxIdx = 0;
        for (var i = 0; i < n; i++) { if (dp[i] > maxLen) { maxLen = dp[i]; maxIdx = i; } }
        var lisSeq = [];
        var k = maxIdx;
        while (k >= 0) { lisSeq.push(arr[k]); k = parent[k]; }
        lisSeq.reverse();

        var hlFinal = {};
        k = maxIdx;
        while (k >= 0) { hlFinal[k] = 'found'; k = parent[k]; }

        R.step({
          line: 'done',
          msg: 'Hoàn tất! <b>LIS dài ' + maxLen + '</b>: <code>[' + lisSeq.join(', ') + ']</code>.',
          vars: { 'Độ dài LIS': maxLen, LIS: lisSeq.join(', ') },
          panels: [
            { kind: 'array', key: 'arr', title: '✓ LIS dài ' + maxLen + ': [' + lisSeq.join(', ') + ']', values: arr, hl: hlFinal },
            { kind: 'array', key: 'dp', title: 'dp[] cuối cùng', values: dp },
          ],
        });
        return R.steps;
      },
    }],
  });

})();
