import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ----------------- CREATE TRANSPORTER -----------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
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
 * @param {"otp"|"verified"|"reset"|"passwordChanged"|"reminder"} type - template type
 * @param {object} data - { name, otp, taskTitle, dueDate, role }
 * @param {boolean} forceSend - if true, send real email even in development
 * @returns {Promise<{success:boolean,messageId:string}>}
 */
export async function sendEmail(
  to,
  subject,
  type,
  data = {},
  forceSend = false
) {
  try {
    let content = "";

    // ----------------- SWITCH BY EMAIL TYPE -----------------
    switch (type) {
      case "otp":
        content = `
          <p>Hi ${data.name || "User"},</p>
          <p>Your one-time password (OTP) to verify your account is:</p>
          <h2 style="text-align:center;background:#1a73e8;color:white;padding:15px;border-radius:8px;">
            ${data.otp}
          </h2>
          <p style="text-align:center;font-size:14px;color:#555;">
            This OTP will expire in <b>10 minutes</b>.
          </p>
        `;
        break;

      case "verified":
        content = `
          <p>Hi ${data.name || "User"},</p>
          <p>Your account has been successfully verified ✅</p>
          <p>You can now login and start managing your tasks efficiently.</p>
        `;
        break;

      case "reset":
        content = `
          <p>Hi ${data.name || "User"},</p>
          <p>You requested a password reset. Use the OTP below:</p>
          <h2 style="text-align:center;background:#e53935;color:white;padding:15px;border-radius:8px;">
            ${data.otp}
          </h2>
          <p style="text-align:center;font-size:14px;color:#555;">
            This OTP will expire in <b>10 minutes</b>.
          </p>
        `;
        break;

      case "passwordChanged":
        content = `
          <p>Hello ${data.name || "User"},</p>
          <p>Your password has been successfully changed ✅</p>
          <p>If this wasn’t you, please reset your password immediately or contact support.</p>
        `;
        break;

      case "reminder":
        content = `
          <p>Hi ${data.name || "User"},</p>
          <p>This is a reminder that your task <b>${
            data.taskTitle
          }</b> is due at <b>${data.dueDate}</b>.</p>
          <p>Please make sure to complete it on time ✅</p>
        `;
        break;

      default:
        content = `
          <p>Hello ${data.name || "User"},</p>
          <p>This is a notification from <b>Taskify</b> ✅</p>
        `;
    }

    // ----------------- ROLE FOOTER -----------------
    if (data.role) {
      content += `<p style="font-size:12px;color:#555;">Role: ${data.role}</p>`;
    }

    // ----------------- HTML TEMPLATE WRAPPER -----------------
    const html = `
      <div style="
        font-family:Arial,sans-serif;
        max-width:600px;
        margin:auto;
        padding:25px;
        background:#f8f8f8;
        border-radius:12px;
        border:1px solid #eee;
        box-shadow:0px 3px 10px rgba(0,0,0,0.05);
      ">
        <div style="text-align:center;margin-bottom:25px;">
          <h2 style="margin-top:10px;color:#1a73e8;font-size:24px;">Taskify ✅</h2>
        </div>
        ${content}
        <hr style="margin:30px 0;border:none;border-top:1px solid #eee;"/>
        <p style="font-size:12px;text-align:center;color:#888;">
          Need help? Contact
          <a href="mailto:${process.env.SENDER_EMAIL}" style="color:#1a73e8;">support</a>
        </p>
      </div>
    `;

    // ----------------- DEVELOPMENT MODE -----------------
    if (process.env.NODE_ENV === "development" && !forceSend) {
      console.log(`
📧 [DEV MODE EMAIL]
To: ${to}
Subject: ${subject}
Type: ${type}
---------------------
${html}
`);
      return { success: true, messageId: "[DEV_MODE]" };
    }

    // ----------------- SEND ACTUAL EMAIL -----------------
    const info = await transporter.sendMail({
      from: `"Taskify" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error?.message || error);
    throw new Error(`Email send failed: ${error?.message || ""}`);
  }
}

export default sendEmail;
