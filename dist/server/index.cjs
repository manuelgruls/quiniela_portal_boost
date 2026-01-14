var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/index.ts
var import_express3 = __toESM(require("express"), 1);
var import_http = require("http");

// server/storage.ts
var import_drizzle_orm3 = require("drizzle-orm");

// server/db.ts
var import_promise = __toESM(require("mysql2/promise"), 1);
var import_mysql2 = require("drizzle-orm/mysql2");

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  azureSettings: () => azureSettings,
  azureSettingsRelations: () => azureSettingsRelations,
  insertAzureSettingsSchema: () => insertAzureSettingsSchema,
  insertPageSchema: () => insertPageSchema,
  insertProfileSchema: () => insertProfileSchema,
  insertSessionSchema: () => insertSessionSchema,
  insertUserPageAccessSchema: () => insertUserPageAccessSchema,
  pages: () => pages,
  pagesRelations: () => pagesRelations,
  profiles: () => profiles,
  profilesRelations: () => profilesRelations,
  sessions: () => sessions,
  sessionsRelations: () => sessionsRelations,
  userPageAccess: () => userPageAccess,
  userPageAccessRelations: () => userPageAccessRelations
});
var import_drizzle_orm = require("drizzle-orm");
var import_mysql_core = require("drizzle-orm/mysql-core");
var import_drizzle_orm2 = require("drizzle-orm");
var import_drizzle_zod = require("drizzle-zod");
var import_zod = require("zod");
var profiles = (0, import_mysql_core.mysqlTable)("profiles", {
  id: (0, import_mysql_core.varchar)("id", { length: 36 }).primaryKey(),
  email: (0, import_mysql_core.text)("email").notNull(),
  // text is fine, or varchar(255)
  password: (0, import_mysql_core.text)("password"),
  // The column we just fixed
  fullName: (0, import_mysql_core.text)("full_name").notNull(),
  role: (0, import_mysql_core.text)("role").notNull().default("user"),
  mustChangePassword: (0, import_mysql_core.boolean)("must_change_password").notNull().default(true),
  // New columns for secure password reset
  resetToken: (0, import_mysql_core.text)("reset_token"),
  resetTokenExpires: (0, import_mysql_core.datetime)("reset_token_expires"),
  isActive: (0, import_mysql_core.boolean)("is_active").notNull().default(true),
  lastAccess: (0, import_mysql_core.datetime)("last_access"),
  // Use datetime for MySQL
  createdAt: (0, import_mysql_core.datetime)("created_at").notNull().default(import_drizzle_orm.sql`CURRENT_TIMESTAMP`),
  updatedAt: (0, import_mysql_core.datetime)("updated_at").notNull().default(import_drizzle_orm.sql`CURRENT_TIMESTAMP`)
});
var pages = (0, import_mysql_core.mysqlTable)("pages", {
  id: (0, import_mysql_core.varchar)("id", { length: 36 }).primaryKey().default(import_drizzle_orm.sql`UUID()`),
  slug: (0, import_mysql_core.text)("slug").notNull().unique(),
  title: (0, import_mysql_core.text)("title").notNull(),
  description: (0, import_mysql_core.text)("description"),
  workspaceId: (0, import_mysql_core.text)("workspace_id").notNull(),
  reportId: (0, import_mysql_core.text)("report_id").notNull(),
  datasetId: (0, import_mysql_core.text)("dataset_id").notNull(),
  defaultPageName: (0, import_mysql_core.text)("default_page_name"),
  showFilterPane: (0, import_mysql_core.boolean)("show_filter_pane").notNull().default(false),
  createdAt: (0, import_mysql_core.timestamp)("created_at").notNull().default(import_drizzle_orm.sql`CURRENT_TIMESTAMP`),
  updatedAt: (0, import_mysql_core.timestamp)("updated_at").notNull().default(import_drizzle_orm.sql`CURRENT_TIMESTAMP`),
  icon: (0, import_mysql_core.text)("icon")
});
var userPageAccess = (0, import_mysql_core.mysqlTable)("user_page_access", {
  userId: (0, import_mysql_core.varchar)("user_id", { length: 36 }).notNull().references(() => profiles.id, { onDelete: "cascade" }),
  pageId: (0, import_mysql_core.varchar)("page_id", { length: 36 }).notNull().references(() => pages.id, { onDelete: "cascade" }),
  enabled: (0, import_mysql_core.boolean)("enabled").notNull().default(true),
  createdAt: (0, import_mysql_core.timestamp)("created_at").notNull().default(import_drizzle_orm.sql`CURRENT_TIMESTAMP`)
});
var azureSettings = (0, import_mysql_core.mysqlTable)("azure_settings", {
  id: (0, import_mysql_core.varchar)("id", { length: 36 }).primaryKey().default(import_drizzle_orm.sql`UUID()`),
  tenantId: (0, import_mysql_core.text)("tenant_id").notNull(),
  clientId: (0, import_mysql_core.text)("client_id").notNull(),
  clientSecretCipher: (0, import_mysql_core.text)("client_secret_cipher").notNull(),
  createdBy: (0, import_mysql_core.varchar)("created_by", { length: 36 }).notNull().references(() => profiles.id),
  updatedAt: (0, import_mysql_core.timestamp)("updated_at").notNull().default(import_drizzle_orm.sql`CURRENT_TIMESTAMP`)
});
var sessions = (0, import_mysql_core.mysqlTable)("sessions", {
  id: (0, import_mysql_core.varchar)("id", { length: 255 }).primaryKey(),
  userId: (0, import_mysql_core.varchar)("user_id", { length: 36 }).notNull().references(() => profiles.id),
  expiresAt: (0, import_mysql_core.datetime)("expires_at").notNull(),
  createdAt: (0, import_mysql_core.datetime)("created_at").notNull().default(import_drizzle_orm.sql`CURRENT_TIMESTAMP`)
});
var profilesRelations = (0, import_drizzle_orm2.relations)(profiles, ({ many }) => ({
  sessions: many(sessions),
  userPageAccess: many(userPageAccess),
  createdAzureSettings: many(azureSettings)
}));
var sessionsRelations = (0, import_drizzle_orm2.relations)(sessions, ({ one }) => ({
  user: one(profiles, {
    fields: [sessions.userId],
    references: [profiles.id]
  })
}));
var pagesRelations = (0, import_drizzle_orm2.relations)(pages, ({ many }) => ({
  userPageAccess: many(userPageAccess)
}));
var userPageAccessRelations = (0, import_drizzle_orm2.relations)(userPageAccess, ({ one }) => ({
  user: one(profiles, {
    fields: [userPageAccess.userId],
    references: [profiles.id]
  }),
  page: one(pages, {
    fields: [userPageAccess.pageId],
    references: [pages.id]
  })
}));
var azureSettingsRelations = (0, import_drizzle_orm2.relations)(azureSettings, ({ one }) => ({
  createdBy: one(profiles, {
    fields: [azureSettings.createdBy],
    references: [profiles.id]
  })
}));
var insertProfileSchema = (0, import_drizzle_zod.createInsertSchema)(profiles);
var insertPageSchema = (0, import_drizzle_zod.createInsertSchema)(pages);
var insertUserPageAccessSchema = (0, import_drizzle_zod.createInsertSchema)(userPageAccess).omit({});
var insertAzureSettingsSchema = (0, import_drizzle_zod.createInsertSchema)(azureSettings).extend({
  clientSecret: import_zod.z.string()
});
var insertSessionSchema = (0, import_drizzle_zod.createInsertSchema)(sessions);

// server/db.ts
var pool = import_promise.default.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "portal_db",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Crucial for Drizzle Boolean mapping:
  typeCast: function(field, next) {
    if (field.type === "TINY" && field.length === 1) {
      return field.string() === "1";
    }
    return next();
  }
});
var db = (0, import_mysql2.drizzle)(pool, { schema: schema_exports, mode: "default" });

// server/storage.ts
var import_crypto2 = require("crypto");
var import_bcryptjs = require("bcryptjs");

// server/services/email.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var LOG_FILE = import_path.default.join(process.cwd(), "email-debug.log");
var EmailService = class {
  // Public log method so other services (like storage) can write to the same debug file
  static log(message, isError = false) {
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
    const logLine = `[${timestamp2}] ${isError ? "ERROR" : "INFO"}: ${message}
`;
    try {
      import_fs.default.appendFileSync(LOG_FILE, logLine);
      if (isError) console.error(logLine.trim());
      else console.log(logLine.trim());
    } catch (err) {
      console.error("CRITICAL: Failed to write to email-debug.log", err);
    }
  }
  static createTransporter() {
    try {
      const port = parseInt(process.env.SMTP_PORT || "587");
      let secure = port === 465;
      if (process.env.SMTP_SECURE !== void 0) {
        const explicitSecure = process.env.SMTP_SECURE.toLowerCase() === "true";
        if (port === 465 && !explicitSecure || port === 587 && explicitSecure) {
          this.log(`WARN: Port/secure mismatch. Auto-correcting secure setting for port ${port}`);
          secure = port === 465;
        } else {
          secure = explicitSecure;
        }
      }
      this.log(`Configuring Transporter - Host: ${process.env.SMTP_HOST}, Port: ${port}, Secure: ${secure}, User: ${process.env.SMTP_USER}`);
      return import_nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: "SSLv3"
        },
        connectionTimeout: 1e4,
        greetingTimeout: 1e4,
        socketTimeout: 15e3,
        debug: true,
        logger: false
      });
    } catch (error) {
      this.log(`Failed to create transporter: ${error.message}`, true);
      throw error;
    }
  }
  static async sendEmail(params) {
    this.log(`Start sendEmail to: ${params.to}`);
    if (!process.env.SMTP_HOST) {
      this.log("ERROR: SMTP_HOST env variable is missing", true);
      return false;
    }
    try {
      const transporter = this.createTransporter();
      const fromName = process.env.FROM_NAME || "Portal BOOST";
      const fromEmail = process.env.FROM_EMAIL || params.from || "noreply@example.com";
      const fromAddress = `"${fromName}" <${fromEmail}>`;
      this.log(`Sending mail from ${fromAddress} to ${params.to}`);
      const info = await transporter.sendMail({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        text: params.text || "",
        html: params.html
      });
      this.log(`Email sent successfully! Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.log(`SENDING FAILED: ${error.message}`, true);
      return false;
    }
  }
  static async sendUserInvitation(email, fullName, temporaryPassword) {
    const baseUrl = (process.env.APP_URL || "http://localhost:5000").replace(/\/$/, "");
    const loginUrl = `${baseUrl}/login`;
    const subject = "Bienvenido a Portal BOOST - Configura tu cuenta";
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${baseUrl}/logo.png" alt="Portal BOOST" style="height: 60px; width: auto; margin-bottom: 16px; object-fit: contain;">
          <h1 style="color: #1a1a1a; margin: 0;">Portal BOOST</h1>
        </div>
        
        <h2 style="color: #333;">\xA1Hola ${fullName}!</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Se ha creado una cuenta para ti en Portal BOOST. Para completar la configuraci\xF3n de tu cuenta, 
          sigue estos pasos:
        </p>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #333;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0; color: #333;"><strong>Contrase\xF1a temporal:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</code></p>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          <strong>Importante:</strong> Deber\xE1s cambiar tu contrase\xF1a al iniciar sesi\xF3n por primera vez.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" 
             style="background: #009688; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Acceder a Portal BOOST
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center;">
          Si tienes problemas para acceder, contacta al administrador del sistema.
        </p>
      </div>
    `;
    return this.sendEmail({ to: email, subject, html });
  }
  static async sendPasswordReset(email, resetToken) {
    const baseUrl = (process.env.APP_URL || "http://localhost:5000").replace(/\/$/, "");
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    const subject = "Restablecer contrase\xF1a - Portal BOOST";
    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${baseUrl}/logo.png" alt="Portal BOOST" style="height: 60px; width: auto; margin-bottom: 16px; object-fit: contain;">
          <h1 style="color: #1a1a1a; margin: 0;">Portal BOOST</h1>
        </div>
        
        <h2 style="color: #333;">Restablecer contrase\xF1a</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Has solicitado restablecer tu contrase\xF1a. Haz clic en el siguiente enlace para crear una nueva contrase\xF1a:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #009688; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Restablecer contrase\xF1a
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; font-size: 14px;">
          Si no solicitaste este cambio, puedes ignorar este email.
        </p>
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Portal BOOST - Gesti\xF3n de Dashboards Empresariales
        </p>
      </div>
    `;
    return this.sendEmail({ to: email, subject, html });
  }
};

// server/services/encryption.ts
var import_crypto = require("crypto");
var EncryptionService = class {
  static {
    this.ALGORITHM = "aes-256-gcm";
  }
  static {
    this.IV_LENGTH = 16;
  }
  static {
    this.SALT_LENGTH = 64;
  }
  static {
    this.TAG_LENGTH = 16;
  }
  static getEncryptionKey() {
    const key = process.env.APP_ENCRYPTION_KEY;
    if (!key) {
      throw new Error("APP_ENCRYPTION_KEY environment variable is required");
    }
    return Buffer.from(key, "base64");
  }
  static encrypt(text2) {
    try {
      const key = this.getEncryptionKey();
      const iv = (0, import_crypto.randomBytes)(this.IV_LENGTH);
      const salt = (0, import_crypto.randomBytes)(this.SALT_LENGTH);
      const cipher = (0, import_crypto.createCipheriv)(this.ALGORITHM, key, iv);
      let encrypted = cipher.update(text2, "utf8", "hex");
      encrypted += cipher.final("hex");
      const authTag = cipher.getAuthTag();
      const combined = Buffer.concat([
        salt,
        iv,
        authTag,
        Buffer.from(encrypted, "hex")
      ]);
      return combined.toString("base64");
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt data");
    }
  }
  static decrypt(encryptedData) {
    try {
      const key = this.getEncryptionKey();
      const combined = Buffer.from(encryptedData, "base64");
      const salt = combined.subarray(0, this.SALT_LENGTH);
      const iv = combined.subarray(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const authTag = combined.subarray(this.SALT_LENGTH + this.IV_LENGTH, this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);
      const encrypted = combined.subarray(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);
      const decipher = (0, import_crypto.createDecipheriv)(this.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encrypted, void 0, "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt data");
    }
  }
};

// server/storage.ts
var DatabaseStorage = class {
  async getUsers(search, role, limit = 50, offset = 0) {
    let whereConditions = [];
    if (search) {
      whereConditions.push(
        (0, import_drizzle_orm3.like)(profiles.fullName, `%${search}%`),
        (0, import_drizzle_orm3.like)(profiles.email, `%${search}%`)
      );
    }
    if (role && role !== "all") {
      whereConditions.push((0, import_drizzle_orm3.eq)(profiles.role, role));
    }
    const conditions = whereConditions.length > 0 ? (0, import_drizzle_orm3.and)(...whereConditions) : void 0;
    const [users, totalResult] = await Promise.all([
      db.select().from(profiles).where(conditions).orderBy((0, import_drizzle_orm3.desc)(profiles.createdAt)).limit(limit).offset(offset),
      db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(profiles).where(conditions)
    ]);
    return {
      users,
      total: totalResult[0]?.count || 0
    };
  }
  async getUserById(id) {
    const [user] = await db.select().from(profiles).where((0, import_drizzle_orm3.eq)(profiles.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(profiles).where((0, import_drizzle_orm3.eq)(profiles.email, email));
    return user;
  }
  async createUser(user) {
    const tempPassword = (0, import_crypto2.randomBytes)(12).toString("hex");
    const newId = (0, import_crypto2.randomUUID)();
    const hashedPassword = await (0, import_bcryptjs.hash)(tempPassword, 10);
    await db.insert(profiles).values({
      ...user,
      id: newId,
      password: hashedPassword,
      mustChangePassword: true
    });
    const newUser = await this.getUserByEmail(user.email);
    if (!newUser) throw new Error("Failed to create user");
    try {
      EmailService.log(`Storage: Attempting to send invitation to ${user.email}`);
      const emailSent = await EmailService.sendUserInvitation(user.email, user.fullName, tempPassword);
      if (!emailSent) {
        EmailService.log(`Storage: Invitation email returned FALSE for ${user.email}`, true);
      } else {
        EmailService.log(`Storage: Invitation email sent successfully to ${user.email}`);
      }
    } catch (error) {
      EmailService.log(`Storage: Exception sending invitation to ${user.email}: ${error.message}`, true);
    }
    return newUser;
  }
  async updateUser(id, updates) {
    await db.update(profiles).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(profiles.id, id));
    const updatedUser = await this.getUserById(id);
    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  }
  async deleteUser(id) {
    await db.delete(userPageAccess).where((0, import_drizzle_orm3.eq)(userPageAccess.userId, id));
    await db.delete(profiles).where((0, import_drizzle_orm3.eq)(profiles.id, id));
  }
  async resetUserPassword(id) {
    const user = await this.getUserById(id);
    if (!user) throw new Error("User not found");
    const resetToken = (0, import_crypto2.randomBytes)(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1e3);
    await db.update(profiles).set({
      resetToken,
      resetTokenExpires: expires,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(profiles.id, id));
    try {
      EmailService.log(`Storage: Attempting password reset email for ${user.email}`);
      const success = await EmailService.sendPasswordReset(user.email, resetToken);
      if (!success) {
        EmailService.log(`Storage: Password reset email returned FALSE for ${user.email}`, true);
        throw new Error("Email service returned failure status");
      }
      EmailService.log(`Storage: Password reset email sent to ${user.email}`);
    } catch (error) {
      EmailService.log(`Storage: Exception sending password reset to ${user.email}: ${error.message}`, true);
      throw new Error("Failed to send password reset email");
    }
  }
  async verifyResetToken(token) {
    const [user] = await db.select().from(profiles).where((0, import_drizzle_orm3.and)(
      (0, import_drizzle_orm3.eq)(profiles.resetToken, token),
      (0, import_drizzle_orm3.gt)(profiles.resetTokenExpires, /* @__PURE__ */ new Date())
    ));
    return user;
  }
  async completePasswordReset(userId, passwordHash) {
    await db.update(profiles).set({
      password: passwordHash,
      mustChangePassword: false,
      resetToken: null,
      resetTokenExpires: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(profiles.id, userId));
  }
  async getPages() {
    return db.select().from(pages).orderBy((0, import_drizzle_orm3.desc)(pages.createdAt));
  }
  async getPageById(id) {
    const [page] = await db.select().from(pages).where((0, import_drizzle_orm3.eq)(pages.id, id));
    return page;
  }
  async getPageBySlug(slug) {
    const [page] = await db.select().from(pages).where((0, import_drizzle_orm3.eq)(pages.slug, slug));
    return page;
  }
  async createPage(page) {
    const newId = (0, import_crypto2.randomUUID)();
    await db.insert(pages).values({ ...page, id: newId });
    const newPage = await this.getPageById(newId);
    if (!newPage) throw new Error("Failed to create page");
    return newPage;
  }
  async updatePage(id, updates) {
    await db.update(pages).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(pages.id, id));
    const updatedPage = await this.getPageById(id);
    if (!updatedPage) throw new Error("Page not found");
    return updatedPage;
  }
  async deletePage(id) {
    await db.delete(userPageAccess).where((0, import_drizzle_orm3.eq)(userPageAccess.pageId, id));
    await db.delete(pages).where((0, import_drizzle_orm3.eq)(pages.id, id));
  }
  async getUserPageAccess(userId) {
    return db.select().from(userPageAccess).where((0, import_drizzle_orm3.eq)(userPageAccess.userId, userId));
  }
  async getUserDashboards(userId) {
    const rows = await db.select({
      page: pages
    }).from(userPageAccess).innerJoin(pages, (0, import_drizzle_orm3.eq)(userPageAccess.pageId, pages.id)).where((0, import_drizzle_orm3.and)(
      (0, import_drizzle_orm3.eq)(userPageAccess.userId, userId),
      (0, import_drizzle_orm3.eq)(userPageAccess.enabled, true)
    ));
    return rows.map((r) => r.page);
  }
  async setUserPageAccess(userId, pageIds) {
    await db.delete(userPageAccess).where((0, import_drizzle_orm3.eq)(userPageAccess.userId, userId));
    if (pageIds.length > 0) {
      const accessRecords = pageIds.map((pageId) => ({
        userId,
        pageId,
        enabled: true
      }));
      await db.insert(userPageAccess).values(accessRecords);
    }
  }
  async getAzureSettings() {
    const [settings] = await db.select().from(azureSettings).orderBy((0, import_drizzle_orm3.desc)(azureSettings.updatedAt)).limit(1);
    return settings;
  }
  async saveAzureSettings(settings) {
    const { clientSecret, ...rest } = settings;
    const encryptedSecret = EncryptionService.encrypt(clientSecret);
    await db.delete(azureSettings);
    await db.insert(azureSettings).values({
      ...rest,
      clientSecretCipher: encryptedSecret
    });
    const newSettings = await this.getAzureSettings();
    if (!newSettings) throw new Error("Failed to save settings");
    return newSettings;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
var import_express = require("express");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// server/services/auth.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_crypto3 = require("crypto");
var AuthService = class _AuthService {
  static async hashPassword(password) {
    return import_bcryptjs2.default.hash(password, 12);
  }
  static async verifyPassword(password, hashedPassword) {
    return import_bcryptjs2.default.compare(password, hashedPassword);
  }
  static async login(email, password) {
    try {
      const [results] = await pool.execute("SELECT * FROM profiles WHERE email = ?", [email]);
      const user = results[0];
      if (!user) {
        return null;
      }
      if (!user.is_active) return null;
      if (!user.password) {
        return null;
      }
      const isValid = await _AuthService.verifyPassword(password, user.password);
      if (!isValid) {
        return null;
      }
      const sessionId = (0, import_crypto3.randomBytes)(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      try {
        await pool.execute(
          "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
          [sessionId, user.id, expiresAt]
        );
      } catch (sessError) {
        console.error("[Auth] CRITICAL: Failed to create session:", sessError);
        throw sessError;
      }
      try {
        await pool.execute(
          "UPDATE profiles SET last_access = ? WHERE id = ?",
          [/* @__PURE__ */ new Date(), user.id]
        );
      } catch (updateError) {
      }
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          mustChangePassword: !!user.must_change_password
        },
        sessionId
      };
    } catch (error) {
      console.error("[Auth] UNEXPECTED ERROR during login:", error);
      throw error;
    }
  }
  static async logout(sessionId) {
    await pool.execute("DELETE FROM sessions WHERE id = ?", [sessionId]);
  }
  static async validateSession(sessionId) {
    const [result] = await pool.execute(`
      SELECT s.id as session_id, s.expires_at, p.id, p.email, p.full_name, p.role, p.must_change_password, p.is_active
      FROM sessions s
      INNER JOIN profiles p ON s.user_id = p.id
      WHERE s.id = ?
    `, [sessionId]);
    if (!result.length) {
      return null;
    }
    const sessionData = result[0];
    if (sessionData.expires_at < /* @__PURE__ */ new Date()) {
      await pool.execute("DELETE FROM sessions WHERE id = ?", [sessionId]);
      return null;
    }
    if (!sessionData.is_active) {
      await pool.execute("DELETE FROM sessions WHERE id = ?", [sessionId]);
      return null;
    }
    return {
      id: sessionData.id,
      email: sessionData.email,
      fullName: sessionData.full_name,
      role: sessionData.role,
      mustChangePassword: !!sessionData.must_change_password
    };
  }
  static async changePassword(userId, newPassword) {
    const hashedPassword = await _AuthService.hashPassword(newPassword);
    await pool.execute(
      "UPDATE profiles SET password = ?, must_change_password = ?, updated_at = ? WHERE id = ?",
      [hashedPassword, false, /* @__PURE__ */ new Date(), userId]
    );
  }
};

// server/services/powerbi.ts
var PowerBIService = class {
  // 1. Get Config from DB
  static async getConfig() {
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
  static async getAccessToken(config) {
    console.error(`[PowerBI] Requesting AD Token for Tenant: ${config.tenantId}`);
    const url = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", config.clientId);
    params.append("client_secret", config.clientSecret);
    params.append("scope", "https://analysis.windows.net/powerbi/api/.default");
    const response = await fetch(url, {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    if (!response.ok) {
      const err = await response.text();
      console.error(`[PowerBI] AD Token Error: ${response.status} - ${err}`);
      throw new Error(`Failed to get Azure AD Token: ${err}`);
    }
    const data = await response.json();
    console.error(`[PowerBI] Got AD Token. Expires in: ${data.expires_in}`);
    return data.access_token;
  }
  // 3. Generate Embed Token for Report
  static async getEmbedDetails(workspaceId, reportId) {
    try {
      console.error(`[PowerBI] Starting Embed Flow for Report: ${reportId} in Workspace: ${workspaceId}`);
      const config = await this.getConfig();
      const accessToken = await this.getAccessToken(config);
      console.error(`[PowerBI] Fetching Report Details...`);
      const reportResp = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (!reportResp.ok) {
        const err = await reportResp.text();
        throw new Error(`Report Fetch Failed: ${err}`);
      }
      const reportData = await reportResp.json();
      console.error(`[PowerBI] Report Found: ${reportData.name} (${reportData.embedUrl})`);
      console.error(`[PowerBI] Generating Embed Token...`);
      const tokenResp = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accessLevel: "View",
          allowSaveCopy: false
        })
      });
      if (!tokenResp.ok) {
        const err = await tokenResp.text();
        throw new Error(`Embed Token Gen Failed: ${err}`);
      }
      const tokenData = await tokenResp.json();
      console.error(`[PowerBI] Embed Token Generated Successfully.`);
      return {
        accessToken: tokenData.token,
        embedUrl: reportData.embedUrl,
        reportId
      };
    } catch (error) {
      console.error("[PowerBI] FATAL ERROR:", error.message);
      throw error;
    }
  }
};

// server/routes.ts
var router = (0, import_express.Router)();
router.post("/api/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const success = await EmailService.sendEmail({
      to: email,
      subject: "Test Email from Portal BOOST",
      html: "<h1>Test Email</h1><p>This is a test email from Portal BOOST.</p>"
    });
    if (success) {
      res.json({ message: "Test email sent successfully" });
    } else {
      res.status(500).json({ error: "Failed to send test email" });
    }
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    req.user = { id: req.session.userId };
    return next();
  }
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, process.env.JWT_SECRET || "fallback-secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
router.get("/api/admin/users", requireAuth, async (req, res) => {
  const { search, role, limit = 50, offset = 0 } = req.query;
  const result = await storage.getUsers(search, role, Number(limit), Number(offset));
  res.json(result);
});
router.get("/api/admin/pages", requireAuth, async (req, res) => {
  const pages2 = await storage.getPages();
  res.json(pages2);
});
router.post("/api/admin/pages", requireAuth, async (req, res) => {
  try {
    res.json(await storage.createPage(req.body));
  } catch (e) {
    res.status(500).json({ error: "Create page failed" });
  }
});
router.patch("/api/admin/pages/:id", requireAuth, async (req, res) => {
  try {
    res.json(await storage.updatePage(req.params.id, req.body));
  } catch (e) {
    res.status(500).json({ error: "Update page failed" });
  }
});
router.delete("/api/admin/pages/:id", requireAuth, async (req, res) => {
  try {
    await storage.deletePage(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Delete page failed" });
  }
});
router.get("/api/admin/users/:id/pages", requireAuth, async (req, res) => {
  try {
    const access = await storage.getUserPageAccess(req.params.id);
    res.json(access);
  } catch (error) {
    console.error("Get user pages error:", error);
    res.status(500).json({ error: "Failed to fetch user pages" });
  }
});
router.post("/api/admin/users", requireAuth, async (req, res) => {
  try {
    const newUser = await storage.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});
router.patch("/api/admin/users/:id", requireAuth, async (req, res) => {
  try {
    const updatedUser = await storage.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});
router.post("/api/admin/users/:id/assign-pages", requireAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const { pageIds } = req.body;
    if (!Array.isArray(pageIds)) {
      return res.status(400).json({ error: "pageIds must be an array" });
    }
    await storage.setUserPageAccess(userId, pageIds);
    res.json({ success: true });
  } catch (error) {
    console.error("Assign pages error:", error);
    res.status(500).json({ error: "Failed to assign pages" });
  }
});
router.post("/api/admin/users/:id/reset-password", requireAuth, async (req, res) => {
  try {
    await storage.resetUserPassword(req.params.id);
    res.json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});
router.delete("/api/admin/users/:id", requireAuth, async (req, res) => {
  try {
    await storage.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});
router.get("/api/admin/azure", requireAuth, async (req, res) => {
  const settings = await storage.getAzureSettings();
  if (settings) {
    const { clientSecretCipher, ...safe } = settings;
    res.json(safe);
  } else {
    res.json({});
  }
});
router.post("/api/admin/azure", requireAuth, async (req, res) => {
  try {
    res.json(await storage.saveAzureSettings(req.body));
  } catch (e) {
    res.status(500).json({ error: "Save Azure failed" });
  }
});
router.get("/api/users", requireAuth, async (req, res) => {
  const { search, role, limit = 50, offset = 0 } = req.query;
  res.json(await storage.getUsers(search, role, Number(limit), Number(offset)));
});
router.post("/api/users", requireAuth, async (req, res) => {
  res.status(201).json(await storage.createUser(req.body));
});
router.patch("/api/users/:id", requireAuth, async (req, res) => {
  res.json(await storage.updateUser(req.params.id, req.body));
});
router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    if (!result) return res.status(401).json({ message: "Invalid credentials" });
    if (req.session) {
      const session2 = req.session;
      session2.userId = result.user.id;
      session2.loginTime = Date.now();
    }
    res.json(result.user);
  } catch (error) {
    res.status(500).json({ message: "Login Failed", error: error.message });
  }
});
router.post("/api/auth/logout", (req, res) => {
  if (req.session) req.session.destroy(() => res.json({ message: "Logged out" }));
  else res.json({ message: "Logged out" });
});
router.get("/api/auth/user", requireAuth, async (req, res) => {
  const user = await storage.getUserById(req.user.id);
  res.json(user);
});
router.patch("/api/auth/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await storage.getUserById(req.user.id);
    if (!user || !user.password) {
      return res.status(404).json({ error: "User not found" });
    }
    const isValid = await AuthService.verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "La contrase\xF1a actual es incorrecta" });
    }
    const hashedPassword = await AuthService.hashPassword(newPassword);
    await storage.updateUser(user.id, {
      password: hashedPassword,
      mustChangePassword: false
    });
    console.log(`[Auth] Password changed successfully for user ${user.email}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
});
router.get("/api/user/dashboards", requireAuth, async (req, res) => {
  const pages2 = await storage.getUserDashboards(req.user.id);
  res.json(pages2);
});
router.get("/api/pages/slug/:slug", requireAuth, async (req, res) => {
  try {
    const page = await storage.getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }
    const user = await storage.getUserById(req.user.id);
    const isAdmin = user?.role === "admin";
    if (!isAdmin) {
      const access = await storage.getUserPageAccess(req.user.id);
      const hasAccess = access.some((a) => a.pageId === page.id && a.enabled);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    res.json(page);
  } catch (error) {
    console.error("Get page by slug error:", error);
    res.status(500).json({ error: "Failed to retrieve page" });
  }
});
router.post("/api/powerbi/embed", requireAuth, async (req, res) => {
  try {
    const { pageId } = req.body;
    if (!pageId) return res.status(400).json({ error: "Missing pageId" });
    const page = await storage.getPageById(pageId);
    if (!page) return res.status(404).json({ error: "Page not found" });
    const user = await storage.getUserById(req.user.id);
    const isAdmin = user?.role === "admin";
    const access = await storage.getUserPageAccess(req.user.id);
    const hasAccess = access.find((a) => a.pageId === page.id && a.enabled);
    if (!hasAccess && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }
    const embedConfig = await PowerBIService.getEmbedDetails(page.workspaceId, page.reportId);
    res.json(embedConfig);
  } catch (error) {
    console.error("PowerBI Embed Error:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/api/auth/reset-password-confirm", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }
    const user = await storage.verifyResetToken(token);
    if (!user) {
      return res.status(400).json({ error: "El enlace ha expirado o no es v\xE1lido." });
    }
    const hashedPassword = await AuthService.hashPassword(newPassword);
    await storage.completePasswordReset(user.id, hashedPassword);
    console.log(`[Auth] Password successfully reset for user ${user.email}`);
    res.json({ success: true, message: "Contrase\xF1a actualizada correctamente" });
  } catch (error) {
    console.error("Reset confirm error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
async function registerRoutes(app2) {
  app2.use("/", router);
  return app2;
}

// server/vite.ts
var import_express2 = __toESM(require("express"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var rootDir = process.cwd();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = import_path2.default.resolve(rootDir, "dist/public");
  if (import_fs2.default.existsSync(distPath)) {
    app2.use(import_express2.default.static(distPath));
    app2.use("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  } else {
    log(`Warning: Static files not found at ${distPath}`);
  }
}

// server/index.ts
var import_express_session = __toESM(require("express-session"), 1);
var import_express_mysql_session = __toESM(require("express-mysql-session"), 1);
var app = (0, import_express3.default)();
app.set("trust proxy", 1);
app.use(import_express3.default.json());
app.use(import_express3.default.urlencoded({ extended: false }));
process.on("uncaughtException", (err) => {
  console.error("[CRASH] Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[CRASH] Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
var MySQLStoreSession = (0, import_express_mysql_session.default)(import_express_session.default);
app.use((0, import_express_session.default)({
  name: "sid",
  // Changed session cookie name to 'sid'
  secret: process.env.SESSION_SECRET || "dev_secret_key_123",
  resave: false,
  saveUninitialized: false,
  store: new MySQLStoreSession({
    clearExpired: true,
    checkExpirationInterval: 9e5,
    // 15 minutes
    expiration: 864e5,
    // 1 day
    createDatabaseTable: true,
    schema: {
      tableName: "http_sessions",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data"
      }
    }
  }, pool),
  // Use existing pool from db.ts
  cookie: {
    secure: process.env.NODE_ENV === "production",
    // Now works because of 'trust proxy'
    httpOnly: true,
    sameSite: "lax",
    // Safer default
    maxAge: 24 * 60 * 60 * 1e3
    // 1 day
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      log(`${req.method} ${path3} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});
(async () => {
  try {
    console.log("--- SYSTEM STARTUP: v2.5 (Email Debug Mode) ---");
    console.error("[Startup] Testing Database Connection...");
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM profiles");
    console.error(`[Startup] PROBE RESULT: Found ${rows[0].count} users in 'profiles' table.`);
    const [pages2] = await pool.query("SELECT COUNT(*) as count FROM pages");
    console.error(`[Startup] PROBE RESULT: Found ${pages2[0].count} pages in 'pages' table.`);
    console.error("!!! KILO UPDATE APPLIED: v3 SESSIONS !!!");
  } catch (err) {
    console.error("[Startup] CRITICAL DB ERROR:", err.message);
    process.exit(1);
  }
  await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ error: "Internal Server Error" });
    console.error("[ERROR]", err);
  });
  serveStatic(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  const server = (0, import_http.createServer)(app);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    console.error(`[Server] Listening on port ${port}`);
  });
})();
