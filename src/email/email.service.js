const { google } = require('googleapis');

function createOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

async function sendEmail({ to, subject, htmlBody, textBody }) {
  const oauth2Client = createOAuth2Client();
  const { token: accessToken } = await oauth2Client.getAccessToken();

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const rawMessage = [
    `From: ${process.env.EMAIL_FROM}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody,
  ].join('\r\n');

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });
}

async function sendVerificationEmail(email, verificationToken) {
  const verifyUrl = `${process.env.BASE_URL}/verify?token=${verificationToken}`;

  await sendEmail({
    to: email,
    subject: 'Verify your Maccabim Bank account',
    textBody: 'Click this link to verify your account: ' + verifyUrl,
    htmlBody: `
      <div style="background-color:#0D1B3E;padding:40px;font-family:Arial,sans-serif;color:#ffffff;min-height:100vh;">
        <div style="max-width:480px;margin:0 auto;text-align:center;">
          <h1 style="letter-spacing:4px;font-size:22px;font-weight:bold;margin-bottom:32px;">MACCABIM BANK</h1>
          <p style="font-size:16px;margin-bottom:12px;">Welcome to Maccabim Bank.</p>
          <p style="font-size:15px;color:#cccccc;margin-bottom:36px;">Please verify your email address to activate your account.</p>
          <a href="${verifyUrl}" style="display:inline-block;background-color:#ffffff;color:#0D1B3E;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 36px;border-radius:4px;border-bottom:4px solid #B8860B;">Verify My Account</a>
          <p style="margin-top:36px;font-size:12px;color:#aaaaaa;">If you did not create an account, you can ignore this email.</p>
        </div>
      </div>
    `,
  });
}

async function sendAlreadyRegisteredEmail(email) {
  const loginUrl = `${process.env.BASE_URL}/login`;

  await sendEmail({
    to: email,
    subject: 'Someone tried to register a Maccabim Bank account',
    textBody: `Someone tried to register a Maccabim Bank account with your email. If this was you, you already have an account — log in here: ${loginUrl}`,
    htmlBody: `
            <div style="background-color:#0D1B3E;padding:40px;font-family:Arial,sans-serif;color:#ffffff;min-height:100vh;">
                <div style="max-width:480px;margin:0 auto;text-align:center;">
                    <h1 style="letter-spacing:4px;font-size:22px;font-weight:bold;margin-bottom:32px;">MACCABIM BANK</h1>
                    <p style="font-size:16px;margin-bottom:12px;">Someone tried to register an account with your email address.</p>
                    <p style="font-size:15px;color:#cccccc;margin-bottom:36px;">If this was you, you already have an account. Click below to log in.</p>
                    <a href="${loginUrl}" style="display:inline-block;background-color:#ffffff;color:#0D1B3E;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 36px;border-radius:4px;border-bottom:4px solid #B8860B;">Log In</a>
                    <p style="margin-top:36px;font-size:12px;color:#aaaaaa;">If you did not attempt to register, you can safely ignore this email.</p>
                </div>
            </div>
        `,
  });
}

module.exports = { sendVerificationEmail, sendAlreadyRegisteredEmail };
