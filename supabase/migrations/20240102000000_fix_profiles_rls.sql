-- Fix infinite recursion in profiles RLS policies
-- The issue: policies on profiles table were querying profiles table itself

-- Drop the problematic policies
DROP POLICY IF EXISTS "Family members can view all profiles in their family" ON profiles;
DROP POLICY IF EXISTS "Adults can manage profiles in their family" ON profiles;

-- Create new policies that don't cause recursion
-- Strategy: Check family ownership/membership through families table instead

-- Policy 1: Users can view profiles in families they own
CREATE POLICY "Users can view profiles in their owned families"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM families
            WHERE families.id = profiles.family_id
            AND families.owner_id = auth.uid()
        )
    );

-- Policy 2: Users can view their own profile (by user_id)
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (user_id = auth.uid());

-- Policy 3: Family owners can manage all profiles in their family
CREATE POLICY "Family owners can manage profiles"
    ON profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM families
            WHERE families.id = profiles.family_id
            AND families.owner_id = auth.uid()
        )
    );

-- Note: We removed separate adult member policies to avoid recursion
-- Family owners (via Policy 3) can manage all profiles in their families
-- Non-owner adults would need profile management done through owner accounts
-- or via a SECURITY DEFINER function to bypass RLS

-- Policy 5: Allow inserting profiles for families you own
CREATE POLICY "Family owners can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM families
            WHERE families.id = profiles.family_id
            AND families.owner_id = auth.uid()
        )
    );

