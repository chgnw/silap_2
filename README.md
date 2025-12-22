# SILAP - Satu Aplikasi Untuk Semua

SILAP adalah aplikasi manajemen sampah berbasis web yang dirancang untuk membantu individu dan perusahaan dalam mengelola sampah secara efisien dan bertanggung jawab. Dengan SILAP, pengguna dapat dengan mudah mengatur pengambilan sampah, mendonasikan barang layak pakai, dan berpartisipasi dalam program daur ulang.

## Deskripsi Proyek

SILAP (Satu Aplikasi Untuk Semua) adalah sebuah platform digital yang bertujuan untuk merevolusi cara kita mengelola sampah. Aplikasi ini menyediakan berbagai layanan yang memudahkan pengguna, baik individu maupun korporasi, untuk berkontribusi dalam menjaga kebersihan lingkungan. Dengan antarmuka yang ramah pengguna, SILAP menawarkan solusi lengkap mulai dari penjemputan sampah, donasi, hingga program daur ulang.

## Fitur Utama

* **Pick Up**: Pengguna dapat meminta penjemputan sampah langsung dari lokasi mereka.
* **Drop Off**: Memungkinkan pengguna untuk mengantarkan sampah ke pusat daur ulang terdekat.
* **Streak**: Memberikan poin dan reward bagi pengguna yang rutin mengelola sampah.
* **Sedekah**: Memfasilitasi donasi makanan dan barang layak pakai kepada yang membutuhkan.
* **Layanan Korporat**: Solusi manajemen sampah untuk bisnis, event, dan brand.

## Teknologi yang Digunakan

* **Next.js**: Framework React untuk membangun aplikasi web modern.
* **React-Bootstrap**: Komponen UI untuk antarmuka yang responsif.
* **MySQL**: Database untuk menyimpan data pengguna dan transaksi.
* **Next-Auth**: Untuk fungsionalitas autentikasi.

## Instalasi dan Setup

Untuk menjalankan proyek ini di lingkungan lokal, ikuti langkah-langkah berikut:

1.  **Clone repositori ini:**

    ```bash
    git clone https://github.com/chgnw/silap_2.git
    ```

2.  **Masuk ke direktori proyek:**

    ```bash
    cd silap_2
    ```

3.  **Install semua *dependency* yang dibutuhkan:**

    ```bash
    npm install
    ```

4.  **Konfigurasi *environment variables*. Buat *file* `.env.local` dan isi dengan konfigurasi database dan credential lainnya:**

    Linux/MacOS
    ```bash
    openssl rand -base64 32
    ```

    Windows
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    ```

    .env
    ```bash
    # Database config
    MYSQL_HOST=
    MYSQL_PORT=
    MYSQL_USER=
    MYSQL_PASSWORD=
    MYSQL_DATABASE= 
    
    # JWT
    JWT_SECRET=
    
    # NextAuth secret
    NEXTAUTH_SECRET=
    NEXTAUTH_URL=
    
    # Google OAuth (for NextAuth)
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    
    # REDIS
    REDIS_HOST=
    REDIS_PORT=
    REDIS_USERNAME=
    REDIS_PASSWORD=
    
    # Mailer (nodemailer)
    SMTP_USER=
    SMTP_PASSWORD=
    
    # Cron Job Secret (for cron-job.org authentication)
    CRON_SECRET=
    
    # Environment
    NODE_ENV=
    APP_VERSION=
    ```

6.  **Jalankan migrations database:**

    ```sql
    -- Pastikan Anda sudah memiliki database
    -- Gunakan file '001_create_user_table.sql' untuk membuat tabel
    ```

7.  **Jalankan aplikasi:**

    ```bash
    npm run dev
    ```

    Buka [http://localhost:3001](http://localhost:3001) di browser Anda untuk melihat hasilnya.
