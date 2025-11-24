# Chore Buddy Database Schema

This document describes the database schema for Chore Buddy.

## Overview

The database is designed with the following principles:
- **Family isolation**: Each family's data is completely isolated from other families
- **Row-level security**: Supabase RLS policies ensure users can only access their family's data
- **Referential integrity**: Foreign keys maintain data consistency
- **Audit trails**: Created/updated timestamps on all major entities

## Entity Relationship Diagram

```
users (Supabase Auth)
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

## Tables

### users
Synced with Supabase Auth. Stores minimal user information for adults with email accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | References auth.users(id) |
| email | TEXT | User email (unique) |
| created_at | TIMESTAMPTZ | Account creation time |
| updated_at | TIMESTAMPTZ | Last update time |

### families
Represents a family unit. Each family is owned by one user (the creator).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique family identifier |
| name | TEXT | Family name |
| owner_id | UUID (FK) | References users(id) |
| created_at | TIMESTAMPTZ | Family creation time |
| updated_at | TIMESTAMPTZ | Last update time |

### profiles
Represents individual family members (both adults and kids). Adults link to user accounts, kids do not.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique profile identifier |
| family_id | UUID (FK) | References families(id) |
| user_id | UUID (FK, nullable) | References users(id) - null for kids |
| name | TEXT | Display name |
| avatar_url | TEXT | Profile picture URL |
| role | ENUM | 'owner', 'parent', 'helper', 'kid' |
| pin_code | TEXT | PIN for switching to adult mode |
| created_at | TIMESTAMPTZ | Profile creation time |
| updated_at | TIMESTAMPTZ | Last update time |

**Profile Roles:**
- `owner`: Family creator, full permissions
- `parent`: Co-parent, same permissions as owner (except billing in future)
- `helper`: Grandparent or accountability partner, same permissions as parent
- `kid`: Child profile, limited permissions

### chores
Tasks assigned to kid profiles by adults.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique chore identifier |
| family_id | UUID (FK) | References families(id) |
| assigned_to_profile_id | UUID (FK) | References profiles(id) |
| title | TEXT | Chore title |
| description | TEXT | Optional description |
| points_value | INTEGER | Points earned on completion (≥ 0) |
| due_date | DATE | Due date (no time) |
| recurrence_rule | TEXT | RRULE format (future feature) |
| status | ENUM | Current chore status |
| created_by_profile_id | UUID (FK) | References profiles(id) |
| created_at | TIMESTAMPTZ | Chore creation time |
| updated_at | TIMESTAMPTZ | Last update time |

**Chore Status Flow:**
1. `not_started` → Kid hasn't started
2. `in_progress` → Kid clicked "On it"
3. `done` / `pending_review` → Kid clicked "Done", awaiting parent review
4. `completed` → Parent approved, points awarded
5. Can also go back to `not_started` or `in_progress` if parent rejects

### chore_comments
Comments on chores (e.g., "We ran out of dog food bags").

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique comment identifier |
| chore_id | UUID (FK) | References chores(id) |
| profile_id | UUID (FK) | Comment author |
| comment | TEXT | Comment content |
| created_at | TIMESTAMPTZ | Comment time |

### rewards
Family reward catalog. Adults create rewards that kids can redeem with points.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique reward identifier |
| family_id | UUID (FK) | References families(id) |
| name | TEXT | Reward name |
| description | TEXT | Optional description |
| points_cost | INTEGER | Points required (> 0) |
| is_active | BOOLEAN | Whether reward is available |
| created_at | TIMESTAMPTZ | Reward creation time |
| updated_at | TIMESTAMPTZ | Last update time |

### reward_redemptions
Tracks reward redemption requests and their status.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique redemption identifier |
| reward_id | UUID (FK) | References rewards(id) |
| profile_id | UUID (FK) | Kid requesting redemption |
| status | ENUM | Redemption status |
| requested_at | TIMESTAMPTZ | Request time |
| resolved_at | TIMESTAMPTZ | Resolution time |
| resolved_by_profile_id | UUID (FK) | Parent who resolved |

**Redemption Status:**
- `requested` → Kid requested redemption
- `approved` → Parent approved (ready to redeem)
- `redeemed` → Parent marked as redeemed, points deducted
- `rejected` → Parent rejected request

### points_transactions
Ledger of all point changes for kid profiles. Used to calculate current balance.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique transaction identifier |
| profile_id | UUID (FK) | Kid profile |
| amount | INTEGER | Points change (+ or -) |
| reason | ENUM | Transaction type |
| related_chore_id | UUID (FK, nullable) | Related chore if applicable |
| related_redemption_id | UUID (FK, nullable) | Related redemption if applicable |
| notes | TEXT | Optional notes |
| created_by_profile_id | UUID (FK) | Adult who created transaction |
| created_at | TIMESTAMPTZ | Transaction time |

**Transaction Reasons:**
- `chore_completion` → Points awarded for completing chore
- `reward_redemption` → Points deducted for redeeming reward
- `manual_adjustment` → Parent manually adjusted points

## Row-Level Security (RLS)

All tables have RLS enabled with policies that ensure:

1. **Family isolation**: Users can only access data for families they belong to
2. **Role-based permissions**:
   - Adults (owner/parent/helper) can manage all family data
   - Kids can view their own chores and rewards, update chore status, add comments
3. **User authentication**: All policies require `auth.uid()` to be set

## Indexes

Indexes are created on commonly queried columns:
- Foreign keys (family_id, profile_id, etc.)
- Status fields (chore status, redemption status)
- Date fields (due_date)
- Role fields (profile role)

## Triggers

- **updated_at triggers**: Automatically update `updated_at` timestamp on row changes
- **handle_new_user**: Automatically creates a user record when someone signs up via Supabase Auth

## Future Enhancements

- **Recurrence rules**: Implement RRULE parsing for recurring chores
- **Notifications table**: Store notification preferences and history
- **Family settings**: Store family-level configuration
- **Chore templates**: Reusable chore templates
- **Point bonuses**: Bonus multipliers for streaks or special occasions
