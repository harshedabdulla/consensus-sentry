import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { CheckRequest, CheckResponse } from '../models/check.model';

const checkText = async (request: CheckRequest): Promise<CheckResponse> => {
  const response = await axios.post<CheckResponse>(
    'http://127.0.0.1:8000/check', 
    request
  );
  return response.data;
};

export const useCheckText = () => {
  return useMutation<CheckResponse, Error, CheckRequest>({
    mutationFn: checkText
  });
};