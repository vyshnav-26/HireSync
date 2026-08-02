'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { JobFilters } from '@/lib/types';

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
}

export function JobFiltersComponent({ filters, onFiltersChange }: JobFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleLocationChange = (value: string) => {
    onFiltersChange({ ...filters, location: value });
  };

  const handleWorkTypeChange = (value: string) => {
    onFiltersChange({ ...filters, workType: value });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasFilters = Object.values(filters).some(v => v);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          placeholder="Search jobs..."
          value={filters.searchTerm || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <Select
          value={filters.location || ''}
          onChange={(e) => handleLocationChange(e.target.value)}
          options={[
            { value: '', label: 'All Locations' },
            { value: 'San Francisco, CA', label: 'San Francisco, CA' },
            { value: 'New York, NY', label: 'New York, NY' },
            { value: 'Remote', label: 'Remote' },
            { value: 'Austin, TX', label: 'Austin, TX' },
          ]}
        />

        <Select
          value={filters.workType || ''}
          onChange={(e) => handleWorkTypeChange(e.target.value)}
          options={[
            { value: '', label: 'All Work Types' },
            { value: 'remote', label: 'Remote' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'on-site', label: 'On-site' },
          ]}
        />
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
