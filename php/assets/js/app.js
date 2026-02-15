/**
 * BlockCopy - Main JavaScript
 */

// API Helper
const API = {
    baseUrl: '/api',

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('blockcopy_token') || sessionStorage.getItem('blockcopy_token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(this.baseUrl + endpoint, {
                ...options,
                headers
            });

            if (response.status === 401) {
                // Unauthorized - redirect to login
                window.location.href = '/login.php';
                return;
            }

            const data = await response.json();
            return { success: response.ok, data, status: response.status };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    },

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// Auth Handler
const Auth = {
    async login(email, password) {
        return await API.post('/auth/login.php', { email, password });
    },

    async register(name, email, password) {
        return await API.post('/auth/register.php', { name, email, password });
    },

    async logout() {
        return await API.post('/auth/logout.php');
    },

    async getMe() {
        return await API.get('/auth/me.php');
    },

    isAuthenticated() {
        return localStorage.getItem('blockcopy_token') || sessionStorage.getItem('blockcopy_token');
    }
};

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Confirm Dialog
function confirmDelete(message = 'هل أنت متأكد؟') {
    return confirm(message);
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Truncate Text
function truncate(text, length = 100) {
    if (text.length <= length) return text;
    return text.substr(0, length) + '...';
}

// Copy to Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('تم النسخ!', 'success');
    } catch (error) {
        console.error('Copy failed:', error);
    }
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Add loading states to buttons
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
            }
        });
    });
});

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        padding: 15px 25px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        transition: transform 0.3s ease;
        z-index: 10000;
    }

    .notification.show {
        transform: translateX(-50%) translateY(0);
    }

    .notification-success {
        background: #d4edda;
        color: #155724;
    }

    .notification-error {
        background: #f8d7da;
        color: #721c24;
    }

    .notification-info {
        background: #d1ecf1;
        color: #0c5460;
    }
`;
document.head.appendChild(style);
