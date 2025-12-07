# Email Service Setup Guide

## Quick Start (5 Minutes)

### 1. Get Resend API Key

- Visit https://resend.com
- Sign up (free)
- Copy your API key from dashboard (starts with `re_`)

### 2. Configure Backend

Edit `backend/.env`:

```env
RESEND_API_KEY=re_YOUR_KEY_HERE
SENDER_EMAIL=onboarding@resend.dev
SENDER_NAME=Star Picker
```

**Important:** For development, use `onboarding@resend.dev` (Resend's test domain). This doesn't require verification and works immediately.

### 3. Restart Backend

```powershell
cd backend
npm run dev
```

### 4. Test It

1. Go to http://localhost:3000/signup
2. Sign up with Gmail or Outlook
3. Check email for OTP (may be in spam)
4. Verify and login

## How It Works

When user signs up:

1. Backend generates 6-digit OTP
2. OTP stored in MongoDB (expires in 10 minutes)
3. Beautiful HTML email sent via Resend
4. User enters OTP to verify
5. Only verified users can login

## Email Features

- Professional HTML template with gradient header
- Large, readable OTP code
- 10-minute expiration notice
- Security warning
- Responsive design

## Production Deployment

When deploying to production, you'll need to verify your own domain:

1. In Resend dashboard, click "Domains" → "Add Domain"
2. Enter your domain (e.g., `starpicker.com`)
3. Add the DNS records shown (typically CNAME and SPF)
4. Wait for verification (can take up to 48 hours)
5. Update `.env`:
   ```env
   SENDER_EMAIL=noreply@yourdomain.com
   ```
6. Restart backend and test

**For development:** Continue using `onboarding@resend.dev` - no verification needed.

## Troubleshooting

| Issue                          | Solution                                                                    |
| ------------------------------ | --------------------------------------------------------------------------- |
| "Domain is not verified" error | Use `onboarding@resend.dev` for development                                 |
| Email not arriving             | Check spam folder, verify API key in `.env`, restart backend                |
| OTP expired too fast           | Adjust TTL in `backend/models/EmailVerification.js` (currently 600 seconds) |
| API key invalid                | Double-check key from Resend dashboard, ensure no extra spaces              |
| Want to test without email     | Use Resend free tier, check dashboard for delivery logs                     |

## File Structure

- `backend/services/emailService.js` - Email sending logic
- `backend/routes/auth.js` - Updated signup to send emails
- `backend/.env` - Configuration (add your API key here)
- `backend/models/EmailVerification.js` - OTP storage with TTL

## Environment Variables

| Variable         | Purpose                    | Example                  |
| ---------------- | -------------------------- | ------------------------ |
| `RESEND_API_KEY` | Resend authentication      | `re_xxxxxxxxxx`          |
| `SENDER_EMAIL`   | Email address to send from | `noreply@starpicker.dev` |
| `SENDER_NAME`    | Display name in emails     | `Star Picker`            |

## Support

- Resend docs: https://resend.com/docs
- Email service: `backend/services/emailService.js`
- Questions? Check server logs for error details
