import nodemailer from "nodemailer";

// Reusable transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

interface RenewalReminderData {
    customerName: string;
    customerEmail: string;
    planName: string;
    planPrice: number;
    expiryDate: string;
    renewUrl?: string;
}

interface SubscriptionActivatedData {
    customerName: string;
    customerEmail: string;
    planName: string;
    planPrice: number;
    startDate: string;
    endDate: string;
    dashboardUrl?: string;
}

/**
 * Send subscription renewal reminder email
 * Called by cron job 1 day before subscription expires
 */
export async function sendRenewalReminderEmail(data: RenewalReminderData): Promise<boolean> {
    const {
        customerName,
        customerEmail,
        planName,
        planPrice,
        expiryDate,
        renewUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3001"}/pricing`,
    } = data;

    // Format price to IDR
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(planPrice);

    // Format date
    const formattedDate = new Date(expiryDate).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Perpanjang Langganan SILAP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F5F5;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F5F5F5;">
                <tr>
                    <td style="padding: 40px 20px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(47, 94, 68, 0.12);">
                            
                            <!-- Header with gradient -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #2F5E44 0%, #4B7A59 50%, #A4B465 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: bold; letter-spacing: 2px;">SILAP</h1>
                                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 12px; letter-spacing: 1px;">Satu Aplikasi Untuk Semua</p>
                                </td>
                            </tr>
                            
                            <!-- Reminder Icon -->
                            <tr>
                                <td style="padding: 30px 30px 0 30px; text-align: center;">
                                    <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #E7F0D2 0%, #A4B465 100%); border-radius: 50%; line-height: 80px;">
                                        <span style="font-size: 36px;">⏰</span>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Greeting -->
                            <tr>
                                <td style="padding: 24px 30px 0 30px; text-align: center;">
                                    <h2 style="margin: 0; color: #2F5E44; font-size: 22px; font-weight: 600;">
                                        Halo, ${customerName}!
                                    </h2>
                                    <p style="margin: 12px 0 0 0; color: #666666; font-size: 15px; line-height: 1.6;">
                                        Langganan SILAP kamu akan berakhir <strong style="color: #2F5E44;">besok</strong>. Jangan sampai terlewat ya!
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Subscription Details Card -->
                            <tr>
                                <td style="padding: 24px 30px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: linear-gradient(135deg, #E7F0D2 0%, #F5F5F5 100%); border-radius: 12px; border: 1px solid #A4B465;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                                                    <tr>
                                                        <td style="padding-bottom: 12px; border-bottom: 1px dashed #A4B465;">
                                                            <span style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Paket Langganan</span>
                                                            <p style="margin: 4px 0 0 0; color: #2F5E44; font-size: 18px; font-weight: bold;">${planName}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 12px 0; border-bottom: 1px dashed #A4B465;">
                                                            <span style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Harga</span>
                                                            <p style="margin: 4px 0 0 0; color: #2F5E44; font-size: 18px; font-weight: bold;">${formattedPrice}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding-top: 12px;">
                                                            <span style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Berakhir Pada</span>
                                                            <p style="margin: 4px 0 0 0; color: #ED1C24; font-size: 18px; font-weight: bold;">${formattedDate}</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- CTA Button -->
                            <tr>
                                <td style="padding: 0 30px 30px 30px; text-align: center;">
                                    <a href="${renewUrl}" style="display: inline-block; background: linear-gradient(135deg, #2F5E44 0%, #4B7A59 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; box-shadow: 0 4px 16px rgba(47, 94, 68, 0.3);">
                                        Perpanjang Sekarang →
                                    </a>
                                    <p style="margin: 16px 0 0 0; color: #7f7f7f; font-size: 13px;">
                                        Klik tombol di atas untuk melanjutkan langganan
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Benefits Reminder -->
                            <tr>
                                <td style="padding: 0 30px 24px 30px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F5F5F5; border-radius: 12px;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <p style="margin: 0 0 12px 0; color: #2F5E44; font-size: 14px; font-weight: 600;">Dengan perpanjangan, kamu tetap menikmati:</p>
                                                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                                                    <tr>
                                                        <td style="padding: 6px 0; color: #666666; font-size: 13px;">✓ Penjemputan sampah terjadwal</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 6px 0; color: #666666; font-size: 13px;">✓ Penukaran poin dengan hadiah menarik</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 6px 0; color: #666666; font-size: 13px;">✓ Kontribusi untuk lingkungan yang lebih bersih</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #2F5E44; padding: 24px 30px; text-align: center;">
                                    <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px;">
                                        Terima kasih telah menjadi bagian dari SILAP! 💚
                                    </p>
                                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.6); font-size: 11px;">
                                        Jika ada pertanyaan, hubungi kami di support@silap.id
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                        
                        <!-- Below Footer -->
                        <p style="margin: 20px 0 0 0; text-align: center; color: #7f7f7f; font-size: 11px;">
                            Email ini dikirim oleh sistem SILAP. Mohon tidak membalas email ini.
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    const textContent = `
        Halo, ${customerName}!

        Langganan SILAP kamu akan berakhir besok.

        Detail Langganan:
        - Paket: ${planName}
        - Harga: ${formattedPrice}
        - Berakhir: ${formattedDate}

        Perpanjang sekarang di: ${renewUrl}

        Terima kasih telah menjadi bagian dari SILAP!

        ---
        Email ini dikirim oleh sistem SILAP. Mohon tidak membalas email ini.
    `.trim();

    try {
        await transporter.sendMail({
            from: `"SILAP" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `⏰ Langganan ${planName} kamu berakhir besok!`,
            text: textContent,
            html: htmlTemplate,
        });

        console.log(`✅ Renewal reminder sent to ${customerEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send renewal reminder to ${customerEmail}:`, error);
        return false;
    }
}

/**
 * Send subscription activation confirmation email
 * Called after admin verifies payment and activates subscription
 */
export async function sendSubscriptionActivatedEmail(data: SubscriptionActivatedData): Promise<boolean> {
    const {
        customerName,
        customerEmail,
        planName,
        planPrice,
        startDate,
        endDate,
        dashboardUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3001"}/dashboard`,
    } = data;

    // Format price to IDR
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(planPrice);

    // Format dates
    const formattedStartDate = new Date(startDate).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const formattedEndDate = new Date(endDate).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Langganan SILAP Aktif!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F5F5;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F5F5F5;">
                <tr>
                    <td style="padding: 40px 20px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(47, 94, 68, 0.12);">
                            
                            <!-- Header with gradient -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #2F5E44 0%, #4B7A59 50%, #A4B465 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: bold; letter-spacing: 2px;">SILAP</h1>
                                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 12px; letter-spacing: 1px;">Satu Aplikasi Untuk Semua</p>
                                </td>
                            </tr>
                            
                            <!-- Success Icon -->
                            <tr>
                                <td style="padding: 30px 30px 0 30px; text-align: center;">
                                    <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #E7F0D2 0%, #A4B465 100%); border-radius: 50%; line-height: 80px;">
                                        <span style="font-size: 36px;">✅</span>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Greeting -->
                            <tr>
                                <td style="padding: 24px 30px 0 30px; text-align: center;">
                                    <h2 style="margin: 0; color: #2F5E44; font-size: 22px; font-weight: 600;">
                                        Selamat, ${customerName}!
                                    </h2>
                                    <p style="margin: 12px 0 0 0; color: #666666; font-size: 15px; line-height: 1.6;">
                                        Pembayaran kamu telah <strong style="color: #2F5E44;">diverifikasi</strong> dan langganan kamu sekarang <strong style="color: #2F5E44;">aktif</strong>!
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Subscription Details Card -->
                            <tr>
                                <td style="padding: 24px 30px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: linear-gradient(135deg, #E7F0D2 0%, #F5F5F5 100%); border-radius: 12px; border: 1px solid #A4B465;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                                                    <tr>
                                                        <td style="padding-bottom: 12px; border-bottom: 1px dashed #A4B465;">
                                                            <span style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Paket Langganan</span>
                                                            <p style="margin: 4px 0 0 0; color: #2F5E44; font-size: 18px; font-weight: bold;">${planName}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 12px 0; border-bottom: 1px dashed #A4B465;">
                                                            <span style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Harga</span>
                                                            <p style="margin: 4px 0 0 0; color: #2F5E44; font-size: 18px; font-weight: bold;">${formattedPrice}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 12px 0; border-bottom: 1px dashed #A4B465;">
                                                            <span style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Mulai Berlaku</span>
                                                            <p style="margin: 4px 0 0 0; color: #2F5E44; font-size: 18px; font-weight: bold;">${formattedStartDate}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding-top: 12px;">
                                                            <span style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Berlaku Sampai</span>
                                                            <p style="margin: 4px 0 0 0; color: #2F5E44; font-size: 18px; font-weight: bold;">${formattedEndDate}</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- CTA Button -->
                            <tr>
                                <td style="padding: 0 30px 30px 30px; text-align: center;">
                                    <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #2F5E44 0%, #4B7A59 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; box-shadow: 0 4px 16px rgba(47, 94, 68, 0.3);">
                                        Buka Dashboard →
                                    </a>
                                    <p style="margin: 16px 0 0 0; color: #7f7f7f; font-size: 13px;">
                                        Klik tombol di atas untuk mulai menggunakan layanan
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- What's Next -->
                            <tr>
                                <td style="padding: 0 30px 24px 30px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F5F5F5; border-radius: 12px;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <p style="margin: 0 0 12px 0; color: #2F5E44; font-size: 14px; font-weight: 600;">Sekarang kamu bisa:</p>
                                                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                                                    <tr>
                                                        <td style="padding: 6px 0; color: #666666; font-size: 13px;">✓ Melakukan request penjemputan sampah</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 6px 0; color: #666666; font-size: 13px;">✓ Mengumpulkan poin dari setiap transaksi</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 6px 0; color: #666666; font-size: 13px;">✓ Menukarkan poin dengan hadiah menarik</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #2F5E44; padding: 24px 30px; text-align: center;">
                                    <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px;">
                                        Terima kasih telah menjadi bagian dari SILAP! 💚
                                    </p>
                                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.6); font-size: 11px;">
                                        Jika ada pertanyaan, hubungi kami di support@silap.id
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                        
                        <!-- Below Footer -->
                        <p style="margin: 20px 0 0 0; text-align: center; color: #7f7f7f; font-size: 11px;">
                            Email ini dikirim oleh sistem SILAP. Mohon tidak membalas email ini.
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    const textContent = `
        Selamat, ${customerName}!

        Pembayaran kamu telah diverifikasi dan langganan kamu sekarang aktif!

        Detail Langganan:
        - Paket: ${planName}
        - Harga: ${formattedPrice}
        - Mulai Berlaku: ${formattedStartDate}
        - Berlaku Sampai: ${formattedEndDate}

        Buka dashboard di: ${dashboardUrl}

        Terima kasih telah menjadi bagian dari SILAP!

        ---
        Email ini dikirim oleh sistem SILAP. Mohon tidak membalas email ini.
    `.trim();

    try {
        await transporter.sendMail({
            from: `"SILAP" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `✅ Langganan ${planName} kamu sudah aktif!`,
            text: textContent,
            html: htmlTemplate,
        });

        console.log(`✅ Subscription activation email sent to ${customerEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send subscription activation email to ${customerEmail}:`, error);
        return false;
    }
}

interface PaymentCancelledData {
    customerName: string;
    customerEmail: string;
    planName: string;
    planPrice: number;
    cancelReason: string;
}

/**
 * Send payment cancellation notification email
 * Called after admin cancels a pending payment
 */
export async function sendPaymentCancelledEmail(data: PaymentCancelledData): Promise<boolean> {
    const {
        customerName,
        customerEmail,
        planName,
        planPrice,
        cancelReason,
    } = data;

    // Format price to IDR
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(planPrice);

    const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pembayaran Dibatalkan - SILAP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F5F5;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F5F5F5;">
                <tr>
                    <td style="padding: 40px 20px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(47, 94, 68, 0.12);">
                            
                            <!-- Header with gradient -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #2F5E44 0%, #4B7A59 50%, #A4B465 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: bold; letter-spacing: 2px;">SILAP</h1>
                                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 12px; letter-spacing: 1px;">Satu Aplikasi Untuk Semua</p>
                                </td>
                            </tr>
                            
                            <!-- Cancel Icon -->
                            <tr>
                                <td style="padding: 30px 30px 0 30px; text-align: center;">
                                    <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #FEE2E2 0%, #EF4444 100%); border-radius: 50%; line-height: 80px;">
                                        <span style="font-size: 36px;">❌</span>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Greeting -->
                            <tr>
                                <td style="padding: 24px 30px 0 30px; text-align: center;">
                                    <h2 style="margin: 0; color: #DC2626; font-size: 22px; font-weight: 600;">
                                        Pembayaran Dibatalkan
                                    </h2>
                                    <p style="margin: 12px 0 0 0; color: #666666; font-size: 15px; line-height: 1.6;">
                                        Halo <strong style="color: #2F5E44;">${customerName}</strong>, mohon maaf pembayaran kamu tidak dapat diproses.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Payment Details Card -->
                            <tr>
                                <td style="padding: 24px 30px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: linear-gradient(135deg, #FEE2E2 0%, #F5F5F5 100%); border-radius: 12px; border: 1px solid #FECACA;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                                                    <tr>
                                                        <td style="padding-bottom: 12px; border-bottom: 1px dashed #EF4444;">
                                                            <span style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Paket Langganan</span>
                                                            <p style="margin: 4px 0 0 0; color: #2F5E44; font-size: 18px; font-weight: bold;">${planName}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 12px 0; border-bottom: 1px dashed #EF4444;">
                                                            <span style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Nominal Pembayaran</span>
                                                            <p style="margin: 4px 0 0 0; color: #2F5E44; font-size: 18px; font-weight: bold;">${formattedPrice}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding-top: 12px;">
                                                            <span style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Alasan Pembatalan</span>
                                                            <p style="margin: 4px 0 0 0; color: #DC2626; font-size: 16px; font-weight: 600;">${cancelReason}</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Refund Info -->
                            <tr>
                                <td style="padding: 0 30px 24px 30px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FEF3C7; border-radius: 12px; border: 1px solid #FCD34D;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <p style="margin: 0 0 12px 0; color: #92400E; font-size: 14px; font-weight: 600;">💰 Informasi Pengembalian Dana:</p>
                                                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                                                    <tr>
                                                        <td style="padding: 6px 0; color: #92400E; font-size: 13px;">• Dana akan dikembalikan dalam waktu <strong>2x24 jam</strong> kerja.</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 6px 0; color: #92400E; font-size: 13px;">• Pengembalian akan dilakukan ke rekening/akun yang sama dengan sumber pembayaran.</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 6px 0; color: #92400E; font-size: 13px;">• Jika ada pertanyaan, silakan hubungi tim support kami.</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #2F5E44; padding: 24px 30px; text-align: center;">
                                    <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px;">
                                        Terima kasih atas pengertiannya 💚
                                    </p>
                                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.6); font-size: 11px;">
                                        Jika ada pertanyaan, hubungi kami di support@silap.id
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                        
                        <!-- Below Footer -->
                        <p style="margin: 20px 0 0 0; text-align: center; color: #7f7f7f; font-size: 11px;">
                            Email ini dikirim oleh sistem SILAP. Mohon tidak membalas email ini.
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    const textContent = `
        Pembayaran Dibatalkan

        Halo, ${customerName}!

        Mohon maaf, pembayaran kamu tidak dapat diproses.

        Detail Pembayaran:
        - Paket: ${planName}
        - Nominal: ${formattedPrice}
        - Alasan Pembatalan: ${cancelReason}

        Informasi Pengembalian Dana:
        - Dana akan dikembalikan dalam waktu 2x24 jam kerja.
        - Pengembalian akan dilakukan ke rekening/akun yang sama dengan sumber pembayaran.
        - Jika ada pertanyaan, silakan hubungi tim support kami.

        Terima kasih atas pengertiannya!

        ---
        Email ini dikirim oleh sistem SILAP. Mohon tidak membalas email ini.
    `.trim();

    try {
        await transporter.sendMail({
            from: `"SILAP" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `❌ Pembayaran ${planName} Dibatalkan`,
            text: textContent,
            html: htmlTemplate,
        });

        console.log(`✅ Payment cancellation email sent to ${customerEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send payment cancellation email to ${customerEmail}:`, error);
        return false;
    }
}
