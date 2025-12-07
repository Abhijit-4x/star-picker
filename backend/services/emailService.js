const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@starpicker.dev";
const SENDER_NAME = process.env.SENDER_NAME || "Star Picker";

/**
 * Send OTP verification email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<Object>} - Resend response
 */
async function sendOtpEmail(email, otp) {
  try {
    const response = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: email,
      subject: "Your Star Picker Verification Code",
      html: generateOtpEmailTemplate(otp),
    });

    console.log(`OTP email sent successfully to ${email}`);
    return response;
  } catch (error) {
    console.error(`Failed to send OTP email to ${email}:`, error);
    throw error;
  }
}

/**
 * Generate HTML email template for OTP
 * @param {string} otp - 6-digit OTP code
 * @returns {string} - HTML email template
 */
function generateOtpEmailTemplate(otp) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .content p {
                color: #333;
                font-size: 16px;
                line-height: 1.6;
                margin: 15px 0;
            }
            .otp-box {
                background-color: #f9f9f9;
                border: 2px solid #667eea;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
            }
            .otp-code {
                font-size: 36px;
                font-weight: 700;
                color: #667eea;
                letter-spacing: 6px;
                font-family: 'Courier New', monospace;
            }
            .expiry {
                color: #666;
                font-size: 14px;
                margin-top: 15px;
            }
            .footer {
                background-color: #f9f9f9;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 12px;
            }
            .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 12px 15px;
                margin: 20px 0;
                border-radius: 4px;
                color: #856404;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⭐ Star Picker</h1>
            </div>
            <div class="content">
                <p>Welcome to Star Picker!</p>
                <p>To complete your email verification, please use the code below:</p>
                
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div class="expiry">This code expires in 10 minutes</div>
                </div>
                
                <div class="warning">
                    ⚠️ Don't share this code with anyone. Star Picker will never ask for this code.
                </div>
                
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2025 Star Picker. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

module.exports = {
  sendOtpEmail,
};
