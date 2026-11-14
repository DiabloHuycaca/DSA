# ⟨/⟩ DSA Visualizer – Trực quan hóa Cấu trúc Dữ liệu & Giải thuật

Ứng dụng web tương tác hỗ trợ ôn tập môn **Cấu trúc Dữ liệu và Giải thuật (Data Structures & Algorithms)** với mô phỏng từng bước (step-by-step animation), bảng trạng thái biến trực tiếp, lý thuyết tóm tắt, độ phức tạp thuật toán và **code mẫu đa ngôn ngữ (`C++`, `Java`, `Python`, `Mã giả`)** có tô sáng dòng lệnh đang chạy theo thời gian thực.

---

## ✨ Tính năng nổi bật

- **Mô phỏng từng bước (Step-by-step Visualizer)**: Điều khiển phát/tạm dừng (`Play/Pause`), tiến/lùi từng bước (`Step Forward/Backward`), nhảy tới bất kỳ bước nào trên thanh tiến trình hoặc nhật ký bước chạy (`Execution Log`), và tùy chỉnh tốc độ từ `0.25×` đến `4×`.
- **Code mẫu 4 ngôn ngữ đồng bộ từng bước**:
  - Hỗ trợ chuyển đổi tức thì giữa **C++**, **Java**, **Python**, và **Mã giả (Pseudocode)**.
  - Tự động tô sáng (highlight) dòng code tương ứng với bước thuật toán đang thực thi.
- **Trạng thái cấu trúc dữ liệu sống (Persistent State)**:
  - Trên các cấu trúc cây (`BST`, `AVL`, `Splay Tree`, `B-Tree`), `Heap` và `Bảng băm`, bạn có thể liên tiếp thực hiện `Insert` → `Delete` → `Search` ngay trên cùng một cấu trúc đang hiển thị, hỗ trợ **Hoàn tác (`Undo`)** và **Khôi phục mặc định (`Reset`)**.
- **Tùy biến dữ liệu đầu vào linh hoạt**: Nhập mảng/khóa tùy ý, sinh dữ liệu ngẫu nhiên (`🎲`), chọn bậc `m` cho B-Tree (`m = 3, 4, 5, 6`), chọn phương pháp dò bảng băm, chọn đồ thị mẫu...
- **Bảng tổng hợp độ phức tạp (Cheat-sheet)**, tìm kiếm nhanh giải thuật (`Ctrl + K`) và giao diện **Sáng / Tối (Dark / Light mode)**.
- **Chạy hoàn toàn độc lập (Zero-dependency)**: Viết bằng HTML5, CSS3 và Vanilla JavaScript (SVG/DOM), không cần cài đặt thư viện hay máy chủ backend.

---

## 📚 Danh mục 9 Chương & 29 Chủ đề Giải thuật

### 1. ⇅ Sắp xếp (Sorting)
| Giải thuật | Độ phức tạp (Best / Avg / Worst) | Bộ nhớ phụ | Ổn định (Stable) |
| :--- | :---: | :---: | :---: |
| **Straight Insertion Sort** | `O(n)` / `O(n²)` / `O(n²)` | `O(1)` | Có |
| **Shell Sort** (Knuth `3k+1`, Hibbard `2k+1`, `N/2`) | `O(n)` / `O(n^1.25)` / `O(n^1.5)` | `O(1)` | Không |
| **Straight Selection Sort** | `O(n²)` / `O(n²)` / `O(n²)` | `O(1)` | Không |
| **Bubble Sort** (có cờ `flag` dừng sớm) | `O(n)` / `O(n²)` / `O(n²)` | `O(1)` | Có |
| **Quick Sort** (Phân hoạch `Partition` & Đệ quy) | `O(n log n)` / `O(n log n)` / `O(n²)` | `O(log n)` | Không |
| **Merge Sort** (trên **Linked List** & trên **Array**) | `O(n log n)` / `O(n log n)` / `O(n log n)` | `O(1)` (List) / `O(n)` (Array) | Có |
| **Radix Sort (LSD)** | `O(d · (n + r))` | `O(n + r)` | Có |

### 2. 🔍 Tìm kiếm (Searching)
- **Linear Search (Sequential Search)**: Tìm kiếm tuần tự `O(n)`.
- **Binary Search**: Tìm kiếm nhị phân lặp (Iterative `O(1)` space) và đệ quy (Recursive Call Stack `O(log n)` space).
- **Jump Search**: Tìm kiếm nhảy bước với kích thước khối tối ưu `m = √n`, độ phức tạp `O(√n)`.
- **Interpolation Search**: Tìm kiếm nội suy `O(log log n)` trên dữ liệu phân bố đều.
- **So sánh trực tiếp**: Chạy song song 4 giải thuật tìm kiếm trên cùng một mảng và khóa `x` để đếm số phép so sánh.

### 3. `#` Bảng băm (Hashing)
- **7 Phương pháp xây dựng hàm băm**: Direct Hashing, Modulo Division, Digit Extraction, Mid-Square, Folding (Fold Shift & Fold Boundary), Rotation, Pseudo-Random.
- **Closed Hashing – Open Addressing (Địa chỉ mở)**:
  - Linear Probing: `hp(k, i) = (h(k) + i) mod m`
  - Quadratic Probing: `hp(k, i) = (h(k) + i²) mod m`
  - Double Hashing: `hp(k, i) = (h₁(k) + i · h₂(k)) mod m`
  - Key Offset: `hp(k, i) = (hp(k, i − 1) + ⌊k/m⌋) mod m`
  - Hỗ trợ `Insert`, `Search`, `Delete` (đánh dấu `DELETED` / tombstone).
- **Open Hashing – Separate Chaining & Bucket Hashing**: Xử lý đụng độ bằng danh sách liên kết và bucket.

### 4. 🌳 Cây nhị phân & Cây tìm kiếm nhị phân (Tree & BST)
- **Duyệt cây nhị phân**: Preorder (`NLR`), Inorder (`LNR`), Postorder (`LRN`), Breadth-First (`bfQueue`), tính chiều cao `H` và hệ số cân bằng `B = H_L − H_R`.
- **Cây biểu thức (Expression Tree)**: Dựng cây từ biểu thức, duyệt `Infix` (có đóng mở ngoặc), `Postfix`, `Prefix` và tính giá trị biểu thức (`Evaluate`).
- **Binary Search Tree (BST)**: Thêm nút (`iterativeInsertBST` / `addBST`), tìm kiếm (`searchBST`), xóa nút (`deleteBST` – đủ 3 trường hợp: nút lá, nút 1 con, nút 2 con thay bằng Predecessor).

### 5. △ Cấu trúc Heap & Heap Sort
- **Max-Heap cơ bản**: `reheapUp`, `reheapDown`, `insertHeap`, `deleteHeap`, `buildHeap` (biểu diễn đồng thời trên cây nhị phân và mảng liên tiếp).
- **Ứng dụng của Heap**:
  - Tìm phần tử lớn thứ `k` (`selectK`).
  - Mô phỏng Hàng đợi ưu tiên (`Priority Queue`) với mã hóa mức ưu tiên `priority × 1000 + (1000 − serial)`.
- **Heap Sort**: Giai đoạn 1 tạo Heap `O(n)` và Giai đoạn 2 trích xuất phần tử lớn nhất `O(n log n)` tại chỗ (`in-place`).

### 6. ⚖ Cây cân bằng AVL (AVL Tree)
- **4 phép xoay cân bằng**: Xoay đơn phải (`LL – rotateRight`), Xoay đơn trái (`RR – rotateLeft`), Xoay kép Trái-Phải (`LR`), Xoay kép Phải-Trái (`RL`).
- **Thao tác trên cây AVL**: `AVLInsert`, `AVLDelete`, `AVLSearch` và dựng cây từng bước kèm hiển thị chỉ số cân bằng `LH (+1)`, `EH (0)`, `RH (−1)`.

### 7. ↺ Cây Splay (Splay Tree)
- **6 phép xoay Splay**: `Zig`, `Zag`, `Zig-Zig`, `Zag-Zag` (xoay ông `Q` trước, cha `P` sau), `Zig-Zag`, `Zag-Zig`.
- **Thao tác trên Splay Tree**: `Insert + Splay`, `Search + Splay`, `Delete` và bộ kịch bản bài tập mẫu.

### 8. ▤ Cây nhiều nhánh & B-Tree (Multiway Search Tree)
- **Hỗ trợ chọn bậc `m` (`Order m = 3, 4, 5, 6`)** ngay trên mọi tab chức năng.
- **Chèn khóa (`Insert` & `splitNode`)**: Tách nút tràn và đẩy khóa trung vị (`upEntry`) lên nút cha.
- **Xóa khóa (`Delete` & `Reflow`)**: Xóa tại nút nội (thay bằng Predecessor), xử lý thiếu khóa (`Underflow`) bằng **Balance** (mượn khóa anh em qua cha) và **Combine** (gộp nút với anh em).
- **Tìm kiếm (`Search`)**, **Duyệt Inorder (`Traversal`)** và **Dựng B-Tree từ dãy khóa (`Build`)**.

### 9. ◎ Đồ thị (Graph Algorithms)
- **Biểu diễn đồ thị**: Chuyển đổi qua lại giữa Ma trận kề (Adjacency Matrix) và Danh sách liên kết kề (Adjacency List) cho cả đồ thị vô hướng & có hướng.
- **Duyệt đồ thị**: `DepthFirstTraversal` (DFS dùng Stack) và `BreadthFirstTraversal` (BFS dùng Queue).
- **Sắp xếp Tô-pô (Topological Sort)**: `DepthTopoSort` (DFS) và `BreadthTopoSort` (Kahn's Algorithm / Indegree Queue).
- **Đường đi ngắn nhất Dijkstra (`ShortestPath`)**.
- **Cây khung nhỏ nhất Prim (`MinimumSpanningTree`)**.
- **Luồng cực đại trên mạng (`Maximum Flow` – Ford-Fulkerson / Edmonds-Karp)**.
- **Ghép cặp cực đại trên đồ thị hai phía (`Maximum Bipartite Matching`)**.
- **Tô màu đồ thị tham lam (`Graph Coloring`)**.

---

## 🚀 Hướng dẫn chạy

### Chạy trực tiếp trên máy (Offline)
Không cần cài đặt bất kỳ công cụ nào. Chỉ cần mở trực tiếp file [`index.html`](./index.html) bằng trình duyệt (Chrome, Edge, Firefox, Safari).

Hoặc nếu dùng VS Code, bạn có thể mở bằng extension **Live Server** hay chạy lệnh:
```bash
npx serve .
```

### Triển khai lên Web (GitHub Pages / Vercel / Netlify)
Dự án là web tĩnh hoàn toàn nên có thể đẩy trực tiếp lên **GitHub Pages**, **Vercel** hoặc **Netlify**:
```bash
git add .
git commit -m "Deploy DSA Visualizer"
git push -u origin main
```

---

## ⌨ Phím tắt tiện lợi

| Phím tắt | Chức năng |
| :---: | :--- |
| `Space` | Phát / Tạm dừng (`Play / Pause`) |
| `←` / `→` | Lùi 1 bước / Tiến 1 bước |
| `Home` / `End` | Nhảy về bước đầu tiên / bước cuối cùng |
| `[` / `]` | Giảm / Tăng tốc độ chạy |
| `Ctrl + K` | Tìm kiếm nhanh giải thuật |
| `Esc` | Đóng hộp thoại |

---

## 📁 Cấu trúc thư mục

```text
├── index.html          # Giao diện chính của ứng dụng
├── css/
│   └── style.css       # Giao diện Sáng/Tối, bố cục & hiệu ứng chuyển động
└── js/
    ├── core/
    │   ├── core.js         # Quản lý danh mục chương, đăng ký giải thuật & tiện ích
    │   ├── renderers.js    # Bộ vẽ SVG/DOM cho Mảng, Cây, B-Tree, Đồ thị, Bảng, Danh sách
    │   ├── highlight.js    # Tô sáng cú pháp (Syntax Highlighter) cho C++, Java, Python, Mã giả
    │   └── app.js          # Điều khiển giao diện, bộ phát từng bước & lưu trạng thái
    └── algos/
        ├── sorting.js      # 7 giải thuật sắp xếp
        ├── searching.js    # 4 giải thuật tìm kiếm & bảng so sánh
        ├── hashing.js      # 7 hàm băm, Open Addressing & Separate Chaining/Bucket
        ├── tree.js         # Duyệt cây nhị phân, Cây biểu thức & BST
        ├── heap.js         # Max-Heap, selectK, Priority Queue & Heap Sort
        ├── avl.js          # Các phép xoay AVL & thêm/xóa/tìm kiếm trên AVL
        ├── splay.js        # Các phép xoay Splay & thêm/tìm/xóa trên Splay Tree
        ├── btree.js        # B-Tree bậc m (Insert, Delete/Reflow, Search, Traversal, Build)
        ├── graph.js        # Biểu diễn đồ thị, DFS, BFS & Topological Sort
        └── graph2.js       # Dijkstra, Prim MST, Max Flow, Bipartite Matching & Graph Coloring
```
