# Netlify Deployment Guide

This guide explains how to deploy this anime API to Netlify.

## What was changed

1. **Created `netlify.toml`** - Configuration file for Netlify
2. **Created `netlify/functions/api.js`** - Serverless function that handles all API routes
3. **Added `serverless-http` dependency** - Required for converting Express app to serverless function
4. **Updated package.json** - Added the new dependency

## How it works

- **Static files** (HTML, CSS, images) are served from the `public` directory
- **API routes** are handled by the serverless function at `netlify/functions/api.js`
- **All API calls** to `/api/*` are redirected to the serverless function
- **All other routes** fall back to `index.html` for SPA routing

## Deployment Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm install`
   - Set publish directory: `public`
   - Deploy!

## API Endpoints

Your API endpoints will be available at:
- `https://your-site.netlify.app/api/endpoint-name`

For example:
- `https://your-site.netlify.app/api/search?q=naruto`
- `https://your-site.netlify.app/api/anime-info?id=123`

## Troubleshooting

If you still get "Page not found" errors:

1. **Check Netlify logs** - Go to your site's deploy logs in Netlify dashboard
2. **Verify function deployment** - Check if the function is built successfully
3. **Test API endpoints** - Try accessing `/api/search` or other endpoints directly
4. **Check redirects** - Ensure the `netlify.toml` file is in the root directory

## Alternative: Use Render or Railway

If Netlify continues to have issues, consider using:
- **Render** - Better support for Node.js apps
- **Railway** - Easy deployment for Node.js APIs
- **Heroku** - Traditional hosting for Node.js apps

These platforms can run your original `server.js` without modifications. 