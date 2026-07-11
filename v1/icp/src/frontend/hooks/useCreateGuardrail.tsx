import { useMutation } from "@tanstack/react-query";
import { backend } from "../../backend/declarations";
import { Principal } from '@dfinity/principal';

type CreateGuardrailResponse = { Ok?: string; Err?: string };

const convertRuleStatus = (status: "Proposed" | "Voting" | "Approved" | "Rejected") => {
  switch (status) {
    case "Proposed": return { Proposed: null };
    case "Voting": return { Voting: null };
    case "Approved": return { Approved: null };
    case "Rejected": return { Rejected: null };
  }
};

export default function useCreateGuardrail(
  onSuccess?: (data: { guardrailId: string }) => void,
  onError?: (error: string) => void
) {
  return useMutation<CreateGuardrailResponse, Error, {
    name: string;
    category: string;
    rules: { text: string; status: "Proposed" | "Voting" | "Approved" | "Rejected" }[];
    owner: Principal;
    created_at: bigint;
  }>({
    mutationFn: async (guardrail) => {
      if (!guardrail.name.trim()) {
        throw new Error("Guardrail name cannot be empty.");
      }
      if (guardrail.rules.length === 0) {
        throw new Error("At least one rule is required.");
      }
      const response = await backend.create_guardrail({
        ...guardrail,
        id: crypto.randomUUID(),
        created_at: BigInt(Date.now()),
        rules: guardrail.rules.map(rule => ({
          id: crypto.randomUUID(),
          text: rule.text,
          status: convertRuleStatus(rule.status),
          votes: 0
        }))
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.Ok) {
        onSuccess?.({ guardrailId: data.Ok });
      } else if (data.Err) {
        onError?.(data.Err);
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        onError?.(error.message);
      } else {
        onError?.("An unknown error occurred.");
      }
    },
  });
}