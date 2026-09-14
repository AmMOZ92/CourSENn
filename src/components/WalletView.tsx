import React from 'react';
import { UserProfile, Transaction } from '../types';
import { CreditCard, ArrowUpRight, ArrowDownLeft, DollarSign, Award, Star } from 'lucide-react';

interface WalletViewProps {
  currentUser: UserProfile;
  transactions: Transaction[];
}

export const WalletView: React.FC<WalletViewProps> = ({
  currentUser,
  transactions,
}) => {
  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white font-display tracking-tight">
          Portefeuille
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Gestion des gains, solde prépayé cash et commissions de cession
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <span className="text-xs text-slate-400 font-medium block">
          Solde net disponible
        </span>
        <div className="text-4xl font-black text-white font-display mt-1 tracking-tight">
          {currentUser.solde_portefeuille || 0}{' '}
          <span className="text-lg text-emerald-400 font-bold">DH</span>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs text-slate-300">
          <span>
            Prochain versement : <b className="text-white">Chaque Vendredi</b>
          </span>
          <span>
            Solde cash : <b className="text-emerald-400">{currentUser.solde_prepaye_cash || 0} DH</b>
          </span>
        </div>
      </div>

      {/* Monthly summary metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-xs text-slate-400">Courses effectuées</span>
          <div className="text-xl font-black text-white mt-0.5">
            {currentUser.nombre_courses || 0}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-xs text-slate-400">Note de satisfaction</span>
          <div className="text-xl font-black text-amber-400 mt-0.5 flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400" />
            {currentUser.note_moyenne ? currentUser.note_moyenne.toFixed(1) : '5.0'}
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="space-y-2.5 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Historique des transactions
        </h2>

        {transactions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
            Aucune transaction pour le moment.
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${
                    t.montant >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {t.montant >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {t.type === 'gain_course'
                        ? 'Course livrée'
                        : t.type === 'commission_cession'
                        ? 'Commission de cession (15%)'
                        : 'Commission plateforme'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {t.note || new Date(t.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className={`text-sm font-black ${
                  t.montant >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {t.montant >= 0 ? `+${t.montant}` : t.montant} DH
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
