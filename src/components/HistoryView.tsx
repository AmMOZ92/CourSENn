import React from 'react';
import { Course } from '../types';
import { Package, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface HistoryViewProps {
  courses: Course[];
  onSelectCourse?: (course: Course) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ courses }) => {
  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white font-display tracking-tight">
          Historique des colis
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Suivi de vos envois et courses effectuées à Casablanca
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            📦
          </div>
          <p className="text-sm font-semibold text-slate-300">
            Aucun colis envoyé pour l'instant
          </p>
          <p className="text-xs text-slate-500">
            Publiez votre première course express en moins d'une minute !
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {courses.map((c) => {
            const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
              en_attente: { label: 'En attente', color: 'text-amber-400 bg-amber-950/40 border-amber-800/40', icon: Clock },
              acceptee: { label: 'Acceptée', color: 'text-sky-400 bg-sky-950/40 border-sky-800/40', icon: Clock },
              en_cours: { label: 'En cours', color: 'text-amber-400 bg-amber-950/40 border-amber-800/40', icon: Clock },
              livree: { label: 'Livrée ✓', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40', icon: CheckCircle2 },
              annulee: { label: 'Annulée', color: 'text-rose-400 bg-rose-950/40 border-rose-800/40', icon: XCircle }
            };

            const s = statusLabels[c.statut] || statusLabels.en_attente;
            const Icon = s.icon;

            return (
              <div
                key={c.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-white block">
                      {c.depart_adresse} → {c.arrivee_adresse}
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {c.description_colis} · ~{c.distance_km} km
                    </span>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${s.color}`}>
                    <Icon className="w-3 h-3" />
                    {s.label}
                  </span>
                </div>

                {c.description_detail && (
                  <p className="text-xs text-slate-300 bg-slate-800/70 p-2 rounded-xl border border-slate-700/40">
                    {c.description_detail}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>{new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-sm font-black text-emerald-400">{c.prix_total} DH</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
