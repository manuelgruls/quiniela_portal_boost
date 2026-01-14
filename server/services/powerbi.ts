import { storage } from '../storage';
import { EncryptionService } from './encryption';

interface PowerBIConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export class PowerBIService {

  // 1. Get Config from DB
  private static async getConfig(): Promise<PowerBIConfig> {
    const settings = await storage.getAzureSettings();
    if (!settings) throw new Error("Azure settings not configured in Admin Panel.");

    return {
      clientId: settings.clientId,
      tenantId: settings.tenantId,
      clientSecret: EncryptionService.decrypt(settings.clientSecretCipher)
    };
  }

  // 2. Get Azure AD Access Token (Service Principal)
  // We use raw fetch to avoid 'msal-node' dependency issues on some hosts
  private static async getAccessToken(config: PowerBIConfig): Promise<string> {
    console.error(`[PowerBI] Requesting AD Token for Tenant: ${config.tenantId}`);

    const url = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', config.clientId);
    params.append('client_secret', config.clientSecret);
    params.append('scope', 'https://analysis.windows.net/powerbi/api/.default');

    const response = await fetch(url, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[PowerBI] AD Token Error: ${response.status} - ${err}`);
      throw new Error(`Failed to get Azure AD Token: ${err}`);
    }

    const data: any = await response.json();
    console.error(`[PowerBI] Got AD Token. Expires in: ${data.expires_in}`);
    return data.access_token;
  }

  // 3. Generate Embed Token for Report
  static async getEmbedDetails(workspaceId: string, reportId: string) {
    try {
      console.error(`[PowerBI] Starting Embed Flow for Report: ${reportId} in Workspace: ${workspaceId}`);

      const config = await this.getConfig();
      const accessToken = await this.getAccessToken(config);

      // A. Get Report Details (to verify it exists and get embed URL)
      console.error(`[PowerBI] Fetching Report Details...`);
      const reportResp = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!reportResp.ok) {
        const err = await reportResp.text();
        throw new Error(`Report Fetch Failed: ${err}`);
      }
      const reportData: any = await reportResp.json();
      console.error(`[PowerBI] Report Found: ${reportData.name} (${reportData.embedUrl})`);

      // B. Generate Embed Token
      // Using 'GenerateTokenInGroup' for service principal
      console.error(`[PowerBI] Generating Embed Token...`);
      const tokenResp = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessLevel: 'View',
          allowSaveCopy: false
        })
      });

      if (!tokenResp.ok) {
        const err = await tokenResp.text();
        throw new Error(`Embed Token Gen Failed: ${err}`);
      }
      const tokenData: any = await tokenResp.json();
      console.error(`[PowerBI] Embed Token Generated Successfully.`);

      return {
        accessToken: tokenData.token,
        embedUrl: reportData.embedUrl,
        reportId: reportId
      };

    } catch (error: any) {
      console.error('[PowerBI] FATAL ERROR:', error.message);
      throw error;
    }
  }
}
