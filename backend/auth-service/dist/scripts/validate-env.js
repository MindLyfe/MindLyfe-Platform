#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvOrExit = validateEnvOrExit;
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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