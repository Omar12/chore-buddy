# Chore Buddy Database Schema

This document describes the database schema for Chore Buddy.

## Overview

The database is designed with the following principles:
- **Family isolation**: Each family's data is completely isolated from other families
- **Application-level authorization**: Server actions verify family membership before performing operations
- **Referential integrity**: Foreign keys maintain data consistency
- **Audit trails**: Created/updated timestamps on all major entities

The schema is defined in `prisma/schema.prisma` and managed via Prisma ORM with SQLite.

## Entity Relationship Diagram

```
users (NextAuth.js managed)
  ↓
families (one user can own one family)
  ↓
profiles (family members: adults and kids)
  ↓
├─→ chores (assigned to profiles)
│     ↓
│   chore_comments
│
├─→ rewards (family reward catalog)
│     ↓
│   reward_redemptions
│
└─→ points_transactions (tracks all point changes)
```

## Models

### User
Stores adult accounts with hashed passwords. Managed by NextAuth.js Credentials provider.

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | CUID identifier |
| email | String | User email (unique) |
| hashedPassword | String | bcrypt-hashed password |
| createdAt | DateTime | Account creation time |
| updatedAt | DateTime | Last update time |

### Family
Represents a family unit. Each family is owned by one user (the creator).

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | CUID identifier |
| name | String | Family name |
| ownerId | String (FK) | References User |
| createdAt | DateTime | Family creation time |
| updatedAt | DateTime | Last update time |

### Profile
Represents individual family members (both adults and kids). Adults link to user accounts, kids do not.

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | CUID identifier |
| familyId | String (FK) | References Family |
| userId | String? (FK) | References User - null for kids |
| name | String | Display name |
| avatarUrl | String? | Profile picture URL |
| role | String | 'owner', 'parent', 'helper', 'kid' |
| pinCode | String? | PIN for switching to adult mode |
| createdAt | DateTime | Profile creation time |
| updatedAt | DateTime | Last update time |

**Profile Roles:**
- `owner`: Family creator, full permissions
- `parent`: Co-parent, same permissions as owner (except billing in future)
- `helper`: Grandparent or accountability partner, same permissions as parent
- `kid`: Child profile, limited permissions

### Chore
Tasks assigned to kid profiles by adults.

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | CUID identifier |
| familyId | String (FK) | References Family |
| assignedToProfileId | String (FK) | References Profile |
| title | String | Chore title |
| description | String? | Optional description |
| pointsValue | Int | Points earned on completion |
| dueDate | String? | Due date |
| recurrenceRule | String? | RRULE format (future feature) |
| status | String | Current chore status |
| createdByProfileId | String (FK) | References Profile |
| createdAt | DateTime | Chore creation time |
| updatedAt | DateTime | Last update time |

**Chore Status Flow:**
1. `not_started` → Kid hasn't started
2. `in_progress` → Kid clicked "On it"
3. `done` / `pending_review` → Kid clicked "Done", awaiting parent review
4. `completed` → Parent approved, points awarded
5. Can also go back to `not_started` or `in_progress` if parent rejects

### ChoreComment
Comments on chores (e.g., "We ran out of dog food bags").

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | CUID identifier |
| choreId | String (FK) | References Chore |
| profileId | String (FK) | Comment author |
| comment | String | Comment content |
| createdAt | DateTime | Comment time |

### Reward
Family reward catalog. Adults create rewards that kids can redeem with points.

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | CUID identifier |
| familyId | String (FK) | References Family |
| name | String | Reward name |
| description | String? | Optional description |
| pointsCost | Int | Points required |
| isActive | Boolean | Whether reward is available |
| createdAt | DateTime | Reward creation time |
| updatedAt | DateTime | Last update time |

### RewardRedemption
Tracks reward redemption requests and their status.

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | CUID identifier |
| rewardId | String (FK) | References Reward |
| profileId | String (FK) | Kid requesting redemption |
| status | String | Redemption status |
| requestedAt | DateTime | Request time |
| resolvedAt | DateTime? | Resolution time |
| resolvedByProfileId | String? (FK) | Parent who resolved |

**Redemption Status:**
- `requested` → Kid requested redemption
- `approved` → Parent approved (ready to redeem)
- `redeemed` → Parent marked as redeemed, points deducted
- `rejected` → Parent rejected request

### PointsTransaction
Ledger of all point changes for kid profiles. Used to calculate current balance.

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | CUID identifier |
| profileId | String (FK) | Kid profile |
| amount | Int | Points change (+ or -) |
| reason | String | Transaction type |
| relatedChoreId | String? (FK) | Related chore if applicable |
| relatedRedemptionId | String? (FK) | Related redemption if applicable |
| notes | String? | Optional notes |
| createdByProfileId | String (FK) | Adult who created transaction |
| createdAt | DateTime | Transaction time |

**Transaction Reasons:**
- `chore_completion` → Points awarded for completing chore
- `reward_redemption` → Points deducted for redeeming reward
- `manual_adjustment` → Parent manually adjusted points

## Authorization

Authorization is enforced at the application level in server actions:

1. **Authentication**: Every server action calls `auth()` from NextAuth.js to verify the user is logged in
2. **Family membership**: Actions look up the user's profile to determine their family, then scope all queries to that family
3. **Role-based permissions**: Adults (owner/parent/helper) can manage all family data; kids have limited access

## Migrations

Database migrations are managed by Prisma and stored in `prisma/migrations/`. Run migrations with:

```bash
npx prisma migrate dev
```

## Future Enhancements

- **Recurrence rules**: Implement RRULE parsing for recurring chores
- **Notifications table**: Store notification preferences and history
- **Family settings**: Store family-level configuration
- **Chore templates**: Reusable chore templates
- **Point bonuses**: Bonus multipliers for streaks or special occasions
