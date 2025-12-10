interface WelcomeEmailProps {
  name: string;
  appUrl: string;
}

export function generateWelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  const html = `
    <p>Hello ${name},</p>
    <p>Welcome to Authesci! We're excited to have you on board.</p>
    <p>You can get started by visiting our platform here: <a href="${appUrl}">${appUrl}</a></p>
    <p>Best regards,</p>
    <p>The Authesci Team</p>
  `;

  const text = `
    Hello ${name},
    Welcome to Authesci! We're excited to have you on board.
    You can get started by visiting our platform here: ${appUrl}
    Best regards,
    The Authesci Team
  `;

  return { html, text };
}
