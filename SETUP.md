# Multi-Tenant SaaS Template Setup

This guide will help you set up the authentication environment for the multi-tenant SaaS template.

## Quick Setup

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Set up environment variables automatically
npm run setup:env

# Start development with Convex
npm run setup:dev
```

### 2. Manual Setup (Alternative)
If you prefer to set up manually:

```bash
# Initialize Convex
npx convex dev

# Run the setup script
npm run setup:env
```

## Environment Variables

The setup script automatically configures these environment variables:

### Required (Auto-generated)
- `SITE_URL` - Site URL for OAuth redirects (default: http://localhost:3000)
- `JWT_PRIVATE_KEY` - Auto-generated private key for JWT signing
- `JWKS` - Auto-generated JSON Web Key Set for JWT verification

### Optional OAuth (Placeholders)
- `AUTH_GOOGLE_ID` - Google OAuth Client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth Client Secret  
- `AUTH_LINKEDIN_ID` - LinkedIn OAuth Client ID
- `AUTH_LINKEDIN_SECRET` - LinkedIn OAuth Client Secret
- `AUTH_GITHUB_ID` - GitHub OAuth Client ID
- `AUTH_GITHUB_SECRET` - GitHub OAuth Client Secret

## Setting Up OAuth Providers

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URI: `https://your-convex-site.convex.site/api/auth/callback/google`
6. Update environment variables:
   ```bash
   npx convex env set AUTH_GOOGLE_ID your_google_client_id
   npx convex env set AUTH_GOOGLE_SECRET your_google_client_secret
   ```

### LinkedIn OAuth Setup
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Add "Sign In with LinkedIn" product
4. Set authorized redirect URL: `https://your-convex-site.convex.site/api/auth/callback/linkedin`
5. Update environment variables:
   ```bash
   npx convex env set AUTH_LINKEDIN_ID your_linkedin_client_id
   npx convex env set AUTH_LINKEDIN_SECRET your_linkedin_client_secret
   ```

### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `https://your-convex-site.convex.site/api/auth/callback/github`
4. Update environment variables:
   ```bash
   npx convex env set AUTH_GITHUB_ID your_github_client_id
   npx convex env set AUTH_GITHUB_SECRET your_github_client_secret
   ```

## Production Deployment

For production deployment, update the SITE_URL:
```bash
npx convex env set SITE_URL https://your-production-domain.com
```

## Troubleshooting

### Environment Variable Issues
- Check existing variables: `npx convex env list`
- Get specific variable: `npx convex env get VARIABLE_NAME`
- Set variable manually: `npx convex env set VARIABLE_NAME "value"`

### Authentication Issues
- Ensure JWT_PRIVATE_KEY is set correctly
- Verify SITE_URL matches your domain
- Check OAuth credentials are correct

### Schema Issues
- Deploy schema: `npx convex dev --once`
- Check tables in Convex dashboard
- Verify auth tables are created

## Available Scripts

- `npm run setup:env` - Set up environment variables
- `npm run setup:dev` - Full setup + start development
- `npm run dev` - Start Next.js development server
- `npx convex dev` - Start Convex development server

## Next Steps

After setup:
1. Test email/password authentication
2. Configure OAuth providers (optional)
3. Customize user schema as needed
4. Implement additional SaaS features

## Support

For issues with:
- Convex: [Convex Documentation](https://docs.convex.dev/)
- Convex Auth: [Convex Auth Documentation](https://labs.convex.dev/auth)
- Next.js: [Next.js Documentation](https://nextjs.org/docs)