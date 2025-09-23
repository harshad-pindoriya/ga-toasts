# Redirect Setup Guide for GA Toasts

## Overview
This guide helps you set up proper redirects to handle www/non-www subdomain issues and prevent duplicate content problems.

## Files Created

### 1. `.htaccess` (Apache Servers)
- **Purpose**: Server-level redirects for Apache web servers
- **Location**: Root directory of your website
- **Features**: 
  - www → non-www redirects
  - HTTP → HTTPS redirects
  - Performance optimizations
  - Security headers

### 2. `_redirects` (Netlify)
- **Purpose**: Redirect configuration for Netlify hosting
- **Location**: Root directory or `public` folder
- **Features**: 
  - www → non-www redirects
  - HTTP → HTTPS redirects
  - Catch-all redirects

### 3. `vercel.json` (Vercel)
- **Purpose**: Redirect configuration for Vercel hosting
- **Location**: Root directory
- **Features**: 
  - Host-based redirects
  - Protocol-based redirects
  - Security headers

### 4. HTML Meta Redirects
- **Purpose**: Client-side fallback redirects
- **Location**: `<head>` section of `index.html`
- **Features**: 
  - JavaScript redirects
  - Meta refresh redirects
  - Comprehensive hostname handling

## Setup Instructions

### For Apache Servers
1. Upload `.htaccess` to your web server root directory
2. Ensure mod_rewrite is enabled
3. Test redirects using online tools

### For Netlify
1. Upload `_redirects` file to your site root
2. Deploy your site
3. Test redirects

### For Vercel
1. Upload `vercel.json` to your project root
2. Deploy your site
3. Test redirects

### For Other Hosting Providers
1. Check your hosting provider's documentation for redirect configuration
2. Use the HTML meta redirects as fallback
3. Consider using a CDN with redirect capabilities

## Testing Your Redirects

### Online Tools
- [Redirect Checker](https://www.redirectchecker.org/)
- [HTTP Status Code Checker](https://httpstatus.io/)
- [SEO Redirect Checker](https://www.seoptimer.com/redirect-checker/)

### Manual Testing
1. Visit `http://www.ga-toasts.com` - should redirect to `https://ga-toasts.com`
2. Visit `https://www.ga-toasts.com` - should redirect to `https://ga-toasts.com`
3. Visit `http://ga-toasts.com` - should redirect to `https://ga-toasts.com`

### Expected Results
- **Status Code**: 301 (Permanent Redirect)
- **Final URL**: `https://ga-toasts.com/`
- **No Redirect Loops**: Should not redirect infinitely

## Troubleshooting

### Common Issues

#### 1. Redirects Not Working
- **Check**: Server supports mod_rewrite (Apache)
- **Check**: File permissions on `.htaccess`
- **Check**: Hosting provider allows custom redirects

#### 2. Infinite Redirect Loops
- **Fix**: Ensure redirect rules don't conflict
- **Fix**: Check for conflicting server configurations
- **Fix**: Verify canonical URL settings

#### 3. HTTPS Issues
- **Check**: SSL certificate is properly installed
- **Check**: HTTPS redirects are enabled
- **Check**: Mixed content warnings

### Debug Steps
1. Check server error logs
2. Use browser developer tools
3. Test with curl commands
4. Verify DNS settings

## DNS Configuration

### Recommended DNS Setup
```
A Record: ga-toasts.com → Your Server IP
CNAME: www.ga-toasts.com → ga-toasts.com
```

### Alternative DNS Setup
```
A Record: ga-toasts.com → Your Server IP
A Record: www.ga-toasts.com → Your Server IP
```

## SEO Considerations

### Benefits of Proper Redirects
- ✅ Prevents duplicate content issues
- ✅ Consolidates link equity
- ✅ Improves search engine rankings
- ✅ Provides consistent user experience

### Best Practices
- Use 301 redirects for permanent redirects
- Preserve query parameters and fragments
- Test redirects regularly
- Monitor for redirect errors

## Support

If you're still experiencing redirect issues:
1. Check your hosting provider's documentation
2. Contact your hosting provider's support
3. Verify DNS configuration
4. Test with different browsers and devices

## Files to Upload

Make sure to upload these files to your web server:
- ✅ `.htaccess` (for Apache servers)
- ✅ `_redirects` (for Netlify)
- ✅ `vercel.json` (for Vercel)
- ✅ Updated `index.html` (for all hosting)

The redirects should work immediately after uploading the appropriate configuration file for your hosting environment.
