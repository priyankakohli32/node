import { FRONTEND_WEB_URL } from "./constants.js";

export const emailTemplate = {
  base: (child) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      background-color: #f4f4f4;
      padding: 0;
      margin: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #256133; /* Primary color */
      color: #fff;
      padding: 20px;
      text-align: center;
      font-size: 24px;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 20px;
    }
    .content p {
      margin: 15px 0;
    }
    .button {
      display: inline-block;
      background-color: #256133; /* Primary color */
      color: #fff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }
    .footer {
      padding: 10px;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  ${child}
</body>
</html>
`,

  resetPassword: (token) =>
    emailTemplate.base(`
    <div class="email-container">
      <div class="header">Actors Truth</div>
      <div class="content">
        <p>Hi,</p>
        <p>You have requested to reset your password. Please click the button below to reset your password.</p>
        <p><a href="${FRONTEND_WEB_URL}/update-password?token=${token}" class="button">Reset Password</a></p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Actors Truth. All rights reserved.</p>
      </div>
    </div>
  `),

  signupEmail: (token) =>
    emailTemplate.base(`
    <div class="email-container">
      <div class="header">Actors Truth</div>
      <div class="content">
        <p>Hi,</p>
        <p>Your account has been created. Please set up your password by clicking the button below.</p>
        <p><a href="${FRONTEND_WEB_URL}/update-password?token=${token}" class="button">Set Password</a></p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Actors Truth. All rights reserved.</p>
      </div>
    </div>
  `),

  promotionToMentor: () =>
    emailTemplate.base(`
    <div class="email-container">
      <div class="header">Actors Truth</div>
      <div class="content">
        <p>Hi,</p>
        <p>Congratulations! Your account has been promoted to mentor status by an admin.</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Actors Truth. All rights reserved.</p>
      </div>
    </div>
  `),

  accountDeletion: () =>
    emailTemplate.base(`
    <div class="email-container">
      <div class="header">Actors Truth</div>
      <div class="content">
        <p>Hi,</p>
        <p>Your account has been deleted by an admin. If you believe this was a mistake, please contact support to restore your account.</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Actors Truth. All rights reserved.</p>
      </div>
    </div>
  `),

  accountRestore: () =>
    emailTemplate.base(`
    <div class="email-container">
      <div class="header">Actors Truth</div>
      <div class="content">
        <p>Hi,</p>
        <p>Your account has been successfully restored. You can now log in and access your account as usual. If you experience any issues, please contact support.</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Actors Truth. All rights reserved.</p>
      </div>
    </div>
  `),

  accountDetailsUpdate: () =>
    emailTemplate.base(`
    <div class="email-container">
      <div class="header">Actors Truth</div>
      <div class="content">
        <p>Hi,</p>
        <p>Your account details have been updated. If you did not make these changes, please contact support immediately to secure your account.</p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Actors Truth. All rights reserved.</p>
      </div>
    </div>
  `),
};
