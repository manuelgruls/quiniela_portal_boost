import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { AuthService } from "./services/auth";
import { PowerBIService } from "./services/powerbi";
import { insertProfileSchema, insertPageSchema, insertAzureSettingsSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import { nanoid } from "nanoid";

// Enhanced schemas with validation and sanitization
const loginSchema = z.object({
    email: z.string().email().max(255).transform(val => val.toLowerCase().trim()),
    password: z.string().min(1).max(1000),
    csrfToken: z.string().optional()
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(1000)
});

const resetPasswordSchema = z.object({
    email: z.string().email().max(255).transform(val => val.toLowerCase().trim())
});

const embedRequestSchema = z.object({
    pageId: z.string().uuid()
});

// Security utilities
const rateLimitCache = new Map<string, { count: number; firstRequest: number; blocked: boolean }>();
const loginAttempts = new Map<string, { count: number; lastAttempt: number; locked: boolean }>();

const securityLogger = {
    log: (data: any) => {
        console.log('[Security]', JSON.stringify({
            ...data,
            timestamp: new Date().toISOString(),
            requestId: nanoid(8)
        }));
    }
};

// Rate limiting function
function checkRateLimit(ip: string, maxRequests: number = 60, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = rateLimitCache.get(ip) || { count: 0, firstRequest: now, blocked: false };

    if (now - record.firstRequest > windowMs) {
        // Reset window
        record.count = 0;
        record.firstRequest = now;
        record.blocked = false;
    }

    record.count++;
    rateLimitCache.set(ip, record);

    if (record.count > maxRequests) {
        record.blocked = true;
        securityLogger.log({
            type: 'RATE_LIMIT_EXCEEDED',
            ip,
            count: record.count,
            maxRequests
        });
        return false;
    }

    return true;
}

// Login attempt tracking
function checkLoginAttempts(email: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const emailKey = email.toLowerCase();
    const record = loginAttempts.get(emailKey) || { count: 0, lastAttempt: now, locked: false };

    if (now - record.lastAttempt > windowMs) {
        // Reset window
        record.count = 0;
        record.lastAttempt = now;
        record.locked = false;
    }

    record.lastAttempt = now;
    loginAttempts.set(emailKey, record);

    if (record.count >= maxAttempts) {
        record.locked = true;
        securityLogger.log({
            type: 'ACCOUNT_LOCKED',
            email: emailKey,
            attempts: record.count,
            maxAttempts
        });
        return false;
    }

    return true;
}

// Input sanitization
function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}

// CSRF token validation
function validateCSRFToken(req: any, res: any): boolean {
    if (req.method !== 'POST') return true;

    const csrfToken = req.body.csrfToken;
    const sessionToken = req.session.csrfToken;

    if (!csrfToken || !sessionToken) {
        securityLogger.log({
            type: 'CSRF_TOKEN_MISSING',
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl
        });
        return false;
    }

    if (csrfToken !== sessionToken) {
        securityLogger.log({
            type: 'CSRF_TOKEN_INVALID',
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            expectedToken: sessionToken,
            receivedToken: csrfToken
        });
        return false;
    }

    return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
    // Enhanced session configuration
    app.use(session({
        secret: process.env.SESSION_SECRET || 'portal-boost-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            signed: true
        },
        genid: () => nanoid(32),
        name: 'portal.sid'
    }));

    // CSRF token generation middleware
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.session.csrfToken) {
            req.session.csrfToken = nanoid(32);
        }
        next();
    });

    // Request logging middleware
    app.use((req, res, next) => {
        const requestId = nanoid(8);
        res.setHeader('X-Request-ID', requestId);

        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            securityLogger.log({
                requestId,
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent') || 'Unknown',
                contentLength: res.get('content-length') || 0
            });
        });

        next();
    });

    // Authentication middleware
    const requireAuth = async (req: any, res: any, next: any) => {
        const sessionId = req.session.sessionId;
        if (!sessionId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await AuthService.validateSession(sessionId);
        if (!user) {
            req.session.destroy();
            return res.status(401).json({ message: 'Invalid session' });
        }

        req.user = user;
        next();
    };

    const requireAdmin = (req: any, res: any, next: any) => {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    };

    // Enhanced Login Route with security improvements
    app.post('/api/auth/login', async (req, res) => {
        const startTime = Date.now();
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'Unknown';

        try {
            // Rate limiting check
            if (!checkRateLimit(clientIP)) {
                securityLogger.log({
                    type: 'LOGIN_RATE_LIMITED',
                    ip: clientIP,
                    userAgent,
                    duration: Date.now() - startTime
                });
                return res.status(429).json({
                    message: 'Too many requests. Please try again later.',
                    retryAfter: 900 // 15 minutes
                });
            }

            // Validate CSRF token
            if (!validateCSRFToken(req, res)) {
                return res.status(403).json({
                    message: 'Invalid CSRF token',
                    code: 'CSRF_VALIDATION_FAILED'
                });
            }

            // Parse and sanitize input
            const { email, password } = loginSchema.parse(req.body);

            // Additional sanitization
            const sanitizedEmail = sanitizeInput(email);
            const sanitizedPassword = sanitizeInput(password);

            // Check login attempts
            if (!checkLoginAttempts(sanitizedEmail)) {
                securityLogger.log({
                    type: 'LOGIN_ATTEMPTS_EXCEEDED',
                    email: sanitizedEmail,
                    ip: clientIP,
                    userAgent,
                    duration: Date.now() - startTime
                });
                return res.status(429).json({
                    message: 'Too many login attempts. Account temporarily locked.',
                    retryAfter: 900 // 15 minutes
                });
            }

            // Attempt login
            const result = await AuthService.login(sanitizedEmail, sanitizedPassword);

            if (!result) {
                // Log failed attempt
                const emailKey = sanitizedEmail.toLowerCase();
                const attempts = loginAttempts.get(emailKey) || { count: 0, lastAttempt: Date.now(), locked: false };
                attempts.count++;
                attempts.lastAttempt = Date.now();
                loginAttempts.set(emailKey, attempts);

                securityLogger.log({
                    type: 'LOGIN_FAILED',
                    email: sanitizedEmail,
                    ip: clientIP,
                    userAgent,
                    attempts: attempts.count,
                    duration: Date.now() - startTime
                });

                return res.status(401).json({
                    message: 'Invalid credentials',
                    code: 'AUTHENTICATION_FAILED'
                });
            }

            // Successful login - clear failed attempts
            loginAttempts.delete(sanitizedEmail.toLowerCase());

            // Enhanced session setup
            const sessionId = nanoid(32);
            req.session.sessionId = sessionId;
            req.session.userId = result.user.id;
            req.session.loginTime = Date.now();
            req.session.userAgent = userAgent;
            req.session.ipAddress = clientIP;

            // Log successful login
            securityLogger.log({
                type: 'LOGIN_SUCCESS',
                userId: result.user.id,
                email: sanitizedEmail,
                ip: clientIP,
                userAgent,
                duration: Date.now() - startTime,
                sessionId: sessionId.substring(0, 8) + '...'
            });

            res.json(result.user);
        } catch (error: any) {
            // Enhanced error handling
            const errorType = error.name === 'ZodError' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';

            securityLogger.log({
                type: 'LOGIN_ERROR',
                error: errorType,
                message: error.message,
                ip: clientIP,
                userAgent,
                duration: Date.now() - startTime,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });

            if (error.name === 'ZodError') {
                return res.status(400).json({
                    message: 'Invalid request data',
                    code: 'VALIDATION_ERROR',
                    details: error.errors
                });
            }

            res.status(500).json({
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    });

    // CSRF token endpoint
    app.get('/api/auth/csrf-token', (req, res) => {
        if (!req.session.csrfToken) {
            req.session.csrfToken = nanoid(32);
        }
        res.json({ csrfToken: req.session.csrfToken });
    });

    app.post('/api/auth/logout', requireAuth, async (req, res) => {
        try {
            // Log logout attempt
            securityLogger.log({
                type: 'LOGOUT',
                userId: req.user!.id,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            await AuthService.logout(req.session.sessionId!);
            req.session.destroy((err) => {
                if (err) {
                    securityLogger.log({
                        type: 'LOGOUT_ERROR',
                        userId: req.user!.id,
                        error: err.message
                    });
                    return res.status(500).json({ message: 'Logout failed' });
                }
                res.json({ message: 'Logged out successfully' });
            });
        } catch (error) {
            res.status(500).json({ message: 'Logout failed' });
        }
    });

    app.get('/api/auth/user', requireAuth, (req, res) => {
        res.json(req.user!);
    });

    app.patch('/api/auth/change-password', requireAuth, async (req, res) => {
        try {
            const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

            // In a real implementation, verify current password
            await AuthService.changePassword(req.user!.id, newPassword);

            securityLogger.log({
                type: 'PASSWORD_CHANGED',
                userId: req.user!.id,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            res.status(400).json({ message: 'Failed to change password' });
        }
    });

    app.post('/api/auth/reset-password', async (req, res) => {
        try {
            const { email } = resetPasswordSchema.parse(req.body);

            const user = await storage.getUserByEmail(email);
            if (user) {
                await storage.resetUserPassword(user.id);
            }

            // Always return success to prevent email enumeration
            res.json({ message: 'Reset email sent if account exists' });
        } catch (error) {
            console.error('[Login Error]:', error);
            res.status(500).json({ message: 'Internal Server Error', error: String(error) });
        }
    });

    // User dashboard routes
    app.get('/api/user/dashboards', requireAuth, async (req, res) => {
        try {
            const dashboards = await storage.getUserDashboards(req.user!.id);
            res.json(dashboards);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get dashboards' });
        }
    });

    // Page routes
    app.get('/api/pages/slug/:slug', requireAuth, async (req, res) => {
        try {
            console.log('[API] Fetching page for slug:', req.params.slug);
            const page = await storage.getPageBySlug(req.params.slug);
            console.log('[API] Page found:', page ? page.title : 'NOT FOUND');
            if (!page) {
                return res.status(404).json({ message: 'Page not found' });
            }

            // Check user access (admins have access to all pages)
            if (req.user!.role !== 'admin') {
                const userAccess = await storage.getUserPageAccess(req.user!.id);
                const hasAccess = userAccess.some(access =>
                    access.pageId === page.id && access.enabled
                );

                if (!hasAccess) {
                    return res.status(403).json({ message: 'Access denied' });
                }
            }

            // Ensure all required fields are present, including icon
            const pageData = {
                id: page.id,
                slug: page.slug,
                title: page.title,
                icon: page.icon || null,
                description: page.description || null,
                workspaceId: page.workspaceId,
                reportId: page.reportId,
                datasetId: page.datasetId,
                defaultPageName: page.defaultPageName,
                showFilterPane: page.showFilterPane,
                createdAt: page.createdAt,
                updatedAt: page.updatedAt
            };

            res.json(pageData);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get page' });
        }
    });

    // Power BI embed route
    app.post('/api/powerbi/embed', requireAuth, async (req, res) => {
        try {
            console.log('[API] Generating Embed for Page ID:', req.body.pageId);
            const { pageId } = embedRequestSchema.parse(req.body);

            const page = await storage.getPageById(pageId);
            if (!page) {
                return res.status(404).json({ message: 'Page not found' });
            }

            // Check user access
            if (req.user!.role !== 'admin') {
                const userAccess = await storage.getUserPageAccess(req.user!.id);
                const hasAccess = userAccess.some(access =>
                    access.pageId === pageId && access.enabled
                );

                if (!hasAccess) {
                    return res.status(403).json({ message: 'Access denied' });
                }
            }

            const embedConfig = await PowerBIService.getEmbedConfig(
                page.workspaceId,
                page.reportId,
                page.datasetId
            );

            res.json(embedConfig);
        } catch (error: any) {
            console.error('PowerBI embed error:', error);
            res.status(500).json({ message: error.message || 'Failed to generate embed config' });
        }
    });

    // Admin routes
    app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
        try {
            const { search, role, limit = '50', offset = '0' } = req.query;

            const result = await storage.getUsers(
                search as string,
                role as string,
                parseInt(limit as string),
                parseInt(offset as string)
            );

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get users' });
        }
    });

    app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
        try {
            const userData = insertProfileSchema.parse(req.body);
            const newUser = await storage.createUser(userData);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).json({ message: 'Failed to create user' });
        }
    });

    app.patch('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
        try {
            const updates = insertProfileSchema.partial().parse(req.body);
            const updatedUser = await storage.updateUser(req.params.id, updates);
            res.json(updatedUser);
        } catch (error) {
            res.status(400).json({ message: 'Failed to update user' });
        }
    });

    app.post('/api/admin/users/:id/reset-password', requireAuth, requireAdmin, async (req, res) => {
        try {
            await storage.resetUserPassword(req.params.id);
            res.json({ message: 'Password reset email sent' });
        } catch (error) {
            res.status(400).json({ message: 'Failed to reset password' });
        }
    });

    app.post('/api/admin/users/:id/assign-pages', requireAuth, requireAdmin, async (req, res) => {
        try {
            const userId = req.params.id;

            // Validate request body
            const pageIdsSchema = z.object({
                pageIds: z.array(z.string().uuid()).default([])
            });

            const { pageIds } = pageIdsSchema.parse(req.body);

            // Verify user exists
            const user = await storage.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Verify all pages exist if pageIds is not empty
            if (pageIds.length > 0) {
                const allPages = await storage.getPages();
                const existingPageIds = new Set(allPages.map(p => p.id));
                const invalidPageIds = pageIds.filter(id => !existingPageIds.has(id));

                if (invalidPageIds.length > 0) {
                    return res.status(400).json({
                        message: 'Some pages do not exist',
                        invalidPageIds
                    });
                }
            }

            // Remove duplicates and set user page access
            const uniquePageIds = Array.from(new Set(pageIds));
            await storage.setUserPageAccess(userId, uniquePageIds);

            // Return updated access list
            const updatedAccess = await storage.getUserPageAccess(userId);
            res.json({
                message: 'Pages assigned successfully',
                userPageAccess: updatedAccess
            });
        } catch (error: any) {
            if (error?.name === 'ZodError') {
                return res.status(400).json({ message: 'Invalid request data', details: error.errors });
            }
            res.status(400).json({ message: 'Failed to assign pages' });
        }
    });

    app.get('/api/admin/users/:id/pages', requireAuth, requireAdmin, async (req, res) => {
        try {
            const userId = req.params.id;

            // Verify user exists
            const user = await storage.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userAccess = await storage.getUserPageAccess(userId);
            res.json(userAccess);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get user pages' });
        }
    });

    app.get('/api/admin/pages', requireAuth, requireAdmin, async (req, res) => {
        try {
            const pages = await storage.getPages();
            res.json(pages);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get pages' });
        }
    });

    app.post('/api/admin/pages', requireAuth, requireAdmin, async (req, res) => {
        try {
            console.log('[API] Creating Page Payload:', req.body);
            const pageData = insertPageSchema.parse(req.body);
            const newPage = await storage.createPage(pageData);
            res.status(201).json(newPage);
        } catch (error) {
            res.status(400).json({ message: 'Failed to create page' });
        }
    });

    app.patch('/api/admin/pages/:id', requireAuth, requireAdmin, async (req, res) => {
        try {
            console.log('[API] Update Request Body:', JSON.stringify(req.body));
            const updates = insertPageSchema.partial().parse(req.body);
            const updatedPage = await storage.updatePage(req.params.id, updates);
            console.log('[API] Update Result:', updatedPage);
            console.log('[API] Drizzle Update Result:', updatedPage);
            res.json(updatedPage);
        } catch (error) {
            res.status(400).json({ message: 'Failed to update page' });
        }
    });

    app.delete('/api/admin/pages/:id', requireAuth, requireAdmin, async (req, res) => {
        try {
            await storage.deletePage(req.params.id);
            res.json({ message: 'Page deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: 'Failed to delete page' });
        }
    });

    app.get('/api/admin/azure', requireAuth, requireAdmin, async (req, res) => {
        try {
            const settings = await storage.getAzureSettings();
            if (!settings) {
                return res.json(null);
            }

            // Don't send the encrypted secret to client
            const { clientSecretCipher, ...safeSettings } = settings;
            res.json(safeSettings);
        } catch (error) {
            res.status(500).json({ message: 'Failed to get Azure settings' });
        }
    });

    app.post('/api/admin/azure', requireAuth, requireAdmin, async (req, res) => {
        try {
            const settingsData = insertAzureSettingsSchema.parse({
                ...req.body,
                createdBy: req.user!.id
            });

            const settings = await storage.saveAzureSettings(settingsData);

            // Don't send the encrypted secret to client
            const { clientSecretCipher, ...safeSettings } = settings;
            res.json(safeSettings);
        } catch (error) {
            res.status(400).json({ message: 'Failed to save Azure settings' });
        }
    });

    app.post('/api/admin/azure/test-connection', requireAuth, requireAdmin, async (req, res) => {
        try {
            const result = await PowerBIService.testConnection();
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    });

    const httpServer = createServer(app);
    return httpServer;
}