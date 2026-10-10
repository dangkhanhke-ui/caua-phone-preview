# Atlas v2 — UI và gameplay prototype

Atlas là kho hồ sơ riêng của Cauã. Bản dựng sử dụng cảm hứng iOS 10 với header burgundy, avatar nhỏ, carousel vuốt ngang bằng native CSS scroll-snap, tìm kiếm cố định và chi tiết hồ sơ theo ba chế độ.

## File tách riêng
- `atlas-data.js`: 38 hồ sơ, hồ sơ đã xóa và các mục lưu trữ mẫu.
- `atlas-v2.css`: giao diện Atlas v2, mọi selector được giới hạn trong `#atlasApp`.
- `atlas-v2.js`: màn khóa độc lập, hồ sơ, kho lưu trữ, tìm kiếm, viewer, tài khoản, cài đặt và nhập tệp trên thiết bị.
- `qa/atlas-browser.cjs`: QA tương tác Chromium được chạy bởi `.github/workflows/qa-atlas-2015.yml`.

Hai file `atlas.css` và `atlas.js` là v1 để tham khảo, không còn được load bởi `index.html`.

## Cách thử
- Mật mã chính: **1111**
- Mã phụ cho “Dữ liệu đầy đủ”: **1111**
- Chưa nhập đúng mã, Atlas chỉ hiển thị logo và bàn phím; không hiển thị tab hay hồ sơ.
- Sau khi mở, thử vuốt ngang các thẻ trong “Hồ sơ gần đây”, tìm tên “Vanessa”, “Camera”, “A Casa”, “VH Archive”, mở hồ sơ Leandro rồi vào Dòng thời gian.

## Tệp thật
Trong **Thêm → Nhập tệp**, người dùng chọn file từ máy (ảnh/PDF/video/audio), chọn hồ sơ, nguồn và địa điểm. File được lưu dưới dạng Blob trong **IndexedDB**, metadata lưu vào localStorage. Mở file vừa nhập để xem/phát; có thể đưa vào Đã xóa và khôi phục. Dữ liệu thuộc riêng trình duyệt hiện tại; không upload lên server và không đồng bộ giữa máy. Tối đa 48 MB/tệp thử nghiệm, tùy quota trình duyệt.

Các media canon chưa được cung cấp chỉ có thumbnail và bản xem trước mô phỏng; **không phải tệp gốc**. Khi tác giả bổ sung asset thật, thay từng bản mẫu bằng URL tới asset đó.

## Offline
Không có realtime feed, timer sinh sự kiện, push notification hay kết nối thiết bị thật. “Hoạt động cuối” là timestamp lịch sử. Không có luồng thu thập thông tin từ người thật.

## Cài đặt
“Lưới hồ sơ”, “Danh sách thu gọn”, “Biểu tượng nguồn”, và “Sắp xếp A–Z” có tác động thật đến giao diện và được lưu trên trình duyệt. “Khóa lại Atlas” trở về màn mật mã. Quyền xem đầy đủ cần mã phụ.

Phần dữ liệu seed chỉ để kiểm tra mật độ nội dung và thao tác. Các sự kiện và hình ảnh canon phải được kiểm tra với tác giả trước khi chuyển sang bản hoàn chỉnh.
