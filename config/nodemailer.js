import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ----------------- CREATE TRANSPORTER -----------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: true,
  debug: true,
});

// ----------------- VERIFY CONNECTION -----------------
transporter.verify((err, success) => {
  if (err) console.error("❌ SMTP Connection Error:", err.message);
  else console.log("✅ SMTP Connected Successfully");
});

/**
 * Send Email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} type - "otp" | "verified" | "reset" | "passwordChanged"
 * @param {object} data - { name, otp }
 * @param {boolean} forceSend - if true, send real email even in development
 */
export async function sendEmail(to, subject, type, data = {}, forceSend = false) {
  try {
    let content = "";

    if (type === "otp") {
      content = `
        <p>👋 Hey ${data.name || "User"},</p>
        <p>Here’s your one-time password (OTP) to verify your email:</p>
        <h1 style="text-align:center; background:#1a73e8; color:white; padding:15px; border-radius:8px;">
          ${data.otp}
        </h1>
        <p style="text-align:center;">⏳ This OTP will expire in <b>10 minutes</b>.</p>
      `;
    }

    if (type === "verified") {
      content = `
        <p>🎉 Congratulations ${data.name || "User"}!</p>
        <p>Your account has been <b>successfully verified</b>.</p>
        <p>You can now login and enjoy using <b>Misbah App</b>.</p>
      `;
    }

    if (type === "reset") {
      content = `
        <p>🔒 Hi ${data.name || "User"},</p>
        <p>You requested a password reset. Use the OTP below to continue:</p>
        <h1 style="text-align:center; background:#e53935; color:white; padding:15px; border-radius:8px;">
          ${data.otp}
        </h1>
        <p style="text-align:center;">⚠️ Expires in <b>10 minutes</b>.</p>
      `;
    }

    if (type === "passwordChanged") {
      content = `
        <p>🔐 Hello ${data.name || "User"},</p>
        <p>Your password has been <b>successfully changed</b>.</p>
        <p>If this wasn’t you, please reset your password immediately or contact support.</p>
        <p>Stay safe,<br/>The Misbah App Team</p>
      `;
    }

    const html = `
      <div style="font-family:Arial, sans-serif; max-width:600px; margin:auto; padding:25px; background:#fdfdfd; border-radius:12px; border:1px solid #eee; box-shadow:0px 3px 10px rgba(0,0,0,0.05);">
        <h2 style="text-align:center; color:#1a73e8;">🌟 Misbah App</h2>
        ${content}
        <hr style="margin:30px 0; border:none; border-top:1px solid #eee;"/>
        <p style="font-size:12px; text-align:center; color:#888;">
          Need help? 📩 Contact <a href="mailto:${process.env.SENDER_EMAIL}" style="color:#1a73e8;">support</a>
        </p>
      </div>
    `;

    // Development mode? log only
    if (process.env.NODE_ENV === "development" && !forceSend) {
      console.log(`[DEV EMAIL] To: ${to}, Subject: ${subject}, HTML: ${html}`);
      return { success: true, messageId: "[DEV]" };
    }

    // Real sending
    const info = await transporter.sendMail({
      from: `"Misbah App" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error && error.message ? error.message : error);
    throw new Error("Email send failed: " + (error && error.message ? error.message : ""));
  }
}
