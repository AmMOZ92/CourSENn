export type UserRole = 'coursier' | 'apporteur' | 'admin';
export type RegistrationChannel = 'email' | 'google';

export interface UserProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  full_name: string;
  telephone: string;
  role: UserRole;
  canal: RegistrationChannel;
  ville: string;
  statut: 'disponible' | 'hors_ligne' | 'en_course';
  verifie: boolean;
  photo_url?: string;
  solde_portefeuille: number;
  solde_prepaye_cash: number;
  note_moyenne: number;
  nombre_courses: number;
  created_at: string;
  last_location?: {
    lat: number;
    lng: number;
    address: string;
    updated_at: string;
  };
}

export type CourseStatus = 'en_attente' | 'acceptee' | 'en_cours' | 'livree' | 'annulee';

export interface Course {
  id: string;
  created_at: string;
  apporteur_id: string;
  apporteur_nom?: string;
  apporteur_telephone?: string;
  coursier_id?: string | null;
  coursier_nom?: string;
  cede_par?: string | null;
  
  depart_adresse: string;
  depart_lat?: number;
  depart_lng?: number;
  
  arrivee_adresse: string;
  arrivee_lat?: number;
  arrivee_lng?: number;
  
  distance_km: number;
  etage: number;
  description_colis: string; // Type of package
  description_detail: string; // Specific instruction (max 150 chars)
  photo_colis_url?: string; // Optional package photo
  photo_preuve_livraison?: string; // Proof of delivery photo
  
  mode_paiement: 'especes' | 'carte';
  prix_base: number;
  prix_km_supp: number;
  prix_supp_etage: number;
  prix_majoration_pointe: number;
  prix_total: number;
  commission_plateforme: number;
  
  statut: CourseStatus;
  accepted_at?: string;
  delivered_at?: string;
}

export interface Transaction {
  id: string;
  profile_id: string;
  course_id?: string;
  type: 'gain_course' | 'commission_cession' | 'commission_plateforme' | 'recharge_cash' | 'versement_hebdomadaire';
  montant: number;
  note?: string;
  created_at: string;
}

export interface CasablancaQuartier {
  name: string;
  lat: number;
  lng: number;
  description?: string;
}
