-- Chore Buddy Database Schema
-- This migration creates all tables, indexes, and row-level security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE profile_role AS ENUM ('owner', 'parent', 'helper', 'kid');
CREATE TYPE chore_status AS ENUM ('not_started', 'in_progress', 'done', 'pending_review', 'completed');
CREATE TYPE redemption_status AS ENUM ('requested', 'approved', 'redeemed', 'rejected');
CREATE TYPE transaction_reason AS ENUM ('chore_completion', 'reward_redemption', 'manual_adjustment');

-- Users table (synced with Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Families table
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles table (can be adult or kid)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role profile_role NOT NULL,
    pin_code TEXT, -- For switching back to adult mode
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chores table
CREATE TABLE chores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    assigned_to_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    points_value INTEGER NOT NULL CHECK (points_value >= 0),
    due_date DATE,
    recurrence_rule TEXT, -- Can store RRULE format for future implementation
    status chore_status NOT NULL DEFAULT 'not_started',
    created_by_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chore comments table
CREATE TABLE chore_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chore_id UUID NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rewards table
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reward redemptions table
CREATE TABLE reward_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status redemption_status NOT NULL DEFAULT 'requested',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Points transactions table
CREATE TABLE points_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Can be positive or negative
    reason transaction_reason NOT NULL,
    related_chore_id UUID REFERENCES chores(id) ON DELETE SET NULL,
    related_redemption_id UUID REFERENCES reward_redemptions(id) ON DELETE SET NULL,
    notes TEXT,
    created_by_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_family_id ON profiles(family_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE INDEX idx_chores_family_id ON chores(family_id);
CREATE INDEX idx_chores_assigned_to ON chores(assigned_to_profile_id);
CREATE INDEX idx_chores_status ON chores(status);
CREATE INDEX idx_chores_due_date ON chores(due_date);

CREATE INDEX idx_chore_comments_chore_id ON chore_comments(chore_id);

CREATE INDEX idx_rewards_family_id ON rewards(family_id);
CREATE INDEX idx_rewards_is_active ON rewards(is_active);

CREATE INDEX idx_reward_redemptions_profile_id ON reward_redemptions(profile_id);
CREATE INDEX idx_reward_redemptions_status ON reward_redemptions(status);

CREATE INDEX idx_points_transactions_profile_id ON points_transactions(profile_id);
CREATE INDEX idx_points_transactions_reason ON points_transactions(reason);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chores_updated_at BEFORE UPDATE ON chores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for families table
CREATE POLICY "Family members can view their family"
    ON families FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.family_id = families.id
            AND profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Family owners can update their family"
    ON families FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create families"
    ON families FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for profiles table
CREATE POLICY "Family members can view all profiles in their family"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.family_id = profiles.family_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Adults can manage profiles in their family"
    ON profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.family_id = profiles.family_id
            AND p.user_id = auth.uid()
            AND p.role IN ('owner', 'parent', 'helper')
        )
    );

-- RLS Policies for chores table
CREATE POLICY "Family members can view chores in their family"
    ON chores FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.family_id = chores.family_id
            AND profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Adults can manage chores in their family"
    ON chores FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.family_id = chores.family_id
            AND profiles.user_id = auth.uid()
            AND profiles.role IN ('owner', 'parent', 'helper')
        )
    );

-- RLS Policies for chore_comments table
CREATE POLICY "Family members can view comments on chores in their family"
    ON chore_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chores c
            JOIN profiles p ON p.family_id = c.family_id
            WHERE c.id = chore_comments.chore_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Family members can add comments"
    ON chore_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chores c
            JOIN profiles p ON p.family_id = c.family_id
            WHERE c.id = chore_comments.chore_id
            AND p.user_id = auth.uid()
        )
    );

-- RLS Policies for rewards table
CREATE POLICY "Family members can view rewards in their family"
    ON rewards FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.family_id = rewards.family_id
            AND profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Adults can manage rewards in their family"
    ON rewards FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.family_id = rewards.family_id
            AND profiles.user_id = auth.uid()
            AND profiles.role IN ('owner', 'parent', 'helper')
        )
    );

-- RLS Policies for reward_redemptions table
CREATE POLICY "Family members can view redemptions in their family"
    ON reward_redemptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN rewards r ON r.id = reward_redemptions.reward_id
            WHERE p.family_id = r.family_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Kids can request redemptions"
    ON reward_redemptions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN rewards r ON r.id = reward_redemptions.reward_id
            WHERE p.id = reward_redemptions.profile_id
            AND p.family_id = r.family_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Adults can manage redemptions"
    ON reward_redemptions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN rewards r ON r.id = reward_redemptions.reward_id
            WHERE p.family_id = r.family_id
            AND p.user_id = auth.uid()
            AND p.role IN ('owner', 'parent', 'helper')
        )
    );

-- RLS Policies for points_transactions table
CREATE POLICY "Family members can view transactions in their family"
    ON points_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p1
            JOIN profiles p2 ON p2.family_id = p1.family_id
            WHERE p2.id = points_transactions.profile_id
            AND p1.user_id = auth.uid()
        )
    );

CREATE POLICY "Adults can create transactions"
    ON points_transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p1
            JOIN profiles p2 ON p2.family_id = p1.family_id
            WHERE p2.id = points_transactions.profile_id
            AND p1.user_id = auth.uid()
            AND p1.role IN ('owner', 'parent', 'helper')
        )
    );

-- Create a function to automatically create a user record on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
