'use client';

import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
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
          value={filters.location || 'all'}
          onValueChange={(val) => handleLocationChange(val === 'all' ? '' : val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
            <SelectItem value="New York, NY">New York, NY</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
            <SelectItem value="Austin, TX">Austin, TX</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.workType || 'all'}
          onValueChange={(val) => handleWorkTypeChange(val === 'all' ? '' : val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Work Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Work Types</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="on-site">On-site</SelectItem>
          </SelectContent>
        </Select>
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
