import React, { useState } from 'react';
import { MapPin, Navigation, X, Compass } from 'lucide-react';

interface GpsBannerProps {
  gpsActive: boolean;
  userCoords: { lat: number; lng: number } | null;
  detectedQuartier: string;
  onRequestGps: () => void;
  role: 'coursier' | 'apporteur' | 'admin';
}

export const GpsBanner: React.FC<GpsBannerProps> = ({
  gpsActive,
  userCoords,
  detectedQuartier,
  onRequestGps,
}) => {
  // Pop-up prompt state: shows when GPS is not yet active and hasn't been dismissed
  const [hasDismissedPopup, setHasDismissedPopup] = useState(false);

  const handleAuthorize = () => {
    onRequestGps();
    setHasDismissedPopup(true);
  };

  const handleDismiss = () => {
    setHasDismissedPopup(true);
  };

  return (
    <>
      {/* Pop-up notification (Request #6: juste la notification en pop up suffi si client appuis sur autorisé pop up disparaît) */}
      {!gpsActive && !hasDismissedPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#12161f] border border-emerald-500/40 rounded-3xl max-w-sm w-full p-5 text-slate-100 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 transition"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-display">
                  Localisation Casablanca
                </h3>
                <p className="text-[11px] text-slate-400">CourSEN Express</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Autorisez l'accès à votre position GPS pour localiser automatiquement votre quartier et trouver les coursiers les plus proches à Casablanca.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAuthorize}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                Autoriser
              </button>
              <button
                onClick={handleDismiss}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discrete Real-time Location Indicator Pill */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800/90 rounded-xl px-3.5 py-2 text-xs mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex items-center justify-center">
            <MapPin className={`w-4 h-4 shrink-0 ${gpsActive ? 'text-emerald-400' : 'text-slate-500'}`} />
            {gpsActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div className="truncate">
            <span className="font-semibold text-slate-400">Zone : </span>
            <span className="text-emerald-400 font-bold">
              {detectedQuartier || 'Casablanca'}
            </span>
            {userCoords && gpsActive && (
              <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
                ({userCoords.lat.toFixed(3)}°N, {userCoords.lng.toFixed(3)}°W)
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onRequestGps}
          title="Recalibrer la position"
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300 bg-slate-800/80 hover:bg-slate-700/80 px-2 py-1 rounded-lg border border-slate-700/60 cursor-pointer transition"
        >
          <Compass className="w-3 h-3 text-emerald-400" />
          <span>{gpsActive ? 'Recalibrer' : 'Détecter'}</span>
        </button>
      </div>
    </>
  );
};
