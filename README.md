# 🍞 GA Toasts

A modern, accessible, and feature-rich toast notification library for web applications. Built with vanilla JavaScript and jQuery, GA Toasts provides beautiful, customizable notifications with smooth animations and excellent user experience.

![GA Toasts Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![jQuery](https://img.shields.io/badge/jQuery-3.7.1-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Size](https://img.shields.io/badge/Size-~15KB-orange)

## ✨ Features

- 🎨 **Modern Design** - Beautiful glassmorphism effects, gradients, and smooth animations
- ♿ **Accessible** - Built with accessibility in mind, supporting screen readers and keyboard navigation
- 📱 **Responsive** - Fully responsive design that works on all device sizes
- 🎭 **Multiple Variants** - Support for filled, light, and default variants
- ⚡ **Performance** - Lightweight and optimized for performance
- 🔧 **Customizable** - Highly customizable with CSS variables and themes
- 🎯 **Multiple Positions** - 9 different positioning options
- 🎪 **Animation Effects** - Fade, slide, bounce, and scale animations
- ⏱️ **Smart Timing** - Auto-close with pause on hover functionality
- 📊 **Progress Indicators** - Visual progress bars and background fills
- 🎨 **Theme Support** - Light, dark, and system theme modes
- 🔄 **Toast Management** - Update, close, and manage multiple toasts

## 🚀 Quick Start

### Installation

1. **Download the files:**
   ```bash
   # Clone or download the repository
   git clone https://github.com/your-username/ga-toasts.git
   cd ga-toasts
   ```

2. **Include dependencies:**
   ```html
   <!-- jQuery (required) -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
   
   <!-- GA Toasts CSS -->
   <link rel="stylesheet" href="variables.css">
   <link rel="stylesheet" href="toasts.css">
   
   <!-- GA Toasts JavaScript -->
   <script src="toasts.js"></script>
   ```

   **Note:** jQuery is required for GA Toasts to function. The library will automatically initialize the `GenieAI` global object if it doesn't exist.

3. **Initialize (optional):**
   ```javascript
   // Auto-initializes on document ready
   // Manual initialization if needed
   GenieAI.Toast.init();
   
   // Alternative access via global alias
   GenieAIToast.success('Hello World!');
   ```

### Basic Usage

```javascript
// Simple success toast (title is required)
GenieAI.Toast.success('Operation completed successfully!', { title: 'Success' });

// Simple error toast (title is required)
GenieAI.Toast.error('Something went wrong!', { title: 'Error' });

// Simple warning toast (title is required)
GenieAI.Toast.warning('Please check your input', { title: 'Warning' });

// Simple info toast (title is required)
GenieAI.Toast.info('Here is some information', { title: 'Info' });

// Custom toast (title is required)
GenieAI.Toast.show({
    title: 'Custom Toast',
    message: 'This is a custom toast notification',
    type: 'info',
    duration: 5000
});
```

## 📚 API Reference

### Core Methods

#### `GenieAI.Toast.show(options)`

Creates and displays a toast notification.

**Parameters:**
- `options` (Object) - Configuration object

**Options:**
```javascript
{
    id: 'unique-id',                    // Unique identifier
    title: 'Toast Title',               // Toast title (REQUIRED)
    message: 'Toast message',           // Toast message content (optional)
    type: 'info',                       // Toast type: 'success', 'error', 'warning', 'info', 'primary', 'secondary'
    duration: 5000,                     // Auto-close duration in ms (0 = no auto-close)
    closable: true,                     // Show close button
    position: 'top-end',                // Position: 'top-start', 'top-center', 'top-end', 'middle-start', 'middle-center', 'middle-end', 'bottom-start', 'bottom-center', 'bottom-end'
    icon: '<svg>...</svg>',             // Custom icon HTML
    actions: [],                        // Action buttons array
    size: 'md',                         // Size: 'xs', 'sm', 'md', 'lg', 'xl'
    variant: '',                        // Variant: '', 'filled', 'light'
    animation: 'slide',                 // Animation: 'fade', 'slide', 'bounce', 'scale'
    clickToClose: false,                // Close on click
    progress: true,                     // Show progress bar
    progressBackground: true,           // Show background fill
    pauseOnHover: true,                 // Pause countdown on hover
    glassmorphism: true                 // Enable glassmorphism effect
}
```

#### `GenieAI.Toast.success(message, options)`

Creates a success toast.

```javascript
GenieAI.Toast.success('Operation completed!', {
    title: 'Success',
    duration: 3000,
    position: 'top-center'
});
```

#### `GenieAI.Toast.error(message, options)`

Creates an error toast.

```javascript
GenieAI.Toast.error('Something went wrong!', {
    title: 'Error',
    duration: 8000,
    closable: true
});
```

#### `GenieAI.Toast.warning(message, options)`

Creates a warning toast.

```javascript
GenieAI.Toast.warning('Please check your input', {
    title: 'Warning',
    duration: 6000
});
```

#### `GenieAI.Toast.info(message, options)`

Creates an info toast.

```javascript
GenieAI.Toast.info('Here is some information', {
    title: 'Info',
    duration: 4000
});
```

#### `GenieAI.Toast.confirm(message, options)`

Creates a confirmation toast with action buttons.

```javascript
GenieAI.Toast.confirm('Are you sure you want to delete this item?', {
    onConfirm: function() {
        console.log('Confirmed');
    },
    onCancel: function() {
        console.log('Cancelled');
    }
});
```

#### `GenieAI.Toast.loading(message, options)`

Creates a loading toast.

```javascript
const loadingToast = GenieAI.Toast.loading('Processing...');

// Close when done
setTimeout(() => {
    GenieAI.Toast.close(loadingToast);
    GenieAI.Toast.success('Done!');
}, 3000);
```

### Management Methods

#### `GenieAI.Toast.close(toast)`

Closes a specific toast.

```javascript
const toast = GenieAI.Toast.show({ message: 'Test' });
GenieAI.Toast.close(toast);
// or
GenieAI.Toast.close('#toast-id');
```

#### `GenieAI.Toast.closeAll()`

Closes all visible toasts.

```javascript
GenieAI.Toast.closeAll();
```

#### `GenieAI.Toast.clear(type)`

Clears all toasts of a specific type.

```javascript
GenieAI.Toast.clear('error'); // Clear only error toasts
GenieAI.Toast.clear();        // Clear all toasts
```

#### `GenieAI.Toast.update(toastId, options)`

Updates an existing toast.

```javascript
const toast = GenieAI.Toast.show({
    id: 'updateable-toast',
    message: 'Initial message',
    type: 'info'
});

// Update after 2 seconds
setTimeout(() => {
    GenieAI.Toast.update('updateable-toast', {
        message: 'Updated message!',
        type: 'success'
    });
}, 2000);
```

#### `GenieAI.Toast.getCount(type)`

Gets the count of visible toasts.

```javascript
const totalCount = GenieAI.Toast.getCount();
const errorCount = GenieAI.Toast.getCount('error');
```

#### `GenieAI.Toast.exists(toastId)`

Checks if a toast exists.

```javascript
if (GenieAI.Toast.exists('my-toast')) {
    console.log('Toast exists');
}
```

#### `GenieAI.Toast.get(toastId)`

Gets a toast element by ID.

```javascript
const toast = GenieAI.Toast.get('my-toast');
```

### Utility Methods

#### `GenieAI.Toast.modern(message, options)`

Creates a modern-styled toast with enhanced features.

```javascript
GenieAI.Toast.modern('Modern toast with enhanced styling!', {
    type: 'success',
    glassmorphism: true
});
```

#### `GenieAI.Toast.notification(title, message, options)`

Creates a notification-style toast.

```javascript
GenieAI.Toast.notification('New Message', 'You have a new message from John', {
    type: 'info',
    duration: 5000
});
```

#### `GenieAI.Toast.setDefaults(defaults)`

Sets global default options.

```javascript
GenieAI.Toast.setDefaults({
    position: 'top-center',
    duration: 3000,
    animation: 'fade'
});
```

## 🎨 Customization

### CSS Variables

GA Toasts uses CSS custom properties for easy theming:

```css
:root {
    /* Colors */
    --ga-primary: #0073aa;
    --ga-success: #00a32a;
    --ga-error: #d63638;
    --ga-warning: #dba617;
    --ga-info: #72aee6;
    
    /* Spacing */
    --ga-space-sm: 8px;
    --ga-space-md: 16px;
    --ga-space-lg: 24px;
    
    /* Typography */
    --ga-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --ga-text-sm: 14px;
    --ga-text-base: 16px;
    
    /* Animations */
    --ga-duration-300: 300ms;
    --ga-ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

### Themes

#### Light Theme (Default)
```html
<html data-ga-theme="light">
```

#### Dark Theme
```html
<html data-ga-theme="dark">
```

#### System Theme
```html
<html data-ga-theme="system">
```

### Custom Styling

```css
/* Custom toast styles */
.ga-toast.my-custom-toast {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: 2px solid #fff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.ga-toast.my-custom-toast .ga-toast-title {
    color: white;
    font-weight: 700;
}

.ga-toast.my-custom-toast .ga-toast-body {
    color: rgba(255, 255, 255, 0.9);
}
```

## 📱 Responsive Design

GA Toasts automatically adapts to different screen sizes:

- **Desktop**: Full-width toasts with all features
- **Tablet**: Optimized spacing and sizing
- **Mobile**: Full-width toasts with simplified layout

### Mobile Optimizations

- Touch-friendly close buttons
- Optimized spacing for small screens
- Simplified animations for better performance
- Stacked layout for multiple toasts

## ♿ Accessibility

GA Toasts is built with accessibility in mind:

- **Screen Reader Support**: Proper ARIA labels and roles
- **Keyboard Navigation**: Full keyboard support
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Proper focus handling

### Accessibility Features

```javascript
// Toast with proper ARIA attributes
GenieAI.Toast.show({
    message: 'Important notification',
    type: 'error',
    role: 'alert',  // For screen readers
    duration: 0     // Don't auto-close important messages
});
```

## 🎪 Animation Effects

### Built-in Animations

1. **Fade** - Smooth opacity transition
2. **Slide** - Slides in from the side
3. **Bounce** - Bouncy entrance effect
4. **Scale** - Scales up from center

### Custom Animations

```css
/* Custom shake animation */
.ga-toast-shake {
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
}
```

## 🔧 Advanced Usage

### Action Buttons

```javascript
GenieAI.Toast.show({
    message: 'File uploaded successfully!',
    type: 'success',
    actions: [
        {
            text: 'View File',
            class: 'ga-btn-primary',
            click: function(e, toast) {
                // Handle view action
                window.open('/file.pdf');
                GenieAI.Toast.close(toast);
            }
        },
        {
            text: 'Dismiss',
            class: 'ga-btn-secondary',
            click: function(e, toast) {
                GenieAI.Toast.close(toast);
            }
        }
    ]
});
```

### Custom Icons

```javascript
GenieAI.Toast.show({
    message: 'Custom icon toast',
    type: 'info',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
});
```

### Progress Indicators

```javascript
// Toast with progress bar
GenieAI.Toast.show({
    message: 'Processing...',
    type: 'info',
    progress: true,
    duration: 5000
});

// Toast with background fill
GenieAI.Toast.show({
    message: 'Uploading file...',
    type: 'primary',
    progressBackground: true,
    duration: 10000
});
```

### Toast Stacks

```javascript
// Show multiple toasts in a stack
for (let i = 1; i <= 5; i++) {
    setTimeout(() => {
        GenieAI.Toast.show({
            message: `Stacked toast ${i}`,
            type: 'info',
            size: 'sm'
        });
    }, i * 200);
}
```

## 🌐 Browser Support

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+
- **IE** 11+ (with polyfills)

## 📦 File Structure

```
ga-toasts/
├── index.html          # Interactive demo page
├── README.md           # This documentation
├── variables.css       # CSS custom properties
├── toasts.css         # Main toast styles
└── toasts.js          # JavaScript functionality
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- jQuery team for the excellent library
- Modern CSS features for beautiful styling
- Web accessibility guidelines for inclusive design
- Open source community for inspiration

---

Made with ❤️ by the GA Toasts team
