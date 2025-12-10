
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ASSET_URL = `${APP_URL}/assets/email`;

export const getTransactionalEmail = (
  title: string,
  content: string,
  ctaText?: string,
  ctaLink?: string,
  showHeroImage: boolean = false
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { width: 100vw; background-color: #f4f7f9; font-family: Arial, sans-serif; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    .button {
      background-color: #7c3aed; /* Primary Purple */
      color: #ffffff;
      text-decoration: none;
      padding: 12px 25px;
      display: inline-block;
      font-weight: bold;
      border-radius: 5px;
      text-align: center;
    }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 20px !important; }
      .button { width: 100% !important; }
      .hero-image { margin-top: 30px; width: 150px; }
      .hero-title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; padding: 40px; width: 600px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <img src="${ASSET_URL}/../logo/icon.png" alt="Authesci Logo" width="40" style="vertical-align: middle; border: 0;">
              <span style="font-size: 18px; font-weight: bold; padding-left: 10px; color: #333;">Authesci</span>
            </td>
          </tr>
          
          <!-- Hero -->
          <tr>
            <td align="left" style="padding-bottom: 20px;">
              <table width="100%">
                <tr>
                  <td align="left">
                    <div class="hero-title" style="font-size: 24px; font-weight: 500; padding-top: 10px; padding-bottom: 10px; color: #000000;">
                       ${title}
                    </div>
                  </td>
                  ${showHeroImage ? `
                  <td align="right">
                    <img src="${ASSET_URL}/abstract-1.png" alt="Hero" width="150" class="hero-image" style="border: 0;">
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td align="left" style="font-size: 16px; padding-bottom: 30px; color: #333333; line-height: 1.5;">
              ${content}
            </td>
          </tr>

          <!-- CTA Button -->
          ${ctaText && ctaLink ? `
          <tr>
            <td align="left" style="padding-bottom: 30px;">
              <a href="${ctaLink}" class="button">
                ${ctaText}
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="font-size: 12px; color: #666666; background-color: #e9f1f4; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              You're receiving this email because you are a user of Authesci.<br>
              &copy; ${new Date().getFullYear()} Authesci. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const getWelcomeEmail = (name: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Authesci</title>
    <style type="text/css">
        body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f4f4f4; font-family: Arial, sans-serif; }
        table { border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; display: block; }
        a { text-decoration: none; color: #7c3aed; }
        .button { display: inline-block; padding: 12px 24px; border-radius: 8px; background-color: #7c3aed; color: #ffffff; font-size: 16px; font-weight: bold; text-align: center; text-decoration: none; }
        @media screen and (max-width: 600px) {
            .full-width-table { width: 100% !important; }
            .content-padding { padding: 20px !important; }
            .header-text { font-size: 32px !important; line-height: 38px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td align="center" valign="top">
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="full-width-table" style="background-color: #ffffff; margin: 0 auto;">
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px 20px;">
                            <img src="${ASSET_URL}/../logo/icon.png" alt="Authesci Logo" width="60" style="display: block; margin-bottom: 20px;">
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0 40px 20px 40px;" class="content-padding">
                            <h1 class="header-text" style="font-family: Arial, sans-serif; font-size: 40px; line-height: 48px; color: #333333; margin: 0;">
                                Welcome to Authesci, ${name}!
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0 40px 30px 40px;" class="content-padding">
                            <p style="font-family: Arial, sans-serif; font-size: 18px; line-height: 26px; color: #666666; margin: 0;">
                                We're thrilled to have you on board. Authesci connects scientists with employers to drive innovation. Discover opportunities, collaborate, and achieve measurable results.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom: 40px;">
                            <a href="${APP_URL}/dashboard" class="button">Get Started Now</a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <img src="${ASSET_URL}/body_img.png" alt="Dashboard" width="560" style="display: block; border-radius: 8px;">
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 40px 20px; background-color: #f8f8f8;">
                            <p style="font-family: Arial, sans-serif; font-size: 12px; color: #999999; margin: 0;">
                                &copy; ${new Date().getFullYear()} Authesci. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

export const getNewListingEmail = (name: string, jobTitle: string, companyName: string, jobId: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Job Alert</title>
    <style type="text/css">
        body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; }
        table { border-spacing: 0; border-collapse: collapse; }
        img { max-width: 100%; height: auto; display: block; }
        a { text-decoration: none; color: #7c3aed; }
        .button { display: inline-block; padding: 12px 24px; border-radius: 8px; background-color: #7c3aed; color: #ffffff; font-size: 16px; font-weight: bold; text-align: center; text-decoration: none; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td align="center" valign="top">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; margin: 0 auto;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <img src="${ASSET_URL}/../logo/icon.png" alt="Authesci Logo" width="60">
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="padding: 0 40px 20px 40px;">
                            <p style="font-size: 16px; color: #333333; margin: 0;">Hi ${name},</p>
                            <p style="font-size: 16px; color: #333333; margin: 20px 0 0 0;">
                                We've found a new job listing on Authesci that matches your profile!
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px 40px 30px 40px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 20px; background-color: #ffffff;">
                                        <p style="font-size: 14px; color: #666666; margin: 0 0 5px 0;">
                                            <strong>${companyName}</strong>
                                        </p>
                                        <h3 style="font-size: 22px; color: #333333; margin: 0 0 10px 0;">
                                            ${jobTitle}
                                        </h3>
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" style="border-radius: 8px; background-color: #7c3aed;">
                                                    <a href="${APP_URL}/jobs/${jobId}" class="button">View Job Details</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 40px 20px; background-color: #f8f8f8;">
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                &copy; ${new Date().getFullYear()} Authesci. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

export const applicationReceivedEmail = (applicantName: string, jobTitle: string, jobId: string) => {
  const content = `
    <p>Hi ${applicantName},</p>
    <p>We have received your application for the position of <strong>${jobTitle}</strong>.</p>
    <p>The employer will review your application and get back to you shortly.</p>
  `;
  return getTransactionalEmail(
    "Application Received",
    content,
    "View Job",
    `${APP_URL}/jobs/${jobId}`,
    true
  );
};

export const newApplicantEmail = (employerName: string, jobTitle: string, applicantName: string, jobId: string, matchScore?: number) => {
  const content = `
    <p>Hi ${employerName},</p>
    <p>You have a new applicant for <strong>${jobTitle}</strong>.</p>
    <p><strong>Applicant:</strong> ${applicantName}</p>
    ${matchScore ? `<p><strong>AI Match Score:</strong> ${matchScore}%</p>` : ''}
  `;
  return getTransactionalEmail(
    "New Applicant",
    content,
    "View Applicant",
    `${APP_URL}/employer/jobs/${jobId}/applicants`,
    false
  );
};

export const applicationStatusUpdateEmail = (applicantName: string, jobTitle: string, status: string, jobId: string) => {
  const content = `
    <p>Hi ${applicantName},</p>
    <p>The status of your application for <strong>${jobTitle}</strong> has been updated.</p>
    <p><strong>New Status:</strong> <span style="color: #7c3aed; font-weight: bold;">${status}</span></p>
  `;
  return getTransactionalEmail(
    "Application Status Update",
    content,
    "View Application",
    `${APP_URL}/jobs/${jobId}`,
    true
  );
};

export const getPasswordResetEmail = (resetLink: string) => {
  const content = `
    <p>You have requested to reset your password.</p>
    <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;
  return getTransactionalEmail(
    "Reset Your Password",
    content,
    "Reset Password",
    resetLink,
    false
  );
};

export const getPasswordChangedEmail = (name: string) => {
  const content = `
    <p>Hi ${name},</p>
    <p>Your password has been successfully changed.</p>
    <p>If you did not make this change, please contact support immediately.</p>
  `;
  return getTransactionalEmail(
    "Password Changed",
    content,
    "Go to Dashboard",
    `${APP_URL}/dashboard`,
    false
  );
};


export const projectFundedEmail = (scientistName: string, projectTitle: string, projectId: string) => {
  const content = `
    <p>Hi ${scientistName},</p>
    <p>Great news! The project <strong>${projectTitle}</strong> has been funded by the employer.</p>
    <p>You can now start working on the project tasks.</p>
  `;
  return getTransactionalEmail(
    "Project Funded",
    content,
    "Go to Project",
    `${APP_URL}/scientist/projects/${projectId}`,
    true
  );
};

export const projectFundingConfirmedEmail = (employerName: string, projectTitle: string, projectId: string) => {
  const content = `
    <p>Hi ${employerName},</p>
    <p>Your payment for <strong>${projectTitle}</strong> has been successfully processed and the project is now active.</p>
  `;
  return getTransactionalEmail(
    "Payment Confirmed",
    content,
    "Go to Project",
    `${APP_URL}/employer/projects/${projectId}`,
    false
  );
};

export const projectCompletedEmail = (employerName: string, projectTitle: string, scientistName: string, projectId: string) => {
  const content = `
    <p>Hi ${employerName},</p>
    <p><strong>${scientistName}</strong> has marked the project <strong>${projectTitle}</strong> as complete.</p>
    <p>Please review the work and confirm completion to release the payment.</p>
  `;
  return getTransactionalEmail(
    "Project Marked as Complete",
    content,
    "Review Project",
    `${APP_URL}/employer/projects/${projectId}`,
    true
  );
};

export const projectConfirmationEmail = (userName: string, projectTitle: string, projectId: string) => {
  const content = `
    <p>Hi ${userName},</p>
    <p>The project <strong>${projectTitle}</strong> has been officially confirmed as complete.</p>
    <p>Payments have been released.</p>
  `;
  return getTransactionalEmail(
    "Project Completed",
    content,
    "View Project",
    `${APP_URL}/projects/${projectId}`,
    true
  );
};

export const applicationRejectedEmail = (applicantName: string, jobTitle: string) => {
    const content = `
      <p>Hi ${applicantName},</p>
      <p>Thank you for your interest in the <strong>${jobTitle}</strong> position.</p>
      <p>Unfortunately, the employer has decided to move forward with another candidate for this role.</p>
      <p>We encourage you to check out other opportunities on our marketplace.</p>
    `;
    return getTransactionalEmail(
      "Application Update",
      content,
      "View More Jobs",
      `${APP_URL}/jobs`,
      false
    );
  };

export const newJobAlertEmail = (scientistName: string, jobTitle: string, jobId: string) => {
  const content = `
    <p>Hi ${scientistName},</p>
    <p>A new job matching your interests has just been posted: <strong>${jobTitle}</strong>.</p>
    <p>Be among the first to apply!</p>
  `;
  return getTransactionalEmail(
    "New Job Alert",
    content,
    "View Job",
    `${APP_URL}/jobs/${jobId}`,
    true
  );
};


export const employerMessageEmail = (applicantName: string, employerName: string, jobTitle: string, conversationId: string) => {
  const content = `
    <p>Hi ${applicantName},</p>
    <p><strong>${employerName}</strong>, the employer for <strong>${jobTitle}</strong>, has sent you a message to ask a few questions about your application.</p>
    <p>Please log in to respond and continue the conversation.</p>
  `;
  return getTransactionalEmail(
    "New Message from Employer",
    content,
    "Go to Messages",
    `${APP_URL}/messages?id=${conversationId}`,
    true
  );
};

export const projectInvitationEmail = (inviteeName: string, inviterName: string, projectTitle: string, projectId: string) => {
  const content = `
    <p>Hi ${inviteeName},</p>
    <p><strong>${inviterName}</strong> has invited you to collaborate on the project <strong>${projectTitle}</strong>.</p>
    <p>Click the button below to view the project details and join the team.</p>
  `;
  return getTransactionalEmail(
    "Project Collaboration Invitation",
    content,
    "View Project",
    `${APP_URL}/project/${projectId}`,
    true
  );
};
