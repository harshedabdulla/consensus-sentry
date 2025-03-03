import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { CheckRequest, CheckResponse } from '../models/check.model';

const checkText = async (request: CheckRequest): Promise<CheckResponse> => {
  const response = await axios.post<CheckResponse>(
    'https://guardrail-middleware-586283029485.us-central1.run.app/check', 
    request
  );
  return response.data;
};

export const useCheckText = () => {
  return useMutation<CheckResponse, Error, CheckRequest>({
    mutationFn: checkText
  });
};