# Chore Buddy

A family-focused chores and rewards app that helps parents assign chores to kids, track completion, and reward them using a points-and-rewards system.

## Features

- **Family Management**: Create a family account and add co-parents, helpers, and kids
- **Chore System**: Create, assign, and track chores with point values
- **Points & Rewards**: Kids earn points for completing chores and can redeem them for rewards
- **Profile Selection**: Netflix-style profile picker for seamless switching between family members
- **Role-Based Access**: Different permissions for owners, parents, helpers, and kids
- **Notifications**: Email notifications when chores are completed or rewards are requested
- **Responsive Design**: Mobile-first UI that works on phones, tablets, and desktops
- **Dark Mode**: Full dark mode support

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: SQLite via Prisma ORM
- **Authentication**: NextAuth.js (Auth.js) with email/password credentials
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel-ready, Docker-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**

```bash
cd chore-buddy
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="generate-a-random-secret-here"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up the database**

```bash
npx prisma migrate dev
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Alternative: Run with Docker (Development Mode)

For development with hot reload and automatic code updates:

**Quick Start:**

```bash
# Run the development startup script
./docker-dev.sh          # macOS/Linux
# or
docker-dev.bat           # Windows

# Or use npm scripts
npm run docker:dev       # Start
npm run docker:dev:logs  # View logs
```

Your code changes will be reflected automatically without rebuilding!

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for complete development workflow documentation.

### Alternative: Run with Docker (Production Mode)

If you prefer using Docker, you can get started in 5 minutes:

**Quick Start (Recommended):**

```bash
# Run the startup script
./docker-start.sh          # macOS/Linux
# or
docker-start.bat           # Windows
```

**Manual Start:**

```bash
# 1. Set up environment variables
cp .env.example .env

# 2. Edit .env with your settings

# 3. Build and run
docker-compose up -d

# 4. View logs
docker-compose logs -f app
```

**Documentation:**
- Quick start guide: [docs/DOCKER-QUICKSTART.md](docs/DOCKER-QUICKSTART.md)
- Complete Docker guide: [docs/DOCKER.md](docs/DOCKER.md)

### First-Time Setup

1. Navigate to `/auth/register`
2. Create an account with your email and password
3. Enter your family name
4. You'll be redirected to the profile selector
5. Start by adding kid profiles and creating chores!

## Project Structure

```
chore-buddy/
├── app/                          # Next.js App Router
│   ├── api/                      # Server actions + NextAuth route
│   │   ├── auth/[...nextauth]/   # NextAuth.js route handler
│   │   ├── chores/              # Chore management
│   │   ├── profiles/            # Profile management
│   │   ├── rewards/             # Rewards and redemptions
│   │   └── points/              # Points transactions
│   ├── auth/                    # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── profile/select/          # Netflix-style profile selector
│   ├── parent/                  # Parent dashboard & pages
│   ├── kid/                     # Kid dashboard & pages
│   └── layout.tsx               # Root layout with global styles
├── components/                   # React components
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Loading.tsx
│       └── EmptyState.tsx
├── lib/                         # Utility functions and services
│   ├── auth.ts                  # NextAuth.js configuration
│   ├── db.ts                    # Prisma client singleton
│   ├── utils/                   # Helper utilities
│   │   ├── points.ts            # Points calculation
│   │   ├── dates.ts             # Date formatting
│   │   └── index.ts             # General utilities
│   └── services/                # Business logic services
│       └── notifications.ts     # Email notifications (stub)
├── prisma/                      # Prisma ORM
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── types/                       # TypeScript type definitions
│   ├── next-auth.d.ts           # NextAuth session type augmentation
│   └── index.ts                 # Domain model types
├── docs/                        # Documentation
│   └── database-schema.md       # Database schema documentation
├── middleware.ts                 # Next.js middleware for auth
└── jest.config.js               # Jest configuration
```

## Database Schema

The application uses a SQLite database (via Prisma) with the following main tables:

- **users**: Adult accounts with hashed passwords (managed by NextAuth.js)
- **families**: Family units
- **profiles**: Family members (both adults and kids)
- **chores**: Tasks assigned to kids
- **chore_comments**: Comments on chores
- **rewards**: Family reward catalog
- **reward_redemptions**: Reward redemption requests
- **points_transactions**: Ledger of all point changes

See [docs/database-schema.md](docs/database-schema.md) for detailed documentation.

## Architecture

### Authentication Flow

1. User signs up/logs in with email and password (NextAuth.js Credentials provider)
2. On successful auth, user is redirected to profile selector
3. User selects a profile (adult or kid)
4. Profile ID and role are stored in session storage
5. User is redirected to appropriate dashboard based on role

### Permissions Model

- **Owner/Parent/Helper**: Can manage all family data (chores, rewards, profiles)
- **Kid**: Can view their own chores, update chore status, request rewards

Authorization is enforced in application code — each server action verifies family membership before performing operations.

### Points System

Points are tracked via a ledger (`points_transactions` table):

- **Positive transactions**: Awarded when chores are approved
- **Negative transactions**: Deducted when rewards are redeemed
- **Manual adjustments**: Parents can manually add/remove points

Current balance = SUM of all transactions for a profile.

### Chore Workflow

1. **Parent creates chore** → Status: `not_started`
2. **Kid clicks "On it"** → Status: `in_progress`
3. **Kid clicks "Done"** → Status: `pending_review` (notification sent to parents)
4. **Parent approves** → Status: `completed`, points awarded
5. **Parent rejects** → Status: `not_started`, optional comment

### Reward Workflow

1. **Kid requests redemption** → Status: `requested` (notification sent to parents)
2. **Parent approves and marks as redeemed** → Status: `redeemed`, points deducted
3. **Parent rejects** → Status: `rejected`

## API Routes (Server Actions)

All backend logic is implemented using Next.js Server Actions:

### Profiles

- `getProfiles()`: Get all profiles in the family
- `getProfile(id)`: Get a single profile
- `createProfile(input)`: Create a new profile
- `updateProfile(id, input)`: Update a profile
- `deleteProfile(id)`: Delete a profile

### Chores

- `getChores()`: Get all chores
- `getChoresForKid(profileId)`: Get chores for a specific kid
- `getPendingChores()`: Get chores pending review
- `createChore(input, createdBy)`: Create a new chore
- `updateChore(id, input)`: Update a chore
- `updateChoreStatus(id, status)`: Update chore status (kids use this)
- `approveChore(id, approvedBy)`: Approve a chore and award points
- `rejectChore(id, reason?)`: Reject a chore
- `deleteChore(id)`: Delete a chore
- `cloneChore(id, createdBy)`: Clone an existing chore

### Rewards

- `getRewards()`: Get all rewards
- `getActiveRewards()`: Get active rewards only
- `createReward(input)`: Create a new reward
- `updateReward(id, input)`: Update a reward
- `deleteReward(id)`: Delete a reward
- `requestRedemption(rewardId, profileId)`: Request a reward redemption
- `getRedemptions()`: Get all redemptions
- `getPendingRedemptions()`: Get pending redemptions
- `approveRedemption(id, approvedBy)`: Approve and redeem (deduct points)
- `rejectRedemption(id, rejectedBy)`: Reject a redemption

### Points

- `getPointsTransactions(profileId)`: Get all transactions for a profile
- `getProfilePoints(profileId)`: Calculate total points
- `getKidProfilesWithPoints()`: Get all kids with their point balances
- `createManualAdjustment(profileId, amount, notes, createdBy)`: Manually adjust points

## Testing

Run tests with:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Example tests are located in `lib/utils/__tests__/points.test.ts`.

### Writing Tests

```typescript
import { calculateTotalPoints } from '@/lib/utils/points';

describe('Points calculation', () => {
  it('should calculate total points correctly', () => {
    const transactions = [
      { amount: 10, /* ... */ },
      { amount: -5, /* ... */ },
    ];
    expect(calculateTotalPoints(transactions)).toBe(5);
  });
});
```

## Building the Remaining Pages

The core backend logic and API routes are complete. To finish the application, implement the following pages:

### Parent Dashboard (`app/parent/dashboard/page.tsx`)

**Required components:**

- List of kids with stats (today's chores, incomplete chores, pending reviews, points)
- Pending chore reviews section
- Pending reward redemptions section
- Quick action buttons (create chore, create reward, manage profiles)

**Server actions to use:**

- `getKidProfilesWithPoints()`
- `getPendingChores()`
- `getPendingRedemptions()`

### Parent Chores Page (`app/parent/chores/page.tsx`)

**Required components:**

- Table of all chores with filters (kid, date, status)
- Create/edit chore modal/form
- Approve/reject buttons for pending chores
- Clone chore button

**Server actions to use:**

- `getChores()`
- `createChore()`
- `updateChore()`
- `approveChore()`
- `rejectChore()`
- `deleteChore()`
- `cloneChore()`

### Parent Rewards Page (`app/parent/rewards/page.tsx`)

**Required components:**

- List of rewards with edit/delete actions
- Create/edit reward modal/form
- Redemption history table
- Approve/reject redemption buttons

**Server actions to use:**

- `getRewards()`
- `createReward()`
- `updateReward()`
- `deleteReward()`
- `getRedemptions()`
- `approveRedemption()`
- `rejectRedemption()`

### Kid Dashboard (`app/kid/dashboard/page.tsx`)

**Required components:**

- Avatar and name display
- Points display (large, prominent)
- Today's chores grouped by status
- Chore cards with "On it" and "Done" buttons
- Success message if chores were recently approved

**Server actions to use:**

- `getChoresForKid(profileId)`
- `getProfilePoints(profileId)`
- `updateChoreStatus()`

### Kid Rewards Page (`app/kid/rewards/page.tsx`)

**Required components:**

- Grid of reward cards
- Points required display
- "Redeem" button (disabled if not enough points)
- My redemptions section showing request status

**Server actions to use:**

- `getActiveRewards()`
- `getProfilePoints(profileId)`
- `requestRedemption()`
- `getRedemptions()` (filtered by kid's profile)

## Extending the Application

### Adding SMS Notifications

1. Install a service like Twilio:

```bash
npm install twilio
```

2. Update `lib/services/notifications.ts`:

```typescript
import twilio from 'twilio';

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, message: string) {
  await client.messages.create({
    body: message,
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
  });
}
```

3. Call `sendSMS()` alongside `sendEmail()` in notification functions

### Implementing Recurring Chores

1. Install a recurrence library:

```bash
npm install rrule
```

2. Create a cron job or scheduled function to:

```typescript
import { RRule } from 'rrule';

async function createRecurringChores() {
  const chores = await getChoresWithRecurrence();

  for (const chore of chores) {
    const rule = RRule.fromString(chore.recurrenceRule);
    const nextOccurrence = rule.after(new Date());

    if (shouldCreateInstance(nextOccurrence)) {
      await createChore({
        ...chore,
        dueDate: nextOccurrence.toISOString(),
      });
    }
  }
}
```

3. Run this function daily using:
   - Vercel Cron Jobs
   - GitHub Actions

### Adding Push Notifications

1. Set up Firebase Cloud Messaging (FCM)
2. Store device tokens in a new `device_tokens` table
3. Update notification service to send push notifications:

```typescript
import admin from 'firebase-admin';

export async function sendPushNotification(
  deviceToken: string,
  title: string,
  body: string
) {
  await admin.messaging().send({
    token: deviceToken,
    notification: { title, body },
  });
}
```

### Implementing Freemium Billing

1. Install Stripe:

```bash
npm install stripe @stripe/stripe-js
```

2. Add subscription tiers:

```typescript
const plans = {
  free: { maxKids: 2, maxChores: 10 },
  premium: { maxKids: 10, maxChores: 100 },
};
```

3. Implement billing pages and webhook handlers
4. Add middleware to check subscription limits

### Building iOS App

Option 1: **Capacitor** (web wrapper)

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios
npx cap init
npx cap add ios
npx cap sync
npx cap open ios
```

Option 2: **React Native** (separate codebase)

- Share types and API endpoints
- Reuse business logic
- Build native UI with React Native components

## Deployment

### Deploying with Docker

For Docker-based deployments to AWS ECS, Google Cloud Run, DigitalOcean, Fly.io, or any Docker-compatible platform:

See the comprehensive [Docker deployment guide](docs/DOCKER.md) for:
- Building production Docker images
- Multi-platform builds (ARM and x86)
- Deployment to various cloud providers
- Performance optimization
- Security best practices

Quick example for production:

```bash
# Build the image
docker build -t chore-buddy:latest \
  --build-arg NEXT_PUBLIC_APP_URL=https://your-domain.com \
  .

# Run the container
docker run -d -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e AUTH_SECRET="your-secret" \
  --name chore-buddy chore-buddy:latest
```

### Deploying to Vercel

1. Push your code to GitHub

2. Connect to Vercel:

```bash
npm install -g vercel
vercel
```

3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`

4. Deploy:

```bash
vercel --prod
```

> **Note**: SQLite works for single-instance deployments. For multi-instance or serverless deployments (like Vercel), consider migrating to Postgres or using a hosted SQLite service like Turso.

## Contributing

This is a private family project. For questions or suggestions, please reach out to the repository owner.

## License

MIT

## Support

For issues or questions:

1. Check the [docs/database-schema.md](docs/database-schema.md) for data model questions
2. Review the API documentation in this README
3. Review Next.js documentation for framework questions

---

Built with love for families who want to make chores fun!
