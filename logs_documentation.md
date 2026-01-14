# Application Logging Audit

## server/index.ts
* **Code:** `console.error('[CRASH] Uncaught Exception:', err);` (lines 17-20)
* **Purpose:** Catches and logs fatal uncaught exceptions that would crash the application.
* **Importance:** Critical - Without this, crashes may go unnoticed.
* **Risk Factor:** Low
    * Only logs errors, no sensitive data.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('[CRASH] Unhandled Rejection at:', promise, 'reason:', reason);` (lines 22-25)
* **Purpose:** Catches unhandled promise rejections that could crash the server.
* **Importance:** Critical - Prevents silent failures.
* **Risk Factor:** Low
    * Logs promise and reason, unlikely to contain sensitive data.
* **User Visibility:** No (Server-side only)

---

* **Code:** `console.log("--- SYSTEM STARTUP: v2.5 (Email Debug Mode) ---");` (line 81)
* **Purpose:** Indicates system startup version for debugging.
* **Importance:** Debug - Useful for troubleshooting startup issues.
* **Risk Factor:** Low
    * Generic startup message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error("[Startup] Testing Database Connection...");` (line 82)
* **Purpose:** Logs when database connection test begins.
* **Importance:** Debug - Startup debugging only.
* **Risk Factor:** Low
    * Generic status message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error(`[Startup] PROBE RESULT: Found ${rows[0].count} users in 'profiles' table.`);` (line 84)
* **Purpose:** Logs user count from database probe.
* **Importance:** Debug - Startup verification.
* **Risk Factor:** Low
    * Only logs count, not user data.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error(`[Startup] PROBE RESULT: Found ${pages[0].count} pages in 'pages' table.`);` (line 87)
* **Purpose:** Logs page count from database probe.
* **Importance:** Debug - Startup verification.
* **Risk Factor:** Low
    * Only logs count, not page data.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error("!!! KILO UPDATE APPLIED: v3 SESSIONS !!!");` (line 90)
* **Purpose:** Indicates specific update has been applied.
* **Importance:** Debug - Deployment tracking.
* **Risk Factor:** Low
    * Generic status message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error("[Startup] CRITICAL DB ERROR:", err.message);` (line 92)
* **Purpose:** Logs critical database connection errors during startup.
* **Importance:** Critical - Without this, startup failures are hard to diagnose.
* **Risk Factor:** Medium
    * May expose connection details or error stack traces.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('[ERROR]', err);` (line 106)
* **Purpose:** Global error handler - logs any unhandled errors.
* **Importance:** Critical - Catches all errors that bypass other handlers.
* **Risk Factor:** Medium
    * Full error stack trace could expose internal paths or logic.
* **User Visibility:** No (Server-side only)

---

* **Code:** `console.error(`[Server] Listening on port ${port}`);` (line 120)
* **Purpose:** Logs when server begins listening for connections.
* **Importance:** Debug - Startup confirmation.
* **Risk Factor:** Low
    * Only logs port number.
* **User Visibility:** No (Server-side only)

---

* **Code:** `log(logLine);` (line 72 in logging middleware)
* **Purpose:** Logs API request details including response body.
* **Importance:** Debug - Request monitoring.
* **Risk Factor:** **HIGH**
    * **WARNING:** Logs `JSON.stringify(capturedJsonResponse)` which could include full response bodies, potentially containing sensitive user data or internal system information.
* **User Visibility:** No (Server-side only)

---

## server/routes.ts
* **Code:** `console.log('[Route] Hit /api/test-email');` (line 18)
* **Purpose:** Logs when test email endpoint is hit.
* **Importance:** Debug - Route monitoring.
* **Risk Factor:** Low
    * Generic route hit indicator.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log(`Sending test email to: ${email}`);` (line 25)
* **Purpose:** Logs email address when sending test email.
* **Importance:** Debug - Email debugging.
* **Risk Factor:** Medium
    * Logs email address which could be PII.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log(`Test email sent successfully to: ${email}`);` (line 34)
* **Purpose:** Confirms email was sent successfully.
* **Importance:** Debug - Success confirmation.
* **Risk Factor:** Medium
    * Logs email address.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error(`Failed to send test email to: ${email}`);` (line 37)
* **Purpose:** Logs email failure with recipient address.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Logs email address.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Test email error:', error);` (line 41)
* **Purpose:** Logs email service errors.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Full error object may contain sensitive details.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Get user pages error:', error);` (line 101)
* **Purpose:** Logs errors when fetching user pages.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Error stack trace could expose internal paths.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Create user error:', error);` (line 111)
* **Purpose:** Logs errors when creating a user.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Error stack trace could expose internal paths.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Update user error:', error);` (line 121)
* **Purpose:** Logs errors when updating a user.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Error stack trace could expose internal paths.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Assign pages error:', error);` (line 138)
* **Purpose:** Logs errors when assigning pages to users.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Error stack trace could expose internal paths.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log(`[Route] Resetting password for user ${req.params.id}`);` (line 145)
* **Purpose:** Logs password reset operations.
* **Importance:** Debug - Operation audit trail.
* **Risk Factor:** Low
    * Only logs user ID, not the password itself.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Reset password error:', error);` (line 149)
* **Purpose:** Logs password reset failures.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Error stack trace could expose internal paths.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log(`[Route] Deleting user ${req.params.id}`);` (line 156)
* **Purpose:** Logs user deletion operations.
* **Importance:** Debug - Operation audit trail.
* **Risk Factor:** Low
    * Only logs user ID.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Delete user error:', error);` (line 160)
* **Purpose:** Logs user deletion failures.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Error stack trace could expose internal paths.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log(`[Auth] Password changed successfully for user ${user.email}`);` (line 248)
* **Purpose:** Logs successful password changes.
* **Importance:** Debug - Security audit trail.
* **Risk Factor:** Medium
    * Logs email address.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Change password error:', error);` (line 251)
* **Purpose:** Logs password change failures.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Error stack trace could expose internal paths.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Get page by slug error:', error);` (line 289)
* **Purpose:** Logs errors when fetching page by slug.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Error stack trace could expose internal paths.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('PowerBI Embed Error:', error);` (line 315)
* **Purpose:** Logs Power BI embed failures.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Error stack trace could expose internal paths.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log(`[Auth] Password successfully reset for user ${user.email}`);` (line 340)
* **Purpose:** Logs successful password reset completion.
* **Importance:** Debug - Security audit trail.
* **Risk Factor:** Medium
    * Logs email address.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Reset confirm error:', error);` (line 343)
* **Purpose:** Logs password reset confirmation failures.
* **Importance:** Debug - Error debugging.
* **Risk Factor:** Medium
    * Error stack trace could expose internal paths.
* **User Visibility:** No (Server-side only)

---

## server/storage.ts
* **Code:** `EmailService.log(`Storage: Attempting to send invitation to ${user.email}`);` (line 113)
* **Purpose:** Logs when attempting to send user invitation email.
* **Importance:** Debug - Email operation tracking.
* **Risk Factor:** Medium
    * Logs email address (PII).
* **User Visibility:** No (Server-side only)

---
* **Code:** `EmailService.log(`Storage: Invitation email returned FALSE for ${user.email}`, true);` (line 117)
* **Purpose:** Logs when invitation email returns false status.
* **Importance:** Debug - Email delivery tracking.
* **Risk Factor:** Medium
    * Logs email address (PII).
* **User Visibility:** No (Server-side only)

---
* **Code:** `EmailService.log(`Storage: Invitation email sent successfully to ${user.email}`);` (line 119)
* **Purpose:** Logs successful invitation email delivery.
* **Importance:** Debug - Email delivery confirmation.
* **Risk Factor:** Medium
    * Logs email address (PII).
* **User Visibility:** No (Server-side only)

---
* **Code:** `EmailService.log(`Storage: Exception sending invitation to ${user.email}: ${error.message}`, true);` (line 122)
* **Purpose:** Logs exceptions during invitation email sending.
* **Importance:** Debug - Error tracking.
* **Risk Factor:** Medium
    * Logs email address and error message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `EmailService.log(`Storage: Attempting password reset email for ${user.email}`);` (line 163)
* **Purpose:** Logs when attempting to send password reset email.
* **Importance:** Debug - Security operation tracking.
* **Risk Factor:** Medium
    * Logs email address (PII).
* **User Visibility:** No (Server-side only)

---
* **Code:** `EmailService.log(`Storage: Password reset email returned FALSE for ${user.email}`, true);` (line 167)
* **Purpose:** Logs password reset email delivery failures.
* **Importance:** Debug - Email delivery tracking.
* **Risk Factor:** Medium
    * Logs email address (PII).
* **User Visibility:** No (Server-side only)

---
* **Code:** `EmailService.log(`Storage: Password reset email sent to ${user.email}`);` (line 170)
* **Purpose:** Logs successful password reset email delivery.
* **Importance:** Debug - Security operation confirmation.
* **Risk Factor:** Medium
    * Logs email address (PII).
* **User Visibility:** No (Server-side only)

---
* **Code:** `EmailService.log(`Storage: Exception sending password reset to ${user.email}: ${error.message}`, true);` (line 172)
* **Purpose:** Logs exceptions during password reset email.
* **Importance:** Debug - Error tracking.
* **Risk Factor:** Medium
    * Logs email address and error message.
* **User Visibility:** No (Server-side only)

---

## server/services/auth.ts
* **Code:** `console.log(`[Auth] 1. Starting login for: ${email}`);` (line 56)
* **Purpose:** Logs login attempt with email.
* **Importance:** Debug - Authentication audit trail.
* **Risk Factor:** Medium
    * Logs email address (PII).
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log('[Auth] User not found');` (line 64)
* **Purpose:** Logs when login fails due to user not found.
* **Importance:** Debug - Authentication debugging.
* **Risk Factor:** Low
    * Generic message, no data disclosure.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log(`[Auth] 2. User found: ${user.id} (Active: ${user.is_active})`);` (line 67)
* **Purpose:** Logs when user is found with ID and active status.
* **Importance:** Debug - Authentication flow tracking.
* **Risk Factor:** Medium
    * Logs user ID.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log('[Auth] User has NO password set');` (line 73)
* **Purpose:** Logs when user has no password set.
* **Importance:** Debug - Authentication debugging.
* **Risk Factor:** Low
    * Generic message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log('[Auth] Invalid password');` (line 79)
* **Purpose:** Logs when password verification fails.
* **Importance:** Debug - Authentication debugging.
* **Risk Factor:** Low
    * Generic message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log('[Auth] 3. Password verified');` (line 82)
* **Purpose:** Logs successful password verification.
* **Importance:** Debug - Authentication flow tracking.
* **Risk Factor:** Low
    * Generic success indicator.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log('[Auth] 4. Inserting session...');` (line 88)
* **Purpose:** Logs session creation start.
* **Importance:** Debug - Session management tracking.
* **Risk Factor:** Low
    * Generic status message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log('[Auth] Session created successfully');` (line 94)
* **Purpose:** Logs successful session creation.
* **Importance:** Debug - Session management confirmation.
* **Risk Factor:** Low
    * Generic success indicator.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('[Auth] CRITICAL: Failed to create session:', sessError);` (line 96)
* **Purpose:** Logs critical session creation failures.
* **Importance:** Critical - Without this, session issues are hard to debug.
* **Risk Factor:** Medium
    * Session error details.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.log('[Auth] 5. Updating lastAccess...');` (line 102)
* **Purpose:** Logs lastAccess update start.
* **Importance:** Debug - Activity tracking.
* **Risk Factor:** Low
    * Generic status message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('[Auth] WARNING: Failed to update lastAccess (ignoring):', updateError);` (line 108)
* **Purpose:** Logs lastAccess update failures (non-critical).
* **Importance:** Debug - Warning logging.
* **Risk Factor:** Medium
    * Error details.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('[Auth] UNEXPECTED ERROR during login:', error);` (line 124)
* **Purpose:** Logs unexpected errors during login.
* **Importance:** Critical - Catches unknown errors.
* **Risk Factor:** Medium
    * Full error stack trace.
* **User Visibility:** No (Server-side only)

---

## server/services/email.ts
* **Code:** `console.error("CRITICAL: Failed to write to email-debug.log", err);` (line 27)
* **Purpose:** Logs failures when writing to the email debug log file.
* **Importance:** Critical - Without this, logging failures may go unnoticed.
* **Risk Factor:** Medium
    * Error details.
* **User Visibility:** No (Server-side only)

---
* **Code:** `this.log(`Configuring Transporter - Host: ${process.env.SMTP_HOST}, Port: ${port}, Secure: ${secure}, User: ${process.env.SMTP_USER}`);` (line 46)
* **Purpose:** Logs SMTP configuration (without password).
* **Importance:** Debug - Configuration verification.
* **Risk Factor:** Medium
    * Logs SMTP host and user, but NOT password.
* **User Visibility:** No (Server-side only)

---
* **Code:** `this.log(`Start sendEmail to: ${params.to}`);` (line 73)
* **Purpose:** Logs email sending initiation.
* **Importance:** Debug - Email operation tracking.
* **Risk Factor:** Medium
    * Logs recipient email address (PII).
* **User Visibility:** No (Server-side only)

---
* **Code:** `this.log('ERROR: SMTP_HOST env variable is missing', true);` (line 76)
* **Purpose:** Logs missing SMTP configuration.
* **Importance:** Debug - Configuration error tracking.
* **Risk Factor:** Low
    * Configuration error indicator.
* **User Visibility:** No (Server-side only)

---
* **Code:** `this.log(`Sending mail from ${fromAddress} to ${params.to}`);` (line 87)
* **Purpose:** Logs email sending progress.
* **Importance:** Debug - Email operation tracking.
* **Risk Factor:** Medium
    * Logs email addresses.
* **User Visibility:** No (Server-side only)

---
* **Code:** `this.log(`Email sent successfully! Message ID: ${info.messageId}`);` (line 97)
* **Purpose:** Logs successful email delivery.
* **Importance:** Debug - Email delivery confirmation.
* **Risk Factor:** Low
    * Only logs message ID.
* **User Visibility:** No (Server-side only)

---
* **Code:** `this.log(`SENDING FAILED: ${error.message}`, true);` (line 100)
* **Purpose:** Logs email sending failures.
* **Importance:** Debug - Error tracking.
* **Risk Factor:** Medium
    * Error message.
* **User Visibility:** No (Server-side only)

---

## server/services/encryption.ts
* **Code:** `console.error('Encryption error:', error);` (line 40)
* **Purpose:** Logs encryption operation failures.
* **Importance:** Debug - Security operation error tracking.
* **Risk Factor:** Medium
    * Error details could expose encryption issues.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('Decryption error:', error);` (line 64)
* **Purpose:** Logs decryption operation failures.
* **Importance:** Debug - Security operation error tracking.
* **Risk Factor:** Medium
    * Error details could expose encryption issues.
* **User Visibility:** No (Server-side only)

---

## server/services/powerbi.ts
* **Code:** `console.error(`[PowerBI] Requesting AD Token for Tenant: ${config.tenantId}`);` (line 27)
* **Purpose:** Logs Azure AD token request with tenant ID.
* **Importance:** Debug - OAuth flow tracking.
* **Risk Factor:** Medium
    * Logs tenant ID.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error(`[PowerBI] AD Token Error: ${response.status} - ${err}`);` (line 44)
* **Purpose:** Logs Azure AD token request failures.
* **Importance:** Debug - OAuth error tracking.
* **Risk Factor:** Medium
    * Logs error details.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error(`[PowerBI] Got AD Token. Expires in: ${data.expires_in}`);` (line 49)
* **Purpose:** Logs successful AD token acquisition.
* **Importance:** Debug - OAuth flow confirmation.
* **Risk Factor:** Low
    * Only logs expiration time.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error(`[PowerBI] Starting Embed Flow for Report: ${reportId} in Workspace: ${workspaceId}`);` (line 56)
* **Purpose:** Logs Power BI embed flow initiation.
* **Importance:** Debug - Integration flow tracking.
* **Risk Factor:** Low
    * Only logs IDs.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error(`[PowerBI] Fetching Report Details...`);` (line 62)
* **Purpose:** Logs report details fetch start.
* **Importance:** Debug - Integration flow tracking.
* **Risk Factor:** Low
    * Generic status message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error(`[PowerBI] Report Found: ${reportData.name} (${reportData.embedUrl})`);` (line 72)
* **Purpose:** Logs when Power BI report is found.
* **Importance:** Debug - Integration flow tracking.
* **Risk Factor:** Low
    * Logs report name and embed URL.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error(`[PowerBI] Generating Embed Token...`);` (line 76)
* **Purpose:** Logs embed token generation start.
* **Importance:** Debug - Integration flow tracking.
* **Risk Factor:** Low
    * Generic status message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error(`[PowerBI] Embed Token Generated Successfully.`);` (line 94)
* **Purpose:** Logs successful embed token generation.
* **Importance:** Debug - Integration flow confirmation.
* **Risk Factor:** Low
    * Generic success message.
* **User Visibility:** No (Server-side only)

---
* **Code:** `console.error('[PowerBI] FATAL ERROR:', error.message);` (line 103)
* **Purpose:** Logs fatal Power BI integration errors.
* **Importance:** Critical - Major integration failures.
* **Risk Factor:** Medium
    * Error message.
* **User Visibility:** No (Server-side only)

---

## client/src/pages/dashboard-view.tsx
* **Code:** `console.log(' [Frontend] Dashboard Data Loaded:', dashboard);` (line 18)
* **Purpose:** Logs dashboard data when loaded.
* **Importance:** Debug - Frontend data debugging.
* **Risk Factor:** Medium
    * Logs full dashboard data to browser console.
* **User Visibility:** **Yes (Client-side - visible in browser devtools)**

---

## client/src/components/powerbi/powerbi-embed.tsx
* **Code:** `console.error(e);` (line 42)
* **Purpose:** Catches and logs cleanup errors in Power BI embed.
* **Importance:** Debug - Error handling.
* **Risk Factor:** Low
    * Generic error logging.
* **User Visibility:** Yes (Client-side)

---
* **Code:** `console.log('Power BI report loaded successfully');` (line 82)
* **Purpose:** Logs successful Power BI report load.
* **Importance:** Debug - Success confirmation.
* **Risk Factor:** Low
    * Generic success message.
* **User Visibility:** Yes (Client-side)

---
* **Code:** `console.error('Power BI embed error:', event.detail);` (line 86)
* **Purpose:** Logs Power BI embed errors.
* **Importance:** Debug - Error tracking.
* **Risk Factor:** Low
    * Error details.
* **User Visibility:** Yes (Client-side)

---
* **Code:** `console.error('Error embedding Power BI report:', error);` (line 91)
* **Purpose:** Logs general Power BI embedding errors.
* **Importance:** Debug - Error tracking.
* **Risk Factor:** Low
    * Error details.
* **User Visibility:** Yes (Client-side)

---

## client/src/components/layout/top-navigation.tsx
* **Code:** `console.error('Logout error:', error);` (line 63)
* **Purpose:** Logs logout operation errors.
* **Importance:** Debug - Error tracking.
* **Risk Factor:** Low
    * Error details.
* **User Visibility:** Yes (Client-side)

---

## client/src/components/admin/page-form-modal.tsx
* **Code:** `console.log(' [Frontend] Server Response (Saved):', result);` (line 89)
* **Purpose:** Logs server response when page is saved.
* **Importance:** Debug - Form submission debugging.
* **Risk Factor:** Medium
    * Logs full server response to browser console.
* **User Visibility:** Yes (Client-side)

---
* **Code:** `console.error(" [Frontend] Validation Errors:", errors);` (line 111)
* **Purpose:** Logs form validation errors.
* **Importance:** Debug - Form debugging.
* **Risk Factor:** Low
    * Validation error details.
* **User Visibility:** Yes (Client-side)

---

## Summary

### High Risk Items
| Location | Issue |
|----------|-------|
| server/index.ts (line 70) | Logging middleware logs full JSON response bodies which could contain sensitive user data |

### Files with Client-Side Log Exposure (User Visible)
| File | Count |
|------|-------|
| client/src/pages/dashboard-view.tsx | 1 |
| client/src/components/powerbi/powerbi-embed.tsx | 4 |
| client/src/components/layout/top-navigation.tsx | 1 |
| client/src/components/admin/page-form-modal.tsx | 2 |

### Servers with PII Logging (Email Addresses)
| File | Count |
|------|-------|
| server/routes.ts | 7 |
| server/storage.ts | 6 |
| server/services/auth.ts | 1 |
| server/services/email.ts | 3 |