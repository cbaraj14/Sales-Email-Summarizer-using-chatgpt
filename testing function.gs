// v1.0.0
// Test Functions for Daily Sales Leads Automation
// Copy these functions into your Apps Script project
// Run them one by one to verify everything works

// ==================== 🧪 TEST FUNCTIONS ====================
// Run these to verify everything works before automating
// ===========================================================

/**
 * ✅ TEST 1: Check if Gmail connection works
 * 
 * What this does:
 * - Connects to Gmail
 * - Searches for emails matching your filters
 * - Shows you how many emails were found
 * 
 * How to run:
 * 1. Select 'testFetchEmails' from the dropdown at top
 * 2. Click ▶️ Run button
 * 3. Click "View" → "Logs" to see results
 * 
 * What to expect:
 * - Should show: "Found X emails"
 * - If it says "Found 0 emails", check your EMAIL_FROM and EMAIL_CC settings
 */
function testFetchEmails() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('🧪 TEST 1: Fetching emails from Gmail...');
  Logger.log('='.repeat(60));
  
  const emails = fetchRecentEmails();
  
  Logger.log('');
  Logger.log(`✅ Found ${emails.length} emails`);
  Logger.log('');
  
  if (emails.length === 0) {
    Logger.log('⚠️ No emails found. Check these settings in CONFIG:');
    Logger.log(`   - EMAIL_FROM: ${CONFIG.EMAIL_FROM}`);
    Logger.log(`   - EMAIL_CC: ${CONFIG.EMAIL_CC}`);
    Logger.log(`   - TIME_WINDOW_HOURS: ${CONFIG.TIME_WINDOW_HOURS}`);
    Logger.log('');
    Logger.log('💡 Try searching Gmail manually with:');
    Logger.log(`   from:${CONFIG.EMAIL_FROM} OR cc:${CONFIG.EMAIL_CC}`);
  } else {
    Logger.log('📧 Email details:');
    emails.slice(0, 3).forEach((email, i) => {
      Logger.log('');
      Logger.log(`Email ${i + 1}:`);
      Logger.log(`  From: ${email.from}`);
      Logger.log(`  Subject: ${email.subject}`);
      Logger.log(`  Date: ${email.date}`);
    });
    
    if (emails.length > 3) {
      Logger.log('');
      Logger.log(`... and ${emails.length - 3} more emails`);
    }
  }
  
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log(emails.length > 0 ? '✅ TEST PASSED' : '❌ TEST FAILED');
  Logger.log('='.repeat(60));
}

/**
 * ✅ TEST 2: Check if ChatGPT analysis works
 * 
 * What this does:
 * - Takes first 3 emails from Gmail
 * - Sends them to ChatGPT for analysis
 * - Shows you what leads ChatGPT found
 * 
 * How to run:
 * 1. Make sure testFetchEmails() passed first!
 * 2. Select 'testChatGPT' from the dropdown
 * 3. Click ▶️ Run button
 * 4. Check logs to see ChatGPT's analysis
 * 
 * What to expect:
 * - Should show JSON with lead details
 * - If it fails, check your OpenAI API key
 */
function testChatGPT() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('🧪 TEST 2: Analyzing emails with ChatGPT...');
  Logger.log('='.repeat(60));
  
  const emails = fetchRecentEmails();
  
  if (emails.length === 0) {
    Logger.log('');
    Logger.log('❌ No emails to analyze. Run testFetchEmails() first.');
    Logger.log('');
    return;
  }
  
  Logger.log('');
  Logger.log(`📧 Analyzing first ${Math.min(3, emails.length)} emails...`);
  Logger.log('');
  
  try {
    const result = analyzeEmailsWithChatGPT(emails.slice(0, 3));
    const leads = result.leads;
    
    Logger.log('');
    Logger.log(`✅ ChatGPT found ${leads.length} actionable leads`);
    Logger.log('');
    Logger.log('📊 Analysis results:');
    Logger.log('');
    Logger.log(JSON.stringify(leads, null, 2));
    Logger.log('');
    Logger.log('='.repeat(60));
    Logger.log('✅ TEST PASSED');
    Logger.log('='.repeat(60));
    
  } catch (error) {
    Logger.log('');
    Logger.log('❌ TEST FAILED');
    Logger.log('');
    Logger.log('Error: ' + error.message);
    Logger.log('');
    Logger.log('💡 Common fixes:');
    Logger.log('   1. Make sure OPENAI_API_KEY is set in CONFIG');
    Logger.log('   2. Check OpenAI account has credits: https://platform.openai.com/usage');
    Logger.log('   3. Verify API key is correct (starts with sk-)');
    Logger.log('   4. Check if API key has proper permissions');
    Logger.log('');
    Logger.log('='.repeat(60));
  }
}

/**
 * ✅ TEST 3: Test Google Sheet writing
 * 
 * What this does:
 * - Creates a test row in your Google Sheet
 * - Verifies sheet access and permissions
 * 
 * How to run:
 * 1. Select 'testSheetWrite' from the dropdown
 * 2. Click ▶️ Run button
 * 3. Check your Google Sheet for a test row
 */
function testSheetWrite() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('🧪 TEST 3: Testing Google Sheet access...');
  Logger.log('='.repeat(60));
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      Logger.log('');
      Logger.log('❌ TEST FAILED');
      Logger.log('');
      Logger.log(`Sheet "${CONFIG.SHEET_NAME}" not found!`);
      Logger.log('');
      Logger.log('💡 Fix:');
      Logger.log('   1. Check SHEET_NAME in CONFIG matches your tab name EXACTLY');
      Logger.log('   2. Tab names are case-sensitive');
      Logger.log('');
      return;
    }
    
    Logger.log('');
    Logger.log(`✅ Found sheet: "${CONFIG.SHEET_NAME}"`);
    Logger.log('');
    
    // Write test row
    const testRow = [
      new Date(),
      'Monday',
      '08:00',
      'Test User',
      'test@example.com',
      'Test Subject',
      'Test Lead',
      'lead@company.com',
      'Test Company',
      'Test Action',
      'Medium',
      'This is a test row',
      'https://mail.google.com/test'
    ];
    
    sheet.appendRow(testRow);
    
    Logger.log('✅ Test row written successfully!');
    Logger.log('');
    Logger.log('📊 Check your Google Sheet - you should see a new test row at the bottom');
    Logger.log('');
    Logger.log('='.repeat(60));
    Logger.log('✅ TEST PASSED');
    Logger.log('='.repeat(60));
    
  } catch (error) {
    Logger.log('');
    Logger.log('❌ TEST FAILED');
    Logger.log('');
    Logger.log('Error: ' + error.message);
    Logger.log('');
    Logger.log('💡 Common fixes:');
    Logger.log('   1. Check SHEET_ID in CONFIG is correct');
    Logger.log('   2. Make sure you have edit access to the sheet');
    Logger.log('   3. Re-authorize the script if needed');
    Logger.log('');
    Logger.log('='.repeat(60));
  }
}

/**
 * ✅ TEST 4: Test Slack webhook
 * 
 * What this does:
 * - Sends a test message to your Slack channel
 * - Verifies webhook is configured correctly
 */
function testSlackWebhook() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('🧪 TEST 4: Testing Slack webhook...');
  Logger.log('='.repeat(60));
  
  if (!CONFIG.SLACK_WEBHOOK_URL || CONFIG.SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
    Logger.log('');
    Logger.log('⚠️ Slack webhook not configured');
    Logger.log('');
    Logger.log('Set SLACK_WEBHOOK_URL in CONFIG to test Slack integration');
    Logger.log('');
    return;
  }
  
  Logger.log('');
  Logger.log('📤 Sending test message to Slack...');
  Logger.log('');
  
  const testPayload = {
    text: '🧪 Test message from Daily Sales Leads script!\n\nIf you see this, your Slack webhook is working correctly! ✅',
    channel: `#${CONFIG.SLACK_CHANNEL}`
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(testPayload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.SLACK_WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();
    
    Logger.log(`Response code: ${responseCode}`);
    Logger.log(`Response: ${response.getContentText()}`);
    Logger.log('');
    
    if (responseCode === 200) {
      Logger.log('✅ Slack message sent successfully!');
      Logger.log('');
      Logger.log(`📱 Check your #${CONFIG.SLACK_CHANNEL} channel`);
      Logger.log('');
      Logger.log('='.repeat(60));
      Logger.log('✅ TEST PASSED');
      Logger.log('='.repeat(60));
    } else {
      Logger.log('❌ TEST FAILED');
      Logger.log('');
      Logger.log('💡 Common fixes:');
      Logger.log('   1. Verify webhook URL is complete and correct');
      Logger.log('   2. Check channel exists: #' + CONFIG.SLACK_CHANNEL);
      Logger.log('   3. Regenerate webhook if needed');
      Logger.log('');
      Logger.log('='.repeat(60));
    }
    
  } catch (error) {
    Logger.log('');
    Logger.log('❌ TEST FAILED');
    Logger.log('');
    Logger.log('Error: ' + error.message);
    Logger.log('');
    Logger.log('='.repeat(60));
  }
}

/**
 * ✅ TEST 5: Run the complete routine
 * 
 * What this does:
 * - Fetches emails
 * - Analyzes with ChatGPT
 * - Updates Google Sheet
 * - Posts to Slack
 * - Everything the daily automation will do!
 * 
 * How to run:
 * 1. Make sure tests 1-3 passed first!
 * 2. Select 'testFullRoutine' from the dropdown
 * 3. Click ▶️ Run button
 * 4. Check your Google Sheet and Slack for results
 * 
 * What to expect:
 * - New rows in your Google Sheet
 * - Message posted to Slack (if webhook configured)
 * - "Routine Complete" in logs
 * - New entry in "Logs" sheet
 */
function testFullRoutine() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('🧪 TEST 5: Running full routine...');
  Logger.log('='.repeat(60));
  Logger.log('');
  Logger.log('This will:');
  Logger.log('  1. ✅ Fetch emails from Gmail');
  Logger.log('  2. ✅ Analyze with ChatGPT');
  Logger.log('  3. ✅ Update Google Sheet');
  Logger.log('  4. ✅ Post to Slack');
  Logger.log('  5. ✅ Create execution log');
  Logger.log('');
  Logger.log('Starting in 3 seconds...');
  Logger.log('');
  
  Utilities.sleep(3000);
  
  try {
    dailySalesLeadsRoutine();
    
    Logger.log('');
    Logger.log('='.repeat(60));
    Logger.log('✅ TEST PASSED');
    Logger.log('='.repeat(60));
    Logger.log('');
    Logger.log('Verify results:');
    Logger.log('  1. Check Google Sheet for new rows');
    Logger.log('  2. Check Slack for message');
    Logger.log('  3. Check "Logs" sheet for execution record');
    Logger.log('');
    Logger.log('Next step: Run setupTrigger() to automate daily');
    Logger.log('');
    
  } catch (error) {
    Logger.log('');
    Logger.log('='.repeat(60));
    Logger.log('❌ TEST FAILED');
    Logger.log('='.repeat(60));
    Logger.log('');
    Logger.log('Error: ' + error.message);
    Logger.log('');
    Logger.log('Stack trace:');
    Logger.log(error.stack);
    Logger.log('');
    Logger.log('💡 Check FAQ.md for troubleshooting help');
    Logger.log('');
  }
}

/**
 * ✅ TEST 6: Verify API key is set
 * 
 * What this does:
 * - Checks if OpenAI API key is configured
 * - Tests if it's a valid format
 */
function testAPIKey() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('🧪 TEST 6: Checking OpenAI API key...');
  Logger.log('='.repeat(60));
  Logger.log('');
  
  const apiKey = CONFIG.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
    Logger.log('❌ API key not set!');
    Logger.log('');
    Logger.log('💡 Fix:');
    Logger.log('   1. Go to CONFIG section in Code.gs');
    Logger.log('   2. Find OPENAI_API_KEY');
    Logger.log('   3. Replace YOUR_OPENAI_API_KEY_HERE with your actual key');
    Logger.log('   4. Key should start with: sk-');
    Logger.log('');
    Logger.log('Get key from: https://platform.openai.com/api-keys');
    Logger.log('');
    return;
  }
  
  if (!apiKey.startsWith('sk-')) {
    Logger.log('⚠️ API key format looks wrong');
    Logger.log('');
    Logger.log('Current key starts with: ' + apiKey.substring(0, 10) + '...');
    Logger.log('');
    Logger.log('OpenAI keys should start with: sk-');
    Logger.log('');
    Logger.log('💡 Double-check you copied the full key');
    Logger.log('');
    return;
  }
  
  Logger.log('✅ API key is set and format looks correct');
  Logger.log('');
  Logger.log('Key starts with: ' + apiKey.substring(0, 10) + '...');
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('✅ TEST PASSED');
  Logger.log('='.repeat(60));
  Logger.log('');
  Logger.log('Next: Run testChatGPT() to verify the key works with OpenAI');
  Logger.log('');
}

/**
 * ✅ TEST 7: Test log sheet creation
 * 
 * What this does:
 * - Creates or verifies the execution log sheet
 * - Adds a test log entry
 */
function testLogSheet() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('🧪 TEST 7: Testing log sheet...');
  Logger.log('='.repeat(60));
  Logger.log('');
  
  try {
    const logSheet = getOrCreateLogSheet();
    
    Logger.log('✅ Log sheet ready: "' + CONFIG.LOG_SHEET_NAME + '"');
    Logger.log('');
    
    // Write test log entry
    const now = new Date();
    logExecution(now, now, 'Test', 5, 2, 100, 50, 0.001, '');
    
    Logger.log('✅ Test log entry created');
    Logger.log('');
    Logger.log('📊 Check the "' + CONFIG.LOG_SHEET_NAME + '" tab in your sheet');
    Logger.log('');
    Logger.log('='.repeat(60));
    Logger.log('✅ TEST PASSED');
    Logger.log('='.repeat(60));
    
  } catch (error) {
    Logger.log('');
    Logger.log('❌ TEST FAILED');
    Logger.log('');
    Logger.log('Error: ' + error.message);
    Logger.log('');
    Logger.log('='.repeat(60));
  }
}

/**
 * ✅ TEST 8: Test leads sheet creation
 * 
 * What this does:
 * - Creates the leads sheet if it doesn't exist
 * - Verifies headers are set up correctly
 */
function testLeadsSheetCreation() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('🧪 TEST 8: Testing leads sheet creation...');
  Logger.log('='.repeat(60));
  Logger.log('');
  
  try {
    const sheet = getOrCreateLeadsSheet();
    
    Logger.log('✅ Leads sheet ready: "' + CONFIG.SHEET_NAME + '"');
    Logger.log('');
    
    // Verify headers
    const headers = sheet.getRange(1, 1, 1, 14).getValues()[0];
    Logger.log('📋 Headers found:');
    Logger.log('   ' + headers.join(' | '));
    Logger.log('');
    
    Logger.log('📊 Check the "' + CONFIG.SHEET_NAME + '" tab in your Google Sheet');
    Logger.log('');
    Logger.log('='.repeat(60));
    Logger.log('✅ TEST PASSED');
    Logger.log('='.repeat(60));
    
  } catch (error) {
    Logger.log('');
    Logger.log('❌ TEST FAILED');
    Logger.log('');
    Logger.log('Error: ' + error.message);
    Logger.log('');
    Logger.log('💡 Common fixes:');
    Logger.log('   1. Check SHEET_ID in CONFIG is correct');
    Logger.log('   2. Make sure you have edit access to the spreadsheet');
    Logger.log('');
    Logger.log('='.repeat(60));
  }
}
