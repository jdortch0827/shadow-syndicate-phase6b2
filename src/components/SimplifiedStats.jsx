import React from "react";
import PlayerQuickStats from "./PlayerQuickStats";

export default function SimplifiedStats({ stats = [], beginner = true, children }) {
  const core = stats.filter((s) => s.core || !beginner);
  return <PlayerQuickStats stats={core}>{children}</PlayerQuickStats>;
}
