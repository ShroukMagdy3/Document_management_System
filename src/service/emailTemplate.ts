export function otpEmailTemplate(userName: string, otp: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Verification Code</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        background-color: #f8f9fa;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background-color: #4a90e2;
        color: #fff;
        text-align: center;
        padding: 20px;
        font-size: 22px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
        text-align: center;
      }
      .otp {
        font-size: 32px;
        font-weight: bold;
        color: #4a90e2;
        letter-spacing: 4px;
        background: #f3f6fb;
        padding: 10px 20px;
        border-radius: 8px;
        display: inline-block;
        margin: 20px 0;
      }
      .message {
        font-size: 16px;
        line-height: 1.6;
        color: #555;
      }
      .footer {
        text-align: center;
        padding: 15px;
        font-size: 13px;
        color: #aaa;
        border-top: 1px solid #eee;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Email confirmation</div>
      <div class="content">
        <p class="message">Hi <b>${userName}</b>,</p>
        <p class="message">Use the following verification code to complete your sign-in or verify your account:</p>
        <div class="otp">${otp}</div>
        <p class="message">This code will expire in <b>5 minutes</b>. Do not share it with anyone for security reasons.</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} Keeply Team. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}
