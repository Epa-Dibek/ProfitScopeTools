// --- Shared Utils ---

/**
 * Parses URL query parameters and fills matching input fields.
 * Also sets the active class on the current nav link.
 */
export function fillFromUrlParams() {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
        const input = document.querySelector(`input[name="${key}"]`);
        if (input) {
            input.value = value;
        }
    });

    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (path === linkPath || (path === '/' && linkPath === '/index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Formats a number as currency (USD).
 */
export function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(num);
}

/**
 * Formats a number as a percentage.
 */
export function formatPercent(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(num / 100);
}

/**
 * Debounce function to limit frequent updates.
 */
export function debounce(func, wait = 50) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Sets up auto-calculation for a tool.
 */
export function setupAutoCalc(calculateFn) {
    const inputs = document.querySelectorAll('input');
    const triggerCalc = debounce(() => {
        const results = calculateFn();
        if (results) {
            updateUI(results);
            updateRelatedLinks();
        }
    }, 50);

    inputs.forEach(input => {
        input.addEventListener('input', triggerCalc);
    });

    // Initial calculation
    triggerCalc();
}

/**
 * Initializes FAQ accordions.
 */
export function setupAccordions() {
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            const isOpen = item.classList.contains('open');
            
            // Close others (optional, but requested "below the calculators" suggests a clean look)
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });
}

/**
 * Sets up the theme toggle and initializes the theme from localStorage.
 */
export function setupTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    // The preferred theme is already applied by the inline head script,
    // but we ensure consistency here.
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}

/**
 * Updates related tool links with current input values as query params.
 */
function updateRelatedLinks() {
    const inputs = document.querySelectorAll('input');
    const params = new URLSearchParams();
    inputs.forEach(input => {
        if (input.value && input.name) {
            params.set(input.name, input.value);
        }
    });

    const queryString = params.toString();
    if (!queryString) return;

    const links = document.querySelectorAll('.tool-link, .nav-links a');
    links.forEach(link => {
        const url = new URL(link.href, window.location.origin);
        url.search = queryString;
        link.href = url.pathname + url.search;
    });
}

/**
 * Updates UI outputs based on object keys.
 */
function updateUI(results) {
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) resultsSection.classList.add('active');

    for (const [key, value] of Object.entries(results)) {
        const el = document.getElementById(`out-${key}`);
        if (el) {
            // Apply formatting if requested by data attribute or naming
            if (el.dataset.format === 'currency') {
                el.textContent = formatCurrency(value);
            } else if (el.dataset.format === 'percent') {
                el.textContent = formatPercent(value);
            } else if (el.dataset.format === 'number') {
                el.textContent = value.toFixed(2);
            } else {
                el.textContent = value;
            }
        }
        
        // Special case for progress bars
        if (key === 'score') {
            const bar = document.querySelector('.progress-bar');
            if (bar) {
                bar.style.width = `${Math.min(100, Math.max(0, value))}%`;
                if (value < 40) bar.style.backgroundColor = 'var(--danger)';
                else if (value < 70) bar.style.backgroundColor = 'var(--warning)';
                else bar.style.backgroundColor = 'var(--success)';
            }
        }

        // Special case for rating tags
        if (key === 'rating') {
            const tag = document.querySelector('.tag');
            if (tag) {
                tag.textContent = value;
                tag.className = 'tag ' + `tag-${value.toLowerCase()}`;
            }
        }
    }
}
