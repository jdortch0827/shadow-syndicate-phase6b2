import React, { useState } from "react";

export default function AlphaWorldMap({ bases = [], selfId }) {
  const [selected, setSelected] = useState(null);
  return <section className="alpha-world">
    <h3>Shadow City — Alpha Map</h3>
    <p>Select a base to inspect its location. Only server-authorized base records are displayed.</p>
    <div className="alpha-map-viewport">
      <svg viewBox="0 0 800 560" role="img" aria-label="Shadow City world map">
        <defs><pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#8a785a" strokeOpacity=".3"/></pattern></defs>
        <rect width="800" height="560" fill="#121b20"/>
        <rect width="800" height="560" fill="url(#cityGrid)"/>
        <path d="M0 400Q200 330 410 400T800 320" fill="none" stroke="#274758" strokeWidth="60"/>
        {bases.map(base => {
          const x = 15 + Math.max(0, Math.min(999, Number(base.x))) * .77;
          const y = 15 + Math.max(0, Math.min(999, Number(base.y))) * .53;
          const own = base.user_id === selfId;
          return <g key={base.user_id} onClick={() => setSelected(base)} style={{cursor:"pointer"}}>
            <circle cx={x} cy={y} r={own ? 16 : 12} fill={own ? "#c49b50" : "#a5474d"} stroke="#f3d9a0" strokeWidth="2"/>
            <text x={x} y={y + 29} fill="#fff0ce" textAnchor="middle" fontSize="13">{own ? "Your Base" : "Base"}</text>
          </g>;
        })}
      </svg>
    </div>
    <p>{bases.length} visible base{bases.length === 1 ? "" : "s"}{selected ? " · Selected coordinates: " + selected.x + ", " + selected.y : ""}</p>
  </section>;
}
