import { storage } from './storage';
import { db } from './db';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Express } from 'express';
import type { SessionData } from 'express-session';
import { AuthService } from './services/auth';
import { profiles } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { PowerBIService } from './services/powerbi';
import { EmailService } from './services/email';

const router = Router();

// DEBUG ROUTE - Test email functionality
router.post('/api/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const success = await EmailService.sendEmail({
            to: email,
            subject: 'Test Email from Portal BOOST',
            html: '<h1>Test Email</h1><p>This is a test email from Portal BOOST.</p>'
        });

        if (success) {
            res.json({ message: 'Test email sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send test email' });
        }
    } catch (error: any) {
        console.error('Test email error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// AUTH MIDDLEWARE (Stable Version)
function requireAuth(req: any, res: any, next: any) {
    if (req.session && req.session.userId) {
        req.user = { id: req.session.userId };
        return next();
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// --- ADMIN ROUTES ---
router.get('/api/admin/users', requireAuth, async (req, res) => {
    const { search, role, limit = 50, offset = 0 } = req.query;
    const result = await storage.getUsers(search as string, role as string, Number(limit), Number(offset));
    res.json(result);
});

router.get('/api/admin/pages', requireAuth, async (req, res) => {
    const pages = await storage.getPages();
    res.json(pages);
});

router.post('/api/admin/pages', requireAuth, async (req, res) => {
    try { res.json(await storage.createPage(req.body)); }
    catch (e) { res.status(500).json({ error: 'Create page failed' }); }
});

router.patch('/api/admin/pages/:id', requireAuth, async (req, res) => {
    try { res.json(await storage.updatePage(req.params.id, req.body)); }
    catch (e) { res.status(500).json({ error: 'Update page failed' }); }
});

router.delete('/api/admin/pages/:id', requireAuth, async (req, res) => {
    try { await storage.deletePage(req.params.id); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: 'Delete page failed' }); }
});

// MISSING ROUTE RESTORED HERE
// 1. GET User Pages (This was missing!)
router.get('/api/admin/users/:id/pages', requireAuth, async (req, res) => {
    try {
        const access = await storage.getUserPageAccess(req.params.id);
        res.json(access);
    } catch (error) {
        console.error('Get user pages error:', error);
        res.status(500).json({ error: 'Failed to fetch user pages' });
    }
});

router.post('/api/admin/users', requireAuth, async (req, res) => {
    try {
        const newUser = await storage.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error: any) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

router.patch('/api/admin/users/:id', requireAuth, async (req, res) => {
    try {
        const updatedUser = await storage.updateUser(req.params.id, req.body);
        res.json(updatedUser);
    } catch (error: any) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

router.post('/api/admin/users/:id/assign-pages', requireAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        const { pageIds } = req.body;

        if (!Array.isArray(pageIds)) {
            return res.status(400).json({ error: 'pageIds must be an array' });
        }

        await storage.setUserPageAccess(userId, pageIds);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Assign pages error:', error);
        res.status(500).json({ error: 'Failed to assign pages' });
    }
});

router.post('/api/admin/users/:id/reset-password', requireAuth, async (req, res) => {
    try {
        await storage.resetUserPassword(req.params.id);
        res.json({ success: true, message: 'Password reset email sent' });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

router.delete('/api/admin/users/:id', requireAuth, async (req, res) => {
    try {
        await storage.deleteUser(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

router.get('/api/admin/azure', requireAuth, async (req, res) => {
    const settings = await storage.getAzureSettings();
    if (settings) {
        const { clientSecretCipher, ...safe } = settings;
        res.json(safe);
    } else {
        res.json({});
    }
});

router.post('/api/admin/azure', requireAuth, async (req, res) => {
    try { res.json(await storage.saveAzureSettings(req.body)); }
    catch (e) { res.status(500).json({ error: 'Save Azure failed' }); }
});

// --- USER ROUTES ---
router.get('/api/users', requireAuth, async (req, res) => {
    const { search, role, limit = 50, offset = 0 } = req.query;
    res.json(await storage.getUsers(search as string, role as string, Number(limit), Number(offset)));
});

router.post('/api/users', requireAuth, async (req, res) => {
    res.status(201).json(await storage.createUser(req.body));
});

router.patch('/api/users/:id', requireAuth, async (req, res) => {
    res.json(await storage.updateUser(req.params.id, req.body));
});

// --- AUTH ROUTES ---
router.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        if (!result) return res.status(401).json({ message: 'Invalid credentials' });

        if (req.session) {
            const session = req.session as SessionData;
            session.userId = result.user.id;
            session.loginTime = Date.now();
        }
        res.json(result.user);
    } catch (error: any) {
        res.status(500).json({ message: 'Login Failed', error: error.message });
    }
});

router.post('/api/auth/logout', (req, res) => {
    if (req.session) req.session.destroy(() => res.json({ message: 'Logged out' }));
    else res.json({ message: 'Logged out' });
});

router.get('/api/auth/user', requireAuth, async (req, res) => {
    const user = await storage.getUserById(req.user.id);
    res.json(user);
});

router.patch('/api/auth/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 1. Get current user data to check existing password
        const user = await storage.getUserById(req.user.id);

        if (!user || !user.password) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 2. Verify current password
        const isValid = await AuthService.verifyPassword(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
        }

        // 3. Hash new password
        const hashedPassword = await AuthService.hashPassword(newPassword);

        // 4. Update user: set new password AND clear mustChangePassword flag
        await storage.updateUser(user.id, {
            password: hashedPassword,
            mustChangePassword: false
        });

        console.log(`[Auth] Password changed successfully for user ${user.email}`);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

router.get('/api/user/dashboards', requireAuth, async (req, res) => {
    const pages = await storage.getUserDashboards(req.user.id);
    res.json(pages);
});

// PAGE ACCESS ROUTES
router.get('/api/pages/slug/:slug', requireAuth, async (req, res) => {
    try {
        // Retrieve the page using storage.getPageBySlug
        const page = await storage.getPageBySlug(req.params.slug);

        // Return 404 if page is not found
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        // Check if the user has access to the page (admin or assigned access)
        const user = await storage.getUserById(req.user.id);
        const isAdmin = user?.role === 'admin';

        if (!isAdmin) {
            const access = await storage.getUserPageAccess(req.user.id);
            const hasAccess = access.some(a => a.pageId === page.id && a.enabled);

            // Return 403 if user doesn't have access
            if (!hasAccess) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        // Return the page details if access is granted
        res.json(page);
    } catch (error: any) {
        console.error('Get page by slug error:', error);
        res.status(500).json({ error: 'Failed to retrieve page' });
    }
});

// --- HYBRID POWERBI ROUTE ---
router.post('/api/powerbi/embed', requireAuth, async (req, res) => {
    try {
        const { pageId } = req.body;
        if (!pageId) return res.status(400).json({ error: 'Missing pageId' });

        const page = await storage.getPageById(pageId);
        if (!page) return res.status(404).json({ error: 'Page not found' });

        const user = await storage.getUserById(req.user.id);
        const isAdmin = user?.role === 'admin';
        const access = await storage.getUserPageAccess(req.user.id);
        const hasAccess = access.find(a => a.pageId === page.id && a.enabled);

        if (!hasAccess && !isAdmin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const embedConfig = await PowerBIService.getEmbedDetails(page.workspaceId, page.reportId);
        res.json(embedConfig);
    } catch (error: any) {
        console.error('PowerBI Embed Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Reset password confirmation endpoint
router.post('/api/auth/reset-password-confirm', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        // 1. Verify token
        const user = await storage.verifyResetToken(token);
        if (!user) {
            return res.status(400).json({ error: 'El enlace ha expirado o no es válido.' });
        }

        // 2. Hash new password
        const hashedPassword = await AuthService.hashPassword(newPassword);

        // 3. Update password and clear token
        await storage.completePasswordReset(user.id, hashedPassword);

        console.log(`[Auth] Password successfully reset for user ${user.email}`);
        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
        console.error('Reset confirm error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export async function registerRoutes(app: Express) {
    app.use('/', router);
    return app;
}