export function fillFromUrlParams() {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
        const input = document.getElementById(key);
        if (input) input.value = value;
    });
}

export function setupTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

export function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

export function formatPercent(value) {
    return value.toFixed(1) + '%';
}

export function setupAutoCalc(calculateFn) {
    const inputs = document.querySelectorAll('input');
    
    const update = () => {
        const results = calculateFn();
        if (!results) return;

        Object.keys(results).forEach(key => {
            const el = document.getElementById('out-' + key);
            if (el) {
                const format = el.getAttribute('data-format');
                if (format === 'currency') el.textContent = formatCurrency(results[key]);
                else if (format === 'percent') el.textContent = formatPercent(results[key]);
                else el.textContent = results[key];
            }
        });

        // Special case for progress bar and rating
        if (results.score !== undefined) {
            const bar = document.querySelector('.progress-bar');
            if (bar) bar.style.width = Math.min(100, results.score) + '%';
        }
        if (results.rating) {
            const ratingEl = document.getElementById('out-rating');
            if (ratingEl) ratingEl.textContent = results.rating;
        }
    };

    inputs.forEach(input => input.addEventListener('input', update));
    update(); // Initial run
}

export function setupAccordions() {
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(q => {
        q.addEventListener('click', () => {
            const answer = q.nextElementSibling;
            if (answer) {
                answer.style.display = answer.style.display === 'none' ? 'block' : 'none';
            }
        });
    });
}
