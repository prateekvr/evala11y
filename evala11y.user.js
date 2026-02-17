// ==UserScript==
// @name         EvalA11y - Website Accessibility Evaluator
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  WCAG 2.1 AA + EAA compliant accessibility evaluation tool
// @author       prateekvr
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        SEVERITY: { CRITICAL: 'critical', MAJOR: 'major', MINOR: 'minor' },
        COLORS: { critical: '#dc2626', major: '#ea580c', minor: '#ca8a04' },
        PANEL_WIDTH: '380px'
    };

    // State management
    const state = {
        issues: [],
        isRunning: false,
        panelVisible: false,
        overlaysVisible: true
    };

    // Initialize the tool
    function init() {
        injectStyles();
        createToggleButton();
    }

    // Inject CSS styles
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'evala11y-styles';
        style.textContent = getStyles();
        document.head.appendChild(style);
    }

    // CSS Styles
    function getStyles() {
        return `
            .evala11y-btn { position: fixed; bottom: 20px; right: 20px; z-index: 999999;
                background: #2563eb; color: white; border: none; padding: 12px 16px;
                border-radius: 8px; cursor: pointer; font-family: system-ui, sans-serif;
                font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .evala11y-btn:hover { background: #1d4ed8; }
            .evala11y-panel { position: fixed; top: 0; right: 0; width: ${CONFIG.PANEL_WIDTH};
                height: 100vh; background: #f8fafc; border-left: 2px solid #e2e8f0;
                z-index: 999998; font-family: system-ui, sans-serif; overflow-y: auto;
                box-shadow: -4px 0 20px rgba(0,0,0,0.1); }
            .evala11y-header { background: #1e293b; color: white; padding: 16px;
                display: flex; justify-content: space-between; align-items: center; }
            .evala11y-header h2 { margin: 0; font-size: 18px; }
            .evala11y-close { background: none; border: none; color: white;
                font-size: 24px; cursor: pointer; }
            .evala11y-stats { display: flex; gap: 8px; padding: 12px; background: #fff;
                border-bottom: 1px solid #e2e8f0; }
            .evala11y-stat { flex: 1; text-align: center; padding: 8px; border-radius: 6px; }
            .evala11y-stat.critical { background: #fef2f2; color: #dc2626; }
            .evala11y-stat.major { background: #fff7ed; color: #ea580c; }
            .evala11y-stat.minor { background: #fefce8; color: #ca8a04; }
            .evala11y-stat-num { font-size: 24px; font-weight: 700; }
            .evala11y-stat-label { font-size: 11px; text-transform: uppercase; }
            .evala11y-actions { padding: 12px; background: #fff; border-bottom: 1px solid #e2e8f0;
                display: flex; gap: 8px; flex-wrap: wrap; }
            .evala11y-action-btn { padding: 8px 12px; border: 1px solid #e2e8f0;
                background: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; }
            .evala11y-action-btn:hover { background: #f1f5f9; }
            .evala11y-group { border-bottom: 1px solid #e2e8f0; }
            .evala11y-group-header { padding: 12px; background: #f1f5f9; cursor: pointer;
                display: flex; justify-content: space-between; font-weight: 600; font-size: 14px; }
            .evala11y-group-header:hover { background: #e2e8f0; }
            .evala11y-issue { padding: 12px; border-bottom: 1px solid #f1f5f9;
                cursor: pointer; font-size: 13px; }
            .evala11y-issue:hover { background: #f8fafc; }
            .evala11y-issue-severity { display: inline-block; width: 8px; height: 8px;
                border-radius: 50%; margin-right: 8px; }
            .evala11y-highlight { outline: 3px solid var(--evala11y-color) !important;
                outline-offset: 2px !important; position: relative !important; }
            .evala11y-badge { position: absolute !important; top: -10px !important;
                left: -10px !important; background: var(--evala11y-color) !important;
                color: white !important; font-size: 10px !important; padding: 2px 6px !important;
                border-radius: 4px !important; z-index: 999997 !important;
                font-family: system-ui, sans-serif !important; }
            .evala11y-tooltip { position: fixed; background: #1e293b; color: white;
                padding: 12px; border-radius: 8px; font-size: 13px; max-width: 300px;
                z-index: 1000000; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
            .evala11y-tooltip-title { font-weight: 600; margin-bottom: 4px; }
            .evala11y-tooltip-desc { opacity: 0.9; }
            .evala11y-empty { padding: 40px 20px; text-align: center; color: #64748b; }
            @keyframes evala11y-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.4)}
                50%{box-shadow:0 0 0 10px rgba(37,99,235,0)} }
        `;
    }

    // Create toggle button
    function createToggleButton() {
        const btn = document.createElement('button');
        btn.className = 'evala11y-btn';
        btn.innerHTML = '♿ EvalA11y';
        btn.onclick = runEvaluation;
        document.body.appendChild(btn);
    }

    // Main evaluation function
    function runEvaluation() {
        if (state.isRunning) return;
        state.isRunning = true;
        state.issues = [];
        clearOverlays();

        // Run all checks
        checkImages();
        checkHeadings();
        checkLinks();
        checkForms();
        checkContrast();
        checkAria();
        checkFocusIndicators();
        checkKeyboardNav();

        state.isRunning = false;
        showPanel();
        applyOverlays();
    }

    // Add issue helper
    function addIssue(element, category, severity, title, description, wcag) {
        state.issues.push({ element, category, severity, title, description, wcag, id: state.issues.length });
    }

    // Check images for alt text
    function checkImages() {
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('alt')) {
                addIssue(img, 'Images', CONFIG.SEVERITY.CRITICAL,
                    'Missing alt attribute', 'Image lacks alt text for screen readers',
                    'WCAG 1.1.1');
            } else if (img.alt.trim() === '' && !img.getAttribute('role')?.includes('presentation')) {
                const isDecorative = img.getAttribute('aria-hidden') === 'true';
                if (!isDecorative) {
                    addIssue(img, 'Images', CONFIG.SEVERITY.MAJOR,
                        'Empty alt attribute', 'Alt text is empty but image may not be decorative',
                        'WCAG 1.1.1');
                }
            }
        });
        // Check for images with redundant alt
        document.querySelectorAll('img[alt]').forEach(img => {
            const alt = img.alt.toLowerCase();
            if (alt.includes('image of') || alt.includes('picture of') || alt === 'image') {
                addIssue(img, 'Images', CONFIG.SEVERITY.MINOR,
                    'Redundant alt text', 'Avoid phrases like "image of" in alt text',
                    'WCAG 1.1.1');
            }
        });
    }

    // Check heading structure
    function checkHeadings() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let prevLevel = 0;
        let h1Count = 0;
        headings.forEach(h => {
            const level = parseInt(h.tagName[1]);
            if (level === 1) h1Count++;
            if (prevLevel > 0 && level > prevLevel + 1) {
                addIssue(h, 'Headings', CONFIG.SEVERITY.MAJOR,
                    'Skipped heading level', `Jumped from h${prevLevel} to h${level}`,
                    'WCAG 1.3.1');
            }
            if (h.textContent.trim() === '') {
                addIssue(h, 'Headings', CONFIG.SEVERITY.MAJOR,
                    'Empty heading', 'Heading has no text content',
                    'WCAG 1.3.1');
            }
            prevLevel = level;
        });
        if (h1Count === 0) {
            addIssue(document.body, 'Headings', CONFIG.SEVERITY.MAJOR,
                'Missing h1', 'Page lacks a main heading (h1)', 'WCAG 1.3.1');
        } else if (h1Count > 1) {
            addIssue(document.body, 'Headings', CONFIG.SEVERITY.MINOR,
                'Multiple h1 elements', `Found ${h1Count} h1 elements`, 'WCAG 1.3.1');
        }
    }

    // Check links
    function checkLinks() {
        const vagueTexts = ['click here', 'here', 'read more', 'more', 'link', 'learn more'];
        document.querySelectorAll('a').forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            if (text === '' && !link.querySelector('img[alt]') && !link.getAttribute('aria-label')) {
                addIssue(link, 'Links', CONFIG.SEVERITY.CRITICAL,
                    'Empty link', 'Link has no accessible text', 'WCAG 2.4.4');
            } else if (vagueTexts.includes(text)) {
                addIssue(link, 'Links', CONFIG.SEVERITY.MAJOR,
                    'Vague link text', `"${text}" doesn't describe the destination`,
                    'WCAG 2.4.4');
            }
            if (!link.hasAttribute('href') || link.href === '' || link.href === '#') {
                if (!link.getAttribute('role') && !link.onclick) {
                    addIssue(link, 'Links', CONFIG.SEVERITY.MINOR,
                        'Non-functional link', 'Link has no destination', 'WCAG 2.4.4');
                }
            }
        });
    }

    // Check form labels
    function checkForms() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (['hidden', 'submit', 'button', 'image', 'reset'].includes(input.type)) return;
            const hasLabel = input.labels?.length > 0;
            const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
            const hasTitle = input.getAttribute('title');
            const hasPlaceholder = input.getAttribute('placeholder');
            if (!hasLabel && !hasAriaLabel && !hasTitle) {
                addIssue(input, 'Forms', CONFIG.SEVERITY.CRITICAL,
                    'Missing form label', 'Input has no associated label', 'WCAG 1.3.1');
            } else if (!hasLabel && hasPlaceholder && !hasAriaLabel) {
                addIssue(input, 'Forms', CONFIG.SEVERITY.MAJOR,
                    'Placeholder as label', 'Placeholder alone is insufficient labeling',
                    'WCAG 1.3.1');
            }
        });
        // Check for missing fieldset/legend in radio/checkbox groups
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            if (!input.closest('fieldset')) {
                const name = input.getAttribute('name');
                const siblings = document.querySelectorAll(`input[name="${name}"]`);
                if (siblings.length > 1) {
                    addIssue(input, 'Forms', CONFIG.SEVERITY.MINOR,
                        'Missing fieldset', 'Related inputs should be grouped in fieldset',
                        'WCAG 1.3.1');
                }
            }
        });
    }

    // Get luminance for contrast calculation
    function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    // Parse color to RGB
    function parseColor(color) {
        const temp = document.createElement('div');
        temp.style.color = color;
        document.body.appendChild(temp);
        const computed = getComputedStyle(temp).color;
        document.body.removeChild(temp);
        const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
        return null;
    }

    // Calculate contrast ratio
    function getContrastRatio(color1, color2) {
        const l1 = getLuminance(color1.r, color1.g, color1.b);
        const l2 = getLuminance(color2.r, color2.g, color2.b);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    // Check color contrast
    function checkContrast() {
        const textElements = document.querySelectorAll('p, span, a, li, td, th, label, h1, h2, h3, h4, h5, h6');
        const checked = new Set();
        textElements.forEach(el => {
            if (checked.has(el) || el.textContent.trim() === '') return;
            const style = getComputedStyle(el);
            const fgColor = parseColor(style.color);
            const bgColor = parseColor(style.backgroundColor);
            if (!fgColor || !bgColor) return;
            const ratio = getContrastRatio(fgColor, bgColor);
            const fontSize = parseFloat(style.fontSize);
            const isBold = parseInt(style.fontWeight) >= 700;
            const isLarge = fontSize >= 24 || (fontSize >= 18.66 && isBold);
            const minRatio = isLarge ? 3 : 4.5;
            if (ratio < minRatio && ratio > 1) {
                addIssue(el, 'Contrast', CONFIG.SEVERITY.CRITICAL,
                    'Insufficient contrast', `Ratio: ${ratio.toFixed(2)}:1 (min: ${minRatio}:1)`,
                    'WCAG 1.4.3');
                checked.add(el);
            }
        });
    }

    // Check ARIA usage
    function checkAria() {
        const validRoles = ['alert', 'alertdialog', 'application', 'article', 'banner',
            'button', 'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
            'contentinfo', 'definition', 'dialog', 'directory', 'document', 'feed',
            'figure', 'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link',
            'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu',
            'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
            'none', 'note', 'option', 'presentation', 'progressbar', 'radio',
            'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
            'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status',
            'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox',
            'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'];
        
        document.querySelectorAll('[role]').forEach(el => {
            const role = el.getAttribute('role');
            if (!validRoles.includes(role)) {
                addIssue(el, 'ARIA', CONFIG.SEVERITY.MAJOR,
                    'Invalid ARIA role', `"${role}" is not a valid role`, 'WCAG 4.1.2');
            }
        });
        // Check aria-hidden on focusable elements
        document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
            const focusable = el.querySelector('a, button, input, select, textarea, [tabindex]');
            if (focusable && focusable.tabIndex >= 0) {
                addIssue(el, 'ARIA', CONFIG.SEVERITY.CRITICAL,
                    'Hidden but focusable', 'aria-hidden element contains focusable content',
                    'WCAG 4.1.2');
            }
        });
        // Check for aria-labelledby references
        document.querySelectorAll('[aria-labelledby]').forEach(el => {
            const ids = el.getAttribute('aria-labelledby').split(' ');
            ids.forEach(id => {
                if (!document.getElementById(id)) {
                    addIssue(el, 'ARIA', CONFIG.SEVERITY.MAJOR,
                        'Invalid aria-labelledby', `Referenced id "${id}" not found`,
                        'WCAG 4.1.2');
                }
            });
        });
    }

    // Check focus indicators
    function checkFocusIndicators() {
        const focusable = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
        focusable.forEach(el => {
            const style = getComputedStyle(el);
            if (style.outlineStyle === 'none' && style.outlineWidth === '0px') {
                const hasFocusStyle = el.matches(':focus-visible');
                if (!hasFocusStyle) {
                    addIssue(el, 'Focus', CONFIG.SEVERITY.MAJOR,
                        'Possible missing focus indicator',
                        'Element may lack visible focus indicator', 'WCAG 2.4.7');
                }
            }
        });
    }

    // Check keyboard navigation
    function checkKeyboardNav() {
        // Check for positive tabindex (anti-pattern)
        document.querySelectorAll('[tabindex]').forEach(el => {
            const tabindex = parseInt(el.getAttribute('tabindex'));
            if (tabindex > 0) {
                addIssue(el, 'Keyboard', CONFIG.SEVERITY.MINOR,
                    'Positive tabindex', 'Positive tabindex disrupts natural tab order',
                    'WCAG 2.4.3');
            }
        });
        // Check for click handlers without keyboard support
        document.querySelectorAll('[onclick]').forEach(el => {
            if (!['a', 'button', 'input', 'select', 'textarea'].includes(el.tagName.toLowerCase())) {
                if (!el.getAttribute('tabindex') && !el.getAttribute('role')) {
                    addIssue(el, 'Keyboard', CONFIG.SEVERITY.MAJOR,
                        'Click without keyboard', 'Element has onclick but no keyboard access',
                        'WCAG 2.1.1');
                }
            }
        });
        // Check for mouse-only event handlers
        const mouseOnlyEvents = ['onmouseover', 'onmouseout', 'onmouseenter', 'onmouseleave'];
        mouseOnlyEvents.forEach(evt => {
            document.querySelectorAll(`[${evt}]`).forEach(el => {
                const hasKeyboardEquivalent = el.getAttribute('onfocus') || el.getAttribute('onblur');
                if (!hasKeyboardEquivalent) {
                    addIssue(el, 'Keyboard', CONFIG.SEVERITY.MINOR,
                        'Mouse-only interaction', `Has ${evt} without keyboard equivalent`,
                        'WCAG 2.1.1');
                }
            });
        });
    }

    // Clear overlays
    function clearOverlays() {
        document.querySelectorAll('.evala11y-highlight, .evala11y-badge').forEach(el => {
            el.classList.remove('evala11y-highlight');
        });
        document.querySelectorAll('.evala11y-badge').forEach(el => el.remove());
        const tooltip = document.getElementById('evala11y-tooltip');
        if (tooltip) tooltip.remove();
    }

    // Apply overlays to issues
    function applyOverlays() {
        if (!state.overlaysVisible) return;
        state.issues.forEach(issue => {
            if (!issue.element || issue.element === document.body) return;
            const el = issue.element;
            el.classList.add('evala11y-highlight');
            el.style.setProperty('--evala11y-color', CONFIG.COLORS[issue.severity]);
            
            // Add badge
            const badge = document.createElement('span');
            badge.className = 'evala11y-badge';
            badge.style.setProperty('--evala11y-color', CONFIG.COLORS[issue.severity]);
            badge.textContent = issue.category.charAt(0);
            badge.dataset.issueId = issue.id;
            
            // Tooltip events
            badge.onmouseenter = (e) => showTooltip(e, issue);
            badge.onmouseleave = hideTooltip;
            
            if (getComputedStyle(el).position === 'static') {
                el.style.position = 'relative';
            }
            el.appendChild(badge);
        });
    }

    // Show tooltip
    function showTooltip(event, issue) {
        let tooltip = document.getElementById('evala11y-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'evala11y-tooltip';
            tooltip.className = 'evala11y-tooltip';
            document.body.appendChild(tooltip);
        }
        tooltip.innerHTML = `
            <div class="evala11y-tooltip-title" style="color: ${CONFIG.COLORS[issue.severity]}">${issue.title}</div>
            <div class="evala11y-tooltip-desc">${issue.description}</div>
            <div style="margin-top: 8px; font-size: 11px; opacity: 0.7">${issue.wcag}</div>
        `;
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY + 10) + 'px';
        tooltip.style.display = 'block';
    }

    // Hide tooltip
    function hideTooltip() {
        const tooltip = document.getElementById('evala11y-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    }

    // Show panel
    function showPanel() {
        let panel = document.getElementById('evala11y-panel');
        if (panel) panel.remove();
        
        panel = document.createElement('div');
        panel.id = 'evala11y-panel';
        panel.className = 'evala11y-panel';
        
        // Header
        panel.innerHTML = `
            <div class="evala11y-header">
                <h2>♿ EvalA11y Results</h2>
                <button class="evala11y-close" id="evala11y-close">&times;</button>
            </div>
        `;
        
        // Stats
        const stats = { critical: 0, major: 0, minor: 0 };
        state.issues.forEach(i => stats[i.severity]++);
        const statsDiv = document.createElement('div');
        statsDiv.className = 'evala11y-stats';
        statsDiv.innerHTML = `
            <div class="evala11y-stat critical"><div class="evala11y-stat-num">${stats.critical}</div><div class="evala11y-stat-label">Critical</div></div>
            <div class="evala11y-stat major"><div class="evala11y-stat-num">${stats.major}</div><div class="evala11y-stat-label">Major</div></div>
            <div class="evala11y-stat minor"><div class="evala11y-stat-num">${stats.minor}</div><div class="evala11y-stat-label">Minor</div></div>
        `;
        panel.appendChild(statsDiv);
        
        // Actions
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'evala11y-actions';
        actionsDiv.innerHTML = `
            <button class="evala11y-action-btn" id="evala11y-toggle-overlays">Toggle Overlays</button>
            <button class="evala11y-action-btn" id="evala11y-export-json">Export JSON</button>
            <button class="evala11y-action-btn" id="evala11y-export-csv">Export CSV</button>
            <button class="evala11y-action-btn" id="evala11y-export-pdf">Export PDF</button>
        `;
        panel.appendChild(actionsDiv);
        
        // Issues grouped by category
        const groups = {};
        state.issues.forEach(issue => {
            if (!groups[issue.category]) groups[issue.category] = [];
            groups[issue.category].push(issue);
        });
        
        if (Object.keys(groups).length === 0) {
            const empty = document.createElement('div');
            empty.className = 'evala11y-empty';
            empty.textContent = '✓ No accessibility issues found!';
            panel.appendChild(empty);
        } else {
            Object.keys(groups).sort().forEach(category => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'evala11y-group';
                groupDiv.innerHTML = `<div class="evala11y-group-header"><span>${category}</span><span>${groups[category].length}</span></div>`;
                
                const issuesList = document.createElement('div');
                issuesList.className = 'evala11y-issues-list';
                issuesList.style.display = 'none';
                
                groups[category].forEach(issue => {
                    const issueDiv = document.createElement('div');
                    issueDiv.className = 'evala11y-issue';
                    issueDiv.innerHTML = `<span class="evala11y-issue-severity" style="background: ${CONFIG.COLORS[issue.severity]}"></span>${issue.title}`;
                    issueDiv.onclick = () => scrollToIssue(issue);
                    issuesList.appendChild(issueDiv);
                });
                
                groupDiv.querySelector('.evala11y-group-header').onclick = () => {
                    issuesList.style.display = issuesList.style.display === 'none' ? 'block' : 'none';
                };
                
                groupDiv.appendChild(issuesList);
                panel.appendChild(groupDiv);
            });
        }
        
        document.body.appendChild(panel);
        
        // Event listeners
        document.getElementById('evala11y-close').onclick = () => panel.remove();
        document.getElementById('evala11y-toggle-overlays').onclick = toggleOverlays;
        document.getElementById('evala11y-export-json').onclick = exportJSON;
        document.getElementById('evala11y-export-csv').onclick = exportCSV;
        document.getElementById('evala11y-export-pdf').onclick = exportPDF;
        
        state.panelVisible = true;
    }

    // Scroll to issue element
    function scrollToIssue(issue) {
        if (issue.element && issue.element !== document.body) {
            issue.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            issue.element.style.animation = 'none';
            issue.element.offsetHeight; // Trigger reflow
            issue.element.style.animation = 'evala11y-pulse 0.5s ease 3';
        }
    }

    // Toggle overlays
    function toggleOverlays() {
        state.overlaysVisible = !state.overlaysVisible;
        if (state.overlaysVisible) {
            applyOverlays();
        } else {
            clearOverlays();
        }
    }

    // Export as JSON
    function exportJSON() {
        const report = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            summary: getSummary(),
            issues: state.issues.map(i => ({
                category: i.category,
                severity: i.severity,
                title: i.title,
                description: i.description,
                wcag: i.wcag,
                element: i.element?.tagName || 'BODY',
                selector: getSelector(i.element)
            }))
        };
        downloadFile(JSON.stringify(report, null, 2), 'evala11y-report.json', 'application/json');
    }

    // Export as CSV
    function exportCSV() {
        const headers = ['Category', 'Severity', 'Title', 'Description', 'WCAG', 'Element', 'Selector'];
        const rows = state.issues.map(i => [
            i.category,
            i.severity,
            i.title,
            i.description,
            i.wcag,
            i.element?.tagName || 'BODY',
            getSelector(i.element)
        ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        downloadFile(csv, 'evala11y-report.csv', 'text/csv');
    }

    // Export as PDF (generates printable HTML)
    function exportPDF() {
        const summary = getSummary();
        const html = `<!DOCTYPE html><html><head><title>EvalA11y Report</title>
        <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:20px}
        h1{color:#1e293b}h2{color:#475569;border-bottom:2px solid #e2e8f0;padding-bottom:8px}
        .summary{display:flex;gap:20px;margin:20px 0}.stat{padding:15px;border-radius:8px;text-align:center}
        .critical{background:#fef2f2;color:#dc2626}.major{background:#fff7ed;color:#ea580c}.minor{background:#fefce8;color:#ca8a04}
        .stat-num{font-size:32px;font-weight:700}.stat-label{font-size:12px;text-transform:uppercase}
        table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;text-align:left;border-bottom:1px solid #e2e8f0}
        th{background:#f8fafc}.sev{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px}
        @media print{.no-print{display:none}}</style></head>
        <body><h1>♿ EvalA11y Accessibility Report</h1>
        <p><strong>URL:</strong> ${window.location.href}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <div class="summary">
            <div class="stat critical"><div class="stat-num">${summary.critical}</div><div class="stat-label">Critical</div></div>
            <div class="stat major"><div class="stat-num">${summary.major}</div><div class="stat-label">Major</div></div>
            <div class="stat minor"><div class="stat-num">${summary.minor}</div><div class="stat-label">Minor</div></div>
        </div>
        <h2>Issues (${summary.total})</h2>
        <table><thead><tr><th>Severity</th><th>Category</th><th>Issue</th><th>WCAG</th></tr></thead><tbody>
        ${state.issues.map(i => `<tr><td><span class="sev" style="background:${CONFIG.COLORS[i.severity]}"></span>${i.severity}</td><td>${i.category}</td><td><strong>${i.title}</strong><br><small>${i.description}</small></td><td>${i.wcag}</td></tr>`).join('')}
        </tbody></table>
        <p class="no-print"><button onclick="window.print()">Print / Save as PDF</button></p>
        </body></html>`;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    }

    // Get summary statistics
    function getSummary() {
        const summary = { total: state.issues.length, critical: 0, major: 0, minor: 0 };
        state.issues.forEach(i => summary[i.severity]++);
        return summary;
    }

    // Get CSS selector for element
    function getSelector(el) {
        if (!el || el === document.body) return 'body';
        if (el.id) return `#${el.id}`;
        let path = [];
        while (el && el !== document.body) {
            let selector = el.tagName.toLowerCase();
            if (el.className && typeof el.className === 'string') {
                selector += '.' + el.className.trim().split(/\s+/).join('.');
            }
            path.unshift(selector);
            el = el.parentElement;
        }
        return path.join(' > ').substring(0, 100);
    }

    // Download file helper
    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
