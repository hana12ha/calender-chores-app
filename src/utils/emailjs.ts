import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser'
import type { EmailConfig } from '../types'

interface SendReminderEmailParams {
  emailConfig: EmailConfig | null
  toName: string
  toEmail: string
  choreTitle: string
  dueDate: string
  dueTime: string
  note?: string
}

/**
 * Send a reminder email via EmailJS.
 * Requires the emailConfig to have serviceId, templateId, and publicKey set.
 */
export const sendReminderEmail = async ({
  emailConfig,
  toName,
  toEmail,
  choreTitle,
  dueDate,
  dueTime,
  note = '',
}: SendReminderEmailParams): Promise<EmailJSResponseStatus> => {
  const { serviceId, templateId, publicKey } = emailConfig || {}

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS is not configured. Please set up your EmailJS credentials in Settings.')
  }

  const templateParams = {
    to_name: toName,
    to_email: toEmail,
    chore_title: choreTitle,
    due_date: dueDate,
    due_time: dueTime,
    note,
  }

  try {
    const result = await emailjs.send(serviceId, templateId, templateParams, publicKey)
    return result
  } catch (err) {
    console.error('EmailJS error:', err)
    const emailErr = err as { text?: string }
    throw new Error(emailErr?.text || 'Failed to send email. Check your EmailJS credentials.')
  }
}
