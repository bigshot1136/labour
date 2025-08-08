import sgMail from '@sendgrid/mail'
import { msg91Service } from '../msg91'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  templateId?: string
  templateData?: any
}

export interface SMSOptions {
  to: string
  message: string
}

export interface WhatsAppOptions {
  to: string
  message: string
  templateName?: string
  templateParams?: any
}

export class MessagingService {
  // Email service using SendGrid
  static async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log(`📧 [DEV MODE] Email to ${options.to}: ${options.subject}`)
        return { success: true }
      }

      const msg = {
        to: options.to,
        from: process.env.FROM_EMAIL || 'noreply@labourchowk.com',
        subject: options.subject,
        text: options.text,
        html: options.html,
        templateId: options.templateId,
        dynamicTemplateData: options.templateData
      }

      const [response] = await sgMail.send(msg)
      
      return {
        success: true,
        messageId: response.headers['x-message-id']
      }
    } catch (error: any) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email'
      }
    }
  }

  // SMS service using MSG91
  static async sendSMS(options: SMSOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      return await msg91Service.sendSMS(options.to, options.message)
    } catch (error: any) {
      console.error('SMS sending failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      }
    }
  }

  // WhatsApp service using MSG91
  static async sendWhatsApp(options: WhatsAppOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // For now, use SMS service as fallback
      // In production, implement proper WhatsApp Business API
      return await this.sendSMS({
        to: options.to,
        message: options.message
      })
    } catch (error: any) {
      console.error('WhatsApp sending failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message'
      }
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
    const subject = `Welcome to Labour Chowk, ${name}!`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Welcome to Labour Chowk!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for joining Labour Chowk as a ${role}. We're excited to have you on board!</p>
        <p>Here's what you can do next:</p>
        <ul>
          ${role === 'labourer' ? `
            <li>Complete your profile with skills and experience</li>
            <li>Upload your documents for verification</li>
            <li>Set your availability and rates</li>
            <li>Start applying for jobs</li>
          ` : `
            <li>Complete your profile information</li>
            <li>Post your first job</li>
            <li>Browse skilled labourers in your area</li>
            <li>Start hiring for your projects</li>
          `}
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Labour Chowk Team</p>
      </div>
    `

    await this.sendEmail({
      to: email,
      subject,
      html
    })
  }

  // Send job application notification
  static async sendJobApplicationNotification(contractorEmail: string, jobTitle: string, labourerName: string): Promise<void> {
    const subject = `New Application for "${jobTitle}"`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">New Job Application</h1>
        <p>You have received a new application for your job posting:</p>
        <p><strong>Job:</strong> ${jobTitle}</p>
        <p><strong>Applicant:</strong> ${labourerName}</p>
        <p>Please log in to your dashboard to review the application and respond to the candidate.</p>
        <p>Best regards,<br>The Labour Chowk Team</p>
      </div>
    `

    await this.sendEmail({
      to: contractorEmail,
      subject,
      html
    })
  }

  // Send contract notification
  static async sendContractNotification(email: string, contractorName: string, jobTitle: string): Promise<void> {
    const subject = `Contract Ready for "${jobTitle}"`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Contract Ready for Signature</h1>
        <p>A contract has been prepared for you:</p>
        <p><strong>Job:</strong> ${jobTitle}</p>
        <p><strong>Contractor:</strong> ${contractorName}</p>
        <p>Please log in to your dashboard to review and sign the contract.</p>
        <p>Best regards,<br>The Labour Chowk Team</p>
      </div>
    `

    await this.sendEmail({
      to: email,
      subject,
      html
    })
  }

  // Send payment notification
  static async sendPaymentNotification(email: string, amount: number, type: string): Promise<void> {
    const subject = `Payment ${type === 'completed' ? 'Received' : 'Pending'}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Payment ${type === 'completed' ? 'Received' : 'Notification'}</h1>
        <p>Payment details:</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Status:</strong> ${type === 'completed' ? 'Completed' : 'Pending'}</p>
        ${type === 'completed' ? 
          '<p>The payment has been successfully processed and credited to your account.</p>' :
          '<p>Please complete the payment to proceed with the contract.</p>'
        }
        <p>Best regards,<br>The Labour Chowk Team</p>
      </div>
    `

    await this.sendEmail({
      to: email,
      subject,
      html
    })
  }
}