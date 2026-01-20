# Security & Privacy

## 🔒 How MailTool Protects Your Data

### Self-Hosted = You Control Everything

Unlike cloud email platforms (Mailchimp, SendGrid, etc.), MailTool runs entirely on YOUR server:

✅ **Your data never leaves your server**
✅ **No third-party access**
✅ **No data collection or analytics**
✅ **Open source - you can audit the code**

---

## Email Security Best Practices

### 1. Use App Passwords (Not Your Main Password)

**Gmail Users:**
1. Enable 2-Factor Authentication
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use that password in `.env` file

**Benefits:**
- Can be revoked independently
- Doesn't expose your main password
- More secure than regular password

### 2. Secure Your .env File

```bash
# Never commit .env to version control
echo ".env" >> .gitignore

# Restrict file permissions (Linux/Mac)
chmod 600 .env

# Check it's not public
git status  # Should NOT show .env
```

### 3. SMTP Connection Security

MailTool uses:
- **TLS encryption** for email transmission
- **Port 587** (STARTTLS) - industry standard
- **Secure authentication**

---

## Server Security

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Data Storage

**MailTool is database-free:**
- All data is session-based (in-memory)
- No permanent storage of contacts or campaigns
- Maximum privacy by design
- No database to secure or backup

### HTTPS/SSL (Production)

**Always use HTTPS in production:**

```bash
# Free SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

---

## Data Privacy

### What MailTool Stores

**Temporarily (In-Memory/Session):**
- Contact lists during campaign creation
- Email content being composed

**Nothing is stored permanently:**
- No database
- No campaign history
- No contact records
- All data cleared when browser session ends

**Never stored:**
- Your email password (only in .env on your server)
- Email content after sending
- Recipient email content/responses

### How to Minimize Data Storage

**Already minimized by design!**

MailTool uses **zero persistent storage**:
- ✅ No database
- ✅ Session-based only
- ✅ Data cleared when browser closed
- ✅ Maximum privacy

---

## Email Sending Limits

### Gmail Free Account
- **500 emails/day** limit
- Exceeding may temporarily suspend account

### Recommendations
1. **Add delays** between emails (already implemented: 1 second)
2. **Batch large campaigns** over multiple days
3. **Monitor sending logs** for errors
4. **Use Gmail Workspace** for higher limits (2000/day)

---

## Compliance

### GDPR (EU Users)

If you're in EU or email EU recipients:

1. **Data Processing:**
   - ✅ You control all data (self-hosted)
   - ✅ No data shared with third parties
   - ✅ Users can request deletion

2. **Consent:**
   - Ensure recipients opted-in to receive emails
   - Include unsubscribe option in emails
   - Keep opt-in records

3. **Data Retention:**
   - Delete old campaigns/contacts
   - Don't keep data longer than needed

### CAN-SPAM Act (US)

Include in every email:
- Valid physical address
- Clear "From" name
- Accurate subject line
- Unsubscribe mechanism

**Example footer:**
```html
<p style="font-size: 12px; color: #666;">
  You received this email because you signed up for [Event/Service].<br>
  To unsubscribe, reply with "UNSUBSCRIBE".<br>
  Company Name, 123 Street, City, State, ZIP
</p>
```

---

## Audit & Monitoring

### Review Logs Regularly

```bash
# Check for suspicious activity
docker-compose logs backend | grep ERROR

# Monitor email sending
docker-compose logs backend | grep "Sent to"
```

### Access Logs

Backend logs show:
- Who sent campaigns (if you add auth)
- When emails were sent
- Success/failure rates

---

## Incident Response

### If Email Credentials Compromised

1. **Immediately revoke App Password**
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Revoke the MailTool app password

2. **Generate new App Password**
   - Create new password
   - Update `.env` file

3. **Check sent emails**
   - Review Gmail "Sent" folder
   - Look for unauthorized sends

4. **Update server**
   ```bash
   docker-compose restart
   ```

### If Server Compromised

1. **Shut down immediately**
   ```bash
   docker-compose down
   ```

2. **Secure server**
   - Change all passwords
   - Update SSH keys
   - Check for backdoors

3. **Review logs**
   - Check Docker logs
   - System logs: `/var/log/`

4. **Restore from backup** (if needed)

---

## Security Updates

### Keep Software Updated

```bash
# Update MailTool
git pull origin main
docker-compose up --build -d

# Update Docker
sudo apt update && sudo apt upgrade docker-ce

# Update system packages
sudo apt update && sudo apt upgrade
```

### Subscribe to Security Alerts

- Watch GitHub repository for security updates
- Enable GitHub Security Advisories
- Join discussions for security announcements

---

## Responsible Disclosure

Found a security vulnerability?

**Please DO NOT:**
- Open public GitHub issue
- Share details publicly

**Instead:**
1. Email: security@yourdomain.com (create this)
2. Describe the vulnerability
3. We'll respond within 48 hours
4. Coordinated disclosure after fix

---

## Security Checklist

Before going to production:

- [ ] Use App Password (not main password)
- [ ] `.env` file is in `.gitignore`
- [ ] HTTPS enabled (SSL certificate)
- [ ] Firewall configured (UFW)
- [ ] MongoDB not publicly accessible
- [ ] Regular backups enabled
- [ ] Email sending limits understood
- [ ] Compliance requirements met (GDPR/CAN-SPAM)
- [ ] Logs monitoring set up
- [ ] Security update process defined

---

## Questions?

Security concerns? Open a discussion on GitHub or contact the maintainers.

**Remember:** Self-hosting means YOU are responsible for security. This guide helps, but always follow security best practices for your specific use case.
