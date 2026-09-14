import React, { useState, useEffect } from 'react';
import { Course, UserProfile } from '../types';
import { CASABLANCA_QUARTIERS, computeCoursePrice, haversineDistanceKm } from '../data/casablanca';
import { CasablancaMap } from './CasablancaMap';
import { 
  MapPin, 
  Navigation, 
  Camera, 
  Clock, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Upload,
  ArrowRight,
  Phone,
  RefreshCw
} from 'lucide-react';

interface ApporteurViewProps {
  currentUser: UserProfile;
  activeCourse: Course | null;
  userCoords: { lat: number; lng: number } | null;
  detectedQuartier: string;
  gpsActive: boolean;
  onRequestGps: () => void;
  onPublishCourse: (courseData: Omit<Course, 'id' | 'created_at' | 'statut'>) => void;
  onCancelCourse: (courseId: string) => void;
}

export const ApporteurView: React.FC<ApporteurViewProps> = ({
  currentUser,
  activeCourse,
  userCoords,
  detectedQuartier,
  gpsActive,
  onRequestGps,
  onPublishCourse,
  onCancelCourse,
}) => {
  // Form state
  const [depart, setDepart] = useState('Gauthier, Casablanca');
  const [arrivee, setArrivee] = useState('Racine, Casablanca');
  const [departCoords, setDepartCoords] = useState<{ lat: number; lng: number }>({ lat: 33.5895, lng: -7.6280 });
  const [arriveeCoords, setArriveeCoords] = useState<{ lat: number; lng: number }>({ lat: 33.5878, lng: -7.6321 });

  const [typeColis, setTypeColis] = useState('Documents');
  // Case Description with strictly 150 character limit (Request #1)
  const [descriptionDetail, setDescriptionDetail] = useState('');
  const [etage, setEtage] = useState(0);
  const [modePaiement, setModePaiement] = useState<'especes' | 'carte'>('especes');
  
  // Package photo (Request #9)
  const [photoColis, setPhotoColis] = useState<string | null>(null);

  // Autocomplete suggestions
  const [departSuggestions, setDepartSuggestions] = useState<typeof CASABLANCA_QUARTIERS>([]);
  const [arriveeSuggestions, setArriveeSuggestions] = useState<typeof CASABLANCA_QUARTIERS>([]);
  const [showDepartSugg, setShowDepartSugg] = useState(false);
  const [showArriveeSugg, setShowArriveeSugg] = useState(false);

  // Calculate distance dynamically from coordinates
  const distanceKm = Number(
    haversineDistanceKm(departCoords.lat, departCoords.lng, arriveeCoords.lat, arriveeCoords.lng).toFixed(1)
  );

  const pricing = computeCoursePrice(distanceKm, etage);

  // Use My Location for Depart (Request #3)
  const handleUseMyLocationDepart = () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée sur cet appareil');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDepartCoords(coords);
        setDepart(`${detectedQuartier || 'Position actuelle'}, Casablanca`);
      },
      () => {
        onRequestGps();
        setDepart('Gauthier, Bd d\'Anfa, Casablanca');
      },
      { timeout: 6000 }
    );
  };

  // Use My Location for Arrivee (Request #3)
  const handleUseMyLocationArrivee = () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée sur cet appareil');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setArriveeCoords(coords);
        setArrivee(`${detectedQuartier || 'Position actuelle'}, Casablanca`);
      },
      () => {
        onRequestGps();
        setArrivee('Racine, Bd Ziraoui, Casablanca');
      },
      { timeout: 6000 }
    );
  };

  // Filter suggestions
  const handleDepartChange = (val: string) => {
    setDepart(val);
    if (val.trim().length > 0) {
      const filtered = CASABLANCA_QUARTIERS.filter(q =>
        q.name.toLowerCase().includes(val.toLowerCase()) ||
        q.description?.toLowerCase().includes(val.toLowerCase())
      );
      setDepartSuggestions(filtered);
      setShowDepartSugg(true);
    } else {
      setShowDepartSugg(false);
    }
  };

  const handleArriveeChange = (val: string) => {
    setArrivee(val);
    if (val.trim().length > 0) {
      const filtered = CASABLANCA_QUARTIERS.filter(q =>
        q.name.toLowerCase().includes(val.toLowerCase()) ||
        q.description?.toLowerCase().includes(val.toLowerCase())
      );
      setArriveeSuggestions(filtered);
      setShowArriveeSugg(true);
    } else {
      setShowArriveeSugg(false);
    }
  };

  // Handle photo capture / upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoColis(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Publish
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onPublishCourse({
      apporteur_id: currentUser.id,
      apporteur_nom: currentUser.full_name || `${currentUser.prenom} ${currentUser.nom}`.trim() || 'Client CourSEN',
      apporteur_telephone: currentUser.telephone || '0607463625',
      depart_adresse: depart,
      depart_lat: departCoords.lat,
      depart_lng: departCoords.lng,
      arrivee_adresse: arrivee,
      arrivee_lat: arriveeCoords.lat,
      arrivee_lng: arriveeCoords.lng,
      distance_km: distanceKm,
      etage: etage,
      description_colis: typeColis,
      description_detail: descriptionDetail.slice(0, 150),
      photo_colis_url: photoColis || undefined,
      mode_paiement: modePaiement,
      prix_base: pricing.base,
      prix_km_supp: pricing.kmSupp,
      prix_supp_etage: pricing.suppEtage,
      prix_majoration_pointe: pricing.majoration,
      prix_total: pricing.total,
      commission_plateforme: Math.round(pricing.total * 0.12)
    });
  };

  // If a course was published and is currently being searched or matched
  if (activeCourse && (activeCourse.statut === 'en_attente' || activeCourse.statut === 'en_cours' || activeCourse.statut === 'acceptee')) {
    const isMatched = activeCourse.statut === 'en_cours' || activeCourse.statut === 'acceptee';

    return (
      <div className="space-y-4 pb-20 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-white font-display">
            {isMatched ? 'Coursier en route ✓' : 'Recherche de coursier…'}
          </h1>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isMatched ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
          }`}>
            {isMatched ? 'Pris en charge' : 'En attente'}
          </span>
        </div>

        {/* Map */}
        <CasablancaMap
          departAdresse={activeCourse.depart_adresse}
          arriveeAdresse={activeCourse.arrivee_adresse}
          distanceKm={activeCourse.distance_km}
        />

        {/* Status card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          {isMatched ? (
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                  🛵
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    {activeCourse.coursier_nom || 'Mehdi K. (Coursier)'}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    Arrive dans ~7 min · Moto vérifiée
                  </span>
                </div>
              </div>
              <a
                href="tel:0661984210"
                className="p-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold"
                title="Appeler le coursier"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
              <div className="text-xs">
                <b className="text-white block">Notification push envoyée aux coursiers</b>
                <span className="text-slate-400">Attribution au coursier le plus proche de Casablanca.</span>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Trajet</span>
              <span className="text-slate-200 font-bold text-right truncate max-w-[200px]">
                {activeCourse.depart_adresse} → {activeCourse.arrivee_adresse}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Distance</span>
              <span className="text-slate-200 font-bold">{activeCourse.distance_km} km</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Mode de paiement</span>
              <span className="text-slate-200 font-bold">
                {activeCourse.mode_paiement === 'especes' ? '💵 Espèces à la livraison' : '💳 Carte bancaire'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Prix total</span>
              <span className="text-emerald-400 font-black text-sm">{activeCourse.prix_total} DH</span>
            </div>
          </div>

          {/* Package photo preview if attached */}
          {activeCourse.photo_colis_url && (
            <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
              <img
                src={activeCourse.photo_colis_url}
                alt="Colis"
                className="w-12 h-12 rounded-lg object-cover border border-slate-700"
              />
              <span className="text-xs text-slate-300">
                Photo du colis transmise aux coursiers pour identification rapide.
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {!isMatched && (
            <button
              onClick={() => onCancelCourse(activeCourse.id)}
              className="w-full py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 font-bold text-xs transition cursor-pointer"
            >
              Annuler cette course
            </button>
          )}
        </div>
      </div>
    );
  }

  // Normal Form view
  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white font-display tracking-tight">
          Nouvelle course express
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Livraison rapide moto à Casablanca en moins de 30 minutes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* POINT DE DÉPART (Request #3) */}
        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Point de départ
            </label>
            {/* Ma position button in Depart (Request #3) */}
            <button
              type="button"
              onClick={handleUseMyLocationDepart}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 px-2 py-0.5 rounded-md border border-emerald-800/50 transition cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              Ma position
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={depart}
              onChange={(e) => handleDepartChange(e.target.value)}
              onFocus={() => setShowDepartSugg(true)}
              placeholder="Ex: Gauthier, Bd d'Anfa..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-sm"
              required
            />
            {showDepartSugg && departSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden z-30 shadow-xl max-h-48 overflow-y-auto">
                {departSuggestions.map((q) => (
                  <button
                    key={q.name}
                    type="button"
                    onClick={() => {
                      setDepart(`${q.name}, Casablanca`);
                      setDepartCoords({ lat: q.lat, lng: q.lng });
                      setShowDepartSugg(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 border-b border-slate-800/80 last:border-none flex items-center justify-between"
                  >
                    <div>
                      <b className="text-emerald-400">{q.name}</b>, Casablanca
                      <span className="text-[10px] text-slate-400 block">{q.description}</span>
                    </div>
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* POINT D'ARRIVÉE (Request #3) */}
        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              Point d'arrivée
            </label>
            {/* Ma position button in Arrivee (Request #3) */}
            <button
              type="button"
              onClick={handleUseMyLocationArrivee}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 px-2 py-0.5 rounded-md border border-emerald-800/50 transition cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              Ma position
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={arrivee}
              onChange={(e) => handleArriveeChange(e.target.value)}
              onFocus={() => setShowArriveeSugg(true)}
              placeholder="Ex: Racine, Bd Ziraoui..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-sm"
              required
            />
            {showArriveeSugg && arriveeSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden z-30 shadow-xl max-h-48 overflow-y-auto">
                {arriveeSuggestions.map((q) => (
                  <button
                    key={q.name}
                    type="button"
                    onClick={() => {
                      setArrivee(`${q.name}, Casablanca`);
                      setArriveeCoords({ lat: q.lat, lng: q.lng });
                      setShowArriveeSugg(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 border-b border-slate-800/80 last:border-none flex items-center justify-between"
                  >
                    <div>
                      <b className="text-emerald-400">{q.name}</b>, Casablanca
                      <span className="text-[10px] text-slate-400 block">{q.description}</span>
                    </div>
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Casablanca Map Preview */}
        <CasablancaMap
          departAdresse={depart}
          arriveeAdresse={arrivee}
          departCoords={departCoords}
          arriveeCoords={arriveeCoords}
          distanceKm={distanceKm}
          onSelectQuartier={(quartier) => {
            const q = CASABLANCA_QUARTIERS.find(x => x.name === quartier);
            if (q) {
              setArrivee(`${q.name}, Casablanca`);
              setArriveeCoords({ lat: q.lat, lng: q.lng });
            }
          }}
        />

        {/* CASE DESCRIPTION (Strictly 150 characters - Request #1) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">
              Description & précisions pour le coursier
            </label>
            <span
              className={`text-[11px] font-mono font-bold ${
                descriptionDetail.length >= 140
                  ? 'text-rose-400'
                  : descriptionDetail.length >= 100
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {descriptionDetail.length} / 150 caractères
            </span>
          </div>

          <textarea
            maxLength={150}
            rows={2}
            value={descriptionDetail}
            onChange={(e) => setDescriptionDetail(e.target.value)}
            placeholder="Ex: Sac scellé fragile, demander Fatima au 2ème étage, code interphone 482B..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none shadow-sm"
          />
        </div>

        {/* PHOTO DU COLIS (Request #9 - Aide pour les notifications push) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              Photo du colis (recommandé pour les alertes push)
            </label>
            <span className="text-[10px] text-slate-400">Visible par le coursier</span>
          </div>

          {photoColis ? (
            <div className="relative rounded-xl overflow-hidden border border-emerald-500/50 max-h-36 bg-slate-950 flex items-center justify-center">
              <img src={photoColis} alt="Colis preview" className="w-full h-32 object-cover" />
              <button
                type="button"
                onClick={() => setPhotoColis(null)}
                className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-rose-400 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Supprimer
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/60 hover:bg-slate-900 rounded-xl p-3 text-xs text-slate-300 cursor-pointer transition">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">Prendre ou importer une photo du paquet</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          )}
        </div>

        {/* Type de colis & Étage */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Type de colis</label>
            <select
              value={typeColis}
              onChange={(e) => setTypeColis(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
            >
              <option>Documents</option>
              <option>Aliments ou repas</option>
              <option>Effets personnels</option>
              <option>Colis fragile</option>
              <option>Électronique</option>
              <option>Vêtements</option>
              <option>Autre</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Étage livraison</label>
            <input
              type="number"
              min={0}
              max={25}
              value={etage}
              onChange={(e) => setEtage(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              placeholder="0 (RDC)"
            />
          </div>
        </div>

        {/* Mode de paiement */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Mode de paiement</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModePaiement('especes')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                modePaiement === 'especes'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              💵 Espèces à la livraison
            </button>
            <button
              type="button"
              onClick={() => setModePaiement('carte')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                modePaiement === 'carte'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              💳 Carte bancaire
            </button>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Prise en charge de base (0 à 3 km)</span>
            <span>{pricing.base} DH</span>
          </div>

          {pricing.kmSupp > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Km supplémentaires (~{distanceKm} km)</span>
              <span>+{pricing.kmSupp} DH</span>
            </div>
          )}

          {pricing.suppEtage > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Supplément étage (&gt; 5ème étage)</span>
              <span>+{pricing.suppEtage} DH</span>
            </div>
          )}

          {pricing.pointe && (
            <div className="flex justify-between text-amber-300">
              <span>Majoration heure de pointe Casablanca (+20%)</span>
              <span>+{pricing.majoration} DH</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
            <span>Prix garanti total</span>
            <span className="text-emerald-400 text-base">{pricing.total} DH</span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estimation trajet : ~{pricing.tempsTotalMin} minutes ({pricing.tempsRouteMin} min route)</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Publier la course ({pricing.total} DH)
        </button>
      </form>
    </div>
  );
};
