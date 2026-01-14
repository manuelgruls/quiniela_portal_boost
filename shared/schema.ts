import { sql } from "drizzle-orm";
import { mysqlTable, serial, text, varchar, boolean, timestamp, datetime } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Ensure we are using mysqlTable, NOT pgTable
export const profiles = mysqlTable("profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: text("email").notNull(), // text is fine, or varchar(255)
  password: text("password"), // The column we just fixed
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  // New columns for secure password reset
  resetToken: text("reset_token"),
  resetTokenExpires: datetime("reset_token_expires"),

  isActive: boolean("is_active").notNull().default(true),
  lastAccess: datetime("last_access"), // Use datetime for MySQL
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pages = mysqlTable("pages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UUID()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  workspaceId: text("workspace_id").notNull(),
  reportId: text("report_id").notNull(),
  datasetId: text("dataset_id").notNull(),
  defaultPageName: text("default_page_name"),
  showFilterPane: boolean("show_filter_pane").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  icon: text("icon"),
});

// User page access permissions table
export const userPageAccess = mysqlTable("user_page_access", {
  userId: varchar("user_id", { length: 36 }).notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  pageId: varchar("page_id", { length: 36 }).notNull().references(() => pages.id, { onDelete: 'cascade' }),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Azure settings table (singleton)
export const azureSettings = mysqlTable("azure_settings", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`UUID()`),
  tenantId: text("tenant_id").notNull(),
  clientId: text("client_id").notNull(),
  clientSecretCipher: text("client_secret_cipher").notNull(),
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => profiles.id),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => profiles.id),
  expiresAt: datetime("expires_at").notNull(),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Drizzle Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  sessions: many(sessions),
  userPageAccess: many(userPageAccess),
  createdAzureSettings: many(azureSettings),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(profiles, {
    fields: [sessions.userId],
    references: [profiles.id]
  }),
}));

export const pagesRelations = relations(pages, ({ many }) => ({
  userPageAccess: many(userPageAccess),
}));

export const userPageAccessRelations = relations(userPageAccess, ({ one }) => ({
  user: one(profiles, {
    fields: [userPageAccess.userId],
    references: [profiles.id]
  }),
  page: one(pages, {
    fields: [userPageAccess.pageId],
    references: [pages.id]
  }),
}));

export const azureSettingsRelations = relations(azureSettings, ({ one }) => ({
  createdBy: one(profiles, {
    fields: [azureSettings.createdBy],
    references: [profiles.id]
  }),
}));

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles);

export const insertPageSchema = createInsertSchema(pages);

export const insertUserPageAccessSchema = createInsertSchema(userPageAccess).omit({});

export const insertAzureSettingsSchema = createInsertSchema(azureSettings).extend({
  clientSecret: z.string(),
});

export const insertSessionSchema = createInsertSchema(sessions);

// Types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type UserPageAccess = typeof userPageAccess.$inferSelect;
export type InsertUserPageAccess = z.infer<typeof insertUserPageAccessSchema>;
export type AzureSettings = typeof azureSettings.$inferSelect;
export type InsertAzureSettings = z.infer<typeof insertAzureSettingsSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// AuthUser type definition
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  mustChangePassword: boolean;
}
