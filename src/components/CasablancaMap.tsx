import React from 'react';
import { MapPin, Navigation, Compass, Route as RouteIcon } from 'lucide-react';
import { CASABLANCA_QUARTIERS } from '../data/casablanca';

interface CasablancaMapProps {
  departAdresse: string;
  arriveeAdresse: string;
  departCoords?: { lat: number; lng: number } | null;
  arriveeCoords?: { lat: number; lng: number } | null;
  coursierCoords?: { lat: number; lng: number } | null;
  distanceKm?: number;
  onSelectQuartier?: (quartierName: string) => void;
}

export const CasablancaMap: React.FC<CasablancaMapProps> = ({
  departAdresse,
  arriveeAdresse,
  departCoords,
  arriveeCoords,
  coursierCoords,
  distanceKm = 3.2,
  onSelectQuartier,
}) => {
  // Casablanca bounds for SVG coordinate projection
  // Lat: 33.52 to 33.63, Lng: -7.68 to -7.50
  const project = (lat: number, lng: number) => {
    const minLat = 33.52, maxLat = 33.625;
    const minLng = -7.68, maxLng = -7.52;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y))
    };
  };

  const posA = departCoords ? project(departCoords.lat, departCoords.lng) : { x: 38, y: 40 };
  const posB = arriveeCoords ? project(arriveeCoords.lat, arriveeCoords.lng) : { x: 55, y: 35 };
  const posCoursier = coursierCoords ? project(coursierCoords.lat, coursierCoords.lng) : { x: 42, y: 45 };

  return (
    <div className="relative w-full h-48 sm:h-56 bg-[#0f131a] rounded-2xl border border-slate-800 overflow-hidden shadow-inner my-3">
      {/* Map visual background with Casablanca ocean curve & urban grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#253043" strokeWidth="0.75" />
          </pattern>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Ocean coastline of Casablanca (Atlantic Ocean) */}
        <path
          d="M 0 0 Q 30 20, 70 8 Q 100 0, 100 0 L 100 25 Q 70 30, 20 18 L 0 10 Z"
          fill="url(#oceanGrad)"
        />
        {/* Major arteries (Bd Zerktouni, Bd Mohammed VI, Bd d'Anfa, Rocade) */}
        <path d="M 5 60 Q 40 45, 95 30" fill="none" stroke="#334155" strokeWidth="2.5" strokeDasharray="3 3" />
        <path d="M 35 15 Q 45 50, 60 90" fill="none" stroke="#334155" strokeWidth="2.5" strokeDasharray="3 3" />
      </svg>

      {/* Map Header Overlay */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700 text-[11px] font-semibold text-slate-200">
          <Compass className="w-3 h-3 text-emerald-400" />
          <span>Casablanca Carte Interactive</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-700/60 text-[11px] font-bold text-emerald-400">
          <RouteIcon className="w-3 h-3" />
          <span>{distanceKm ? `${distanceKm.toFixed(1)} km` : 'En direct'}</span>
        </div>
      </div>

      {/* Connection SVG Line between A and B */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <line
          x1={`${posA.x}%`}
          y1={`${posA.y}%`}
          x2={`${posB.x}%`}
          y2={`${posB.y}%`}
          stroke="#10b981"
          strokeWidth="3"
          strokeDasharray="6 4"
          strokeLinecap="round"
          className="animate-pulse"
        />
      </svg>

      {/* Marker A (Depart) */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-300"
        style={{ left: `${posA.x}%`, top: `${posA.y}%` }}
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-slate-950">
          A
        </div>
        <span className="text-[10px] font-bold text-emerald-300 bg-slate-900/90 px-1.5 py-0.5 rounded shadow border border-slate-700 whitespace-nowrap mt-0.5 max-w-[90px] truncate">
          {departAdresse.split(',')[0] || 'Départ'}
        </span>
      </div>

      {/* Marker B (Arrivee) */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-300"
        style={{ left: `${posB.x}%`, top: `${posB.y}%` }}
      >
        <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white">
          B
        </div>
        <span className="text-[10px] font-bold text-rose-300 bg-slate-900/90 px-1.5 py-0.5 rounded shadow border border-slate-700 whitespace-nowrap mt-0.5 max-w-[90px] truncate">
          {arriveeAdresse.split(',')[0] || 'Arrivée'}
        </span>
      </div>

      {/* Coursier Live Pin */}
      {coursierCoords && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-500"
          style={{ left: `${posCoursier.x}%`, top: `${posCoursier.y}%` }}
        >
          <div className="w-7 h-7 rounded-full bg-amber-400 border-2 border-slate-950 shadow-xl flex items-center justify-center text-xs animate-bounce">
            🛵
          </div>
          <span className="text-[9px] font-extrabold text-amber-300 bg-slate-950/90 px-1.5 py-0.2 rounded border border-amber-500/40">
            Coursier
          </span>
        </div>
      )}

      {/* Quick Casablanca Quartiers pills at bottom */}
      {onSelectQuartier && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] z-10 no-scrollbar">
          <span className="text-slate-400 font-semibold px-1 whitespace-nowrap">Quartiers :</span>
          {CASABLANCA_QUARTIERS.slice(0, 7).map((q) => (
            <button
              key={q.name}
              onClick={() => onSelectQuartier(q.name)}
              className="px-2 py-0.5 rounded-full bg-slate-800/90 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 whitespace-nowrap transition cursor-pointer"
            >
              {q.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
