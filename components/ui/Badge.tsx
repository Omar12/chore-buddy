import { cn } from '@/lib/utils';
import type { ChoreStatus, RedemptionStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200',
    success: 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    info: 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ChoreStatusBadge({ status }: { status: ChoreStatus }) {
  const statusConfig: Record<ChoreStatus, { label: string; variant: BadgeProps['variant'] }> = {
    not_started: { label: 'Not Started', variant: 'default' },
    in_progress: { label: 'In Progress', variant: 'info' },
    done: { label: 'Done', variant: 'warning' },
    pending_review: { label: 'Pending Review', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function RedemptionStatusBadge({ status }: { status: RedemptionStatus }) {
  const statusConfig: Record<RedemptionStatus, { label: string; variant: BadgeProps['variant'] }> = {
    requested: { label: 'Requested', variant: 'warning' },
    approved: { label: 'Approved', variant: 'info' },
    redeemed: { label: 'Redeemed', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'danger' },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
