"use client";

import React, { useState } from "react";
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

  // Exact kinematics from APERTA Rev D Blueprint:
  // opening_mm = 11.0 + 2 * L * sin(beta / 2), L = 101mm
  const mmToBetaDegrees = (mm: number) => {
    const clampedMM = Math.max(11.0, Math.min(54.0, mm));
    const sinHalfBeta = (clampedMM - 11.0) / (2 * 101.0);
    const betaRad = 2 * Math.asin(Math.max(0, Math.min(1, sinHalfBeta)));
    return (betaRad * 180) / Math.PI;
  };

  const currentBeta = mmToBetaDegrees(openingMM);
  const baselineBeta = mmToBetaDegrees(baselineOpening);
  const targetBeta = mmToBetaDegrees(targetOpening);

  // TMJ Anatomical Condylar Axis [x, y]
  const tmjPivot = { x: 236, y: 198 };
  // APERTA Hinge Pivot [x, y]
  const devicePivot = { x: 338, y: 248 };

  const gainPct = Math.round(((openingMM - baselineOpening) / baselineOpening) * 100);
  const predictedWeeksRemaining = Math.max(0, Math.ceil((targetOpening - openingMM) / 2.0));

  return (
    <section id="predictive-jaw" className="py-24 bg-[#070B14] text-slate-100 relative overflow-hidden">
      {/* Background Radiographic Calibration Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#00AEEF 1px, transparent 1px), linear-gradient(90deg, #00AEEF 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wide uppercase mb-3">
            <BrainCircuit className="w-3.5 h-3.5" />
            Radiological Biomechanics // APERTA Rev D In Situ
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Craniofacial Mandibular Kinematics
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Lateral cephalometric profile with true anatomical landmarks, TMJ condylar rotational translation, and APERTA Rev D load-cell engagement.
          </p>
        </div>

        {/* Viewport Dashboard Card */}
        <div className="bg-[#0A101D]/90 rounded-3xl border border-slate-800/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Controls */}
            <div className="lg:col-span-4 flex flex-col gap-3.5">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Telemetry & Pathology Layers
              </span>

              {/* Baseline Indicator */}
              <button
                onClick={() => setShowPastGhost(!showPastGhost)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  showPastGhost
                    ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                    : "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                  <div>
                    <div className="text-xs font-bold">Pathological Baseline (Trismus)</div>
                    <div className="text-[11px] font-mono text-rose-300/80">
                      {baselineOpening.toFixed(1)} mm // Initial Restriction
                    </div>
                  </div>
                </div>
                <History className="w-4 h-4 text-rose-400" />
              </button>

              {/* Live Articulation */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 text-cyan-100 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse ring-4 ring-cyan-400/20" />
                  <div>
                    <div className="text-xs font-bold text-white">Live Articulation</div>
                    <div className="text-[11px] font-mono text-cyan-300">
                      {openingMM.toFixed(1)} mm (Arm Angle: {currentBeta.toFixed(1)}°)
                    </div>
                  </div>
                </div>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>

              {/* Target Projection */}
              <button
                onClick={() => setShowFutureProjection(!showFutureProjection)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  showFutureProjection
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                    : "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                  <div>
                    <div className="text-xs font-bold">Physiological Target</div>
                    <div className="text-[11px] font-mono text-emerald-300/80">
                      {targetOpening.toFixed(1)} mm // Functional Goal
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </button>

              {/* Clinical Metrics */}
              <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Mouth Opening Gain:</span>
                  <span className="font-mono font-bold text-cyan-400">+{gainPct}%</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Est. Therapy Window:</span>
                  <span className="font-mono font-bold text-emerald-400">~{predictedWeeksRemaining} weeks</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Safety Stop Post (Rev D):</span>
                  <span className="font-mono font-bold text-amber-400">
                    {openingMM <= 25 ? "P09 (25mm)" : openingMM <= 30 ? "P09 (30mm)" : openingMM <= 35 ? "P09 (35mm)" : openingMM <= 40 ? "P09 (40mm)" : "P09 (45mm)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Silicone pad protection on outer surfaces. Closed tip thickness: 11.0 mm.</span>
              </div>
            </div>

            {/* Right: Anatomical Skull & APERTA Visualizer */}
            <div className="lg:col-span-8 flex flex-col items-center justify-center bg-[#050811] rounded-2xl border border-slate-800 p-4 shadow-inner relative overflow-hidden min-h-[460px]">
              
              <svg viewBox="0 0 680 440" className="w-full h-auto max-w-[640px] overflow-visible select-none">
                <defs>
                  {/* Bone Gradients */}
                  <linearGradient id="boneCranium" x1="20%" y1="10%" x2="80%" y2="90%">
                    <stop offset="0%" stopColor="#F8FAFC" />
                    <stop offset="45%" stopColor="#E2E8F0" />
                    <stop offset="85%" stopColor="#CBD5E1" />
                    <stop offset="100%" stopColor="#94A3B8" />
                  </linearGradient>

                  <linearGradient id="boneMandible" x1="10%" y1="10%" x2="90%" y2="80%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor="#E2E8F0" />
                    <stop offset="100%" stopColor="#94A3B8" />
                  </linearGradient>

                  <radialGradient id="orbitDepth" cx="45%" cy="45%" r="55%">
                    <stop offset="0%" stopColor="#0B1120" />
                    <stop offset="70%" stopColor="#030712" />
                    <stop offset="100%" stopColor="#1E293B" />
                  </radialGradient>
                </defs>

                {/* ---------------- 1. ANATOMICAL CRANIUM (Fixed Maxilla & Calvaria) ---------------- */}
                <g id="anatomical-cranium">
                  {/* Main Cranial Vault & Facial Skeleton */}
                  <path
                    d="
                      M 150 200
                      C 115 175, 100 130, 112 85
                      C 125 40, 175 18, 230 18
                      C 290 18, 335 48, 348 95
                      C 352 110, 348 128, 342 142
                      C 340 148, 345 152, 346 160
                      C 347 170, 338 185, 338 195
                      C 338 202, 330 208, 326 215
                      C 324 222, 320 226, 318 238
                      L 272 238
                      C 268 234, 260 234, 255 228
                      C 250 220, 246 206, 240 204
                      C 230 204, 222 215, 214 218
                      C 206 220, 196 218, 190 210
                      C 176 212, 160 210, 150 200
                      Z
                    "
                    fill="url(#boneCranium)"
                    stroke="#475569"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />

                  {/* Coronal & Squamosal Cranial Sutures */}
                  <path
                    d="M 235 20 Q 230 50, 238 80 T 230 135"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="0.9"
                    strokeDasharray="2 1.5"
                    opacity="0.8"
                  />
                  <path
                    d="M 180 140 C 195 125, 225 128, 245 145"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="0.8"
                    strokeDasharray="2 1"
                    opacity="0.7"
                  />

                  {/* External Acoustic Meatus & Mastoid Process */}
                  <ellipse cx="218" cy="202" rx="4.5" ry="6" fill="#0F172A" stroke="#64748B" strokeWidth="1" />
                  <path d="M 208 205 C 208 218, 216 224, 222 214" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />

                  {/* Anatomical Orbit (Eye Socket) */}
                  <path
                    d="M 278 122 C 298 116, 320 126, 322 148 C 324 168, 304 180, 282 176 C 266 172, 262 145, 272 128 Z"
                    fill="url(#orbitDepth)"
                    stroke="#475569"
                    strokeWidth="1.6"
                  />

                  {/* Zygomatic Arch (Cheekbone Bridge) */}
                  <path
                    d="M 230 192 C 255 186, 275 186, 305 178 L 308 186 C 278 196, 255 198, 230 200 Z"
                    fill="#E2E8F0"
                    stroke="#64748B"
                    strokeWidth="1"
                  />

                  {/* Piriform Nasal Aperture */}
                  <path
                    d="M 334 172 C 340 185, 336 204, 326 210 C 322 206, 324 190, 332 174 Z"
                    fill="#0F172A"
                    stroke="#475569"
                    strokeWidth="1.2"
                  />

                  {/* Maxillary Teeth (Upper Dentition) */}
                  <g fill="#FFFFFF" stroke="#475569" strokeWidth="1.1">
                    {/* Molars & Premolars */}
                    <path d="M 273 238 L 273 248 C 275 250, 280 250, 281 248 L 281 238 Z" />
                    <path d="M 282 238 L 282 249 C 285 251, 290 251, 291 249 L 291 238 Z" />
                    {/* Canine & Incisors */}
                    <path d="M 292 238 L 292 250 C 295 252, 299 252, 300 250 L 300 238 Z" />
                    <path d="M 301 238 L 301 251 C 304 252, 309 252, 310 251 L 310 238 Z" />
                    <path d="M 311 238 L 311 251 C 314 252, 318 252, 318 251 L 317 238 Z" />
                  </g>
                </g>

                {/* TMJ Mandibular Fossa & Condyle Center */}
                <circle cx={tmjPivot.x} cy={tmjPivot.y} r="6" fill="#00AEEF" opacity="0.2" />
                <circle cx={tmjPivot.x} cy={tmjPivot.y} r="2.5" fill="#00AEEF" />
                <text x="180" y="188" fill="#00AEEF" fontSize="9" fontFamily="monospace">TMJ Condyle</text>

                {/* ---------------- 2. GHOST PROJECTIONS ---------------- */}
                {/* Past Baseline Ghost */}
                {showPastGhost && (
                  <g
                    transform={`rotate(${baselineBeta * 0.48} ${tmjPivot.x} ${tmjPivot.y})`}
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="1.4"
                    strokeDasharray="4 3"
                    opacity="0.6"
                  >
                    <path d="M 236 198 L 236 216 C 238 238, 244 262, 260 274 C 275 284, 295 284, 314 278 L 317 258 L 278 258 Z" />
                    <text x="325" y="278" fill="#F43F5E" fontSize="9" fontFamily="monospace">
                      18mm (Baseline)
                    </text>
                  </g>
                )}

                {/* Future Target Ghost */}
                {showFutureProjection && (
                  <g
                    transform={`rotate(${targetBeta * 0.48} ${tmjPivot.x} ${tmjPivot.y})`}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.4"
                    strokeDasharray="4 3"
                    opacity="0.65"
                  >
                    <path d="M 236 198 L 236 216 C 238 238, 244 262, 260 274 C 275 284, 295 284, 314 278 L 317 258 L 278 258 Z" />
                    <text x="325" y="320" fill="#10B981" fontSize="9" fontFamily="monospace">
                      42mm (Target)
                    </text>
                  </g>
                )}

                {/* ---------------- 3. ARTICULATING MANDIBLE (Live Position) ---------------- */}
                <g
                  transform={`rotate(${currentBeta * 0.48} ${tmjPivot.x} ${tmjPivot.y})`}
                  style={{ transition: "transform 0.12s ease-out" }}
                >
                  {/* Anatomical Mandible: Condylar Process, Sigmoid Notch, Coronoid Process, Ramus, Body & Chin */}
                  <path
                    d="
                      M 236 198
                      C 238 202, 242 210, 245 212
                      C 248 214, 254 212, 258 204
                      C 261 198, 264 200, 268 215
                      L 272 238
                      L 278 256
                      L 318 256
                      C 321 262, 321 270, 315 276
                      C 305 284, 280 286, 262 278
                      C 248 270, 240 250, 237 225
                      C 235 210, 232 202, 236 198
                      Z
                    "
                    fill="url(#boneMandible)"
                    stroke="#475569"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />

                  {/* Mental Foramen Landmark */}
                  <circle cx="295" cy="270" r="1.8" fill="#475569" />

                  {/* Mandibular Teeth (Lower Dentition) */}
                  <g fill="#FFFFFF" stroke="#475569" strokeWidth="1.1">
                    <path d="M 276 256 L 276 246 C 278 244, 282 244, 283 246 L 283 256 Z" />
                    <path d="M 284 256 L 284 245 C 286 243, 290 243, 291 245 L 291 256 Z" />
                    <path d="M 292 256 L 292 244 C 295 242, 299 242, 300 244 L 300 256 Z" />
                    <path d="M 301 256 L 301 243 C 304 241, 308 241, 309 243 L 309 256 Z" />
                    <path d="M 310 256 L 310 243 C 313 241, 317 241, 317 243 L 317 256 Z" />
                  </g>
                </g>

                {/* ---------------- 4. APERTA REV D CAD HARDWARE ---------------- */}
                {/* Upper Limb Assembly */}
                <g id="aperta-upper">
                  <path
                    d="M 292 248 L 338 244 L 358 242 L 388 242 L 388 250 L 335 250 L 292 251 Z"
                    fill="#1E293B"
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  {/* Silicone Pad on Outer Face (Rev D Item 1) */}
                  <rect x="294" y="244" width="22" height="3" rx="1" fill="#00AEEF" />
                  {/* Load Cell Bar */}
                  <rect x="350" y="238" width="58" height="9" rx="1.5" fill="#94A3B8" stroke="#334155" strokeWidth="1" />
                  <text x="358" y="244" fill="#0F172A" fontSize="5" fontFamily="monospace" fontWeight="bold">LOAD CELL</text>
                  {/* Sensor Cover */}
                  <rect x="328" y="236" width="20" height="24" rx="2.5" fill="#0F172A" stroke="#00AEEF" strokeWidth="1.2" />
                  <circle cx={devicePivot.x} cy={devicePivot.y} r="3" fill="#00AEEF" />
                </g>

                {/* Enclosure Case */}
                <g id="aperta-case">
                  <rect x="412" y="210" width="168" height="84" rx="6" fill="#0B132B" stroke="#00AEEF" strokeWidth="1.6" />
                  <path d="M 480 210 L 480 192 L 545 192 L 555 210 Z" fill="#0F172A" stroke="#00AEEF" strokeWidth="1.2" />
                  {/* Thumb Tab */}
                  <rect x="502" y="180" width="16" height="13" rx="2" fill="#F97316" />
                  {/* OLED Screen */}
                  <rect x="432" y="222" width="48" height="28" rx="2.5" fill="#020617" stroke="#38BDF8" strokeWidth="0.9" />
                  <text x="438" y="233" fill="#00AEEF" fontSize="5.5" fontFamily="monospace">APERTA REV D</text>
                  <text x="438" y="243" fill="#38BDF8" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    {openingMM.toFixed(1)} mm
                  </text>
                  <text x="510" y="238" fill="#F1F5F9" fontSize="12" fontFamily="sans-serif" fontWeight="900" letterSpacing="1.5">
                    APERTA
                  </text>
                </g>

                {/* Lower Articulating Limb */}
                <g
                  id="aperta-lower"
                  transform={`rotate(${currentBeta} ${devicePivot.x} ${devicePivot.y})`}
                  style={{ transition: "transform 0.12s ease-out" }}
                >
                  <path
                    d="M 292 254 L 338 252 L 358 262 L 412 284 L 536 284 C 536 284, 526 298, 516 298 C 506 298, 496 294, 486 294 C 476 294, 466 298, 456 298 C 446 298, 436 294, 426 294 L 358 278 L 328 258 Z"
                    fill="#1E293B"
                    stroke="#475569"
                    strokeWidth="1.3"
                  />
                  <rect x="294" y="254" width="22" height="3" rx="1" fill="#00AEEF" />
                  <rect x="408" y="270" width="8" height="15" rx="1.5" fill="#F59E0B" />
                </g>

                {/* ---------------- 5. CALIPER MEASUREMENT OVERLAY ---------------- */}
                <g stroke="#00AEEF" strokeWidth="1.5">
                  <line x1="316" y1="251" x2="252" y2="251" strokeDasharray="3 3" />
                  <line
                    x1="316"
                    y1={251 + (currentBeta * 1.45)}
                    x2="252"
                    y2={251 + (currentBeta * 1.45)}
                    strokeDasharray="3 3"
                  />
                  <line x1="256" y1="251" x2="256" y2={251 + (currentBeta * 1.45)} />
                  <circle cx="256" cy="251" r="2.5" fill="#00AEEF" />
                  <circle cx="256" cy={251 + (currentBeta * 1.45)} r="2.5" fill="#00AEEF" />
                  
                  <text
                    x="246"
                    y={254 + (currentBeta * 1.45) / 2}
                    fill="#38BDF8"
                    fontSize="12"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {openingMM.toFixed(1)} mm
                  </text>
                </g>
              </svg>

              {/* Range Slider */}
              <div className="w-full mt-4 pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
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