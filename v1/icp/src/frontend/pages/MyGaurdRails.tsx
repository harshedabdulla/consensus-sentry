// GuardrailDetails.tsx
import React, { useEffect, useState } from "react";
import { useGetGuardrail } from "../hooks/useGetGaurdRail";
// Import the Guardrail type from your backend declarations
import { Guardrail } from "../../backend/declarations/backend.did";

const MyGaurdRails: React.FC = () => {
  const { mutate: fetchGuardrail, data, isPending, isError, error } = useGetGuardrail();
  const [guardrail, setGuardrail] = useState<Guardrail | null>(null);

  useEffect(() => {
    const guardrailId = sessionStorage.getItem("guardrailId");
    if (guardrailId) {
      fetchGuardrail(guardrailId);
    }
  }, [fetchGuardrail]);

  useEffect(() => {
    if (data && 'Ok' in data) {
      setGuardrail(data.Ok);
    }
  }, [data]);

  if (isPending) {
    return <div>Loading guardrail details...</div>;
  }

  if (isError) {
    return <div>Error loading guardrail: {error instanceof Error ? error.message : "Unknown error"}</div>;
  }

  if (data && 'Err' in data) {
    return <div>Error: {data.Err}</div>;
  }

  if (!guardrail) {
    return <div>No guardrail found. Please check the ID.</div>;
  }

  return (
    <div className="guardrail-details">
      <h2>Guardrail Details</h2>
      <div className="details-container">
        <div className="detail-item">
          <span className="label">ID:</span>
          <span className="value">{guardrail.id}</span>
        </div>
        {/* Render only the properties that exist in your actual Guardrail type */}
        {guardrail.name && (
          <div className="detail-item">
            <span className="label">Name:</span>
            <span className="value">{guardrail.name}</span>
          </div>
        )}
        {/* Add conditional rendering for other properties */}
        {/* For example, if description exists: */}
        {/* Add more guardrail properties as needed */}
      </div>
    </div>
  );
};

export default MyGaurdRails;