import { useMutation } from "@tanstack/react-query";
import { backend } from "../../backend/declarations";

export function useGetGuardrail() {
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await backend.get_guardrail(id);
        console.log(response);
        return response;
      } catch (error) {
        console.error("Error fetching guardrail:", error);
        throw error;
      }
    }
  });
}