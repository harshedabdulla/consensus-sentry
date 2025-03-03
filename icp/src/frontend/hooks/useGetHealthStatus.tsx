// hooks/useGetHealthStatus.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { SystemHealth } from '../models/health.model';

const fetchHealthStatus = async (): Promise<SystemHealth> => {
  const response = await axios.get<SystemHealth>('https://guardrail-middleware-586283029485.us-central1.run.app/health');
  console.log(response.data);
  return response.data;
};

export const useGetHealthStatus = () => {
  return useQuery<SystemHealth>
  ({
    queryKey: ['healthStatus'],
    queryFn: fetchHealthStatus,
    refetchInterval: 30000
    });
};