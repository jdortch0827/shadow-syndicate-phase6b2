import React from 'react';
export default function DisabledReason({ reason }) {
  if (!reason) return null;
  return <p className="disabled-reason">{reason}</p>;
}
