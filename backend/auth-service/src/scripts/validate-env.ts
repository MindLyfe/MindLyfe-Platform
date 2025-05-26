#!/usr/bin/env node
/**
 * Environment variable validation script.
 * This script validates that all required environment variables are set
 * before starting the application. It uses the same validation schema
 * defined in env.validator.ts.
 * 
 * Usage: 
 * - npm run validate:env
 * - Or import and use validateEnvOrExit in your application
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { validateEnv, envValidationSchema } from '../config/env.validator';

// Load environment variables from .env file if exists
function loadEnvFile() {
  const envFiles = [
    '.env',                                  // Default
    `.env.${process.env.NODE_ENV || 'development'}`,  // Environment-specific
    `.env.${process.env.NODE_ENV || 'development'}.local`,  // Local overrides
  ];

  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`Loading environment variables from ${file}`);
      dotenv.config({ path: filePath });
    }
  }
}

/**
 * Validates environment variables and exits if validation fails.
 * This function is useful for integrating into application startup.
 */
export function validateEnvOrExit(): void {
  try {
    // Load environment files
    loadEnvFile();
    
    // Validate environment variables
    const validatedConfig = validateEnv(process.env);
    
    // Production warning about defaults
    if (process.env.NODE_ENV === 'production') {
      const requiredFields = ['JWT_SECRET', 'DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
      
      for (const field of requiredFields) {
        if (!process.env[field]) {
          console.error(`⛔ Missing critical environment variable in production: ${field}`);
          process.exit(1);
        }
      }
      
      // Production security guidelines
      console.log('✅ Environment validation passed for production');
      console.log('🔒 Security checklist:');
      console.log('  - Use AWS Secrets Manager for sensitive values in production');
      console.log('  - Rotate credentials regularly');
      console.log('  - Ensure database connections use SSL');
      console.log('  - Set up proper VPC and security groups');
    } else {
      console.log('✅ Environment validation passed for development');
    }
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    
    // Display all validation errors
    if (error.details) {
      error.details.forEach((detail) => {
        console.error(`- ${detail.message}`);
      });
    }
    
    process.exit(1);
  }
}

// If called directly as a script, run validation and exit
if (require.main === module) {
  validateEnvOrExit();
} 