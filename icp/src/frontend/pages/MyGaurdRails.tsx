import { useState, useEffect } from "react";
import useGetGuardrails from "../hooks/useGetGaurdRails";

interface Guardrail {
  id: string;
  name: string;
  category: string;
  rules: Rule[];
}

interface Rule {
  id: string;
  text: string;
  status: "Proposed" | "Voting" | "Approved" | "Rejected";
}

const MyGuardrails = () => {
  const [guardrails, setGuardrails] = useState<Guardrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { mutate } = useGetGuardrails(
    (data) => {
      setGuardrails(data.guardrails);
      setLoading(false);
    },
    (errorMsg) => {
      setError(errorMsg);
      setLoading(false);
    }
  );

  useEffect(() => {
    mutate();
  }, []);

  const renderRuleStatus = (status: "Proposed" | "Voting" | "Approved" | "Rejected") => {
    const statusColors = {
      Proposed: "bg-yellow-100 text-yellow-800",
      Voting: "bg-blue-100 text-blue-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800"
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div>Loading guardrails...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Guardrails</h2>
      {guardrails.length === 0 ? (
        <p>No guardrails created yet.</p>
      ) : (
        <div className="grid gap-4">
          {guardrails.map((guardrail) => (
            <div
              key={guardrail.id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{guardrail.name}</h3>
                <span className="text-sm text-gray-500">
                  {guardrail.category}
                </span>
              </div>
              <div className="mt-2">
                <h4 className="font-medium mb-2">Rules:</h4>
                {guardrail.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex justify-between items-center mb-1 p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{rule.text}</span>
                    {renderRuleStatus(rule.status)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGuardrails;