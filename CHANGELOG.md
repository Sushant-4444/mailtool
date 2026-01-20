# Changelog

All notable changes to MailTool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-20

### 🎉 Initial Release

#### Added
- **Contact Management**
  - CSV/Excel import with field mapping
  - Custom fields support (unlimited)
  - Session-based storage (privacy-first)
  - Validation and preview

- **Campaign Creation**
  - Rich text email editor (TipTap)
  - HTML/CSS custom email design
  - Visual, HTML, and Preview modes
  - Variable insertion ({{firstName}}, {{customField}}, etc.)

- **Certificate Generation**
  - Visual drag-and-drop builder
  - Custom background image upload
  - Dynamic text placement
  - Automatic PDF generation
  - Variable support in certificates

- **Document Attachments**
  - Bulk file upload
  - Smart filename mapping to contact fields
  - Support for PDF, DOCX, images
  - Custom field mapping

- **Email Sending**
  - Personalized bulk emails
  - Certificate auto-generation per recipient
  - Document auto-attachment based on mapping
  - TLS encryption (SMTP)
  - Rate limiting (1s delay between emails)

- **Results & Analytics**
  - Success/failure counts
  - Detailed error messages for failed emails
  - Copy failed email addresses
  - Comprehensive logging

- **Self-Hosted Infrastructure**
  - Docker containerization
  - One-command setup
  - **Zero database required** - Stateless architecture
  - Health check endpoints
  - Production-ready configuration

#### Architecture
- **Database-free design** for maximum privacy
- All data is session-based (in-memory)
- No persistent storage of contacts or campaigns
- Simplified deployment (just frontend + backend)

#### Documentation
- Comprehensive README with quick start
- QUICKSTART guide for beginners
- DEPLOYMENT guide for various platforms
- SECURITY & privacy best practices
- CONTRIBUTING guidelines
- MIT License

#### Security
- App Password support (Gmail)
- Environment-based configuration
- Secure .env file handling
- TLS email encryption
- No third-party data sharing

---

## [Unreleased]

### Planned Features
- [ ] Multi-user authentication system
- [ ] OAuth 2.0 integration (Gmail/Outlook)
- [ ] Email template library
- [ ] Scheduled campaigns
- [ ] A/B testing
- [ ] Email analytics (open rates, clicks)
- [ ] Unsubscribe management
- [ ] Contact segmentation
- [ ] Dark mode UI
- [ ] Mobile-responsive improvements
- [ ] API documentation
- [ ] Webhook support
- [ ] Multiple language support (i18n)

### Community Requests
- [ ] SendGrid/Mailgun integration
- [ ] Image uploads in email editor
- [ ] Email preview with sample data
- [ ] Duplicate campaign feature
- [ ] Export campaign reports
- [ ] CSV export of contacts

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to suggest features or report bugs.

---

## Version History

- **1.0.0** (2026-01-20) - Initial public release
