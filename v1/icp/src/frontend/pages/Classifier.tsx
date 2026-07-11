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
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center">Start typing to classify your prompt!</p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 my-2 rounded-lg max-w-3/4 ${
              msg.type === "user"
                ? "bg-gray-900 text-white ml-auto"
                : "bg-gray-50 text-gray-900 border border-gray-200"
            }`}
          >
            <p>{msg.text}</p>

            {/* Show chart if result exists */}
            {msg.result && (
              <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
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
                          "rgba(17, 24, 39, 0.7)",  // Dark gray (matches gray-900)
                          "rgba(55, 65, 81, 0.7)",  // Slightly lighter gray (matches gray-800)
                        ],
                        borderColor: [
                          "rgba(17, 24, 39, 1)",  // gray-900
                          "rgba(55, 65, 81, 1)",  // gray-800
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { 
                      y: { 
                        beginAtZero: true, 
                        max: 1,
                        grid: {
                          color: "rgba(229, 231, 235, 0.6)" // gray-200
                        },
                        ticks: {
                          color: "rgba(107, 114, 128, 1)" // gray-500
                        }
                      },
                      x: {
                        grid: {
                          color: "rgba(229, 231, 235, 0.6)" // gray-200
                        },
                        ticks: {
                          color: "rgba(107, 114, 128, 1)" // gray-500
                        }
                      }
                    },
                    plugins: {
                      legend: { 
                        display: true, 
                        position: "top",
                        labels: {
                          color: "rgba(55, 65, 81, 1)" // gray-700
                        }
                      },
                      title: { 
                        display: true, 
                        text: "Toxicity Levels",
                        color: "rgba(17, 24, 39, 1)" // gray-900
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Field - Stuck to Bottom */}
      <div className="absolute bottom-0 left-0 w-full bg-white py-8 px-4 border-gray-200 flex items-center space-x-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isLoading && handleClassify()}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 placeholder-gray-500"
          disabled={isLoading}
        />
        <button
          onClick={handleClassify}
          disabled={isLoading}
          className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? "Classifying..." : "Send"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-20 left-0 w-full px-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classifier;