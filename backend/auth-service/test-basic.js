#!/usr/bin/env node

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

async function testHealthCheck() {
  log('\n🏥 Testing Health Check...', 'cyan');
  
  const result = await apiRequest('GET', '/health/ping');
  if (result.success) {
    logSuccess('Health check passed');
    logInfo(`Response: ${JSON.stringify(result.data)}`);
    return true;
  } else {
    logError(`Health check failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testBasicAuth() {
  log('\n🔐 Testing Basic Auth...', 'cyan');
  
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '+256700000001'
  };
  
  // Test registration
  logInfo('Testing user registration...');
  const registerResult = await apiRequest('POST', '/auth/register', testUser);
  if (registerResult.success) {
    logSuccess('User registration successful');
    logInfo(`User ID: ${registerResult.data.userId}`);
  } else {
    logError(`Registration failed: ${JSON.stringify(registerResult.error)}`);
    return false;
  }
  
  // Test login
  logInfo('Testing user login...');
  const loginResult = await apiRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (loginResult.success) {
    logSuccess('User login successful');
    logInfo(`Access token received: ${loginResult.data.accessToken ? 'Yes' : 'No'}`);
    return loginResult.data.accessToken;
  } else {
    logError(`Login failed: ${JSON.stringify(loginResult.error)}`);
    return false;
  }
}

async function runBasicTests() {
  log('🚀 Starting Basic Auth Service Tests', 'cyan');
  log('=' * 50, 'cyan');
  
  const startTime = Date.now();
  
  // Test health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    logError('Health check failed, stopping tests');
    return;
  }
  
  // Test basic auth
  const token = await testBasicAuth();
  if (!token) {
    logError('Basic auth failed');
    return;
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  log('\n' + '=' * 50, 'cyan');
  log('📊 Basic Tests Completed', 'cyan');
  log(`⏱️  Duration: ${duration.toFixed(2)}s`, 'blue');
  logSuccess('Basic auth functionality is working!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runBasicTests().catch(error => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runBasicTests }; 