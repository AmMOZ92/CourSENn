import React from 'react';
import { UserProfile } from '../types';
import { Share2, X, Star, Check } from 'lucide-react';

interface CedeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCoursiers: UserProfile[];
  onConfirmCede: (coursierId: string, coursierNom: string) => void;
}

export const CedeModal: React.FC<CedeModalProps> = ({
  isOpen,
  onClose,
  availableCoursiers,
  onConfirmCede,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3">
      <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 text-slate-100 shadow-2xl relative animate-in slide-in-from-bottom-6 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-1">
          <Share2 className="w-5 h-5" />
          <span>Céder cette course</span>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-200 leading-relaxed my-3">
          En cédant cette course à un confrère coursier, vous recevrez automatiquement <b>15% du montant de la course</b> dans votre portefeuille dès qu'elle aura été livrée !
        </div>

        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Coursiers disponibles à Casablanca :
        </span>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {availableCoursiers.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              Aucun coursier disponible pour le moment.
            </p>
          ) : (
            availableCoursiers.map((r) => (
              <div
                key={r.id}
                onClick={() => onConfirmCede(r.id, r.full_name || `${r.prenom} ${r.nom}`)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                    {r.prenom?.[0] || 'C'}{r.nom?.[0] || 'R'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {r.full_name || `${r.prenom} ${r.nom}`}
                    </span>
                    <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {r.note_moyenne ? r.note_moyenne.toFixed(1) : '5.0'} · Moto active
                    </span>
                  </div>
                </div>

                <button className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition">
                  Choisir
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};
