import { useMutation } from "@tanstack/react-query";
import { backend } from "../../backend/declarations";

const convertRuleStatus = (status: "Proposed" | "Voting" | "Approved" | "Rejected") => {
  switch (status) {
    case "Proposed": return { Proposed: null };
    case "Voting": return { Voting: null };
    case "Approved": return { Approved: null };
    case "Rejected": return { Rejected: null };
  }
};

export default function useProposeRule(
  onSuccess?: (data: { ruleId: string }) => void,
  onError?: (error: string) => void
) {
  return useMutation<{ Ok?: string; Err?: string }, Error, { guardrailId: string; rule: { text: string; status: "Proposed" | "Voting" | "Approved" | "Rejected" } }>({
    mutationFn: async ({ guardrailId, rule }) => {
      if (!rule.text.trim()) {
        throw new Error("Rule text cannot be empty.");
      }
      return await backend.propose_rule(
        guardrailId, 
        {
          id: crypto.randomUUID(),
          text: rule.text,
          status: convertRuleStatus(rule.status),
          votes: 0
        }
      );
    },
    onSuccess: (data) => {
      if (data.Ok) {
        onSuccess?.({ ruleId: data.Ok });
      } else if (data.Err) {
        onError?.(data.Err);
      }
    },
    onError: (error) => {
      onError?.(error.message || "Failed to propose rule.");
    },
  });
}