import { createClient } from '@supabase/supabase-js';
import { Course, CourseStatus, RegistrationChannel, Transaction, UserProfile, UserRole } from '../types';

export const SUPABASE_URL = 'https://uieeglzjqdadpowgupaj.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZWVnbHpqcWRhZHBvd2d1cGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NzM5MDksImV4cCI6MjEwNDU0OTkwOX0.tUVrNb_mvicN5tjGnvYaC7p8TEUKxKBwTMN7UrLhaDk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fallback synchronized storage keys
const USERS_KEY = 'coursen_users_store_v2';
const COURSES_KEY = 'coursen_courses_store_v2';
const TRANSACTIONS_KEY = 'coursen_tx_store_v2';
const CURRENT_USER_KEY = 'coursen_active_session_v2';

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-coursier-mehdi',
    email: 'mehdi.kacemi@gmail.com',
    nom: 'Kacemi',
    prenom: 'Mehdi',
    full_name: 'Mehdi Kacemi',
    telephone: '0661984210',
    role: 'coursier',
    canal: 'google',
    ville: 'Casablanca',
    statut: 'disponible',
    verifie: true,
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    solde_portefeuille: 480,
    solde_prepaye_cash: 150,
    note_moyenne: 4.9,
    nombre_courses: 38,
    created_at: '2026-03-01T10:15:00Z',
    last_location: {
      lat: 33.5895,
      lng: -7.6280,
      address: 'Gauthier, Casablanca',
      updated_at: new Date().toISOString()
    }
  },
  {
    id: 'user-coursier-amine',
    email: 'amine.coursier@outlook.com',
    nom: 'Bennani',
    prenom: 'Amine',
    full_name: 'Amine Bennani',
    telephone: '0663457812',
    role: 'coursier',
    canal: 'email',
    ville: 'Casablanca',
    statut: 'disponible',
    verifie: true,
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    solde_portefeuille: 320,
    solde_prepaye_cash: 85,
    note_moyenne: 4.8,
    nombre_courses: 24,
    created_at: '2026-03-05T14:22:00Z',
    last_location: {
      lat: 33.5731,
      lng: -7.6298,
      address: 'Maârif, Casablanca',
      updated_at: new Date().toISOString()
    }
  },
  {
    id: 'user-client-karim',
    email: 'falldiagne28@gmail.com',
    nom: 'Diagne',
    prenom: 'Fall',
    full_name: 'Fall Diagne',
    telephone: '0607463625',
    role: 'apporteur',
    canal: 'google',
    ville: 'Casablanca',
    statut: 'disponible',
    verifie: true,
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    solde_portefeuille: 0,
    solde_prepaye_cash: 0,
    note_moyenne: 5.0,
    nombre_courses: 12,
    created_at: '2026-03-08T09:30:00Z'
  },
  {
    id: 'user-client-salma',
    email: 'salma.boutique@gmail.com',
    nom: 'El Fassi',
    prenom: 'Salma',
    full_name: 'Salma El Fassi',
    telephone: '0655223344',
    role: 'apporteur',
    canal: 'email',
    ville: 'Casablanca',
    statut: 'disponible',
    verifie: true,
    solde_portefeuille: 0,
    solde_prepaye_cash: 0,
    note_moyenne: 4.9,
    nombre_courses: 19,
    created_at: '2026-03-10T16:40:00Z'
  }
];

const INITIAL_COURSES: Course[] = [
  {
    id: 'course-cas-01',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    apporteur_id: 'user-client-salma',
    apporteur_nom: 'Salma El Fassi (Boutique)',
    apporteur_telephone: '0655223344',
    depart_adresse: 'Gauthier, Rue 4',
    depart_lat: 33.5895,
    depart_lng: -7.6280,
    arrivee_adresse: 'Racine, Bd Ziraoui',
    arrivee_lat: 33.5878,
    arrivee_lng: -7.6321,
    distance_km: 2.8,
    etage: 0,
    description_colis: 'Vêtements',
    description_detail: 'Commande client #482, sac kraft fermé avec facture agrafée dessus. Remettre à la réception.',
    photo_colis_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&auto=format&fit=crop&q=80',
    mode_paiement: 'especes',
    prix_base: 20,
    prix_km_supp: 0,
    prix_supp_etage: 0,
    prix_majoration_pointe: 0,
    prix_total: 25,
    commission_plateforme: 3,
    statut: 'en_attente'
  },
  {
    id: 'course-cas-02',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    apporteur_id: 'user-client-karim',
    apporteur_nom: 'Fall Diagne',
    apporteur_telephone: '0607463625',
    depart_adresse: 'Bourgogne, Bd Zerktouni',
    depart_lat: 33.5924,
    depart_lng: -7.6180,
    arrivee_adresse: 'Sidi Belyout, Bd Mohammed V',
    arrivee_lat: 33.5990,
    arrivee_lng: -7.6180,
    distance_km: 4.2,
    etage: 2,
    description_colis: 'Documents',
    description_detail: 'Dossier juridique urgent sous pli scellé. Code interphone 14B.',
    mode_paiement: 'carte',
    prix_base: 20,
    prix_km_supp: 5,
    prix_supp_etage: 0,
    prix_majoration_pointe: 0,
    prix_total: 28,
    commission_plateforme: 4,
    statut: 'en_attente'
  }
];

export class StorageService {
  static getUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (!stored) {
        localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: UserProfile[]): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  static getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  static getUserByEmail(email: string): UserProfile | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static upsertUser(user: UserProfile): UserProfile {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.unshift(user);
    }
    this.saveUsers(users);

    // Also background sync to Supabase if possible
    Promise.resolve(
      supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        full_name: user.full_name,
        telephone: user.telephone,
        role: user.role,
        canal: user.canal,
        ville: user.ville,
        statut: user.statut,
        verifie: user.verifie,
        photo_url: user.photo_url,
        solde_portefeuille: user.solde_portefeuille,
        solde_prepaye_cash: user.solde_prepaye_cash,
        note_moyenne: user.note_moyenne,
        nombre_courses: user.nombre_courses
      })
    ).then((res: any) => {
      if (res?.error) console.log('Supabase sync note:', res.error.message);
    }).catch(() => {});

    return user;
  }

  static getCourses(): Course[] {
    try {
      const stored = localStorage.getItem(COURSES_KEY);
      if (!stored) {
        localStorage.setItem(COURSES_KEY, JSON.stringify(INITIAL_COURSES));
        return INITIAL_COURSES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_COURSES;
    }
  }

  static saveCourses(courses: Course[]): void {
    try {
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  static addCourse(course: Course): Course {
    const courses = this.getCourses();
    courses.unshift(course);
    this.saveCourses(courses);

    // Sync to Supabase table
    Promise.resolve(
      supabase.from('courses').insert({
        id: course.id,
        apporteur_id: course.apporteur_id,
        depart_adresse: course.depart_adresse,
        depart_lat: course.depart_lat,
        depart_lng: course.depart_lng,
        arrivee_adresse: course.arrivee_adresse,
        arrivee_lat: course.arrivee_lat,
        arrivee_lng: course.arrivee_lng,
        distance_km: course.distance_km,
        etage: course.etage,
        description_colis: course.description_colis,
        mode_paiement: course.mode_paiement,
        prix_base: course.prix_base,
        prix_km_supp: course.prix_km_supp,
        prix_supp_etage: course.prix_supp_etage,
        prix_majoration_pointe: course.prix_majoration_pointe,
        prix_total: course.prix_total,
        statut: course.statut
      })
    ).then((res: any) => {
      if (res?.error) console.log('Supabase insert note:', res.error.message);
    }).catch(() => {});

    return course;
  }

  static updateCourse(id: string, updates: Partial<Course>): Course | null {
    const courses = this.getCourses();
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) return null;

    courses[index] = { ...courses[index], ...updates };
    this.saveCourses(courses);

    // Update in Supabase
    Promise.resolve(
      supabase.from('courses').update({
        statut: updates.statut,
        coursier_id: updates.coursier_id,
        accepted_at: updates.accepted_at,
        delivered_at: updates.delivered_at,
        cede_par: updates.cede_par
      }).eq('id', id)
    ).then((res: any) => {
      if (res?.error) console.log('Supabase update note:', res.error.message);
    }).catch(() => {});

    return courses[index];
  }

  static getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    // Default to Fall Diagne if first load
    return INITIAL_USERS[2];
  }

  static setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  static getTransactions(profileId?: string): Transaction[] {
    try {
      const stored = localStorage.getItem(TRANSACTIONS_KEY);
      const txs: Transaction[] = stored ? JSON.parse(stored) : [
        {
          id: 'tx-1',
          profile_id: 'user-coursier-mehdi',
          type: 'gain_course',
          montant: 25,
          note: 'Course Gauthier → Racine livrée',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'tx-2',
          profile_id: 'user-coursier-mehdi',
          type: 'commission_cession',
          montant: 6,
          note: 'Commission de cession (15%)',
          created_at: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ];
      if (profileId) {
        return txs.filter(t => t.profile_id === profileId);
      }
      return txs;
    } catch {
      return [];
    }
  }

  static addTransaction(tx: Transaction): void {
    const txs = this.getTransactions();
    txs.unshift(tx);
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
    } catch {}
  }
}
