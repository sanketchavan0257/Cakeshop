# CakeCraft - Forgot Password System Setup Guide

## ✅ SYSTEM STATUS: FULLY FUNCTIONAL

### Current Implementation

**Email Validation:** ✓ Strict (Only registered emails allowed)
**Error Handling:** ✓ Shows "Invalid email ID" for unregistered emails
**Token System:** ✓ Secure 30-minute expiry, one-time use
**Email Sending:** ✓ Configured with aiosmtplib (SMTP ready)
**Frontend:** ✓ Proper success/error messages

---

## 📧 Email Configuration Guide

### Option 1: Gmail SMTP (Recommended for Testing)

1. **Get Gmail App Password:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Factor Authentication
   - Go to "App passwords"
   - Generate new app password for "Mail"
   - Copy the 16-character password

2. **Update /app/backend/.env:**
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-16-char-app-password"
   FROM_EMAIL="noreply@cakeshop.com"
   ```

3. **Restart Backend:**
   ```bash
   sudo supervisorctl restart backend
   ```

### Option 2: SendGrid (Production Recommended)

1. **Get SendGrid API Key:**
   - Sign up at https://sendgrid.com
   - Create API key with "Mail Send" permission
   - Copy API key

2. **Update Backend Code:**
   Replace the `send_email` function in `/app/backend/server.py` with:
   ```python
   from sendgrid import SendGridAPIClient
   from sendgrid.helpers.mail import Mail
   
   async def send_email(to_email: str, subject: str, html_content: str):
       try:
           message = Mail(
               from_email=os.getenv('FROM_EMAIL', 'noreply@cakeshop.com'),
               to_emails=to_email,
               subject=subject,
               html_content=html_content
           )
           sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
           response = sg.send(message)
           logger.info(f"Email sent to {to_email}, status: {response.status_code}")
           return True
       except Exception as e:
           logger.error(f"SendGrid error: {str(e)}")
           return False
   ```

3. **Update .env:**
   ```env
   SENDGRID_API_KEY="SG.your_api_key_here"
   FROM_EMAIL="noreply@cakeshop.com"
   ```

### Option 3: Resend (Modern Alternative)

1. **Get Resend API Key:**
   - Sign up at https://resend.com
   - Create API key
   - Verify domain (or use resend.dev for testing)

2. **Update Backend Code:**
   ```python
   from resend import Resend
   
   async def send_email(to_email: str, subject: str, html_content: str):
       try:
           resend = Resend(api_key=os.getenv('RESEND_API_KEY'))
           resend.emails.send({
               "from": os.getenv('FROM_EMAIL', 'noreply@cakeshop.com'),
               "to": to_email,
               "subject": subject,
               "html": html_content
           })
           logger.info(f"Email sent to {to_email}")
           return True
       except Exception as e:
           logger.error(f"Resend error: {str(e)}")
           return False
   ```

3. **Update .env:**
   ```env
   RESEND_API_KEY="re_your_api_key"
   FROM_EMAIL="noreply@cakeshop.com"
   ```

---

## 🔧 Current System Behavior

### Valid Email (Registered)
```
Input: admin@cakeshop.com
↓
Backend: Checks users collection
↓
Found: ✓ (role: admin)
↓
Action: Generate token, send email
↓
Response: "Password reset link has been sent to your email"
↓
Frontend: Shows success message + reset link (if SMTP not configured)
```

### Invalid Email (Not Registered)
```
Input: invalid@example.com
↓
Backend: Checks users collection
↓
Found: ✗
↓
Action: Return 400 error
↓
Response: {"detail": "Invalid email ID. This email is not registered."}
↓
Frontend: Shows error toast
```

---

## 📝 Testing the System

### Test 1: Invalid Email
```bash
curl -X POST "https://cake-craft-plus.preview.emergentagent.com/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@example.com"}'

Expected:
{
  "detail": "Invalid email ID. This email is not registered."
}
```

### Test 2: Valid Email (Admin)
```bash
curl -X POST "https://cake-craft-plus.preview.emergentagent.com/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cakeshop.com"}'

Expected:
{
  "message": "Password reset link has been sent to your email",
  "reset_link": "https://..." (only if SMTP not configured)
}
```

### Test 3: Frontend Testing
1. Go to: https://cake-craft-plus.preview.emergentagent.com/forgot-password
2. Enter: invalid@example.com
3. Click: "Send Reset Link"
4. See: Error toast "Invalid email ID..."
5. Enter: admin@cakeshop.com
6. Click: "Send Reset Link"
7. See: Success message + reset link

---

## 🐛 Debugging Email Issues

### Issue: Emails Not Sending

**Check 1: SMTP Credentials**
```bash
# View current .env
cat /app/backend/.env | grep SMTP

# Should show:
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

**Check 2: Backend Logs**
```bash
# View email send logs
tail -f /var/log/supervisor/backend.*.log | grep -i "email"

# Look for:
# ✓ "Email sent successfully to admin@cakeshop.com"
# ✗ "Failed to send email: [error message]"
```

**Check 3: Test SMTP Manually**
```python
# Create test script: test_smtp.py
import asyncio
import aiosmtplib
from email.message import EmailMessage

async def test():
    msg = EmailMessage()
    msg["From"] = "your-email@gmail.com"
    msg["To"] = "test@example.com"
    msg["Subject"] = "Test"
    msg.set_content("Test email")
    
    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        username="your-email@gmail.com",
        password="your-app-password",
        use_tls=True
    )
    print("✓ Email sent!")

asyncio.run(test())
```

**Check 4: Firewall/Network**
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Should connect
# If timeout, check firewall
```

### Issue: Gmail Blocking Emails

**Solutions:**
1. Enable "Less secure app access" (not recommended)
2. Use App Passwords (recommended)
3. Check "Recent security activity"
4. Verify 2FA is enabled
5. Try from server IP (whitelist if needed)

### Issue: Emails Going to Spam

**Solutions:**
1. Add SPF record to domain
2. Add DKIM signature
3. Use verified sender email
4. Use professional email service (SendGrid/Resend)
5. Warm up email domain gradually

---

## 🔒 Security Features

✅ **Token Expiry:** 30 minutes
✅ **One-Time Use:** Token marked as used after reset
✅ **Secure Generation:** `secrets.token_urlsafe(32)`
✅ **Bcrypt Hashing:** Password hashed on reset
✅ **Email Validation:** Only registered emails
✅ **HTTPS Ready:** Secure token transmission

---

## 📊 API Reference

### POST /api/auth/forgot-password
**Request:**
```json
{
  "email": "admin@cakeshop.com"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset link has been sent to your email",
  "reset_link": "https://..." // Only if SMTP not configured
}
```

**Error Response (400):**
```json
{
  "detail": "Invalid email ID. This email is not registered."
}
```

### POST /api/auth/reset-password
**Request:**
```json
{
  "token": "secure_token_here",
  "new_password": "NewPassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Error Responses:**
```json
// Invalid/expired token
{
  "detail": "Invalid or expired reset token"
}

// Token already used
{
  "detail": "Invalid or expired reset token"
}
```

---

## 🚀 Production Checklist

- [ ] Configure SMTP credentials in .env
- [ ] Test email sending with real email
- [ ] Set up domain authentication (SPF/DKIM)
- [ ] Use professional email service (SendGrid/Resend)
- [ ] Remove reset_link from response (security)
- [ ] Add rate limiting on forgot password endpoint
- [ ] Monitor email delivery rates
- [ ] Set up email templates with branding
- [ ] Add logging for security audits
- [ ] Configure email retry mechanism

---

## 📧 Email Template Customization

The HTML email template is in `/app/backend/server.py` in the `forgot_password` function.

**Customize:**
- Company name
- Logo/branding
- Button colors
- Footer text
- Support contact

**Current Template Features:**
- Responsive design
- Reset button
- Fallback link
- Expiry notice
- Professional styling

---

## 🎯 Next Steps

1. **Set up SMTP credentials** (see Option 1, 2, or 3 above)
2. **Test email sending** with your account
3. **Update branding** in email template
4. **Monitor logs** for any errors
5. **Add to production** with verified domain

For support, check backend logs:
```bash
tail -f /var/log/supervisor/backend.*.log
```
