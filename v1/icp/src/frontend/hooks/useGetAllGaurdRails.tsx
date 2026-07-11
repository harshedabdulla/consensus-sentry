import { useMutation } from "@tanstack/react-query";
import { backend } from "../../backend/declarations";

export function useGetAllGuardrails() {
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await backend.get_all_gaurdrails();
        return response;
      } catch (error) {
        console.error("Error fetching guardrails:", error);
        throw error;
      }
    }
  });
}

// why mutation?
// mutation is used to perform a side effect, in this case, fetching data from the backend
// the mutationFn is the function that will be called when the mutation is triggered

// so is it used to fetch data?
// yes, it's used to fetch data from the backend
// it's also used to update the cache with the fetched data
