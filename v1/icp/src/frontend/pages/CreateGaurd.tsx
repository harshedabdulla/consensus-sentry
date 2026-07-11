import { useState, useEffect } from "react";
import { Principal } from '@dfinity/principal';
import useCreateGuardrail from "../hooks/useCreateGuardrail";

// Define types
type Rule = {
  id: string;
  text: string;
  status: "Proposed" | "Voting" | "Approved" | "Rejected";
};

type CreateGuardrailResponse = {
  guardrailId: string;
};

type Guardrail = {
  id: string;
  name: string;
  category: string;
  rules: Rule[];
  owner: Principal;
  created_at: bigint;
};

type ChatMessage = {
  text: string;
  type: "user" | "bot";
};

// Constants
const categories = [
  "Education", "Finance", "Health", "Social Media",
  "Legal", "Corporate", "Technology", "Custom"
];

const initialRuleSuggestions = [
  {
    category: "Education",
    rules: [
      "Verify academic credentials",
      "Ensure content accuracy",
      "Protect student privacy",
      "Maintain academic integrity"
    ]
  },
  {
    category: "Finance",
    rules: [
      "Validate financial data",
      "Ensure regulatory compliance",
      "Protect sensitive information",
      "Monitor transaction patterns"
    ]
  }
];

const CreateGuard = () => {
  // State management
  const [step, setStep] = useState(0);
  const [guardrail, setGuardrail] = useState<Guardrail>({
    id: crypto.randomUUID(),
    name: "",
    category: "",
    rules: [],
    owner: Principal.fromText("dvjm4-qgttz-pi6en-pzsqa-pos53-tizlb-crg4y-xywvo-xb2kn-intwa-dqe"),
    created_at: BigInt(Date.now())
  });
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [suggestedRulesList, setSuggestedRulesList] = useState<string[]>([]);

  // Custom hook for creating guardrails
  const createGuardrailMutation = useCreateGuardrail(
    (data: CreateGuardrailResponse) => {
      // Store the guardrail ID in session storage
      sessionStorage.setItem('guardrailId', data.guardrailId);
      addMessage(`Guardrail created with ID: ${data.guardrailId}`, "bot");
      setStep(3);
    },
    (error: string) => {
      addMessage(`Error: ${error}`, "bot");
    }
  );

  // Effect to update suggested rules based on category
  useEffect(() => {
    if (guardrail.category) {
      const categoryRules = initialRuleSuggestions.find(
        s => s.category === guardrail.category
      )?.rules || [];
      setSuggestedRulesList(categoryRules);
    }
  }, [guardrail.category]);

  // Helper function to add chat messages
  const addMessage = (text: string, type: "user" | "bot") => {
    setChatMessages(prev => [...prev, { text, type }]);
  };

  // Handle next step in the flow
  const handleNext = () => {
    if (!inputText.trim()) return;

    switch (step) {
      case 0:
        setGuardrail(prev => ({ ...prev, name: inputText.trim() }));
        addMessage(inputText, "user");
        addMessage("Please select a category for your guardrail:", "bot");
        setStep(1);
        break;
      case 2:
        const newRule: Rule = {
          id: crypto.randomUUID(),
          text: inputText.trim(),
          status: "Proposed"
        };
        setGuardrail(prev => ({
          ...prev,
          rules: [...prev.rules, newRule]
        }));
        addMessage(`Added rule: ${inputText}`, "user");
        break;
    }
    setInputText("");
  };

  // Handle category selection
  const selectCategory = (category: string) => {
    setGuardrail(prev => ({ ...prev, category }));
    addMessage(`Selected category: ${category}`, "user");
    addMessage("Now, let's add some rules. You can type your own or select from suggestions.", "bot");
    setStep(2);
  };

  // Add a suggested rule
  const addSuggestedRule = (ruleText: string) => {
    const newRule: Rule = {
      id: crypto.randomUUID(),
      text: ruleText,
      status: "Proposed"
    };
    setGuardrail(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
    addMessage(`Added suggested rule: ${ruleText}`, "user");
  };

  // Handle finishing the guardrail creation
  const handleFinish = () => {
    createGuardrailMutation.mutate(guardrail);
  };

  return (
    <div className="h-screen flex flex-col justify-between bg-white p-6">
      {/* Chat Messages */}
      <div className="overflow-y-auto flex-1 mb-4">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 my-2 rounded-lg max-w-3/4 ${
              msg.type === "user"
                ? "bg-gray-900 text-white ml-auto"
                : "bg-gray-50 text-gray-900 border border-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded-lg">
        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Guardrail</h2>
            <p className="text-gray-600">What is the name of your guardrail?</p>
          </div>
        )}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Category</h2>
            <p className="text-gray-600">Choose a category for your guardrail:</p>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Rules</h2>
            <p className="text-gray-600">Add rules for your guardrail (current count: {guardrail.rules.length})</p>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="mb-4">
        {step === 1 ? (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
              >
                {category}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              placeholder={step === 0 ? "Enter guardrail name..." : "Type a rule..."}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 placeholder-gray-500"
              disabled={createGuardrailMutation.isPending || step === 3}
            />
          </div>
        )}

        {step === 2 && suggestedRulesList.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Suggested Rules:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedRulesList.map((rule) => (
                <button
                  key={rule}
                  onClick={() => addSuggestedRule(rule)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  disabled={createGuardrailMutation.isPending}
                >
                  {rule}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Finish Button */}
      <div className="flex gap-2">
        {step === 2 && guardrail.rules.length > 0 && (
          <button
            onClick={handleFinish}
            disabled={createGuardrailMutation.isPending}
            className="w-full bg-gray-900 text-white p-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            {createGuardrailMutation.isPending ? "Creating..." : "Finish"}
          </button>
        )}
      </div>

      {/* Success Message */}
      {step === 3 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">Guardrail Created!</h3>
          <p className="text-green-700">
            Your guardrail has been created. Rules have been submitted for voting.
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateGuard;