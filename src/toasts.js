/**
 * Toast component JavaScript for Genie AI Plugin
 * Vanilla JS implementation - No jQuery dependency
 */

(function () {
    'use strict';

    // Simple utility object for internal helpers (no global namespace)
    const GaToastsUtils = {
        generateId: function() {
            return 'toast_' + Math.random().toString(36).substr(2, 9);
        },
        log: function(message, data) {
            if (console && console.log) {
                // console.log('[GaToasts]', message, data || '');
            }
        }
    };

    // Optional external logger hook
    let GaToastsLogger = null;

    function logEvent(eventName, payload) {
        GaToastsUtils.log(eventName, payload);
        if (typeof GaToastsLogger === 'function') {
            try {
                GaToastsLogger(eventName, payload);
            } catch (e) {
                // Swallow logger errors to avoid breaking the app
            }
        }
    }

    // Helper functions
    const helpers = {
        // Query selector wrapper
        qs: function(selector, context) {
            return (context || document).querySelector(selector);
        },
        
        // Query selector all wrapper
        qsa: function(selector, context) {
            return Array.from((context || document).querySelectorAll(selector));
        },
        
        // Add event listener with delegation
        on: function(element, event, selector, handler) {
            if (typeof selector === 'function') {
                handler = selector;
                element.addEventListener(event, handler);
            } else {
                element.addEventListener(event, function(e) {
                    const target = e.target.closest(selector);
                    if (target) {
                        handler.call(target, e);
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
            if (!element) return;
            const classes = className.split(' ');
            element.classList.add(...classes);
        },
        
        // Remove class
        removeClass: function(element, className) {
            if (!element) return;
            const classes = className.split(' ');
            element.classList.remove(...classes);
        },
        
        // Has class
        hasClass: function(element, className) {
            return element && element.classList.contains(className);
        },
        
        // Get/Set data attribute
        data: function(element, key, value) {
            if (value === undefined) {
                return element.dataset[key];
            }
            element.dataset[key] = value;
        },
        
        // Get/Set attribute
        attr: function(element, key, value) {
            if (value === undefined) {
                return element.getAttribute(key);
            }
            element.setAttribute(key, value);
        },
        
        // Remove element
        remove: function(element) {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        },
        
        // Trigger custom event
        trigger: function(element, eventName, detail) {
            const event = new CustomEvent(eventName, {
                detail: detail,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        },
        
        // Extend objects (simple deep merge)
        extend: function() {
            const extended = {};
            const deep = arguments[0] === true;
            const start = deep ? 1 : 0;
            
            for (let i = start; i < arguments.length; i++) {
                const obj = arguments[i];
                if (!obj) continue;
                
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (deep && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                            extended[key] = this.extend(true, extended[key] || {}, obj[key]);
                        } else {
                            extended[key] = obj[key];
                        }
                    }
                }
            }
            return extended;
        },
        
        // Create element from HTML string
        createElement: function(html) {
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            return template.content.firstChild;
        }
    };

    // Toast component
    const Toast = {
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
            helpers.on(document, 'click', '[data-ga-toast-close], .ga-toast-close', function (e) {
                e.preventDefault();
                const toastId = helpers.data(this, 'gaToastClose');
                if (toastId) {
                    self.close(helpers.qs('#' + toastId));
                } else {
                    self.close(this.closest('.ga-toast'));
                }
            });

            // Auto-close toasts with pause on hover
            helpers.on(document, 'ga:toast:shown', '.ga-toast', function (e) {
                const toast = e.target;
                const autoClose = parseInt(helpers.data(toast, 'gaAutoClose'));
                const pauseOnHover = helpers.data(toast, 'gaPauseOnHover') === 'true';
                const progress = helpers.qs('.ga-toast-progress', toast);
                
                if (autoClose && autoClose > 0) {
                    let timeoutId;
                    let startTime = Date.now();
                    let remainingTime = autoClose;
                    
                    const startCountdown = function() {
                        startTime = Date.now();
                        timeoutId = setTimeout(function () {
                            if (toast && !helpers.hasClass(toast, 'hide')) {
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
                            clearTimeout(timeoutId);
                            helpers.addClass(toast, 'ga-toast-paused');
                            
                            // Pause progress bar animation
                            if (progress) {
                                const currentTransform = getComputedStyle(progress).transform;
                                progress.style.transition = 'none';
                                helpers.attr(progress, 'data-paused-transform', currentTransform);
                            }
                        });
                        
                        toast.addEventListener('mouseleave', function() {
                            helpers.removeClass(toast, 'ga-toast-paused');
                            
                            // Resume progress bar animation
                            if (progress) {
                                progress.style.transition = 'transform ' + remainingTime + 'ms linear';
                                progress.style.transform = 'scaleX(0)';
                            }
                            
                            startCountdown();
                        });
                    }
                }
            });

            // Handle toast click to close (optional)
            helpers.on(document, 'click', '.ga-toast', function (e) {
                if (helpers.attr(this, 'data-ga-click-to-close') === 'true') {
                    if (!e.target.closest('.ga-toast-actions, .ga-toast-close')) {
                        self.close(this);
                    }
                }
            });
        },

        /**
         * Initialize default container
         */
        initDefaultContainer: function () {
            if (helpers.qs('.ga-container')) {
                // Create default container if it doesn't exist
                this.getContainer('top-end');
            }
        },

        /**
         * Show toast
         */
        show: function (options) {
            const defaults = {
                id: 'ga-toast-' + GaToastsUtils.generateId(),
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
                progress: true,
                progressBackground: true,
                pauseOnHover: true,
                // UI niceties
                compact: false,
                showStatus: false,
                statusText: '',
                autoIcon: true
            };

            // Merge instance defaults (set via setDefaults) with per-call options
            const mergedOptions = this.getMergedOptions
                ? this.getMergedOptions(options || {})
                : (options || {});

            const settings = helpers.extend({}, defaults, mergedOptions);

            // Compact toasts: default to click-to-close if not explicitly set
            if (settings.compact && mergedOptions && mergedOptions.clickToClose == null) {
                settings.clickToClose = true;
            }

            const toast = this.create(settings);
            const container = this.getContainer(settings.position);

            container.appendChild(toast);

            // Trigger animation after a small delay to ensure DOM is ready
            setTimeout(function () {
                helpers.addClass(toast, 'show');
                helpers.trigger(toast, 'ga:toast:shown');
            }, 10);

            logEvent('toast:shown', settings);

            return toast;
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

            // Compact density
            if (options.compact) {
                classes.push('ga-toast-compact');
            }

            // Add modern styling classes
            classes.push('ga-toast-modern');
            
            // Add glassmorphism effect
            if (options.glassmorphism !== false) {
                classes.push('ga-toast-glass');
            }

            const toast = document.createElement('div');
            toast.className = classes.join(' ');
            toast.id = options.id;

            // Add click to close attribute
            if (options.clickToClose) {
                helpers.attr(toast, 'data-ga-click-to-close', 'true');
            }

            // Add pause on hover attribute
            if (options.pauseOnHover) {
                helpers.attr(toast, 'data-ga-pause-on-hover', 'true');
            }

            // Create content wrapper
            const content = document.createElement('div');
            content.className = 'ga-toast-content';

            // Add header if title, closable, or icon exists
            if (options.title || options.closable || options.icon) {
                const header = document.createElement('div');
                header.className = 'ga-toast-header';

                // Left section (icon + title)
                const left = document.createElement('div');
                left.className = 'ga-toast-header-left';
                
                console.log(options);
                

                // Auto icon support
                let resolvedIcon = options.icon;
                if (!resolvedIcon && options.autoIcon !== false) {
                    const type = options.type || 'info';
                    const iconMap = {
                        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
                        error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
                        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
                        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>',
                        primary: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4h12v12H4z" opacity="0.2"></path><path d="M5 5h10v10H5z"></path></svg>',
                        secondary: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="6"></circle></svg>'
                    };
                    resolvedIcon = iconMap[type] || null;
                }

                if (resolvedIcon) {
                    const iconDiv = document.createElement('div');
                    iconDiv.className = 'ga-toast-icon';
                    iconDiv.innerHTML = resolvedIcon;
                    left.appendChild(iconDiv);
                }
                
                if (options.title) {
                    const title = document.createElement('h4');
                    title.className = 'ga-toast-title';
                    title.textContent = options.title;
                    left.appendChild(title);
                }

                // Optional status label
                if (options.showStatus && options.type) {
                    const status = document.createElement('span');
                    status.className = 'ga-toast-status';
                    const label = (options.statusText || options.type)
                        .toString()
                        .replace(/^\w/, c => c.toUpperCase());
                    status.textContent = label;
                    header.appendChild(status);
                }
                
                header.appendChild(left);

                // Right section (close button)
                if (options.closable) {
                    const closeBtn = document.createElement('button');
                    closeBtn.type = 'button';
                    closeBtn.className = 'ga-toast-close';
                    helpers.attr(closeBtn, 'aria-label', 'Close');
                    helpers.attr(closeBtn, 'data-ga-toast-close', '');
                    header.appendChild(closeBtn);
                }

                content.appendChild(header);
            }

            // Add body if message exists
            // For compact toasts we still render the message, but keep the layout
            // tight via CSS (see `.ga-toast-compact .ga-toast-body`).
            if (options.message) {
                const body = document.createElement('div');
                body.className = 'ga-toast-body';
                body.innerHTML = options.message;
                content.appendChild(body);
            }

            // Add actions if they exist (skip for compact toasts)
            if (!options.compact && options.actions && options.actions.length > 0) {
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'ga-toast-actions';
                const self = this;

                options.actions.forEach(function (action) {
                    const btnClasses = ['ga-btn', 'ga-btn-sm'];
                    if (action.class) {
                        btnClasses.push(action.class);
                    } else {
                        btnClasses.push('ga-btn-secondary');
                    }

                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = btnClasses.join(' ');
                    btn.textContent = action.text;

                    if (action.click) {
                        btn.addEventListener('click', function (e) {
                            action.click(e, toast);
                        });
                    }

                    actionsDiv.appendChild(btn);
                });

                content.appendChild(actionsDiv);
            }

            toast.appendChild(content);

            // Add progress bar if enabled
            if (options.progress && options.duration && options.duration > 0 && options.progressPosition !== 'none') {
                const progress = document.createElement('div');
                progress.className = 'ga-toast-progress ga-toast-progress-' + options.type;
                if (options.progressPosition === 'top') {
                    helpers.addClass(progress, 'ga-toast-progress-top');
                }
                progress.style.width = '100%';
                progress.style.transform = 'scaleX(1)';
                progress.style.transformOrigin = 'left center';
                toast.appendChild(progress);

                // Animate progress bar with smooth countdown
                setTimeout(function () {
                    progress.style.transition = 'transform ' + options.duration + 'ms linear';
                    progress.style.transform = 'scaleX(0)';
                }, 10);
            }

            // Add background fill with opacity if enabled
            if (options.progressBackground && options.duration && options.duration > 0) {
                const backgroundFill = document.createElement('div');
                backgroundFill.className = 'ga-toast-background-fill ga-toast-bg-' + options.type;
                toast.appendChild(backgroundFill);

                // Animate background fill
                setTimeout(function () {
                    backgroundFill.style.transition = 'opacity ' + options.duration + 'ms linear';
                    backgroundFill.style.opacity = '0';
                }, 10);
            }

            // Segmented steps indicator for multi-step flows
            if (options.steps && options.steps > 1) {
                const stepsContainer = document.createElement('div');
                stepsContainer.className = 'ga-toast-steps';
                const activeIndex = Math.min(
                    options.steps,
                    Math.max(1, options.currentStep || 1)
                );
                for (let i = 1; i <= options.steps; i++) {
                    const stepEl = document.createElement('div');
                    stepEl.className = 'ga-toast-step';
                    if (i <= activeIndex) {
                        helpers.addClass(stepEl, 'ga-toast-step-active');
                    }
                    stepsContainer.appendChild(stepEl);
                }
                content.appendChild(stepsContainer);
            }

            // Add auto-close data
            if (options.duration && options.duration > 0) {
                helpers.data(toast, 'gaAutoClose', options.duration.toString());
            }

            return toast;
        },

        /**
         * Close toast
         */
        close: function (toast) {
            if (!toast || helpers.hasClass(toast, 'hide')) {
                return;
            }

            // Remove any active event listeners
            const newToast = toast.cloneNode(true);
            toast.parentNode.replaceChild(newToast, toast);
            toast = newToast;

            helpers.removeClass(toast, 'show');
            helpers.addClass(toast, 'hide');

            const removeDelay = 300; // Match CSS transition duration

            setTimeout(function () {
                if (toast) {
                    helpers.trigger(toast, 'ga:toast:closed');
                    helpers.remove(toast);
                }
            }, removeDelay);

            logEvent('toast:closed', toast.id);
        },

        /**
         * Close all toasts
         */
        closeAll: function () {
            const self = this;
            helpers.qsa('.ga-toast').forEach(function (toast) {
                self.close(toast);
            });
        },

        /**
         * Get or create container by position
         */
        getContainer: function (position) {
            const containerId = 'ga-toast-container-' + position;
            let container = helpers.qs('#' + containerId);

            if (!container) {
                container = document.createElement('div');
                container.id = containerId;
                container.className = 'ga-toast-container ga-toast-container-' + position;

                // Try to append to ga-container first, then body
                const gaContainer = helpers.qs('.ga-container');
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
            const settings = helpers.extend({}, options || {}, {
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
            console.log('error', options);
            const settings = helpers.extend({}, options || {}, {
                type: 'error',
                message: message,
                duration: (options && options.duration) || 8000,
                icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
            });
            return this.show(settings);
        },

        /**
         * Show warning toast
         */
        warning: function (message, options) {
            const settings = helpers.extend({}, options || {}, {
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
            const settings = helpers.extend({}, options || {}, {
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
                duration: 0,
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

            const settings = helpers.extend(true, {}, defaults, options);
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

            const settings = helpers.extend({}, defaults, options);
            const toast = this.show(settings);
            helpers.addClass(toast, 'ga-toast-loading');
            return toast;
        },

        /**
         * Update toast content
         */
        update: function (toastId, options) {
            options = options || {};
            
            const toast = helpers.qs('#' + toastId);
            if (!toast) {
                logEvent('toast:update:not-found', toastId);
                return false;
            }

            if (options.title !== undefined) {
                const title = helpers.qs('.ga-toast-title', toast);
                if (title) {
                    title.textContent = options.title;
                } else if (options.title) {
                    let header = helpers.qs('.ga-toast-header', toast);
                    if (!header) {
                        header = document.createElement('div');
                        header.className = 'ga-toast-header';
                        const content = helpers.qs('.ga-toast-content', toast);
                        content.insertBefore(header, content.firstChild);
                    }
                    const titleEl = document.createElement('h4');
                    titleEl.className = 'ga-toast-title';
                    titleEl.textContent = options.title;
                    header.insertBefore(titleEl, header.firstChild);
                }
            }

            if (options.message !== undefined) {
                const messageEl = helpers.qs('.ga-toast-body', toast);
                if (messageEl) {
                    messageEl.innerHTML = options.message;
                }
            }

            if (options.type) {
                helpers.removeClass(toast, 'ga-toast-success ga-toast-error ga-toast-warning ga-toast-info ga-toast-primary ga-toast-secondary');
                helpers.addClass(toast, 'ga-toast-' + options.type);
            }

            if (options.icon !== undefined) {
                const icon = helpers.qs('.ga-toast-icon', toast);
                if (options.icon) {
                    if (icon) {
                        icon.innerHTML = options.icon;
                    } else {
                        const iconDiv = document.createElement('div');
                        iconDiv.className = 'ga-toast-icon';
                        iconDiv.innerHTML = options.icon;
                        toast.insertBefore(iconDiv, toast.firstChild);
                    }
                } else if (icon) {
                    helpers.remove(icon);
                }
            }

            return true;
        },

        /**
         * Get toast count
         */
        getCount: function (type) {
            if (type) {
                return helpers.qsa('.ga-toast.ga-toast-' + type).length;
            }
            return helpers.qsa('.ga-toast').length;
        },

        /**
         * Clear all toasts
         */
        clear: function (type) {
            const self = this;
            if (type) {
                helpers.qsa('.ga-toast.ga-toast-' + type).forEach(function (toast) {
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
            return !!helpers.qs('#' + toastId);
        },

        /**
         * Get toast by ID
         */
        get: function (toastId) {
            return helpers.qs('#' + toastId);
        },

        /**
         * Set global defaults
         */
        setDefaults: function (defaults) {
            this.globalDefaults = helpers.extend({}, this.globalDefaults || {}, defaults);
        },

        /**
         * Get merged options with global defaults
         */
        getMergedOptions: function (options) {
            return helpers.extend({}, this.globalDefaults || {}, options);
        },

        /**
         * Set external logger callback
         */
        setLogger: function (logger) {
            GaToastsLogger = typeof logger === 'function' ? logger : null;
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
                variant: 'light'
            };
            
            const settings = helpers.extend({}, defaults, options);
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
            
            const settings = helpers.extend({}, defaults, options);
            return this.show(settings);
        }
    };

    // Initialize when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            Toast.init();
        });
    } else {
        Toast.init();
    }

    // Primary global export
    var GaToasts = Toast;
    window.GaToasts = GaToasts;

    // Framework / module support (CommonJS, AMD)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = GaToasts;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return GaToasts;
        });
    }

})();