# 🏗️ Analisis Arsitektur Project SILAP

## 📁 Bedah Folder: Fungsi Tiap Folder Utama

### 🎨 `public/` - Teras Rumah & Gudang Barang
**Fungsi:** Tempat semua aset statis yang bisa diakses langsung oleh browser tanpa perlu diproses server dulu.

**Analogi:** Ini kayak teras rumah atau gudang barang. Semua orang bisa langsung lihat dan ambil barangnya tanpa perlu masuk ke dalam rumah. Logo, gambar, icon, semua file yang "diam" ada di sini.

**Kenapa ditaruh di sini?** Next.js secara otomatis serve folder ini sebagai static files. Jadi kalau ada request ke `/assets/logo-silap.png`, langsung diambil dari sini tanpa perlu routing atau processing. Efisien banget!

**Isi folder:**
- `assets/` - Logo, gambar produk, icon-icon
- `images/` - Gambar untuk landing page, ilustrasi
- `icons/` - Icon khusus seperti Google icon
- `upload/` - File yang di-upload user (profile picture, payment proof, dll)

---

### 🔌 `src/app/api/` - Kantor Kurir & Resepsionis
**Fungsi:** Semua endpoint API yang handle request dari client. Ini tempat semua "kerjaan berat" terjadi.

**Analogi:** Ini kayak kantor kurir atau resepsionis hotel. Setiap ada request masuk (misal: "Saya mau register", "Saya mau lihat data pickup"), mereka yang handle. Mereka yang ngomong sama database, validasi data, kirim email, dll.

**Kenapa ditaruh di sini?** Next.js App Router punya konvensi khusus: folder `api/` dengan file `route.ts` otomatis jadi API endpoint. Jadi `/api/auth/register/route.ts` langsung jadi endpoint `POST /api/auth/register`. Gak perlu setup Express atau Fastify terpisah!

**Struktur:**
- `auth/` - Login, register, reset password
- `admin/` - Semua operasi admin (CRUD waste category, vehicle, subscription, dll)
- `dashboard/` - Operasi untuk user yang sudah login (pickup events, order history, dll)
- `driver/` - Operasi khusus driver (accept pickup, update status, dll)
- `public/` - Endpoint yang bisa diakses tanpa login (FAQ, subscription plans, dll)
- `location/` - Data lokasi (provinsi, kabupaten, kecamatan, dll)
- `otp/` - Kirim & verifikasi OTP
- `upload/` - Handle file upload
- `cron/` - Job yang jalan otomatis (misal: reminder renewal)

---

### 🎭 `src/app/components/` - Toko Komponen Lego
**Fungsi:** Semua komponen UI yang bisa dipake berulang-ulang di berbagai halaman.

**Analogi:** Ini kayak toko komponen Lego. Ada berbagai macam "brick" yang bisa digabung-gabung jadi halaman. Ada yang besar (Large), ada yang sedang (Medium), ada yang kecil (Icons).

**Kenapa ditaruh di sini?** Separation of concerns. Komponen UI dipisah dari logic routing dan API. Jadi kalau mau ubah tampilan button, cuma edit di sini, semua halaman yang pake button itu otomatis ikut berubah.

**Struktur:**
- `Large/` - Komponen besar seperti Sidebar, Navbar, Footer, Modal
- `Medium/` - Komponen sedang seperti Card, ServiceCard
- `Sections/` - Komponen untuk section landing page (Hero, Services, dll)
- `Icons/` - Komponen icon khusus

---

### 🛠️ `src/lib/` - Kotak Perkakas
**Fungsi:** Utility functions dan helper yang dipake di berbagai tempat.

**Analogi:** Ini kayak kotak perkakas. Ada berbagai macam "alat" yang bisa dipake kapan aja. Database connection, JWT helper, OTP generator, email sender, semua ada di sini.

**Kenapa ditaruh di sini?** DRY principle (Don't Repeat Yourself). Daripada tulis kode database connection di setiap file API route, lebih baik buat sekali di sini, terus di-import aja. Maintenance lebih mudah!

**Isi:**
- `db.ts` - Connection pool ke MySQL database
- `jwt.ts` - Helper untuk generate & verify JWT token
- `otp.ts` - Generate & verify OTP
- `email.ts` - Kirim email via Nodemailer
- `redis.ts` - Connection ke Redis (untuk cache atau session)
- `transactionCode.ts` - Generate kode transaksi unik

---

### 🗄️ `src/migrations/` - Buku Catatan Database
**Fungsi:** Script SQL untuk setup dan update struktur database.

**Analogi:** Ini kayak buku catatan perubahan rumah. Setiap kali ada perubahan struktur database (tambah tabel, ubah kolom), dicatat di sini. Jadi kalau ada developer baru atau deploy ke server baru, tinggal jalanin script ini.

**Kenapa ditaruh di sini?** Version control untuk database. Kita bisa track perubahan database dari waktu ke waktu. Plus, kalau deploy ke production, tinggal jalanin migration script, database langsung sesuai dengan yang diharapkan.

---

### 🧪 `tests/` - Lab Pengujian
**Fungsi:** Semua test case untuk memastikan aplikasi jalan dengan benar.

**Analogi:** Ini kayak lab pengujian. Sebelum produk keluar ke pasar, harus diuji dulu. Unit test = uji komponen kecil. Integration test = uji alur lengkap.

**Kenapa ditaruh di sini?** Best practice untuk maintainability. Kalau ada perubahan kode, jalanin test dulu. Kalau test gagal, berarti ada yang rusak. Jadi kita bisa catch bug sebelum sampai ke production.

**Struktur:**
- `unit/` - Test untuk fungsi-fungsi kecil (lib functions)
- `integration/` - Test untuk alur lengkap (register user, get dashboard data, dll)

---

### 📄 `src/app/(main)/` - Ruang Tamu Publik
**Fungsi:** Halaman-halaman yang bisa diakses semua orang tanpa login (landing page, about, pricing, services).

**Analogi:** Ini kayak ruang tamu rumah. Semua orang bisa masuk, lihat-lihat, tanpa perlu identitas khusus.

**Kenapa pakai kurung `(main)`?** Ini namanya **Route Groups** di Next.js. Folder dengan kurung gak nambahin segment ke URL. Jadi `(main)/page.tsx` tetap jadi `/`, bukan `/(main)/`. Tapi bisa punya layout khusus untuk grup ini.

**Isi:**
- `page.tsx` - Homepage (landing page)
- `about/` - Halaman tentang
- `pricing/` - Halaman harga/paket
- `services/` - Halaman layanan
- `layout.tsx` - Layout khusus untuk halaman publik (mungkin ada header/footer khusus)

---

### 🔐 `src/app/(auth)/` - Ruang Khusus Tamu
**Fungsi:** Halaman login dan register.

**Analogi:** Ini kayak ruang khusus untuk tamu yang mau masuk ke dalam rumah. Ada form login/register, mungkin ada background khusus.

**Kenapa pakai kurung `(auth)`?** Sama seperti `(main)`, ini route group. Bisa punya layout khusus (misal: background berbeda, header berbeda) tanpa nambahin `/auth/` ke URL. Jadi URL tetap `/login` dan `/register`, bukan `/auth/login`.

**Isi:**
- `login/` - Halaman login
- `register/` - Halaman register
- `layout.tsx` - Layout khusus auth (background, header khusus)

---

### 📊 `src/app/(dashboard)/` - Ruang Privat User
**Fungsi:** Halaman-halaman yang cuma bisa diakses setelah login. Ini dashboard untuk user biasa.

**Analogi:** Ini kayak ruang privat di rumah. Cuma yang punya kunci (sudah login) yang bisa masuk. Ada sidebar, ada konten utama.

**Kenapa pakai kurung `(dashboard)`?** Route group lagi. Bisa punya layout khusus dengan sidebar, header, dll. Plus, bisa implementasi protection di level layout (cek session, redirect kalau belum login).

**Isi:**
- `dashboard/` - Berbagai halaman dashboard (pickup, order history, profile, dll)
- `layout.tsx` - Layout dengan sidebar, header, breadcrumb, dll

---

### 👨‍💼 `src/app/(admin)/` - Ruang VIP Admin
**Fungsi:** Halaman khusus untuk admin. CRUD semua master data.

**Analogi:** Ini kayak ruang VIP atau ruang kontrol. Cuma admin yang bisa masuk. Bisa manage semua data: waste category, vehicle, driver, subscription, dll.

**Kenapa dipisah dari dashboard?** Role-based access. Admin punya fitur dan layout yang berbeda dengan user biasa. Lebih aman kalau dipisah, plus lebih mudah maintain.

---

### 🚗 `src/app/(driver)/` - Ruang Khusus Driver
**Fungsi:** Halaman khusus untuk driver. Manage pickup events, update status, dll.

**Analogi:** Ini kayak ruang khusus untuk driver. Mereka punya workflow berbeda: lihat pickup events, accept, update status (on the way, arrived, completed).

**Kenapa dipisah?** Sama seperti admin, driver punya role dan workflow berbeda. Lebih baik dipisah untuk clarity dan security.

---

### ⚙️ `src/app/hooks/` - Custom Hooks
**Fungsi:** Custom React hooks yang bisa dipake di berbagai komponen.

**Analogi:** Ini kayak fungsi khusus yang bisa dipanggil berkali-kali. Misal: hook untuk ambil data lokasi, hook untuk handle form, dll.

**Kenapa ditaruh di sini?** Reusability. Daripada tulis logic yang sama di berbagai komponen, lebih baik buat hook sekali, terus dipake di mana-mana.

---

## 🏛️ Analisis Arsitektur: Pola Apa yang Dipake?

### **Next.js App Router dengan File-Based Routing**

Project ini menggunakan **Next.js 16 dengan App Router pattern**. Ini bukan MVC klasik, bukan Clean Architecture murni, tapi kombinasi beberapa pattern yang cocok untuk Next.js.

**Kenapa saya simpulkan gini?**

1. **File-Based Routing:** Setiap folder di `src/app/` otomatis jadi route. `page.tsx` = halaman, `route.ts` = API endpoint, `layout.tsx` = wrapper. Ini pattern khas Next.js App Router.

2. **Route Groups:** Penggunaan folder dengan kurung `(main)`, `(auth)`, `(dashboard)` menunjukkan pemahaman advanced routing di Next.js. Ini cara ngorganisir route tanpa nambahin segment ke URL.

3. **Separation of Concerns:**
   - `api/` = Backend logic (server-side)
   - `components/` = UI components (client-side)
   - `lib/` = Utilities & helpers
   - Route folders = Pages & layouts

4. **Server & Client Components:** Ada file yang pakai `"use client"` (client component) dan ada yang gak (server component). Ini pattern Next.js 13+ untuk optimize performance.

5. **API Routes Pattern:** Setiap endpoint punya file `route.ts` sendiri dengan HTTP methods (GET, POST, dll). Ini RESTful pattern tapi dalam konteks Next.js.

**Jadi, pola arsitekturnya adalah:**
- **Next.js App Router Architecture** (file-based routing)
- **Layered Architecture** (separation antara API, components, lib)
- **Role-Based Route Organization** (admin, driver, dashboard, main)
- **RESTful API Pattern** (untuk backend endpoints)

Ini bukan monolith tradisional karena ada separation yang jelas antara frontend (components) dan backend (API routes), tapi juga bukan microservices karena semua masih dalam satu codebase.

---

## 🔄 Data Flow: Gimana Alur Datanya?

Mari kita trace alur data dari user klik tombol sampai data muncul di layar. Contoh kasus: **User mau register akun baru**.

### **Step 1: User Klik Tombol Register** 🖱️
- User ada di halaman `/register` (file: `src/app/(auth)/register/page.tsx`)
- Ini adalah **Client Component** (karena ada form interaksi)
- Form punya input: nama, email, password, dll

### **Step 2: User Submit Form** 📤
- User isi form, klik submit
- JavaScript di client-side handle submit event
- Data dikirim via `fetch()` atau form action ke endpoint API

### **Step 3: Request Masuk ke API Route** 🚪
- Request masuk ke `/api/auth/register` (file: `src/app/api/auth/register/route.ts`)
- Next.js otomatis route request ke file ini karena struktur folder
- Function `POST()` di file ini yang handle request

### **Step 4: Validasi & Processing** ✅
- API route validasi data (cek email sudah ada belum, format benar gak, dll)
- Hash password pakai `bcryptjs` (import dari `src/lib/` atau langsung)
- Query ke database pakai helper dari `src/lib/db.ts`
- Insert data ke tabel `ms_user` dan `ms_driver`

### **Step 5: Database Response** 💾
- Database (MySQL) return hasil query
- Kalau sukses, return `{ ok: true }` dengan status 201
- Kalau error, return error message dengan status yang sesuai

### **Step 6: Response Balik ke Client** 📥
- API route return `NextResponse.json()`
- Response dikirim balik ke browser
- Client-side JavaScript terima response

### **Step 7: Update UI** 🎨
- Kalau sukses: redirect ke login atau tampilkan success message
- Kalau error: tampilkan error message di form
- Bisa pakai toast notification (react-hot-toast) atau state update

### **Visual Flow:**

```
User Browser (Client)
    ↓ [Submit Form]
    ↓ [HTTP POST Request]
    
src/app/api/auth/register/route.ts (API Route)
    ↓ [Validasi Data]
    ↓ [Hash Password]
    ↓ [Query Database]
    
src/lib/db.ts (Database Helper)
    ↓ [MySQL Connection Pool]
    ↓ [Execute Query]
    
MySQL Database
    ↓ [Insert Data]
    ↓ [Return Result]
    
src/lib/db.ts
    ↓ [Return Data]
    
src/app/api/auth/register/route.ts
    ↓ [Format Response]
    ↓ [Return JSON]
    
User Browser (Client)
    ↓ [Receive Response]
    ↓ [Update UI / Redirect]
```

### **Contoh Lain: User Akses Dashboard**

1. **User buka `/dashboard`**
   - File: `src/app/(dashboard)/dashboard/page.tsx`
   - Layout: `src/app/(dashboard)/layout.tsx` cek session dulu

2. **Layout Cek Authentication**
   - Pakai `useSession()` dari NextAuth
   - Kalau belum login → redirect ke `/login`
   - Kalau sudah login → lanjut

3. **Page Fetch Data**
   - Page component fetch data dari `/api/dashboard/getUserData`
   - Atau bisa langsung query database kalau pakai Server Component

4. **API Route Query Database**
   - File: `src/app/api/dashboard/getUserData/route.ts`
   - Query database pakai `src/lib/db.ts`
   - Return data user, subscription, dll

5. **Data Ditampilkan**
   - Component render data yang sudah di-fetch
   - Bisa pakai loading state, error handling, dll

---

## 🎯 Kesimpulan

Project ini menggunakan **Next.js App Router** dengan struktur yang cukup terorganisir:
- **Frontend:** React components dengan file-based routing
- **Backend:** API routes dalam folder `api/`
- **Database:** MySQL dengan connection pooling
- **Authentication:** NextAuth untuk session management
- **Utilities:** Helper functions di folder `lib/`

Pola ini cocok untuk aplikasi full-stack yang butuh:
- SEO-friendly (Server Components)
- Fast development (file-based routing)
- Type safety (TypeScript)
- Scalability (separation of concerns)

Yang menarik dari struktur ini:
- ✅ Clear separation antara public, auth, dashboard, admin, driver
- ✅ Reusable components dan utilities
- ✅ Test coverage untuk maintainability
- ✅ Migration scripts untuk database versioning

---

*Dibuat dengan ❤️ oleh Senior Technical Architect yang suka jelasin hal rumit dengan cara sederhana*

