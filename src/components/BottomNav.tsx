import React from 'react';
import { Home, Bike, CreditCard, User, Package, Clock, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface BottomNavProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasActiveCourse?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  role,
  activeTab,
  onTabChange,
  hasActiveCourse = false,
}) => {
  if (role === 'admin') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#12161f]/95 backdrop-blur-md border-t border-slate-800 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => onTabChange('admin-users')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold py-1 px-3 rounded-xl transition ${
              activeTab === 'admin-users' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold py-1 px-3 rounded-xl transition ${
              activeTab === 'profile' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profil</span>
          </button>
        </div>
      </nav>
    );
  }

  if (role === 'coursier') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#12161f]/95 backdrop-blur-md border-t border-slate-800 px-3 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => onTabChange('coursier-home')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold py-1 px-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'coursier-home' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Accueil</span>
          </button>

          <button
            onClick={() => onTabChange('coursier-active')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold py-1 px-2.5 rounded-xl transition cursor-pointer relative ${
              activeTab === 'coursier-active' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bike className="w-5 h-5" />
            <span>Course</span>
            {hasActiveCourse && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => onTabChange('wallet')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold py-1 px-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'wallet' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Portefeuille</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold py-1 px-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profil</span>
          </button>
        </div>
      </nav>
    );
  }

  // Apporteur (Client)
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#12161f]/95 backdrop-blur-md border-t border-slate-800 px-3 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        <button
          onClick={() => onTabChange('apporteur-new')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'apporteur-new' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Nouvelle course</span>
        </button>

        <button
          onClick={() => onTabChange('apporteur-history')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'apporteur-history' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>Historique</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profil</span>
        </button>
      </div>
    </nav>
  );
};
