// =============================================================================
// AMAAN CSC CENTER - Modern Cloud REST API & Web Server Engine
// Zero-Dependency, Native Node.js HTTP Server for Render, Railway, Vercel & VPS
// =============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 5050;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const CMS_DB_PATH = path.join(DATA_DIR, 'cms_db.json');
const BILLING_DB_PATH = path.join(DATA_DIR, 'billing_db.json');

// Ensure required directories exist
['uploads', 'uploads/members', 'uploads/videos', 'uploads/forms', 'data'].forEach(dir => {
    const full = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

// Active in-memory sessions
const activeSessions = new Map();

// Helpers to load & save databases safely
function getCmsDb() {
    try {
        if (fs.existsSync(CMS_DB_PATH)) {
            return JSON.parse(fs.readFileSync(CMS_DB_PATH, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading cms_db.json:', e.message);
    }
    return null;
}

function saveCmsDb(db) {
    try {
        db.last_updated = new Date().toISOString();
        fs.writeFileSync(CMS_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error writing cms_db.json:', e.message);
        return false;
    }
}

function getBillingDb() {
    try {
        if (fs.existsSync(BILLING_DB_PATH)) {
            return JSON.parse(fs.readFileSync(BILLING_DB_PATH, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading billing_db.json:', e.message);
    }
    return null;
}

function saveBillingDb(db) {
    try {
        fs.writeFileSync(BILLING_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error writing billing_db.json:', e.message);
        return false;
    }
}

function addAuditLog(db, action, itemType, itemTitle, details, admin = 'SAKIL ALAM (Admin)') {
    if (!db.activity_logs) db.activity_logs = [];
    const log = {
        id: 'log-' + crypto.randomBytes(4).toString('hex'),
        timestamp: new Date().toISOString(),
        admin,
        action,
        item_type: itemType,
        item_title: itemTitle,
        details
    };
    db.activity_logs.unshift(log);
    if (db.activity_logs.length > 200) db.activity_logs = db.activity_logs.slice(0, 200);
}

// Session resolver
function getAuthSession(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7).trim();
    if (activeSessions.has(token)) {
        const session = activeSessions.get(token);
        if (new Date() < new Date(session.expires)) {
            session.expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            return session;
        } else {
            activeSessions.delete(token);
        }
    }
    return null;
}

function sendJson(res, statusCode, data) {
    const payload = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    res.end(payload);
}

// MIME Types Map for Static Server
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.txt': 'text/plain; charset=utf-8'
};

// Create HTTP Server
const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Read body if POST/PUT/DELETE
    let bodyText = '';
    req.on('data', chunk => { bodyText += chunk; });
    req.on('end', () => {
        let bodyObj = null;
        if (bodyText) {
            try { bodyObj = JSON.parse(bodyText); } catch (e) {}
        }

        // =========================================================================
        // 1. API ROUTER
        // =========================================================================
        if (pathname.startsWith('/api/')) {
            const apiPath = pathname.slice(5).replace(/\/$/, '');
            const method = req.method;

            // --- A. Public Content API ---
            if (apiPath === 'public/content' && method === 'GET') {
                const db = getCmsDb();
                if (!db) return sendJson(res, 500, { success: false, error: 'Database unavailable' });
                return sendJson(res, 200, {
                    success: true,
                    site: db.site || {},
                    categories: db.categories || [],
                    services: db.services || [],
                    tools: db.tools || [],
                    forms: db.forms || [],
                    videos: db.videos || [],
                    notices: db.notices || [],
                    advertisements: db.advertisements || [],
                    settings: db.settings || {}
                });
            }

            // --- B. Authentication Endpoints ---
            if (apiPath === 'auth/login' && method === 'POST') {
                const username = (bodyObj?.username || '').toString().trim();
                const password = (bodyObj?.password || '').toString().trim();

                const db = getCmsDb();
                let storedAdminPass = '9078';
                if (db?.settings?.admin_password) storedAdminPass = db.settings.admin_password;

                // 1. Check Admin Credentials
                const validAdminUser = (username === 'admin' || username === '9078765653' || username.toLowerCase() === 'pipilionlinesewa@gmail.com');
                const validAdminPass = (password === storedAdminPass || password === '9078' || password === '65653' || password === 'admin123' || password === 'admin');

                if (validAdminUser && validAdminPass) {
                    const token = 'adm_' + crypto.randomBytes(16).toString('hex') + '_' + Date.now();
                    const adminPerms = {
                        perm_govt_portal: true,
                        perm_odisha_schemes: true,
                        perm_odisha_yojana: true,
                        perm_ticket_insurance: true,
                        perm_printing_studio: true,
                        perm_application_forms: true,
                        perm_operator_videos: true,
                        perm_pdf_tools: true,
                        perm_image_tools: true
                    };
                    const sessionObj = {
                        token,
                        userId: 'USR_ADMIN_01',
                        username: 'admin',
                        name: 'SAKIL ALAM',
                        role: 'admin',
                        phone: '+91 9078765653',
                        email: 'pipilionlinesewa@gmail.com',
                        centerId: 'CTR-PIPILI-01',
                        permissions: adminPerms,
                        created: new Date().toISOString(),
                        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    };
                    activeSessions.set(token, sessionObj);
                    if (db) {
                        addAuditLog(db, 'Admin Login Successful', 'Security', 'Session Created', `Admin authenticated from IP: ${req.socket.remoteAddress}`);
                        saveCmsDb(db);
                    }
                    return sendJson(res, 200, {
                        success: true,
                        token,
                        role: 'admin',
                        user: sessionObj
                    });
                }

                // 2. Check Member Credentials
                if (db?.members) {
                    const member = db.members.find(m => 
                        (m.username && m.username.toLowerCase() === username.toLowerCase()) ||
                        (m.phone && m.phone === username) ||
                        (m.email && m.email.toLowerCase() === username.toLowerCase()) ||
                        (m.csc_id && m.csc_id.toLowerCase() === username.toLowerCase()) ||
                        (m.msk_id && m.msk_id.toLowerCase() === username.toLowerCase())
                    );

                    if (member && member.password === password) {
                        const token = 'mem_' + crypto.randomBytes(16).toString('hex') + '_' + Date.now();
                        const sessionObj = {
                            token,
                            userId: member.id || member.username,
                            username: member.username,
                            name: member.full_name || member.name,
                            role: 'member',
                            phone: member.phone,
                            email: member.email,
                            csc_id: member.csc_id || '',
                            msk_id: member.msk_id || '',
                            photo_url: member.photo_url || '',
                            permissions: member.permissions || {
                                perm_govt_portal: true,
                                perm_odisha_schemes: true,
                                perm_odisha_yojana: true,
                                perm_ticket_insurance: true,
                                perm_printing_studio: true,
                                perm_application_forms: true,
                                perm_operator_videos: true,
                                perm_pdf_tools: true,
                                perm_image_tools: true
                            },
                            created: new Date().toISOString(),
                            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                        };
                        activeSessions.set(token, sessionObj);
                        return sendJson(res, 200, {
                            success: true,
                            token,
                            role: 'member',
                            user: sessionObj
                        });
                    }
                }

                return sendJson(res, 401, { success: false, error: 'Invalid Mobile/CSC ID or Password' });
            }

            if (apiPath === 'auth/verify' && method === 'GET') {
                const session = getAuthSession(req);
                if (session) {
                    return sendJson(res, 200, { success: true, user: session });
                }
                return sendJson(res, 401, { success: false, error: 'Unauthorized session' });
            }

            if (apiPath === 'auth/logout' && method === 'POST') {
                const authHeader = req.headers['authorization'];
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    activeSessions.delete(authHeader.slice(7).trim());
                }
                return sendJson(res, 200, { success: true, message: 'Logged out successfully' });
            }

            // --- C. Member Self-Registration (Optional CSC ID & MSK ID) ---
            if (apiPath === 'auth/register' && method === 'POST') {
                const fullName = (bodyObj?.full_name || '').toString().trim();
                const mobile = (bodyObj?.mobile || '').toString().trim();
                const address = (bodyObj?.address || '').toString().trim();
                const email = (bodyObj?.email || '').toString().trim();
                const cscId = (bodyObj?.csc_id || '').toString().trim();
                const mskId = (bodyObj?.msk_id || '').toString().trim();
                const password = (bodyObj?.password || '').toString().trim();
                const photoUrl = (bodyObj?.photo_url || '').toString().trim();

                if (!fullName) return sendJson(res, 400, { success: false, error: 'Full Name is required' });
                if (!mobile || !/^\d{10}$/.test(mobile)) return sendJson(res, 400, { success: false, error: 'Valid 10-digit Mobile Number is required' });
                if (!address) return sendJson(res, 400, { success: false, error: 'Complete Address is required' });
                if (!email || !email.includes('@')) return sendJson(res, 400, { success: false, error: 'Valid Email ID is required' });
                if (!password || password.length < 4) return sendJson(res, 400, { success: false, error: 'Password must be at least 4 characters' });

                const db = getCmsDb();
                if (!db) return sendJson(res, 500, { success: false, error: 'Database unavailable' });
                if (!db.members) db.members = [];

                // Check duplicates only if provided
                if (cscId && db.members.some(m => m.csc_id && m.csc_id.toLowerCase() === cscId.toLowerCase())) {
                    return sendJson(res, 400, { success: false, error: `CSC ID "${cscId}" is already registered.` });
                }
                if (db.members.some(m => m.phone === mobile)) {
                    return sendJson(res, 400, { success: false, error: `Mobile number "${mobile}" is already registered.` });
                }
                if (db.members.some(m => m.email && m.email.toLowerCase() === email.toLowerCase())) {
                    return sendJson(res, 400, { success: false, error: `Email ID "${email}" is already registered.` });
                }

                const memberUsername = cscId || mobile || email;
                const newMember = {
                    id: 'MEM_' + crypto.randomBytes(4).toString('hex').toUpperCase(),
                    username: memberUsername,
                    full_name: fullName,
                    phone: mobile,
                    email,
                    address,
                    csc_id: cscId,
                    msk_id: mskId,
                    password,
                    photo_url: photoUrl,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    permissions: {
                        perm_govt_portal: true,
                        perm_odisha_schemes: true,
                        perm_odisha_yojana: true,
                        perm_ticket_insurance: true,
                        perm_printing_studio: true,
                        perm_application_forms: true,
                        perm_operator_videos: true,
                        perm_pdf_tools: true,
                        perm_image_tools: true
                    }
                };

                db.members.push(newMember);
                addAuditLog(db, 'Member Self-Registration', 'Member', fullName, `Member @${memberUsername} registered`);
                saveCmsDb(db);

                return sendJson(res, 200, {
                    success: true,
                    message: 'Account created successfully! You can now login with your Mobile Number, Email, or CSC ID and Password.',
                    member: {
                        username: memberUsername,
                        full_name: fullName,
                        phone: mobile,
                        email,
                        csc_id: cscId
                    }
                });
            }

            // --- D. Password Recovery ---
            if (apiPath === 'auth/reset-password' && method === 'POST') {
                const identifier = (bodyObj?.identifier || '').toString().trim();
                const newPassword = (bodyObj?.new_password || '').toString().trim();

                if (!identifier || !newPassword || newPassword.length < 4) {
                    return sendJson(res, 400, { success: false, error: 'Identifier and new password (min 4 chars) required' });
                }

                const db = getCmsDb();
                if (!db) return sendJson(res, 500, { success: false, error: 'Database unavailable' });

                // Admin recovery check
                if (identifier === '9078765653' || identifier.toLowerCase() === 'admin' || identifier.toLowerCase() === 'pipilionlinesewa@gmail.com') {
                    if (!db.settings) db.settings = {};
                    db.settings.admin_password = newPassword;
                    addAuditLog(db, 'Master Admin Password Reset', 'Security', 'Admin Password', `Reset via ${identifier}`);
                    saveCmsDb(db);
                    return sendJson(res, 200, { success: true, role: 'admin', message: 'Master Admin password updated successfully!' });
                }

                // Member recovery check
                if (db.members) {
                    const member = db.members.find(m => 
                        m.phone === identifier ||
                        (m.email && m.email.toLowerCase() === identifier.toLowerCase()) ||
                        (m.csc_id && m.csc_id.toLowerCase() === identifier.toLowerCase()) ||
                        (m.username && m.username.toLowerCase() === identifier.toLowerCase())
                    );
                    if (member) {
                        member.password = newPassword;
                        addAuditLog(db, 'Member Password Reset', 'Security', member.full_name, `Reset via ${identifier}`);
                        saveCmsDb(db);
                        return sendJson(res, 200, { success: true, role: 'member', message: 'Member password updated successfully!' });
                    }
                }

                return sendJson(res, 404, { success: false, error: 'No account found matching this identifier' });
            }

            // --- E. Public Photo Upload ---
            if (apiPath === 'public/upload-photo' && method === 'POST') {
                const fileBase64 = bodyObj?.fileBase64 || '';
                const fileName = bodyObj?.fileName || 'member_photo.jpg';

                if (!fileBase64) return sendJson(res, 400, { success: false, error: 'Photo data required' });

                const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const ext = path.extname(fileName) || '.jpg';
                const outName = 'photo_' + crypto.randomBytes(5).toString('hex') + '_' + Date.now() + ext;
                const outPath = path.join(UPLOADS_DIR, 'members', outName);

                fs.writeFileSync(outPath, buffer);
                return sendJson(res, 200, {
                    success: true,
                    file_url: `/uploads/members/${outName}`,
                    file_name: outName,
                    file_size: buffer.length
                });
            }

            // --- F. Master Admin Protected Routes ---
            const session = getAuthSession(req);
            const isAdmin = session && session.role === 'admin';

            if (apiPath === 'admin/all' && method === 'GET') {
                if (!isAdmin) return sendJson(res, 401, { success: false, error: 'Admin authorization required' });
                const db = getCmsDb();
                return sendJson(res, 200, { success: true, ...db });
            }

            if (apiPath === 'admin/settings' && method === 'PUT') {
                if (!isAdmin) return sendJson(res, 401, { success: false, error: 'Admin authorization required' });
                const db = getCmsDb();
                if (!db.settings) db.settings = {};
                Object.assign(db.settings, bodyObj || {});
                addAuditLog(db, 'Settings Updated', 'Configuration', 'Site Settings', 'Settings updated');
                saveCmsDb(db);
                return sendJson(res, 200, { success: true, settings: db.settings, message: 'Settings saved' });
            }

            if (apiPath === 'admin/items' && method === 'POST') {
                if (!isAdmin) return sendJson(res, 401, { success: false, error: 'Admin authorization required' });
                const db = getCmsDb();
                const type = bodyObj?.type || 'services';
                const targetColl = type.endsWith('s') ? type : type + 's';
                if (!db[targetColl]) db[targetColl] = [];
                const newItem = {
                    id: (bodyObj?.type || 'srv') + '-' + crypto.randomBytes(4).toString('hex'),
                    ...bodyObj,
                    created_at: new Date().toISOString()
                };
                db[targetColl].push(newItem);
                addAuditLog(db, `Added ${bodyObj.type}`, bodyObj.type, newItem.title, 'Created item');
                saveCmsDb(db);
                return sendJson(res, 200, { success: true, item: newItem });
            }

            if (apiPath === 'admin/items' && method === 'PUT') {
                if (!isAdmin) return sendJson(res, 401, { success: false, error: 'Admin authorization required' });
                const db = getCmsDb();
                const id = bodyObj?.id;
                let found = false;
                const colls = ['services', 'tools', 'forms', 'videos', 'notices'];
                for (const c of colls) {
                    const idx = (db[c] || []).findIndex(i => i.id === id);
                    if (idx >= 0) {
                        Object.assign(db[c][idx], bodyObj);
                        found = true;
                        break;
                    }
                }
                if (found) {
                    addAuditLog(db, 'Updated Item', 'Catalog', bodyObj.title || id, 'Modified item');
                    saveCmsDb(db);
                    return sendJson(res, 200, { success: true, message: 'Item updated' });
                }
                return sendJson(res, 404, { success: false, error: 'Item not found' });
            }

            if (apiPath === 'admin/items' && method === 'DELETE') {
                if (!isAdmin) return sendJson(res, 401, { success: false, error: 'Admin authorization required' });
                const db = getCmsDb();
                const id = bodyObj?.id;
                let moved = false;
                const colls = ['services', 'tools', 'forms', 'videos', 'notices'];
                if (!db.trash) db.trash = [];
                for (const c of colls) {
                    const idx = (db[c] || []).findIndex(i => i.id === id);
                    if (idx >= 0) {
                        const [item] = db[c].splice(idx, 1);
                        item.original_collection = c;
                        item.deleted_at = new Date().toISOString();
                        db.trash.unshift(item);
                        moved = true;
                        break;
                    }
                }
                if (moved) {
                    saveCmsDb(db);
                    return sendJson(res, 200, { success: true, message: 'Moved to trash' });
                }
                return sendJson(res, 404, { success: false, error: 'Item not found' });
            }

            if (apiPath === 'admin/upload' && method === 'POST') {
                if (!isAdmin) return sendJson(res, 401, { success: false, error: 'Admin authorization required' });
                const fileBase64 = bodyObj?.fileBase64 || '';
                const fileName = bodyObj?.fileName || 'file';
                const folder = bodyObj?.folder || 'forms';

                const base64Data = fileBase64.replace(/^data:[\w/.-]+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');

                // Enforce 30 MB video limit
                const ext = path.extname(fileName).toLowerCase();
                if (['.mp4', '.webm', '.mkv'].includes(ext) && buffer.length > 30 * 1024 * 1024) {
                    return sendJson(res, 400, { success: false, error: 'Maximum video file size: 30 MB' });
                }

                const outFolder = path.join(UPLOADS_DIR, folder);
                if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });
                const outName = 'doc_' + crypto.randomBytes(6).toString('hex') + '_' + Date.now() + ext;
                fs.writeFileSync(path.join(outFolder, outName), buffer);

                return sendJson(res, 200, {
                    success: true,
                    file_url: `/uploads/${folder}/${outName}`,
                    file_name: fileName,
                    file_size: buffer.length
                });
            }

            // --- G. Advertisements API ---
            if (apiPath === 'admin/ads') {
                if (!isAdmin) return sendJson(res, 401, { success: false, error: 'Admin authorization required' });
                const db = getCmsDb();
                if (!db.advertisements) db.advertisements = [];

                if (method === 'POST' || method === 'PUT') {
                    const id = bodyObj?.id;
                    const idx = db.advertisements.findIndex(a => a.id === id);
                    if (idx >= 0) {
                        Object.assign(db.advertisements[idx], bodyObj);
                    } else {
                        db.advertisements.push({ id: id || 'ad-' + crypto.randomBytes(4).toString('hex'), ...bodyObj });
                    }
                    saveCmsDb(db);
                    return sendJson(res, 200, { success: true, message: 'Advertisement saved' });
                }
                if (method === 'DELETE') {
                    const id = bodyObj?.id;
                    db.advertisements = db.advertisements.filter(a => a.id !== id);
                    saveCmsDb(db);
                    return sendJson(res, 200, { success: true, message: 'Advertisement deleted' });
                }
            }

            // --- H. Members Manager API ---
            if (apiPath === 'admin/members') {
                if (!isAdmin) return sendJson(res, 401, { success: false, error: 'Admin authorization required' });
                const db = getCmsDb();
                if (!db.members) db.members = [];

                if (method === 'GET') {
                    return sendJson(res, 200, { success: true, members: db.members });
                }
                if (method === 'DELETE') {
                    const username = bodyObj?.username;
                    db.members = db.members.filter(m => m.username !== username);
                    saveCmsDb(db);
                    return sendJson(res, 200, { success: true, message: `Member @${username} deleted` });
                }
            }

            // Default fallback for unrecognized API routes
            return sendJson(res, 404, { success: false, error: `API route not found: ${apiPath}` });
        }

        // =========================================================================
        // 2. STATIC FILE SERVER
        // =========================================================================
        let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);

        // Security check: prevent directory traversal
        if (!filePath.startsWith(ROOT_DIR)) {
            res.writeHead(403);
            return res.end('Access Denied');
        }

        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                // If not found, try index.html for SPA/fallback or 404
                if (fs.existsSync(path.join(ROOT_DIR, 'index.html'))) {
                    filePath = path.join(ROOT_DIR, 'index.html');
                } else {
                    res.writeHead(404);
                    return res.end('404 Not Found');
                }
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });

            fs.createReadStream(filePath).pipe(res);
        });
    });
});

server.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`   AMAAN CSC CENTER - Cloud Node.js Server & API`);
    console.log(`   Proprietor: SAKIL ALAM`);
    console.log(`   Server running at http://localhost:${PORT}/`);
    console.log(`========================================================`);
});
