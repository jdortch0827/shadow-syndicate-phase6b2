import React from 'react';
export default function RequirementList({ items = [] }) {
  const clean = items.filter(Boolean);
  if (!clean.length) return null;
  return <ul className="requirement-list">{clean.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
}
