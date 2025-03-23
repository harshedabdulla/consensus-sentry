import { useState, useEffect } from "react";
import { useGetAllGuardrails } from "../hooks/useGetAllGaurdRails";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Rule {
  id: string;
  text: string;
  status: {
    Proposed?: null;
    Voting?: null;
    Approved?: null;
    Rejected?: null;
  };
  votes: number;
}

interface Guardrail {
  id: string;
  name: string;
  rules: Rule[];
  category: string;
  owner: any;
  created_at: bigint;
}

const GuardrailsList = () => {
  const { mutate: getAllGuardrails, data, status } = useGetAllGuardrails();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getAllGuardrails();
  }, []);

  const formatDate = (timestamp: string | number | bigint): string => {
    return new Date(Number(timestamp)).toLocaleDateString();
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  if (status === "pending") {
    return <div className="p-4 text-center text-lg font-medium">Loading...</div>;
  }

  return (
    <div className="space-y-4 p-4 mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">All Guardrails</h2>

      {data?.map((guardrail) => (
        <GuardrailItem
          key={guardrail.id}
          guardrail={guardrail}
          expanded={expandedIds.has(guardrail.id)}
          onToggle={() => toggleExpand(guardrail.id)}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

const GuardrailItem = ({
  guardrail,
  expanded,
  onToggle,
  formatDate,
}: {
  guardrail: Guardrail;
  expanded: boolean;
  onToggle: () => void;
  formatDate: (timestamp: string | number | bigint) => string;
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-transform transform hover:scale-[1.01]">
      <div
        className="p-5 flex justify-between items-center cursor-pointer bg-gradient-to-r from-gray-100 to-gray-50"
        onClick={onToggle}
      >
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{guardrail.name}</h3>
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium text-gray-700">Category:</span> {guardrail.category}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{formatDate(guardrail.created_at)}</span>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="p-5">
          <h3 className="font-semibold text-gray-700 mb-2">Rules:</h3>
          <div className="space-y-3">
            {guardrail.rules.map((rule) => (
              <RuleItem key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const RuleItem = ({ rule }: { rule: Rule }) => {
  const getStatusStyles = (status: Rule["status"]) => {
    const statusMap = {
      Proposed: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
      Voting: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
      Approved: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
      Rejected: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
    };

    const statusKey = Object.keys(status)[0] as keyof typeof statusMap;
    return statusMap[statusKey] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
  };

  const { bg, text, border } = getStatusStyles(rule.status);

  return (
    <div className={`p-4 rounded-lg border ${border} ${bg} flex justify-between items-center`}>
      <span className={`font-medium ${text}`}>{rule.text}</span>
      <div className="flex items-center space-x-3 text-sm">
        <span className={`font-semibold ${text}`}>{Object.keys(rule.status)[0]}</span>
        <span className="text-gray-600">Votes: {rule.votes}</span>
      </div>
    </div>
  );
};

export default GuardrailsList;