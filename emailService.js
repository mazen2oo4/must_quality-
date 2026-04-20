const nodemailer = require("nodemailer");

/** Cached Ethereal SMTP (dev only) — real send with web preview, no .env needed */
let etherealTransportPromise = null;

function getEtherealTransport() {
  if (!etherealTransportPromise) {
    etherealTransportPromise = (async () => {
      const account = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
      });
    })();
  }
  return etherealTransportPromise;
}

function generateOTP() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

/**
 * Gmail: set GMAIL_USER + GMAIL_APP_PASSWORD (Google App Password, 16 chars).
 * The OTP is always sent *to* the address the user typed at signup (e.g. @gmail.com);
 * GMAIL_USER is the *sender* account that relays mail through smtp.gmail.com.
 *
 * Or any provider: SMTP_HOST + SMTP_USER + SMTP_PASS (+ optional SMTP_PORT, SMTP_SECURE).
 */
function buildTransporter() {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
    });
  }

  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "1",
    auth: { user, pass },
  });
}

function defaultFromAddress() {
  if (process.env.SMTP_FROM?.trim()) return process.env.SMTP_FROM.trim();
  const u = process.env.GMAIL_USER?.trim() || process.env.SMTP_USER?.trim();
  if (u) return `"MUST Quality" <${u}>`;
  return '"MUST Quality" <noreply@localhost>';
}

async function sendOTPEmail(email, otp) {
  const transporter = buildTransporter();
  const allowConsoleFallback =
    process.env.DEV_OTP === "1" || process.env.NODE_ENV !== "production";

  if (!transporter) {
    if (allowConsoleFallback) {
      try {
        const eth = await getEtherealTransport();
        const from = '"MUST Quality (dev)" <noreply@ethereal.email>';
        const text = `كود التحقق الخاص بك: ${otp}\nصالح لمدة 10 دقائق.\nنظام جودة جامعة مصر للعلوم والتكنولوجيا`;
        const html = `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #002147; text-align: center;">نظام جودة جامعة مصر للعلوم والتكنولوجيا</h2>
        <p style="font-size: 16px; color: #333;">مرحباً،</p>
        <p style="font-size: 16px; color: #333;">لقد طلبت إنشاء حساب في نظام جودة الجامعة.</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <p style="font-size: 18px; margin: 0 0 10px 0;">كود التحقق الخاص بك:</p>
          <p style="font-size: 32px; font-weight: bold; color: #002147; margin: 0;">${otp}</p>
        </div>
        <p style="font-size: 14px; color: #666;">ملاحظة: هذا الكود صالح لمدة 10 دقائق فقط.</p>
      </div>
    `;
        const info = await eth.sendMail({
          from,
          to: email,
          subject: "كود التحقق - نظام جودة MUST (تطوير)",
          text,
          html,
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(
          "[MUST Quality] Dev OTP sent via Ethereal. Preview:",
          previewUrl || "(no preview URL)",
        );
        return { success: true, previewUrl: previewUrl || null };
      } catch (err) {
        console.error("[MUST Quality] Ethereal send failed:", err?.message || err);
        console.warn(
          "[MUST Quality] No mail config and Ethereal failed — OTP for",
          email,
          ":",
          otp,
        );
        return { success: true, devOtp: otp };
      }
    }
    return {
      success: false,
      error:
        "لم يُضبط البريد. أضف GMAIL_USER و GMAIL_APP_PASSWORD في ملف backend/.env",
    };
  }

  const from = defaultFromAddress();
  const mailOptions = {
    from,
    to: email,
    subject: "كود التحقق - نظام جودة MUST",
    text: `كود التحقق الخاص بك: ${otp}\nصالح لمدة 10 دقائق.\nنظام جودة جامعة مصر للعلوم والتكنولوجيا`,
    html: `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #002147; text-align: center;">نظام جودة جامعة مصر للعلوم والتكنولوجيا</h2>
        <p style="font-size: 16px; color: #333;">مرحباً،</p>
        <p style="font-size: 16px; color: #333;">لقد طلبت إنشاء حساب في نظام جودة الجامعة.</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <p style="font-size: 18px; margin: 0 0 10px 0;">كود التحقق الخاص بك:</p>
          <p style="font-size: 32px; font-weight: bold; color: #002147; margin: 0;">${otp}</p>
        </div>
        <p style="font-size: 14px; color: #666;">ملاحظة: هذا الكود صالح لمدة 10 دقائق فقط.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[MUST Quality] OTP email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateOTP,
  sendOTPEmail,
};
