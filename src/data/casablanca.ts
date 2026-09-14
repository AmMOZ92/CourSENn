import { CasablancaQuartier } from '../types';

export const CASABLANCA_QUARTIERS: CasablancaQuartier[] = [
  { name: "Maârif", lat: 33.5731, lng: -7.6298, description: "Twin Center, Bd Al Massira Al Khadra" },
  { name: "Gauthier", lat: 33.5895, lng: -7.6280, description: "Bd d'Anfa, Rue Jean Jaurès" },
  { name: "Racine", lat: 33.5878, lng: -7.6321, description: "Bd Franklin Roosevelt, Bd Ziraoui" },
  { name: "Bourgogne", lat: 33.5924, lng: -7.6180, description: "Bd de Bourgogne, Mosquée Hassan II" },
  { name: "Val Fleuri", lat: 33.5910, lng: -7.6230, description: "Bd Brahim Roudani" },
  { name: "Ain Diab", lat: 33.5890, lng: -7.6720, description: "La Corniche, Morocco Mall" },
  { name: "Anfa Supérieur", lat: 33.5850, lng: -7.6470, description: "Boulevard Panoramique" },
  { name: "Sidi Belyout", lat: 33.5990, lng: -7.6180, description: "Centre Ville, Bd Mohammed V" },
  { name: "Ancienne Médina", lat: 33.6030, lng: -7.6185, description: "Bab Marrakech, Place des Nations Unies" },
  { name: "Belvédère", lat: 33.5980, lng: -7.6010, description: "Gare Casa-Voyageurs, Bd Emile Zola" },
  { name: "Roches Noires", lat: 33.6050, lng: -7.5890, description: "Gare Casa-Port, Zone Portuaire" },
  { name: "Californie", lat: 33.5560, lng: -7.6390, description: "Bd de la Mecque, Quartier Résidentiel" },
  { name: "Oasis", lat: 33.5570, lng: -7.6280, description: "Gare de l'Oasis, Bd Taza" },
  { name: "Derb Ghallef", lat: 33.5730, lng: -7.6120, description: "Joutia, Rue Soumaya" },
  { name: "Hay Hassani", lat: 33.5540, lng: -7.6660, description: "Boulevard Oum Rabii" },
  { name: "Sidi Maârouf", lat: 33.5220, lng: -7.6480, description: "Casaneashore, Technopark" },
  { name: "Ain Sebaâ", lat: 33.6120, lng: -7.5250, description: "Zone Industrielle, Bd Chefchaouni" },
  { name: "Bernoussi", lat: 33.6190, lng: -7.4980, description: "Bd Hassan II, Al Qods" },
  { name: "Derb Sultan", lat: 33.5710, lng: -7.5950, description: "Quartier Habous, Bd Mohammed VI" },
  { name: "Polo", lat: 33.5620, lng: -7.6190, description: "Boulevard Ghandi" },
  { name: "CIL", lat: 33.5680, lng: -7.6520, description: "Quartier Hay Salam" },
  { name: "2 Mars", lat: 33.5720, lng: -7.6180, description: "Boulevard 2 Mars, Bd Zerktouni" },
  { name: "Palmier", lat: 33.5790, lng: -7.6210, description: "Rue Abdelkrim Diouri" }
];

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.5, R * c * 1.28); // 1.28 urban road routing factor
}

export function findClosestQuartier(lat: number, lng: number): CasablancaQuartier {
  let closest = CASABLANCA_QUARTIERS[0];
  let minDistance = Infinity;

  for (const q of CASABLANCA_QUARTIERS) {
    const dist = haversineDistanceKm(lat, lng, q.lat, q.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = q;
    }
  }

  return closest;
}

// Pricing engine for Casablanca
export const TARIF_BASE = 20; // MAD, includes 0-3km
export const TARIF_KM_SUPP = 4; // MAD/km beyond 3km
export const SUPP_ETAGE = 5; // MAD if floor > 5
export const MAJORATION_POINTE = 0.20; // 20% rush hour
export const PRIX_MIN = 25; // Minimum price

export function isHeurePointe(date: Date = new Date()): boolean {
  const h = date.getHours() + date.getMinutes() / 60;
  return (h >= 12 && h < 14) || (h >= 17 && h < 19.5);
}

export function computeCoursePrice(distanceKm: number, etage: number = 0, date: Date = new Date()) {
  const base = TARIF_BASE;
  const kmSupp = Math.max(0, distanceKm - 3) * TARIF_KM_SUPP;
  const suppEtage = etage > 5 ? SUPP_ETAGE : 0;
  const sousTotal = base + kmSupp + suppEtage;
  const pointe = isHeurePointe(date);
  const majoration = pointe ? sousTotal * MAJORATION_POINTE : 0;
  let total = Math.ceil(sousTotal + majoration);
  const minApplique = total < PRIX_MIN;
  if (minApplique) total = PRIX_MIN;

  const tempsVoitureMin = (distanceKm / 20) * 60;
  const tempsRouteMin = Math.round(tempsVoitureMin * 0.72); // Moto is quicker in Casa traffic
  const tempsEtageMin = etage > 5 ? 7 : etage > 0 ? 3 : 0;
  const tempsTotalMin = tempsRouteMin + tempsEtageMin;

  return {
    base,
    kmSupp: Math.round(kmSupp),
    suppEtage,
    pointe,
    majoration: Math.round(majoration),
    sousTotal,
    total,
    minApplique,
    tempsRouteMin,
    tempsTotalMin
  };
}
