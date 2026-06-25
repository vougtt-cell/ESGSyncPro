# Google Apps Script Setup Guide for Email Sending with PDF Attachments

## Step 1: Create New Google Apps Script Project

1. Go to https://script.google.com/
2. Click on "New project"
3. Name your project (e.g., "ESG PDF Email Sender")

## Step 2: Enable Required Services

1. In the left sidebar, click on "Services" (the "+" icon)
2. Add the following services:
   - **Gmail Service** (select "Gmail API", version "v1")
   - **Drive API** (select "Drive API", version "v2")

## Step 3: Replace the Code

Delete all existing code in the `Code.gs` file and paste the complete code provided below.

## Step 4: Deploy as Web App

1. Click on "Deploy" > "New deployment"
2. Select type: "Web app"
3. Fill in the form:
   - **Description**: "ESG PDF Email Sender"
   - **Execute as**: "Me" (your email)
   - **Who has access**: "Anyone"
4. Click "Deploy"
5. Copy the Web App URL (it will look like: https://script.google.com/macros/s/.../exec)
6. Update your `.env` file with this URL:
   ```
   GOOGLE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/YOUR_URL/exec
   ```

## Step 5: Test

1. Restart your Node.js server
2. Submit the survey form
3. Check if the email arrives with the PDF attachment

---

## Complete Google Apps Script Code

Copy this entire code block into your `Code.gs` file:

```javascript
function doPost(e) {
  try {
    // Parse the POST data
    const params = e.parameter;
    const action = params.action;
    
    if (action === 'email_pdf') {
      return handleEmailPdf(params);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Unknown action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleEmailPdf(params) {
  try {
    const email = params.email;
    const pdfBase64 = params.pdfBase64;
    const lang = params.lang || 'en';
    const filename = params.filename || 'ESG_Assessment.pdf';
    
    // Log parameters for debugging
    Logger.log('Email: ' + email);
    Logger.log('Lang: ' + lang);
    Logger.log('Filename: ' + filename);
    Logger.log('PDF Base64 length: ' + (pdfBase64 ? pdfBase64.length : 'null'));
    
    // Validate required parameters
    if (!email || !pdfBase64) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required parameters: email or pdfBase64',
        email: email,
        hasPdf: !!pdfBase64
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Decode base64 PDF
    const pdfData = Utilities.base64Decode(pdfBase64);
    Logger.log('PDF data decoded, size: ' + pdfData.length + ' bytes');
    const blob = Utilities.newBlob(pdfData, MimeType.PDF, filename);
    Logger.log('Blob created, size: ' + blob.getBytes().length + ' bytes');
    
    // Create email subject and body based on language
    let subject, body;
    if (lang === 'pl') {
      subject = 'Twój raport ESG';
      body = `
        <h2>Twój spersonalizowany raport ESG</h2>
        <p>Cześć,</p>
        <p>Dziękujemy za wypełnienie ankiety ESG. W załączniku znajduje się Twój spersonalizowany raport.</p>
        <p>Pozdrawiamy,<br>Zespół ESG</p>
      `;
    } else {
      subject = 'Your ESG Report';
      body = `
        <h2>Your Personalized ESG Report</h2>
        <p>Hi there,</p>
        <p>Thank you for completing the ESG survey. Please find your personalized report attached.</p>
        <p>Best regards,<br>The ESG Team</p>
      `;
    }
    
    // Send email with PDF attachment
    Logger.log('Attempting to send email to: ' + email);
    GmailApp.sendEmail(email, subject, '', {
      htmlBody: body,
      attachments: [blob]
    });
    Logger.log('Email sent successfully');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      email: email
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Apps Script is working!'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

---

## Troubleshooting

### Error: "Service invoked too many times"
- This happens when you send too many emails in a short period
- Wait a few minutes before trying again
- Consider implementing rate limiting

### Error: "Authorization required"
- Make sure you deployed the web app with "Execute as: Me"
- Make sure "Who has access" is set to "Anyone"

### Error: "Script function not found"
- Make sure you copied all the code correctly
- Check that function names match exactly (case-sensitive)

### Email not arriving
- Check your spam folder
- Verify the email address is correct
- Check the Google Apps Script execution logs for errors

---

## Security Notes

- This script allows anyone with the URL to send emails
- In production, consider adding authentication
- Never share your Web App URL publicly if it contains sensitive functionality
