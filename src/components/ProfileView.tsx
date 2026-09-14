import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  LogOut,
  HelpCircle,
  X
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: UserProfile;
  onUpdateAvatar: (photoUrl: string) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateAvatar,
  onLogout,
}) => {
  const [showFaq, setShowFaq] = useState(false);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdateAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const faqItems = [
    {
      q: 'Comment devenir coursier vérifié ?',
      a: 'Envoyez une photo de votre permis, de votre carte grise et de votre CIN par WhatsApp au support 0607463625. L\'activation est effectuée en moins de 2 heures.'
    },
    {
      q: 'Comment fonctionne la cession de course (15%) ?',
      a: 'Si vous êtes coursier et avez un imprévu, vous pouvez céder votre course à un autre coursier disponible. Vous touchez automatiquement 15% du montant de la course dès sa livraison !'
    },
    {
      q: 'Quand suis-je payé ?',
      a: 'Vos gains sont cumulés dans votre portefeuille et versés chaque vendredi par virement bancaire ou retrait espèces Casablanca.'
    }
  ];

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white font-display tracking-tight">
          Mon Profil
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Informations personnelles, vérification et support CourSEN
        </p>
      </div>

      {/* Avatar Card (Request #9) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center space-y-3">
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-emerald-500/80 bg-slate-800 flex items-center justify-center text-3xl font-black text-white shadow-xl">
            {currentUser.photo_url ? (
              <img
                src={currentUser.photo_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              currentUser.prenom?.[0]?.toUpperCase() || 'C'
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-md transition">
            <Camera className="w-3.5 h-3.5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFile}
            />
          </label>
        </div>

        <div>
          <h2 className="text-base font-extrabold text-white">
            {currentUser.full_name || `${currentUser.prenom} ${currentUser.nom}`.trim() || 'Partenaire'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'falldiagne28@gmail.com' ? '👑 Propriétaire' : currentUser.role === 'coursier' ? '🛵 Coursier' : '📦 Client'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Canal : {currentUser.canal === 'google' ? 'Google OAuth' : 'Email'}
            </span>
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
        <div className="flex justify-between py-1 border-b border-slate-800">
          <span className="text-slate-400">Téléphone</span>
          <span className="text-white font-bold">{currentUser.telephone || 'Non renseigné'}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-800">
          <span className="text-slate-400">Ville opérationnelle</span>
          <span className="text-white font-bold">{currentUser.ville || 'Casablanca'}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-slate-400">Statut de vérification</span>
          <span className={`font-bold flex items-center gap-1 ${
            currentUser.verifie ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {currentUser.verifie ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {currentUser.verifie ? 'Vérifié ✓' : 'En attente des pièces'}
          </span>
        </div>
      </div>

      {/* WhatsApp Support Assistance */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Support direct WhatsApp
          </span>
          <span className="text-xs font-bold text-emerald-400">06 07 46 36 25</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Pour valider vos documents, signaler un problème sur une course ou poser une question à notre équipe à Casablanca.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://wa.me/212607463625"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Ouvrir WhatsApp
          </a>

          <button
            onClick={() => setShowFaq(!showFaq)}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Aide rapide
          </button>
        </div>

        {showFaq && (
          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
            {faqItems.map((item, idx) => (
              <div key={idx} className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <b className="text-white block mb-0.5">{item.q}</b>
                <span className="text-slate-300 text-[11px] leading-relaxed">{item.a}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legal & App Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
        <a
          href="https://coursen.online"
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-between items-center text-slate-300 hover:text-white py-1 border-b border-slate-800"
        >
          <span>Site officiel</span>
          <span className="text-emerald-400 flex items-center gap-1">
            coursen.online <ExternalLink className="w-3 h-3" />
          </span>
        </a>

        <div className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800">
          <span>Plateforme & Serveur</span>
          <span className="text-slate-400">Casablanca Express v2.0</span>
        </div>

        <div className="flex justify-between items-center text-slate-300 py-1">
          <span>Gestion des données</span>
          <span className="text-emerald-400 font-semibold">Chiffrement RGPD / CNDP</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Se déconnecter de CourSEN
      </button>
    </div>
  );
};
