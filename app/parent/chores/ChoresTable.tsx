'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Chore, Profile } from '@/types';
import { formatRelativeDate } from '@/lib/utils/dates';
import EditChoreButton from './EditChoreButton';
import DeleteChoreButton from './DeleteChoreButton';
import CloneChoreButton from './CloneChoreButton';
import ApproveChoreButton from '../dashboard/ApproveChoreButton';
import RejectChoreButton from '../dashboard/RejectChoreButton';

interface ChoresTableProps {
  chores: Chore[];
  profiles: Profile[];
  kidProfiles: Profile[];
}

type ChoreStatus = 'all' | 'not_started' | 'in_progress' | 'pending_review' | 'completed';

export default function ChoresTable({ chores, profiles, kidProfiles }: ChoresTableProps) {
  const [selectedKid, setSelectedKid] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<ChoreStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const profileMap = useMemo(
    () => new Map(profiles.map(p => [p.id, p])),
    [profiles]
  );

  const filteredChores = useMemo(() => {
    return chores.filter(chore => {
      // Filter by kid
      if (selectedKid !== 'all' && chore.assignedToProfileId !== selectedKid) {
        return false;
      }

      // Filter by status
      if (selectedStatus !== 'all' && chore.status !== selectedStatus) {
        return false;
      }

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = chore.title.toLowerCase().includes(searchLower);
        const descMatch = chore.description?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [chores, selectedKid, selectedStatus, searchTerm]);

  // Sort by due date (soonest first) and then by created date
  const sortedChores = useMemo(() => {
    return [...filteredChores].sort((a, b) => {
      // Pending reviews first
      if (a.status === 'pending_review' && b.status !== 'pending_review') return -1;
      if (a.status !== 'pending_review' && b.status === 'pending_review') return 1;

      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // Then by created date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredChores]);

  return (
    <div>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kid Filter */}
            <div>
              <label htmlFor="filter-kid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Kid
              </label>
              <select
                id="filter-kid"
                value={selectedKid}
                onChange={(e) => setSelectedKid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Kids</option>
                {kidProfiles.map(kid => (
                  <option key={kid.id} value={kid.id}>
                    {kid.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Status
              </label>
              <select
                id="filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ChoreStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="pending_review">Pending Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label htmlFor="filter-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <input
                id="filter-search"
                type="text"
                data-1p-ignore
                placeholder="Search chores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {sortedChores.length} of {chores.length} chores
      </div>

      {/* Chores List */}
      {sortedChores.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No chores found matching your filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedChores.map(chore => {
            const assignedProfile = profileMap.get(chore.assignedToProfileId);
            const createdByProfile = profileMap.get(chore.createdByProfileId);

            return (
              <Card key={chore.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {chore.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Assigned to: {assignedProfile?.name || 'Unknown'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            chore.status === 'completed' ? 'success' :
                            chore.status === 'pending_review' ? 'warning' :
                            chore.status === 'in_progress' ? 'info' :
                            'default'
                          }
                          className="ml-2 flex-shrink-0"
                        >
                          {chore.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {chore.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {chore.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-primary-600 dark:text-primary-400">
                          {chore.pointsValue} points
                        </span>
                        {chore.dueDate && (
                          <span>Due: {formatRelativeDate(chore.dueDate)}</span>
                        )}
                        <span>Created by: {createdByProfile?.name || 'Unknown'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:w-auto">
                      {chore.status === 'pending_review' && (
                        <>
                          <ApproveChoreButton choreId={chore.id} />
                          <RejectChoreButton choreId={chore.id} />
                        </>
                      )}
                      <EditChoreButton chore={chore} kidProfiles={kidProfiles} />
                      <CloneChoreButton chore={chore} />
                      <DeleteChoreButton choreId={chore.id} choreTitle={chore.title} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
