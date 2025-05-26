"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_ses_1 = require("@aws-sdk/client-ses");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.templates = new Map();
        this.ses = new client_ses_1.SESClient({
            region: this.configService.get('aws.region'),
            credentials: {
                accessKeyId: this.configService.get('aws.accessKeyId'),
                secretAccessKey: this.configService.get('aws.secretAccessKey'),
            },
        });
        this.sourceEmail = this.configService.get('aws.ses.sourceEmail');
        this.loadTemplates();
    }
    loadTemplates() {
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
            }
            else {
                this.logger.warn(`Templates directory not found: ${templatesDir}`);
            }
        }
        catch (error) {
            this.logger.error(`Error loading templates: ${error.message}`);
        }
    }
    async sendEmail(options) {
        const { to, subject, text, html, template, templateData, from, cc, bcc } = options;
        try {
            let htmlContent = html;
            if (template && this.templates.has(template)) {
                const compiledTemplate = this.templates.get(template);
                htmlContent = compiledTemplate(templateData || {});
            }
            const params = {
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
                    Body: Object.assign({ Text: {
                            Data: text || this.getTextFromHtml(htmlContent),
                        } }, (htmlContent ? {
                        Html: {
                            Data: htmlContent,
                        },
                    } : {})),
                },
            };
            const command = new client_ses_1.SendEmailCommand(params);
            await this.ses.send(command);
            this.logger.log(`Email sent to ${Array.isArray(to) ? to.join(', ') : to} with subject: ${subject}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            throw error;
        }
    }
    async sendTemplatedEmail(options) {
        const { to, templateName, templateData, subject, from, cc, bcc } = options;
        try {
            const params = {
                Source: from || this.sourceEmail,
                Destination: {
                    ToAddresses: Array.isArray(to) ? to : [to],
                    CcAddresses: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
                    BccAddresses: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
                },
                Template: templateName,
                TemplateData: JSON.stringify(templateData),
            };
            const command = new client_ses_1.SendTemplatedEmailCommand(params);
            await this.ses.send(command);
            this.logger.log(`Templated email sent to ${Array.isArray(to) ? to.join(', ') : to} using template: ${templateName}`);
        }
        catch (error) {
            this.logger.error(`Failed to send templated email: ${error.message}`);
            throw error;
        }
    }
    async sendBulkTemplatedEmail(options) {
        const { destinations, templateName, subject, from } = options;
        try {
            const params = {
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
            const command = new client_ses_1.SendBulkTemplatedEmailCommand(params);
            await this.ses.send(command);
            this.logger.log(`Bulk templated email sent to ${destinations.length} recipients using template: ${templateName}`);
        }
        catch (error) {
            this.logger.error(`Failed to send bulk templated email: ${error.message}`);
            throw error;
        }
    }
    getTextFromHtml(html) {
        if (!html)
            return '';
        return html
            .replace(/<style[^>]*>.*<\/style>/g, '')
            .replace(/<script[^>]*>.*<\/script>/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map