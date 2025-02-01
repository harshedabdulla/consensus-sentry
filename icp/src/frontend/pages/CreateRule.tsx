import { useState } from "react";

// Define types
type Message = {
  text: string;
  type: "user" | "bot";
};

type Guardrail = {
  name: string;
  category: string;
  rules: string[];
};

const categories = ["Education", "Finance", "Health", "Social Media", "Legal", "Corporate", "Technology", "Custom"];

const CreateRule = () => {
  const [step, setStep] = useState(0);
  const [guardrail, setGuardrail] = useState<Guardrail>({ name: "", category: "", rules: [] });
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const initialRuleSuggestions = [
    "Avoid misinformation",
    "Ensure content safety",
    "Promote ethical discussions",
    "Filter inappropriate language",
  ];

  const handleNext = () => {
    if (step === 0 && inputText.trim()) {
      setGuardrail((prev) => ({ ...prev, name: inputText.trim() }));
      setMessages([...messages, { text: inputText, type: "user" }]);
      setStep(1);
      setInputText("");
    } else if (step === 2 && inputText.trim()) {
      setGuardrail((prev) => ({ ...prev, rules: [...prev.rules, inputText.trim()] }));
      setMessages([...messages, { text: inputText, type: "user" }]);
      setInputText("");
    }
  };

  const selectCategory = (category: string) => {
    setGuardrail((prev) => ({ ...prev, category }));
    setMessages([...messages, { text: category, type: "user" }]);
    setStep(2);
  };

  const handleFinish = () => {
    setIsLoading(true);
    setMessages([...messages, { text: "Creating guardrail...", type: "bot" }]);

    // Simulate an API call or blockchain transaction
    setTimeout(() => {
      console.log("Final Guardrail Configuration:", guardrail);
      setMessages([...messages, { text: "Guardrail created successfully!", type: "bot" }]);
      setIsLoading(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col justify-between bg-white p-6">
      {/* Chat Messages */}
      <div className="overflow-y-auto flex-1 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-2 rounded-lg max-w-3/4 ${msg.type === "user" ? "bg-black text-white ml-auto" : "bg-gray-300 text-black"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Chat Input & Steps */}
      <div className="mb-4 rounded-lg">
        {step === 0 && <p className="mb-2">What is the name of your guardrail?</p>}
        {step === 1 && <p className="mb-2">Select a category:</p>}
        {step === 2 && <p className="mb-2">Add initial rules (press Enter to add more, or click 'Finish'):</p>}

        {step === 1 ? (
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => selectCategory(category)}
                className="p-2 border rounded-lg hover:bg-blue-200"
              >
                {category}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
            placeholder="Type here..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        )}

        {step === 2 && (
          <div className="mt-2">
            <p className="text-gray-500 mb-1">Suggestions:</p>
            <div className="flex gap-2 flex-wrap">
              {initialRuleSuggestions.map((rule) => (
                <button
                  key={rule}
                  onClick={() => setGuardrail((prev) => ({ ...prev, rules: [...prev.rules, rule] }))}
                  className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={isLoading}
                >
                  {rule}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Finish Button */}
      {step === 2 && (
        <button
          onClick={handleFinish}
          disabled={isLoading}
          className="mt-4 w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:bg-green-300"
        >
          {isLoading ? "Creating..." : "Finish"}
        </button>
      )}
    </div>
  );
};

export default CreateRule;