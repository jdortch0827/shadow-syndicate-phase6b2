import React from "react";

// Phase 1.53: home-only cinematic visual pass. Existing game content and logic are unchanged.
const cinematicHomeStyles = ".home-page{position:relative;isolation:isolate;--cinema-gold:#e6b66c;background:radial-gradient(ellipse at 76% 0%,rgba(155,90,35,.15),transparent 54%),linear-gradient(180deg,rgba(9,10,15,.12),rgba(7,8,12,.22));}\n.home-page::before{content:\"\";position:absolute;inset:0 0 auto;height:min(65vh,600px);z-index:-1;pointer-events:none;background:radial-gradient(ellipse at 55% 10%,rgba(203,141,67,.10),transparent 66%);}\n.home-page .panel,.home-page .art-card,.home-page .command-card{border-color:rgba(224,177,105,.28);background-color:rgba(14,16,23,.9);box-shadow:0 16px 38px rgba(0,0,0,.33),inset 0 1px rgba(255,255,255,.04);transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease;}\n.home-page .command-card:hover,.home-page .art-card:hover{transform:translateY(-3px);border-color:rgba(239,192,115,.58);box-shadow:0 20px 42px rgba(0,0,0,.48),0 0 22px rgba(194,124,52,.09);}\n.home-page h1,.home-page h2,.home-page h3{letter-spacing:.025em;text-shadow:0 2px 15px rgba(0,0,0,.5);}\n.home-page button:focus-visible,.home-page a:focus-visible{outline:2px solid var(--cinema-gold);outline-offset:3px;}\n@media(prefers-reduced-motion:reduce){.home-page .command-card,.home-page .art-card{transition:none}.home-page .command-card:hover,.home-page .art-card:hover{transform:none}}\n";

export default function HomePage({ children }) {
  return (
    <div className="page-shell home-page">
      <style>{cinematicHomeStyles}</style>
      {children}
    </div>
  );
}
