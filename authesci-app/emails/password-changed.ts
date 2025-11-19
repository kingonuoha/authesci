interface PasswordChangedEmailProps {
  name: string;
  appUrl: string;
}

export function generatePasswordChangedEmail({ name, appUrl }: PasswordChangedEmailProps) {
  const html = `
    <p>Hello ${name},</p>
    <p>Your password for your Authesci account has been successfully changed.</p>
    <p>If you did not make this change, please contact us immediately.</p>
    <p>You can log in here: <a href="${appUrl}">${appUrl}</a></p>
    <p>Best regards,</p>
    <p>The Authesci Team</p>
  `;

  const text = `
    Hello ${name},
    Your password for your Authesci account has been successfully changed.
    If you did not make this change, please contact us immediately.
    You can log in here: ${appUrl}
    Best regards,
    The Authesci Team
  `;

  return { html, text };
}
