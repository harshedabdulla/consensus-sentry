import { useMutation } from "@tanstack/react-query";
import { backend } from "../../backend/declarations";
import { RuleStatus } from "../../backend/declarations/backend.did";
import { Principal } from '@dfinity/principal';

// Define types
interface GetGuardrailsResponse {
  Ok?: Guardrail[];
  Err?: string;
}

interface Guardrail {
  id: string;
  name: string;
  rules: Rule[];
  category: string;
  owner: string;
  created_at: number;
}

interface Rule {
  id: string;
  text: string;
  status: "Proposed" | "Voting" | "Approved" | "Rejected";
  votes: number;
}

// Mapping function to convert backend types to custom types
const mapRuleStatus = (backendStatus: RuleStatus): Rule['status'] => {
  if ('Proposed' in backendStatus) return 'Proposed';
  if ('Voting' in backendStatus) return 'Voting';
  if ('Approved' in backendStatus) return 'Approved';
  if ('Rejected' in backendStatus) return 'Rejected';
  throw new Error('Unknown rule status');
};

export default function useGetGuardrails(
  onSuccess?: (data: { guardrails: Guardrail[] }) => void,
  onError?: (error: string) => void
) {
  return useMutation<GetGuardrailsResponse, Error, void>({
    mutationFn: async () => {
      const response = await backend.get_guardrails_by_owner();
      
      // Transform backend guardrails to custom guardrails
      const mappedGuardrails: Guardrail[] = response.map(backendGuardrail => ({
        id: backendGuardrail.id,
        name: backendGuardrail.name,
        category: backendGuardrail.category,
        owner: Principal.from(backendGuardrail.owner).toText(),
        created_at: Number(backendGuardrail.created_at), // Convert bigint to number
        rules: backendGuardrail.rules.map(rule => ({
          id: rule.id,
          text: rule.text,
          status: mapRuleStatus(rule.status),
          votes: rule.votes
        }))
      }));

      return { Ok: mappedGuardrails };
    },
    onSuccess: (data) => {
      if (data.Ok) {
        onSuccess?.({ guardrails: data.Ok });
      } else {
        onError?.(data.Err || "No guardrails found");
      }
    },
    onError: (error) => {
      onError?.(error.message || "Failed to fetch guardrails. Please try again.");
    },
  });
}