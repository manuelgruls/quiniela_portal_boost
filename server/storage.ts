import { eq, and, desc, like, sql, gt } from 'drizzle-orm';
import { db } from './db';
import { profiles, pages, userPageAccess, azureSettings } from '@shared/schema';
import type {
  Profile,
  InsertProfile,
  Page,
  InsertPage,
  UserPageAccess,
  InsertUserPageAccess,
  AzureSettings,
  InsertAzureSettings
} from '@shared/schema';
import { randomBytes, randomUUID } from 'crypto';
import { hash } from 'bcryptjs';
import { EmailService } from './services/email';
import { EncryptionService } from './services/encryption';

export interface IStorage {
  // Users
  getUsers(search?: string, role?: string, limit?: number, offset?: number): Promise<{ users: Profile[]; total: number }>;
  getUserById(id: string): Promise<Profile | undefined>;
  getUserByEmail(email: string): Promise<Profile | undefined>;
  createUser(user: InsertProfile): Promise<Profile>;
  updateUser(id: string, updates: Partial<InsertProfile>): Promise<Profile>;
  deleteUser(id: string): Promise<void>; // <--- Add this

  // Password Reset flow
  resetUserPassword(id: string): Promise<void>;
  verifyResetToken(token: string): Promise<Profile | undefined>;
  completePasswordReset(userId: string, passwordHash: string): Promise<void>;

  // Pages
  getPages(): Promise<Page[]>;
  getPageById(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, updates: Partial<InsertPage>): Promise<Page>;
  deletePage(id: string): Promise<void>;

  // User Page Access
  getUserPageAccess(userId: string): Promise<UserPageAccess[]>;
  getUserDashboards(userId: string): Promise<Page[]>;
  setUserPageAccess(userId: string, pageIds: string[]): Promise<void>;

  // Azure Settings
  getAzureSettings(): Promise<AzureSettings | undefined>;
  saveAzureSettings(settings: InsertAzureSettings): Promise<AzureSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUsers(search?: string, role?: string, limit = 50, offset = 0): Promise<{ users: Profile[]; total: number }> {
    let whereConditions: any[] = [];

    if (search) {
      whereConditions.push(
        like(profiles.fullName, `%${search}%`),
        like(profiles.email, `%${search}%`)
      );
    }

    if (role && role !== 'all') {
      whereConditions.push(eq(profiles.role, role));
    }

    const conditions = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [users, totalResult] = await Promise.all([
      db.select().from(profiles)
        .where(conditions)
        .orderBy(desc(profiles.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(profiles)
        .where(conditions)
    ]);

    return {
      users,
      total: totalResult[0]?.count || 0
    };
  }

  async getUserById(id: string): Promise<Profile | undefined> {
    const [user] = await db.select().from(profiles).where(eq(profiles.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<Profile | undefined> {
    const [user] = await db.select().from(profiles).where(eq(profiles.email, email));
    return user;
  }

  async createUser(user: InsertProfile): Promise<Profile> {
    const tempPassword = randomBytes(12).toString('hex');
    const newId = randomUUID();
    const hashedPassword = await hash(tempPassword, 10);

    // Insert with the generated ID and hashed password
    await db.insert(profiles).values({
      ...user,
      id: newId,
      password: hashedPassword,
      mustChangePassword: true
    } as any);

    const newUser = await this.getUserByEmail(user.email);
    if (!newUser) throw new Error("Failed to create user");

    // Send email logic
    try {
      EmailService.log(`Storage: Attempting to send invitation to ${user.email}`);
      const emailSent = await EmailService.sendUserInvitation(user.email, user.fullName, tempPassword);

      if (!emailSent) {
        EmailService.log(`Storage: Invitation email returned FALSE for ${user.email}`, true);
      } else {
        EmailService.log(`Storage: Invitation email sent successfully to ${user.email}`);
      }
    } catch (error: any) {
      EmailService.log(`Storage: Exception sending invitation to ${user.email}: ${error.message}`, true);
    }

    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertProfile>): Promise<Profile> {
    await db.update(profiles)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(profiles.id, id));

    const updatedUser = await this.getUserById(id);
    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    // 1. Delete associated permissions first (foreign key constraint)
    await db.delete(userPageAccess).where(eq(userPageAccess.userId, id));

    // 2. Delete the user profile
    await db.delete(profiles).where(eq(profiles.id, id));
  }

  async resetUserPassword(id: string): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) throw new Error('User not found');

    const resetToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // CRITICAL FIX: Save the token and expiration to the database
    await db.update(profiles)
      .set({
        resetToken: resetToken,
        resetTokenExpires: expires,
        updatedAt: new Date()
      } as any)
      .where(eq(profiles.id, id));

    try {
      EmailService.log(`Storage: Attempting password reset email for ${user.email}`);
      const success = await EmailService.sendPasswordReset(user.email, resetToken);

      if (!success) {
        EmailService.log(`Storage: Password reset email returned FALSE for ${user.email}`, true);
        throw new Error('Email service returned failure status');
      }
      EmailService.log(`Storage: Password reset email sent to ${user.email}`);
    } catch (error: any) {
      EmailService.log(`Storage: Exception sending password reset to ${user.email}: ${error.message}`, true);
      throw new Error('Failed to send password reset email');
    }
  }

  async verifyResetToken(token: string): Promise<Profile | undefined> {
    // Find user with this token AND where token has not expired
    const [user] = await db.select().from(profiles)
      .where(and(
        eq(profiles.resetToken, token),
        gt(profiles.resetTokenExpires, new Date())
      ));
    return user;
  }

  async completePasswordReset(userId: string, passwordHash: string): Promise<void> {
    // Update password, clear token, and set mustChangePassword to FALSE (0)
    await db.update(profiles)
      .set({
        password: passwordHash,
        mustChangePassword: false,
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: new Date()
      } as any)
      .where(eq(profiles.id, userId));
  }

  async getPages(): Promise<Page[]> {
    return db.select().from(pages).orderBy(desc(pages.createdAt));
  }

  async getPageById(id: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async createPage(page: InsertPage): Promise<Page> {
    const newId = randomUUID();
    // Explicitly set the ID to ensure it exists immediately
    await db.insert(pages).values({ ...page, id: newId } as any);

    // Fetch by ID (safer/faster than slug for verification)
    const newPage = await this.getPageById(newId);
    if (!newPage) throw new Error("Failed to create page");
    return newPage;
  }

  async updatePage(id: string, updates: Partial<InsertPage>): Promise<Page> {
    await db.update(pages)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(pages.id, id));

    const updatedPage = await this.getPageById(id);
    if (!updatedPage) throw new Error('Page not found');
    return updatedPage;
  }

  async deletePage(id: string): Promise<void> {
    await db.delete(userPageAccess).where(eq(userPageAccess.pageId, id));
    await db.delete(pages).where(eq(pages.id, id));
  }

  async getUserPageAccess(userId: string): Promise<UserPageAccess[]> {
    return db.select().from(userPageAccess).where(eq(userPageAccess.userId, userId));
  }

  async getUserDashboards(userId: string): Promise<Page[]> {
    const rows = await db.select({
      page: pages
    })
      .from(userPageAccess)
      .innerJoin(pages, eq(userPageAccess.pageId, pages.id))
      .where(and(
        eq(userPageAccess.userId, userId),
        eq(userPageAccess.enabled, true)
      ));

    return rows.map(r => r.page);
  }

  async setUserPageAccess(userId: string, pageIds: string[]): Promise<void> {
    await db.delete(userPageAccess).where(eq(userPageAccess.userId, userId));

    if (pageIds.length > 0) {
      const accessRecords = pageIds.map(pageId => ({
        userId,
        pageId,
        enabled: true
      }));

      await db.insert(userPageAccess).values(accessRecords);
    }
  }

  async getAzureSettings(): Promise<AzureSettings | undefined> {
    const [settings] = await db.select().from(azureSettings).orderBy(desc(azureSettings.updatedAt)).limit(1);
    return settings;
  }

  async saveAzureSettings(settings: InsertAzureSettings): Promise<AzureSettings> {
    const { clientSecret, ...rest } = settings;
    const encryptedSecret = EncryptionService.encrypt(clientSecret);

    await db.delete(azureSettings);

    await db.insert(azureSettings).values({
      ...rest,
      clientSecretCipher: encryptedSecret
    } as any);

    const newSettings = await this.getAzureSettings();
    if (!newSettings) throw new Error("Failed to save settings");
    return newSettings;
  }
}

export const storage = new DatabaseStorage();
