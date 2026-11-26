import apiClient from './api';
import type { Job, ApiResponse } from '../types';

export const jobService = {
  async getJobs(): Promise<Job[]> {
    const response = await apiClient.get<ApiResponse<Job[]>>('/jobs');
    return response.data.data || [];
  },

  async getJobById(id: string): Promise<Job> {
    const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Job not found');
  },

  async createJob(job: Partial<Job>): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>('/jobs', job);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create job');
  },
};
