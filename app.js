// AMAAN CSC CENTER - Three-Panel Reactive Controller & Interactive Engine
// Panel 1: Public Panel (Dynamic Advertisements, Public PDF & Image Tools, Login CTA)
// Panel 2: Member Portal (6 Protected Categories strictly gated by Server-Side RBAC & Permissions)
// Panel 3: Master Admin CMS (Accessed via admin.html)

const API_BASE = (window.location.protocol.startsWith('http')) ? window.location.origin + '/api' : 'http://localhost:5050/api';

let publicContentState = null;
let memberPortalState = null;
let currentActiveMemberCategory = 'government';
let memberSearchFilter = '';

// Session Helpers
function getAuthToken() {
    return localStorage.getItem('amaan_auth_token') || localStorage.getItem('amaan_admin_token') || localStorage.getItem('billing_token') || '';
}

function getSessionUser() {
    try {
        const raw = localStorage.getItem('amaan_csc_user');
        return raw ? JSON.parse(raw) : null;
    } catch(e) {
        return null;
    }
}

window.showSiteToast = function(msg, type = 'info') {
    let toast = document.getElementById('siteGlobalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'siteGlobalToast';
        document.body.appendChild(toast);
    }
    toast.className = 'fixed bottom-5 right-5 z-[9999] max-w-sm px-4 py-3 rounded-2xl shadow-2xl text-white font-bold text-xs flex items-center gap-2 transition-all transform duration-300 ' + (type === 'error' ? 'bg-rose-600' : 'bg-emerald-600');
    toast.innerHTML = '<span>' + (type === 'error' ? '⚠️' : '✓') + '</span><span>' + msg + '</span>';
    toast.style.display = 'flex';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3500);
};

// =========================================================================
// 1. PRIMARY APP CONTROLLER: ROUTE BETWEEN PUBLIC PANEL & MEMBER PORTAL
// =========================================================================
window.initThreePanelApp = async function() {
    initTheme();
    const token = getAuthToken();
    const user = getSessionUser();

    if (token && user) {
        await loadMemberPortal();
    } else {
        await loadPublicPanel();
    }
    updateAuthUI();
};

// -------------------------------------------------------------------------
// PANEL 1: PUBLIC PANEL LOADER (NO LOGIN REQUIRED)
// -------------------------------------------------------------------------
async function loadPublicPanel() {
    const publicView = document.getElementById('publicPanelView');
    const memberView = document.getElementById('memberPanelView');
    if (publicView) publicView.classList.remove('hidden');
    if (memberView) memberView.classList.add('hidden');

    // Update Header Counts for Public Visitors
    const hdrServices = document.getElementById('headerServicesCount');
    const hdrTools = document.getElementById('headerToolsCount');
    const hdrForms = document.getElementById('headerFormsCount');
    const hdrVideos = document.getElementById('headerVideosCount');
    if (hdrServices) hdrServices.innerText = '140+ 🔒';
    if (hdrTools) hdrTools.innerText = '53';
    if (hdrForms) hdrForms.innerText = '30 🔒';
    if (hdrVideos) hdrVideos.innerText = '6 🔒';

    try {
        const res = await fetch(`${API_BASE}/public/content`);
        const data = await res.json();
        if (data.success) {
            publicContentState = data;
            renderPublicAds(data.advertisements || []);
            renderPublicTools(data.tools || []);
            renderPublicNoticeTicker(data.advertisements || [], data.notices || []);
        }
    } catch (e) {
        console.warn('Public content API load notice:', e);
        // Fallback default sample public tools
        renderPublicTools([]);
    }
}

// Render Public & Dashboard 6 Distinct Advertisement Slots
function renderPublicAds(ads) {
    if (!ads) return;

    // Helper to find by slot_number or fallback type
    const getSlot = (slotNum, typeFallback) => {
        return ads.find(a => a.slot_number === slotNum) || ads.find(a => a.type === typeFallback);
    };

    // -------------------------------------------------------------
    // SLOT 1 — Image Advertisement
    // -------------------------------------------------------------
    const slot1 = getSlot(1, 'image_ad') || ads.find(a => a.type === 'hero_banner' || a.type === 'banner');
    const slot1Container = document.getElementById('adSlot1ImageContainer');
    if (slot1Container) {
        if (slot1 && slot1.status === 'active') {
            slot1Container.classList.remove('hidden');
            const title = document.getElementById('adSlot1Title');
            const desc = document.getElementById('adSlot1Desc');
            const btn = document.getElementById('adSlot1Btn');
            const btnText = document.getElementById('adSlot1BtnText');
            const badge = document.getElementById('adSlot1Badge');

            if (title) title.innerText = slot1.title || 'Official Citizen Service';
            if (desc) desc.innerText = slot1.description || '';
            if (btn) btn.href = slot1.target_url || 'tel:+919078765653';
            if (btnText) btnText.innerText = slot1.button_text || 'Call Helpdesk';
            if (badge) badge.innerHTML = `<span>📢</span><span>${escapeHtml(slot1.badge_text ? slot1.badge_text.toUpperCase() : 'VERIFIED SERVICE')}</span>`;
        } else {
            slot1Container.classList.add('hidden');
        }
    }

    // -------------------------------------------------------------
    // SLOT 2 — Video Advertisement
    // -------------------------------------------------------------
    const slot2 = getSlot(2, 'video_ad') || ads.find(a => a.type === 'video');
    const slot2Container = document.getElementById('adSlot2VideoContainer');
    if (slot2Container) {
        if (slot2 && slot2.status === 'active') {
            slot2Container.classList.remove('hidden');
            const title = document.getElementById('adSlot2Title');
            const desc = document.getElementById('adSlot2Desc');
            const iframe = document.getElementById('adSlot2Iframe');
            const btn = document.getElementById('adSlot2Btn');
            const btnText = document.getElementById('adSlot2BtnText');
            const badge = document.getElementById('adSlot2Badge');

            if (title) title.innerText = slot2.title || 'Official Video Guide';
            if (desc) desc.innerText = slot2.description || '';
            if (iframe && slot2.video_url) {
                let vUrl = slot2.video_url;
                if (vUrl.includes('watch?v=')) vUrl = vUrl.replace('watch?v=', 'embed/');
                if (vUrl.includes('youtu.be/')) vUrl = vUrl.replace('youtu.be/', 'www.youtube.com/embed/');
                iframe.src = vUrl;
            }
            if (btn) btn.href = slot2.target_url || 'https://wa.me/919078765653';
            if (btnText) btnText.innerText = slot2.button_text || 'Chat on WhatsApp';
            if (badge) badge.innerHTML = `<span>🎥</span><span>${escapeHtml(slot2.badge_text ? slot2.badge_text.toUpperCase() : 'VIDEO ADVERTISEMENT')}</span>`;
        } else {
            slot2Container.classList.add('hidden');
        }
    }

    // -------------------------------------------------------------
    // SLOT 3 — Scrolling Advertisement (Marquee Ticker)
    // -------------------------------------------------------------
    const slot3 = getSlot(3, 'scrolling_ad') || ads.find(a => a.type === 'ticker');
    const slot3Container = document.getElementById('adSlot3ScrollingContainer');
    if (slot3Container) {
        if (slot3 && slot3.status === 'active') {
            slot3Container.classList.remove('hidden');
            const ticker = document.getElementById('adSlot3TickerText');
            const btn = document.getElementById('adSlot3ActionBtn');
            const badge = document.getElementById('adSlot3Badge');

            if (ticker) {
                ticker.innerText = slot3.scrolling_text || slot3.title;
                ticker.dataset.url = slot3.target_url || '';
            }
            if (btn) {
                btn.href = slot3.target_url || 'tel:+919078765653';
                btn.innerHTML = `<span>${escapeHtml(slot3.button_text || 'Contact Desk')} 📞</span>`;
            }
            if (badge) badge.innerHTML = `<span>⚡</span><span>${escapeHtml(slot3.badge_text ? slot3.badge_text.toUpperCase() : 'LIVE ANNOUNCEMENT')}</span>`;
        } else {
            slot3Container.classList.add('hidden');
        }
    }

    // -------------------------------------------------------------
    // SLOT 4 — Promotional Banner
    // -------------------------------------------------------------
    const slot4 = getSlot(4, 'promo_banner') || ads.find(a => a.type === 'banner' && a.id !== slot1?.id);
    const slot4Container = document.getElementById('adSlot4BannerContainer');
    if (slot4Container) {
        if (slot4 && slot4.status === 'active') {
            slot4Container.classList.remove('hidden');
            const title = document.getElementById('adSlot4Title');
            const desc = document.getElementById('adSlot4Desc');
            const btn = document.getElementById('adSlot4Btn');
            const btnText = document.getElementById('adSlot4BtnText');
            const badge = document.getElementById('adSlot4Badge');

            if (title) title.innerText = slot4.title;
            if (desc) desc.innerText = slot4.description || '';
            if (btn) btn.href = slot4.target_url || 'passport-photo-maker.html';
            if (btnText) btnText.innerText = slot4.button_text || 'Open Studio';
            if (badge) badge.innerHTML = `<span>📸</span><span>${escapeHtml(slot4.badge_text ? slot4.badge_text.toUpperCase() : 'SPECIAL OFFER')}</span>`;
        } else {
            slot4Container.classList.add('hidden');
        }
    }

    // -------------------------------------------------------------
    // SLOT 5 — Important Announcement / Notice
    // -------------------------------------------------------------
    const slot5 = getSlot(5, 'announcement');
    const slot5Container = document.getElementById('adSlot5AnnouncementContainer');
    if (slot5Container) {
        if (slot5 && slot5.status === 'active') {
            slot5Container.classList.remove('hidden');
            const title = document.getElementById('adSlot5Title');
            const desc = document.getElementById('adSlot5Desc');
            const btn = document.getElementById('adSlot5Btn');
            const btnText = document.getElementById('adSlot5BtnText');
            const badge = document.getElementById('adSlot5Badge');

            if (title) title.innerText = slot5.title;
            if (desc) desc.innerText = slot5.description || '';
            if (btn) btn.href = slot5.target_url || 'tel:+919078765653';
            if (btnText) btnText.innerText = slot5.button_text || 'Contact Administrator';
            if (badge) badge.innerHTML = `<span>📢</span><span>${escapeHtml(slot5.badge_text ? slot5.badge_text.toUpperCase() : 'PORTAL ANNOUNCEMENT')}</span>`;
        } else {
            slot5Container.classList.add('hidden');
        }
    }

    // -------------------------------------------------------------
    // SLOT 6 — Featured Promotion / Campaign
    // -------------------------------------------------------------
    const slot6 = getSlot(6, 'featured_promo');
    const slot6Container = document.getElementById('adSlot6FeaturedContainer');
    if (slot6Container) {
        if (slot6 && slot6.status === 'active') {
            slot6Container.classList.remove('hidden');
            const title = document.getElementById('adSlot6Title');
            const desc = document.getElementById('adSlot6Desc');
            const btn = document.getElementById('adSlot6Btn');
            const btnText = document.getElementById('adSlot6BtnText');
            const badge = document.getElementById('adSlot6Badge');

            if (title) title.innerText = slot6.title;
            if (desc) desc.innerText = slot6.description || '';
            if (btn) btn.href = slot6.target_url || 'https://wa.me/919078765653';
            if (btnText) btnText.innerText = slot6.button_text || 'Enquire Availability';
            if (badge) badge.innerHTML = `<span>🌟</span><span>${escapeHtml(slot6.badge_text ? slot6.badge_text.toUpperCase() : 'FEATURED CAMPAIGN')}</span>`;
        } else {
            slot6Container.classList.add('hidden');
        }
    }
}

// Handler for direct click on slot
window.handleAdSlotClick = function(slotNum) {
    if (slotNum === 3) {
        const ticker = document.getElementById('adSlot3TickerText');
        const url = ticker ? ticker.dataset.url : '';
        if (url) {
            if (url.startsWith('tel:') || url.startsWith('mailto:')) {
                window.location.href = url;
            } else {
                window.open(url, '_blank');
            }
        }
    }
};

// Render Top Notice Marquee Fallback
function renderPublicNoticeTicker(ads, notices) {
    // Handled seamlessly via Slot 3 in renderPublicAds
}

// Render Public PDF & Image Tools
function renderPublicTools(tools) {
    const pdfGrid = document.getElementById('publicPdfToolsGrid');
    const imgGrid = document.getElementById('publicImageToolsGrid');

    // Default 15 PDF tools if API empty
    const pdfToolsList = (tools && tools.filter(t => t.category === 'pdf').length > 0)
        ? tools.filter(t => t.category === 'pdf')
        : [
            { id: 'pdf_merge', title: 'Merge PDF', icon: '📑', description: 'Combine multiple PDF files into one clean document.' },
            { id: 'pdf_split', title: 'Split PDF', icon: '✂️', description: 'Extract specific pages or page ranges from a PDF.' },
            { id: 'pdf_compress', title: 'Compress PDF', icon: '🗜️', description: 'Reduce PDF file size for government portal uploads.' },
            { id: 'pdf_to_jpg', title: 'PDF to JPG', icon: '🖼️', description: 'Convert every PDF page into high resolution JPGs.' },
            { id: 'pdf_to_png', title: 'PDF to PNG', icon: '🎨', description: 'Convert PDF pages into crisp, transparent PNGs.' },
            { id: 'pdf_watermark', title: 'Add Watermark', icon: '💧', description: 'Apply custom official watermark text to PDF pages.' },
            { id: 'pdf_page_number', title: 'Page Numbers', icon: '🔢', description: 'Add clean official page numbering to multi-page PDFs.' },
            { id: 'pdf_rotate', title: 'Rotate PDF', icon: '🔄', description: 'Rotate upside-down scanned pages 90° or 180°.' },
            { id: 'pdf_protect', title: 'Protect PDF', icon: '🔒', description: 'Add password encryption to secure confidential PDFs.' },
            { id: 'pdf_unlock', title: 'Unlock PDF', icon: '🔓', description: 'Remove password from e-Aadhaar and bank statements.' },
            { id: 'pdf_grayscale', title: 'Grayscale / B&W', icon: '⚫', description: 'Convert colored PDF to crisp monochrome Xerox B/W.' },
            { id: 'pdf_reorder', title: 'Organize / Reorder', icon: '🔀', description: 'Drag, drop, and rearrange pages in custom order.' },
            { id: 'pdf_extract_pages', title: 'Extract Pages', icon: '📤', description: 'Extract only selected pages into a fresh PDF.' },
            { id: 'pdf_border', title: 'PDF Page Border', icon: '🖼️', description: 'Add 50 professional Color & B/W borders to PDFs.' },
            { id: 'pdf_scanner_crop', title: 'Document Scanner', icon: '📷', description: 'Scan, auto-crop, and enhance documents (PDF/JPG).' }
        ];

    // Default 35 Image tools if API empty
    const imgToolsList = (tools && tools.filter(t => t.category !== 'pdf').length > 0)
        ? tools.filter(t => t.category !== 'pdf')
        : [
            { id: 'img_compress', title: 'Compress Image', icon: '🗜️', description: 'Reduce JPG/PNG size with live percentage preview.' },
            { id: 'img_compress_20k', title: 'Compress < 20KB', icon: '🎯', description: 'Strict under 20KB compression for signatures & photos.' },
            { id: 'img_compress_50k', title: 'Compress < 50KB', icon: '📐', description: 'Under 50KB compression for SSC/OPSC/UPSC uploads.' },
            { id: 'img_compress_100k', title: 'Compress < 100KB', icon: '📦', description: 'Under 100KB compression for certificate uploads.' },
            { id: 'passport_photo', title: 'Passport Studio', icon: '📸', description: 'Official Indian 35×45mm passport photo sheet maker.' },
            { id: 'sig_clean_bg', title: 'Clean Signature BG', icon: '✍️', description: 'Make mobile signature background pure transparent.' },
            { id: 'sig_resize', title: 'Signature Resizer', icon: '📏', description: 'Resize signature to 140×60px or custom govt aspect.' },
            { id: 'sig_color_enhance', title: 'Darken Signature', icon: '✒️', description: 'Enhance faded ballpoint or gel pen signatures.' },
            { id: 'img_resize_px', title: 'Resize in Pixels', icon: '↔️', description: 'Scale image to exact width × height dimensions.' },
            { id: 'img_crop', title: 'Crop Image', icon: '✂️', description: 'Interactive rectangular crop with grid guides.' },
            { id: 'img_to_pdf', title: 'Image to PDF', icon: '📑', description: 'Combine multiple photos into single high-res PDF.' },
            { id: 'jpg_to_png', title: 'JPG to PNG', icon: '🔄', description: 'Convert JPG photos to lossless transparent PNG.' },
            { id: 'png_to_jpg', title: 'PNG to JPG', icon: '🔄', description: 'Convert PNG graphics into web-ready JPG format.' },
            { id: 'img_color_bw', title: 'Convert to B&W', icon: '🌓', description: 'Convert color photos into high-contrast B/W.' },
            { id: 'qr_upi_make', title: 'UPI Payment QR', icon: '📱', description: 'Generate printable QR for GPay, PhonePe, Paytm.' },
            { id: 'barcode_make', title: 'Barcode Generator', icon: '🏷️', description: 'Create Code-128 and EAN barcodes for center stock.' },
            { id: 'ocr_text_extract', title: 'OCR Extract Text', icon: '👁️', description: 'Extract editable text from scanned bills & docs.' },
            { id: 'img_remove_bg', title: 'Remove Background', icon: '✨', description: 'Isolate subject and replace with pure white.' }
        ];

    if (pdfGrid) {
        pdfGrid.innerHTML = '';
        pdfToolsList.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'bg-slate-50 hover:bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group';
            card.innerHTML = `
                <div>
                    <div class="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition">
                        ${tool.icon || '📄'}
                    </div>
                    <h4 class="text-xs font-black text-slate-900 mb-1 leading-tight">${escapeHtml(tool.title || tool.name)}</h4>
                    <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">${escapeHtml(tool.description || '')}</p>
                </div>
                <a href="tools.html?tool=${tool.id}" class="w-full bg-white hover:bg-blue-700 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-700 font-bold py-1.5 px-3 rounded-xl text-[11px] transition text-center shadow-sm">
                    Open Tool →
                </a>
            `;
            pdfGrid.appendChild(card);
        });
    }

    if (imgGrid) {
        imgGrid.innerHTML = '';
        imgToolsList.forEach(tool => {
            const isPassport = tool.id === 'passport_photo';
            const targetUrl = isPassport ? 'passport-photo-maker.html' : `tools.html?tool=${tool.id}`;
            const card = document.createElement('div');
            card.className = 'bg-slate-50 hover:bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group';
            card.innerHTML = `
                <div>
                    <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition">
                        ${tool.icon || '🖼️'}
                    </div>
                    <h4 class="text-xs font-black text-slate-900 mb-1 leading-tight">${escapeHtml(tool.title || tool.name)}</h4>
                    <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">${escapeHtml(tool.description || '')}</p>
                </div>
                <a href="${targetUrl}" class="w-full bg-white hover:bg-amber-600 text-slate-700 hover:text-white border border-slate-200 hover:border-amber-600 font-bold py-1.5 px-3 rounded-xl text-[11px] transition text-center shadow-sm">
                    Open Tool →
                </a>
            `;
            imgGrid.appendChild(card);
        });
    }
}

// -------------------------------------------------------------------------
// PANEL 2: MEMBER PORTAL LOADER (LOGIN REQUIRED)
// Evaluates 6 Categories with Strict Server-Side RBAC
// -------------------------------------------------------------------------
async function loadMemberPortal() {
    const token = getAuthToken();
    if (!token) {
        await loadPublicPanel();
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/member/services`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401 || res.status === 403) {
            handleLogout(false);
            showSiteToast('Session expired or unauthorized. Please log in again.', 'error');
            await loadPublicPanel();
            return;
        }

        const data = await res.json();
        if (data.success) {
            memberPortalState = data;
            const publicView = document.getElementById('publicPanelView');
            const memberView = document.getElementById('memberPanelView');
            if (publicView) publicView.classList.add('hidden');
            if (memberView) memberView.classList.remove('hidden');

            renderMemberProfileHeader(data.user);
            updateMemberCategoryBadges(data.categories_status);
            
            // Switch to Overview by default on login
            switchMemberCategory('overview');
        } else {
            handleLogout(false);
            await loadPublicPanel();
        }
    } catch (err) {
        console.error('Member portal load failure:', err);
        showSiteToast('Server connection error. Ensure server.ps1 is running.', 'error');
    }
}

// Render Member Profile Header
function renderMemberProfileHeader(user) {
    if (!user) return;
    const nameEl = document.getElementById('memberWelcomeName');
    const roleEl = document.getElementById('memberRoleBadge');
    const centerEl = document.getElementById('memberCenterBadge');
    const avatarEl = document.getElementById('memberAvatarBadge');
    const adminBtnEl = document.getElementById('memberAdminCmsBtn');

    if (nameEl) nameEl.innerText = user.name || user.username || 'Authorized Member';
    if (roleEl) {
        if (user.role === 'admin') {
            roleEl.innerText = '👑 Master Admin';
            roleEl.className = 'bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider';
        } else {
            roleEl.innerText = '👤 CSC Authorized Member';
            roleEl.className = 'bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider';
        }
    }
    if (centerEl) centerEl.innerText = user.center_id || 'CTR-PIPILI-01';
    if (avatarEl) {
        avatarEl.innerText = (user.name ? user.name[0].toUpperCase() : 'M');
    }
    if (adminBtnEl) {
        if (user.role === 'admin') {
            adminBtnEl.classList.remove('hidden');
        } else {
            adminBtnEl.classList.add('hidden');
        }
    }
}

// Update Category Tabs Status & Lock Badges
function updateMemberCategoryBadges(categoriesStatus) {
    if (!categoriesStatus) return;

    categoriesStatus.forEach(cat => {
        const catKey = (cat.id === 'yojana' || cat.id === 'schemes') ? 'Schemes' : (cat.id === 'pdf_tools' ? 'Pdf_tools' : (cat.id === 'image_tools' ? 'Image_tools' : capitalize(cat.id)));
        const countSpan = document.getElementById(`countMember${catKey}`);
        const lockSpan = document.getElementById(`lockBadge${catKey}`);
        const btn = document.getElementById(`tabMember${catKey}`);
        const overviewBadge = document.getElementById(`overviewBadge${catKey}`);

        if (countSpan && cat.count !== undefined) countSpan.innerText = cat.count;
        if (lockSpan) {
            lockSpan.innerText = cat.permitted ? '✓' : '🔒';
            lockSpan.className = cat.permitted ? 'text-[10px] text-emerald-300 font-bold ml-1' : 'text-[10px] text-rose-300 font-bold ml-1';
        }
        if (btn && !cat.permitted) {
            btn.title = `Access Restricted: ${cat.name} is disabled for your account.`;
        }
        if (overviewBadge) {
            overviewBadge.innerText = cat.permitted ? 'Active' : 'Locked 🔒';
            overviewBadge.className = cat.permitted
                ? 'bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full'
                : 'bg-rose-100 text-rose-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full';
        }
    });
}

// Switch Category in Member Portal
window.switchMemberCategory = function(catId) {
    currentActiveMemberCategory = catId;
    memberSearchFilter = '';
    const searchInput = document.getElementById('memberSearchInput');
    if (searchInput) searchInput.value = '';

    // Normalize category id for buttons & tabs
    const tabKey = (catId === 'yojana' || catId === 'schemes') ? 'Schemes' : (catId === 'pdf_tools' ? 'Pdf_tools' : (catId === 'image_tools' ? 'Image_tools' : capitalize(catId)));

    // Update Tab Styles
    document.querySelectorAll('.member-cat-btn').forEach(btn => {
        btn.classList.remove('bg-blue-700', 'text-white', 'shadow', 'border-blue-600');
        btn.classList.add('bg-white/10', 'text-slate-200', 'border-white/10');
    });
    const activeBtn = document.getElementById(`tabMember${tabKey}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-white/10', 'text-slate-200', 'border-white/10');
        activeBtn.classList.add('bg-blue-700', 'text-white', 'shadow', 'border-blue-600');
    }

    if (!memberPortalState) return;

    const overviewArea = document.getElementById('memberOverviewArea');
    const searchBar = document.getElementById('memberSearchAndCountBar');
    const permittedArea = document.getElementById('memberPermittedContentArea');
    const pdfToolsArea = document.getElementById('memberPdfToolsArea');
    const imgToolsArea = document.getElementById('memberImageToolsArea');
    const profileArea = document.getElementById('memberProfileArea');
    const restrictedCard = document.getElementById('memberRestrictedCard');

    // Hide all sub-sections initially
    if (overviewArea) overviewArea.classList.add('hidden');
    if (searchBar) searchBar.classList.add('hidden');
    if (permittedArea) permittedArea.classList.add('hidden');
    if (pdfToolsArea) pdfToolsArea.classList.add('hidden');
    if (imgToolsArea) imgToolsArea.classList.add('hidden');
    if (profileArea) profileArea.classList.add('hidden');
    if (restrictedCard) restrictedCard.classList.add('hidden');

    // 1. OVERVIEW
    if (catId === 'overview') {
        if (overviewArea) overviewArea.classList.remove('hidden');
        return;
    }

    // Helper for restriction message
    const showRestricted = (title, desc) => {
        if (restrictedCard) {
            restrictedCard.classList.remove('hidden');
            const titleEl = document.getElementById('restrictedCategoryTitle');
            const descEl = document.getElementById('restrictedCategoryDesc');
            if (titleEl) titleEl.innerText = title;
            if (descEl) descEl.innerText = desc;
        }
    };

    // 2. PDF TOOLS (RBAC Checked)
    if (catId === 'pdf_tools') {
        const catStatus = (memberPortalState.categories_status || []).find(c => c.id === 'pdf_tools');
        const isPermitted = (memberPortalState.user?.role === 'admin') || (catStatus ? catStatus.permitted : true);
        if (!isPermitted) {
            showRestricted('Access Restricted: PDF Tools', 'The PDF Tools module is currently locked for your Member clearance. Please contact Master Administrator SAKIL ALAM (+91 9078765653) to unlock access.');
            return;
        }
        if (pdfToolsArea) pdfToolsArea.classList.remove('hidden');
        renderMemberPdfTools();
        return;
    }

    // 3. IMAGE TOOLS (RBAC Checked)
    if (catId === 'image_tools') {
        const catStatus = (memberPortalState.categories_status || []).find(c => c.id === 'image_tools');
        const isPermitted = (memberPortalState.user?.role === 'admin') || (catStatus ? catStatus.permitted : true);
        if (!isPermitted) {
            showRestricted('Access Restricted: Image Tools', 'The Image Tools module is currently locked for your Member clearance. Please contact Master Administrator SAKIL ALAM (+91 9078765653) to unlock access.');
            return;
        }
        if (imgToolsArea) imgToolsArea.classList.remove('hidden');
        renderMemberImageTools();
        return;
    }

    // 4. MY PROFILE
    if (catId === 'profile') {
        if (profileArea) profileArea.classList.remove('hidden');
        renderMemberProfileView();
        return;
    }

    // 5. PERMISSION-CONTROLLED CATEGORIES (schemes, ticket, printing, forms, videos, government)
    const normalizedCatId = (catId === 'yojana') ? 'schemes' : catId;
    const catStatus = (memberPortalState.categories_status || []).find(c => c.id === normalizedCatId || (normalizedCatId === 'schemes' && c.id === 'yojana'));
    const isPermitted = catStatus ? catStatus.permitted : false;

    if (!isPermitted) {
        if (restrictedCard) {
            restrictedCard.classList.remove('hidden');
            const titleEl = document.getElementById('restrictedCategoryTitle');
            const descEl = document.getElementById('restrictedCategoryDesc');
            const catDisplayName = catStatus ? catStatus.name : (catId === 'schemes' ? 'Odisha Schemes' : catId);
            if (titleEl) titleEl.innerText = `Access Restricted: ${catDisplayName}`;
            if (descEl) descEl.innerText = `The category "${catDisplayName}" is currently not assigned to your Member clearance. Please contact Master Administrator SAKIL ALAM (+91 9078765653) to grant permissions.`;
        }
        return;
    }

    if (searchBar) searchBar.classList.remove('hidden');
    if (permittedArea) permittedArea.classList.remove('hidden');

    renderActiveCategoryItems();
};

// Render Member PDF Tools (15 Tools)
function renderMemberPdfTools() {
    const grid = document.getElementById('memberPdfToolsGrid');
    if (!grid) return;

    const pdfTools = [
        { id: 'pdf_merge', title: 'Merge PDF', icon: '📑', desc: 'Combine multiple PDF files into one clean document.' },
        { id: 'pdf_split', title: 'Split PDF', icon: '✂️', desc: 'Extract specific pages or page ranges from a PDF.' },
        { id: 'pdf_compress', title: 'Compress PDF', icon: '🗜️', desc: 'Reduce PDF file size for government portal uploads.' },
        { id: 'pdf_to_jpg', title: 'PDF to JPG', icon: '🖼️', desc: 'Convert every PDF page into high resolution JPGs.' },
        { id: 'pdf_to_png', title: 'PDF to PNG', icon: '🎨', desc: 'Convert PDF pages into crisp, transparent PNGs.' },
        { id: 'pdf_watermark', title: 'Add Watermark', icon: '💧', desc: 'Apply custom official watermark text to PDF pages.' },
        { id: 'pdf_page_number', title: 'Page Numbers', icon: '🔢', desc: 'Add clean official page numbering to multi-page PDFs.' },
        { id: 'pdf_rotate', title: 'Rotate PDF', icon: '🔄', desc: 'Rotate upside-down scanned pages 90° or 180°.' },
        { id: 'pdf_protect', title: 'Protect PDF', icon: '🔒', desc: 'Add password encryption to secure confidential PDFs.' },
        { id: 'pdf_unlock', title: 'Unlock PDF', icon: '🔓', desc: 'Remove password from e-Aadhaar and bank statements.' },
        { id: 'pdf_grayscale', title: 'Grayscale / B&W', icon: '⚫', desc: 'Convert colored PDF to crisp monochrome Xerox B/W.' },
        { id: 'pdf_reorder', title: 'Organize / Reorder', icon: '🔀', desc: 'Drag, drop, and rearrange pages in custom order.' },
        { id: 'pdf_extract_pages', title: 'Extract Pages', icon: '📤', desc: 'Extract only selected pages into a fresh PDF.' },
        { id: 'pdf_border', title: 'PDF Page Border', icon: '🖼️', desc: 'Add 50 professional Color & B/W borders to PDFs.' },
        { id: 'pdf_scanner_crop', title: 'Document Scanner', icon: '📷', desc: 'Scan, auto-crop, and enhance documents (PDF/JPG).' }
    ];

    grid.innerHTML = pdfTools.map(tool => `
        <div class="bg-slate-50 hover:bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
            <div>
                <div class="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition">
                    ${tool.icon}
                </div>
                <h4 class="text-xs font-black text-slate-900 mb-1 leading-tight">${escapeHtml(tool.title)}</h4>
                <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">${escapeHtml(tool.desc)}</p>
            </div>
            <a href="tools.html?tool=${tool.id}" class="w-full bg-white hover:bg-blue-700 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-700 font-bold py-1.5 px-3 rounded-xl text-[11px] transition text-center shadow-sm">
                Open Tool →
            </a>
        </div>
    `).join('');
}

// Render Member Image Tools (35 Tools)
function renderMemberImageTools() {
    const grid = document.getElementById('memberImageToolsGrid');
    if (!grid) return;

    const imgTools = [
        { id: 'img_compress', title: 'Compress Image', icon: '🗜️', desc: 'Reduce JPG/PNG size with live percentage preview.' },
        { id: 'img_compress_20k', title: 'Compress < 20KB', icon: '🎯', desc: 'Strict under 20KB compression for signatures & photos.' },
        { id: 'img_compress_50k', title: 'Compress < 50KB', icon: '📐', desc: 'Under 50KB compression for SSC/OPSC/UPSC uploads.' },
        { id: 'img_compress_100k', title: 'Compress < 100KB', icon: '📦', desc: 'Under 100KB compression for certificate uploads.' },
        { id: 'passport_photo', title: 'Passport Studio', icon: '📸', desc: 'Official Indian 35×45mm passport photo sheet maker.' },
        { id: 'sig_clean_bg', title: 'Clean Signature BG', icon: '✍️', desc: 'Make mobile signature background pure transparent.' },
        { id: 'sig_resize', title: 'Signature Resizer', icon: '📏', desc: 'Resize signature to 140×60px or custom govt aspect.' },
        { id: 'sig_color_enhance', title: 'Darken Signature', icon: '✒️', desc: 'Enhance faded ballpoint or gel pen signatures.' },
        { id: 'img_resize_px', title: 'Resize in Pixels', icon: '↔️', desc: 'Scale image to exact width × height dimensions.' },
        { id: 'img_crop', title: 'Crop Image', icon: '✂️', desc: 'Interactive rectangular crop with grid guides.' },
        { id: 'img_to_pdf', title: 'Image to PDF', icon: '📑', desc: 'Combine multiple photos into single high-res PDF.' },
        { id: 'jpg_to_png', title: 'JPG to PNG', icon: '🔄', desc: 'Convert JPG photos to lossless transparent PNG.' },
        { id: 'png_to_jpg', title: 'PNG to JPG', icon: '🔄', desc: 'Convert PNG graphics into web-ready JPG format.' },
        { id: 'img_color_bw', title: 'Convert to B&W', icon: '🌓', desc: 'Convert color photos into high-contrast B/W.' },
        { id: 'qr_upi_make', title: 'UPI Payment QR', icon: '📱', desc: 'Generate printable QR for GPay, PhonePe, Paytm.' },
        { id: 'barcode_make', title: 'Barcode Generator', icon: '🏷️', desc: 'Create Code-128 and EAN barcodes for center stock.' },
        { id: 'ocr_text_extract', title: 'OCR Extract Text', icon: '👁️', desc: 'Extract editable text from scanned bills & docs.' },
        { id: 'img_remove_bg', title: 'Remove Background', icon: '✨', desc: 'Isolate subject and replace with pure white.' },
        { id: 'img_rotate_flip', title: 'Rotate & Flip Image', icon: '🔄', desc: 'Rotate photos 90/180/270 degrees or flip horizontally.' },
        { id: 'img_dpi', title: 'DPI Converter (300 DPI)', icon: '🖨️', desc: 'Convert photos to exact 300 DPI or 200 DPI for print.' },
        { id: 'thumb_enhance', title: 'Thumb Impression Cleaner', icon: '👍', desc: 'Enhance and isolate biometric thumb impressions.' },
        { id: 'id_joiner', title: 'ID Card Joiner (Front + Back)', icon: '💳', desc: 'Join front and back sides of Aadhaar / Voter on 1 page.' },
        { id: 'jpg_to_pdf', title: 'JPG to PDF Direct', icon: '📄', desc: 'Convert individual JPG pictures into PDF documents.' },
        { id: 'png_to_pdf', title: 'PNG to PDF Direct', icon: '📑', desc: 'Convert transparent PNG images to standard PDF.' },
        { id: 'text_to_pdf', title: 'Text to PDF Converter', icon: '📝', desc: 'Create formatted PDF documents directly from text.' },
        { id: 'img_to_base64', title: 'Image to Base64', icon: '🔢', desc: 'Encode images to Base64 data strings for web developers.' },
        { id: 'doc_scanner', title: 'Document Scanner Web', icon: '📷', desc: 'Scan bills and identity proofs using computer webcam.' },
        { id: 'passport_quick', title: 'Quick Passport 8-in-1', icon: '🖼️', desc: 'Generate rapid 8 passport photo layout in 1 click.' },
        { id: 'img_invert', title: 'Invert Image Colors', icon: '🔄', desc: 'Invert colors for negative scanner film proofs.' },
        { id: 'img_brightness_contrast', title: 'Brightness & Contrast', icon: '☀️', desc: 'Adjust exposure, brightness, and contrast levels.' },
        { id: 'img_sharpen', title: 'Sharpen Document Image', icon: '🔍', desc: 'Sharpen blurry scanned photos and text documents.' },
        { id: 'img_watermark', title: 'Image Watermark Stamping', icon: '💧', desc: 'Stamp center name or copyright watermark on photos.' },
        { id: 'img_blur_censor', title: 'Blur & Censor Sensitive Info', icon: '🙈', desc: 'Blur out Aadhaar number, phone number, or confidential data.' },
        { id: 'img_border', title: 'Photo Border Stamping', icon: '🖼️', desc: 'Add 1px, 2px, or 5px black/white border to photos.' },
        { id: 'img_filters', title: 'Color Filter Presets', icon: '🎨', desc: 'Apply Sepia, Vintage, and High-Contrast presets.' }
    ];

    grid.innerHTML = imgTools.map(tool => {
        const isPassport = tool.id === 'passport_photo';
        const targetUrl = isPassport ? 'passport-photo-maker.html' : `tools.html?tool=${tool.id}`;
        return `
            <div class="bg-slate-50 hover:bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                <div>
                    <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition">
                        ${tool.icon}
                    </div>
                    <h4 class="text-xs font-black text-slate-900 mb-1 leading-tight">${escapeHtml(tool.title)}</h4>
                    <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">${escapeHtml(tool.desc)}</p>
                </div>
                <a href="${targetUrl}" class="w-full bg-white hover:bg-amber-600 text-slate-700 hover:text-white border border-slate-200 hover:border-amber-600 font-bold py-1.5 px-3 rounded-xl text-[11px] transition text-center shadow-sm">
                    Open Tool →
                </a>
            </div>
        `;
    }).join('');
}

// Render Member Profile View
function renderMemberProfileView() {
    if (!memberPortalState || !memberPortalState.user) return;
    const user = memberPortalState.user;

    const avatarEl = document.getElementById('profileAvatar');
    const nameEl = document.getElementById('profileFullName');
    const usernameEl = document.getElementById('profileUsername');
    const centerEl = document.getElementById('profileCenterId');
    const phoneEl = document.getElementById('profilePhone');
    const roleEl = document.getElementById('profileRole');
    const permsListEl = document.getElementById('profilePermissionsList');

    if (avatarEl) avatarEl.innerText = (user.name ? user.name[0].toUpperCase() : 'M');
    if (nameEl) nameEl.innerText = user.name || user.username || 'CSC Member';
    if (usernameEl) usernameEl.innerText = `Username: @${user.username} • Account ID: #${user.id || user.username}`;
    if (centerEl) centerEl.innerText = user.center_id || 'CTR-PIPILI-01';
    if (phoneEl) phoneEl.innerText = user.phone || '+91 9078765653';
    if (roleEl) roleEl.innerText = user.role === 'admin' ? 'Master Administrator' : 'CSC Authorized Member';

    if (permsListEl && memberPortalState.categories_status) {
        permsListEl.innerHTML = memberPortalState.categories_status.map(cat => `
            <div class="p-3 rounded-xl border flex items-center justify-between ${cat.permitted ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}">
                <div class="flex items-center gap-2">
                    <span class="text-base">${cat.permitted ? '✅' : '🔒'}</span>
                    <div>
                        <div class="text-xs font-black text-slate-900">${escapeHtml(cat.name)}</div>
                        <div class="text-[10px] text-slate-500">${cat.count} items available</div>
                    </div>
                </div>
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${cat.permitted ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'}">
                    ${cat.permitted ? 'Permitted' : 'Locked'}
                </span>
            </div>
        `).join('');
    }
}

// Search Filter Handler in Member Portal
window.handleMemberSearch = function(query) {
    memberSearchFilter = (query || '').toLowerCase().trim();
    renderActiveCategoryItems();
};

// Render Items for Active Category (Services, Forms, Videos)
function renderActiveCategoryItems() {
    const grid = document.getElementById('memberItemsGrid');
    const countText = document.getElementById('memberItemsCountText');
    if (!grid || !memberPortalState) return;
    grid.innerHTML = '';

    const catId = currentActiveMemberCategory;

    // 1. FORMS CATEGORY
    if (catId === 'forms') {
        const allForms = memberPortalState.forms || [];
        const filteredForms = allForms.filter(f => {
            if (!memberSearchFilter) return true;
            return (f.title && f.title.toLowerCase().includes(memberSearchFilter)) ||
                   (f.dept && f.dept.toLowerCase().includes(memberSearchFilter)) ||
                   (f.category && f.category.toLowerCase().includes(memberSearchFilter)) ||
                   (f.description && f.description.toLowerCase().includes(memberSearchFilter));
        });

        if (countText) countText.innerText = `${filteredForms.length} Official Forms Available`;

        if (filteredForms.length === 0) {
            grid.innerHTML = renderEmptyState('forms', memberSearchFilter);
            return;
        }

        filteredForms.forEach(form => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl shadow-sm hover:shadow-md p-6 border border-slate-200 flex flex-col justify-between transition';
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start gap-2 mb-3">
                        <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                            ${escapeHtml(form.category || 'Official Form')}
                        </span>
                        <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            ${escapeHtml(form.pages || '1 Page')}
                        </span>
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">${form.icon || '📄'}</span>
                        <h4 class="text-base font-black text-slate-900 leading-snug">${escapeHtml(form.title)}</h4>
                    </div>
                    <p class="text-xs text-blue-700 font-bold mb-1.5">${escapeHtml(form.dept || 'Government of Odisha / India')}</p>
                    <p class="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">${escapeHtml(form.description || '')}</p>
                    
                    <div class="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 border border-slate-100 space-y-1 mb-4">
                        <div class="flex justify-between"><span class="font-bold">Required Docs:</span> <span class="truncate ml-1">${escapeHtml(form.required_docs || 'Aadhaar, Photos')}</span></div>
                        <div class="flex justify-between"><span class="font-bold">Format:</span> <span>PDF A4 Standard</span></div>
                    </div>
                </div>
                <div class="pt-3 border-t border-slate-100 flex gap-2">
                    <a href="${form.file_url ? `${API_BASE}/download?file=${encodeURIComponent(form.file_url)}&name=${encodeURIComponent(form.title)}` : '#'}" target="_blank" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow">
                        <span>📥</span>
                        <span>Download PDF</span>
                    </a>
                    <button onclick="window.print()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition border border-slate-300" title="Print Form">
                        <span>🖨️</span>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
        return;
    }

    // 2. VIDEOS CATEGORY
    if (catId === 'videos') {
        const allVideos = memberPortalState.videos || [];
        const filteredVideos = allVideos.filter(v => {
            if (!memberSearchFilter) return true;
            return (v.title && v.title.toLowerCase().includes(memberSearchFilter)) ||
                   (v.description && v.description.toLowerCase().includes(memberSearchFilter)) ||
                   (v.category && v.category.toLowerCase().includes(memberSearchFilter));
        });

        if (countText) countText.innerText = `${filteredVideos.length} Operator Videos Available`;

        if (filteredVideos.length === 0) {
            grid.innerHTML = renderEmptyState('videos', memberSearchFilter);
            return;
        }

        filteredVideos.forEach(video => {
            let embedUrl = video.video_url || '';
            if (embedUrl.includes('watch?v=')) {
                embedUrl = embedUrl.replace('watch?v=', 'embed/');
            }
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl shadow-sm hover:shadow-md p-6 border border-slate-200 flex flex-col justify-between transition';
            card.innerHTML = `
                <div>
                    <div class="rounded-xl overflow-hidden aspect-video bg-black border border-slate-200 mb-4 relative shadow-inner">
                        ${embedUrl ? `
                            <iframe src="${embedUrl}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        ` : `
                            <div class="w-full h-full flex items-center justify-center text-white text-xs font-bold">Video Preview</div>
                        `}
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            ${escapeHtml(video.category || 'Tutorial')}
                        </span>
                        <span class="text-xs font-bold text-slate-400">
                            ⏱️ ${escapeHtml(video.duration || '10:00 Mins')}
                        </span>
                    </div>
                    <h4 class="text-base font-black text-slate-900 leading-snug mb-2">${escapeHtml(video.title)}</h4>
                    <p class="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">${escapeHtml(video.description || '')}</p>
                </div>
                <div class="pt-3 border-t border-slate-100">
                    <a href="https://wa.me/919078765653?text=${encodeURIComponent('Hello SAKIL ALAM, I have an operator query about video: ' + video.title)}" target="_blank" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow">
                        <span>💬 Operator Helpline Query</span>
                    </a>
                </div>
            `;
            grid.appendChild(card);
        });
        return;
    }

    // 3. SERVICES CATEGORIES (government, schemes/yojana, ticket, printing)
    const allServices = memberPortalState.services || [];
    const targetCat = (catId === 'yojana') ? 'schemes' : catId;
    const catServices = allServices.filter(s => {
        if (targetCat === 'schemes') {
            return s.category === 'schemes' || s.category === 'yojana';
        }
        return s.category === targetCat;
    });
    const filteredServices = catServices.filter(s => {
        if (!memberSearchFilter) return true;
        return (s.title && s.title.toLowerCase().includes(memberSearchFilter)) ||
               (s.description && s.description.toLowerCase().includes(memberSearchFilter)) ||
               (s.official_portal_name && s.official_portal_name.toLowerCase().includes(memberSearchFilter)) ||
               (s.required_docs && s.required_docs.toLowerCase().includes(memberSearchFilter));
    });

    if (countText) countText.innerText = `${filteredServices.length} Services Permitted & Available`;

    if (filteredServices.length === 0) {
        grid.innerHTML = renderEmptyState(catId, memberSearchFilter);
        return;
    }

    filteredServices.forEach(svc => {
        let catBadge = '';
        if (svc.category === 'government') {
            catBadge = `<span class="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-blue-200">Government Portal</span>`;
        } else if (svc.category === 'schemes' || svc.category === 'yojana') {
            catBadge = `<span class="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-amber-300">Odisha Schemes</span>`;
        } else if (svc.category === 'ticket') {
            catBadge = `<span class="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-purple-200">Ticket & Insurance</span>`;
        } else if (svc.category === 'printing') {
            catBadge = `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200">Printing Studio</span>`;
        }

        let linkHtml = '';
        if (svc.id === 'prt-4') {
            linkHtml = `
                <a href="passport-photo-maker.html" class="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold py-3 px-4 rounded-xl text-center block shadow transition text-xs flex items-center justify-center gap-1.5">
                    <span>📸</span>
                    <span>${escapeHtml(svc.btnText || 'OPEN PASSPORT STUDIO')}</span>
                </a>
            `;
        } else if (!svc.official_url || svc.official_url === '#' || svc.official_url.trim() === '') {
            linkHtml = `
                <div class="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center shadow-inner">
                    Online Link Unavailable – Contact AMAAN CSC
                </div>
            `;
        } else {
            linkHtml = `
                <a href="${svc.official_url}" target="_blank" rel="noopener noreferrer" class="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-3 px-4 rounded-xl text-center block shadow transition text-xs flex items-center justify-center gap-2">
                    <span>${escapeHtml(svc.btnText || 'APPLY NOW')}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
            `;
        }

        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl shadow-sm hover:shadow-md p-6 border border-slate-200 flex flex-col justify-between transition';
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start gap-2 mb-3">
                    ${catBadge}
                    <span class="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        ${svc.icon || '🏛️'}
                    </span>
                </div>

                <h3 class="text-lg font-black text-slate-900 mb-2 leading-snug">${escapeHtml(svc.title)}</h3>
                <p class="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed" title="${escapeHtml(svc.description)}">${escapeHtml(svc.description)}</p>
                
                <div class="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs text-slate-700 border border-slate-100 mb-4">
                    <div class="flex items-start justify-between">
                        <span class="font-bold text-slate-800 shrink-0">Official Portal:</span>
                        <span class="text-blue-700 font-semibold truncate ml-2 text-right">${escapeHtml(svc.official_portal_name || 'Official Gateway')}</span>
                    </div>
                    <div class="flex items-start justify-between">
                        <span class="font-bold text-slate-800 shrink-0">Required Docs:</span>
                        <span class="text-slate-600 truncate ml-2 text-right">${escapeHtml(svc.required_docs || 'Aadhaar Card')}</span>
                    </div>
                    <div class="flex items-start justify-between">
                        <span class="font-bold text-slate-800 shrink-0">Charges:</span>
                        <span class="font-black text-emerald-700 ml-2">${escapeHtml(svc.service_charge || 'Govt Fee + CSC Fee')}</span>
                    </div>
                    <div class="flex items-start justify-between">
                        <span class="font-bold text-slate-800 shrink-0">Timeline:</span>
                        <span class="text-amber-700 font-bold ml-2">${escapeHtml(svc.processing_info || 'Instant Online')}</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 border-t border-slate-100 pt-4 space-y-2.5">
                ${linkHtml}
                <div class="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <a href="tel:+919078765653" class="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 py-2 rounded-xl flex items-center justify-center gap-1 transition">
                        <span>📞 Call Desk</span>
                    </a>
                    <a href="https://wa.me/919078765653?text=${encodeURIComponent('Hello AMAAN CSC CENTER, please guide me on: ' + svc.title)}" target="_blank" rel="noopener noreferrer" class="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-2 rounded-xl flex items-center justify-center gap-1 transition">
                        <span>Direct WhatsApp</span>
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderEmptyState(category, query) {
    return `
        <div class="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                🔍
            </div>
            <h3 class="text-lg font-black text-slate-900">No items found matching "${escapeHtml(query)}"</h3>
            <p class="text-xs text-slate-500 max-w-md mx-auto">Try typing another keyword or clear the search input to view all permitted items in this category.</p>
            <button onclick="document.getElementById('memberSearchInput').value=''; handleMemberSearch('');" class="bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow hover:bg-blue-800 transition">
                Clear Search Filter
            </button>
        </div>
    `;
}

// -------------------------------------------------------------------------
// AUTHENTICATION & LOGIN/LOGOUT LOGIC
// -------------------------------------------------------------------------
window.handleLoginSubmit = async function() {
    const userField = document.getElementById('authUsername');
    const passField = document.getElementById('authPassword');
    const authErrorMsg = document.getElementById('authErrorMsg');
    const submitBtn = document.getElementById('loginSubmitBtnText');

    const username = (userField ? userField.value : '').trim();
    const password = (passField ? passField.value : '').trim();

    if (!username || !password) {
        if (authErrorMsg) {
            authErrorMsg.innerText = 'Please enter both Username / Mobile and Password / PIN.';
            authErrorMsg.classList.remove('hidden');
        }
        return;
    }

    if (authErrorMsg) authErrorMsg.classList.add('hidden');
    const prevText = submitBtn ? submitBtn.innerText : '';
    if (submitBtn) submitBtn.innerText = 'Verifying Credentials...';

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (data.success && data.token) {
            localStorage.setItem('amaan_auth_token', data.token);
            localStorage.setItem('amaan_csc_user', JSON.stringify(data.user));
            if (data.user && data.user.role === 'admin') {
                localStorage.setItem('amaan_admin_token', data.token);
            }

            closeAuthModal();
            updateAuthUI();
            await loadMemberPortal();
            showSiteToast(`Welcome, ${data.user.name || data.user.username}! Login successful.`, 'success');
        } else {
            if (authErrorMsg) {
                authErrorMsg.innerText = data.error || 'Invalid credentials. Please verify your ID & PIN.';
                authErrorMsg.classList.remove('hidden');
            }
        }
    } catch (e) {
        if (authErrorMsg) {
            authErrorMsg.innerText = 'Server connection failed. Ensure server.ps1 is running.';
            authErrorMsg.classList.remove('hidden');
        }
    } finally {
        if (submitBtn) submitBtn.innerText = prevText;
    }
};

window.handleLogout = function(showNotice = true) {
    const token = getAuthToken();
    if (token) {
        fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {});
    }

    // Securely clear all session tokens & states
    localStorage.removeItem('amaan_auth_token');
    localStorage.removeItem('amaan_admin_token');
    localStorage.removeItem('billing_token');
    localStorage.removeItem('amaan_csc_user');
    try { sessionStorage.clear(); } catch(e) {}
    memberPortalState = null;

    // Prevent access to protected pages using browser Back button after logout
    try {
        window.history.replaceState(null, '', 'index.html');
    } catch(e) {}

    updateAuthUI();
    closeAuthModal();
    loadPublicPanel();

    if (showNotice) {
        showSiteToast('You have been logged out successfully.', 'info');
    }

    // Redirect to Login page / modal with clear confirmation
    setTimeout(() => {
        openAuthModal();
        const errBox = document.getElementById('authErrorMsg');
        if (errBox) {
            errBox.className = 'p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2';
            errBox.innerHTML = '<span class="text-base">✅</span><span>You have been logged out successfully.</span>';
            errBox.classList.remove('hidden');
        }
    }, 200);
};

// Prevent access using browser Back button after logout
window.addEventListener('pageshow', function() {
    const token = getAuthToken();
    const memberView = document.getElementById('memberPanelView');
    if (!token && memberView && !memberView.classList.contains('hidden')) {
        memberView.classList.add('hidden');
        loadPublicPanel();
        openAuthModal();
    }
});
window.addEventListener('popstate', function() {
    const token = getAuthToken();
    const memberView = document.getElementById('memberPanelView');
    if (!token && memberView && !memberView.classList.contains('hidden')) {
        memberView.classList.add('hidden');
        loadPublicPanel();
        openAuthModal();
    }
});

// Update Top Auth Button and Header Logout Button
function updateAuthUI() {
    const user = getSessionUser();
    const authBtnText = document.getElementById('authBtnText');
    const userAuthBtn = document.getElementById('userAuthBtn');
    const globalAdminNavBtn = document.getElementById('globalAdminNavBtn');
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');

    if (user && authBtnText) {
        if (headerLogoutBtn) headerLogoutBtn.classList.remove('hidden');
        if (user.role === 'admin') {
            authBtnText.innerHTML = '<span>👑 SAKIL ALAM (Admin)</span>';
            if (userAuthBtn) {
                userAuthBtn.className = 'bg-amber-500 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition border border-amber-400';
            }
            if (globalAdminNavBtn) globalAdminNavBtn.classList.remove('hidden');
        } else {
            authBtnText.innerHTML = `<span>👤 Member: ${escapeHtml(user.name || user.username)}</span>`;
            if (userAuthBtn) {
                userAuthBtn.className = 'bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition border border-emerald-500';
            }
            // Strictly hide Admin Panel options from logged-in members
            if (globalAdminNavBtn) globalAdminNavBtn.classList.add('hidden');
        }
    } else if (authBtnText) {
        if (headerLogoutBtn) headerLogoutBtn.classList.add('hidden');
        authBtnText.innerHTML = '<span>Login</span>';
        if (userAuthBtn) {
            userAuthBtn.className = 'bg-blue-800/80 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-blue-700 transition flex items-center gap-1.5 shadow';
        }
        if (globalAdminNavBtn) globalAdminNavBtn.classList.remove('hidden');
    }
}

// Quick Demo Login Fillers
window.quickFillCredentials = function(role) {
    const u = document.getElementById('authUsername');
    const p = document.getElementById('authPassword');
    if (role === 'admin') {
        if (u) u.value = 'admin';
        if (p) p.value = '9078';
    } else {
        if (u) u.value = 'member_abc';
        if (p) p.value = '1234';
    }
};

// Helper String Capitalizer & HTML Escaper
function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Auth Modal View Open / Close
window.openAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    const user = getSessionUser();
    const loginView = document.getElementById('loginFormView');
    const profileView = document.getElementById('profileView');

    if (user) {
        if (loginView) loginView.classList.add('hidden');
        if (profileView) {
            profileView.classList.remove('hidden');
            const pName = document.getElementById('profileName');
            const pContact = document.getElementById('profileContact');
            const pRole = document.getElementById('profileRoleBadge');
            if (pName) pName.innerText = user.name || user.username;
            if (pContact) pContact.innerText = user.phone || user.username;
            if (pRole) {
                pRole.innerText = (user.role === 'admin') ? '👑 Master Admin Active' : '👤 CSC Member Active';
            }
        }
    } else {
        if (loginView) loginView.classList.remove('hidden');
        if (profileView) profileView.classList.add('hidden');
    }
    modal.classList.remove('hidden');
};

window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
};

window.showLoginView = function() {
    document.getElementById('loginFormView')?.classList.remove('hidden');
    document.getElementById('signUpView')?.classList.add('hidden');
    document.getElementById('forgotPasswordView')?.classList.add('hidden');
};

window.showSignUpView = function() {
    document.getElementById('loginFormView')?.classList.add('hidden');
    document.getElementById('signUpView')?.classList.remove('hidden');
    document.getElementById('forgotPasswordView')?.classList.add('hidden');
};

window.showForgotPasswordView = function() {
    document.getElementById('loginFormView')?.classList.add('hidden');
    document.getElementById('signUpView')?.classList.add('hidden');
    document.getElementById('forgotPasswordView')?.classList.remove('hidden');
};

window.togglePasswordVisibility = function(inputId, iconId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    const isPass = (el.type === 'password');
    el.type = isPass ? 'text' : 'password';
    if (iconId) {
        const icon = document.getElementById(iconId);
        if (icon) {
            icon.innerText = isPass ? '👁️‍🗨️' : '👁️';
        }
    }
};

window.switchLoginRole = function(role) {
    const adminBtn = document.getElementById('roleAdminBtn');
    const memberBtn = document.getElementById('roleMemberBtn');
    const badgeTitle = document.getElementById('roleBadgeTitle');
    const badgeDesc = document.getElementById('roleBadgeDesc');
    const userInput = document.getElementById('authUsername');
    const submitBtnText = document.getElementById('loginSubmitBtnText');
    const authErrorMsg = document.getElementById('authErrorMsg');

    if (authErrorMsg) authErrorMsg.classList.add('hidden');

    if (role === 'admin') {
        if (adminBtn) adminBtn.className = 'py-2 rounded-lg bg-blue-700 text-white shadow transition flex items-center justify-center gap-1.5';
        if (memberBtn) memberBtn.className = 'py-2 rounded-lg text-slate-700 hover:text-blue-700 transition flex items-center justify-center gap-1.5';
        if (badgeTitle) badgeTitle.innerText = 'Operator / Admin Mode';
        if (badgeDesc) badgeDesc.innerText = 'Master Control: View/activate all members, reset passwords & manage center services.';
        if (userInput) userInput.placeholder = 'e.g. admin or 9078765653';
        if (submitBtnText) submitBtnText.innerText = 'Login as Operator Admin';
    } else {
        if (memberBtn) memberBtn.className = 'py-2 rounded-lg bg-emerald-600 text-white shadow transition flex items-center justify-center gap-1.5';
        if (adminBtn) adminBtn.className = 'py-2 rounded-lg text-slate-700 hover:text-emerald-700 transition flex items-center justify-center gap-1.5';
        if (badgeTitle) badgeTitle.innerText = 'CSC & Mo Seva Member Mode';
        if (badgeDesc) badgeDesc.innerText = 'Member Access: Citizen services, forms, digital photo maker & typing tool.';
        if (userInput) userInput.placeholder = 'e.g. Mobile Number, Email, or CSC ID';
        if (submitBtnText) submitBtnText.innerText = 'Login as CSC Member';
    }
};

window.handleMemberPhotoUpload = async function(event) {
    const file = event.target.files && event.target.files[0];
    const preview = document.getElementById('regPhotoPreview');
    const placeholder = document.getElementById('regPhotoPlaceholder');
    const hiddenInput = document.getElementById('regPhotoUrlHidden');
    const statusText = document.getElementById('regPhotoUploadStatus');
    const errorBox = document.getElementById('signUpErrorMsg');

    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type.toLowerCase())) {
        if (errorBox) {
            errorBox.innerText = 'Please select a valid image file (JPG, PNG, or WebP).';
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        if (errorBox) {
            errorBox.innerText = 'Photo file size exceeds 5 MB. Please select a smaller photo.';
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (errorBox) errorBox.classList.add('hidden');
    if (statusText) {
        statusText.innerText = 'Uploading photo...';
        statusText.className = 'text-[10px] text-blue-600 mt-1 font-medium';
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64Data = e.target.result;
        if (preview) {
            preview.src = base64Data;
            preview.classList.remove('hidden');
        }
        if (placeholder) placeholder.classList.add('hidden');

        try {
            const res = await fetch(`${API_BASE}/public/upload-photo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    fileBase64: base64Data
                })
            });
            const data = await res.json();
            if (data.success && data.photo_url) {
                if (hiddenInput) hiddenInput.value = data.photo_url;
                if (statusText) {
                    statusText.innerText = '✓ Photo uploaded and verified successfully.';
                    statusText.className = 'text-[10px] text-emerald-600 mt-1 font-bold';
                }
            } else {
                if (hiddenInput) hiddenInput.value = base64Data;
                if (statusText) {
                    statusText.innerText = '✓ Photo loaded successfully.';
                    statusText.className = 'text-[10px] text-emerald-600 mt-1 font-bold';
                }
            }
        } catch (err) {
            if (hiddenInput) hiddenInput.value = base64Data;
            if (statusText) {
                statusText.innerText = '✓ Photo loaded locally.';
                statusText.className = 'text-[10px] text-emerald-600 mt-1 font-bold';
            }
        }
    };
    reader.readAsDataURL(file);
};

window.handleSignUpSubmit = async function() {
    const name = (document.getElementById('regName')?.value || '').trim();
    const phone = (document.getElementById('regPhone')?.value || '').trim().replace(/\s+/g, '').replace(/^\+91/, '');
    const address = (document.getElementById('regAddress')?.value || '').trim();
    const email = (document.getElementById('regEmail')?.value || '').trim();
    const photoUrl = (document.getElementById('regPhotoUrlHidden')?.value || '').trim();
    const cscId = (document.getElementById('regCscId')?.value || '').trim();
    const mskId = (document.getElementById('regMskId')?.value || '').trim();
    const password = (document.getElementById('regPassword')?.value || '').trim();
    const confirmPassword = (document.getElementById('regConfirmPassword')?.value || '').trim();

    const errorBox = document.getElementById('signUpErrorMsg');
    const submitBtn = document.getElementById('btnRegisterSubmit');

    function showError(msg) {
        if (errorBox) {
            errorBox.innerText = msg;
            errorBox.classList.remove('hidden');
        }
    }

    if (!name) return showError('Field 1: Full Name is mandatory.');
    if (!phone || phone.length < 10) return showError('Field 2: 10-digit Mobile Number is mandatory.');
    if (!address) return showError('Field 3: Complete Address is mandatory.');
    if (!email || !email.includes('@')) return showError('Field 4: Valid Email ID is mandatory.');
    if (!photoUrl) return showError('Field 5: Passport Size Photo is mandatory. Please upload your photo.');
    // Field 6: CSC ID and Field 7: MSK ID are optional
    if (!password || password.length < 4) return showError('Field 8: Password must be at least 4 characters.');
    if (password !== confirmPassword) return showError('Field 9: Password and Confirm Password do not match.');

    if (errorBox) errorBox.classList.add('hidden');
    const prevText = submitBtn ? submitBtn.innerText : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Creating Member Account...';
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: name,
                mobile: phone,
                address: address,
                email: email,
                photoUrl: photoUrl,
                cscId: cscId,
                mskId: mskId,
                password: password,
                confirmPassword: confirmPassword
            })
        });

        const data = await res.json();
        if (data.success) {
            showSiteToast('🎉 Member Account Registered Successfully! Please Login.', 'success');
            showLoginView();
            switchLoginRole('member');
            const userInput = document.getElementById('authUsername');
            const passInput = document.getElementById('authPassword');
            if (userInput) userInput.value = cscId || phone || email;
            if (passInput) passInput.value = password;
            ['regName', 'regPhone', 'regAddress', 'regEmail', 'regCscId', 'regMskId', 'regPassword', 'regConfirmPassword', 'regPhotoUrlHidden'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const preview = document.getElementById('regPhotoPreview');
            const placeholder = document.getElementById('regPhotoPlaceholder');
            if (preview) preview.classList.add('hidden');
            if (placeholder) placeholder.classList.remove('hidden');
        } else {
            showError(data.error || 'Registration failed. Please check your entries.');
        }
    } catch (err) {
        showError('Network error while contacting registration server. Ensure server.ps1 is running.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = prevText;
        }
    }
};

window.handleForgotPasswordSubmit = async function() {
    const usernameField = document.getElementById('forgotUsername');
    const newPassField = document.getElementById('forgotNewPassword');
    const errorBox = document.getElementById('forgotErrorMsg');

    const identifier = (usernameField ? usernameField.value : '').trim();
    const newPassword = (newPassField ? newPassField.value : '').trim();

    if (!identifier) {
        if (errorBox) {
            errorBox.innerText = 'Please enter your registered Mobile Number, Email, or CSC ID.';
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (!newPassword || newPassword.length < 4) {
        if (errorBox) {
            errorBox.innerText = 'New password must be at least 4 characters long.';
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (errorBox) errorBox.classList.add('hidden');

    try {
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, new_password: newPassword })
        });

        const data = await res.json();
        if (data.success) {
            showSiteToast(data.message || 'Password reset successfully! Please login with your new password.', 'success');
            showLoginView();
            const u = document.getElementById('authUsername');
            const p = document.getElementById('authPassword');
            if (u) u.value = identifier;
            if (p) p.value = newPassword;
            if (usernameField) usernameField.value = '';
            if (newPassField) newPassField.value = '';
        } else {
            if (errorBox) {
                errorBox.innerText = data.error || 'Password reset failed. Please verify your details.';
                errorBox.classList.remove('hidden');
            }
        }
    } catch (err) {
        if (errorBox) {
            errorBox.innerText = 'Network error during password reset. Ensure server.ps1 is running.';
            errorBox.classList.remove('hidden');
        }
    }
};

window.handleGoogleLoginClick = function() {
    showSiteToast('ℹ️ Google OAuth Sign-In is configured for live domains. For local/portal access, please sign in with your CSC ID or Mobile.', 'info');
};

// Theme Management
window.initTheme = function() {
    const theme = localStorage.getItem('theme') || 'light';
    applyTheme(theme);
};

window.toggleTheme = function() {
    const cur = localStorage.getItem('theme') || 'light';
    const next = (cur === 'light') ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    applyTheme(next);
};

function applyTheme(theme) {
    const icon = document.getElementById('themeToggleIcon');
    const text = document.getElementById('themeToggleText');
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        if (icon) icon.innerText = '☀️';
        if (text) text.innerText = 'Light';
    } else {
        document.documentElement.classList.remove('dark');
        if (icon) icon.innerText = '🌙';
        if (text) text.innerText = 'Dark';
    }
}

// Auto-boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.initThreePanelApp();
});
