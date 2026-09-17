User: Analisis seluruh source code project ini dan buat **test plan integration test menggunakan Jest + Supertest**.

**Jangan menulis atau mengubah kode. Hanya analisis dan daftar test case.**

Untuk semua endpoint **GET, POST, PUT/PATCH, dan DELETE**, identifikasi:

- Happy path
- Edge case / boundary
- Validation error
- Not found / duplicate / database constraint
- Authentication & authorization
- Business logic
- Relationship antar resource
- Response yang perlu diverifikasi
- Perubahan database/side effect yang perlu diverifikasi
Gunakan priority:

- **P0** = wajib
- **P1** = penting
- **P2** = tambahan
Output dalam tabel:

PriorityMethodEndpointCategoryTest CaseExpected ResultKemudian berikan total jumlah test yang direkomendasikan untuk setiap endpoint.

**Rules:**

- Baca source code langsung dari project.
- Jangan mengarang behavior.
- Jangan mengasumsikan validation atau status code.
- Jangan membuat kode test.
- Jangan mengubah file apa pun.
- Jangan membuat test case yang duplikat.
- Jika behavior tidak jelas, tandai `Needs Verification`.
- Fokus hanya pada **integration test**, bukan unit test.

GitHub Copilot: Saya akan menelusuri bootstrap aplikasi, route registry, lalu setiap modul controller/schema/service/repository agar daftar test hanya mengikuti behavior yang benar-benar ada. Saya juga akan mencatat status code dan side effect yang eksplisit; bagian yang tidak dapat dipastikan dari source akan saya tandai `Needs Verification`.

Searched for files matching `Rent Car` · `src/modules/**/*.ts`, 20 matches


Struktur awal menunjukkan seluruh API berada di bawah `/api/v1` dan terdiri dari sembilan resource/module. Berikutnya saya akan mengambil route dan controller/schema/service secara paralel, karena route menentukan cakupan endpoint sementara schema dan service menentukan kategori kasus serta side effect yang sah.


# Test Plan Integration Jest + Supertest

Analisis berdasarkan route, controller, schema, service, middleware, repository, dan Prisma schema. Prefix seluruh endpoint adalah `/api/v1`.

Status atau behavior yang tidak ditetapkan secara eksplisit oleh source ditandai `Needs Verification`.

## Authentication

| Priority | Method | Endpoint | Category | Test Case | Expected Result |
|---|---|---|---|---|---|
| P0 | POST | `/auth/sign-up` | Happy path, DB, Response | Registrasi dengan `name`, email valid, password minimal 6 karakter | `201`; user dibuat dengan role `CUSTOMER`; password tersimpan sebagai hash; token dikembalikan |
| P0 | POST | `/auth/sign-up` | Validation | `name` kurang dari 3, email invalid, password kurang dari 6 | `400 Validation error`; user tidak dibuat |
| P0 | POST | `/auth/sign-up` | Duplicate, DB constraint | Registrasi menggunakan email yang sudah ada | `409 Email is already registered`; tidak ada user kedua |
| P1 | POST | `/auth/sign-up` | Boundary | `name` tepat 3 karakter dan password tepat 6 karakter | Diterima jika sesuai schema |
| P1 | POST | `/auth/sign-up` | Response | Verifikasi response tidak membocorkan password dan berisi `user` serta `token` | Struktur response sesuai controller |

| P0 | POST | `/auth/login` | Happy path, Side effect | Login dengan kredensial valid | `200`; token dikembalikan; cookie `jwt` dan `refreshToken` dibuat |
| P0 | POST | `/auth/login` | Validation | Email invalid atau password kosong | `400 Validation error` |
| P0 | POST | `/auth/login` | Authentication | Email tidak ada atau password salah | `401 Invalid email or password` |
| P0 | POST | `/auth/login` | DB, Side effect | Login berhasil lalu cek `RefreshToken` | Refresh token hash tersimpan dengan expiry 7 hari |
| P1 | POST | `/auth/login` | Rate limit | Melebihi batas request dari IP yang sama | `429`; perlu verifikasi konfigurasi Upstash |

| P0 | POST | `/auth/refresh` | Happy path, Side effect | Refresh menggunakan cookie refresh token valid | `200`; access token baru; token lama direvoke; refresh token baru dibuat |
| P0 | POST | `/auth/refresh` | Authentication | Tidak mengirim cookie `refreshToken` | `401 Refresh token not provided` |
| P0 | POST | `/auth/refresh` | Authentication | Token invalid, revoked, atau expired | `401` sesuai pesan error source |
| P0 | POST | `/auth/refresh` | Idempotency, DB | Reuse refresh token lama setelah rotasi | Request kedua ditolak; token lama tetap revoked |
| P1 | POST | `/auth/refresh` | Response | Verifikasi cookie baru dan response `{ accessToken }` | Tidak ada access token lama yang digunakan |

| P0 | DELETE | `/auth/logout` | Happy path, Side effect | Logout dengan refresh token valid | `200 Logged out successfully`; refresh token direvoke; kedua cookie dihapus |
| P1 | DELETE | `/auth/logout` | Edge case | Logout tanpa refresh token | Tetap berhasil dan cookie dibersihkan |
| P1 | DELETE | `/auth/logout` | Authorization | Panggil tanpa access-token authentication | Endpoint tetap dapat dipanggil; behavior ini perlu dikonfirmasi karena route tidak memakai auth middleware |

| P0 | POST | `/auth/create-admin` | Authorization, Happy path | SUPERADMIN membuat admin baru | `201`; user dibuat dengan role `ADMIN`; password di-hash |
| P0 | POST | `/auth/create-admin` | Authentication | Tanpa token atau token invalid | `401` |
| P0 | POST | `/auth/create-admin` | Authorization | CUSTOMER atau ADMIN mencoba membuat admin | `403 Forbidden - insufficient permissions` |
| P0 | POST | `/auth/create-admin` | Validation, Duplicate | Payload invalid atau email sudah digunakan | `400` untuk validation; `409` untuk duplicate |

## Brands

| Priority | Method | Endpoint | Category | Test Case | Expected Result |
|---|---|---|---|---|---|
| P0 | POST | `/brands` | Authentication, Authorization | CUSTOMER atau tanpa token membuat brand | `401` atau `403`; tidak ada DB mutation |
| P0 | POST | `/brands` | Happy path, Upload, DB | ADMIN mengirim `name` valid dan file logo JPEG/PNG/WEBP | `201 Brand created successfully`; brand tersimpan; Cloudinary upload dipanggil |
| P0 | POST | `/brands` | Validation, Upload | Logo tidak ada, file bukan image, file > 5 MB | `400`; brand tidak dibuat |
| P1 | POST | `/brands` | Boundary | Nama tepat 3 atau 100 karakter | Diterima sesuai schema |
| P1 | POST | `/brands` | Response | Verifikasi `name`, `logo`, dan public ID pada response/DB | Nilai tersimpan sesuai hasil upload |

| P0 | GET | `/brands` | Happy path, Response | Ambil seluruh brand | `200`; response berisi `{ brands }` |
| P1 | GET | `/brands` | Empty state | Tidak ada brand | `200` dengan array kosong atau behavior aktual; `Needs Verification` |
| P1 | GET | `/brands` | Relationship | Brand yang memiliki vehicles ikut diverifikasi | Data sesuai repository; detail relasi perlu `Needs Verification` |

| P0 | GET | `/brands/:id` | Happy path | ID UUID brand yang ada | `200`; response berisi `{ brand }` |
| P0 | GET | `/brands/:id` | Validation | ID bukan UUID | `400 Validation error` atau behavior controller aktual; verifikasi |
| P1 | GET | `/brands/:id` | Not found | UUID valid tetapi tidak ada | Source mengembalikan `200` dengan `brand: null`; pastikan tidak berubah menjadi `404` |

| P0 | PUT | `/brands/:id` | Happy path, DB | ADMIN mengubah nama tanpa upload logo | `200`; data brand berubah |
| P0 | PUT | `/brands/:id` | Upload, Side effect | Update dengan logo baru | Logo baru di-upload; logo lama dihapus bila public ID tersedia |
| P0 | PUT | `/brands/:id` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | PUT | `/brands/:id` | Validation | ID invalid atau nama di luar batas | Validation/error behavior aktual; source controller dapat mengembalikan `500`, `Needs Verification` |
| P1 | PUT | `/brands/:id` | Not found | Update brand yang tidak ada | Error dibungkus menjadi `500 { error }` menurut controller; verifikasi |

| P0 | DELETE | `/brands/:id` | Happy path, DB, Side effect | ADMIN menghapus brand tanpa vehicle terkait | `200 Data success deleted`; record dan logo Cloudinary terhapus |
| P0 | DELETE | `/brands/:id` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | DELETE | `/brands/:id` | Validation | ID bukan UUID | Error validation aktual |
| P1 | DELETE | `/brands/:id` | Relationship, DB constraint | Hapus brand yang masih dipakai vehicle | Constraint/error response perlu `Needs Verification`; data terkait tidak boleh terhapus tanpa cascade |

## Vehicle Categories

| Priority | Method | Endpoint | Category | Test Case | Expected Result |
|---|---|---|---|---|---|
| P0 | POST | `/vehicle-cat` | Happy path, DB | ADMIN membuat kategori dengan nama valid | `201 Vehicle Categories created successfully`; kategori tersimpan |
| P0 | POST | `/vehicle-cat` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | POST | `/vehicle-cat` | Validation | Nama kurang dari 3 karakter atau payload invalid | Error validation aktual; source controller berpotensi `500`, `Needs Verification` |
| P1 | POST | `/vehicle-cat` | Boundary | Nama tepat 3 dan 100 karakter | Diterima sesuai schema |
| P1 | POST | `/vehicle-cat` | Response | Verifikasi nama dan description | Response sesuai controller |

| P0 | GET | `/vehicle-cat` | Happy path, Response | Ambil seluruh kategori | `200`; response menggunakan key `{ brands }` meskipun datanya kategori |
| P1 | GET | `/vehicle-cat` | Empty state | Tidak ada kategori | Empty array atau behavior aktual; `Needs Verification` |

| P0 | GET | `/vehicle-cat/:id` | Happy path | ID kategori yang ada | `200`; response `{ vehicleCat }` |
| P0 | GET | `/vehicle-cat/:id` | Validation | ID invalid | Validation error |
| P1 | GET | `/vehicle-cat/:id` | Not found | ID valid tetapi kategori tidak ada | Kemungkinan `200` dengan `null`; `Needs Verification` |

| P0 | PUT | `/vehicle-cat/:id` | Happy path, DB | ADMIN mengubah nama/description | `200`; kategori berubah |
| P0 | PUT | `/vehicle-cat/:id` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | PUT | `/vehicle-cat/:id` | Validation | ID/payload invalid | Error aktual, kemungkinan `500`; `Needs Verification` |
| P1 | PUT | `/vehicle-cat/:id` | Not found | Kategori tidak ada | Pesan service `Vehile Categories Not Found`; controller kemungkinan `500` |

| P0 | DELETE | `/vehicle-cat/:id` | Happy path, DB | Hapus kategori tanpa vehicle terkait | `200 Data success deleted`; record terhapus |
| P0 | DELETE | `/vehicle-cat/:id` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | DELETE | `/vehicle-cat/:id` | Validation | ID invalid | Validation error |
| P1 | DELETE | `/vehicle-cat/:id` | Relationship, DB constraint | Hapus kategori yang masih digunakan vehicle | Constraint behavior perlu `Needs Verification` |

## Vehicles

| Priority | Method | Endpoint | Category | Test Case | Expected Result |
|---|---|---|---|---|---|
| P0 | POST | `/vehicles` | Happy path, Relationship, DB | ADMIN membuat vehicle dengan brand dan kategori yang ada serta thumbnail valid | `201 Vehicle created successfully`; vehicle terhubung ke brand dan kategori |
| P0 | POST | `/vehicles` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | POST | `/vehicles` | Validation | UUID brand/category invalid, harga non-positive, model/color/description terlalu pendek | `400`; vehicle tidak dibuat |
| P0 | POST | `/vehicles` | Upload | Thumbnail hilang, tipe tidak valid, atau > 5 MB | `400`; Cloudinary/DB tidak boleh berhasil |
| P1 | POST | `/vehicles` | Boundary | Tahun 1900 dan current year + 1; plate 3/20 karakter; harga mendekati 0 | Diterima/ditolak sesuai schema |
| P0 | POST | `/vehicles` | Relationship, DB constraint | Brand atau kategori UUID valid tetapi record tidak ada | Gagal karena foreign key/service; status aktual `Needs Verification` |
| P1 | POST | `/vehicles` | Side effect | Setelah create, cek cache daftar vehicles | Cache all-vehicles dibersihkan |

| P0 | GET | `/vehicles` | Happy path, Relationship, Response | Ambil vehicles | `200 { vehicles }`; setiap vehicle menyertakan brand dan category |
| P1 | GET | `/vehicles` | Cache | Request pertama lalu request kedua | Cache read/write terjadi dengan TTL 300 detik; response konsisten |
| P1 | GET | `/vehicles` | Empty state | Tidak ada vehicle | `200` dengan array kosong atau behavior aktual |

| P0 | GET | `/vehicles/:id` | Happy path, Response | Ambil vehicle yang ada | `200 { vehicle }`; relasi tersedia sesuai repository |
| P0 | GET | `/vehicles/:id` | Validation | ID bukan UUID | Validation error |
| P0 | GET | `/vehicles/:id` | Not found | Vehicle tidak ada | `404 Vehicle not found` |
| P1 | GET | `/vehicles/:id` | Cache | Request berulang untuk ID sama | Cache per-vehicle dipakai dan response tetap sama |

| P0 | PUT | `/vehicles/:id` | Happy path, DB | ADMIN mengubah field vehicle tanpa thumbnail baru | `200`; field berubah |
| P0 | PUT | `/vehicles/:id` | Upload, Side effect | Update memakai thumbnail baru | Upload baru, asset lama dihapus, cache ID/all dibersihkan |
| P0 | PUT | `/vehicles/:id` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | PUT | `/vehicles/:id` | Validation | ID/payload invalid | `400` validation |
| P0 | PUT | `/vehicles/:id` | Not found | Vehicle tidak ada | `404 Vehicle Not Found` |

| P0 | DELETE | `/vehicles/:id` | Happy path, DB, Side effect | ADMIN menghapus vehicle tanpa relasi penghalang | `200 Data success deleted`; thumbnail dan cache dihapus |
| P0 | DELETE | `/vehicles/:id` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | DELETE | `/vehicles/:id` | Validation | ID invalid | Validation error |
| P1 | DELETE | `/vehicles/:id` | Relationship, DB constraint | Vehicle memiliki image atau booking | Constraint behavior dan preservation data perlu `Needs Verification` |

## Vehicle Images

| Priority | Method | Endpoint | Category | Test Case | Expected Result |
|---|---|---|---|---|---|
| P0 | POST | `/vehicle-images` | Happy path, Relationship, DB | ADMIN upload image untuk vehicle yang ada | `201 Vehicle image created successfully`; image terhubung ke vehicle |
| P0 | POST | `/vehicle-images` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | POST | `/vehicle-images` | Upload, Validation | File hilang, tipe invalid, > 5 MB, atau vehicle ID invalid | `400`; record tidak dibuat |
| P1 | POST | `/vehicle-images` | Relationship | Vehicle ID valid tetapi vehicle tidak ada | Foreign-key/service error; `Needs Verification` |
| P1 | POST | `/vehicle-images` | Side effect | Verifikasi URL dan public ID hasil Cloudinary | Nilai tersimpan dan dikembalikan sesuai controller |

| P0 | GET | `/vehicle-images` | Happy path, Response | Ambil seluruh image | `200 { vehicleImages }` |
| P1 | GET | `/vehicle-images` | Empty state, Relationship | Tidak ada image atau vehicle memiliki banyak image | Array kosong atau daftar lengkap; behavior relasi aktual diverifikasi |

| P0 | GET | `/vehicle-images/:id` | Happy path | ID image yang ada | `200 { vehicleImage }` |
| P0 | GET | `/vehicle-images/:id` | Validation | ID invalid | Validation error |
| P1 | GET | `/vehicle-images/:id` | Not found | ID valid tetapi tidak ada | Kemungkinan `200` dengan `null`; `Needs Verification` |

| P0 | PUT | `/vehicle-images/:id` | Happy path, DB | Update metadata tanpa file baru | `200`; image berubah |
| P0 | PUT | `/vehicle-images/:id` | Upload, Side effect | Update dengan file baru | File baru di-upload; public ID lama dihapus |
| P0 | PUT | `/vehicle-images/:id` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P1 | PUT | `/vehicle-images/:id` | Not found, Validation | ID/image/payload invalid atau record tidak ada | Controller dapat mengembalikan `500 { error }`; `Needs Verification` |

| P0 | DELETE | `/vehicle-images/:id` | Happy path, DB, Side effect | ADMIN menghapus image | `200 Data success deleted`; DB record dan asset Cloudinary dihapus |
| P0 | DELETE | `/vehicle-images/:id` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | DELETE | `/vehicle-images/:id` | Validation | ID invalid | Validation error |
| P1 | DELETE | `/vehicle-images/:id` | Not found | Image tidak ada | Error aktual controller; `Needs Verification` |

## Coupons

| Priority | Method | Endpoint | Category | Test Case | Expected Result |
|---|---|---|---|---|---|
| P0 | POST | `/coupons` | Happy path, DB | ADMIN membuat coupon FIXED dan PERCENTAGE | `201 Coupon created successfully`; field tersimpan |
| P0 | POST | `/coupons` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | POST | `/coupons` | Validation | Code < 2, discount negatif, usage limit < 1, expiry invalid, type invalid | `400` validation |
| P1 | POST | `/coupons` | Boundary | `usedCount=0`, `usageLimit=1`, discount 0, `isActive=false` | Diterima sesuai schema |
| P0 | POST | `/coupons` | Duplicate, DB constraint | Code sama dengan coupon existing | DB unique constraint; controller kemungkinan `500`, `Needs Verification` |

| P0 | GET | `/coupons` | Happy path, Response | Ambil seluruh coupon | `200 { coupons }` |
| P1 | GET | `/coupons` | Empty state | Tidak ada coupon | Array kosong atau behavior aktual |

| P0 | GET | `/coupons/:id` | Happy path | Coupon tersedia | `200 { coupon }` |
| P0 | GET | `/coupons/:id` | Validation | ID invalid | Validation error |
| P1 | GET | `/coupons/:id` | Not found | Coupon tidak ada | Kemungkinan `200` dengan `null`; `Needs Verification` |

| P0 | PUT | `/coupons/:id` | Happy path, DB | ADMIN mengubah coupon | `200`; data berubah |
| P0 | PUT | `/coupons/:id` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | PUT | `/coupons/:id` | Validation | ID/payload invalid | Error aktual, kemungkinan `500`; `Needs Verification` |
| P1 | PUT | `/coupons/:id` | Duplicate, DB constraint | Update code ke code coupon lain | Unique constraint; response aktual perlu diverifikasi |
| P1 | PUT | `/coupons/:id` | Not found | Coupon tidak ada | Pesan `Coupon Not Found`, controller kemungkinan `500` |

| P0 | DELETE | `/coupons/:id` | Happy path, DB | Hapus coupon tanpa booking terkait | `200 Data success deleted` |
| P0 | DELETE | `/coupons/:id` | Authentication, Authorization | Tanpa token atau bukan ADMIN | `401` atau `403` |
| P0 | DELETE | `/coupons/:id` | Validation | ID invalid | Validation error |
| P1 | DELETE | `/coupons/:id` | Relationship, DB constraint | Coupon masih direferensikan booking | Delete constraint behavior `Needs Verification` |

## Bookings

| Priority | Method | Endpoint | Category | Test Case | Expected Result |
|---|---|---|---|---|---|
| P0 | POST | `/bookings` | Happy path, Relationship, DB | CUSTOMER dengan dokumen `APPROVED`, vehicle `AVAILABLE`, periode valid | `201 Booking Berhasil Dibuat`; booking `PENDING`; terhubung ke user dan vehicle |
| P0 | POST | `/bookings` | Authentication, Authorization | Tanpa token atau ADMIN mencoba booking | `401` atau `403` |
| P0 | POST | `/bookings` | Validation | `car_id` invalid, tanggal invalid, `return_at <= pickup_at` | `400 Validation error` |
| P0 | POST | `/bookings` | Business logic | User belum memiliki dokumen approved | Request ditolak; status aktual kemungkinan `500` karena service melempar `Error` |
| P0 | POST | `/bookings` | Business logic | Vehicle tidak ada atau status bukan `AVAILABLE` | Request ditolak; status aktual `Needs Verification` |
| P0 | POST | `/bookings` | Boundary | Rental kurang dari satu hari, periode tepat melewati batas hari, return tepat setelah pickup | `total_days`, subtotal, tax 11%, grand total diverifikasi dari calculator aktual |
| P0 | POST | `/bookings` | Overlap | Booking `PENDING` atau `CONFIRMED` overlap pada vehicle yang sama | Ditolak; booking baru tidak dibuat |
| P0 | POST | `/bookings` | Coupon business logic | Coupon invalid, inactive, expired, atau usage limit tercapai | Ditolak; `usedCount` tidak bertambah |
| P0 | POST | `/bookings` | Coupon calculation | Coupon PERCENTAGE terkena `maximumDiscount` dan FIXED melebihi subtotal | Discount di-cap sesuai service; grand total diverifikasi |
| P0 | POST | `/bookings` | Transaction, Side effect | Booking dengan coupon berhasil | `usedCount` naik satu dan booking menyimpan `coupon_id`; perubahan atomik |
| P1 | POST | `/bookings` | Concurrency | Dua booking overlap dibuat hampir bersamaan | Tidak ada booking overlap yang lolos secara tidak konsisten; behavior aktual perlu diverifikasi |

| P0 | GET | `/bookings` | Authentication, Relationship | CUSTOMER mengambil daftar booking | `200 { booking }`; hanya booking milik user login |
| P0 | GET | `/bookings` | Authorization | ADMIN atau user lain mencoba endpoint | Ditolak karena route hanya mengizinkan CUSTOMER |
| P1 | GET | `/bookings` | Empty state | User belum memiliki booking | `200` dengan array kosong atau response aktual |

| P0 | GET | `/bookings/:id` | Happy path, Ownership | Customer mengambil booking miliknya | `200 { booking }` |
| P0 | GET | `/bookings/:id` | Not found | Booking ID tidak ada | `404 Booking not found` |
| P0 | GET | `/bookings/:id` | Authorization, Ownership | Customer mengambil booking user lain | `403 You are not allowed to access this booking` |
| P0 | GET | `/bookings/:id` | Validation | ID bukan UUID | `400 Validation error` |

| P0 | PATCH | `/bookings/:id/cancel` | Happy path, DB | Owner membatalkan booking `PENDING` | `200 Booking berhasil dibatalkan`; status menjadi `CANCELLED` |
| P0 | PATCH | `/bookings/:id/cancel` | Business logic | Cancel booking `CONFIRMED`, `COMPLETED`, atau status selain `PENDING` | Ditolak dengan `BadRequestError` |
| P0 | PATCH | `/bookings/:id/cancel` | Ownership | User lain mencoba cancel | `403` |
| P0 | PATCH | `/bookings/:id/cancel` | Not found, Validation | ID tidak ada atau invalid | `404` untuk tidak ada; `400` untuk format invalid |
| P1 | PATCH | `/bookings/:id/cancel` | Side effect | Setelah cancel cek status vehicle/payment | Source tidak mengubah vehicle atau refund payment; behavior ini perlu diverifikasi |

Tidak ada endpoint booking `PUT`, `PATCH` update umum, atau `DELETE` yang aktif. Route tersebut dikomentari dan tidak termasuk test aktif.

## Documents

| Priority | Method | Endpoint | Category | Test Case | Expected Result |
|---|---|---|---|---|---|
| P0 | GET | `/documents/me` | Happy path, Response | CUSTOMER dengan dokumen mengambil dokumen sendiri | `200`; hanya `id` dan `status` |
| P0 | GET | `/documents/me` | Not found | CUSTOMER belum memiliki dokumen | `404 Document tidak ditemukan` |
| P0 | GET | `/documents/me` | Authentication, Authorization | Tanpa token atau ADMIN mengakses endpoint CUSTOMER-only | `401` atau `403` |

| P0 | POST | `/documents/me` | Happy path, Upload, DB | CUSTOMER mengirim KTP dan SIM image valid | `201 Dokumen berhasil diupload`; row dibuat/upsert; status `PENDING`; dua asset private di-upload |
| P0 | POST | `/documents/me` | Validation, Upload | KTP atau SIM hilang | `400 KTP dan SIM wajib diupload` |
| P0 | POST | `/documents/me` | Upload boundary | File > 5 MB atau bukan JPEG/PNG/WEBP | `400`; dokumen tidak tersimpan |
| P0 | POST | `/documents/me` | Relationship, Unique | User submit ulang dokumen | Row user yang sama di-upsert, bukan row kedua; status kembali `PENDING` |
| P1 | POST | `/documents/me` | Side effect | Submit ulang dengan asset lama | Source tidak terlihat menghapus asset lama; orphan Cloudinary asset perlu diverifikasi |
| P0 | POST | `/documents/me` | Authorization | ADMIN/SUPERADMIN mengirim dokumen melalui endpoint ini | `403` |

| P0 | DELETE | `/documents/me` | Happy path, DB, Side effect | User menghapus dokumennya | `200 Documents deleted successfully`; row dan asset private dihapus |
| P0 | DELETE | `/documents/me` | Not found | User tidak memiliki dokumen | `404 Documents not found` |
| P0 | DELETE | `/documents/me` | Authorization | CUSTOMER, ADMIN, SUPERADMIN dengan token valid | Role tersebut diizinkan; admin menghapus dokumen milik `req.user.id` sendiri |
| P1 | DELETE | `/documents/me` | Edge case | ADMIN mencoba menghapus dokumen customer lain | Tidak dapat menentukan target lain dari endpoint ini; behavior perlu diverifikasi |

| P0 | GET | `/documents` | Happy path, Authorization | ADMIN/SUPERADMIN mengambil semua dokumen | `200`; data terurut `updatedAt DESC` |
| P0 | GET | `/documents` | Security, Response | Verifikasi response tidak mengandung URL private KTP/SIM | Metadata saja: ID, user ID, status, timestamps |
| P0 | GET | `/documents` | Authorization | CUSTOMER atau tanpa token | `401` atau `403` |

| P0 | PATCH | `/documents/:id/status` | Happy path, DB | ADMIN/SUPERADMIN mengubah status menjadi `APPROVED` atau `REJECTED` | `200 Document status updated successfully`; status DB berubah |
| P0 | PATCH | `/documents/:id/status` | Validation | Status `PENDING` atau nilai lain | Validation error |
| P0 | PATCH | `/documents/:id/status` | Not found | Document ID tidak ada | `404 Documents not found` |
| P0 | PATCH | `/documents/:id/status` | Authentication, Authorization | Tanpa token atau CUSTOMER | `401` atau `403` |

| P0 | GET | `/documents/:id` | Happy path, Security | ADMIN/SUPERADMIN mengambil detail dokumen | `200`; ID, user ID, status, signed KTP/SIM URL |
| P0 | GET | `/documents/:id` | Not found | Dokumen tidak ada | `404 Document tidak ditemukan` |
| P0 | GET | `/documents/:id` | Validation | ID invalid | Validation error |
| P0 | GET | `/documents/:id` | Authorization | CUSTOMER mencoba mengakses | `403` |

| P0 | PATCH | `/documents/:id/reject` | Happy path, DB | ADMIN/SUPERADMIN menolak dokumen | `200 Dokumen berhasil ditolak`; status `REJECTED` |
| P0 | PATCH | `/documents/:id/reject` | Not found | Dokumen tidak ada | `404 Document tidak ditemukan` |
| P0 | PATCH | `/documents/:id/reject` | Authorization, Validation | CUSTOMER/tanpa token atau ID invalid | `401`/`403` atau validation error |

## Payments

| Priority | Method | Endpoint | Category | Test Case | Expected Result |
|---|---|---|---|---|---|
| P0 | POST | `/payments` | Happy path, Relationship, External side effect | CUSTOMER membayar booking `PENDING` miliknya dengan total positif | `201 Payment created successfully`; payment `PENDING`; terhubung one-to-one ke booking; Midtrans dipanggil |
| P0 | POST | `/payments` | Authentication, Authorization | Tanpa token atau ADMIN mencoba membuat payment | `401` atau `403` |
| P0 | POST | `/payments` | Validation | `booking_id` bukan UUID | `400 Validation error` |
| P0 | POST | `/payments` | Not found | Booking tidak ada | `404 Booking Not Found` |
| P0 | POST | `/payments` | Ownership | Customer membayar booking milik customer lain | `403 You are not allowed to pay this booking` |
| P0 | POST | `/payments` | Business logic | Booking bukan `PENDING` | `403 Booking cannot be paid` |
| P0 | POST | `/payments` | Idempotency, DB | Payment `PENDING` sudah memiliki Snap token | Mengembalikan payment/token existing; tidak membuat payment kedua |
| P0 | POST | `/payments` | Duplicate/business constraint | Booking sudah `PAID` | `409 Booking has already been paid` |
| P1 | POST | `/payments` | Concurrency | Dua request payment untuk booking sama | Satu memperoleh lock; request lain dapat `409 Payment creation is already in progress` |
| P1 | POST | `/payments` | External failure | Midtrans gagal atau total payment tidak positif | DB payment tidak tercipta; lock dilepas; error aktual `Needs Verification` |

| P0 | GET | `/payments` | Happy path, Authorization | ADMIN mengambil semua payment | `200 { payments }`; data newest first dan menyertakan booking |
| P0 | GET | `/payments` | Authorization | CUSTOMER, SUPERADMIN, atau tanpa token | CUSTOMER ditolak; SUPERADMIN juga tidak termasuk role route dan perlu diverifikasi |
| P1 | GET | `/payments` | Empty state | Tidak ada payment | `200` dengan array kosong atau response aktual |

| P0 | GET | `/payments/:id` | Happy path, Ownership | Customer mengambil payment booking miliknya | `200 { payment }` |
| P0 | GET | `/payments/:id` | Authorization | Customer mengambil payment customer lain | `403 Anda tidak memiliki akses ke payment ini` |
| P0 | GET | `/payments/:id` | Role access | ADMIN/SUPERADMIN mengambil payment | Diizinkan oleh route dan service |
| P0 | GET | `/payments/:id` | Not found, Validation | ID tidak ada atau bukan UUID | `404 Payment Not Found` atau validation error |

| P0 | GET | `/payments/booking/:bookingId` | Happy path, Ownership | User mengambil payment berdasarkan booking miliknya | `200 { payment }` |
| P0 | GET | `/payments/booking/:bookingId` | Authorization | Customer memakai booking milik user lain | `403 Anda tidak memiliki akses ke payment ini` |
| P0 | GET | `/payments/booking/:bookingId` | Not found | Tidak ada payment untuk booking tersebut | `404 Payment Not Found` |
| P1 | GET | `/payments/booking/:bookingId` | Validation | `bookingId` bukan UUID | Schema tersedia tetapi tidak diparse controller; status aktual `Needs Verification` |

| P0 | POST | `/payments/midtrans/notification` | Happy path, DB, Relationship | Notification `settlement` dengan signature dan nominal valid | `200 Payment successful`; payment menjadi `PAID`; booking menjadi `CONFIRMED` |
| P0 | POST | `/payments/midtrans/notification` | Happy path | `capture` dengan `fraud_status=accept` | Payment `PAID`; booking `CONFIRMED` |
| P0 | POST | `/payments/midtrans/notification` | Business logic | `pending` dengan transaction ID dan payment type | Payment tetap `PENDING`; transaction data tersimpan |
| P0 | POST | `/payments/midtrans/notification` | Business logic | `expire` | Payment `EXPIRED`; booking `PENDING` menjadi `CANCELLED` |
| P0 | POST | `/payments/midtrans/notification` | Business logic | `deny` atau `cancel` | Payment `FAILED`; booking `PENDING` menjadi `CANCELLED` |
| P0 | POST | `/payments/midtrans/notification` | Security, Validation | Field wajib hilang atau signature invalid | Request ditolak; tidak ada perubahan DB |
| P0 | POST | `/payments/midtrans/notification` | Integrity | `gross_amount` berbeda dari amount DB | Request ditolak dengan payment amount mismatch; status tidak berubah |
| P0 | POST | `/payments/midtrans/notification` | Not found | `order_id` tidak ditemukan | `404 Payment Not Found` |
| P0 | POST | `/payments/midtrans/notification` | Idempotency, Transaction | Notification terminal dikirim ulang | Tidak ada perubahan kedua; response menyatakan payment sudah finalized |

## Rekapitulasi Jumlah Test

Jumlah berikut adalah jumlah test individual yang direkomendasikan. Variasi seperti role, payload, dan state dihitung sebagai test terpisah bila menghasilkan assertion berbeda.

| Module | Endpoint | Recommended Tests |
|---|---|---:|
| Authentication | `POST /auth/sign-up` | 5 |
| Authentication | `POST /auth/login` | 5 |
| Authentication | `POST /auth/refresh` | 5 |
| Authentication | `DELETE /auth/logout` | 3 |
| Authentication | `POST /auth/create-admin` | 4 |
| Brands | `POST /brands` | 5 |
| Brands | `GET /brands` | 3 |
| Brands | `GET /brands/:id` | 3 |
| Brands | `PUT /brands/:id` | 5 |
| Brands | `DELETE /brands/:id` | 4 |
| Vehicle Categories | `POST /vehicle-cat` | 5 |
| Vehicle Categories | `GET /vehicle-cat` | 2 |
| Vehicle Categories | `GET /vehicle-cat/:id` | 3 |
| Vehicle Categories | `PUT /vehicle-cat/:id` | 4 |
| Vehicle Categories | `DELETE /vehicle-cat/:id` | 4 |
| Vehicles | `POST /vehicles` | 6 |
| Vehicles | `GET /vehicles` | 3 |
| Vehicles | `GET /vehicles/:id` | 4 |
| Vehicles | `PUT /vehicles/:id` | 5 |
| Vehicles | `DELETE /vehicles/:id` | 4 |
| Vehicle Images | `POST /vehicle-images` | 5 |
| Vehicle Images | `GET /vehicle-images` | 2 |
| Vehicle Images | `GET /vehicle-images/:id` | 3 |
| Vehicle Images | `PUT /vehicle-images/:id` | 4 |
| Vehicle Images | `DELETE /vehicle-images/:id` | 4 |
| Coupons | `POST /coupons` | 5 |
| Coupons | `GET /coupons` | 2 |
| Coupons | `GET /coupons/:id` | 3 |
| Coupons | `PUT /coupons/:id` | 4 |
| Coupons | `DELETE /coupons/:id` | 4 |
| Bookings | `POST /bookings` | 11 |
| Bookings | `GET /bookings` | 3 |
| Bookings | `GET /bookings/:id` | 4 |
| Bookings | `PATCH /bookings/:id/cancel` | 5 |
| Documents | `GET /documents/me` | 3 |
| Documents | `POST /documents/me` | 6 |
| Documents | `DELETE /documents/me` | 4 |
| Documents | `GET /documents` | 3 |
| Documents | `PATCH /documents/:id/status` | 4 |
| Documents | `GET /documents/:id` | 4 |
| Documents | `PATCH /documents/:id/reject` | 3 |
| Payments | `POST /payments` | 10 |
| Payments | `GET /payments` | 3 |
| Payments | `GET /payments/:id` | 4 |
| Payments | `GET /payments/booking/:bookingId` | 4 |
| Payments | `POST /payments/midtrans/notification` | 9 |
| **Total** | **46 endpoint aktif** | **190 test** |

## Catatan Integration Test

- Gunakan database PostgreSQL test terisolasi dan reset data antar test/suite.
- Assertion harus memeriksa response HTTP sekaligus state Prisma setelah request.
- Cloudinary, Midtrans, Upstash Redis, dan Redis lock membutuhkan environment test atau test double. Cara implementasinya perlu ditentukan sebelum test berjalan.
- Jangan memasukkan endpoint rental karena tidak ada route aktif.
- Jangan memasukkan booking update/delete umum karena route-nya dikomentari.
- Perilaku `500` pada beberapa controller lama, response `200` dengan `null`, dan validasi `bookingId` payment yang tidak diparse perlu dikonfirmasi melalui runtime integration test.