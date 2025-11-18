import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface EmailNotification {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

export async function sendEmail(notification: EmailNotification) {
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const html = getEmailTemplate(notification.template, notification.data)

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'liteBuilders <noreply@litebuilders.com>',
      to: notification.to,
      subject: notification.subject,
      html,
    })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

function getEmailTemplate(template: string, data: Record<string, any>): string {
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
      .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    </style>
  `

  switch (template) {
    case 'submission_received':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Submission Received!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>We've received your submission for <strong>${data.challengeTitle}</strong>.</p>
            <p>Your submission is now being evaluated by our LLM scoring pipeline. This typically takes 1-2 minutes.</p>
            <p><strong>Submission Details:</strong></p>
            <ul>
              <li>Repository: <a href="${data.repoUrl}">${data.repoUrl}</a></li>
              <li>Submitted: ${new Date(data.submittedAt).toLocaleString()}</li>
            </ul>
            <a href="${data.challengeUrl}" class="button">View Challenge</a>
            <p>You'll receive another email once your score is ready!</p>
            <p>Best of luck,<br/>The liteBuilders Team</p>
          </div>
          <div class="footer">
            <p>© 2025 liteBuilders. Building the future of AI talent.</p>
          </div>
        </div>
      `

    case 'score_ready':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Your Score is Ready!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Great news! Your submission for <strong>${data.challengeTitle}</strong> has been scored.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="font-size: 14px; color: #6b7280; margin: 0;">Your Score</p>
              <p style="font-size: 48px; font-weight: bold; color: #667eea; margin: 10px 0;">${data.score}/100</p>
            </div>
            <p><strong>Score Breakdown:</strong></p>
            <ul>
              ${Object.entries(data.rubricScores || {}).map(([key, value]) => `
                <li>${key}: ${value} points</li>
              `).join('')}
            </ul>
            <a href="${data.leaderboardUrl}" class="button">View Leaderboard</a>
            <a href="${data.profileUrl}" style="margin-left: 10px;" class="button">View Your Profile</a>
            <p>Keep building amazing projects!</p>
            <p>Best,<br/>The liteBuilders Team</p>
          </div>
          <div class="footer">
            <p>© 2025 liteBuilders. Building the future of AI talent.</p>
          </div>
        </div>
      `

    case 'badge_awarded':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>🏆 You Earned a Badge!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Congratulations! You've earned a new badge:</p>
            <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <div style="font-size: 64px; margin-bottom: 10px;">${data.badgeIcon}</div>
              <h2 style="color: #667eea; margin: 10px 0;">${data.badgeName}</h2>
              <p style="color: #6b7280;">${data.badgeDescription}</p>
            </div>
            ${data.challengeTitle ? `<p>This badge was awarded for your submission to <strong>${data.challengeTitle}</strong>.</p>` : ''}
            <a href="${data.profileUrl}" class="button">View Your Profile</a>
            <p>Keep up the great work!</p>
            <p>Best,<br/>The liteBuilders Team</p>
          </div>
          <div class="footer">
            <p>© 2025 liteBuilders. Building the future of AI talent.</p>
          </div>
        </div>
      `

    case 'judge_review_complete':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Judge Review Complete</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>A judge has completed reviewing your submission for <strong>${data.challengeTitle}</strong>.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Judge Score:</strong> ${data.judgeScore}/100</p>
              ${data.feedback ? `<p><strong>Feedback:</strong></p><p style="font-style: italic;">"${data.feedback}"</p>` : ''}
              ${data.isSponsorFavorite ? `<p style="color: #667eea; font-weight: bold;">⭐ Marked as Sponsor Favorite!</p>` : ''}
            </div>
            <a href="${data.challengeUrl}" class="button">View Full Results</a>
            <p>Thank you for participating!</p>
            <p>Best,<br/>The liteBuilders Team</p>
          </div>
          <div class="footer">
            <p>© 2025 liteBuilders. Building the future of AI talent.</p>
          </div>
        </div>
      `

    default:
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>liteBuilders Notification</h1>
          </div>
          <div class="content">
            <p>You have a new notification from liteBuilders.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Visit liteBuilders</a>
          </div>
          <div class="footer">
            <p>© 2025 liteBuilders. Building the future of AI talent.</p>
          </div>
        </div>
      `
  }
}

export async function queueEmail(
  userId: string,
  email: string,
  subject: string,
  templateName: string,
  templateData: Record<string, any>
) {
  // This function would be called from server-side code to queue an email
  // In production, you'd queue this in the database and have a worker process it
  try {
    const result = await sendEmail({
      to: email,
      subject,
      template: templateName,
      data: templateData,
    })

    return result
  } catch (error) {
    console.error('Error queueing email:', error)
    return { success: false, error: 'Failed to queue email' }
  }
}
