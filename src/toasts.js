/**
 * Toast component JavaScript for Genie AI Plugin
 * Pure vanilla JavaScript implementation - no jQuery dependency
 */

(function () {
    'use strict';

    // Initialize GenieAI global object if it doesn't exist
    if (typeof window.GenieAI === 'undefined') {
        window.GenieAI = {
            utils: {
                generateId: function() {
                    return 'toast_' + Math.random().toString(36).substr(2, 9);
                },
                log: function(message, data) {
                    if (console && console.log) {
                        console.log('[GA Toasts]', message, data || '');
                    }
                }
            }
        };
    }

    // Utility functions
    const Utils = {
        // jQuery-like $ function for element selection
        $: function(selector) {
            if (typeof selector === 'string') {
                return document.querySelector(selector);
            }
            return selector;
        },

        // jQuery-like $$ function for multiple element selection
        $$: function(selector) {
            return document.querySelectorAll(selector);
        },

        // Create element with classes and attributes
        createElement: function(tag, className, attributes) {
            const element = document.createElement(tag);
            if (className) {
                element.className = className;
            }
            if (attributes) {
                Object.keys(attributes).forEach(key => {
                    element.setAttribute(key, attributes[key]);
                });
            }
            return element;
        },

        // Add event listener with delegation
        on: function(element, event, selector, handler) {
            if (typeof selector === 'function') {
                element.addEventListener(event, selector);
            } else {
                element.addEventListener(event, function(e) {
                    if (e.target.matches(selector) || e.target.closest(selector)) {
                        handler.call(e.target, e);
                    }
                });
            }
        },

        // Remove event listener
        off: function(element, event, handler) {
            element.removeEventListener(event, handler);
        },

        // Add class
        addClass: function(element, className) {
            if (element && element.classList) {
                element.classList.add(className);
            }
        },

        // Remove class
        removeClass: function(element, className) {
            if (element && element.classList) {
                element.classList.remove(className);
            }
        },

        // Check if element has class
        hasClass: function(element, className) {
            return element && element.classList && element.classList.contains(className);
        },

        // Toggle class
        toggleClass: function(element, className) {
            if (element && element.classList) {
                element.classList.toggle(className);
            }
        },

        // Set CSS properties
        css: function(element, properties) {
            if (element && element.style) {
                Object.keys(properties).forEach(key => {
                    element.style[key] = properties[key];
                });
            }
        },

        // Get computed style
        getStyle: function(element, property) {
            if (element) {
                return window.getComputedStyle(element)[property];
            }
            return '';
        },

        // Find closest element
        closest: function(element, selector) {
            if (element.closest) {
                return element.closest(selector);
            }
            // Fallback for older browsers
            while (element && element !== document) {
                if (element.matches && element.matches(selector)) {
                    return element;
                }
                element = element.parentElement;
            }
            return null;
        },

        // Deep merge objects
        extend: function(target, ...sources) {
            if (!target) target = {};
            sources.forEach(source => {
                if (source) {
                    Object.keys(source).forEach(key => {
                        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                            target[key] = this.extend(target[key] || {}, source[key]);
                        } else {
                            target[key] = source[key];
                        }
                    });
                }
            });
            return target;
        },

        // Trigger custom event
        trigger: function(element, eventName, detail) {
            if (element) {
                const event = new CustomEvent(eventName, { detail: detail });
                element.dispatchEvent(event);
            }
        },

        // Check if element exists
        exists: function(element) {
            return element && element.parentNode;
        }
    };

    // Toast component
    GenieAI.Toast = {
        /**
         * Initialize toasts
         */
        init: function () {
            this.bindEvents();
            this.initDefaultContainer();
        },

        /**
         * Bind events
         */
        bindEvents: function () {
            const self = this;

            // Close toast triggers
            Utils.on(document, 'click', '[data-ga-toast-close], .ga-toast-close', function (e) {
                e.preventDefault();
                const toastId = this.getAttribute('data-ga-toast-close');
                if (toastId) {
                    self.close('#' + toastId);
                } else {
                    self.close(Utils.closest(this, '.ga-toast'));
                }
            });

            // Auto-close functionality is now handled directly in setupAutoClose method

            // Handle toast click to close (optional)
            Utils.on(document, 'click', '.ga-toast[data-ga-click-to-close="true"]', function (e) {
                if (!Utils.closest(e.target, '.ga-toast-actions, .ga-toast-close')) {
                    self.close(this);
                }
            });
        },

        /**
         * Initialize default container
         */
        initDefaultContainer: function () {
            if (Utils.$('.ga-container')) {
                // Create default container if it doesn't exist
                this.getContainer('top-end');
            }
        },

        /**
         * Show toast
         */
        show: function (options) {
            const defaults = {
                id: 'ga-toast-' + GenieAI.utils.generateId(),
                title: '',
                message: '',
                type: 'info',
                duration: 5000,
                closable: true,
                position: 'top-end',
                icon: null,
                actions: [],
                size: '',
                variant: '', // '', 'filled', 'light'
                animation: 'slide', // 'fade', 'slide', 'bounce', 'scale'
                clickToClose: false,
                progress: true, // New: Enable progress bar by default
                progressBackground: true, // New: Enable background fill with opacity
                pauseOnHover: true // New: Pause countdown on hover
            };

            const settings = Utils.extend({}, defaults, options);

            const toast = this.create(settings);
            const container = this.getContainer(settings.position);

            container.appendChild(toast);

            // Trigger animation after a small delay to ensure DOM is ready
            setTimeout(function () {
                Utils.addClass(toast, 'show');
                Utils.trigger(toast, 'ga:toast:shown');
                
                // Set up auto-close functionality
                self.setupAutoClose(toast, settings);
            }, 10);

            GenieAI.utils.log('Toast shown', settings);

            return toast;
        },

        /**
         * Set up auto-close functionality for a toast
         */
        setupAutoClose: function (toast, settings) {
            const self = this;
            const autoClose = settings.duration;
            const pauseOnHover = settings.pauseOnHover;
            const progress = toast.querySelector('.ga-toast-progress');
            
            if (autoClose && parseInt(autoClose) > 0) {
                let startTime = Date.now();
                let remainingTime = parseInt(autoClose);
                
                const startCountdown = function() {
                    startTime = Date.now();
                    // Clear any existing timeout
                    if (toast.gaTimeoutId) {
                        clearTimeout(toast.gaTimeoutId);
                    }
                    toast.gaTimeoutId = setTimeout(function () {
                        if (Utils.exists(toast) && !Utils.hasClass(toast, 'hide')) {
                            self.close(toast);
                        }
                    }, remainingTime);
                };
                
                // Start initial countdown
                startCountdown();
                
                // Pause on hover if enabled
                if (pauseOnHover) {
                    toast.addEventListener('mouseenter', function() {
                        const elapsed = Date.now() - startTime;
                        remainingTime = Math.max(0, remainingTime - elapsed);
                        if (toast.gaTimeoutId) {
                            clearTimeout(toast.gaTimeoutId);
                        }
                        Utils.addClass(toast, 'ga-toast-paused');
                        
                        // Pause progress bar animation
                        if (progress) {
                            const currentTransform = Utils.getStyle(progress, 'transform');
                            Utils.css(progress, { 'transition': 'none' });
                            progress.setAttribute('data-paused-transform', currentTransform);
                        }
                    });
                    
                    toast.addEventListener('mouseleave', function() {
                        Utils.removeClass(toast, 'ga-toast-paused');
                        
                        // Resume progress bar animation
                        if (progress) {
                            Utils.css(progress, {
                                'transition': 'transform ' + remainingTime + 'ms linear',
                                'transform': 'scaleX(0)'
                            });
                        }
                        
                        startCountdown();
                    });
                }
            }
        },

        /**
         * Create toast element
         */
        create: function (options) {
            // Ensure options is an object
            options = options || {};
            
            const classes = ['ga-toast', 'ga-toast-' + options.type];

            // Add size class
            if (options.size) {
                classes.push('ga-toast-' + options.size);
            }

            // Add variant class
            if (options.variant) {
                classes.push('ga-toast-' + options.type + '-' + options.variant);
            }

            // Add animation class
            if (options.animation) {
                classes.push(options.animation);
            }

            // Add modern styling classes
            classes.push('ga-toast-modern');
            
            // Add glassmorphism effect
            if (options.glassmorphism !== false) {
                classes.push('ga-toast-glass');
            }

            const toast = Utils.createElement('div', classes.join(' '), { id: options.id });

            // Add click to close attribute
            if (options.clickToClose) {
                toast.setAttribute('data-ga-click-to-close', 'true');
            }

            // Add pause on hover attribute
            if (options.pauseOnHover) {
                toast.setAttribute('data-ga-pause-on-hover', 'true');
            }

            // Create content wrapper
            const content = Utils.createElement('div', 'ga-toast-content');

            // Add header if title, closable, or icon exists
            if (options.title || options.closable || options.icon) {
                const header = Utils.createElement('div', 'ga-toast-header');

                // Left section (icon + title)
                const left = Utils.createElement('div', 'ga-toast-header-left');
                if (options.icon) {
                    const icon = Utils.createElement('div', 'ga-toast-icon');
                    icon.innerHTML = options.icon;
                    left.appendChild(icon);
                }
                if (options.title) {
                    const title = Utils.createElement('h4', 'ga-toast-title');
                    title.textContent = this.escapeHtml(options.title);
                    left.appendChild(title);
                }
                header.appendChild(left);

                // Right section (close button)
                if (options.closable) {
                    const closeBtn = Utils.createElement('button', 'ga-toast-close', {
                        'type': 'button',
                        'aria-label': 'Close',
                        'data-ga-toast-close': ''
                    });
                    header.appendChild(closeBtn);
                }

                content.appendChild(header);
            }

            // Add body if message exists
            if (options.message) {
                const body = Utils.createElement('div', 'ga-toast-body');
                body.innerHTML = options.message;
                content.appendChild(body);
            }

            // Add actions if they exist
            if (options.actions && options.actions.length > 0) {
                const actions = Utils.createElement('div', 'ga-toast-actions');

                options.actions.forEach(function (action) {
                    const btnClasses = ['ga-btn', 'ga-btn-sm'];
                    if (action.class) {
                        btnClasses.push(action.class);
                    } else {
                        btnClasses.push('ga-btn-secondary');
                    }

                    const btn = Utils.createElement('button', btnClasses.join(' '), { 'type': 'button' });
                    btn.textContent = self.escapeHtml(action.text);

                    if (action.click) {
                        btn.addEventListener('click', function (e) {
                            action.click(e, toast);
                        });
                    }

                    actions.appendChild(btn);
                });

                content.appendChild(actions);
            }

            toast.appendChild(content);

            // Add progress bar if enabled
            if (options.progress && options.duration && options.duration > 0) {
                const progress = Utils.createElement('div', 'ga-toast-progress ga-toast-progress-' + options.type);
                Utils.css(progress, {
                    'width': '100%',
                    'transform': 'scaleX(1)',
                    'transform-origin': 'left center'
                });
                toast.appendChild(progress);

                // Animate progress bar with smooth countdown
                setTimeout(function () {
                    Utils.css(progress, {
                        'transition': 'transform ' + options.duration + 'ms linear',
                        'transform': 'scaleX(0)'
                    });
                }, 10);
            }

            // Add background fill with opacity if enabled
            if (options.progressBackground && options.duration && options.duration > 0) {
                const backgroundFill = Utils.createElement('div', 'ga-toast-background-fill ga-toast-bg-' + options.type);
                toast.appendChild(backgroundFill);

                // Animate background fill
                setTimeout(function () {
                    Utils.css(backgroundFill, {
                        'transition': 'opacity ' + options.duration + 'ms linear',
                        'opacity': '0'
                    });
                }, 10);
            }

            // Auto-close is now handled in setupAutoClose method

            return toast;
        },

        /**
         * Close toast
         */
        close: function (toast) {
            const toastElement = typeof toast === 'string' ? Utils.$(toast) : toast;
            if (!Utils.exists(toastElement) || Utils.hasClass(toastElement, 'hide')) {
                return;
            }

            // Clear any existing timeout
            if (toastElement.gaTimeoutId) {
                clearTimeout(toastElement.gaTimeoutId);
                delete toastElement.gaTimeoutId;
            }

            Utils.removeClass(toastElement, 'ga-toast-paused');
            Utils.removeClass(toastElement, 'show');
            Utils.addClass(toastElement, 'hide');

            const removeDelay = 300; // Match CSS transition duration

            setTimeout(function () {
                if (Utils.exists(toastElement)) {
                    Utils.trigger(toastElement, 'ga:toast:closed');
                    toastElement.remove();
                }
            }, removeDelay);

            GenieAI.utils.log('Toast closed', toastElement.id);
        },

        /**
         * Close all toasts
         */
        closeAll: function () {
            const self = this;
            Utils.$$('.ga-toast').forEach(function (toast) {
                self.close(toast);
            });
        },

        /**
         * Get or create container by position
         */
        getContainer: function (position) {
            const containerId = 'ga-toast-container-' + position;
            let container = Utils.$('#' + containerId);

            if (!container) {
                container = Utils.createElement('div', 'ga-toast-container ga-toast-container-' + position, { id: containerId });

                // Try to append to ga-container first, then body
                const gaContainer = Utils.$('.ga-container');
                if (gaContainer) {
                    gaContainer.appendChild(container);
                } else {
                    document.body.appendChild(container);
                }
            }

            return container;
        },

        /**
         * Show success toast
         */
        success: function (message, options) {
            const settings = Utils.extend({}, options || {}, {
                type: 'success',
                message: message,
                duration: (options && options.duration) || 5000,
                icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
            });
            return this.show(settings);
        },

        /**
         * Show error toast
         */
        error: function (message, options) {
            const settings = Utils.extend({}, options || {}, {
                type: 'error',
                message: message,
                duration: (options && options.duration) || 8000, // Longer duration for errors
                icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
            });
            return this.show(settings);
        },

        /**
         * Show warning toast
         */
        warning: function (message, options) {
            const settings = Utils.extend({}, options || {}, {
                type: 'warning',
                message: message,
                duration: (options && options.duration) || 6000,
                icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
            });
            return this.show(settings);
        },

        /**
         * Show info toast
         */
        info: function (message, options) {
            const settings = Utils.extend({}, options || {}, {
                type: 'info',
                message: message,
                duration: (options && options.duration) || 4000,
                icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
            });
            return this.show(settings);
        },

        /**
         * Show confirmation toast
         */
        confirm: function (message, options) {
            const self = this;
            const defaults = {
                type: 'warning',
                message: message,
                duration: 0, // Don't auto-close confirmation toasts
                closable: false,
                actions: [
                    {
                        text: 'Cancel',
                        class: 'ga-btn-secondary',
                        click: function (e, toast) {
                            self.close(toast);
                            if (options && options.onCancel) {
                                options.onCancel();
                            }
                        }
                    },
                    {
                        text: 'Confirm',
                        class: 'ga-btn-primary',
                        click: function (e, toast) {
                            self.close(toast);
                            if (options && options.onConfirm) {
                                options.onConfirm();
                            }
                        }
                    }
                ]
            };

            const settings = Utils.extend(true, {}, defaults, options);
            return this.show(settings);
        },

        /**
         * Show loading toast
         */
        loading: function (message, options) {
            const defaults = {
                type: 'info',
                message: message || 'Loading...',
                closable: false,
                duration: 0,
                icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="ga-spin"/></svg>'
            };

            const settings = Utils.extend({}, defaults, options);
            const toast = this.show(settings);
            Utils.addClass(toast, 'ga-toast-loading');
            return toast;
        },

        /**
         * Update toast content
         */
        update: function (toastId, options) {
            // Ensure options is an object
            options = options || {};
            
            const toast = Utils.$('#' + toastId);
            if (!toast) {
                GenieAI.utils.log('Toast not found for update: ' + toastId);
                return false;
            }

            if (options.title !== undefined) {
                const title = toast.querySelector('.ga-toast-title');
                if (title) {
                    title.textContent = this.escapeHtml(options.title);
                } else if (options.title) {
                    // Add title if it doesn't exist
                    let header = toast.querySelector('.ga-toast-header');
                    if (!header) {
                        header = Utils.createElement('div', 'ga-toast-header');
                        toast.querySelector('.ga-toast-content').prepend(header);
                    }
                    const titleElement = Utils.createElement('h4', 'ga-toast-title');
                    titleElement.textContent = this.escapeHtml(options.title);
                    header.prepend(titleElement);
                }
            }

            if (options.message !== undefined) {
                const message = toast.querySelector('.ga-toast-body');
                if (message) {
                    message.innerHTML = options.message;
                }
            }

            if (options.type) {
                const typeClasses = ['ga-toast-success', 'ga-toast-error', 'ga-toast-warning', 'ga-toast-info', 'ga-toast-primary', 'ga-toast-secondary'];
                typeClasses.forEach(cls => Utils.removeClass(toast, cls));
                Utils.addClass(toast, 'ga-toast-' + options.type);
            }

            if (options.icon !== undefined) {
                const icon = toast.querySelector('.ga-toast-icon');
                if (options.icon) {
                    if (icon) {
                        icon.innerHTML = options.icon;
                    } else {
                        const iconElement = Utils.createElement('div', 'ga-toast-icon');
                        iconElement.innerHTML = options.icon;
                        toast.prepend(iconElement);
                    }
                } else if (icon) {
                    icon.remove();
                }
            }

            return true;
        },

        /**
         * Get toast count
         */
        getCount: function (type) {
            if (type) {
                return Utils.$$('.ga-toast.ga-toast-' + type).length;
            }
            return Utils.$$('.ga-toast').length;
        },

        /**
         * Clear all toasts
         */
        clear: function (type) {
            const self = this;
            if (type) {
                Utils.$$('.ga-toast.ga-toast-' + type).forEach(function (toast) {
                    self.close(toast);
                });
            } else {
                this.closeAll();
            }
        },

        /**
         * Check if toast exists
         */
        exists: function (toastId) {
            return !!Utils.$('#' + toastId);
        },

        /**
         * Get toast by ID
         */
        get: function (toastId) {
            return Utils.$('#' + toastId);
        },

        /**
         * Escape HTML to prevent XSS
         */
        escapeHtml: function (text) {
            if (typeof text !== 'string') {
                return text;
            }
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function (m) { return map[m]; });
        },

        /**
         * Set global defaults
         */
        setDefaults: function (defaults) {
            this.globalDefaults = Utils.extend({}, this.globalDefaults || {}, defaults);
        },

        /**
         * Get merged options with global defaults
         */
        getMergedOptions: function (options) {
            return Utils.extend({}, this.globalDefaults || {}, options);
        },

        /**
         * Show modern toast with enhanced styling
         */
        modern: function (message, options) {
            const defaults = {
                message: message,
                progress: true,
                progressBackground: true,
                pauseOnHover: true,
                glassmorphism: true,
                animation: 'slide',
                size: 'md',
                variant: 'filled'
            };
            
            const settings = Utils.extend({}, defaults, options);
            return this.show(settings);
        },

        /**
         * Show notification with modern styling
         */
        notification: function (title, message, options) {
            const defaults = {
                title: title,
                message: message,
                type: 'info',
                progress: true,
                progressBackground: true,
                pauseOnHover: true,
                glassmorphism: true,
                animation: 'slide',
                size: 'md',
                duration: 4000
            };
            
            const settings = Utils.extend({}, defaults, options);
            return this.show(settings);
        }
    };

    // Initialize when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            GenieAI.Toast.init();
        });
    } else {
        GenieAI.Toast.init();
    }

    // Export for global access
    window.GenieAIToast = GenieAI.Toast;

})();