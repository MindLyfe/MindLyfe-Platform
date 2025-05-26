#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvOrExit = validateEnvOrExit;
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const env_validator_1 = require("../config/env.validator");
function loadEnvFile() {
    const envFiles = [
        '.env',
        `.env.${process.env.NODE_ENV || 'development'}`,
        `.env.${process.env.NODE_ENV || 'development'}.local`,
    ];
    for (const file of envFiles) {
        const filePath = path.resolve(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            console.log(`Loading environment variables from ${file}`);
            dotenv.config({ path: filePath });
        }
    }
}
function validateEnvOrExit() {
    try {
        loadEnvFile();
        const validatedConfig = (0, env_validator_1.validateEnv)(process.env);
        if (process.env.NODE_ENV === 'production') {
            const requiredFields = ['JWT_SECRET', 'DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
            for (const field of requiredFields) {
                if (!process.env[field]) {
                    console.error(`⛔ Missing critical environment variable in production: ${field}`);
                    process.exit(1);
                }
            }
            console.log('✅ Environment validation passed for production');
            console.log('🔒 Security checklist:');
            console.log('  - Use AWS Secrets Manager for sensitive values in production');
            console.log('  - Rotate credentials regularly');
            console.log('  - Ensure database connections use SSL');
            console.log('  - Set up proper VPC and security groups');
        }
        else {
            console.log('✅ Environment validation passed for development');
        }
    }
    catch (error) {
        console.error('❌ Environment validation failed:', error.message);
        if (error.details) {
            error.details.forEach((detail) => {
                console.error(`- ${detail.message}`);
            });
        }
        process.exit(1);
    }
}
if (require.main === module) {
    validateEnvOrExit();
}
//# sourceMappingURL=validate-env.js.map