/**
 * メール通知プロバイダーインターフェース
 * 
 * 複数のメールプロバイダー（SendGrid, SES, SMTP等）を統一インターフェースで扱うための抽象化レイヤー
 */

import { HotelLogger } from '../../utils/logger'

/**
 * メール送信設定
 */
export interface EmailConfig {
  provider: 'sendgrid' | 'ses' | 'smtp'
  from: string
  apiKey?: string
  region?: string
  host?: string
  port?: number
  secure?: boolean
  username?: string
  password?: string
}

/**
 * メール送信データ
 */
export interface EmailData {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  html?: boolean
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

/**
 * メール送信結果
 */
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  provider: string
}

/**
 * メールプロバイダー基底クラス
 */
export abstract class EmailProvider {
  protected logger = HotelLogger.getInstance()
  protected config: EmailConfig
  
  constructor(config: EmailConfig) {
    this.config = config
  }
  
  /**
   * メール送信抽象メソッド
   */
  abstract sendEmail(data: EmailData): Promise<EmailResult>
}

/**
 * SendGridプロバイダー
 */
export class SendGridProvider extends EmailProvider {
  private client: any
  
  constructor(config: EmailConfig) {
    super(config)
    
    if (!config.apiKey) {
      throw new Error('SendGrid API key is required')
    }
    
    try {
      // SendGridクライアント初期化
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(config.apiKey)
      this.client = sgMail
      
      this.logger.info('SendGrid provider initialized')
    } catch (error: Error) {
      this.logger.error('Failed to initialize SendGrid client', { error: error instanceof Error ? error : new Error(String(error)) })
      throw new Error('SendGrid initialization failed')
    }
  }
  
  /**
   * SendGridでメール送信
   */
  async sendEmail(data: EmailData): Promise<EmailResult> {
    try {
      const msg = {
        to: data.to,
        from: this.config.from,
        subject: data.subject,
        text: !data.html ? data.body : undefined,
        html: data.html ? data.body : undefined,
        cc: data.cc,
        bcc: data.bcc,
        attachments: data.attachments?.map(attachment => ({
          filename: attachment.filename,
          content: Buffer.isBuffer(attachment.content) 
            ? attachment.content.toString('base64')
            : Buffer.from(attachment.content).toString('base64'),
          type: attachment.contentType || 'application/octet-stream',
          disposition: 'attachment'
        }))
      }
      
      const response = await this.client.send(msg)
      
      this.logger.info('Email sent via SendGrid', { 
        data: {
          to: data.to, 
          subject: data.subject,
          messageId: response[0]?.headers['x-message-id']
        }
      })
      
      return {
        success: true,
        messageId: response[0]?.headers['x-message-id'],
        provider: 'sendgrid'
      }
    } catch (error: Error) {
      this.logger.error('Failed to send email via SendGrid', { error: error instanceof Error ? error : new Error(String(error)) })
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        provider: 'sendgrid'
      }
    }
  }
}

/**
 * AWS SESプロバイダー
 */
export class SESProvider extends EmailProvider {
  private client: any
  
  constructor(config: EmailConfig) {
    super(config)
    
    if (!config.region) {
      throw new Error('AWS region is required for SES')
    }
    
    try {
      // AWS SDK初期化
      const AWS = require('aws-sdk')
      this.client = new AWS.SES({
        apiVersion: '2010-12-01',
        region: config.region
      })
      
      this.logger.info('AWS SES provider initialized')
    } catch (error: Error) {
      this.logger.error('Failed to initialize AWS SES client', { error: error instanceof Error ? error : new Error(String(error)) })
      throw new Error('AWS SES initialization failed')
    }
  }
  
  /**
   * AWS SESでメール送信
   */
  async sendEmail(data: EmailData): Promise<EmailResult> {
    try {
      // 添付ファイルがある場合はSESのSendRawEmailを使用
      if (data.attachments && data.attachments.length > 0) {
        return await this.sendRawEmail(data)
      }
      
      // 通常のメール送信
      const params = {
        Source: this.config.from,
        Destination: {
          ToAddresses: data.to,
          CcAddresses: data.cc || [],
          BccAddresses: data.bcc || []
        },
        Message: {
          Subject: {
            Data: data.subject,
            Charset: 'UTF-8'
          },
          Body: {
            Text: {
              Data: !data.html ? data.body : '',
              Charset: 'UTF-8'
            },
            Html: data.html ? {
              Data: data.body,
              Charset: 'UTF-8'
            } : undefined
          }
        }
      }
      
      const response = await this.client.sendEmail(params).promise()
      
      this.logger.info('Email sent via AWS SES', { 
        data: {
          to: data.to, 
          subject: data.subject,
          messageId: response.MessageId
        }
      })
      
      return {
        success: true,
        messageId: response.MessageId,
        provider: 'ses'
      }
    } catch (error: Error) {
      this.logger.error('Failed to send email via AWS SES', { error: error instanceof Error ? error : new Error(String(error)) })
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        provider: 'ses'
      }
    }
  }
  
  /**
   * 添付ファイル付きメール送信（SES Raw Email API）
   */
  private async sendRawEmail(data: EmailData): Promise<EmailResult> {
    try {
      // nodemailerを使用してMIMEメッセージを作成
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({
        SES: this.client
      })
      
      const mailOptions = {
        from: this.config.from,
        to: data.to.join(', '),
        cc: data.cc?.join(', '),
        bcc: data.bcc?.join(', '),
        subject: data.subject,
        text: !data.html ? data.body : undefined,
        html: data.html ? data.body : undefined,
        attachments: data.attachments
      }
      
      const response = await transporter.sendMail(mailOptions)
      
      this.logger.info('Raw email sent via AWS SES', { 
        data: {
          to: data.to, 
          subject: data.subject,
          messageId: response.messageId
        }
      })
      
      return {
        success: true,
        messageId: response.messageId,
        provider: 'ses'
      }
    } catch (error: Error) {
      this.logger.error('Failed to send raw email via AWS SES', { error: error instanceof Error ? error : new Error(String(error)) })
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        provider: 'ses'
      }
    }
  }
}

/**
 * SMTPプロバイダー
 */
export class SMTPProvider extends EmailProvider {
  private transporter: any
  
  constructor(config: EmailConfig) {
    super(config)
    
    if (!config.host || !config.port) {
      throw new Error('SMTP host and port are required')
    }
    
    try {
      // nodemailerトランスポーター初期化
      const nodemailer = require('nodemailer')
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure || false,
        auth: config.username ? {
          user: config.username,
          pass: config.password
        } : undefined
      })
      
      this.logger.info('SMTP provider initialized')
    } catch (error: Error) {
      this.logger.error('Failed to initialize SMTP client', { error: error instanceof Error ? error : new Error(String(error)) })
      throw new Error('SMTP initialization failed')
    }
  }
  
  /**
   * SMTPでメール送信
   */
  async sendEmail(data: EmailData): Promise<EmailResult> {
    try {
      const mailOptions = {
        from: this.config.from,
        to: data.to.join(', '),
        cc: data.cc?.join(', '),
        bcc: data.bcc?.join(', '),
        subject: data.subject,
        text: !data.html ? data.body : undefined,
        html: data.html ? data.body : undefined,
        attachments: data.attachments
      }
      
      const info = await this.transporter.sendMail(mailOptions)
      
      this.logger.info('Email sent via SMTP', { 
        data: {
          to: data.to, 
          subject: data.subject,
          messageId: info.messageId
        }
      })
      
      return {
        success: true,
        messageId: info.messageId,
        provider: 'smtp'
      }
    } catch (error: Error) {
      this.logger.error('Failed to send email via SMTP', { error: error instanceof Error ? error : new Error(String(error)) })
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        provider: 'smtp'
      }
    }
  }
}

/**
 * メールプロバイダーファクトリー
 */
export function createEmailProvider(config: EmailConfig): EmailProvider {
  switch (config.provider) {
    case 'sendgrid':
      return new SendGridProvider(config)
    case 'ses':
      return new SESProvider(config)
    case 'smtp':
      return new SMTPProvider(config)
    default:
      throw new Error(`Unsupported email provider: ${config.provider}`)
  }
}