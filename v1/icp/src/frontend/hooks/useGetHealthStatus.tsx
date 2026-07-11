// hooks/useGetHealthStatus.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { SystemHealth } from '../models/health.model';

const fetchHealthStatus = async (): Promise<SystemHealth> => {
  const response = await axios.get<SystemHealth>('http://127.0.0.1:8000/health');
  console.log(response.data);
  return response.data;
};

export const useGetHealthStatus = () => {
  return useQuery<SystemHealth>
  ({
    queryKey: ['healthStatus'],
    queryFn: fetchHealthStatus,
    refetchInterval:600000
    });
};