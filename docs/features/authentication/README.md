# Authentication System

Multi-provider authentication system with support for OAuth providers and password-based authentication.

## 📋 Overview

This feature provides:
- **Multiple OAuth providers** (Google, GitHub, LinkedIn)
- **Password-based authentication** with email verification
- **Two-factor authentication** support
- **Session management** with configurable timeouts
- **Account linking** for multiple auth methods

## 🚀 Quick Start

### Basic Setup
Authentication is configured as part of the main project setup. See the [Getting Started Guide](../../getting-started/SETUP.md) for initial configuration.

### Supported Providers
- **Google OAuth** - Primary recommended provider
- **GitHub OAuth** - For developer-focused applications
- **LinkedIn OAuth** - For professional networks
- **Password Auth** - Email/password with verification

## 🔧 Configuration

### Environment Variables
```bash
# OAuth Provider Configuration
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
AUTH_LINKEDIN_ID=your_linkedin_client_id
AUTH_LINKEDIN_SECRET=your_linkedin_client_secret

# Password Authentication
AUTH_PASSWORD_ID=password
AUTH_PASSWORD_SECRET=your_password_secret

# General Auth Configuration
AUTH_SECRET=your_auth_secret
AUTH_URL=http://localhost:3000
```

## 🏗️ Architecture

### User Schema
```typescript
users: {
  name?: string,
  email?: string,
  image?: string,
  emailVerified?: number,
  // Custom fields
  firstName?: string,
  lastName?: string,
  profilePicture?: string,
  timezone?: string,
  locale?: string,
  // Security
  twoFactorEnabled?: boolean,
  twoFactorSecret?: string,
  backupCodes?: string[]
}
```

## 📚 Usage Examples

### Getting Current User
```typescript
import { useAuthActions } from "@convex-dev/auth/react";

function MyComponent() {
  const { signIn, signOut } = useAuthActions();
  const user = useCurrentUser();
  
  if (!user) {
    return <button onClick={() => signIn("google")}>Sign In</button>;
  }
  
  return <button onClick={signOut}>Sign Out</button>;
}
```

### Protected Routes
```typescript
import { getAuthUserId } from "@convex-dev/auth/server";

export const protectedFunction = mutation({
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }
    // Protected logic here
  }
});
```

## 🔐 Security Features

- **Secure session management** with JWT tokens
- **Email verification** for password accounts
- **Two-factor authentication** support
- **Account linking** prevention of duplicate accounts
- **Session timeout** configuration per organization

## 📈 Roadmap

### Planned Features
- [ ] Social login improvements
- [ ] Advanced 2FA options (TOTP, SMS)
- [ ] Single Sign-On (SSO) integration
- [ ] Advanced session management

---

**Note**: This feature is part of the core system setup. For detailed implementation, see the main [Getting Started Guide](../../getting-started/SETUP.md).