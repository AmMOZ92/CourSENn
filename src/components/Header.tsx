import React from 'react';
import { User, LogOut, RefreshCw, Radio, Crown } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { isPlatformOwner } from '../lib/auth-helpers';

interface HeaderProps {
  currentUser: UserProfile | null;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeRole,
  onRoleChange,
  onOpenProfile,
  onOpenAdmin,
  onLogout,
  onManualRefresh,
  isRefreshing,
}) => {
  // Strict Owner Access: only visible if user is logged in with falldiagne28@gmail.com or 0607463625
  const isOwner = isPlatformOwner(currentUser);

  return (
    <header className="sticky top-0 z-30 bg-[#12161f]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Brand & Live status */}
        <div className="flex items-center gap-2">
          <div className="flex items-baseline font-black tracking-tight text-xl text-white font-display">
            Cour<span className="text-emerald-400">SEN</span>
            <span className="ml-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Casa
            </span>
          </div>

          <button
            onClick={onManualRefresh}
            title="Synchroniser les courses en direct"
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400/90 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 px-2 py-1 rounded-full transition-all cursor-pointer"
          >
            <Radio className={`w-3 h-3 text-emerald-400 ${isRefreshing ? 'animate-spin' : 'animate-pulse'}`} />
            <span className="hidden xs:inline">Direct</span>
            <RefreshCw className={`w-2.5 h-2.5 ml-0.5 ${isRefreshing ? 'animate-spin text-emerald-300' : 'text-emerald-500'}`} />
          </button>
        </div>

        {/* Role Toggle & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Role Pill Switch */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-full border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => onRoleChange('coursier')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer text-xs font-semibold ${
                activeRole === 'coursier'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛵 Coursier
            </button>
            <button
              onClick={() => onRoleChange('apporteur')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer text-xs font-semibold ${
                activeRole === 'apporteur'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📦 Client
            </button>
          </div>

          {/* Espace Propriétaire / Admin Entry (Request #10 - Visible ONLY for the owner) */}
          {isOwner && (
            <button
              onClick={onOpenAdmin}
              title="Espace Propriétaire (Sans Supabase, Google Sheets, Push)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer text-xs font-bold ${
                activeRole === 'admin'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20'
                  : 'bg-purple-950/40 text-purple-200 border-purple-800/60 hover:bg-purple-900/50 hover:border-purple-600/70'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Propriétaire</span>
            </button>
          )}

          {/* Large Profile Button (Request #2) */}
          <button
            onClick={onOpenProfile}
            title="Mon profil & Documents"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            aria-label="Mon Profil"
          >
            {currentUser?.photo_url ? (
              <img
                src={currentUser.photo_url}
                alt={currentUser.prenom || 'Profil'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-emerald-400" />
            )}
          </button>

          {/* Large Logout Button (Request #2) */}
          <button
            onClick={onLogout}
            title="Se déconnecter"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 hover:text-rose-100 border border-rose-800/40 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-5 h-5 text-rose-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
