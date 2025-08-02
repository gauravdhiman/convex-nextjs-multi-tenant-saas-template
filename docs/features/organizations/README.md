# Organization Management

Multi-tenant organization system with role-based access control, user invitations, and team management.

## 📋 Overview

This feature provides:
- **Multi-tenant organization isolation** with secure data separation
- **Role-based access control** (Owner, Admin, Member, Viewer)
- **User invitation system** with email-based invites
- **Team management** with member permissions
- **Organization settings** and configuration

## 🚀 Quick Start

### Creating Organizations
Organizations are created during user onboarding or can be created by existing users with proper permissions.

### User Roles
- **Owner**: Full administrative access, billing management
- **Admin**: User management, billing access, organization settings
- **Member**: Standard access to organization resources
- **Viewer**: Read-only access to organization data

## 🏗️ Architecture

### Database Schema

#### Organizations Table
```typescript
organizations: {
  name: string,
  slug: string,                    // URL-friendly identifier
  description?: string,
  website?: string,
  logo?: string,
  isActive: boolean,
  stripeCustomerId?: string,       // For billing integration
  settings: {
    allowUserInvites: boolean,
    requireEmailVerification: boolean,
    sessionTimeout: number,
    maxUsers?: number
  },
  contactEmail?: string,
  contactPhone?: string,
  address?: Address
}
```

#### Organization Members Table
```typescript
organizationMembers: {
  userId: Id<"users">,
  organizationId: Id<"organizations">,
  role: "owner" | "admin" | "member" | "viewer",
  isActive: boolean,
  invitedAt?: number,
  joinedAt?: number,
  invitedBy?: Id<"users">
}
```

#### Invitations Table
```typescript
invitations: {
  email: string,
  organizationId: Id<"organizations">,
  role: "admin" | "member" | "viewer",
  invitedBy: Id<"users">,
  token: string,
  status: "pending" | "accepted" | "expired" | "cancelled",
  expiresAt: number
}
```

## 🔧 Implementation

### Creating an Organization
```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function CreateOrgForm() {
  const createOrg = useMutation(api.organizations.createOrganization);
  
  const handleSubmit = async (formData) => {
    await createOrg({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      ownerId: currentUserId
    });
  };
}
```

### Checking User Permissions
```typescript
// In Convex functions
const membership = await ctx.db
  .query("organizationMembers")
  .withIndex("by_user_organization", (q) => 
    q.eq("userId", userId).eq("organizationId", organizationId)
  )
  .filter((q) => q.eq(q.field("isActive"), true))
  .first();

if (!membership || !["owner", "admin"].includes(membership.role)) {
  throw new ConvexError("Insufficient permissions");
}
```

### Inviting Users
```typescript
const inviteUser = useMutation(api.invitations.createInvitation);

await inviteUser({
  email: "user@example.com",
  organizationId: currentOrgId,
  role: "member"
});
```

## 🔐 Security Features

### Data Isolation
- **Organization-scoped queries** ensure data separation
- **Membership validation** on all organization operations
- **Role-based authorization** for sensitive operations

### Permission Levels
```typescript
// Permission hierarchy (higher includes lower)
const PERMISSIONS = {
  viewer: ["read"],
  member: ["read", "write"],
  admin: ["read", "write", "manage_users", "billing"],
  owner: ["read", "write", "manage_users", "billing", "admin"]
};
```

## 📊 Usage Patterns

### Organization Context
```typescript
// Get user's organizations
const organizations = useQuery(api.organizations.getUserOrganizations);

// Get current organization members
const members = useQuery(api.organizations.getOrganizationMembers, {
  organizationId: currentOrgId
});
```

### Role-Based UI
```typescript
function AdminOnlyFeature({ organizationId }) {
  const membership = useQuery(api.organizations.getUserMembership, {
    organizationId
  });
  
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return <div>Access denied</div>;
  }
  
  return <AdminPanel />;
}
```

## 🧪 Testing

### Test Scenarios
1. **Organization Creation**: Create new organization with valid slug
2. **User Invitations**: Send and accept invitations
3. **Role Management**: Change user roles and verify permissions
4. **Data Isolation**: Ensure users can't access other organizations' data

## 🔄 Integration Points

### With Authentication
- Organizations are created after user authentication
- User sessions include organization context
- Role information is included in auth tokens

### With Billing System
- Organizations are linked to Stripe customers
- Billing permissions are role-based
- Subscription limits apply per organization

## 📈 Roadmap

### Planned Features
- [ ] Organization templates
- [ ] Advanced permission system
- [ ] Organization analytics
- [ ] Bulk user management
- [ ] Organization transfer capabilities

## 🛠️ Customization

### Adding Custom Roles
1. Update the role union type in schema
2. Add role to permission checks
3. Update UI components for new role

### Organization Settings
Extend the settings object in the organizations table to add custom configuration options.

---

**Integration**: This feature works closely with [Authentication](../authentication/README.md) and [Subscription Billing](../subscription-billing/README.md) systems.