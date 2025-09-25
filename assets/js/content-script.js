'use strict';

(function () {
    // Prevent the script from running multiple times on the same page
    if (window.schemaArchitectInspectorActive) {
        return;
    }
    window.schemaArchitectInspectorActive = true;
    console.log('%c Schema Architect Inspector Activated ', 'background: #0d6efd; color: white; font-size: 14px; border-radius: 3px;');

    // --- 1. Define UI Elements and Styles ---
    const overlay = document.createElement('div');
    const tooltip = document.createElement('div');
    const style = document.createElement('style');

    // --- 2. Configure and Inject UI ---
    Object.assign(overlay.style, {
        position: 'absolute',
        backgroundColor: 'rgba(78, 115, 223, 0.4)',
        border: '2px solid #4e73df',
        borderRadius: '3px',
        pointerEvents: 'none',
        zIndex: '2147483646',
        transition: 'all 50ms ease-out'
    });

    tooltip.className = 'sa-prism-tooltip';
    Object.assign(tooltip.style, {
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: '2147483647',
    });

    style.textContent = `
        .sa-prism-tooltip {
            background: #2d2d2d; color: #ccc; padding: 8px 12px;
            border-radius: 6px; font-size: 13px;
            font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5); max-width: 450px;
            word-wrap: break-word; white-space: normal; line-height: 1.5;
            direction: ltr; text-align: left;
        }
        .sa-prism-tooltip .token-tag { color: #f07178; }
        .sa-prism-tooltip .token-class { color: #ffcb6b; }
        .sa-prism-tooltip .token-id { color: #FAD460; }
        .sa-prism-tooltip .token-punctuation { color: #89ddff; }
        .sa-prism-tooltip .token-pseudo { color: #82aaff; }

        /* --- >> UX UPGRADE: Notification Position & Style << --- */
        .sa-copy-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #1f2937; /* Darker, more professional background */
            color: #e5e7eb; /* Light grey text */
            padding: 12px 22px;
            border-radius: 8px;
            z-index: 2147483647;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 15px;
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    document.body.appendChild(tooltip);
    document.body.style.cursor = 'crosshair';


    // --- 3. Helper Functions ---

    /**
     * Shows a temporary success notification.
     */
    function showCopyNotification(text) {
        const notification = document.createElement('div');
        notification.className = 'sa-copy-notification';
        notification.textContent = text;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => { notification.remove(); }, 300);
        }, 2200); // Slightly longer display time
    }

    /**
     * --- >> UPGRADED Smart Selector Generator << ---
     * Generates a smart, concise, and unique CSS selector for an element.
     */
    function generateSmartSelector(el) {
        if (!(el instanceof Element)) return '';
        if (el.id) {
            const idSelector = '#' + CSS.escape(el.id);
            if (document.querySelectorAll(idSelector).length === 1) return idSelector;
        }

        const path = [];
        while (el && el.parentElement) {
            // --- >> REFINEMENT: Recalculate stable classes at each level << ---
            const stableClasses = Array.from(el.classList).filter(c => !['active', 'show', 'collapsed', 'focus', 'hover', 'visible'].includes(c));

            let selector = el.tagName.toLowerCase();
            if (stableClasses.length > 0) {
                selector += '.' + stableClasses.join('.');
            }

            const parent = el.parentElement;
            const siblings = Array.from(parent.children).filter(child => child.nodeName === el.nodeName);
            if (siblings.length > 1) {
                const index = siblings.indexOf(el) + 1;
                selector += `:nth-of-type(${index})`;
            }

            path.unshift(selector);
            try { if (document.querySelectorAll(path.join(' > ')).length === 1) break; } catch (e) { }
            if (parent === document.body) break;
            el = parent;
        }
        return path.join(' > ');
    }

    /**
     * Creates a syntax-highlighted HTML string from a CSS selector.
     */
    function highlightSelector(selector) {
        const parts = selector.split(' > ');
        const highlightedParts = parts.map(part => {
            let highlightedPart = part;
            highlightedPart = highlightedPart.replace(/^[a-z0-9-]+/, '<span class="token-tag">$&</span>');
            highlightedPart = highlightedPart.replace(/#([a-zA-Z0-9_-]+)/g, '<span class="token-punctuation">#</span><span class="token-id">$1</span>');
            highlightedPart = highlightedPart.replace(/\\.([a-zA-Z0-9_-]+)/g, '<span class="token-punctuation">.</span><span class="token-class">$1</span>');
            highlightedPart = highlightedPart.replace(/:[a-z-]+(\\([0-9n+-]+\\))?/g, '<span class="token-pseudo">$&</span>');
            return highlightedPart;
        });
        return highlightedParts.join('<br><span class="token-punctuation">&nbsp;&gt; </span>');
    }

    // --- 4. Core Event Handlers (with Performance and UX upgrades) ---

    let animationFrameId = null;

    /**
     * --- >> PERFORMANCE UPGRADE: Use requestAnimationFrame for smoothness << ---
     */
    function onMouseMove(e) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(() => {
            handleMouseOver(e);
        });
    }

    function handleMouseOver(e) {
        const target = e.target;
        if (!target || target === overlay || target === tooltip || tooltip.contains(target) || target.tagName === 'BODY' || target.tagName === 'HTML') {
            overlay.style.width = '0px';
            tooltip.style.display = 'none';
            return;
        }
        tooltip.style.display = 'block';

        const rect = target.getBoundingClientRect();

        // --- >> UX UPGRADE: Minimum overlay size for tiny elements << ---
        const MIN_SIZE = 10;
        const width = Math.max(rect.width, MIN_SIZE);
        const height = Math.max(rect.height, MIN_SIZE);
        const top = rect.top + window.scrollY - ((height - rect.height) / 2);
        const left = rect.left + window.scrollX - ((width - rect.width) / 2);

        Object.assign(overlay.style, {
            width: `${width}px`, height: `${height}px`, top: `${top}px`, left: `${left}px`
        });

        const selectorText = generateSmartSelector(target);
        tooltip.innerHTML = highlightSelector(selectorText);

        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const scrollY = window.scrollY;
        let tooltipTop = rect.top + scrollY - tooltipRect.height - 8;
        let tooltipLeft = rect.left + window.scrollX;
        if (tooltipTop < scrollY) tooltipTop = rect.bottom + scrollY + 8;
        if (tooltipLeft + tooltipRect.width > viewportWidth) tooltipLeft = viewportWidth - tooltipRect.width - 10;
        if (tooltipLeft < 0) tooltipLeft = 10;
        tooltip.style.top = `${tooltipTop}px`;
        tooltip.style.left = `${tooltipLeft}px`;
    }

    function handleClick(e) {
        const target = e.target;
        if (!target || target === overlay || target === tooltip || tooltip.contains(target) || target.tagName === 'BODY' || target.tagName === 'HTML') return;

        e.preventDefault();
        e.stopPropagation();
        const selector = generateSmartSelector(target);

        // --- >> UX UPGRADE: Clipboard fallback logic << ---
        try {
            navigator.clipboard.writeText(selector).then(() => {
                showCopyNotification('✅ Selector copied!');
                // --- >> UX UPGRADE: Log the copied selector for power users << ---
                console.log(`Copied selector: %c${selector}`, 'color: #4e73df; font-weight: bold;');
                chrome.runtime.sendMessage({ type: 'selector-copied', selector: selector });
            });
        } catch (err) {
            console.error('Failed to copy to clipboard automatically:', err);
            prompt('Could not copy automatically. Please copy this selector manually:', selector);
        } finally {
            cleanup();
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            cleanup();
            chrome.runtime.sendMessage({ type: 'inspection-cancelled' });
        }
    }

    function cleanup() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('click', handleClick, true);
        document.removeEventListener('keydown', handleKeyDown, true);
        document.body.style.cursor = 'default';
        if (overlay) overlay.remove();
        if (tooltip) tooltip.remove();
        if (style) style.remove();
        window.schemaArchitectInspectorActive = false;
        console.log('%c Schema Architect Inspector Deactivated ', 'background: #6c757d; color: white; font-size: 14px; border-radius: 3px;');
    }

    // --- 5. Activation ---
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);

})();