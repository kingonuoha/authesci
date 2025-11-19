interface PasswordResetEmailProps {
  name: string;
  resetLink: string;
}

export function generatePasswordResetEmail({ name, resetLink }: PasswordResetEmailProps) {
  const html = `
    <p>Hello ${name},</p>
    <p>You have requested to reset your password for your Authesci account.</p>
    <p>Please click on the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Best regards,</p>
    <p>The Authesci Team</p>
  `;

  const text = `
    Hello ${name},
    You have requested to reset your password for your Authesci account.
    Please click on the following link to reset your password: ${resetLink}
    If you did not request a password reset, please ignore this email.
    Best regards,
    The Authesci Team
  `;

  return { html, text };
}
