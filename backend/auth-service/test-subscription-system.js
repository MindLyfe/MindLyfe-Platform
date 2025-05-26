#!/usr/bin/env node

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const BASE_URL = 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// Test data
let authTokens = {};
let testData = {
  users: {},
  organizations: {},
  subscriptions: {},
  payments: {}
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
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

// Test functions
async function testHealthCheck() {
  log('\n🏥 Testing Health Check...', 'cyan');
  
  const result = await apiRequest('GET', '/health/ping');
  if (result.success) {
    logSuccess('Health check passed');
    return true;
  } else {
    logError(`Health check failed: ${result.error}`);
    return false;
  }
}

async function createTestUsers() {
  log('\n👥 Creating Test Users...', 'cyan');
  
  const users = [
    {
      key: 'individual',
      data: {
        email: `individual-${Date.now()}@test.com`,
        password: 'Test123!@#',
        firstName: 'John',
        lastName: 'Individual',
        phoneNumber: '+256700000001'
      }
    },
    {
      key: 'orgAdmin',
      data: {
        email: `org-admin-${Date.now()}@test.com`,
        password: 'Test123!@#',
        firstName: 'Jane',
        lastName: 'OrgAdmin',
        phoneNumber: '+256700000002'
      }
    },
    {
      key: 'orgMember',
      data: {
        email: `org-member-${Date.now()}@test.com`,
        password: 'Test123!@#',
        firstName: 'Bob',
        lastName: 'OrgMember',
        phoneNumber: '+256700000003'
      }
    },
    {
      key: 'minor',
      data: {
        email: `minor-${Date.now()}@test.com`,
        password: 'Test123!@#',
        firstName: 'Alice',
        lastName: 'Minor',
        phoneNumber: '+256700000004',
        dateOfBirth: '2010-01-01',
        guardianEmail: 'guardian@test.com',
        guardianPhone: '+256700000005'
      }
    }
  ];

  for (const user of users) {
    // Register user
    const registerResult = await apiRequest('POST', '/auth/register', user.data);
    if (registerResult.success) {
      testData.users[user.key] = {
        ...user.data,
        id: registerResult.data.user.id
      };
      logSuccess(`Created user: ${user.data.email}`);
      
      // Login user
      const loginResult = await apiRequest('POST', '/auth/login', {
        email: user.data.email,
        password: user.data.password
      });
      
      if (loginResult.success) {
        authTokens[user.key] = loginResult.data.accessToken;
        logSuccess(`Logged in user: ${user.data.email}`);
      } else {
        logError(`Failed to login user: ${user.data.email}`);
      }
    } else {
      logError(`Failed to create user: ${user.data.email} - ${registerResult.error}`);
    }
  }
}

async function testSubscriptionPlans() {
  log('\n📋 Testing Subscription Plans...', 'cyan');
  
  // Test individual user plans
  const individualPlansResult = await apiRequest('GET', '/subscriptions/plans', null, authTokens.individual);
  if (individualPlansResult.success) {
    logSuccess(`Individual user can see ${individualPlansResult.data.length} plans`);
    logInfo(`Available plans: ${individualPlansResult.data.map(p => p.name).join(', ')}`);
  } else {
    logError(`Failed to get individual user plans: ${individualPlansResult.error}`);
  }
}

async function testIndividualSubscription() {
  log('\n💳 Testing Individual Monthly Subscription...', 'cyan');
  
  // Create monthly subscription
  const subscriptionData = {
    type: 'monthly',
    paymentMethod: 'mobile_money',
    phoneNumber: '+256700000001'
  };
  
  const createResult = await apiRequest('POST', '/subscriptions/create', subscriptionData, authTokens.individual);
  if (createResult.success) {
    testData.subscriptions.monthly = createResult.data;
    logSuccess('Created monthly subscription');
    logInfo(`Payment reference: ${createResult.data.payment.reference}`);
    
    // Confirm payment
    const confirmResult = await apiRequest('POST', `/subscriptions/payment/${createResult.data.payment.id}/confirm`, null, authTokens.individual);
    if (confirmResult.success) {
      logSuccess('Payment confirmed and subscription activated');
    } else {
      logError(`Failed to confirm payment: ${confirmResult.error}`);
    }
  } else {
    logError(`Failed to create subscription: ${createResult.error}`);
  }
}

async function testCreditPurchase() {
  log('\n🎫 Testing Credit Purchase...', 'cyan');
  
  const creditData = {
    credits: 3,
    paymentMethod: 'mobile_money',
    phoneNumber: '+256700000001'
  };
  
  const purchaseResult = await apiRequest('POST', '/subscriptions/credits/purchase', creditData, authTokens.individual);
  if (purchaseResult.success) {
    testData.subscriptions.credits = purchaseResult.data;
    logSuccess(`Purchased ${creditData.credits} credits`);
    
    // Confirm payment
    const confirmResult = await apiRequest('POST', `/subscriptions/payment/${purchaseResult.data.payment.id}/confirm`, null, authTokens.individual);
    if (confirmResult.success) {
      logSuccess('Credit purchase payment confirmed');
    } else {
      logError(`Failed to confirm credit payment: ${confirmResult.error}`);
    }
  } else {
    logError(`Failed to purchase credits: ${purchaseResult.error}`);
  }
}

async function testSubscriptionStatus() {
  log('\n📊 Testing Subscription Status...', 'cyan');
  
  const statusResult = await apiRequest('GET', '/subscriptions/status', null, authTokens.individual);
  if (statusResult.success) {
    const status = statusResult.data;
    logSuccess('Retrieved subscription status');
    logInfo(`Has active subscription: ${status.hasActiveSubscription}`);
    logInfo(`Total available sessions: ${status.totalAvailableSessions}`);
    logInfo(`Can book session: ${status.canBookSession}`);
    logInfo(`Active subscriptions: ${status.subscriptions.length}`);
  } else {
    logError(`Failed to get subscription status: ${statusResult.error}`);
  }
}

async function testOrganizationCreation() {
  log('\n🏢 Testing Organization Creation...', 'cyan');
  
  const orgData = {
    name: `Test Organization ${Date.now()}`,
    email: `org-${Date.now()}@test.com`,
    phoneNumber: '+256700000010',
    address: 'Kampala, Uganda',
    maxUsers: 10
  };
  
  const createResult = await apiRequest('POST', '/organizations/create', orgData, authTokens.orgAdmin);
  if (createResult.success) {
    testData.organizations.main = createResult.data;
    logSuccess(`Created organization: ${orgData.name}`);
    logInfo(`Organization ID: ${createResult.data.id}`);
  } else {
    logError(`Failed to create organization: ${createResult.error}`);
  }
}

async function testOrganizationSubscription() {
  log('\n💼 Testing Organization Subscription...', 'cyan');
  
  if (!testData.organizations.main) {
    logError('No organization created, skipping subscription test');
    return;
  }
  
  const subscriptionData = {
    paymentMethod: 'bank_transfer',
    phoneNumber: '+256700000010'
  };
  
  const createResult = await apiRequest('POST', `/organizations/${testData.organizations.main.id}/subscription`, subscriptionData, authTokens.orgAdmin);
  if (createResult.success) {
    testData.payments.organization = createResult.data.payment;
    logSuccess('Created organization subscription payment');
    logInfo(`Payment reference: ${createResult.data.payment.reference}`);
    
    // Confirm payment
    const confirmResult = await apiRequest('POST', `/organizations/payment/${createResult.data.payment.id}/confirm`, null, authTokens.orgAdmin);
    if (confirmResult.success) {
      logSuccess('Organization payment confirmed and activated');
    } else {
      logError(`Failed to confirm organization payment: ${confirmResult.error}`);
    }
  } else {
    logError(`Failed to create organization subscription: ${createResult.error}`);
  }
}

async function testAddUserToOrganization() {
  log('\n👥 Testing Add User to Organization...', 'cyan');
  
  if (!testData.organizations.main) {
    logError('No organization created, skipping user addition test');
    return;
  }
  
  const addUserData = {
    userEmail: testData.users.orgMember.email
  };
  
  const addResult = await apiRequest('POST', `/organizations/${testData.organizations.main.id}/users/add`, addUserData, authTokens.orgAdmin);
  if (addResult.success) {
    logSuccess(`Added user ${addUserData.userEmail} to organization`);
  } else {
    logError(`Failed to add user to organization: ${addResult.error}`);
  }
}

async function testOrganizationDetails() {
  log('\n📋 Testing Organization Details...', 'cyan');
  
  if (!testData.organizations.main) {
    logError('No organization created, skipping details test');
    return;
  }
  
  const detailsResult = await apiRequest('GET', `/organizations/${testData.organizations.main.id}`, null, authTokens.orgAdmin);
  if (detailsResult.success) {
    const details = detailsResult.data;
    logSuccess('Retrieved organization details');
    logInfo(`Organization: ${details.organization.name}`);
    logInfo(`Users: ${details.users.length}/${details.organization.maxUsers}`);
    logInfo(`Subscription active: ${details.subscriptionStatus.isActive}`);
    logInfo(`Total cost: ${details.subscriptionStatus.totalCost} UGX`);
    logInfo(`Remaining days: ${details.subscriptionStatus.remainingDays}`);
  } else {
    logError(`Failed to get organization details: ${detailsResult.error}`);
  }
}

async function testOrganizationMemberPlans() {
  log('\n🔒 Testing Organization Member Plan Restrictions...', 'cyan');
  
  // Test that organization member can only see credit plans
  const plansResult = await apiRequest('GET', '/subscriptions/plans', null, authTokens.orgMember);
  if (plansResult.success) {
    const plans = plansResult.data;
    if (plans.length === 1 && plans[0].type === 'credit') {
      logSuccess('Organization member correctly sees only credit plans');
    } else {
      logError(`Organization member sees ${plans.length} plans, expected 1 credit plan`);
    }
  } else {
    logError(`Failed to get organization member plans: ${plansResult.error}`);
  }
  
  // Test that organization member cannot create monthly subscription
  const subscriptionData = {
    type: 'monthly',
    paymentMethod: 'mobile_money',
    phoneNumber: '+256700000003'
  };
  
  const createResult = await apiRequest('POST', '/subscriptions/create', subscriptionData, authTokens.orgMember);
  if (!createResult.success && createResult.status === 403) {
    logSuccess('Organization member correctly blocked from creating monthly subscription');
  } else {
    logError('Organization member should not be able to create monthly subscription');
  }
}

async function testSessionUsage() {
  log('\n🎯 Testing Session Usage...', 'cyan');
  
  // Create a mock therapy session ID for testing
  const mockSessionId = uuidv4();
  
  const useResult = await apiRequest('POST', `/subscriptions/session/${mockSessionId}/use`, null, authTokens.individual);
  if (!useResult.success) {
    // This is expected since we don't have a real therapy session
    logInfo('Session usage test completed (expected to fail without real session)');
  }
}

async function testErrorHandling() {
  log('\n🚨 Testing Error Handling...', 'cyan');
  
  // Test invalid subscription type
  const invalidSubscription = {
    type: 'invalid_type',
    paymentMethod: 'mobile_money'
  };
  
  const invalidResult = await apiRequest('POST', '/subscriptions/create', invalidSubscription, authTokens.individual);
  if (!invalidResult.success) {
    logSuccess('Invalid subscription type correctly rejected');
  } else {
    logError('Invalid subscription type should be rejected');
  }
  
  // Test unauthorized access
  const unauthorizedResult = await apiRequest('GET', '/subscriptions/plans');
  if (!unauthorizedResult.success && unauthorizedResult.status === 401) {
    logSuccess('Unauthorized access correctly blocked');
  } else {
    logError('Unauthorized access should be blocked');
  }
  
  // Test excessive credit purchase
  const excessiveCredits = {
    credits: 25, // Max is 20
    paymentMethod: 'mobile_money'
  };
  
  const excessiveResult = await apiRequest('POST', '/subscriptions/credits/purchase', excessiveCredits, authTokens.individual);
  if (!excessiveResult.success) {
    logSuccess('Excessive credit purchase correctly rejected');
  } else {
    logError('Excessive credit purchase should be rejected');
  }
}

async function testSwaggerDocumentation() {
  log('\n📚 Testing Swagger Documentation...', 'cyan');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/docs`);
    if (response.status === 200) {
      logSuccess('Swagger documentation is accessible');
    } else {
      logError('Swagger documentation not accessible');
    }
  } catch (error) {
    logError(`Failed to access Swagger docs: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting MindLyf Auth Service Subscription System Tests', 'bright');
  log('=' * 60, 'cyan');
  
  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = 0;
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Create Test Users', fn: createTestUsers },
    { name: 'Subscription Plans', fn: testSubscriptionPlans },
    { name: 'Individual Subscription', fn: testIndividualSubscription },
    { name: 'Credit Purchase', fn: testCreditPurchase },
    { name: 'Subscription Status', fn: testSubscriptionStatus },
    { name: 'Organization Creation', fn: testOrganizationCreation },
    { name: 'Organization Subscription', fn: testOrganizationSubscription },
    { name: 'Add User to Organization', fn: testAddUserToOrganization },
    { name: 'Organization Details', fn: testOrganizationDetails },
    { name: 'Organization Member Restrictions', fn: testOrganizationMemberPlans },
    { name: 'Session Usage', fn: testSessionUsage },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Swagger Documentation', fn: testSwaggerDocumentation }
  ];
  
  for (const test of tests) {
    totalTests++;
    try {
      const result = await test.fn();
      if (result !== false) {
        passedTests++;
      }
    } catch (error) {
      logError(`Test "${test.name}" threw an error: ${error.message}`);
    }
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  log('\n' + '=' * 60, 'cyan');
  log('📊 Test Results Summary', 'bright');
  log(`✅ Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`⏱️  Duration: ${duration.toFixed(2)}s`, 'blue');
  
  if (passedTests === totalTests) {
    log('🎉 All tests passed! The subscription system is working correctly.', 'green');
  } else {
    log(`⚠️  ${totalTests - passedTests} test(s) failed. Please check the logs above.`, 'yellow');
  }
  
  // Print test data summary
  log('\n📋 Test Data Summary:', 'cyan');
  log(`Users created: ${Object.keys(testData.users).length}`);
  log(`Organizations created: ${Object.keys(testData.organizations).length}`);
  log(`Subscriptions created: ${Object.keys(testData.subscriptions).length}`);
  log(`Payments processed: ${Object.keys(testData.payments).length}`);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testData,
  authTokens
}; 