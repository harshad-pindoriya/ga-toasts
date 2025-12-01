
// Global variables
let currentPosition = 'top-end';
let currentTheme = 'light';

// Basic toast functions
function showSuccess() {
    GaToasts.success('🎉 Amazing! Your action completed successfully!', { title: 'Success' });
}

function showError() {
    GaToasts.error('😞 Oops! Something went wrong. Please try again.', { title: 'Error' });
}

function showWarning() {
    GaToasts.warning('⚠️ Heads up! Please check your input before proceeding.', { title: 'Warning' });
}

function showInfo() {
    GaToasts.info('💡 Here is some useful information for you.', { title: 'Info' });
}

function showPrimary() {
    GaToasts.show({
        type: 'primary',
        title: 'Primary Notification',
        message: 'This is a primary notification'
    });
}

function showSecondary() {
    GaToasts.show({
        type: 'secondary',
        title: 'Secondary Notification',
        message: 'This is a secondary notification'
    });
}

function showCompact() {
    GaToasts.show({
        type: 'info',
        title: 'New Message',
        message: 'You have received a new message from John Doe. Click to view details.',
        compact: true,
        duration: 5000
    });
}

// Advanced features
function showWithTitle() {
    GaToasts.show({
        title: 'New Message',
        message: 'You have received a new message from John Doe. Click to view details.',
        type: 'info',
        duration: 5000
    });
}


function showWithActions() {
    GaToasts.show({
        message: 'File uploaded successfully!',
        type: 'success',
        actions: [
            {
                text: 'View File',
                class: 'ga-btn-primary',
                click: function () {
                    alert('Opening file...');
                }
            },
            {
                text: 'Dismiss',
                class: 'ga-btn-secondary',
                click: function (e, toast) {
                            GaToasts.close(toast);
                }
            }
        ]
    });
}

function showConfirmation() {
    GaToasts.confirm('Are you sure you want to delete this item?', {
        onConfirm: function () {
            GaToasts.success('Item deleted successfully!');
        },
        onCancel: function () {
            GaToasts.info('Deletion cancelled.');
        }
    });
}

function showLoading() {
    const loadingToast = GaToasts.loading('Processing your request...');

    // Simulate loading completion
    setTimeout(() => {
        GaToasts.close(loadingToast);
        GaToasts.success('Request completed successfully!');
    }, 3000);
}

function showCustomIcon() {
    GaToasts.show({
        message: 'Custom icon toast',
        type: 'info',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
    });
}

function showModern() {
    GaToasts.modern('This is a modern toast with enhanced styling!');
}

function showSwipeToClose() {
    GaToasts.show({
        title: 'Swipe to close',
        message: 'On touch devices, drag this toast left or right to dismiss it.',
        type: 'info',
        swipeToClose: true
    });
}

// Variants and sizes
function showFilled() {
    GaToasts.show({
        message: 'Filled variant toast',
        type: 'success',
        variant: 'filled'
    });
}

function showLight() {
    GaToasts.show({
        message: 'Light variant toast',
        type: 'info',
        variant: 'light'
    });
}

function showSmall() {
    GaToasts.show({
        message: 'Small toast',
        type: 'warning',
        size: 'sm'
    });
}

function showLarge() {
    GaToasts.show({
        message: 'Large toast with more content and better visibility',
        type: 'primary',
        size: 'lg'
    });
}

function showGlassmorphism() {
    GaToasts.show({
        message: 'Glassmorphism effect toast',
        type: 'info',
        glassmorphism: true
    });
}

function showGradient() {
    const toast = GaToasts.show({
        message: 'Gradient border toast',
        type: 'primary'
    });
    toast.addClass('ga-toast-gradient-border');
}

// Animations
function showFade() {
    GaToasts.show({
        message: 'Fade animation toast',
        title: 'Fade',
        type: 'info',
        animation: 'fade'
    });
}

function showSlide() {
    GaToasts.show({
        message: 'Slide animation toast',
        title: 'Slide',
        type: 'success',
        animation: 'slide'
    });
}

function showBounce() {
    GaToasts.show({
        message: 'Bounce animation toast',
        title: 'Bounce',
        type: 'warning',
        animation: 'bounce'
    });
}

function showScale() {
    GaToasts.show({
        message: 'Scale animation toast',
        title: 'Scale',
        type: 'info',
        animation: 'scale'
    });
}

function showShake() {
    const toast = GaToasts.show({
        message: 'Shake effect toast',
        title: 'Shake',
        type: 'error'
    });
    toast.addClass('ga-toast-shake');
}

function showHeartbeat() {
    const toast = GaToasts.show({
        message: 'Heartbeat effect toast',
        title: 'Heartbeat',
        type: 'success'
    });
    toast.addClass('ga-toast-heartbeat');
}

// Position control
function setPosition(position) {
    currentPosition = position;
    document.querySelectorAll('.position-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }
}

function showAtPosition() {
    GaToasts.show({
        message: `Toast at ${currentPosition} position`,
        title: 'Position',
        type: 'info',
        position: currentPosition
    });
}

// Theme control with persistence
function setTheme(theme, sourceButton) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-ga-theme', theme);
    try {
        localStorage.setItem('ga-theme', theme);
    } catch (e) {
        // ignore storage errors
    }

    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    if (sourceButton) {
        sourceButton.classList.add('active');
    } else {
        buttons.forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
    }
}

function showThemedToast() {
    GaToasts.show({
        message: `Toast with ${currentTheme} theme`,
        title: 'Theme',
        type: 'info'
    });
}

// Progress and timing
function showWithProgress() {
    GaToasts.show({
        message: 'Toast with progress bar',
        title: 'Progress',
        type: 'info',
        progress: true,
        duration: 5000
    });
}

function showPauseOnHover() {
    GaToasts.show({
        message: 'Hover to pause countdown',
        title: 'Pause',
        type: 'success',
        pauseOnHover: true,
        duration: 5000
    });
}

function showLongDuration() {
    GaToasts.show({
        message: 'This toast will stay for 10 seconds',
        title: 'Long',
        type: 'warning',
        duration: 10000
    });
}

function showNoAutoClose() {
    GaToasts.show({
        message: 'This toast will not auto-close',
        title: 'No Auto Close',
        type: 'info',
        duration: 0,
        closable: true
    });
}

function showClickToClose() {
    GaToasts.show({
        message: 'Click anywhere on this toast to close it',
        type: 'info',
        clickToClose: true
    });
}

function showBackgroundFill() {
    GaToasts.show({
        message: 'Toast with background fill effect',
        type: 'primary',
        progressBackground: true,
        duration: 5000
    });
}

// Toast management
function showMultiple() {
    const types = ['success', 'info', 'warning', 'error'];
    types.forEach((type, index) => {
        setTimeout(() => {
            GaToasts.show({
                message: `Toast ${index + 1} - ${type}`,
                type: type
            });
        }, index * 500);
    });
}

function updateToast() {
    const toast = GaToasts.show({
        id: 'updateable-toast',
        message: 'Initial message - will update in 2 seconds',
        type: 'info',
        duration: 0
    });

    setTimeout(() => {
        GaToasts.update('updateable-toast', {
            message: 'Message updated successfully!',
            type: 'success'
        });
    }, 2000);
}

function closeAll() {
    GaToasts.closeAll();
}

function getCount() {
    const count = GaToasts.getCount();
    GaToasts.info(`There are currently ${count} toasts visible`);
}

function clearByType() {
    GaToasts.clear('info');
    GaToasts.info('All info toasts have been cleared');
}

function showStack() {
    // Show multiple toasts in a stack
    for (let i = 1; i <= 5; i++) {
                setTimeout(() => {
                    GaToasts.show({
                message: `Stacked toast ${i}`,
                type: 'info',
                size: 'sm'
            });
        }, i * 200);
    }
}

// Initialize demo
document.addEventListener('DOMContentLoaded', function () {
    // Restore saved theme or respect system preference
    try {
        const savedTheme = localStorage.getItem('ga-theme');
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    } catch (e) {
        setTheme('light');
    }

    // Add copy buttons to all code blocks
    document.querySelectorAll('.code-block').forEach(block => {
        const pre = block.querySelector('pre');
        if (!pre) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'code-copy-btn';
        btn.textContent = 'Copy';
        btn.addEventListener('click', function () {
            const text = pre.innerText;
                    navigator.clipboard.writeText(text).then(() => {
                        GaToasts.success('Code copied to clipboard!', { title: 'Copied' });
                    }).catch(() => {
                        GaToasts.error('Unable to copy code.', { title: 'Error' });
            });
        });
        block.appendChild(btn);
    });

    // Keyboard shortcuts for common toasts
    document.addEventListener('keydown', function (e) {
        if (!e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) return;
        const key = e.key.toLowerCase();
        switch (key) {
            case 's':
                e.preventDefault();
                showSuccess();
                break;
            case 'e':
                e.preventDefault();
                showError();
                break;
            case 'w':
                e.preventDefault();
                showWarning();
                break;
            case 'i':
                e.preventDefault();
                showInfo();
                break;
        }
    });

    // Show welcome toast
    setTimeout(() => {
        GaToasts.show({
            title: 'Welcome to GA Toasts! 🎉',
            message: 'Discover the power of beautiful, modern toast notifications. Use the controls and keyboard shortcuts to explore all the features. (Alt+S: success, Alt+E: error, Alt+W: warning, Alt+I: info)',
            type: 'success',
            duration: 6000,
            position: 'top-center'
        });
    }, 1000);
});


