-- Fix infinite recursion between families and profiles RLS policies
-- The issue: families policy queries profiles, which queries profiles (recursion)

-- Drop the problematic policy
DROP POLICY IF EXISTS "Family members can view their family" ON families;

-- Recreate with a simpler policy that only checks direct ownership
-- This breaks the circular dependency between families and profiles
CREATE POLICY "Users can view families they own"
    ON families FOR SELECT
    USING (owner_id = auth.uid());
