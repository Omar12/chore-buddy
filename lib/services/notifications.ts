/**
 * Email notification service (stub implementation)
 * This can be extended to integrate with services like SendGrid, Resend, or AWS SES
 */

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

/**
 * Send an email notification
 * Currently a stub - implement with your preferred email service
 */
export async function sendEmail(notification: EmailNotification): Promise<boolean> {
  // In production, integrate with an email service
  // For now, just log the notification
  console.log('📧 Email notification (stub):', {
    to: notification.to,
    subject: notification.subject,
    preview: notification.body.substring(0, 100),
  });

  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));

  return true;
}

/**
 * Notify parents when a child marks a chore as done
 */
export async function notifyChoreCompleted(
  parentEmails: string[],
  childName: string,
  choreTitle: string
): Promise<void> {
  const subject = `${childName} completed a chore`;
  const body = `${childName} has marked "${choreTitle}" as done and it's now pending your review.`;
  const html = `
    <h2>Chore Completed!</h2>
    <p><strong>${childName}</strong> has marked <strong>"${choreTitle}"</strong> as done.</p>
    <p>Please review and approve to award points.</p>
  `;

  await Promise.all(
    parentEmails.map(email =>
      sendEmail({ to: email, subject, body, html })
    )
  );
}

/**
 * Notify parents when a child requests a reward redemption
 */
export async function notifyRewardRequested(
  parentEmails: string[],
  childName: string,
  rewardName: string,
  pointsCost: number
): Promise<void> {
  const subject = `${childName} requested a reward`;
  const body = `${childName} wants to redeem "${rewardName}" for ${pointsCost} points.`;
  const html = `
    <h2>Reward Request!</h2>
    <p><strong>${childName}</strong> wants to redeem <strong>"${rewardName}"</strong> for <strong>${pointsCost} points</strong>.</p>
    <p>Please review and approve their request.</p>
  `;

  await Promise.all(
    parentEmails.map(email =>
      sendEmail({ to: email, subject, body, html })
    )
  );
}

/**
 * Notify child when a chore is approved and points are awarded
 */
export async function notifyPointsAwarded(
  childEmail: string | null,
  pointsEarned: number,
  choreTitle: string
): Promise<void> {
  // Kids might not have email, skip if not provided
  if (!childEmail) return;

  const subject = `You earned ${pointsEarned} points!`;
  const body = `Great job! You earned ${pointsEarned} points for completing "${choreTitle}".`;
  const html = `
    <h2>🎉 Points Earned!</h2>
    <p>Great job! You earned <strong>${pointsEarned} points</strong> for completing <strong>"${choreTitle}"</strong>.</p>
  `;

  await sendEmail({ to: childEmail, subject, body, html });
}

/**
 * Notify child when a reward redemption is approved
 */
export async function notifyRewardApproved(
  childEmail: string | null,
  rewardName: string
): Promise<void> {
  // Kids might not have email, skip if not provided
  if (!childEmail) return;

  const subject = `Your reward "${rewardName}" is ready!`;
  const body = `Your reward "${rewardName}" has been approved! Enjoy!`;
  const html = `
    <h2>🎁 Reward Approved!</h2>
    <p>Your reward <strong>"${rewardName}"</strong> has been approved! Enjoy!</p>
  `;

  await sendEmail({ to: childEmail, subject, body, html });
}
