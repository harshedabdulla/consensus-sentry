import { useState } from "react";
import useClassifyPrompt from "../hooks/use-classify-prompt"; 
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Classifier = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<
    { text: string; type: "user" | "bot"; result?: { message: string } }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: classifyPrompt } = useClassifyPrompt(
    (data) => {
      setMessages((prev) => [...prev, { text: inputText, type: "user" }]);
      setMessages((prev) => [
        ...prev,
        { text: "Result: " + data.message, type: "bot", result: data },
      ]);
      setError(null);
      setIsLoading(false);
      setInputText("");
    },
    (error) => {
      setError(error);
      setIsLoading(false);
    }
  );

  const handleClassify = () => {
    if (!inputText.trim()) {
      setError("Please enter some text to classify.");
      return;
    }

    setIsLoading(true);
    classifyPrompt(inputText);
  };

  return (
    <div className="relative h-screen bg-white flex flex-col">

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center">Start typing to classify your prompt!</p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-2 rounded-lg max-w-3/4 ${
              msg.type === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-300 text-black self-start"
            }`}
          >
            <p>{msg.text}</p>

            {/* Show chart if result exists */}
            {msg.result && (
              <div className="mt-2">
                <Bar
                  data={{
                    labels: ["Obscene", "Toxic"],
                    datasets: [
                      {
                        label: "Toxicity Level",
                        data: msg.result
                          ? [
                              parseFloat(msg.result.message.split(",")[0].split(":")[1]),
                              parseFloat(msg.result.message.split(",")[1].split(":")[1]),
                            ]
                          : [0, 0],
                        backgroundColor: [
                          "rgba(255, 99, 132, 0.6)",
                          "rgba(54, 162, 235, 0.6)",
                        ],
                        borderColor: [
                          "rgba(255, 99, 132, 1)",
                          "rgba(54, 162, 235, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 1 } },
                    plugins: {
                      legend: { display: true, position: "top" },
                      title: { display: true, text: "Toxicity Levels" },
                    },
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Field - Stuck to Bottom */}
      <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          onClick={handleClassify}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black disabled:bg-blue-300"
        >
          {isLoading ? "Classifying..." : "Send"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Classifier;
