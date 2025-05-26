import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  SESClient, 
  SendEmailCommand, 
  SendEmailCommandInput, 
  SendTemplatedEmailCommand,
  SendTemplatedEmailCommandInput,
  SendBulkTemplatedEmailCommand,
  SendBulkTemplatedEmailCommandInput
} from '@aws-sdk/client-ses';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  templateData?: Record<string, any>;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

@Injectable()
export class EmailService {
  private readonly ses: SESClient;
  private readonly sourceEmail: string;
  private readonly logger = new Logger(EmailService.name);
  private readonly templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.ses = new SESClient({
      region: this.configService.get<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId'),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
      },
    });
    
    this.sourceEmail = this.configService.get<string>('aws.ses.sourceEmail');
    
    // Initialize templates
    this.loadTemplates();
  }

  private loadTemplates(): void {
    const templatesDir = path.join(__dirname, '..', 'templates');
    
    try {
      if (fs.existsSync(templatesDir)) {
        const templateFiles = fs.readdirSync(templatesDir);
        
        templateFiles.forEach((file) => {
          if (file.endsWith('.hbs')) {
            const templateName = file.replace('.hbs', '');
            const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
            const compiledTemplate = handlebars.compile(templateContent);
            
            this.templates.set(templateName, compiledTemplate);
            this.logger.log(`Loaded email template: ${templateName}`);
          }
        });
      } else {
        this.logger.warn(`Templates directory not found: ${templatesDir}`);
      }
    } catch (error) {
      this.logger.error(`Error loading templates: ${error.message}`);
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, text, html, template, templateData, from, cc, bcc } = options;
    
    try {
      let htmlContent = html;
      
      // If template is specified, use it to generate HTML content
      if (template && this.templates.has(template)) {
        const compiledTemplate = this.templates.get(template);
        htmlContent = compiledTemplate(templateData || {});
      }
      
      const params: SendEmailCommandInput = {
        Source: from || this.sourceEmail,
        Destination: {
          ToAddresses: Array.isArray(to) ? to : [to],
          CcAddresses: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
          BccAddresses: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        },
        Message: {
          Subject: {
            Data: subject,
          },
          Body: {
            Text: {
              Data: text || this.getTextFromHtml(htmlContent),
            },
            ...(htmlContent ? {
              Html: {
                Data: htmlContent,
              },
            } : {}),
          },
        },
      };
      
      const command = new SendEmailCommand(params);
      await this.ses.send(command);
      
      this.logger.log(`Email sent to ${Array.isArray(to) ? to.join(', ') : to} with subject: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  async sendTemplatedEmail(options: {
    to: string | string[];
    templateName: string;
    templateData: Record<string, any>;
    subject?: string;
    from?: string;
    cc?: string | string[];
    bcc?: string | string[];
  }): Promise<void> {
    const { to, templateName, templateData, subject, from, cc, bcc } = options;
    
    try {
      const params: SendTemplatedEmailCommandInput = {
        Source: from || this.sourceEmail,
        Destination: {
          ToAddresses: Array.isArray(to) ? to : [to],
          CcAddresses: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
          BccAddresses: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        },
        Template: templateName,
        TemplateData: JSON.stringify(templateData),
      };
      
      const command = new SendTemplatedEmailCommand(params);
      await this.ses.send(command);
      
      this.logger.log(`Templated email sent to ${Array.isArray(to) ? to.join(', ') : to} using template: ${templateName}`);
    } catch (error) {
      this.logger.error(`Failed to send templated email: ${error.message}`);
      throw error;
    }
  }

  async sendBulkTemplatedEmail(options: {
    destinations: Array<{
      to: string;
      templateData: Record<string, any>;
    }>;
    templateName: string;
    subject?: string;
    from?: string;
  }): Promise<void> {
    const { destinations, templateName, subject, from } = options;
    
    try {
      const params: SendBulkTemplatedEmailCommandInput = {
        Source: from || this.sourceEmail,
        Template: templateName,
        DefaultTemplateData: JSON.stringify({}),
        Destinations: destinations.map((dest) => ({
          Destination: {
            ToAddresses: [dest.to],
          },
          ReplacementTemplateData: JSON.stringify(dest.templateData),
        })),
      };
      
      const command = new SendBulkTemplatedEmailCommand(params);
      await this.ses.send(command);
      
      this.logger.log(`Bulk templated email sent to ${destinations.length} recipients using template: ${templateName}`);
    } catch (error) {
      this.logger.error(`Failed to send bulk templated email: ${error.message}`);
      throw error;
    }
  }

  private getTextFromHtml(html: string): string {
    // Basic HTML to text conversion
    if (!html) return '';
    return html
      .replace(/<style[^>]*>.*<\/style>/g, '')
      .replace(/<script[^>]*>.*<\/script>/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
} 