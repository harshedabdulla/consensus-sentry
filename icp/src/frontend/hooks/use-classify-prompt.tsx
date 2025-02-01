import { useMutation } from "@tanstack/react-query";
import { backend } from "../../backend/declarations";

interface ClassifyPromptResponse {
  Ok?: string;
  Err?: string;
}

export default function useClassifyPrompt(
  onSuccess?: (data: { message: string }) => void,
  onError?: (error: string) => void
) {
  return useMutation<ClassifyPromptResponse, Error, string>({
    mutationFn: async (text: string) => {
      if (!text.trim()) {
        throw new Error("Please enter some text to classify.");
      }
      return await backend.classify_prompt(text);
    },
    onSuccess: (data) => {
      if (data.Ok) {
        onSuccess?.({ message: data.Ok }); // ✅ Wrap string in an object
      } else if (data.Err) {
        onError?.(data.Err);
      }
    },
    onError: (error) => {
      onError?.(error.message || "Failed to classify the text. Please try again.");
    },
  });
}