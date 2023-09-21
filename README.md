# SE100 Bookstore Backend

## Giới thiệu

Hệ thống quản lý cửa hàng sách được xây dựng nhằm mục đích hỗ trợ người quản lý trong các công việc liên quan đến vận hành và quản lý cửa hàng bán sách bao gồm: những việc liên quan đến sách như tra cứu, tìm kiếm, quản lý các thông tin liên quan; những công việc liên quan đến cơ sở vật chất và tài chính: thu chi, lợi nhuận, tình hình cơ sở vật chất, vị trí các kệ sách, tình trạng kho hàng. Về phía khách hàng, ứng dụng sẽ giúp cho người mua dễ dàng hơn trong việc tìm được cuốn sách như ý, tìm kiếm thông tin liên quan dễ dàng và giúp cho việc giao dịch sách diễn ra tiện lợi nhất.

Một cửa hàng sách cơ bản có thể sẽ quản lý rất nhiều đầu sách khác nhau với tổng số lượng rất lớn. Vì đối tượng của hệ thống là hướng đến những cửa hàng sách với quy mô vừa đến lớn nên số lượng khách nhà sách phải phục vụ sẽ rất lớn. Cửa hàng sẽ mở cửa vào các ngày trong tuần (kể cả chủ nhật và ngày lễ) với khung giờ mở cửa và đóng cửa nhất định. Các công việc chính của nhà sách sẽ là quản lý việc mua, bán, quản lý nhân viên, quản lý khách mua hàng, quản lý các dãy kệ, xử lý, giải quyết đối với các sự cố xảy ra trong nhà sách và nhà sách cũng sẽ thường xuyên thu mua và thanh lý sách.

Hệ thống này được thiết kế để sử dụng tại các nhà sách được trang bị các “tablet” đặt rải rác khắp cửa hàng, khách hàng có thể duyệt qua các thông tin về sách trong thư viện và chọn mua thêm vào giỏ hàng và sau đó họ sẽ thanh toán tại quầy.

Hệ thống quản lý sẽ bao gồm ba cấp độ user đó là chủ cửa hàng (admin) đây sẽ là cấp độ user cao nhất có được toàn quyền truy cập, quản lý và thay đổi dữ liệu của cửa hàng ví dụ là những thông tin về nhân viên, khách hàng, v.v.. Cấp độ thứ hai đó là cấp độ nhân viên (nhanvien), về cơ bản, đây là sẽ là cấp độ khá giống cấp độ trên nó, nhưng sẽ bị giới hạn về quyền hơn đối với việc truy cập và thay đổi dữ liệu của cửa hàng hơn như không thể tự thay đổi cơ sở dữ liệu về các nhân viên đây sẽ là cấp độ cho phép các nhân viên cập nhật dữ liệu về sách, những công việc liên quan đến việc vận hành và kinh doanh hằng ngày của cửa hàng. Cấp độ cuối cùng đó là cấp độ khách hàng (khachhang), ở cấp độ người dùng này, quyền truy cập sẽ được giới hạn chỉ còn là về các thông tin được công khai của cửa hàng, họ có thể tìm kiếm các thông tin cơ bản về sách (tên sách, giá tiền, tác giả, nhà xuất bản,...) thông tin về thư viện. Ở cấp độ khách hàng thì khách không cần đăng nhập vào hệ thống.

## Cài đặt

![nodejs support](https://img.shields.io/badge/nodejs%20support-%3E%3D%20%2016.7.0-green)

### Clone repository

```bash
git clone https://github.com/mchis1908/SE100_BookStore_BE.git
```

### Cài đặt các thư viện cần thiết

```bash
npm install
```

### Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc của project với nội dung như sau:

```bash
MONGODB_URI=<mongodb_uri>
```

### Chạy ứng dụng

#### Chạy ứng dụng ở chế độ development

```bash
npm run dev
```

#### Chạy ứng dụng ở chế độ production

```bash
npm run start
```

## Contributors

![](https://contrib.rocks/image?repo=mchis1908/SE100_BookStore_BE)
