/* =========================================================================
 * DSA Visualizer – hashing.js
 * Slide: Search+Hash.pdf (trang 20–67)
 * 1. 7 Hash Functions (Direct, Modulo, Digit Extraction, Mid-Square,
 *    Folding: shift & boundary, Rotation, Pseudo-Random)
 * 2. Open Addressing (Linear, Quadratic, Double Hashing, Key Offset: Insert, Search, Delete)
 * 3. Separate Chaining (Linked List Resolution: Insert, Search, Delete) & Bucket Hashing
 * ========================================================================= */
(function () {
  'use strict';
  const DSA = window.DSA;

  /* ---------------------------------------------------------------------
   * 1. 7 Hash Functions Explorer (Search+Hash.pdf p.32-44)
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'hash-functions',
    chapter: 'hashing',
    name: 'Các hàm băm (7 Hash Functions)',
    short: 'O(1)',
    complexity: [
      ['Time Complexity', 'O(1)'],
      ['Home address', 'Địa chỉ sinh bởi h(Key)'],
      ['Synonyms', 'Các khóa có cùng h(Key)'],
      ['Collision', 'Đụng độ tại địa chỉ đã có dữ liệu'],
    ],
    description:
      '<p>7 phương pháp xây dựng hàm băm phổ biến:</p>' +
      '<ol>' +
      '<li><b>Direct hashing</b>: <code>Address = Key</code> (không đụng độ nhưng tốn bộ nhớ bằng không gian khóa).</li>' +
      '<li><b>Modulo division</b>: <code>Address = Key mod listSize</code> (nên chọn <code>listSize</code> là số nguyên tố, ví dụ <code>121267 mod 307 = 2</code>).</li>' +
      '<li><b>Digit extraction</b>: Trích các chữ số ở vị trí cố định (ví dụ lấy chữ số thứ 1, 3, 4: <code>379452 → 394</code>).</li>' +
      '<li><b>Mid-square</b>: Bình phương khóa (hoặc vài chữ số đầu) rồi lấy các chữ số ở giữa (ví dụ <code>9452² = 89<u>3403</u>04 → 3403</code>; <code>379² = 14<u>364</u>1 → 364</code>).</li>' +
      '<li><b>Folding</b>: Chia khóa thành từng phần rồi cộng lại: <b>Fold shift</b> (<code>123 + 456 + 789 = 1368 → 368</code>) và <b>Fold boundary</b> — đảo ngược các phần biên (<code>321 + 456 + 987 = 1764 → 764</code>).</li>' +
      '<li><b>Rotation</b>: Xoay chữ số cuối lên đầu trước khi băm (<code>600101 → 160010 → 16 + 00 + 10 = 26</code>).</li>' +
      '<li><b>Pseudo-random</b>: <code>Address = (a · Key + c) mod listSize</code> với <code>a, c, listSize</code> nguyên tố (ví dụ <code>(17 × 121267 + 7) mod 307 = 41</code>).</li>' +
      '</ol>',
    ops: [{
      id: 'calc',
      label: 'Tính tất cả 7 hàm băm trên Key',
      args: [
        { id: 'key', label: 'Key (số nguyên)', type: 'number', value: 121267 },
        { id: 'm', label: 'listSize (m)', type: 'number', value: 307 },
        { id: 'a', label: 'a (pseudo-random)', type: 'number', value: 17 },
        { id: 'c', label: 'c (pseudo-random)', type: 'number', value: 7 },
      ],
      code: {
        cpp: `int directHash(int key) { return key; }             @@mod
int modHash(long long key, int m) {
    return key % m;                                 @@mod
}
int digitExtraction(int key) { // digits 1, 3, 4 (1-based)
    std::string s = std::to_string(key);            @@digit
    while (s.size() < 6) s = "0" + s;
    return (s[0]-'0')*100 + (s[2]-'0')*10 + (s[3]-'0'); @@digit
}
int midSquarePrefix(int key) { // first 3 digits squared, middle 3
    int p = key / 1000;                             @@mid
    int sq = p * p;                                 @@mid
    return (sq / 10) % 1000;                        @@mid
}
int foldShift(int key) { // 3-digit blocks
    int p1 = key / 1000000, p2 = (key / 1000) % 1000, p3 = key % 1000; @@fold
    return (p1 + p2 + p3) % 1000;                   @@fold
}
int pseudoRandom(long long key, int a, int c, int m) {
    return (a * key + c) % m;                       @@prng
}`,
        java: `static int directHash(int key) { return key; }      @@mod
static int modHash(long key, int m) { return (int)(key % m); } @@mod
static int digitExtraction(int key) {
    String s = String.format("%06d", key);          @@digit
    return (s.charAt(0)-'0')*100 + (s.charAt(2)-'0')*10 + (s.charAt(3)-'0'); @@digit
}
static int midSquarePrefix(int key) {
    int p = key / 1000, sq = p * p;                 @@mid
    return (sq / 10) % 1000;                        @@mid
}
static int foldShift(int key) {
    int p1 = key / 1_000_000, p2 = (key / 1000) % 1000, p3 = key % 1000; @@fold
    return (p1 + p2 + p3) % 1000;                   @@fold
}
static int pseudoRandom(long key, int a, int c, int m) {
    return (int)((a * key + c) % m);                @@prng
}`,
        python: `def direct_hash(key): return key                    @@mod
def mod_hash(key, m): return key % m                @@mod
def digit_extraction(key):
    s = str(key).zfill(6)                           @@digit
    return int(s[0] + s[2] + s[3])                  @@digit
def mid_square_prefix(key):
    sq = str((key // 1000) ** 2).zfill(6)           @@mid
    return int(sq[2:5])                             @@mid
def fold_shift(key):
    s = str(key).zfill(9)                           @@fold
    return (int(s[0:3]) + int(s[3:6]) + int(s[6:9])) % 1000 @@fold
def pseudo_random(key, a, c, m):
    return (a * key + c) % m                        @@prng`,
        pseudo: `Algorithm HashFunctions(val Key, val listSize)
1. Direct:        Address = Key                     @@mod
2. Modulo:        Address = Key mod listSize        @@mod
3. Digit extract: Address = selected digits of Key  @@digit
4. Mid-square:    Address = middle digits of Key²   @@mid
5. Folding:       Fold shift / Fold boundary        @@fold
6. Rotation:      Rotate last digit to front        @@fold
7. Pseudo-random: Address = (a * Key + c) mod listSize @@prng
End HashFunctions`,
      },
      run({ key, m, a, c }) {
        const R = new DSA.Recorder();
        const k = Math.abs(Math.trunc(key));
        const modM = Math.max(1, Math.trunc(m));
        const s6 = String(k).padStart(6, '0');
        const s9 = String(k).padStart(9, '0');

        const modAddr = k % modM;
        const digAddr = s6[0] + s6[2] + s6[3];
        const prefix3 = Number(s6.slice(0, 3));
        const sq = String(prefix3 * prefix3).padStart(6, '0');
        const midAddr = sq.slice(2, 5);

        const b1 = s9.slice(0, 3), b2 = s9.slice(3, 6), b3 = s9.slice(6, 9);
        const rev = (x) => x.split('').reverse().join('');
        const fShiftSum = Number(b1) + Number(b2) + Number(b3);
        const fShift = String(fShiftSum).slice(-3);
        const fBoundSum = Number(rev(b1)) + Number(b2) + Number(rev(b3));
        const fBound = String(fBoundSum).slice(-3);

        const rotKey = s6.slice(-1) + s6.slice(0, -1);
        const rotFold = Number(rotKey.slice(0, 2)) + Number(rotKey.slice(2, 4)) + Number(rotKey.slice(4, 6));
        const prng = (a * k + c) % modM;

        const rows = [
          ['1. Direct Hashing', 'hash(k) = k', String(k), String(k)],
          ['2. Modulo Division', `${k} mod ${modM}`, `${k} = ${Math.floor(k / modM)}×${modM} + ${modAddr}`, String(modAddr)],
          ['3. Digit Extraction', 'Chữ số vị trí 1, 3, 4 của ' + s6, `${s6[0]} _ ${s6[2]} ${s6[3]} _ _`, digAddr],
          ['4. Mid-Square (3 chữ số đầu)', `${prefix3}² = ${sq}`, `Lấy 3 chữ số giữa của ${sq}`, midAddr],
          ['5a. Fold Shift (3-chữ-số)', `${b1} + ${b2} + ${b3}`, `Tổng = ${fShiftSum} → bỏ nhớ đầu`, fShift],
          ['5b. Fold Boundary', `${rev(b1)} + ${b2} + ${rev(b3)}`, `Tổng = ${fBoundSum} → bỏ nhớ đầu`, fBound],
          ['6. Rotation + Fold Shift', `${s6} → xoay → ${rotKey}`, `${rotKey.slice(0, 2)} + ${rotKey.slice(2, 4)} + ${rotKey.slice(4, 6)} = ${rotFold}`, String(rotFold % 100)],
          ['7. Pseudo-Random', `(${a}×${k} + ${c}) mod ${modM}`, `${a * k + c} mod ${modM}`, String(prng)],
        ];

        const tags = ['mod', 'mod', 'digit', 'mid', 'fold', 'fold', 'fold', 'prng'];
        rows.forEach((row, idx) => {
          R.step({
            line: tags[idx],
            msg: '<b>' + row[0] + '</b>: <code>' + row[1] + '</code> → Địa chỉ băm = <b>' + row[3] + '</b>.',
            vars: { Key: k, listSize: modM, method: row[0], Address: row[3] },
            panels: [{
              kind: 'table', key: 't', title: 'Kết quả băm cho Key = ' + k + ' (listSize = ' + modM + ')',
              headers: ['Phương pháp', 'Công thức', 'Chi tiết tính', 'Địa chỉ (Address)'],
              rows: rows.slice(0, idx + 1),
              rowHl: { [idx]: 'found' },
            }],
          });
        });
        return R.steps;
      },
    }],
  });

  /* ---------------------------------------------------------------------
   * 2. Open Addressing (Search+Hash.pdf p.48-63)
   * Supports Linear Probing, Quadratic Probing, Double Hashing, Key Offset
   * ------------------------------------------------------------------- */
  function probeAddr(k, i, m, method, h2p) {
    const h1 = ((k % m) + m) % m;
    if (method === 'quadratic') return (h1 + i * i) % m;
    if (method === 'double') {
      const q = h2p || 7;
      const h2 = q - (k % q) || 1;
      return (h1 + i * h2) % m;
    }
    if (method === 'offset') {
      const off = Math.max(1, Math.floor(k / m));
      return (h1 + i * off) % m;
    }
    return (h1 + i) % m; // linear
  }

  function probeFormulaText(k, i, m, method, h2p) {
    const h1 = ((k % m) + m) % m;
    if (method === 'quadratic') return `(h(${k}) + ${i}²) mod ${m} = (${h1} + ${i * i}) mod ${m}`;
    if (method === 'double') {
      const q = h2p || 7;
      const h2 = q - (k % q) || 1;
      return `(h₁(${k}) + ${i}·h₂(${k})) mod ${m} = (${h1} + ${i}·${h2}) mod ${m}`;
    }
    if (method === 'offset') {
      const off = Math.max(1, Math.floor(k / m));
      return `(h(${k}) + ${i}·⌊${k}/${m}⌋) mod ${m} = (${h1} + ${i}·${off}) mod ${m}`;
    }
    return `(h(${k}) + ${i}) mod ${m} = (${h1} + ${i}) mod ${m}`;
  }

  function makeMethodArg() {
    return {
      id: 'method',
      label: 'Phương pháp dò',
      type: 'select',
      value: (ds) => ds.method || 'linear',
      options: [
        { value: 'linear', label: 'Linear Probing: (h(k) + i) mod m' },
        { value: 'quadratic', label: 'Quadratic Probing: (h(k) + i²) mod m' },
        { value: 'double', label: 'Double Hashing: (h₁(k) + i·h₂(k)) mod m' },
        { value: 'offset', label: 'Key Offset: (h(k) + i·⌊k/m⌋) mod m' },
      ],
      onChange(v, ds) { ds.method = v; },
    };
  }

  const CODE_OPEN = {
    cpp: `int hp(int k, int i, int m, int method) {
    int h = k % m;
    if (method == 0) return (h + i) % m;            // Linear probing      @@probe
    if (method == 1) return (h + i * i) % m;        // Quadratic probing   @@probe
    if (method == 2) return (h + i * (7 - k % 7)) % m; // Double hashing   @@probe
    int offset = std::max(1, k / m);                // Key offset          @@probe
    return (h + i * offset) % m;                                           @@probe
}
int hashInsert(int T[], int m, int k, int method) {
    int i = 0;                                      @@init
    while (i < m) {                                 @@loop
        int j = hp(k, i, m, method);                @@probe
        if (T[j] == NIL || T[j] == DELETED) {       @@checkEmpty
            T[j] = k;                               @@place
            return j;                               @@place
        }
        i = i + 1;                                  @@nextI
    }
    return -1; // hash table overflow               @@overflow
}
int hashSearch(const int T[], int m, int k, int method) {
    int i = 0;                                      @@init
    while (i < m) {                                 @@loop
        int j = hp(k, i, m, method);                @@probe
        if (T[j] == k) return j;                    @@found
        if (T[j] == NIL) return -1;                 @@notFound
        i = i + 1;                                  @@nextI
    }
    return -1;                                      @@notFound
}
bool hashDelete(int T[], int m, int k, int method) {
    int j = hashSearch(T, m, k, method);            @@probe
    if (j == -1) return false;                      @@notFound
    T[j] = DELETED; // Mark as deleted (tombstone)  @@delMark
    return true;                                    @@delMark
}`,
    java: `static int hp(int k, int i, int m, String method) {
    int h = ((k % m) + m) % m;
    if ("quadratic".equals(method)) return (h + i * i) % m;             @@probe
    if ("double".equals(method)) return (h + i * (7 - k % 7)) % m;      @@probe
    if ("offset".equals(method)) return (h + i * Math.max(1, k / m)) % m; @@probe
    return (h + i) % m;                                                 @@probe
}
static int hashInsert(Integer[] T, int k, String method) {
    int m = T.length, i = 0;                        @@init
    while (i < m) {                                 @@loop
        int j = hp(k, i, m, method);                @@probe
        if (T[j] == null || T[j] == DELETED) {      @@checkEmpty
            T[j] = k; return j;                     @@place
        }
        i++;                                        @@nextI
    }
    throw new RuntimeException("hash table overflow"); @@overflow
}
static int hashSearch(Integer[] T, int k, String method) {
    int m = T.length, i = 0;                        @@init
    while (i < m) {                                 @@loop
        int j = hp(k, i, m, method);                @@probe
        if (T[j] == null) return -1;                @@notFound
        if (T[j] == k) return j;                    @@found
        i++;                                        @@nextI
    }
    return -1;                                      @@notFound
}
static boolean hashDelete(Integer[] T, int k, String method) {
    int j = hashSearch(T, k, method);               @@probe
    if (j < 0) return false;                        @@notFound
    T[j] = DELETED;                                 @@delMark
    return true;                                    @@delMark
}`,
    python: `def hp(k, i, m, method='linear'):
    h = k % m
    if method == 'quadratic': return (h + i * i) % m            @@probe
    if method == 'double': return (h + i * (7 - k % 7)) % m     @@probe
    if method == 'offset': return (h + i * max(1, k // m)) % m  @@probe
    return (h + i) % m                                          @@probe

def hash_insert(T, k, method='linear'):
    m, i = len(T), 0                                @@init
    while i < m:                                    @@loop
        j = hp(k, i, m, method)                     @@probe
        if T[j] is None or T[j] == 'DEL':           @@checkEmpty
            T[j] = k; return j                      @@place
        i += 1                                      @@nextI
    raise OverflowError("hash table overflow")      @@overflow

def hash_search(T, k, method='linear'):
    m, i = len(T), 0                                @@init
    while i < m:                                    @@loop
        j = hp(k, i, m, method)                     @@probe
        if T[j] == k: return j                      @@found
        if T[j] is None: return -1                  @@notFound
        i += 1                                      @@nextI
    return -1                                       @@notFound

def hash_delete(T, k, method='linear'):
    j = hash_search(T, k, method)                   @@probe
    if j == -1: return False                        @@notFound
    T[j] = 'DEL'                                    @@delMark
    return True                                     @@delMark`,
    pseudo: `Algorithm hashInsert(ref T <array>, val k <key>)
// Open Addressing Insertion
i = 0                                               @@init
while i < m do                                      @@loop
    j = hp(k, i)                                    @@probe
    if T[j] = nil or T[j] = DELETED then            @@checkEmpty
        T[j] = k; return j                          @@place
    else i = i + 1 end                              @@nextI
end
return error: "hash table overflow"                 @@overflow
End hashInsert

Algorithm hashSearch(val T <array>, val k <key>)
// Open Addressing Search
i = 0                                               @@init
while i < m do                                      @@loop
    j = hp(k, i)                                    @@probe
    if T[j] = k then return j                       @@found
    else if T[j] = nil then return nil              @@notFound
    else i = i + 1 end                              @@nextI
end
return nil                                          @@notFound
End hashSearch

Algorithm hashDelete(ref T <array>, val k <key>)
j = hashSearch(T, k)                                @@probe
if j != nil then T[j] = DELETED; return true        @@delMark
return false                                        @@notFound
End hashDelete`,
  };

  function fmtSlot(v) { return v === null ? 'nil' : (v === 'DEL' ? 'DEL' : v); }

  DSA.register({
    id: 'open-addressing',
    chapter: 'hashing',
    name: 'Closed Hashing – Open Addressing',
    short: 'Linear / Quadratic / Double / Key Offset',
    complexity: [
      ['Linear Probing', 'hp(k, i) = (h(k) + i) mod m'],
      ['Quadratic Probing', 'hp(k, i) = (h(k) + i²) mod m'],
      ['Double Hashing', 'hp(k, i) = (h₁(k) + i·h₂(k)) mod m'],
      ['Key Offset', 'hp(k, i) = (hp(k,i−1) + ⌊k/m⌋) mod m'],
    ],
    description:
      '<p>Trong <b>Open Addressing (Địa chỉ mở)</b>, tất cả phần tử đều lưu ngay trong bảng chính <code>T[0..m-1]</code>. Khi xảy ra đụng độ ở lần thử <code>i = 0, 1, …, m − 1</code>, địa chỉ thăm dò được tính bởi hàm <code>j = hp(k, i)</code>:</p>' +
      '<ul>' +
      '<li><b>Linear Probing</b>: <code>hp(k, i) = (h(k) + i) mod m</code> — đơn giản nhưng gây <i>primary clustering</i>.</li>' +
      '<li><b>Quadratic Probing</b>: <code>hp(k, i) = (h(k) + i²) mod m</code> — giảm primary clustering nhưng gây <i>secondary clustering</i>.</li>' +
      '<li><b>Double Hashing</b>: <code>hp(k, i) = (h₁(k) + i · h₂(k)) mod m</code>.</li>' +
      '<li><b>Key Offset</b>: <code>offset = ⌊k / m⌋</code>, <code>newAddress = (collisionAddress + offset) mod m</code>.</li>' +
      '</ul>',
    init(ds) {
      ds.m = 11;
      ds.method = 'linear';
      ds.table = Array(11).fill(null);
      [22, 41, 53, 46, 30, 13].forEach((k) => {
        for (let i = 0; i < ds.m; i++) {
          const j = probeAddr(k, i, ds.m, ds.method);
          if (ds.table[j] === null) { ds.table[j] = k; break; }
        }
      });
    },
    view(ds) {
      return [{
        kind: 'array', key: 'ht', title: 'Bảng băm T[0..' + (ds.m - 1) + '] (method = ' + ds.method + ')',
        values: ds.table.map(fmtSlot),
      }];
    },
    ops: [
      {
        id: 'insert',
        label: 'Chèn khóa (hashInsert)',
        code: CODE_OPEN,
        args: [
          { id: 'k', label: 'Khóa k', type: 'number', value: 24, random: () => DSA.randInt(10, 99) },
          makeMethodArg(),
        ],
        run({ k, method }, ds) {
          ds.method = method || ds.method;
          const m = ds.m;
          const R = new DSA.Recorder();
          const probed = {};

          R.step({
            line: 'init',
            msg: 'Bắt đầu <code>hashInsert(k = ' + k + ')</code> với <code>h(' + k + ') = ' + k + ' mod ' + m + ' = ' + (k % m) + '</code>.',
            vars: { k, 'h(k)': k % m, i: 0, method: ds.method },
            panels: [{ kind: 'array', key: 'ht', title: 'T[0..' + (m - 1) + ']', values: ds.table.map(fmtSlot) }],
          });

          for (let i = 0; i < m; i++) {
            const j = probeAddr(k, i, m, ds.method);
            const fTxt = probeFormulaText(k, i, m, ds.method);
            const hl = Object.assign({}, probed, { [j]: 'compare' });
            R.step({
              line: 'probe',
              msg: 'Lần dò <code>i = ' + i + '</code>: <code>j = ' + fTxt + ' = ' + j + '</code> → <code>T[' + j + '] = ' + fmtSlot(ds.table[j]) + '</code>.',
              vars: { k, i, j, 'T[j]': fmtSlot(ds.table[j]) },
              panels: [{
                kind: 'array', key: 'ht', title: 'T[0..' + (m - 1) + ']',
                values: ds.table.map(fmtSlot), hl,
                pointers: [{ i: j, label: 'j=' + j + ' (i=' + i + ')', hl: 'compare' }],
              }],
            });

            if (ds.table[j] === null || ds.table[j] === 'DEL') {
              ds.table[j] = k;
              hl[j] = 'found';
              R.step({
                line: 'place',
                msg: 'Ô <code>T[' + j + ']</code> trống → đặt <code>T[' + j + '] = ' + k + '</code> (sau ' + (i + 1) + ' lần dò).',
                vars: { k, i, j, probes: i + 1 },
                panels: [{
                  kind: 'array', key: 'ht', title: 'T[0..' + (m - 1) + ']',
                  values: ds.table.map(fmtSlot), hl,
                  pointers: [{ i: j, label: 'inserted', hl: 'found' }],
                }],
              });
              return R.steps;
            }
            probed[j] = 'swap';
            R.step({
              line: 'nextI',
              msg: 'Đụng độ (Collision) tại <code>T[' + j + '] = ' + ds.table[j] + '</code> → tăng <code>i = ' + (i + 1) + '</code>.',
              vars: { k, i: i + 1, collisionAt: j },
              panels: [{
                kind: 'array', key: 'ht', title: 'T[0..' + (m - 1) + ']',
                values: ds.table.map(fmtSlot), hl: Object.assign({}, probed),
              }],
            });
          }

          R.step({
            line: 'overflow',
            msg: 'Bảng băm đã đầy (<b>hash table overflow</b>)!',
            vars: { k, error: 'overflow' },
            panels: [{ kind: 'array', key: 'ht', title: 'Overflow', values: ds.table.map(fmtSlot), hl: probed }],
          });
          return R.steps;
        },
      },
      {
        id: 'search',
        label: 'Tìm khóa (hashSearch)',
        code: CODE_OPEN,
        args: [
          { id: 'k', label: 'Khóa cần tìm k', type: 'number', value: 13 },
          makeMethodArg(),
        ],
        run({ k, method }, ds) {
          ds.method = method || ds.method;
          const m = ds.m;
          const R = new DSA.Recorder();
          const probed = {};
          for (let i = 0; i < m; i++) {
            const j = probeAddr(k, i, m, ds.method);
            const hl = Object.assign({}, probed, { [j]: 'compare' });
            R.step({
              line: 'probe',
              msg: 'Dò <code>i = ' + i + '</code> → <code>j = ' + probeFormulaText(k, i, m, ds.method) + ' = ' + j + '</code> (<code>T[' + j + '] = ' + fmtSlot(ds.table[j]) + '</code>).',
              vars: { k, i, j, 'T[j]': fmtSlot(ds.table[j]), method: ds.method },
              panels: [{
                kind: 'array', key: 'ht', title: 'hashSearch(' + k + ')',
                values: ds.table.map(fmtSlot), hl,
                pointers: [{ i: j, label: 'j=' + j, hl: 'compare' }],
              }],
            });
            if (ds.table[j] === k) {
              hl[j] = 'found';
              R.step({
                line: 'found',
                msg: 'Tìm thấy <code>k = ' + k + '</code> tại địa chỉ <b>j = ' + j + '</b>!',
                vars: { k, result: j, probes: i + 1 },
                panels: [{ kind: 'array', key: 'ht', title: 'Tìm thấy tại j = ' + j, values: ds.table.map(fmtSlot), hl, pointers: [{ i: j, label: 'FOUND', hl: 'found' }] }],
              });
              return R.steps;
            }
            if (ds.table[j] === null) {
              hl[j] = 'fail';
              R.step({
                line: 'notFound',
                msg: 'Gặp ô trống <code>T[' + j + '] = nil</code> → khóa <code>' + k + '</code> không tồn tại trong bảng (return <code>nil</code>).',
                vars: { k, result: 'nil', probes: i + 1 },
                panels: [{ kind: 'array', key: 'ht', title: 'Không tìm thấy', values: ds.table.map(fmtSlot), hl }],
              });
              return R.steps;
            }
            probed[j] = 'visited';
          }
          R.step({ line: 'notFound', msg: 'Đã dò hết bảng, không tìm thấy ' + k + '.', vars: { result: 'nil' } });
          return R.steps;
        },
      },
      {
        id: 'delete',
        label: 'Xóa khóa (hashDelete – đánh dấu DEL)',
        code: CODE_OPEN,
        args: [
          { id: 'k', label: 'Khóa cần xóa k', type: 'number', value: 53 },
          makeMethodArg(),
        ],
        run({ k, method }, ds) {
          ds.method = method || ds.method;
          const m = ds.m;
          const R = new DSA.Recorder();
          const probed = {};
          for (let i = 0; i < m; i++) {
            const j = probeAddr(k, i, m, ds.method);
            const hl = Object.assign({}, probed, { [j]: 'compare' });
            R.step({
              line: 'probe',
              msg: 'Tìm khóa cần xóa: <code>i = ' + i + ', j = ' + j + '</code> (<code>T[' + j + '] = ' + fmtSlot(ds.table[j]) + '</code>).',
              vars: { k, i, j, 'T[j]': fmtSlot(ds.table[j]) },
              panels: [{ kind: 'array', key: 'ht', title: 'hashDelete(' + k + ')', values: ds.table.map(fmtSlot), hl, pointers: [{ i: j, label: 'j=' + j, hl: 'compare' }] }],
            });
            if (ds.table[j] === k) {
              ds.table[j] = 'DEL';
              hl[j] = 'swap';
              R.step({
                line: 'delMark',
                msg: 'Tìm thấy <code>' + k + '</code> tại <code>T[' + j + ']</code> → đánh dấu <code>T[' + j + '] = DEL</code> (không đặt <code>nil</code> để không làm đứt chuỗi dò của các khóa đồng nghĩa phía sau!).',
                vars: { deletedKey: k, address: j, status: 'DEL' },
                panels: [{ kind: 'array', key: 'ht', title: 'Đã đánh dấu DEL tại j = ' + j, values: ds.table.map(fmtSlot), hl, pointers: [{ i: j, label: 'DELETED', hl: 'swap' }] }],
              });
              return R.steps;
            }
            if (ds.table[j] === null) break;
            probed[j] = 'visited';
          }
          R.step({ line: 'notFound', msg: 'Không tìm thấy khóa <code>' + k + '</code> để xóa.', vars: { k, deleted: false }, panels: [{ kind: 'array', key: 'ht', title: 'Không tìm thấy', values: ds.table.map(fmtSlot), hl: probed }] });
          return R.steps;
        },
      },
      {
        id: 'batch',
        label: 'Dựng bảng mới từ dãy khóa',
        code: CODE_OPEN,
        args: [
          { id: 'arr', label: 'Dãy khóa', type: 'array', value: '22 41 53 46 30 13 24 35' },
          { id: 'm', label: 'Kích thước bảng m', type: 'number', value: 11 },
          makeMethodArg(),
        ],
        run({ arr, m, method }, ds) {
          ds.m = Math.max(3, Math.min(23, m || 11));
          ds.method = method || ds.method;
          ds.table = Array(ds.m).fill(null);
          const R = new DSA.Recorder();
          arr.forEach((k) => {
            for (let i = 0; i < ds.m; i++) {
              const j = probeAddr(k, i, ds.m, ds.method);
              if (ds.table[j] === null) {
                ds.table[j] = k;
                R.step({
                  line: 'place',
                  msg: 'Chèn <code>' + k + '</code>: <code>' + probeFormulaText(k, i, ds.m, ds.method) + ' = ' + j + '</code> (số lần dò = ' + (i + 1) + ').',
                  vars: { key: k, i, address: j, method: ds.method },
                  panels: [{ kind: 'array', key: 'ht', title: 'T[0..' + (ds.m - 1) + '] (' + ds.method + ')', values: ds.table.map(fmtSlot), hl: { [j]: 'found' }, pointers: [{ i: j, label: 'k=' + k, hl: 'found' }] }],
                });
                break;
              }
            }
          });
          return R.steps;
        },
      },
    ],
  });

  /* ---------------------------------------------------------------------
   * 3. Separate Chaining (Linked List Resolution) & Bucket Hashing
   * ------------------------------------------------------------------- */
  DSA.register({
    id: 'chaining-bucket',
    chapter: 'hashing',
    name: 'Open Hashing (Linked List) & Bucket Hashing',
    short: 'Chaining / Bucket',
    complexity: [
      ['Average Search / Insert', 'O(1 + α) với α = N/m'],
      ['Worst case', 'O(n)'],
      ['Bucket Hashing', 'Mỗi bucket chứa B phần tử, tràn mới dò tiếp'],
      ['Linked List Resolution', 'Các khóa đồng nghĩa nối thành danh sách liên kết'],
    ],
    description:
      '<p>2 phương pháp tổ chức vùng tràn để giảm đụng độ:</p>' +
      '<ul>' +
      '<li><b>Linked List Resolution (Open Hashing / Separate Chaining)</b>: mỗi địa chỉ trong vùng chính (prime area) trỏ tới một danh sách liên kết chứa các khóa đồng nghĩa (synonyms) ở vùng tràn (overflow area).</li>' +
      '<li><b>Bucket Hashing</b>: mỗi địa chỉ là một <b>bucket</b> chứa được nhiều phần tử (ví dụ 3 phần tử/bucket); việc đụng độ được trì hoãn cho tới khi bucket đầy.</li>' +
      '</ul>',
    init(ds) {
      ds.m = 7;
      ds.chains = Array.from({ length: 7 }, () => []);
      [15, 22, 8, 36, 29, 11, 18].forEach((k) => ds.chains[k % ds.m].push(k));
    },
    view(ds) {
      return [{
        kind: 'buckets', key: 'bk', mode: 'chain', title: 'Bảng băm dây chuyền (m = ' + ds.m + ')',
        slots: ds.chains.map((c, i) => ({ label: i, items: c.slice() })),
      }];
    },
    ops: [
      {
        id: 'insertChain',
        label: 'Chèn vào Linked List (Chaining)',
        args: [{ id: 'k', label: 'Khóa k', type: 'number', value: 43, random: () => DSA.randInt(1, 99) }],
        code: {
          cpp: `void chainInsert(std::vector<int> T[], int m, int k) {
    int j = k % m;                                  @@hash
    for (int x : T[j]) if (x == k) return;          @@scan
    T[j].push_back(k);                              @@append
}`,
          java: `static void chainInsert(List<Integer>[] T, int k) {
    int j = k % T.length;                           @@hash
    if (!T[j].contains(k)) T[j].add(k);             @@append
}`,
          python: `def chain_insert(T, k):
    j = k % len(T)                                  @@hash
    if k not in T[j]:                               @@scan
        T[j].append(k)                              @@append`,
          pseudo: `Algorithm chainInsert(ref T <array of Lists>, val m <int>, val k <key>)
j = k mod m                                         @@hash
if k not in T[j] then                               @@scan
    Insert k into linked list at T[j]               @@append
end
End chainInsert`,
        },
        run({ k }, ds) {
          const R = new DSA.Recorder();
          const j = ((k % ds.m) + ds.m) % ds.m;
          R.step({
            line: 'hash',
            msg: 'Tính địa chỉ băm: <code>j = ' + k + ' mod ' + ds.m + ' = ' + j + '</code>.',
            vars: { k, m: ds.m, j },
            panels: [{
              kind: 'buckets', key: 'bk', mode: 'chain', title: 'Bảng băm dây chuyền (m = ' + ds.m + ')',
              slots: ds.chains.map((c, idx) => ({ label: idx, hl: idx === j ? 'active' : '', items: c.slice() })),
            }],
          });
          if (!ds.chains[j].includes(k)) ds.chains[j].push(k);
          R.step({
            line: 'append',
            msg: 'Nối khóa <code>' + k + '</code> vào danh sách liên kết tại <code>T[' + j + ']</code>.',
            vars: { k, j, chainLength: ds.chains[j].length },
            panels: [{
              kind: 'buckets', key: 'bk', mode: 'chain', title: 'Bảng băm dây chuyền (m = ' + ds.m + ')',
              slots: ds.chains.map((c, idx) => ({
                label: idx,
                hl: idx === j ? 'active' : '',
                items: c.map((x) => ({ label: x, hl: x === k && idx === j ? 'found' : '' })),
              })),
            }],
          });
          return R.steps;
        },
      },
      {
        id: 'searchChain',
        label: 'Tìm trong Linked List',
        args: [{ id: 'k', label: 'Khóa cần tìm k', type: 'number', value: 29 }],
        code: {
          cpp: `bool chainSearch(const std::vector<int> T[], int m, int k) {
    int j = k % m;                                  @@hash
    for (int x : T[j]) {                            @@scan
        if (x == k) return true;                    @@found
    }
    return false;                                   @@notFound
}`,
          java: `static boolean chainSearch(List<Integer>[] T, int k) {
    int j = k % T.length;                           @@hash
    for (int x : T[j]) {                            @@scan
        if (x == k) return true;                    @@found
    }
    return false;                                   @@notFound
}`,
          python: `def chain_search(T, k):
    j = k % len(T)                                  @@hash
    for x in T[j]:                                  @@scan
        if x == k: return True                      @@found
    return False                                    @@notFound`,
          pseudo: `Algorithm chainSearch(val T <array of Lists>, val m <int>, val k <key>)
j = k mod m                                         @@hash
pWalk = T[j].head
while pWalk not null do                             @@scan
    if pWalk->key = k then return true              @@found
    pWalk = pWalk->link
end
return false                                        @@notFound
End chainSearch`,
        },
        run({ k }, ds) {
          const R = new DSA.Recorder();
          const j = ((k % ds.m) + ds.m) % ds.m;
          const list = ds.chains[j];
          R.step({
            line: 'hash',
            msg: 'Tính <code>j = ' + k + ' mod ' + ds.m + ' = ' + j + '</code>, duyệt danh sách tại <code>T[' + j + ']</code>.',
            vars: { k, j },
            panels: [{
              kind: 'buckets', key: 'bk', mode: 'chain', title: 'Tìm k = ' + k,
              slots: ds.chains.map((c, idx) => ({ label: idx, hl: idx === j ? 'active' : '', items: c.slice() })),
            }],
          });
          for (let i = 0; i < list.length; i++) {
            const hit = list[i] === k;
            R.step({
              line: hit ? 'found' : 'scan',
              msg: 'So sánh phần tử thứ ' + (i + 1) + ' trong danh sách <code>T[' + j + ']</code>: <code>' + list[i] + (hit ? ' == ' : ' != ') + k + '</code>.',
              vars: { k, j, indexInChain: i, found: hit },
              panels: [{
                kind: 'buckets', key: 'bk', mode: 'chain', title: 'Tìm k = ' + k,
                slots: ds.chains.map((c, idx) => ({
                  label: idx,
                  hl: idx === j ? 'active' : '',
                  items: c.map((x, p) => ({ label: x, hl: idx === j && p === i ? (hit ? 'found' : 'compare') : '' })),
                })),
              }],
            });
            if (hit) return R.steps;
          }
          R.step({ line: 'notFound', msg: 'Không tìm thấy khóa <code>' + k + '</code> trong <code>T[' + j + ']</code>.', vars: { k, j, found: false } });
          return R.steps;
        },
      },
      {
        id: 'deleteChain',
        label: 'Xóa khóa trong Linked List (chainDelete)',
        args: [{ id: 'k', label: 'Khóa cần xóa k', type: 'number', value: 22 }],
        code: {
          cpp: `bool chainDelete(std::vector<int> T[], int m, int k) {
    int j = k % m;                                  @@hash
    auto it = std::find(T[j].begin(), T[j].end(), k); @@scan
    if (it == T[j].end()) return false;             @@notFound
    T[j].erase(it);                                 @@remove
    return true;                                    @@remove
}`,
          java: `static boolean chainDelete(List<Integer>[] T, int k) {
    int j = k % T.length;                           @@hash
    return T[j].remove(Integer.valueOf(k));         @@remove
}`,
          python: `def chain_delete(T, k):
    j = k % len(T)                                  @@hash
    if k in T[j]:                                   @@scan
        T[j].remove(k); return True                 @@remove
    return False                                    @@notFound`,
          pseudo: `Algorithm chainDelete(ref T <array of Lists>, val m <int>, val k <key>)
j = k mod m                                         @@hash
Search for k in linked list T[j]                    @@scan
if found then
    Remove node k from linked list T[j]             @@remove
    return true
end
return false                                        @@notFound
End chainDelete`,
        },
        run({ k }, ds) {
          const R = new DSA.Recorder();
          const j = ((k % ds.m) + ds.m) % ds.m;
          const idx = ds.chains[j].indexOf(k);
          R.step({
            line: 'hash',
            msg: 'Tính địa chỉ <code>j = ' + k + ' mod ' + ds.m + ' = ' + j + '</code>.',
            vars: { k, j },
            panels: [{ kind: 'buckets', key: 'bk', mode: 'chain', title: 'Xóa k = ' + k, slots: ds.chains.map((c, i) => ({ label: i, hl: i === j ? 'active' : '', items: c.slice() })) }],
          });
          if (idx < 0) {
            R.step({ line: 'notFound', msg: 'Không tìm thấy khóa <code>' + k + '</code> trong dây chuyền <code>T[' + j + ']</code>.', vars: { k, j, deleted: false } });
            return R.steps;
          }
          ds.chains[j].splice(idx, 1);
          R.step({
            line: 'remove',
            msg: 'Đã xóa nút <code>' + k + '</code> khỏi danh sách liên kết <code>T[' + j + ']</code>.',
            vars: { k, j, remainingInChain: ds.chains[j].length },
            panels: [{ kind: 'buckets', key: 'bk', mode: 'chain', title: 'Sau khi xóa ' + k, slots: ds.chains.map((c, i) => ({ label: i, hl: i === j ? 'found' : '', items: c.slice() })) }],
          });
          return R.steps;
        },
      },
      {
        id: 'bucketDemo',
        label: 'Mô phỏng Bucket Hashing',
        args: [
          { id: 'arr', label: 'Dãy khóa', type: 'array', value: '15 22 29 36 8 43 50' },
          { id: 'm', label: 'Số lượng Bucket (m)', type: 'number', value: 5 },
          { id: 'cap', label: 'Sức chứa mỗi Bucket (B)', type: 'number', value: 3 },
        ],
        code: {
          cpp: `bool bucketInsert(std::vector<int> B[], int m, int cap, int k) {
    int home = k % m;                               @@hash
    for (int i = 0; i < m; ++i) {                   @@probe
        int j = (home + i) % m;                     @@probe
        if ((int)B[j].size() < cap) {               @@checkCap
            B[j].push_back(k);                      @@place
            return true;
        }
    }
    return false;
}`,
          java: `static boolean bucketInsert(List<Integer>[] B, int cap, int k) {
    int m = B.length, home = k % m;                 @@hash
    for (int i = 0; i < m; i++) {                   @@probe
        int j = (home + i) % m;                     @@probe
        if (B[j].size() < cap) {                    @@checkCap
            B[j].add(k); return true;               @@place
        }
    }
    return false;
}`,
          python: `def bucket_insert(B, cap, k):
    m = len(B); home = k % m                        @@hash
    for i in range(m):                              @@probe
        j = (home + i) % m                          @@probe
        if len(B[j]) < cap:                         @@checkCap
            B[j].append(k); return True             @@place
    return False`,
          pseudo: `Algorithm bucketInsert(ref B <array of Buckets>, val m <int>, val cap <int>, val k <key>)
// Each bucket holds up to cap items
home = k mod m                                      @@hash
for i = 0 to m - 1 do                               @@probe
    j = (home + i) mod m                            @@probe
    if B[j].count < cap then                        @@checkCap
        Place k into next free slot of bucket B[j]  @@place
        return true
    end
end
return false // Overflow
End bucketInsert`,
        },
        run({ arr, m, cap }) {
          const numB = Math.max(2, Math.min(12, m || 5));
          const B = Math.max(1, Math.min(5, cap || 3));
          const buckets = Array.from({ length: numB }, () => []);
          const R = new DSA.Recorder();
          arr.forEach((k) => {
            const home = ((k % numB) + numB) % numB;
            for (let i = 0; i < numB; i++) {
              const j = (home + i) % numB;
              if (buckets[j].length < B) {
                buckets[j].push(k);
                R.step({
                  line: 'place',
                  msg: 'Khóa <code>' + k + '</code>: <code>home = ' + k + ' mod ' + numB + ' = ' + home + '</code>' +
                    (i > 0 ? ' (bucket đầy → linear probing sang bucket <code>B' + j + '</code>)' : '') +
                    ' → đặt vào ô thứ ' + buckets[j].length + '/' + B + ' của bucket <code>B' + j + '</code>.',
                  vars: { key: k, home, bucket: 'B' + j, slot: buckets[j].length + '/' + B },
                  panels: [{
                    kind: 'buckets', key: 'b', mode: 'bucket', capacity: B,
                    title: 'Bucket Hashing (m = ' + numB + ', mỗi bucket chứa tối đa ' + B + ' phần tử)',
                    slots: buckets.map((b, idx) => ({
                      label: 'B' + idx, capacity: B, hl: idx === j ? 'active' : '',
                      items: b.map((x) => ({ label: x, hl: x === k && idx === j ? 'found' : '' })),
                    })),
                  }],
                });
                break;
              }
            }
          });
          return R.steps;
        },
      },
    ],
  });
})();
