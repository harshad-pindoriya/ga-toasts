/**
 * Toast component JavaScript for Genie AI Plugin
 * Defines toast functionality and interactions
 */

(function ($) {
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
            var self = this;

            // Close toast triggers
            $(document).on('click', '[data-ga-toast-close], .ga-toast-close', function (e) {
                e.preventDefault();
                var toastId = $(this).data('ga-toast-close');
                if (toastId) {
                    self.close('#' + toastId);
                } else {
                    self.close($(this).closest('.ga-toast'));
                }
            });

            // Auto-close toasts with pause on hover
            $(document).on('ga:toast:shown', '.ga-toast', function () {
                var $toast = $(this);
                var autoClose = $toast.data('ga-auto-close');
                var pauseOnHover = $toast.data('ga-pause-on-hover');
                var $progress = $toast.find('.ga-toast-progress');
                
                if (autoClose && autoClose > 0) {
                    var timeoutId;
                    var startTime = Date.now();
                    var remainingTime = autoClose;
                    
                    var startCountdown = function() {
                        startTime = Date.now();
                        timeoutId = setTimeout(function () {
                            if ($toast.length && !$toast.hasClass('hide')) {
                                self.close($toast);
                            }
                        }, remainingTime);
                    };
                    
                    // Start initial countdown
                    startCountdown();
                    
                    // Pause on hover if enabled
                    if (pauseOnHover) {
                        $toast.on('mouseenter', function() {
                            var elapsed = Date.now() - startTime;
                            remainingTime = Math.max(0, remainingTime - elapsed);
                            clearTimeout(timeoutId);
                            $toast.addClass('ga-toast-paused');
                            
                            // Pause progress bar animation
                            if ($progress.length) {
                                var currentTransform = $progress.css('transform');
                                $progress.css('transition', 'none');
                                $progress.attr('data-paused-transform', currentTransform);
                            }
                        });
                        
                        $toast.on('mouseleave', function() {
                            $toast.removeClass('ga-toast-paused');
                            
                            // Resume progress bar animation
                            if ($progress.length) {
                                $progress.css('transition', 'transform ' + remainingTime + 'ms linear');
                                $progress.css('transform', 'scaleX(0)');
                            }
                            
                            startCountdown();
                        });
                    }
                }
            });

            // Handle toast click to close (optional)
            $(document).on('click', '.ga-toast[data-ga-click-to-close="true"]', function (e) {
                if (!$(e.target).closest('.ga-toast-actions, .ga-toast-close').length) {
                    self.close($(this));
                }
            });
        },

        /**
         * Initialize default container
         */
        initDefaultContainer: function () {
            if ($('.ga-container').length > 0) {
                // Create default container if it doesn't exist
                this.getContainer('top-end');
            }
        },

        /**
         * Show toast
         */
        show: function (options) {
            var defaults = {
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

            var settings = $.extend({}, defaults, options);

            var $toast = this.create(settings);
            var $container = this.getContainer(settings.position);

            $container.append($toast);

            // Trigger animation after a small delay to ensure DOM is ready
            setTimeout(function () {
                $toast.addClass('show');
                $toast.trigger('ga:toast:shown');
            }, 10);

            GenieAI.utils.log('Toast shown', settings);

            return $toast;
        },

        /**
         * Create toast element
         */
        /**
   * Create toast element
   */
        create: function (options) {
            // Ensure options is an object
            options = options || {};
            
            var classes = ['ga-toast', 'ga-toast-' + options.type];

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

            var $toast = $('<div class="' + classes.join(' ') + '" id="' + options.id + '">');

            // Add click to close attribute
            if (options.clickToClose) {
                $toast.attr('data-ga-click-to-close', 'true');
            }

            // Add pause on hover attribute
            if (options.pauseOnHover) {
                $toast.attr('data-ga-pause-on-hover', 'true');
            }

            // Create content wrapper
            var $content = $('<div class="ga-toast-content">');

            // Add header if title, closable, or icon exists
            if (options.title || options.closable || options.icon) {
                var $header = $('<div class="ga-toast-header">');

                // Left section (icon + title)
                var $left = $('<div class="ga-toast-header-left">');
                if (options.icon) {
                    var $icon = $('<div class="ga-toast-icon">' + options.icon + '</div>');
                    $left.append($icon);
                }
                if (options.title) {
                    $left.append('<h4 class="ga-toast-title">' + this.escapeHtml(options.title) + '</h4>');
                }
                $header.append($left);

                // Right section (close button)
                if (options.closable) {
                    $header.append('<button type="button" class="ga-toast-close" aria-label="Close" data-ga-toast-close></button>');
                }

                $content.append($header);
            }

            // Add body if message exists
            if (options.message) {
                var $body = $('<div class="ga-toast-body">' + options.message + '</div>');
                $content.append($body);
            }

            // Add actions if they exist
            if (options.actions && options.actions.length > 0) {
                var $actions = $('<div class="ga-toast-actions">');
                var self = this;

                options.actions.forEach(function (action) {
                    var btnClasses = ['ga-btn', 'ga-btn-sm'];
                    if (action.class) {
                        btnClasses.push(action.class);
                    } else {
                        btnClasses.push('ga-btn-secondary');
                    }

                    var $btn = $('<button type="button" class="' + btnClasses.join(' ') + '">' +
                        self.escapeHtml(action.text) + '</button>');

                    if (action.click) {
                        $btn.on('click', function (e) {
                            action.click(e, $toast);
                        });
                    }

                    $actions.append($btn);
                });

                $content.append($actions);
            }

            $toast.append($content);

            // Add progress bar if enabled
            if (options.progress && options.duration && options.duration > 0) {
                var $progress = $('<div class="ga-toast-progress ga-toast-progress-' + options.type + '"></div>');
                $progress.css({
                    'width': '100%',
                    'transform': 'scaleX(1)',
                    'transform-origin': 'left center'
                });
                $toast.append($progress);

                // Animate progress bar with smooth countdown
                setTimeout(function () {
                    $progress.css({
                        'transition': 'transform ' + options.duration + 'ms linear',
                        'transform': 'scaleX(0)'
                    });
                }, 10);
            }

            // Add background fill with opacity if enabled
            if (options.progressBackground && options.duration && options.duration > 0) {
                var $backgroundFill = $('<div class="ga-toast-background-fill ga-toast-bg-' + options.type + '"></div>');
                $toast.append($backgroundFill);

                // Animate background fill
                setTimeout(function () {
                    $backgroundFill.css({
                        'transition': 'opacity ' + options.duration + 'ms linear',
                        'opacity': '0'
                    });
                }, 10);
            }

            // Add auto-close data
            if (options.duration && options.duration > 0) {
                $toast.data('ga-auto-close', options.duration);
            }

            return $toast;
        },


        /**
         * Close toast
         */
        close: function (toast) {
            var $toast = $(toast);
            if ($toast.length === 0 || $toast.hasClass('hide')) {
                return;
            }

            // Remove any active timeouts and hover events
            $toast.off('mouseenter mouseleave');
            $toast.removeClass('ga-toast-paused');

            $toast.removeClass('show').addClass('hide');

            var removeDelay = 300; // Match CSS transition duration

            setTimeout(function () {
                if ($toast.length) {
                    $toast.trigger('ga:toast:closed');
                    $toast.remove();
                }
            }, removeDelay);

            GenieAI.utils.log('Toast closed', $toast.attr('id'));
        },

        /**
         * Close all toasts
         */
        closeAll: function () {
            var self = this;
            $('.ga-toast').each(function () {
                self.close($(this));
            });
        },

        /**
         * Get or create container by position
         */
        getContainer: function (position) {
            var containerId = 'ga-toast-container-' + position;
            var $container = $('#' + containerId);

            if ($container.length === 0) {
                $container = $('<div id="' + containerId + '" class="ga-toast-container ga-toast-container-' + position + '"></div>');

                // Try to append to ga-container first, then body
                if ($('.ga-container').length > 0) {
                    $('.ga-container').append($container);
                } else {
                    $('body').append($container);
                }
            }

            return $container;
        },

        /**
         * Show success toast
         */
        success: function (message, options) {
            var settings = $.extend({}, options || {}, {
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
            var settings = $.extend({}, options || {}, {
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
            var settings = $.extend({}, options || {}, {
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
            var settings = $.extend({}, options || {}, {
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
            var self = this;
            var defaults = {
                type: 'warning',
                message: message,
                duration: 0, // Don't auto-close confirmation toasts
                closable: false,
                actions: [
                    {
                        text: 'Cancel',
                        class: 'ga-btn-secondary',
                        click: function (e, $toast) {
                            self.close($toast);
                            if (options && options.onCancel) {
                                options.onCancel();
                            }
                        }
                    },
                    {
                        text: 'Confirm',
                        class: 'ga-btn-primary',
                        click: function (e, $toast) {
                            self.close($toast);
                            if (options && options.onConfirm) {
                                options.onConfirm();
                            }
                        }
                    }
                ]
            };

            var settings = $.extend(true, {}, defaults, options);
            return this.show(settings);
        },

        /**
         * Show loading toast
         */
        loading: function (message, options) {
            var defaults = {
                type: 'info',
                message: message || 'Loading...',
                closable: false,
                duration: 0,
                icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="ga-spin"/></svg>'
            };

            var settings = $.extend({}, defaults, options);
            var $toast = this.show(settings);
            $toast.addClass('ga-toast-loading');
            return $toast;
        },

        /**
         * Update toast content
         */
        update: function (toastId, options) {
            // Ensure options is an object
            options = options || {};
            
            var $toast = $('#' + toastId);
            if ($toast.length === 0) {
                GenieAI.utils.log('Toast not found for update: ' + toastId);
                return false;
            }

            if (options.title !== undefined) {
                var $title = $toast.find('.ga-toast-title');
                if ($title.length > 0) {
                    $title.html(this.escapeHtml(options.title));
                } else if (options.title) {
                    // Add title if it doesn't exist
                    var $header = $toast.find('.ga-toast-header');
                    if ($header.length === 0) {
                        $header = $('<div class="ga-toast-header">');
                        $toast.find('.ga-toast-content').prepend($header);
                    }
                    $header.prepend('<h4 class="ga-toast-title">' + this.escapeHtml(options.title) + '</h4>');
                }
            }

            if (options.message !== undefined) {
                var $message = $toast.find('.ga-toast-body');
                if ($message.length > 0) {
                    $message.html(options.message);
                }
            }

            if (options.type) {
                $toast.removeClass('ga-toast-success ga-toast-error ga-toast-warning ga-toast-info ga-toast-primary ga-toast-secondary')
                    .addClass('ga-toast-' + options.type);
            }

            if (options.icon !== undefined) {
                var $icon = $toast.find('.ga-toast-icon');
                if (options.icon) {
                    if ($icon.length > 0) {
                        $icon.html(options.icon);
                    } else {
                        $toast.prepend('<div class="ga-toast-icon">' + options.icon + '</div>');
                    }
                } else {
                    $icon.remove();
                }
            }

            return true;
        },

        /**
         * Get toast count
         */
        getCount: function (type) {
            if (type) {
                return $('.ga-toast.ga-toast-' + type).length;
            }
            return $('.ga-toast').length;
        },

        /**
         * Clear all toasts
         */
        clear: function (type) {
            var self = this;
            if (type) {
                $('.ga-toast.ga-toast-' + type).each(function () {
                    self.close($(this));
                });
            } else {
                this.closeAll();
            }
        },

        /**
         * Check if toast exists
         */
        exists: function (toastId) {
            return $('#' + toastId).length > 0;
        },

        /**
         * Get toast by ID
         */
        get: function (toastId) {
            return $('#' + toastId);
        },

        /**
         * Escape HTML to prevent XSS
         */
        escapeHtml: function (text) {
            if (typeof text !== 'string') {
                return text;
            }
            var map = {
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
            this.globalDefaults = $.extend({}, this.globalDefaults || {}, defaults);
        },

        /**
         * Get merged options with global defaults
         */
        getMergedOptions: function (options) {
            return $.extend({}, this.globalDefaults || {}, options);
        },

        /**
         * Show modern toast with enhanced styling
         */
        modern: function (message, options) {
            var defaults = {
                message: message,
                progress: true,
                progressBackground: true,
                pauseOnHover: true,
                glassmorphism: true,
                animation: 'slide',
                size: 'md',
                variant: 'filled'
            };
            
            var settings = $.extend({}, defaults, options);
            return this.show(settings);
        },

        /**
         * Show notification with modern styling
         */
        notification: function (title, message, options) {
            var defaults = {
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
            
            var settings = $.extend({}, defaults, options);
            return this.show(settings);
        }
    };

    // Initialize when document is ready
    $(document).ready(function () {
        GenieAI.Toast.init();
    });

    // Export for global access
    window.GenieAIToast = GenieAI.Toast;

})(jQuery);