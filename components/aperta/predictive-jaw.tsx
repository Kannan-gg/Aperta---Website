"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, BrainCircuit, History, Sparkles, TrendingUp, Compass } from "lucide-react";

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

  // Conversion: 18mm -> ~0 deg, 45mm -> ~18 deg mandibular rotation around TMJ condyle
  const mmToRotation = (mm: number) => Math.max(0, ((mm - 18) / (45 - 18)) * 18);

  const currentRotation = mmToRotation(openingMM);
  const baselineRotation = mmToRotation(baselineOpening);
  const futureRotation = mmToRotation(targetOpening);

  const gainPct = Math.round(((openingMM - baselineOpening) / baselineOpening) * 100);
  const predictedWeeksRemaining = Math.max(0, Math.ceil((targetOpening - openingMM) / 2.0));

  return (
    <section id="predictive-jaw" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-xs font-mono font-medium tracking-wide uppercase mb-4">
            <BrainCircuit className="w-3.5 h-3.5" />
            Craniofacial Kinematics // Past • Present • Predicted
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#020B44] tracking-tight mb-4">
            Dynamic Mandibular Projection
          </h2>
          <p className="text-base sm:text-lg text-[#64748B]">
            Simulating masticatory compliance. Compare baseline contracture, real-time articulation, and predicted clinical endpoints.
          </p>
        </div>

        {/* Visualizer Container */}
        <div className="bg-[#F8FAFC] rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Viewport Controls & Legend */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Projection Filters
              </span>

              {/* Past Toggle */}
              <button
                onClick={() => setShowPastGhost(!showPastGhost)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  showPastGhost
                    ? "bg-rose-50 border-rose-200 text-rose-800 shadow-sm"
                    : "bg-white border-slate-200 text-slate-400 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div>
                    <div className="text-xs font-bold">Past (Baseline Contracture)</div>
                    <div className="text-[11px] font-mono text-slate-500">{baselineOpening.toFixed(1)} mm // Severe Trismus</div>
                  </div>
                </div>
                <History className="w-4 h-4 text-rose-500" />
              </button>

              {/* Present Indicator */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-cyan-200 bg-cyan-50/70 text-[#020B44] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#00AEEF] animate-pulse" />
                  <div>
                    <div className="text-xs font-bold">Present (Live Position)</div>
                    <div className="text-[11px] font-mono text-[#0066B3]">{openingMM.toFixed(1)} mm // Dynamic Hold</div>
                  </div>
                </div>
                <Activity className="w-4 h-4 text-[#00AEEF]" />
              </div>

              {/* Future Projection Toggle */}
              <button
                onClick={() => setShowFutureProjection(!showFutureProjection)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  showFutureProjection
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm"
                    : "bg-white border-slate-200 text-slate-400 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div>
                    <div className="text-xs font-bold">Predicted (Clinical Target)</div>
                    <div className="text-[11px] font-mono text-slate-500">{targetOpening.toFixed(1)} mm // Physiological</div>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </button>

              {/* Statistical Card */}
              <div className="mt-2 p-4 bg-white rounded-2xl border border-slate-200/70 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Relative Incisal Gain:</span>
                  <span className="font-mono font-bold text-[#0D9488]">+{gainPct}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Estimated Time to Target:</span>
                  <span className="font-mono font-bold text-[#020B44]">~{predictedWeeksRemaining} weeks</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>TMJ Rotation Angle:</span>
                  <span className="font-mono font-bold text-[#0066B3]">{currentRotation.toFixed(1)}°</span>
                </div>
              </div>
            </div>

            {/* Right: Parametric SVG Anatomical Viewport */}
            <div className="lg:col-span-8 flex flex-col items-center justify-center relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm overflow-hidden min-h-[380px]">
              
              <svg viewBox="0 0 520 380" className="w-full max-w-[500px] h-auto overflow-visible">
                <defs>
                  {/* Grid background for clinical scale */}
                  <pattern id="clinical-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                  </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#clinical-grid)" />

                {/* Upper Skull (Fixed Cranium & Maxilla) */}
                <g fill="#F8FAFC" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 120 200 C 80 180, 60 100, 140 50 C 210 5, 300 20, 330 100 C 350 150, 330 190, 320 210 C 300 210, 290 220, 280 235 L 240 235 C 240 225, 230 215, 220 215 L 160 215 C 150 215, 140 205, 120 200 Z" />
                  {/* Orbit & Nasal Cavity */}
                  <ellipse cx="260" cy="140" rx="26" ry="32" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
                  <path d="M 305 180 L 290 205 L 300 208 Z" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
                  {/* Maxillary Upper Teeth */}
                  <rect x="255" y="235" width="10" height="13" rx="2" fill="#FFFFFF" stroke="#475569" strokeWidth="1.5" />
                  <rect x="268" y="235" width="10" height="13" rx="2" fill="#FFFFFF" stroke="#475569" strokeWidth="1.5" />
                  <rect x="281" y="235" width="12" height="14" rx="2" fill="#FFFFFF" stroke="#475569" strokeWidth="1.5" />
                </g>

                {/* TMJ Condyle Anchor Pin */}
                <circle cx="170" cy="195" r="5" fill="#00AEEF" />
                <text x="120" y="198" fill="#64748B" fontSize="9" fontFamily="monospace">TMJ Pivot</text>

                {/* GHOST LAYER 1: Past Baseline Mandible */}
                {showPastGhost && (
                  <g
                    transform={`rotate(${baselineRotation} 170 195)`}
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  >
                    <path d="M 170 195 L 175 245 C 180 280, 205 305, 250 305 L 295 300 C 302 298, 305 290, 300 280 L 290 265 L 255 265 C 235 265, 200 250, 190 210 Z" />
                    <text x="315" y="280" fill="#E11D48" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      Baseline: {baselineOpening}mm
                    </text>
                  </g>
                )}

                {/* GHOST LAYER 2: Future Target Mandible */}
                {showFutureProjection && (
                  <g
                    transform={`rotate(${futureRotation} 170 195)`}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.8"
                    strokeDasharray="5 5"
                    opacity="0.85"
                  >
                    <path d="M 170 195 L 175 245 C 180 280, 205 305, 250 305 L 295 300 C 302 298, 305 290, 300 280 L 290 265 L 255 265 C 235 265, 200 250, 190 210 Z" />
                    <text x="315" y="340" fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      Target: {targetOpening}mm
                    </text>
                  </g>
                )}

                {/* ACTIVE MANDIBLE LAYER (Articulating live with state) */}
                <g
                  transform={`rotate(${currentRotation} 170 195)`}
                  fill="#F8FAFC"
                  stroke="#020B44"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "transform 0.15s ease-out" }}
                >
                  <path d="M 170 195 L 175 245 C 180 280, 205 305, 250 305 L 295 300 C 302 298, 305 290, 300 280 L 290 265 L 255 265 C 235 265, 200 250, 190 210 Z" />
                  {/* Lower Teeth */}
                  <rect x="255" y="252" width="10" height="12" rx="2" fill="#FFFFFF" stroke="#020B44" strokeWidth="1.5" />
                  <rect x="268" y="252" width="10" height="12" rx="2" fill="#FFFFFF" stroke="#020B44" strokeWidth="1.5" />
                  <rect x="281" y="250" width="12" height="13" rx="2" fill="#FFFFFF" stroke="#020B44" strokeWidth="1.5" />
                </g>

                {/* Caliper Dimension Vector */}
                <g stroke="#00AEEF" strokeWidth="2">
                  {/* Incisal Upper Line */}
                  <line x1="300" y1="248" x2="360" y2="248" strokeDasharray="3 3" />
                  {/* Incisal Lower Line */}
                  <line
                    x1="300"
                    y1={248 + currentRotation * 3.8}
                    x2="360"
                    y2={248 + currentRotation * 3.8}
                    strokeDasharray="3 3"
                  />
                  {/* Dimension Bar */}
                  <line x1="350" y1="248" x2="350" y2={248 + currentRotation * 3.8} />
                  <circle cx="350" cy="248" r="3" fill="#00AEEF" />
                  <circle cx="350" cy={248 + currentRotation * 3.8} r="3" fill="#00AEEF" />
                  
                  <text
                    x="365"
                    y={252 + (currentRotation * 3.8) / 2}
                    fill="#020B44"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                    alignmentBaseline="middle"
                  >
                    {openingMM.toFixed(1)} mm
                  </text>
                </g>
              </svg>

              {/* Slider for Interactive Testing */}
              <div className="w-full mt-6 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#00AEEF]" />
                    Interactive Displacement Sweep
                  </span>
                  <span className="text-[#0066B3] font-bold">{openingMM.toFixed(1)} mm</span>
                </div>
                <input
                  type="range"
                  min="18.0"
                  max="45.0"
                  step="0.1"
                  value={openingMM}
                  onChange={(e) => setOpeningMM(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00AEEF]"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>18.0 mm (Locked)</span>
                  <span>30.0 mm (Functional)</span>
                  <span>45.0 mm (Full Normal)</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}