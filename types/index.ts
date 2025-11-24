/**
 * Domain model types for the application
 * These types represent the business logic entities
 */

export type ProfileRole = 'owner' | 'parent' | 'helper' | 'kid';
export type ChoreStatus = 'not_started' | 'in_progress' | 'done' | 'pending_review' | 'completed';
export type RedemptionStatus = 'requested' | 'approved' | 'redeemed' | 'rejected';
export type TransactionReason = 'chore_completion' | 'reward_redemption' | 'manual_adjustment';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  familyId: string;
  userId: string | null;
  name: string;
  avatarUrl: string | null;
  role: ProfileRole;
  pinCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Chore {
  id: string;
  familyId: string;
  assignedToProfileId: string;
  title: string;
  description: string | null;
  pointsValue: number;
  dueDate: string | null;
  recurrenceRule: string | null;
  status: ChoreStatus;
  createdByProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChoreComment {
  id: string;
  choreId: string;
  profileId: string;
  comment: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  familyId: string;
  name: string;
  description: string | null;
  pointsCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  profileId: string;
  status: RedemptionStatus;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedByProfileId: string | null;
}

export interface PointsTransaction {
  id: string;
  profileId: string;
  amount: number;
  reason: TransactionReason;
  relatedChoreId: string | null;
  relatedRedemptionId: string | null;
  notes: string | null;
  createdByProfileId: string;
  createdAt: string;
}

// Extended types with relations for UI
export interface ChoreWithProfile extends Chore {
  assignedTo: Profile;
  createdBy: Profile;
  comments?: ChoreComment[];
}

export interface RedemptionWithDetails extends RewardRedemption {
  reward: Reward;
  profile: Profile;
  resolvedBy?: Profile | null;
}

export interface ProfileWithPoints extends Profile {
  totalPoints: number;
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface CreateChoreInput {
  assignedToProfileId: string;
  title: string;
  description?: string;
  pointsValue: number;
  dueDate?: string;
  recurrenceRule?: string;
}

export interface UpdateChoreInput {
  title?: string;
  description?: string;
  pointsValue?: number;
  dueDate?: string;
  recurrenceRule?: string;
  status?: ChoreStatus;
}

export interface CreateRewardInput {
  name: string;
  description?: string;
  pointsCost: number;
}

export interface UpdateRewardInput {
  name?: string;
  description?: string;
  pointsCost?: number;
  isActive?: boolean;
}

export interface CreateProfileInput {
  familyId: string;
  name: string;
  role: ProfileRole;
  avatarUrl?: string;
  pinCode?: string;
}

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string;
  pinCode?: string;
}
