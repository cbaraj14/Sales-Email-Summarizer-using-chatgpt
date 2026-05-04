// v1.3.0
// Daily Sales Leads Analyzer
// Google Apps Script + ChatGPT API
// Automatically checks Gmail, analyzes emails, updates Google Sheet, posts to Slack

// ╔════════════════════════════════════════════════════════════════════════╗
// ║                        🚀 QUICK START GUIDE                            ║
// ║                        (For Non-Developers)                             ║
// ╚════════════════════════════════════════════════════════════════════════╝
//
// STEP 1: Fill in every placeholder in the CONFIG section below
// STEP 2: Test with testFullRoutine()
// STEP 3: Run setupTrigger() to enable daily automation
//
// ════════════════════════════════════════════════════════════════════════

// ==================== ⚙️ EASY CONFIGURATION ====================
// Edit ONLY the values in this section
// ================================================================

const CONFIG = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🤖 OPENAI API KEY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
  // ⚠️ REQUIRED: Get your key from https://platform.openai.com/api-keys
  // Should look like: 'sk-proj-abc123...'

  OPENAI_MODEL: 'gpt-3.5-turbo',
  // Cost options:
  // 'gpt-3.5-turbo'       → Cheapest (~$0.30/month)
  // 'gpt-4-turbo-preview' → Mid-range (~$2/month)
  // 'gpt-4'               → Most expensive (~$6/month)


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏢 COMPANY SETTINGS  ← Replace all placeholders here
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  COMPANY_NAME: 'YOUR_COMPANY_NAME_HERE',
  // e.g. 'Acme Corp'

  COMPANY_DOMAIN: 'YOUR_COMPANY_EMAIL_DOMAIN_HERE',
  // e.g. 'acme.com' — used to identify internal staff in emails

  COMPANY_DESCRIPTION: 'YOUR_COMPANY_DESCRIPTION_HERE',
  // e.g. 'a SaaS company that provides data analytics tools'

  COMPANY_SERVICES: 'YOUR_SERVICES_DESCRIPTION_HERE',
  // e.g. 'data dashboards, API integrations, and custom analytics'

  // Internal team members whose names appear in emails
  // Format: first.last (without @domain) — used by AI to identify your POC
  INTERNAL_POC_NAMES: [
    'YOUR_POC_1_HERE',   // e.g. 'john.doe'
    'YOUR_POC_2_HERE',   // e.g. 'jane.smith'
    'YOUR_POC_3_HERE',
    'YOUR_POC_4_HERE',
    'YOUR_POC_5_HERE',
    'YOUR_POC_6_HERE'
  ],


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📧 EMAIL SETTINGS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  EMAIL_FROM: 'YOUR_SALES_REP_EMAIL_HERE',
  // e.g. 'john.doe@yourcompany.com'

  EMAIL_CC: 'YOUR_GROUP_EMAIL_HERE',
  // e.g. 'sales-team@yourcompany.com'

  TIME_WINDOW_HOURS: 24,
  // How many hours back to look for emails


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 GOOGLE SHEET SETTINGS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',
  // From your Sheet URL: https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit

  SHEET_NAME: 'YOUR_SHEET_TAB_NAME_HERE',
  // Must match the tab name exactly (case-sensitive)

  LOG_SHEET_NAME: 'Logs',
  // Name of the tab for execution logs (auto-created if missing)


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💬 SLACK SETTINGS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  SLACK_WEBHOOK_URL: 'YOUR_SLACK_WEBHOOK_URL_HERE',
  // Get from https://api.slack.com/messaging/webhooks
  // Format: https://hooks.slack.com/services/T.../B.../...

  SLACK_CHANNEL: 'YOUR_SLACK_CHANNEL_NAME_HERE',
  // Without the # — e.g. 'sales-leads'


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏰ AUTOMATION SCHEDULE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  TRIGGER_HOUR: 8,
  // Hour (0–23) when the script runs daily. 8 = 8 AM.


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔍 KEYWORD FILTERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ACTION_KEYWORDS: [
    // Quote/Pricing
    'quote', 'pricing', 'quotation', 'cost', 'budget',
    // Meeting/Call
    'meeting', 'call', 'discuss', 'schedule',
    // Technical
    'feasibility', 'sample', 'demo', 'trial',
    // Documentation
    'proposal', 'SOW', 'requirements', 'specifications',
    // Deal status
    'production', 'go live', 'launch', 'contract', 'signed', 'lost', 'won',
    // Issues/Support
    'issue', 'problem', 'error', 'bug', 'delayed', 'quality',
    'cancel', 'stop', 'unsubscribe', 'refund', 'complaint'
    // Add your own keywords below:
  ]
};

// ================================================================
// ⚠️ STOP HERE - Don't edit below unless you know JavaScript
// ================================================================

// ==================== ▶️ MAIN AUTOMATION ====================

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

    Logger.log('📧 Step 1: Fetching emails from Gmail...');
    const emails = fetchRecentEmails();
    emailsProcessed = emails.length;
    Logger.log(`   ✅ Found ${emails.length} emails to analyze`);
    Logger.log('');

    if (emails.length === 0) {
      Logger.log('ℹ️ No emails found. Exiting.');
      logExecution(startTime, new Date(), status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, '');
      return;
    }

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
      logExecution(startTime, new Date(), status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, '');
      return;
    }

    Logger.log('📊 Step 3: Updating Google Sheet...');
    writeToGoogleSheet(analyzedLeads);
    Logger.log('   ✅ Google Sheet updated');

    Logger.log('💬 Step 4: Posting to Slack...');
    postToSlack(analyzedLeads);
    Logger.log('   ✅ Slack message posted');

    Logger.log('=== ✅ Routine Complete! ===');
    logExecution(startTime, new Date(), status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, '');

  } catch (error) {
    status = 'Failed';
    errorMessage = error.message;
    Logger.log('=== ❌ ERROR ===');
    Logger.log('Error: ' + error.message);
    logExecution(startTime, new Date(), status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, errorMessage);
    sendErrorEmail(error);
  }
}


// ==================== EMAIL FETCHING ====================

function fetchRecentEmails() {
  const cutoffTime = new Date(Date.now() - CONFIG.TIME_WINDOW_HOURS * 60 * 60 * 1000);
  const cutoffStr = Utilities.formatDate(cutoffTime, Session.getScriptTimeZone(), 'yyyy/MM/dd');
  const query = `(from:${CONFIG.EMAIL_FROM} OR cc:${CONFIG.EMAIL_CC}) after:${cutoffStr}`;
  Logger.log(`Gmail Query: ${query}`);

  const threads = GmailApp.search(query, 0, 50);
  const emails = [];

  threads.forEach(thread => {
    const messages = thread.getMessages();
    const latestMessage = messages[messages.length - 1];
    emails.push({
      threadId: thread.getId(),
      messageId: latestMessage.getId(),
      date: latestMessage.getDate(),
      from: latestMessage.getFrom(),
      to: latestMessage.getTo(),
      cc: latestMessage.getCc(),
      subject: latestMessage.getSubject(),
      body: latestMessage.getPlainBody(),
      snippet: thread.getFirstMessageSubject()
    });
  });

  return emails;
}


// ==================== CHATGPT ANALYSIS ====================

function analyzeEmailsWithChatGPT(emails) {
  const prompt = buildAnalysisPrompt(emails);
  const pocList = CONFIG.INTERNAL_POC_NAMES.join(', ');
  const pocFirstNames = CONFIG.INTERNAL_POC_NAMES
    .map(name => name.split('.')[0])
    .map(n => n.charAt(0).toUpperCase() + n.slice(1))
    .join(', ');

  const requestBody = {
    model: CONFIG.OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a sales and customer support email analyzer for ${CONFIG.COMPANY_NAME}, ${CONFIG.COMPANY_DESCRIPTION}. Your job is to identify critical action items from emails and categorize them.

CONTEXT:
${CONFIG.COMPANY_NAME} provides ${CONFIG.COMPANY_SERVICES}. Typical projects involve client engagement across sales, delivery, and support.

ACTION TYPES TO DETECT:
1. Sales Actions:
   - Quote Request: Client asks for pricing/quotation
   - Meeting Request: Client wants to schedule call/meeting
   - Feasibility Check: Client asks if something is possible
   - Proposal Needed: Client asks for SOW, scope, proposal, or contract edits
   - Client Question: Technical questions about capabilities

2. Deal Status:
   - Deal Closed Won: Contract signed, going to production, launch mentioned
   - Deal Closed Lost: Client says put on hold or not moving forward
   - Production Ready: Client says "go live", "start", "begin delivery"

3. Customer Issues (ALWAYS HIGH PRIORITY):
   - Data Quality Issue: Client reports incorrect, missing, or bad data
   - Delivery Problem: Late delivery, missed deadline, delayed data
   - Service Issue: Technical problems
   - Cancellation Risk: Client mentions "cancel", "stop service", "unsubscribe", "refund"
   - Complaint: Client expresses frustration or dissatisfaction

RULES:
1. Extract internal POC (Point of Contact):
   - This is the @${CONFIG.COMPANY_DOMAIN} person in FROM, TO, or CC
   - Known team members: ${pocList}
   - Format as first name only (e.g., ${pocFirstNames.split(',')[0].trim()})

2. Extract lead name:
   - The person who is NOT @${CONFIG.COMPANY_DOMAIN}
   - This is usually the client/prospect

3. Extract company:
   - From email domain (e.g., user@acme.com → "Acme")
   - Leave blank for gmail/yahoo/outlook/hotmail addresses

4. Assign priority:
   - HIGH: Customer issues, cancellation risk, production blockers, explicit deadlines, "urgent/ASAP"
   - MEDIUM: General inquiries, meeting requests, feasibility questions

5. Write concise note describing the specific action needed.

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
    headers: { 'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}` },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
    const responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      throw new Error(`OpenAI API returned ${responseCode}`);
    }

    const result = JSON.parse(response.getContentText());
    const content = result.choices[0].message.content;
    const usage = result.usage || {};
    const inputTokens = usage.prompt_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;
    const cost = calculateCost(CONFIG.OPENAI_MODEL, inputTokens, outputTokens);
    const parsedContent = JSON.parse(content);
    const leads = parsedContent.leads || [];

    Logger.log(`ChatGPT returned ${leads.length} actionable leads`);
    return { leads, inputTokens, outputTokens, cost };

  } catch (error) {
    Logger.log(`Error calling ChatGPT: ${error.message}`);
    throw error;
  }
}

function calculateCost(model, inputTokens, outputTokens) {
  const pricing = {
    'gpt-3.5-turbo':       { input: 0.50,  output: 1.50 },
    'gpt-4-turbo-preview': { input: 10.00, output: 30.00 },
    'gpt-4-turbo':         { input: 10.00, output: 30.00 },
    'gpt-4':               { input: 30.00, output: 60.00 }
  };
  const rates = pricing[model] || pricing['gpt-3.5-turbo'];
  return (inputTokens / 1000000) * rates.input + (outputTokens / 1000000) * rates.output;
}

function buildAnalysisPrompt(emails) {
  const pocFirstName = CONFIG.INTERNAL_POC_NAMES.length > 0
    ? CONFIG.INTERNAL_POC_NAMES[0].split('.')[0]
    : 'TeamMember';
  const pocFirstNameCap = pocFirstName.charAt(0).toUpperCase() + pocFirstName.slice(1);

  const emailsText = emails.map((email, index) => `
EMAIL ${index + 1}:
From: ${email.from}
To: ${email.to}
CC: ${email.cc}
Subject: ${email.subject}
Date: ${email.date}
Body Preview: ${email.body.substring(0, 1000)}
Thread ID: ${email.threadId}
---`).join('\n');

  return `Analyze these emails and return ONLY actionable items in this exact JSON format:

{
  "leads": [
    {
      "email_index": 1,
      "thread_id": "...",
      "company_poc": "${pocFirstNameCap}",
      "lead_name": "John Doe",
      "lead_email": "john@company.com",
      "company": "Company Name",
      "action_type": "Quote Request|Meeting Request|Client Question|Feasibility Check|Proposal Needed|Contract Modification|Deal Closed Won|Deal Closed Lost|Production Ready|Data Quality Issue|Delivery Problem|Service Issue|Cancellation Risk|Complaint",
      "priority": "High|Medium",
      "note": "Brief description of what action is needed"
    }
  ]
}

IMPORTANT:
- company_poc = First name of @${CONFIG.COMPANY_DOMAIN} person
- lead_name = The client/prospect (NOT @${CONFIG.COMPANY_DOMAIN} person)
- action_type = Choose the MOST SPECIFIC type that matches
- priority = HIGH for: customer issues, cancellations, production blockers, urgent deadlines
- Only include emails that need ACTION. Exclude routine follow-ups, thank you notes, acknowledgments.

Emails to analyze:
${emailsText}

Remember: Only return valid JSON, no markdown formatting.`;
}


// ==================== GOOGLE SHEETS ====================

function getOrCreateLeadsSheet() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    Logger.log(`   📝 Sheet "${CONFIG.SHEET_NAME}" not found. Creating it now...`);
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);

    const headers = [
      'Date', 'Day', 'Time',
      CONFIG.COMPANY_NAME + ' POC',
      'Sender Name', 'Sender Email', 'Subject',
      'Lead Name', 'Lead Email', 'Company',
      'Action Type', 'Priority', 'Note', 'Email Link'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setColumnWidth(1, 100);
    sheet.setColumnWidth(2, 90);
    sheet.setColumnWidth(3, 80);
    sheet.setColumnWidth(4, 110);
    sheet.setColumnWidth(5, 150);
    sheet.setColumnWidth(6, 200);
    sheet.setColumnWidth(7, 250);
    sheet.setColumnWidth(8, 150);
    sheet.setColumnWidth(9, 200);
    sheet.setColumnWidth(10, 150);
    sheet.setColumnWidth(11, 140);
    sheet.setColumnWidth(12, 100);
    sheet.setColumnWidth(13, 300);
    sheet.setColumnWidth(14, 180);
    sheet.setFrozenRows(1);

    Logger.log(`   ✅ Sheet "${CONFIG.SHEET_NAME}" created with headers`);
  }

  return sheet;
}

function writeToGoogleSheet(leads) {
  const sheet = getOrCreateLeadsSheet();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const rows = leads.map(lead => {
    const emailDate = new Date();
    return [
      Utilities.formatDate(emailDate, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      dayNames[emailDate.getDay()],
      Utilities.formatDate(emailDate, Session.getScriptTimeZone(), 'HH:mm'),
      lead.company_poc || '',
      lead.sender_name || lead.lead_name || '',
      lead.sender_email || lead.lead_email || '',
      lead.subject || '',
      lead.lead_name || '',
      lead.lead_email || '',
      lead.company || '',
      lead.action_type || 'Unknown',
      lead.priority || 'Medium',
      lead.note || '',
      `https://mail.google.com/mail/u/0/#inbox/${lead.thread_id}`
    ];
  });

  if (rows.length > 0) {
    sheet.insertRowsAfter(1, rows.length);
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  Logger.log(`   ✅ Inserted ${rows.length} rows at top of sheet`);
}


// ==================== SLACK INTEGRATION ====================

function postToSlack(leads) {
  if (!CONFIG.SLACK_WEBHOOK_URL || CONFIG.SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
    Logger.log('   ℹ️ Slack webhook not configured. Skipping.');
    return;
  }

  const highPriority = leads.filter(l => l.priority === 'High');
  const mediumPriority = leads.filter(l => l.priority === 'Medium');

  let message = `🚨 *Daily Sales Leads - ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')}*\n\n`;
  message += `*${leads.length} action items* from emails in the last ${CONFIG.TIME_WINDOW_HOURS} hours:\n\n`;

  function buildTableSection(sectionLeads, priorityLabel, emoji) {
    if (sectionLeads.length === 0) return '';
    let section = `*${emoji} ${priorityLabel}*\n\`\`\`\n`;
    section += 'POC       | Lead              | Company           | Action\n';
    section += '----------|-------------------|-------------------|------------------\n';
    sectionLeads.forEach(lead => {
      const poc     = (lead.company_poc || 'Unknown').substring(0, 9).padEnd(9);
      const leadName = (lead.lead_name || 'Unknown').substring(0, 17).padEnd(17);
      const company  = (lead.company || 'N/A').substring(0, 17).padEnd(17);
      const action   = (lead.action_type || 'Unknown').substring(0, 18);
      section += `${poc} | ${leadName} | ${company} | ${action}\n`;
    });
    section += '\`\`\`\n_Details:_\n';
    sectionLeads.forEach((lead, index) => {
      section += `${index + 1}. *${lead.lead_name}* - ${lead.note || 'No details'} - <https://mail.google.com/mail/u/0/#inbox/${lead.thread_id}|View Email>\n`;
    });
    return section + '\n';
  }

  message += buildTableSection(highPriority, 'HIGH PRIORITY', '🔴');
  message += buildTableSection(mediumPriority, 'MEDIUM PRIORITY', '🟡');
  message += `\n📊 Full details: https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}`;

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: message, channel: `#${CONFIG.SLACK_CHANNEL}` }),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(CONFIG.SLACK_WEBHOOK_URL, options);
    if (response.getResponseCode() !== 200) {
      Logger.log(`   ⚠️ Slack webhook error: ${response.getContentText()}`);
    } else {
      Logger.log('   ✅ Slack message posted');
    }
  } catch (error) {
    Logger.log(`   ⚠️ Error posting to Slack: ${error.message}`);
  }
}


// ==================== EXECUTION LOGGING ====================

function getOrCreateLogSheet() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let logSheet = spreadsheet.getSheetByName(CONFIG.LOG_SHEET_NAME);

  if (!logSheet) {
    logSheet = spreadsheet.insertSheet(CONFIG.LOG_SHEET_NAME);
    const headers = [
      'Timestamp', 'Date', 'Time', 'Day', 'Status',
      'Emails Processed', 'Leads Found', 'Model Used',
      'Input Tokens', 'Output Tokens', 'Total Tokens',
      'Estimated Cost ($)', 'Runtime (sec)', 'Error Message'
    ];
    logSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    logSheet.setColumnWidth(1, 180); logSheet.setColumnWidth(2, 100);
    logSheet.setColumnWidth(3, 80);  logSheet.setColumnWidth(4, 100);
    logSheet.setColumnWidth(5, 100); logSheet.setColumnWidth(6, 140);
    logSheet.setColumnWidth(7, 120); logSheet.setColumnWidth(8, 120);
    logSheet.setColumnWidth(9, 120); logSheet.setColumnWidth(10, 120);
    logSheet.setColumnWidth(11, 120); logSheet.setColumnWidth(12, 150);
    logSheet.setColumnWidth(13, 120); logSheet.setColumnWidth(14, 300);
    logSheet.setFrozenRows(1);
  }

  return logSheet;
}

function logExecution(startTime, endTime, status, emailsProcessed, leadsFound, inputTokens, outputTokens, estimatedCost, errorMessage) {
  try {
    const logSheet = getOrCreateLogSheet();
    const runtime = (endTime.getTime() - startTime.getTime()) / 1000;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const row = [
      startTime,
      Utilities.formatDate(startTime, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      Utilities.formatDate(startTime, Session.getScriptTimeZone(), 'HH:mm:ss'),
      dayNames[startTime.getDay()],
      status,
      emailsProcessed,
      leadsFound,
      CONFIG.OPENAI_MODEL,
      inputTokens,
      outputTokens,
      inputTokens + outputTokens,
      estimatedCost,
      runtime.toFixed(2),
      errorMessage || ''
    ];

    logSheet.insertRowAfter(1);
    logSheet.getRange(2, 1, 1, row.length).setValues([row]);
    logSheet.getRange(2, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    logSheet.getRange(2, 12).setNumberFormat('$0.0000');

    const statusCell = logSheet.getRange(2, 5);
    if (status === 'Success') {
      statusCell.setBackground('#d9ead3').setFontColor('#274e13');
    } else if (status === 'Failed') {
      statusCell.setBackground('#f4cccc').setFontColor('#990000');
    } else {
      statusCell.setBackground('#fff2cc').setFontColor('#7f6000');
    }

    Logger.log(`   📊 Execution logged to "${CONFIG.LOG_SHEET_NAME}" sheet`);
  } catch (error) {
    Logger.log(`   ⚠️ Failed to log execution: ${error.message}`);
  }
}


// ==================== ERROR HANDLING ====================

function sendErrorEmail(error) {
  const recipient = Session.getActiveUser().getEmail();
  const subject = '⚠️ Daily Sales Leads Routine Failed';
  const body = `Hi,

Your Daily Sales Leads routine encountered an error.

ERROR: ${error.message}

WHAT TO DO:
1. Open Apps Script editor
2. Click "Executions" in the left sidebar
3. Find the failed run and check the error details

---
Automated message from Apps Script`.trim();

  try {
    GmailApp.sendEmail(recipient, subject, body);
  } catch (e) {
    Logger.log('⚠️ Could not send error email: ' + e.message);
  }
}


// ==================== SETUP ====================

function setupTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'dailySalesLeadsRoutine') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('dailySalesLeadsRoutine')
    .timeBased()
    .everyDays(1)
    .atHour(CONFIG.TRIGGER_HOUR)
    .create();

  Logger.log('✅ Daily trigger created!');
  Logger.log(`📅 Script will run every day at ${CONFIG.TRIGGER_HOUR}:00`);
}
