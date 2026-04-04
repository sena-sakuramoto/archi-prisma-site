/**
 * Google Apps Script — Contact Form Handler
 *
 * Deploy as Web App:
 * 1. Open https://script.google.com
 * 2. Create new project, paste this code
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL
 * 5. Set it as FORM_ENDPOINT in contact/index.astro
 *
 * This script:
 * - Receives POST JSON from the contact form
 * - Sends email via Gmail to info@archi-prisma.co.jp
 * - Logs submissions to a Google Sheet (optional)
 * - Returns JSON response
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const { type, name, company, email, message } = data;

    // Validate required fields
    if (!type || !name || !email || !message) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: '必須項目が不足しています' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Compose email
    const subject = `【お問い合わせ】${type} — ${name}様`;
    const body = [
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '  APDW お問い合わせフォーム',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      `■ ご相談内容: ${type}`,
      `■ お名前: ${name}`,
      company ? `■ 会社名: ${company}` : '',
      `■ メール: ${email}`,
      '',
      '■ メッセージ:',
      message,
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
    ].filter(Boolean).join('\n');

    // Send email
    GmailApp.sendEmail('info@archi-prisma.co.jp', subject, body, {
      replyTo: email,
      name: 'APDW Website Contact Form',
    });

    // Optional: Log to sheet
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet();
      if (sheet) {
        sheet.getActiveSheet().appendRow([
          new Date(),
          type,
          name,
          company || '',
          email,
          message,
        ]);
      }
    } catch (_) {
      // Sheet logging is optional
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS preflight
function doGet(_e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'APDW Contact Form' }))
    .setMimeType(ContentService.MimeType.JSON);
}
