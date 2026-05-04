// v1.2.0
// Daily Sales Leads Analyzer
// Google Apps Script + ChatGPT API
// Automatically checks Gmail, analyzes emails, updates Google Sheet, posts to Slack

// ╔════════════════════════════════════════════════════════════════════════╗
// ║                        🚀 QUICK START GUIDE                            ║
// ║                        (For Non-Developers)                             ║
// ╚════════════════════════════════════════════════════════════════════════╝
//
// STEP 1: Add Your OpenAI API Key
//   → Find OPENAI_API_KEY below in CONFIG section
//   → Replace 'YOUR_OPENAI_API_KEY_HERE' with your actual key
//   → Get key from: https://platform.openai.com/api-keys
//
// STEP 2: Edit Configuration (scroll down to "EASY CONFIGURATION")
//   → Change SHEET_NAME to match your Google Sheet tab name
//   → Add your Slack webhook URL (optional)
//
// STEP 3: Test First!
//   → Select 'testFullRoutine' from dropdown and click ▶️ Run
//   → Verify everything works
//
// STEP 4: Enable Daily Automation
//   → Select 'setupTrigger' from dropdown at top
//   → Click ▶️ Run button
//   → Grant permissions when asked
//   → Done! Script runs automatically every day at 8 AM
//
// ⚠️ NEED HELP? Check SETUP_GUIDE.md for detailed instructions
//
// ════════════════════════════════════════════════════════════════════════

// ==================== ⚙️ EASY CONFIGURATION ====================
// Edit the values below to customize the script for your needs
// ================================================================

const CONFIG = {
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🤖 OPENAI API KEY
  // Your ChatGPT API key (REQUIRED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
  // ⚠️ REQUIRED: Get your key from https://platform.openai.com/api-keys
  // Should look like: 'sk-proj-abc123...'
  // ⚠️ Keep this key secret - don't share with anyone!
  
  OPENAI_MODEL: 'gpt-3.5-turbo',
  // 💰 COST OPTIONS:
  // 'gpt-3.5-turbo'      → Cheapest (~$0.30/month) - Good accuracy
  // 'gpt-4-turbo-preview' → Mid-range (~$2/month) - Better accuracy  
  // 'gpt-4'              → Most expensive (~$6/month) - Best accuracy
  // ℹ️ Start with gpt-3.5-turbo, upgrade if needed
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📧 EMAIL SETTINGS
  // Which emails should the script check?
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  EMAIL_FROM: 'Sales Rep Email Insert Here',
  // ℹ️ The script will check emails FROM this address
  // Example: 'john.doe@yourcompany.com'
  // if you want to check email from specific someone but this doesnot matter as long as group email is cceed
  
  EMAIL_CC: 'Insert your Group Email Here',
  // ℹ️ The script will also check emails CC'd to this address
  // Example: 'team@yourcompany.com'
  
  TIME_WINDOW_HOURS: 24,
  // ℹ️ How many hours back should the script look?
  // Common values: 12 (half day), 18 (default), 24 (full day)
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 GOOGLE SHEET SETTINGS
  // Where should the results be saved?
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  SHEET_ID: 'Google Sheet ID Here',
  // ℹ️ Get this from your Google Sheet URL:
  // https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit
  
  SHEET_NAME: 'DailyUpdate',
  // ⚠️ IMPORTANT: Change this to match your sheet tab name EXACTLY
  // Common names: 'Sheet1', 'Leads', 'Sales Data', 'Daily Leads'
  // ⚠️ Must be case-sensitive!
  
  LOG_SHEET_NAME: 'Logs',
  // ℹ️ Name of the sheet tab for execution logs
  // The script will create this tab automatically if it doesn't exist
  // Change this if you want a different name
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💬 SLACK SETTINGS
  // Where should the summary be posted?
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  SLACK_WEBHOOK_URL: 'SLACK WEB HOOK',
  // ✅ Your Slack webhook is already configured!
  // To change: Get new webhook from https://api.slack.com/messaging/webhooks
  // Should look like: https://hooks.slack.com/services/T00000000/B00000000/XXXX
  // Set to 'YOUR_SLACK_WEBHOOK_URL_HERE' to disable Slack posting
  
  SLACK_CHANNEL: 'channel-name-here',
  // ℹ️ Which Slack channel to post to (without the #)
  // Example: 'sales-leads' will post to #sales-leads
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔍 KEYWORD FILTERS
  // Which words signal an actionable email?
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ACTION_KEYWORDS: [
    // Quote/Pricing related
    'quote', 'pricing', 'quotation', 'cost', 'budget',
    
    // Meeting/Call related
    'meeting', 'call', 'discuss', 'schedule',
    
    // Technical questions
    'feasibility', 'sample', 'demo', 'trial',
    
    // Documentation
    'proposal', 'SOW', 'requirements', 'specifications',
    
    // Deal status
    'production', 'go live', 'launch', 'contract', 'signed', 'lost', 'won',
    
    // Issues/Support
    // Issues/Support
    'issue', 'problem', 'error', 'bug', 'delayed', 'quality','cancel', 'stop', 'unsubscribe', 'refund', 'complaint'
    
    // Add your own keywords below:
    // 'urgent', 'ASAP', 'deadline'
  ]
};

// ================================================================
// ⚠️ STOP HERE - Don't edit below unless you know JavaScript
// ================================================================

// ==================== ▶️ MAIN AUTOMATION ====================
// This runs automatically every day (after you set up trigger)
// You don't need to edit anything below here
// =============================================================

/**
 * Main automation function
 * This runs daily at 8 AM (or whatever you set in setupTrigger)
 */
function dailySalesLeadsRoutine() {
  const startTime = new Date();
  let status = 'Success';
  let errorMessage = '';
  let emailsProcessed = 0;
  let leadsFound = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let estimatedCost = 0;
  
  try {
    Logger.log('=== 🚀 Starting Daily Sales Leads Routine ===');
    Logger.log('Time: ' + startTime);
    Logger.log('');
    
    // Step 1: Get emails from Gmail
    Logger.log('📧 Step 1: Fetching emails from Gmail...');
    const emails = fetchRecentEmails();
    emailsProcessed = emails.length;
    Logger.log(`   ✅ Found ${emails.length} emails to analyze`);
    Logger.log('');
    
    if (emails.length === 0) {
      Logger.log('ℹ️ No emails found. Exiting.');
      Logger.log('');
      
      // Log execution even if no emails
      logExecution(startTime, new Date(), status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, '');
      return;
    }
    
    // Step 2: Analyze with ChatGPT
    Logger.log('🤖 Step 2: Analyzing emails with ChatGPT...');
    const analysisResult = analyzeEmailsWithChatGPT(emails);
    
    const analyzedLeads = analysisResult.leads;
    inputTokens = analysisResult.inputTokens || 0;
    outputTokens = analysisResult.outputTokens || 0;
    estimatedCost = analysisResult.cost || 0;
    
    leadsFound = analyzedLeads.length;
    Logger.log(`   ✅ Found ${analyzedLeads.length} actionable leads`);
    Logger.log(`   💰 Tokens used: ${inputTokens} input, ${outputTokens} output (~$${estimatedCost.toFixed(4)})`);
    Logger.log('');
    
    if (analyzedLeads.length === 0) {
      Logger.log('ℹ️ No actionable leads found. Exiting.');
      Logger.log('');
      
      // Log execution with token usage
      logExecution(startTime, new Date(), status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, '');
      return;
    }
    
    // Step 3: Write to Google Sheet
    Logger.log('📊 Step 3: Updating Google Sheet...');
    writeToGoogleSheet(analyzedLeads);
    Logger.log('   ✅ Google Sheet updated');
    Logger.log('');
    
    // Step 4: Post to Slack
    Logger.log('💬 Step 4: Posting to Slack...');
    postToSlack(analyzedLeads);
    Logger.log('   ✅ Slack message posted');
    Logger.log('');
    
    Logger.log('=== ✅ Routine Complete! ===');
    Logger.log('');
    
    // Log successful execution
    const endTime = new Date();
    logExecution(startTime, endTime, status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, '');
    
  } catch (error) {
    Logger.log('');
    Logger.log('=== ❌ ERROR ===');
    Logger.log('Error: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    Logger.log('');
    
    // Log failed execution
    status = 'Failed';
    errorMessage = error.message;
    const endTime = new Date();
    logExecution(startTime, endTime, status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, errorMessage);
    
    // Send error notification email
    sendErrorEmail(error);
  }
}


// ==================== EMAIL FETCHING ====================

function fetchRecentEmails() {
  const cutoffTime = new Date(Date.now() - CONFIG.TIME_WINDOW_HOURS * 60 * 60 * 1000);
  const cutoffStr = Utilities.formatDate(cutoffTime, Session.getScriptTimeZone(), 'yyyy/MM/dd');
  
  // Build Gmail search query
  const query = `(from:${CONFIG.EMAIL_FROM} OR cc:${CONFIG.EMAIL_CC}) after:${cutoffStr}`;
  
  Logger.log(`Gmail Query: ${query}`);
  
  const threads = GmailApp.search(query, 0, 50); // Max 50 threads
  const emails = [];
  
  threads.forEach(thread => {
    const messages = thread.getMessages();
    const latestMessage = messages[messages.length - 1]; // Get most recent message in thread
    
    const emailData = {
      threadId: thread.getId(),
      messageId: latestMessage.getId(),
      date: latestMessage.getDate(),
      from: latestMessage.getFrom(),
      to: latestMessage.getTo(),
      cc: latestMessage.getCc(),
      subject: latestMessage.getSubject(),
      body: latestMessage.getPlainBody(),
      snippet: thread.getFirstMessageSubject()
    };
    
    emails.push(emailData);
  });
  
  return emails;
}

// ==================== CHATGPT ANALYSIS ====================

function analyzeEmailsWithChatGPT(emails) {
  const prompt = buildAnalysisPrompt(emails);
  
  const requestBody = {
    model: CONFIG.OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a sales and customer support email analyzer for YOUR_COMPANY_NAME_HERE, a web scraping/data extraction company. Your job is to identify critical action items from emails and categorize them.

CONTEXT:
YOUR_COMPANY_NAME_HERE provides web scraping, data extraction, and API services. Typical projects involve scraping websites, extracting structured data, and delivering datasets to clients.

ACTION TYPES TO DETECT:
1. Sales Actions:
   - Quote Request: Client asks for pricing/quotation
   - Meeting Request: Client wants to schedule call/meeting
   - Feasibility Check: Client asks "can you scrape X" or "is this possible"
   - Proposal Needed: Client asks for SOW, scope, proposal, agreemnt or asks to edit the clause in contract or shares their requirement
   - Client Question: Technical questions about capabilities

2. Deal Status:
   - Deal Closed Won: Contract signed, going to production, launch mentioned
   - Deal Closed Lost: Client says put on hold or not moving forward
   - Production Ready: Client says "go live", "start scraping", "begin delivery"

3. Customer Issues (ALWAYS HIGH PRIORITY):
   - Data Quality Issue: Client reports incorrect, missing, or bad data
   - Delivery Problem: Late delivery, missed deadline, delayed data
   - Service Issue: Scraper broken, API down, technical problems
   - Cancellation Risk: Client mentions "cancel", "stop service", "unsubscribe", "refund"
   - Complaint: Client expresses frustration, disappointment, or dissatisfaction

RULES:
1. Extract YOUR_COMPANY_NAME_HERE POC (Point of Contact):
   - This is the @YOUR_COMPANY_NAME_HERE.com person in FROM, TO, or CC
   - Usually: YOUR_POC_1_HERE, YOUR_POC_2_HERE, YOUR_POC_3_HERE, YOUR_POC_4_HERE, YOUR_POC_5_HERE, YOUR_POC_6_HERE
   - Format as first name only (e.g., "James", "Donald")

2. Extract lead name:
   - The person who is NOT @YOUR_COMPANY_NAME_HERE.com
   - This is usually the client/prospect

3. Extract company:
   - From email domain (e.g., user@acme.com → "Acme")
   - Leave blank for gmail/yahoo/outlook/hotmail addresses

4. Assign priority:
   - HIGH: Customer issues, cancellation risk, production blockers, explicit deadlines, "urgent/ASAP"
   - MEDIUM: General inquiries, meeting requests, feasibility questions

5. Write concise note:
   - What specific action is needed
   - Key details (deadline, issue type, etc.)

Output ONLY valid JSON array, no markdown formatting.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
    },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      Logger.log(`OpenAI API Error: ${responseCode} - ${response.getContentText()}`);
      throw new Error(`OpenAI API returned ${responseCode}`);
    }
    
    const result = JSON.parse(response.getContentText());
    const content = result.choices[0].message.content;
    
    // Extract token usage from API response
    const usage = result.usage || {};
    const inputTokens = usage.prompt_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;
    
    // Calculate estimated cost based on model
    const cost = calculateCost(CONFIG.OPENAI_MODEL, inputTokens, outputTokens);
    
    // Parse the JSON response
    const parsedContent = JSON.parse(content);
    const leads = parsedContent.leads || [];
    
    Logger.log(`ChatGPT returned ${leads.length} actionable leads`);
    
    // Return leads with token usage data
    return {
      leads: leads,
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      cost: cost
    };
    
  } catch (error) {
    Logger.log(`Error calling ChatGPT: ${error.message}`);
    throw error;
  }
}

/**
 * Calculate OpenAI API cost based on model and tokens
 */
function calculateCost(model, inputTokens, outputTokens) {
  // Pricing as of 2024 (per 1M tokens)
  const pricing = {
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
    'gpt-4-turbo-preview': { input: 10.00, output: 30.00 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-4': { input: 30.00, output: 60.00 }
  };
  
  const rates = pricing[model] || pricing['gpt-3.5-turbo'];
  const inputCost = (inputTokens / 1000000) * rates.input;
  const outputCost = (outputTokens / 1000000) * rates.output;
  
  return inputCost + outputCost;
}

function buildAnalysisPrompt(emails) {
  const emailsText = emails.map((email, index) => {
    return `
EMAIL ${index + 1}:
From: ${email.from}
To: ${email.to}
CC: ${email.cc}
Subject: ${email.subject}
Date: ${email.date}
Body Preview: ${email.body.substring(0, 1000)}
Thread ID: ${email.threadId}
---`;
  }).join('\n');
  
  return `Analyze these emails and return ONLY actionable items in this exact JSON format:

{
  "leads": [
    {
      "email_index": 1,
      "thread_id": "...",
      "YOUR_COMPANY_NAME_HERE_poc": "Joseph",
      "lead_name": "John Doe",
      "lead_email": "john@company.com",
      "company": "Company Name",
      "action_type": "Quote Request|Meeting Request|Client Question|Feasibility Check|Proposal Needed|Contract modification |Deal Closed Won |Deal Closed Lost|Production Ready|Data Quality Issue|Delivery Problem|Service Issue|Cancellation Risk|Complaint",
      "priority": "High|Medium",
      "note": "Brief description of what action is needed"
    }
  ]
}

IMPORTANT: 
- YOUR_COMPANY_NAME_HERE_poc = First name of @YOUR_COMPANY_NAME_HERE.com person (Joseph, Smriti, Saurav, Shiva, etc.)
- lead_name = The client/prospect (NOT @YOUR_COMPANY_NAME_HERE.com person)
- action_type = Choose the MOST SPECIFIC type that matches
- priority = HIGH for: customer issues, cancellations, production blockers, urgent deadlines
- Only include emails that need ACTION. Exclude routine follow-ups, thank you notes, acknowledgments. 
- If there are details on contract, Master Signging Agreement (MSA), edit clause on SoW (Statement of Work) even though they are followups include that in Contract Modification

Emails to analyze:
${emailsText}

Remember: Only return valid JSON, no markdown formatting.`;
}

// ==================== GOOGLE SHEETS ====================

/**
 * Gets or creates the leads sheet
 * Sets up headers if sheet is new
 */
function getOrCreateLeadsSheet() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    Logger.log(`   📝 Sheet "${CONFIG.SHEET_NAME}" not found. Creating it now...`);
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
    
    // Set up headers
    const headers = [
      'Date',
      'Day', 
      'Time',
      'YOUR_COMPANY_NAME_HERE POC',
      'Sender Name',
      'Sender Email',
      'Subject',
      'Lead Name',
      'Lead Email',
      'Company',
      'Action Type',
      'Priority',
      'Note',
      'Email Link'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Set column widths for readability
    sheet.setColumnWidth(1, 100);  // Date
    sheet.setColumnWidth(2, 90);   // Day
    sheet.setColumnWidth(3, 80);   // Time
    sheet.setColumnWidth(4, 110);  // YOUR_COMPANY_NAME_HERE POC
    sheet.setColumnWidth(5, 150);  // Sender Name
    sheet.setColumnWidth(6, 200);  // Sender Email
    sheet.setColumnWidth(7, 250);  // Subject
    sheet.setColumnWidth(8, 150);  // Lead Name
    sheet.setColumnWidth(9, 200);  // Lead Email
    sheet.setColumnWidth(10, 150); // Company
    sheet.setColumnWidth(11, 140); // Action Type
    sheet.setColumnWidth(12, 100); // Priority
    sheet.setColumnWidth(13, 300); // Note
    sheet.setColumnWidth(14, 180); // Email Link
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    Logger.log(`   ✅ Sheet "${CONFIG.SHEET_NAME}" created with headers`);
  }
  
  return sheet;
}

function writeToGoogleSheet(leads) {
  const sheet = getOrCreateLeadsSheet();
  
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const rows = leads.map(lead => {
    const emailDate = new Date(); // You could parse from email data if needed
    
    return [
      Utilities.formatDate(emailDate, Session.getScriptTimeZone(), 'yyyy-MM-dd'), // Date
      dayNames[emailDate.getDay()], // Day
      Utilities.formatDate(emailDate, Session.getScriptTimeZone(), 'HH:mm'), // Time
      lead.YOUR_COMPANY_NAME_HERE_poc || '', // YOUR_COMPANY_NAME_HERE POC
      lead.sender_name || lead.lead_name || '', // Sender Name
      lead.sender_email || lead.lead_email || '', // Sender Email
      lead.subject || '', // Subject
      lead.lead_name || '', // Lead Name
      lead.lead_email || '', // Lead Email
      lead.company || '', // Company
      lead.action_type || 'Unknown', // Action Type
      lead.priority || 'Medium', // Priority
      lead.note || '', // Note
      `https://mail.google.com/mail/u/0/#inbox/${lead.thread_id}` // Email Link
    ];
  });
  
  // Insert rows at the top (row 2, below header)
  // This makes newest entries appear first
  if (rows.length > 0) {
    sheet.insertRowsAfter(1, rows.length); // Insert blank rows after header
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows); // Fill with data
  }
  
  Logger.log(`   ✅ Inserted ${rows.length} rows at top of sheet`);
}

// ==================== SLACK INTEGRATION ====================

function postToSlack(leads) {
  if (!CONFIG.SLACK_WEBHOOK_URL || CONFIG.SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
    Logger.log('   ℹ️ Slack webhook not configured. Skipping Slack post.');
    return;
  }
  
  const highPriority = leads.filter(l => l.priority === 'High');
  const mediumPriority = leads.filter(l => l.priority === 'Medium');
  
  // Build message with table format
  let message = `🚨 *Daily Sales Leads - ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')}*\n\n`;
  message += `*${leads.length} action items* from emails in the last ${CONFIG.TIME_WINDOW_HOURS} hours:\n\n`;
  
  // Helper function to create table rows
  function buildTableSection(sectionLeads, priorityLabel, emoji) {
    if (sectionLeads.length === 0) return '';
    
    let section = `*${emoji} ${priorityLabel}*\n`;
    section += '```\n';
    section += 'POC       | Lead              | Company           | Action\n';
    section += '----------|-------------------|-------------------|------------------\n';
    
    sectionLeads.forEach(lead => {
      const poc = (lead.YOUR_COMPANY_NAME_HERE_poc || 'Unknown').substring(0, 9).padEnd(9);
      const leadName = (lead.lead_name || 'Unknown').substring(0, 17).padEnd(17);
      const company = (lead.company || 'N/A').substring(0, 17).padEnd(17);
      const action = (lead.action_type || 'Unknown').substring(0, 18);
      
      section += `${poc} | ${leadName} | ${company} | ${action}\n`;
    });
    
    section += '```\n';
    
    // Add clickable links
    section += '_Details:_\n';
    sectionLeads.forEach((lead, index) => {
      section += `${index + 1}. *${lead.lead_name}* - ${lead.note || 'No details'} - <https://mail.google.com/mail/u/0/#inbox/${lead.thread_id}|View Email>\n`;
    });
    section += '\n';
    
    return section;
  }
  
  // Add high priority section
  message += buildTableSection(highPriority, 'HIGH PRIORITY', '🔴');
  
  // Add medium priority section
  message += buildTableSection(mediumPriority, 'MEDIUM PRIORITY', '🟡');
  
  message += `\n📊 Full details in Google Sheet: https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}`;
  
  const payload = {
    text: message,
    channel: `#${CONFIG.SLACK_CHANNEL}`
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.SLACK_WEBHOOK_URL, options);
    
    if (response.getResponseCode() !== 200) {
      Logger.log(`   ⚠️ Slack webhook error: ${response.getContentText()}`);
    } else {
      Logger.log('   ✅ Slack message posted with table format');
    }
  } catch (error) {
    Logger.log(`   ⚠️ Error posting to Slack: ${error.message}`);
  }
}

// ==================== 📊 EXECUTION LOGGING ====================
// Tracks every run: emails processed, costs, errors
// ==============================================================

/**
 * Logs execution details to the Logs sheet
 * Automatically creates the sheet if it doesn't exist
 */
function logExecution(startTime, endTime, status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, errorMessage) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let logSheet = spreadsheet.getSheetByName(CONFIG.LOG_SHEET_NAME);
    
    // Create log sheet if it doesn't exist
    if (!logSheet) {
      logSheet = createLogSheet(spreadsheet);
    }
    
    // Calculate duration
    const durationSeconds = Math.round((endTime - startTime) / 1000);
    
    // Prepare log row
    const logRow = [
      Utilities.formatDate(startTime, Session.getScriptTimeZone(), 'yyyy-MM-dd'), // Date
      Utilities.formatDate(startTime, Session.getScriptTimeZone(), 'HH:mm:ss'), // Start Time
      Utilities.formatDate(endTime, Session.getScriptTimeZone(), 'HH:mm:ss'), // End Time
      durationSeconds, // Duration (seconds)
      status, // Status (Success/Failed)
      emailsProcessed, // Emails Processed
      leadsFound, // Leads Found
      CONFIG.OPENAI_MODEL, // Model Used
      inputTokens, // Input Tokens
      outputTokens, // Output Tokens
      inputTokens + outputTokens, // Total Tokens
      estimatedCost, // Estimated Cost ($)
      errorMessage || '' // Error Message
    ];
    
    // Append to sheet
    logSheet.appendRow(logRow);
    
    // Format the new row
    const lastRow = logSheet.getLastRow();
    
    // Format cost column as currency
    logSheet.getRange(lastRow, 12).setNumberFormat('$0.0000');
    
    // Color-code status
    const statusCell = logSheet.getRange(lastRow, 5);
    if (status === 'Success') {
      statusCell.setBackground('#d4edda').setFontColor('#155724');
    } else {
      statusCell.setBackground('#f8d7da').setFontColor('#721c24');
    }
    
    Logger.log(`📊 Execution logged to ${CONFIG.LOG_SHEET_NAME} sheet`);
    
  } catch (error) {
    Logger.log(`⚠️ Failed to log execution: ${error.message}`);
    // Don't throw - logging failure shouldn't break the main routine
  }
}

/**
 * Creates the Logs sheet with proper headers and formatting
 */
function createLogSheet(spreadsheet) {
  const logSheet = spreadsheet.insertSheet(CONFIG.LOG_SHEET_NAME);
  
  // Set up headers
  const headers = [
    'Date',
    'Start Time',
    'End Time',
    'Duration (s)',
    'Status',
    'Emails Processed',
    'Leads Found',
    'Model Used',
    'Input Tokens',
    'Output Tokens',
    'Total Tokens',
    'Estimated Cost',
    'Error Message'
  ];
  
  const headerRange = logSheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // Format header row
  headerRange
    .setBackground('#4a86e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  // Set column widths
  logSheet.setColumnWidth(1, 100); // Date
  logSheet.setColumnWidth(2, 90); // Start Time
  logSheet.setColumnWidth(3, 90); // End Time
  logSheet.setColumnWidth(4, 100); // Duration
  logSheet.setColumnWidth(5, 80); // Status
  logSheet.setColumnWidth(6, 130); // Emails Processed
  logSheet.setColumnWidth(7, 100); // Leads Found
  logSheet.setColumnWidth(8, 150); // Model Used
  logSheet.setColumnWidth(9, 110); // Input Tokens
  logSheet.setColumnWidth(10, 120); // Output Tokens
  logSheet.setColumnWidth(11, 110); // Total Tokens
  logSheet.setColumnWidth(12, 120); // Estimated Cost
  logSheet.setColumnWidth(13, 300); // Error Message
  
  // Freeze header row
  logSheet.setFrozenRows(1);
  
  Logger.log(`✅ Created new log sheet: ${CONFIG.LOG_SHEET_NAME}`);
  
  return logSheet;
}

/**
 * View summary statistics from the log
 * Run this manually to see total costs, average runtime, etc.
 */
function viewLogSummary() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const logSheet = spreadsheet.getSheetByName(CONFIG.LOG_SHEET_NAME);
    
    if (!logSheet) {
      Logger.log('❌ No log sheet found. Run the routine at least once first.');
      return;
    }
    
    const lastRow = logSheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('ℹ️ No execution logs yet.');
      return;
    }
    
    // Get all data (excluding header)
    const data = logSheet.getRange(2, 1, lastRow - 1, 13).getValues();
    
    // Calculate statistics
    let totalRuns = data.length;
    let successfulRuns = 0;
    let failedRuns = 0;
    let totalEmailsProcessed = 0;
    let totalLeadsFound = 0;
    let totalCost = 0;
    let totalDuration = 0;
    
    data.forEach(row => {
      if (row[4] === 'Success') successfulRuns++;
      else failedRuns++;
      
      totalEmailsProcessed += row[5] || 0;
      totalLeadsFound += row[6] || 0;
      totalCost += row[11] || 0;
      totalDuration += row[3] || 0;
    });
    
    const avgDuration = totalDuration / totalRuns;
    const avgEmailsPerRun = totalEmailsProcessed / totalRuns;
    const avgLeadsPerRun = totalLeadsFound / totalRuns;
    
    // Display summary
    Logger.log('');
    Logger.log('='.repeat(60));
    Logger.log('📊 EXECUTION LOG SUMMARY');
    Logger.log('='.repeat(60));
    Logger.log('');
    Logger.log(`Total Runs: ${totalRuns}`);
    Logger.log(`  ✅ Successful: ${successfulRuns}`);
    Logger.log(`  ❌ Failed: ${failedRuns}`);
    Logger.log('');
    Logger.log(`Total Emails Processed: ${totalEmailsProcessed}`);
    Logger.log(`Total Leads Found: ${totalLeadsFound}`);
    Logger.log(`Total Cost: $${totalCost.toFixed(4)}`);
    Logger.log('');
    Logger.log(`Average per Run:`);
    Logger.log(`  Duration: ${avgDuration.toFixed(1)} seconds`);
    Logger.log(`  Emails: ${avgEmailsPerRun.toFixed(1)}`);
    Logger.log(`  Leads: ${avgLeadsPerRun.toFixed(1)}`);
    Logger.log(`  Cost: $${(totalCost / totalRuns).toFixed(4)}`);
    Logger.log('');
    Logger.log('='.repeat(60));
    Logger.log('');
    
  } catch (error) {
    Logger.log(`❌ Error viewing log summary: ${error.message}`);
  }
}

// ==================== 📊 EXECUTION LOGGING ====================
// Tracks each run: emails processed, costs, errors
// ==============================================================

/**
 * Creates or gets the execution log sheet
 * Sets up headers if sheet is new
 */
function getOrCreateLogSheet() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let logSheet = spreadsheet.getSheetByName(CONFIG.LOG_SHEET_NAME);
  
  // Create sheet if it doesn't exist
  if (!logSheet) {
    Logger.log(`   📝 Creating new log sheet: "${CONFIG.LOG_SHEET_NAME}"`);
    logSheet = spreadsheet.insertSheet(CONFIG.LOG_SHEET_NAME);
    
    // Set up headers
    const headers = [
      'Timestamp',
      'Date',
      'Time',
      'Day',
      'Status',
      'Emails Processed',
      'Leads Found',
      'Model Used',
      'Input Tokens',
      'Output Tokens',
      'Total Tokens',
      'Estimated Cost ($)',
      'Runtime (sec)',
      'Error Message'
    ];
    
    logSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Set column widths
    logSheet.setColumnWidth(1, 180); // Timestamp
    logSheet.setColumnWidth(2, 100); // Date
    logSheet.setColumnWidth(3, 80);  // Time
    logSheet.setColumnWidth(4, 100); // Day
    logSheet.setColumnWidth(5, 100); // Status
    logSheet.setColumnWidth(6, 140); // Emails Processed
    logSheet.setColumnWidth(7, 120); // Leads Found
    logSheet.setColumnWidth(8, 120); // Model Used
    logSheet.setColumnWidth(9, 120); // Input Tokens
    logSheet.setColumnWidth(10, 120); // Output Tokens
    logSheet.setColumnWidth(11, 120); // Total Tokens
    logSheet.setColumnWidth(12, 150); // Estimated Cost
    logSheet.setColumnWidth(13, 120); // Runtime
    logSheet.setColumnWidth(14, 300); // Error Message
    
    // Freeze header row
    logSheet.setFrozenRows(1);
    
    Logger.log(`   ✅ Log sheet "${CONFIG.LOG_SHEET_NAME}" created with headers`);
  }
  
  return logSheet;
}

/**
 * Logs execution metrics to the log sheet
 */
function logExecution(startTime, endTime, status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, errorMessage) {
  try {
    const logSheet = getOrCreateLogSheet();
    
    const runtime = (endTime.getTime() - startTime.getTime()) / 1000; // seconds
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const totalTokens = inputTokens + outputTokens;
    
    const row = [
      startTime,                                                                      // Timestamp
      Utilities.formatDate(startTime, Session.getScriptTimeZone(), 'yyyy-MM-dd'),   // Date
      Utilities.formatDate(startTime, Session.getScriptTimeZone(), 'HH:mm:ss'),     // Time
      dayNames[startTime.getDay()],                                                  // Day
      status,                                                                        // Status
      emailsProcessed,                                                               // Emails Processed
      leadsFound,                                                                    // Leads Found
      CONFIG.OPENAI_MODEL,                                                           // Model Used
      inputTokens,                                                                   // Input Tokens
      outputTokens,                                                                  // Output Tokens
      totalTokens,                                                                   // Total Tokens
      estimatedCost,                                                                 // Estimated Cost ($)
      runtime.toFixed(2),                                                            // Runtime (sec)
      errorMessage || ''                                                             // Error Message
    ];
    
    // Insert at row 2 (right after header) to keep most recent at top
    logSheet.insertRowAfter(1);
    logSheet.getRange(2, 1, 1, row.length).setValues([row]);
    
    // Format the new row
    const newRow = logSheet.getRange(2, 1, 1, row.length);
    
    // Format timestamp column as datetime
    logSheet.getRange(2, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    
    // Format cost column as currency
    logSheet.getRange(2, 12).setNumberFormat('$0.0000');
    
    // Color-code status
    const statusCell = logSheet.getRange(2, 5);
    if (status === 'Success') {
      statusCell.setBackground('#d9ead3'); // Light green
      statusCell.setFontColor('#274e13');   // Dark green
    } else if (status === 'Failed') {
      statusCell.setBackground('#f4cccc'); // Light red
      statusCell.setFontColor('#990000');   // Dark red
    } else {
      statusCell.setBackground('#fff2cc'); // Light yellow
      statusCell.setFontColor('#7f6000');   // Dark yellow
    }
    
    Logger.log(`   📊 Execution logged to "${CONFIG.LOG_SHEET_NAME}" sheet`);
    Logger.log(`   ⏱️ Runtime: ${runtime.toFixed(2)} seconds`);
    if (estimatedCost > 0) {
      Logger.log(`   💰 Estimated cost: $${estimatedCost.toFixed(4)}`);
    }
    
  } catch (error) {
    Logger.log(`   ⚠️ Failed to log execution: ${error.message}`);
    // Don't throw - logging failure shouldn't break the main routine
  }
}

// ==================== 📧 ERROR HANDLING ====================
// If something goes wrong, you'll get an email
// ============================================================

/**
 * Sends you an email if the script fails
 * You don't need to edit this
 */
function sendErrorEmail(error) {
  const recipient = Session.getActiveUser().getEmail();
  const subject = '⚠️ Daily Sales Leads Routine Failed';
  
  const body = `
Hi,

Your Daily Sales Leads routine encountered an error and didn't complete.

ERROR DETAILS:
${error.message}

WHAT TO DO:
1. Open Apps Script editor
2. Click "Executions" (📊 icon in left sidebar)
3. Find the failed run
4. Check the error details
5. See FAQ.md for common solutions

Or just re-run the script - sometimes it's a temporary API issue.

---
This is an automated message from your Apps Script
  `.trim();
  
  try {
    GmailApp.sendEmail(recipient, subject, body);
    Logger.log('📧 Error notification email sent to: ' + recipient);
  } catch (e) {
    Logger.log('⚠️ Could not send error email: ' + e.message);
  }
}

// ==================== ⏰ SETUP FUNCTIONS ====================
// Run this ONCE to configure daily automation
// ============================================================

/**
 * ⏰ Create Daily Trigger
 * 
 * How to use:
 * 1. Make sure CONFIG section is filled out (API key, Sheet name, etc.)
 * 2. Select this function from the dropdown
 * 3. Click the ▶️ Run button
 * 4. Grant permissions when asked
 * 5. Script will now run automatically every day at 8 AM
 * 
 * To change the time:
 * - Edit .atHour(8) below to any hour 0-23
 * - Example: .atHour(6) = 6 AM, .atHour(14) = 2 PM
 */
function setupTrigger() {
  // Delete any existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'dailySalesLeadsRoutine') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new daily trigger at 8 AM
  ScriptApp.newTrigger('dailySalesLeadsRoutine')
    .timeBased()
    .everyDays(1)
    .atHour(8)  // ← Change this number to change the time (0-23)
    .create();
  
  Logger.log('✅ Daily trigger created successfully!');
  Logger.log('📅 Script will run every day at 8 AM');
  Logger.log('');
  Logger.log('To verify:');
  Logger.log('1. Click the ⏰ Triggers icon in the left sidebar');
  Logger.log('2. You should see "dailySalesLeadsRoutine" listed');
}
