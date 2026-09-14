import React, { useState } from 'react';
import { Course, UserProfile } from '../types';
import { CasablancaMap } from './CasablancaMap';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  DollarSign, 
  Phone, 
  Navigation, 
  Camera, 
  ArrowRight, 
  AlertCircle, 
  Share2, 
  RefreshCw,
  Image as ImageIcon,
  UserCheck,
  Zap,
  Info
} from 'lucide-react';

interface CoursierViewProps {
  currentUser: UserProfile;
  availableCourses: Course[];
  activeCourse: Course | null;
  detectedQuartier: string;
  userCoords: { lat: number; lng: number } | null;
  gpsActive: boolean;
  onAcceptCourse: (courseId: string) => void;
  onFinishCourse: (courseId: string, proofPhotoUrl?: string) => void;
  onOpenCedeModal: (courseId: string) => void;
  onToggleStatus: () => void;
  onRequestGps: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const CoursierView: React.FC<CoursierViewProps> = ({
  currentUser,
  availableCourses,
  activeCourse,
  detectedQuartier,
  userCoords,
  gpsActive,
  onAcceptCourse,
  onFinishCourse,
  onOpenCedeModal,
  onToggleStatus,
  onRequestGps,
  onRefresh,
  isRefreshing,
}) => {
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  // Handle proof of delivery photo (Request #9)
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProofPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFinishDelivery = () => {
    if (!activeCourse) return;
    setIsFinishing(true);
    setTimeout(() => {
      onFinishCourse(activeCourse.id, proofPhoto || undefined);
      setProofPhoto(null);
      setIsFinishing(false);
    }, 400);
  };

  // If a delivery is currently in progress, show the dedicated Active Course view
  if (activeCourse) {
    return (
      <div className="space-y-4 pb-20 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <h1 className="text-xl font-black text-white font-display">Course en cours</h1>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-full">
            À livrer
          </span>
        </div>

        {/* Dynamic Route Map */}
        <CasablancaMap
          departAdresse={activeCourse.depart_adresse}
          arriveeAdresse={activeCourse.arrivee_adresse}
          departCoords={activeCourse.depart_lat ? { lat: activeCourse.depart_lat, lng: activeCourse.depart_lng || 0 } : null}
          arriveeCoords={activeCourse.arrivee_lat ? { lat: activeCourse.arrivee_lat, lng: activeCourse.arrivee_lng || 0 } : null}
          coursierCoords={userCoords}
          distanceKm={activeCourse.distance_km}
        />

        {/* Client details card (Request #5) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Client (Apporteur)</span>
              <span className="text-sm font-extrabold text-white">
                {activeCourse.apporteur_nom || 'Client Particulier'}
              </span>
            </div>
            {activeCourse.apporteur_telephone && (
              <a
                href={`tel:${activeCourse.apporteur_telephone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition"
              >
                <Phone className="w-3.5 h-3.5" />
                {activeCourse.apporteur_telephone}
              </a>
            )}
          </div>

          {/* Route specifications */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 mt-1" />
              <div>
                <span className="text-slate-400 text-[11px] block">Prise en charge</span>
                <span className="text-white font-semibold text-xs">{activeCourse.depart_adresse}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0 mt-1" />
              <div>
                <span className="text-slate-400 text-[11px] block">Destination & Étage ({activeCourse.etage || 0})</span>
                <span className="text-white font-semibold text-xs">{activeCourse.arrivee_adresse}</span>
              </div>
            </div>
          </div>

          {/* Package Description (Request #1) */}
          {activeCourse.description_detail && (
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold block">
                Instructions & Description du colis :
              </span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {activeCourse.description_detail}
              </p>
            </div>
          )}

          {/* Package photo if provided by apporteur (Request #9) */}
          {activeCourse.photo_colis_url && (
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40 flex items-center gap-3">
              <img
                src={activeCourse.photo_colis_url}
                alt="Colis client"
                className="w-14 h-14 rounded-lg object-cover border border-slate-600"
              />
              <div className="text-xs">
                <span className="text-emerald-400 font-bold block flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Photo du colis à récupérer
                </span>
                <span className="text-slate-400 text-[11px]">Vérifiez la conformité du paquet à la remise.</span>
              </div>
            </div>
          )}

          {/* Pricing summary */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              Paiement : <b className="text-slate-200">{activeCourse.mode_paiement === 'especes' ? '💵 Espèces' : '💳 Carte bancaire'}</b>
            </span>
            <span className="text-lg font-black text-emerald-400">
              {activeCourse.prix_total} DH
            </span>
          </div>
        </div>

        {/* Proof of delivery photo capture (Request #9) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Preuve de livraison photo</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Recommandé
            </span>
          </div>

          {proofPhoto ? (
            <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 max-h-48 bg-slate-950">
              <img src={proofPhoto} alt="Preuve" className="w-full h-40 object-cover" />
              <button
                onClick={() => setProofPhoto(null)}
                className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-rose-400 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700"
              >
                Changer la photo
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-800/40 hover:bg-slate-800/80">
              <Camera className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-300">Prendre une photo du colis remis</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Assure la validation instantanée de la course</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
              />
            </label>
          )}
        </div>

        {/* Finish & Céder buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleFinishDelivery}
            disabled={isFinishing}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-sm transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {isFinishing ? 'Validation en cours…' : 'Livraison terminée'}
          </button>

          <button
            onClick={() => onOpenCedeModal(activeCourse.id)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-900/50 hover:border-rose-700/60 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Céder cette course (Toucher 15% commission)
          </button>
        </div>
      </div>
    );
  }

  // Normal Coursier Home View
  const isOnline = currentUser.statut === 'disponible';
  const displayName = currentUser.full_name || `${currentUser.prenom} ${currentUser.nom}`.trim() || 'Partenaire';

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Personalized Greeting Header (Request #5) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white font-display tracking-tight">
            Bonjour {displayName} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Prêt pour vos courses express à Casablanca
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition cursor-pointer"
          title="Actualiser les courses"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Verification banner if needed */}
      {!currentUser.verifie && (
        <div className="bg-amber-950/30 border border-amber-500/50 rounded-2xl p-3.5 text-xs text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Profil en cours de vérification</span>
          </div>
          <p className="text-amber-200/90 leading-relaxed">
            Pour commencer à accepter des courses rémunérées, envoyez votre permis, carte grise et CIN au support WhatsApp CourSEN.
          </p>
          <a
            href="https://wa.me/212607463625"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            💬 Envoyer sur WhatsApp (06 07 46 36 25)
          </a>
        </div>
      )}

      {/* Online / Offline Status Card (Replaces hardcoded Maârif with dynamic GPS - Request #7) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isOnline ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
            {isOnline && (
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            )}
          </div>
          <div>
            <b className="text-sm font-bold text-white block">
              {isOnline ? 'En ligne, disponible' : 'Hors ligne'}
            </b>
            <small className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Casablanca · {gpsActive ? detectedQuartier : 'Position GPS auto'}
            </small>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={onToggleStatus}
          className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer relative border ${
            isOnline
              ? 'bg-emerald-500/20 border-emerald-500/60'
              : 'bg-slate-800 border-slate-700'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full transition-transform duration-200 ease-in-out shadow-md ${
              isOnline
                ? 'translate-x-6 bg-emerald-400'
                : 'translate-x-0 bg-slate-500'
            }`}
          />
        </button>
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="text-2xl font-black text-white font-display">
            {currentUser.nombre_courses || 0}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">
            Courses effectuées
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="text-2xl font-black text-emerald-400 font-display">
            {currentUser.solde_portefeuille || 0} DH
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">
            Gains cumulés
          </div>
        </div>
      </div>

      {/* Available Courses Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Courses disponibles ({availableCourses.length})
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[11px] text-slate-400">Casablanca Express</span>
        </div>

        {availableCourses.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              🛵
            </div>
            <p className="text-sm font-semibold text-slate-300">
              Aucune course en attente pour l'instant
            </p>
            <p className="text-xs text-slate-500">
              Restez en ligne. Dès qu'un apporteur publie une course, une notification sonore retentira automatiquement.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {!isOnline && (
              <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl text-xs text-amber-300">
                ⚠ Activez le mode <b>En ligne</b> pour accepter les courses.
              </div>
            )}

            {availableCourses.map((c) => (
              <div
                key={c.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-white leading-snug">
                      {c.depart_adresse} <span className="text-slate-500 font-normal">→</span> {c.arrivee_adresse}
                    </div>
                    {/* Client name on card (Request #5) */}
                    <div className="text-xs text-slate-400 mt-1">
                      Client : <b className="text-slate-300">{c.apporteur_nom || 'Client Particulier'}</b>
                    </div>
                  </div>
                  <div className="text-lg font-black text-emerald-400 whitespace-nowrap">
                    {c.prix_total} DH
                  </div>
                </div>

                {/* Description and instructions (Request #1) */}
                {c.description_detail && (
                  <div className="text-xs text-slate-300 bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 font-semibold block">Instructions :</span>
                    {c.description_detail}
                  </div>
                )}

                {/* Package photo thumbnail if available (Request #9) */}
                {c.photo_colis_url && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/30">
                    <img src={c.photo_colis_url} alt="Colis" className="w-10 h-10 rounded-md object-cover" />
                    <span>Photo du colis fournie par le client</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span>📍 ~{c.distance_km} km</span>
                    <span>{c.mode_paiement === 'especes' ? '💵 Espèces' : '💳 Carte'}</span>
                    <span>📦 {c.description_colis}</span>
                  </div>
                </div>

                <button
                  onClick={() => onAcceptCourse(c.id)}
                  disabled={!isOnline}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer ${
                    isOnline
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isOnline ? 'Accepter la course' : 'Passez en ligne pour accepter'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
