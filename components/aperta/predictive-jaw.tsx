"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, History, TrendingUp, Activity, Sliders, ShieldCheck } from "lucide-react";

interface PredictiveJawProps {
  currentOpening?: number;
  baselineOpening?: number;
  targetOpening?: number;
}

export function PredictiveJaw({
  currentOpening = 28.5,
  baselineOpening = 18.0,
  targetOpening = 42.0,
}: PredictiveJawProps) {
  const [openingMM, setOpeningMM] = useState<number>(currentOpening);
  const [showPastGhost, setShowPastGhost] = useState<boolean>(true);
  const [showFutureProjection, setShowFutureProjection] = useState<boolean>(true);

  // Exact kinematics from APERTA Rev D Blueprint Sheet 7:
  // opening_mm = 11.0 + 2 * L * sin(beta / 2), where L = 101mm
  // Invert formula to find arm rotation beta from millimeters
  const mmToBetaDegrees = (mm: number) => {
    const clampedMM = Math.max(11.0, Math.min(54.0, mm));
    const sinHalfBeta = (clampedMM - 11.0) / (2 * 101.0);
    const betaRad = 2 * Math.asin(Math.max(0, Math.min(1, sinHalfBeta)));
    return (betaRad * 180) / Math.PI;
  };

  const currentBeta = mmToBetaDegrees(openingMM);
  const baselineBeta = mmToBetaDegrees(baselineOpening);
  const targetBeta = mmToBetaDegrees(targetOpening);

  // Mandibular TMJ anatomical rotation scale (condyle coordinate at [220, 160])
  const jawPivot = { x: 220, y: 160 };
  // APERTA device hinge pin coordinate at [330, 246]
  const devicePivot = { x: 330, y: 246 };

  const gainPct = Math.round(((openingMM - baselineOpening) / baselineOpening) * 100);
  const predictedWeeksRemaining = Math.max(0, Math.ceil((targetOpening - openingMM) / 2.0));

  return (
    <section id="predictive-jaw" className="py-24 bg-[#0A0F1D] text-slate-100 relative overflow-hidden">
      {/* Background Subtle Medical Grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#00AEEF 1px, transparent 1px), linear-gradient(90deg, #00AEEF 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00AEEF]/10 border border-[#00AEEF]/30 text-[#00AEEF] text-xs font-mono font-medium tracking-wide uppercase mb-4">
            <BrainCircuit className="w-3.5 h-3.5" />
            Biomechanical Simulation // APERTA Rev D in situ
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Craniofacial Mandibular Kinematics
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Anatomical bone structure integrated with the APERTA Rev D bench prototype. Real-time telemetry, baseline restriction, and projected recovery.
          </p>
        </div>

        {/* Main Simulation Viewport Card */}
        <div className="bg-[#0F172A]/90 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-10 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Controls & Clinical Indicators */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                Kinematic Projection Layers
              </span>

              {/* Past Baseline Toggle */}
              <button
                onClick={() => setShowPastGhost(!showPastGhost)}
                className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  showPastGhost
                    ? "bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-lg shadow-rose-950/20"
                    : "bg-slate-900/50 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                  <div>
                    <div className="text-xs font-bold">Past (Baseline Contracture)</div>
                    <div className="text-[11px] font-mono text-rose-300/80">
                      {baselineOpening.toFixed(1)} mm // Initial Pathology
                    </div>
                  </div>
                </div>
                <History className="w-4 h-4 text-rose-400" />
              </button>

              {/* Present Live Indicator */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-cyan-500/50 bg-cyan-950/30 text-cyan-100 shadow-lg shadow-cyan-950/30">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#00AEEF] animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-white">Present (Live Articulation)</div>
                    <div className="text-[11px] font-mono text-[#00AEEF]">
                      {openingMM.toFixed(1)} mm (Angle: {currentBeta.toFixed(1)}°)
                    </div>
                  </div>
                </div>
                <Activity className="w-4 h-4 text-[#00AEEF]" />
              </div>

              {/* Future Projection Toggle */}
              <button
                onClick={() => setShowFutureProjection(!showFutureProjection)}
                className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  showFutureProjection
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-lg shadow-emerald-950/20"
                    : "bg-slate-900/50 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                  <div>
                    <div className="text-xs font-bold">Future (Gompertz Forecast)</div>
                    <div className="text-[11px] font-mono text-emerald-300/80">
                      {targetOpening.toFixed(1)} mm // Physiological Goal
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </button>

              {/* Clinical Metric Breakdown */}
              <div className="mt-2 p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Interincisal Gain:</span>
                  <span className="font-mono font-bold text-[#00AEEF]">+{gainPct}% from baseline</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Est. Time to Target:</span>
                  <span className="font-mono font-bold text-emerald-400">~{predictedWeeksRemaining} weeks</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Rev D Stop Post:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {openingMM <= 25 ? "25mm Post" : openingMM <= 30 ? "30mm Post" : openingMM <= 35 ? "35mm Post" : openingMM <= 40 ? "40mm Post" : "45mm Post"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-[#00AEEF] shrink-0" />
                <span>Dual silicone bite pads prevent tooth wear. Closed tip thickness: 11.0 mm.</span>
              </div>
            </div>

            {/* Right: Parametric Anatomical Skull & APERTA Rev D Hardware Render */}
            <div className="lg:col-span-8 flex flex-col items-center justify-center bg-[#070B14] rounded-2xl border border-slate-800/80 p-4 sm:p-6 shadow-inner relative overflow-hidden min-h-[460px]">
              
              <svg viewBox="0 0 680 440" className="w-full h-auto max-w-[640px] overflow-visible select-none">
                <defs>
                  {/* Bone Gradients for Realistic Shading */}
                  <linearGradient id="craniumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F1F5F9" />
                    <stop offset="60%" stopColor="#CBD5E1" />
                    <stop offset="100%" stopColor="#94A3B8" />
                  </linearGradient>

                  <linearGradient id="mandibleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E2E8F0" />
                    <stop offset="80%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#64748B" />
                  </linearGradient>

                  {/* Rev D PETG Plastic Shading */}
                  <linearGradient id="caseBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="50%" stopColor="#0F172A" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>
                </defs>

                {/* ---------------- CRANIUM (Fixed Maxilla & Calvaria) ---------------- */}
                <g id="cranium" fill="url(#craniumGrad)" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round">
                  {/* Calvaria / Frontal / Parietal / Occipital Dome */}
                  <path d="M 120 180 C 80 130, 90 40, 190 25 C 270 12, 330 50, 340 120 C 345 150, 335 180, 325 210 C 310 215, 305 228, 298 245 L 260 245 C 255 235, 240 225, 230 225 C 220 225, 215 210, 210 205 C 190 205, 175 195, 160 190 C 135 190, 125 185, 120 180 Z" />

                  {/* Eye Orbit Cavity (Dark bone interior) */}
                  <ellipse cx="280" cy="140" rx="28" ry="32" fill="#090D16" stroke="#475569" strokeWidth="1.5" />
                  <ellipse cx="282" cy="138" rx="23" ry="27" fill="#0F172A" opacity="0.9" />

                  {/* Zygomatic Arch Bridge */}
                  <path d="M 220 165 C 250 160, 275 170, 305 178 L 305 188 C 275 180, 250 172, 220 178 Z" fill="#CBD5E1" stroke="#334155" strokeWidth="1" />

                  {/* Nasal Aperture (Pyriform) */}
                  <path d="M 315 185 C 318 195, 316 210, 310 215 C 304 212, 305 195, 315 185 Z" fill="#090D16" stroke="#475569" strokeWidth="1" />

                  {/* Maxilla & Upper Teeth Row */}
                  <g fill="#FFFFFF" stroke="#334155" strokeWidth="1.2">
                    <rect x="272" y="244" width="7" height="11" rx="1.5" />
                    <rect x="281" y="244" width="7.5" height="12" rx="1.5" />
                    <rect x="290" y="244" width="9" height="13" rx="1.8" />
                  </g>
                </g>

                {/* TMJ Condyle Marker */}
                <circle cx={jawPivot.x} cy={jawPivot.y} r="5" fill="#00AEEF" />
                <circle cx={jawPivot.x} cy={jawPivot.y} r="1.5" fill="#FFFFFF" />
                <text x="175" y="152" fill="#00AEEF" fontSize="9" fontFamily="monospace">TMJ Pivot</text>

                {/* ---------------- GHOST 1: Past Baseline Mandible (Severe Trismus) ---------------- */}
                {showPastGhost && (
                  <g
                    transform={`rotate(${baselineBeta * 0.45} ${jawPivot.x} ${jawPivot.y})`}
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.65"
                  >
                    <path d="M 220 160 L 225 210 C 230 255, 245 285, 275 285 L 300 282 C 308 280, 310 270, 305 260 L 298 255 L 265 255 C 250 255, 235 240, 230 200 Z" />
                    <text x="312" y="278" fill="#F43F5E" fontSize="9" fontFamily="monospace">
                      18mm Baseline
                    </text>
                  </g>
                )}

                {/* ---------------- GHOST 2: Future Target Mandible (Target Opening) ---------------- */}
                {showFutureProjection && (
                  <g
                    transform={`rotate(${targetBeta * 0.45} ${jawPivot.x} ${jawPivot.y})`}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.75"
                  >
                    <path d="M 220 160 L 225 210 C 230 255, 245 285, 275 285 L 300 282 C 308 280, 310 270, 305 260 L 298 255 L 265 255 C 250 255, 235 240, 230 200 Z" />
                    <text x="312" y="325" fill="#10B981" fontSize="9" fontFamily="monospace">
                      42mm Target
                    </text>
                  </g>
                )}

                {/* ---------------- ARTICULATING MANDIBLE (Present Live Position) ---------------- */}
                <g
                  transform={`rotate(${currentBeta * 0.45} ${jawPivot.x} ${jawPivot.y})`}
                  style={{ transition: "transform 0.12s ease-out" }}
                >
                  {/* Mandible Body & Ramus */}
                  <path
                    d="M 220 160 L 225 210 C 230 255, 245 285, 275 285 L 300 282 C 308 280, 310 270, 305 260 L 298 255 L 265 255 C 250 255, 235 240, 230 200 Z"
                    fill="url(#mandibleGrad)"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Lower Incisors Teeth Row */}
                  <g fill="#FFFFFF" stroke="#334155" strokeWidth="1.2">
                    <rect x="272" y="255" width="7" height="11" rx="1.5" />
                    <rect x="281" y="254" width="7.5" height="12" rx="1.5" />
                    <rect x="290" y="252" width="9" height="13" rx="1.8" />
                  </g>
                </g>

                {/* ========================================================================= */}
                {/* APERTA REV D HARDWARE PROTOTYPE IN SITU (CAD Accurate)                      */}
                {/* ========================================================================= */}

                {/* 1. UPPER FIXED LIMB (P01) & LOAD CELL CLAMP BAR */}
                <g id="aperta-upper-assembly">
                  {/* Upper bite limb entering mouth between upper teeth */}
                  <path
                    d="M 275 242 L 330 242 L 350 240 L 375 240 L 375 250 L 325 250 L 275 246 Z"
                    fill="#334155"
                    stroke="#64748B"
                    strokeWidth="1"
                  />
                  {/* Upper Silicone Bite Pad (Rev D outer face) */}
                  <rect x="275" y="238" width="24" height="4" rx="1.5" fill="#00AEEF" stroke="#38BDF8" strokeWidth="1" />

                  {/* 5kg/10kg Aluminum Load Cell Bar (80x12.7mm) */}
                  <rect x="345" y="236" width="60" height="10" rx="1" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                  <rect x="360" y="237.5" width="30" height="7" rx="1" fill="#CBD5E1" />
                  <text x="364" y="243" fill="#0F172A" fontSize="5" fontFamily="monospace" fontWeight="bold">LOAD CELL</text>

                  {/* P07 Sensor Cover (over AS5600 Angle Sensor) */}
                  <rect x="320" y="235" width="22" height="26" rx="3" fill="#1E293B" stroke="#00AEEF" strokeWidth="1.5" />
                  <circle cx="330" cy="246" r="3.5" fill="#00AEEF" />
                  <text x="314" y="270" fill="#00AEEF" fontSize="6" fontFamily="monospace">AS5600</text>
                </g>

                {/* 2. MAIN ELECTRONICS HOUSING CASE (P05/P06 108x74x55mm) */}
                <g id="aperta-case-body">
                  {/* Main Enclosure Body */}
                  <rect x="405" y="210" width="165" height="85" rx="7" fill="url(#caseBodyGrad)" stroke="#38BDF8" strokeWidth="1.8" />
                  
                  {/* Raised Top Hump with Thumb Release Slot (Rev D) */}
                  <path d="M 470 210 L 470 190 L 535 190 L 545 210 Z" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                  
                  {/* One-Touch Thumb Release Lever Tab */}
                  <rect x="495" y="178" width="16" height="14" rx="2" fill="#FF6B35" stroke="#FFA07A" strokeWidth="1" />
                  <text x="480" y="172" fill="#FF6B35" fontSize="7" fontFamily="monospace" fontWeight="bold">RELEASE TAB</text>

                  {/* OLED 0.96" Telemetry Window */}
                  <rect x="430" y="222" width="46" height="28" rx="3" fill="#020617" stroke="#00AEEF" strokeWidth="1" />
                  <text x="434" y="234" fill="#00AEEF" fontSize="6" fontFamily="monospace">APERTA v1.0</text>
                  <text x="434" y="243" fill="#38BDF8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    {openingMM.toFixed(1)} mm
                  </text>

                  {/* Brand Engraving */}
                  <text x="500" y="236" fill="#F8FAFC" fontSize="13" fontFamily="sans-serif" fontWeight="900" letterSpacing="2">
                    APERTA
                  </text>
                  <text x="502" y="247" fill="#64748B" fontSize="6.5" fontFamily="monospace">
                    REV D // ESP32
                  </text>

                  {/* Front Micro-USB & Rear USB-C Ports */}
                  <rect x="402" y="260" width="4" height="8" rx="1" fill="#94A3B8" />
                  <rect x="568" y="235" width="4" height="10" rx="1" fill="#94A3B8" />
                </g>

                {/* 3. LOWER ARTICULATING RATCHET ARM (P03) WITH STOP POST & FINGER SCALLOPS */}
                <g
                  id="aperta-lower-arm"
                  transform={`rotate(${currentBeta} ${devicePivot.x} ${devicePivot.y})`}
                  style={{ transition: "transform 0.12s ease-out" }}
                >
                  {/* Lower arm blade extending into mouth */}
                  <path
                    d="M 275 258 L 330 250 L 350 262 L 405 285 L 530 285 C 530 285, 520 300, 510 300 C 500 300, 490 295, 480 295 C 470 295, 460 300, 450 300 C 440 300, 430 295, 420 295 L 350 280 L 320 258 Z"
                    fill="#1E293B"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  {/* Lower Silicone Bite Pad (Rev D outer face, contacts lower teeth) */}
                  <rect x="275" y="258" width="24" height="4" rx="1.5" fill="#00AEEF" stroke="#38BDF8" strokeWidth="1" />

                  {/* Toothed Ratchet Arc (2.2mm pitch quadrant) */}
                  <path d="M 370 240 A 45 45 0 0 1 390 280 L 378 280 A 35 35 0 0 0 360 245 Z" fill="#00AEEF" opacity="0.6" />
                  
                  {/* Stop Post (P09 30mm safety post) */}
                  <rect x="400" y="270" width="8" height="16" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                </g>

                {/* Clinical Caliper Measurement Overlay */}
                <g stroke="#00AEEF" strokeWidth="1.8">
                  {/* Upper Incisal Guide Line */}
                  <line x1="298" y1="244" x2="240" y2="244" strokeDasharray="3 3" />
                  {/* Lower Incisal Guide Line (moves with mandibular articulation) */}
                  <line
                    x1="298"
                    y1={244 + (currentBeta * 1.5)}
                    x2="240"
                    y2={244 + (currentBeta * 1.5)}
                    strokeDasharray="3 3"
                  />
                  {/* Caliper Bar */}
                  <line x1="245" y1="244" x2="245" y2={244 + (currentBeta * 1.5)} />
                  <circle cx="245" cy="244" r="3" fill="#00AEEF" />
                  <circle cx="245" cy={244 + (currentBeta * 1.5)} r="3" fill="#00AEEF" />
                  
                  <text
                    x="232"
                    y={248 + (currentBeta * 1.5) / 2}
                    fill="#38BDF8"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {openingMM.toFixed(1)} mm
                  </text>
                </g>
              </svg>

              {/* Slider for Interactive Demonstrations */}
              <div className="w-full mt-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#00AEEF]" />
                    Interactive Displacement Sweep
                  </span>
                  <span className="text-cyan-400 font-bold">{openingMM.toFixed(1)} mm</span>
                </div>
                <input
                  type="range"
                  min="18.0"
                  max="45.0"
                  step="0.1"
                  value={openingMM}
                  onChange={(e) => setOpeningMM(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00AEEF]"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>18.0 mm (Severe Trismus)</span>
                  <span>30.0 mm (Functional Target)</span>
                  <span>45.0 mm (Full Physiological)</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}