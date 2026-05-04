# Sales Email Summarizer — Google Apps Script + ChatGPT + Slack Notification

A Google Apps Script automation that scans your Gmail for sales and support emails, analyzes them with ChatGPT, logs actionable leads to Google Sheets, and posts a daily summary to Slack.

---

## What It Does

- Scans Gmail for emails from your sales rep or CC'd to your group inbox
- Sends emails to ChatGPT for analysis and action-item extraction
- Classifies each email by action type (Quote Request, Meeting Request, Complaint, etc.) and priority (High / Medium)
- Writes results to a Google Sheet with one row per lead
- Posts a formatted summary table to a Slack channel
- Logs every run (tokens used, cost, duration, errors) to a Logs sheet
- Sends you an error email if the routine fails

---

## Setup

### Step 1 — Copy files into Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Create script files and paste the contents:
   - `code.gs` → main logic + configuration
   - `menu.gs` → adds the Run menu to your sheet
   - `testing function.gs` → test helpers

### Step 2 — Fill in the CONFIG block in `code.gs`

All settings are in the `CONFIG` object at the top of `code.gs`. Fill in every placeholder:

```javascript
const CONFIG = {
  // OpenAI
  OPENAI_API_KEY:        'YOUR_OPENAI_API_KEY_HERE',
  OPENAI_MODEL:          'gpt-3.5-turbo',

  // Your company
  COMPANY_NAME:          'YOUR_COMPANY_NAME_HERE',        // e.g. 'Acme Corp'
  COMPANY_DOMAIN:        'YOUR_COMPANY_EMAIL_DOMAIN_HERE', // e.g. 'acme.com'
  COMPANY_DESCRIPTION:   'YOUR_COMPANY_DESCRIPTION_HERE',
  COMPANY_SERVICES:      'YOUR_SERVICES_DESCRIPTION_HERE',
  INTERNAL_POC_NAMES:    ['first.last', 'first.last', ...], // your team members

  // Email filters
  EMAIL_FROM:            'YOUR_SALES_REP_EMAIL_HERE',
  EMAIL_CC:              'YOUR_GROUP_EMAIL_HERE',
  TIME_WINDOW_HOURS:     24,

  // Google Sheet
  SHEET_ID:              'YOUR_GOOGLE_SHEET_ID_HERE',
  SHEET_NAME:            'YOUR_SHEET_TAB_NAME_HERE',
  LOG_SHEET_NAME:        'Logs',

  // Slack
  SLACK_WEBHOOK_URL:     'YOUR_SLACK_WEBHOOK_URL_HERE',
  SLACK_CHANNEL:         'YOUR_SLACK_CHANNEL_NAME_HERE',

  // Schedule
  TRIGGER_HOUR:          8,  // 0–23
};
```

### Step 3 — Get your credentials

**OpenAI API Key**
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new key — it starts with `sk-`
3. Paste into `OPENAI_API_KEY`

**Google Sheet ID**
From your sheet URL:
```
https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit
```

**Slack Webhook URL**
1. Go to [api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)
2. Create a new webhook for your workspace
3. Paste the URL into `SLACK_WEBHOOK_URL`

### Step 4 — Test before automating

Run each test function from the Apps Script editor (use the function dropdown → Run):

| Function | What it tests |
|---|---|
| `testAPIKey()` | OpenAI key format check |
| `testFetchEmails()` | Gmail connection and query |
| `testChatGPT()` | ChatGPT analysis on first 3 emails |
| `testSheetWrite()` | Google Sheet access and write |
| `testSlackWebhook()` | Slack message delivery |
| `testLogSheet()` | Log sheet creation |
| `testFullRoutine()` | End-to-end run |

### Step 5 — Enable daily automation

```
Run → setupTrigger()
```

This creates a daily trigger at the hour set in `TRIGGER_HOUR`. To verify: click the **Triggers** (⏰) icon in the left sidebar.

---

## Configuration Reference

All settings live in the `CONFIG` block in `code.gs`. No other file needs editing.

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | Your OpenAI Private App token |
| `OPENAI_MODEL` | ✅ | GPT model to use (`gpt-3.5-turbo` recommended) |
| `COMPANY_NAME` | ✅ | Your company name — used in AI prompt and sheet headers |
| `COMPANY_DOMAIN` | ✅ | Your email domain — used to identify internal staff |
| `COMPANY_DESCRIPTION` | ✅ | One-line description of your company |
| `COMPANY_SERVICES` | ✅ | What your company does — gives ChatGPT context |
| `INTERNAL_POC_NAMES` | ✅ | Array of `first.last` names for your team |
| `EMAIL_FROM` | ✅ | Email address to scan (FROM filter) |
| `EMAIL_CC` | ✅ | Group email to scan (CC filter) |
| `TIME_WINDOW_HOURS` | ✅ | Hours back to look for emails |
| `SHEET_ID` | ✅ | Google Sheet ID from the URL |
| `SHEET_NAME` | ✅ | Tab name for leads output |
| `LOG_SHEET_NAME` | — | Tab name for execution logs (default: `Logs`) |
| `SLACK_WEBHOOK_URL` | — | Slack webhook URL (skip to disable Slack) |
| `SLACK_CHANNEL` | — | Slack channel name without `#` |
| `TRIGGER_HOUR` | — | Hour (0–23) for daily automation (default: `8`) |

---

## Action Types Detected

| Category | Action Types |
|---|---|
| Sales | Quote Request, Meeting Request, Feasibility Check, Proposal Needed, Client Question |
| Deal Status | Deal Closed Won, Deal Closed Lost, Production Ready |
| Customer Issues | Data Quality Issue, Delivery Problem, Service Issue, Cancellation Risk, Complaint |

**Priority rules:**
- **HIGH** — Customer issues, cancellation risk, production blockers, explicit deadlines
- **MEDIUM** — General inquiries, meeting requests, feasibility questions

---

## Output

### Google Sheet columns

| Column | Description |
|---|---|
| Date / Day / Time | When the email was processed |
| `{Company} POC` | First name of your internal team member |
| Sender Name / Email | Who sent the email |
| Subject | Email subject line |
| Lead Name / Email | The client or prospect |
| Company | Extracted from email domain |
| Action Type | Classified action (see table above) |
| Priority | High or Medium |
| Note | What action is needed |
| Email Link | Direct link to the Gmail thread |

### Slack message format

```
🚨 Daily Sales Leads - 2026-05-04

5 action items from emails in the last 24 hours:

🔴 HIGH PRIORITY
POC       | Lead              | Company           | Action
----------|-------------------|-------------------|------------------
John      | Client Name       | Acme Corp         | Cancellation Risk

🟡 MEDIUM PRIORITY
...
```

---

## File Structure

```
code.gs                ← Main logic + CONFIG block (edit here)
menu.gs                ← Adds "Run functions" menu to Google Sheet
testing function.gs    ← Test helpers (run manually to verify setup)
README.md              ← This file
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| "API key not set" | Set `OPENAI_API_KEY` in CONFIG |
| "Found 0 emails" | Check `EMAIL_FROM` and `EMAIL_CC` match real addresses |
| Sheet not found | Verify `SHEET_NAME` matches the tab name exactly (case-sensitive) |
| Slack not posting | Verify `SLACK_WEBHOOK_URL` and `SLACK_CHANNEL` are correct |
| Wrong POC names | Update `INTERNAL_POC_NAMES` with your team's `first.last` usernames |
| Script times out | Reduce `TIME_WINDOW_HOURS` or limit Gmail results |

---

**Version:** 1.3.0 | **Last Updated:** May 2026 | **Status:** Internal use only
