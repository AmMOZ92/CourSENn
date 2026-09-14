import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { Bell, MapPin, ArrowRight, Clock, DollarSign, Image as ImageIcon } from 'lucide-react';

interface PushNotificationProps {
  course: Course | null;
  onAccept: (courseId: string) => void;
  onDismiss: () => void;
}

export const PushNotification: React.FC<PushNotificationProps> = ({
  course,
  onAccept,
  onDismiss,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(45);

  useEffect(() => {
    if (!course) return;
    setSecondsLeft(45);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [course, onDismiss]);

  if (!course) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[94%] max-w-sm z-50 animate-in slide-in-from-top-6 duration-300">
      <div className="bg-[#181d27] border-2 border-amber-400/90 rounded-2xl p-3.5 shadow-2xl shadow-black/80 text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            <span>NOUVELLE COURSE DISPONIBLE</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300 text-xs font-mono font-bold bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            <Clock className="w-3 h-3 text-amber-400" />
            00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
          </div>
        </div>

        {/* Route info */}
        <div className="space-y-1.5 mb-2.5">
          <div className="flex items-center justify-between text-sm font-bold">
            <div className="flex items-center gap-1.5 text-white truncate max-w-[210px]">
              <span className="text-emerald-400 shrink-0">●</span>
              <span className="truncate">{course.depart_adresse}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{course.arrivee_adresse}</span>
            </div>
            <div className="text-emerald-400 text-base font-extrabold shrink-0">
              {course.prix_total} DH
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Client : <b className="text-white">{course.apporteur_nom || 'Client Particulier'}</b></span>
            <span className="text-slate-400">~{course.distance_km} km · {course.mode_paiement === 'especes' ? '💵 Espèces' : '💳 Carte'}</span>
          </div>

          {/* Description preview (Request #1) */}
          {course.description_detail && (
            <p className="text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50 line-clamp-2">
              📝 {course.description_detail}
            </p>
          )}

          {/* Package Photo Preview if available (Request #9) */}
          {course.photo_colis_url && (
            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/60 mt-1">
              <img
                src={course.photo_colis_url}
                alt="Colis"
                className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <div className="text-[11px] text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <ImageIcon className="w-3 h-3" /> Photo du colis jointe
                </span>
                <span className="text-slate-400 text-[10px] block">Type : {course.description_colis}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onDismiss}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition cursor-pointer"
          >
            Ignorer
          </button>
          <button
            onClick={() => onAccept(course.id)}
            className="col-span-2 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Accepter ({course.prix_total} DH)
          </button>
        </div>
      </div>
    </div>
  );
};
