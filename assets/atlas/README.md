# atlas · app nội bộ (bối cảnh 2015)

atlas là app hư cấu nằm trong iphone của cauã; **không** có kết nối tới thiết bị, camera, tài khoản hay vị trí người thật. các mục ghi nhận và thông báo đều là dữ liệu kịch bản.

## tách file

- `atlas-data.js`: nội dung 38 hồ sơ chính, 6 hồ sơ đã xóa, hiện vật, metadata nguồn, quy tắc và feed mẫu.
- `atlas.css`: ui độc lập với các app còn lại, theo ngôn ngữ ios 8 / 2015.
- `atlas.js`: mở khóa, màn lưới, chi tiết hồ sơ, trực tiếp, lưu trữ theo tháng, viewer, timeline, search, hai tầng khóa, thông báo.
- `../../qa/atlas-browser.cjs`: bài test chromium cho các thao tác chính.

html chỉ chứa icon atlas, khung `#atlasApp`, stylesheet/script và khai báo atlas trong switcher. tránh sửa phần app khác khi thêm hồ sơ.

## mã tạm để test (chưa khóa canon)

- mã mở atlas: **2408**
- mã phụ mở “dữ liệu đầy đủ”: **1105**

đổi trong `AtlasData2015.config` của `atlas-data.js`. đây chỉ là cổng gameplay bằng javascript chạy trên máy người xem, **không phải mã hóa hay cơ chế bảo mật dữ liệu thật**.

## nội dung & ảnh

avatar các main cast đang dùng lại ảnh gốc `MC01`–`MC09`, còn npc có trong facebook dùng chính xác chỉ số sprite theo `assets/facebook/npc-avatar-registry.json`. các nhân vật chưa có ảnh canon (như enzo, leandro, vanessa, sérgio, guilherme, otávio) hiện có ô chữ cái trung tính: thay bằng ảnh do tác giả cung cấp khi đã chốt nhân dạng.

mọi mục có thể mở, xem preview và đọc metadata. hiện **các tệp media trong atlas là mock preview**, chưa có ảnh, video, pdf hoặc bản âm thanh canon đi kèm. không dựng file giả rồi tuyên bố đó là tài liệu thật. khi có ảnh/file chính thức nên mở rộng item bằng trường `media` và dùng viewer thật cho đúng loại. dữ liệu giả lập tự sinh chỉ làm đầy phần mật độ timeline; các mẩu gợi ý quan trọng nằm trong danh sách curated ở `atlas-data.js`.

vh archive **không phải chung database với atlas**: vật phẩm từ archive chỉ có nhãn nguồn, mã gốc và thời điểm cauã sao chép vào atlas. khi archive thật được bổ sung thì mới làm liên kết read-only có đối chiếu.

## sự kiện kịch bản

có thể gửi sự kiện từ chapter script qua:

```js
window.dispatchEvent(new CustomEvent('caua:atlas-event', {
  detail: {
    p: 'dudu',
    type: 'location', // device | location | camera | sync
    text: 'Eduardo Santos vừa tới A Casa.',
    time: '09:01'
  }
}));
```

hoặc `window.Atlas2015.pushEvent({p:'breno',type:'device',text:'Có hoạt động mới từ Breno.'})`. sự kiện mới sẽ được thêm vào feed; khi atlas đang mở và đã unlock, app hiện notification ngắn. có lịch trình mô phỏng chậm để feed không chết cứng trong lúc player đang đọc. sự kiện không chạm bất kỳ api giám sát nào của máy thật.

## qa

workflow `.github/workflows/qa-atlas-2015.yml` kiểm tra cú pháp và chạy trình duyệt chromium theo chuỗi: khóa sai/đúng → 38 người → archive → item metadata → mã phụ → tìm kiếm → cảnh báo/feed → mở app khác.

về sau có thể thay mã tạm, ảnh, và item curated mà không cần động vào cách hoạt động của home screen hoặc switcher.
