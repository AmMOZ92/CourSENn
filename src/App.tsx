/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Course, UserProfile, UserRole, Transaction, CourseStatus } from './types';
import { StorageService, supabase } from './lib/supabase';
import { isPlatformOwner } from './lib/auth-helpers';
import { CASABLANCA_QUARTIERS, findClosestQuartier } from './data/casablanca';

import { Header } from './components/Header';
import { GpsBanner } from './components/GpsBanner';
import { PushNotification } from './components/PushNotification';
import { CoursierView } from './components/CoursierView';
import { ApporteurView } from './components/ApporteurView';
import { AdminView } from './components/AdminView';
import { WalletView } from './components/WalletView';
import { ProfileView } from './components/ProfileView';
import { HistoryView } from './components/HistoryView';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { CedeModal } from './components/CedeModal';

export default function App() {
  // Current user & authentication
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => StorageService.getCurrentUser());
  const [activeRole, setActiveRole] = useState<UserRole>(() => currentUser?.role || 'coursier');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>('coursier-home');

  // Courses and users state
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [users, setUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.getTransactions());

  // GPS & Geolocation state (Request #6 & #7)
  const [gpsActive, setGpsActive] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedQuartier, setDetectedQuartier] = useState('Casablanca (Gauthier)');

  // Push notification alert (Request #9)
  const [incomingPushCourse, setIncomingPushCourse] = useState<Course | null>(null);

  // Céder modal state
  const [cedeModalCourseId, setCedeModalCourseId] = useState<string | null>(null);

  // Auto-sync & refresh state (Request #8)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // -------------------------------------------------------------
  // GPS Geolocation Handler (Request #6 & #7)
  // -------------------------------------------------------------
  const requestGpsPosition = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Géolocalisation non prise en charge sur cet appareil.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setGpsActive(true);

        // Resolve closest Casablanca quartier (replaces hardcoded Maârif - Request #7)
        const closest = findClosestQuartier(coords.lat, coords.lng);
        setDetectedQuartier(closest.name);

        // Update in current user's profile
        if (currentUser) {
          const updatedUser: UserProfile = {
            ...currentUser,
            last_location: {
              lat: coords.lat,
              lng: coords.lng,
              address: `${closest.name}, Casablanca`,
              updated_at: new Date().toISOString()
            }
          };
          StorageService.upsertUser(updatedUser);
          setCurrentUser(updatedUser);
        }

        showToast(`📍 Position détectée : ${closest.name}, Casablanca`);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback to Gauthier Casablanca as default
        setUserCoords({ lat: 33.5895, lng: -7.6280 });
        setDetectedQuartier('Gauthier, Casablanca');
        setGpsActive(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [currentUser]);

  // Request GPS on startup
  useEffect(() => {
    requestGpsPosition();
  }, []);

  // -------------------------------------------------------------
  // Data Refresh & Continuous Auto-Sync (Request #8)
  // Ensures user never has to leave and re-enter the app to stay up to date
  // -------------------------------------------------------------
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch latest courses from Supabase if possible, merge with local
      const { data: remoteCourses } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (remoteCourses && remoteCourses.length > 0) {
        // Map any remote courses
        const mappedRemote: Course[] = remoteCourses.map((rc: any) => ({
          id: rc.id,
          created_at: rc.created_at,
          apporteur_id: rc.apporteur_id,
          apporteur_nom: rc.apporteur_nom || 'Client Particulier',
          apporteur_telephone: rc.apporteur_telephone || '0607463625',
          coursier_id: rc.coursier_id,
          coursier_nom: rc.coursier_nom,
          cede_par: rc.cede_par,
          depart_adresse: rc.depart_adresse,
          depart_lat: rc.depart_lat,
          depart_lng: rc.depart_lng,
          arrivee_adresse: rc.arrivee_adresse,
          arrivee_lat: rc.arrivee_lat,
          arrivee_lng: rc.arrivee_lng,
          distance_km: rc.distance_km || 3,
          etage: rc.etage || 0,
          description_colis: rc.description_colis || 'Documents',
          description_detail: rc.description_detail || '',
          photo_colis_url: rc.photo_colis_url,
          photo_preuve_livraison: rc.photo_preuve_livraison,
          mode_paiement: rc.mode_paiement || 'especes',
          prix_base: rc.prix_base || 20,
          prix_km_supp: rc.prix_km_supp || 0,
          prix_supp_etage: rc.prix_supp_etage || 0,
          prix_majoration_pointe: rc.prix_majoration_pointe || 0,
          prix_total: rc.prix_total || 25,
          commission_plateforme: rc.commission_plateforme || 3,
          statut: rc.statut || 'en_attente'
        }));

        // Merge with local courses to prevent loss
        const localCourses = StorageService.getCourses();
        const combined = [...mappedRemote];
        localCourses.forEach(lc => {
          if (!combined.some(c => c.id === lc.id)) {
            combined.push(lc);
          }
        });
        setCourses(combined);
        StorageService.saveCourses(combined);
      } else {
        setCourses(StorageService.getCourses());
      }

      // 2. Fetch users
      const { data: remoteUsers } = await supabase.from('profiles').select('*').limit(50);
      if (remoteUsers && remoteUsers.length > 0) {
        const localUsers = StorageService.getUsers();
        const mergedUsers = [...localUsers];
        remoteUsers.forEach((ru: any) => {
          const idx = mergedUsers.findIndex(u => u.id === ru.id);
          if (idx >= 0) {
            mergedUsers[idx] = { ...mergedUsers[idx], ...ru };
          } else {
            mergedUsers.push({
              id: ru.id,
              email: ru.email || 'user@coursen.online',
              nom: ru.nom || ru.full_name?.split(' ')?.[1] || '',
              prenom: ru.prenom || ru.full_name?.split(' ')?.[0] || 'Utilisateur',
              full_name: ru.full_name || `${ru.prenom || ''} ${ru.nom || ''}`.trim(),
              telephone: ru.telephone || '0607463625',
              role: ru.role || 'coursier',
              canal: ru.canal || 'email',
              ville: ru.ville || 'Casablanca',
              statut: ru.statut || 'disponible',
              verifie: ru.verifie ?? false,
              photo_url: ru.photo_url,
              solde_portefeuille: ru.solde_portefeuille || 0,
              solde_prepaye_cash: ru.solde_prepaye_cash || 0,
              note_moyenne: ru.note_moyenne || 5.0,
              nombre_courses: ru.nombre_courses || 0,
              created_at: ru.created_at || new Date().toISOString()
            });
          }
        });
        setUsers(mergedUsers);
        StorageService.saveUsers(mergedUsers);
      } else {
        setUsers(StorageService.getUsers());
      }

      setTransactions(StorageService.getTransactions(currentUser?.id));
      setLastSyncTime(new Date());
    } catch (e) {
      console.warn('Sync notice:', e);
      setCourses(StorageService.getCourses());
      setUsers(StorageService.getUsers());
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, [currentUser]);

  // Periodic polling interval (every 7 seconds) + Supabase Realtime channel (Request #8)
  useEffect(() => {
    refreshData();

    // Auto-polling heartbeat
    const interval = setInterval(() => {
      refreshData();
    }, 7000);

    // Supabase Realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.statut === 'en_attente') {
          // Trigger push notification if not published by current user
          if (payload.new.apporteur_id !== currentUser?.id && activeRole === 'coursier') {
            setIncomingPushCourse(payload.new as Course);
          }
        }
        refreshData();
      })
      .subscribe();

    // Refresh when user tabs back into the browser
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refreshData, currentUser, activeRole]);

  // -------------------------------------------------------------
  // Course Management Actions
  // -------------------------------------------------------------
  const handlePublishCourse = (courseData: Omit<Course, 'id' | 'created_at' | 'statut'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      created_at: new Date().toISOString(),
      statut: 'en_attente'
    };

    StorageService.addCourse(newCourse);
    setCourses(prev => [newCourse, ...prev]);
    showToast('✓ Course publiée aux coursiers de Casablanca !');

    // Simulate real incoming push after 2 seconds for preview interactivity
    setTimeout(() => {
      setIncomingPushCourse(newCourse);
    }, 2000);
  };

  const handleAcceptCourse = (courseId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (currentUser.role !== 'coursier' && activeRole !== 'coursier') {
      showToast('Seul un compte coursier peut accepter des courses.');
      return;
    }

    const updated = StorageService.updateCourse(courseId, {
      statut: 'en_cours',
      coursier_id: currentUser.id,
      coursier_nom: currentUser.full_name || `${currentUser.prenom} ${currentUser.nom}`,
      accepted_at: new Date().toISOString()
    });

    if (updated) {
      setCourses(prev => prev.map(c => c.id === courseId ? updated : c));
      setIncomingPushCourse(null);
      setActiveTab('coursier-active');
      showToast('Course acceptée ! En route vers le point de départ.');
    }
  };

  const handleFinishCourse = (courseId: string, proofPhotoUrl?: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !currentUser) return;

    const commissionPlateforme = Math.round(course.prix_total * 0.12);
    const gainNet = course.prix_total - commissionPlateforme;

    // Update course status
    const updated = StorageService.updateCourse(courseId, {
      statut: 'livree',
      photo_preuve_livraison: proofPhotoUrl,
      delivered_at: new Date().toISOString()
    });

    if (updated) {
      setCourses(prev => prev.map(c => c.id === courseId ? updated : c));

      // Update user wallet & course count
      const updatedUser: UserProfile = {
        ...currentUser,
        solde_portefeuille: (currentUser.solde_portefeuille || 0) + gainNet,
        nombre_courses: (currentUser.nombre_courses || 0) + 1
      };
      StorageService.upsertUser(updatedUser);
      setCurrentUser(updatedUser);

      // Add transaction
      StorageService.addTransaction({
        id: `tx-${Date.now()}`,
        profile_id: currentUser.id,
        course_id: courseId,
        type: 'gain_course',
        montant: gainNet,
        note: `Course ${course.depart_adresse} → ${course.arrivee_adresse}`,
        created_at: new Date().toISOString()
      });

      // If ceded, credit original coursier with 15%
      if (course.cede_par) {
        const commissionCession = Math.round(course.prix_total * 0.15);
        const cedant = users.find(u => u.id === course.cede_par);
        if (cedant) {
          const updatedCedant: UserProfile = {
            ...cedant,
            solde_portefeuille: (cedant.solde_portefeuille || 0) + commissionCession
          };
          StorageService.upsertUser(updatedCedant);
        }
      }

      showToast('🎉 Livraison terminée avec succès !');
      setActiveTab('coursier-home');
      refreshData();
    }
  };

  const handleConfirmCede = (newCoursierId: string, newCoursierNom: string) => {
    if (!cedeModalCourseId || !currentUser) return;

    const updated = StorageService.updateCourse(cedeModalCourseId, {
      coursier_id: newCoursierId,
      coursier_nom: newCoursierNom,
      cede_par: currentUser.id
    });

    if (updated) {
      setCourses(prev => prev.map(c => c.id === cedeModalCourseId ? updated : c));
      setCedeModalCourseId(null);
      showToast(`Course cédée à ${newCoursierNom}. Vous toucherez 15% à la livraison !`);
      setActiveTab('coursier-home');
    }
  };

  const handleCancelCourse = (courseId: string) => {
    const updated = StorageService.updateCourse(courseId, { statut: 'annulee' });
    if (updated) {
      setCourses(prev => prev.map(c => c.id === courseId ? updated : c));
      showToast('Course annulée.');
    }
  };

  const handleUpdateCourseStatus = (courseId: string, newStatus: CourseStatus) => {
    const updated = StorageService.updateCourse(courseId, { statut: newStatus });
    if (updated) {
      setCourses(prev => prev.map(c => c.id === courseId ? updated : c));
      showToast(`Statut course mis à jour : ${newStatus}`);
    }
  };

  const handleToggleStatus = () => {
    if (!currentUser) return;
    const newStatus = currentUser.statut === 'disponible' ? 'hors_ligne' : 'disponible';
    const updated: UserProfile = { ...currentUser, statut: newStatus };
    StorageService.upsertUser(updated);
    setCurrentUser(updated);
    showToast(newStatus === 'disponible' ? 'Vous êtes maintenant En Ligne (Visible)' : 'Vous êtes Hors Ligne');
  };

  const handleToggleUserVerification = (userId: string) => {
    const userToToggle = users.find(u => u.id === userId);
    if (!userToToggle) return;

    const updated: UserProfile = { ...userToToggle, verifie: !userToToggle.verifie };
    StorageService.upsertUser(updated);
    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    showToast(`Statut de ${updated.full_name} mis à jour : ${updated.verifie ? 'Vérifié' : 'En attente'}`);
  };

  const handleUpdateAvatar = (photoUrl: string) => {
    if (!currentUser) return;
    const updated: UserProfile = { ...currentUser, photo_url: photoUrl };
    StorageService.upsertUser(updated);
    setCurrentUser(updated);
    showToast('Photo de profil mise à jour avec succès.');
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setIsAuthModalOpen(true);
    showToast('Déconnecté.');
  };

  // Check if current user is strictly the owner/administrator (falldiagne28@gmail.com or 0607463625)
  const isOwner = isPlatformOwner(currentUser);

  // Switch role and update tabs accordingly
  const handleRoleChange = (role: UserRole) => {
    if (role === 'admin' && !isOwner) {
      showToast('Accès restreint au propriétaire (falldiagne28@gmail.com / 0607463625).');
      return;
    }
    setActiveRole(role);
    if (role === 'coursier') {
      setActiveTab('coursier-home');
    } else if (role === 'apporteur') {
      setActiveTab('apporteur-new');
    } else if (role === 'admin') {
      setActiveTab('admin-users');
    }
  };

  // Find active course for coursier
  const activeCourseForCoursier = courses.find(
    c => c.coursier_id === currentUser?.id && (c.statut === 'en_cours' || c.statut === 'acceptee')
  ) || null;

  // Find active course for apporteur
  const activeCourseForApporteur = courses.find(
    c => c.apporteur_id === currentUser?.id && (c.statut === 'en_attente' || c.statut === 'en_cours' || c.statut === 'acceptee')
  ) || null;

  // Available courses for coursier
  const availableCourses = courses.filter(c => c.statut === 'en_attente');

  return (
    <div className="min-h-screen bg-[#090c10] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans">
      {/* Push Notification Banner (Request #9) */}
      <PushNotification
        course={incomingPushCourse}
        onAccept={handleAcceptCourse}
        onDismiss={() => setIncomingPushCourse(null)}
      />

      {/* Main App Container */}
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1 bg-[#0e121a] shadow-2xl relative min-h-screen border-x border-slate-800/80">
        {/* Top Header with Large Icons (Request #2) */}
        <Header
          currentUser={currentUser}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenAdmin={() => {
            if (isOwner) {
              setActiveRole('admin');
              setActiveTab('admin-users');
            } else {
              showToast('Accès restreint au propriétaire (falldiagne28@gmail.com).');
            }
          }}
          onLogout={handleLogout}
          onManualRefresh={refreshData}
          isRefreshing={isRefreshing}
          isOnline={currentUser?.statut === 'disponible'}
        />

        {/* Inner Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {/* GPS Banner & Superposition Notice (Request #6 & #7) */}
          <GpsBanner
            gpsActive={gpsActive}
            userCoords={userCoords}
            detectedQuartier={detectedQuartier}
            onRequestGps={requestGpsPosition}
            role={activeRole}
          />

          {/* VIEW: COURSIER HOME */}
          {activeTab === 'coursier-home' && currentUser && (
            <CoursierView
              currentUser={currentUser}
              availableCourses={availableCourses}
              activeCourse={activeCourseForCoursier}
              detectedQuartier={detectedQuartier}
              userCoords={userCoords}
              gpsActive={gpsActive}
              onAcceptCourse={handleAcceptCourse}
              onFinishCourse={handleFinishCourse}
              onOpenCedeModal={(id) => setCedeModalCourseId(id)}
              onToggleStatus={handleToggleStatus}
              onRequestGps={requestGpsPosition}
              onRefresh={refreshData}
              isRefreshing={isRefreshing}
            />
          )}

          {/* VIEW: COURSIER ACTIVE COURSE */}
          {activeTab === 'coursier-active' && currentUser && (
            <CoursierView
              currentUser={currentUser}
              availableCourses={availableCourses}
              activeCourse={activeCourseForCoursier}
              detectedQuartier={detectedQuartier}
              userCoords={userCoords}
              gpsActive={gpsActive}
              onAcceptCourse={handleAcceptCourse}
              onFinishCourse={handleFinishCourse}
              onOpenCedeModal={(id) => setCedeModalCourseId(id)}
              onToggleStatus={handleToggleStatus}
              onRequestGps={requestGpsPosition}
              onRefresh={refreshData}
              isRefreshing={isRefreshing}
            />
          )}

          {/* VIEW: APPORTEUR NEW COURSE */}
          {activeTab === 'apporteur-new' && currentUser && (
            <ApporteurView
              currentUser={currentUser}
              activeCourse={activeCourseForApporteur}
              userCoords={userCoords}
              detectedQuartier={detectedQuartier}
              gpsActive={gpsActive}
              onRequestGps={requestGpsPosition}
              onPublishCourse={handlePublishCourse}
              onCancelCourse={handleCancelCourse}
            />
          )}

          {/* VIEW: APPORTEUR HISTORY */}
          {activeTab === 'apporteur-history' && currentUser && (
            <HistoryView
              courses={courses.filter(c => c.apporteur_id === currentUser.id)}
            />
          )}

          {/* VIEW: WALLET */}
          {activeTab === 'wallet' && currentUser && (
            <WalletView
              currentUser={currentUser}
              transactions={transactions}
            />
          )}

          {/* VIEW: PROFILE */}
          {activeTab === 'profile' && currentUser && (
            <ProfileView
              currentUser={currentUser}
              onUpdateAvatar={handleUpdateAvatar}
              onLogout={handleLogout}
            />
          )}

          {/* VIEW: ADMIN DASHBOARD (Request #10 - Réservé exclusivement au propriétaire) */}
          {activeTab === 'admin-users' && (
            isOwner ? (
              <AdminView
                currentUser={currentUser}
                users={users}
                courses={courses}
                onToggleUserVerification={handleToggleUserVerification}
                onRefreshData={refreshData}
                onUpdateCourseStatus={handleUpdateCourseStatus}
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                  ⚠️
                </div>
                <h3 className="text-sm font-bold text-white">Accès Réservé au Propriétaire</h3>
                <p className="text-slate-400 text-xs">
                  Cette section est strictement réservée au propriétaire administrateur (<b>falldiagne28@gmail.com</b> ou tél. <b>0607463625</b>). Veuillez vous connecter avec ce compte pour y accéder.
                </p>
                <button
                  onClick={() => setActiveTab('coursier-home')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-emerald-400 transition"
                >
                  Retour à l'accueil
                </button>
              </div>
            )
          )}
        </main>

        {/* Bottom Tab Navigation */}
        <BottomNav
          role={activeRole}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasActiveCourse={Boolean(activeCourseForCoursier)}
        />
      </div>

      {/* Céder Course Modal */}
      <CedeModal
        isOpen={Boolean(cedeModalCourseId)}
        onClose={() => setCedeModalCourseId(null)}
        availableCoursiers={users.filter(u => u.role === 'coursier' && u.id !== currentUser?.id)}
        onConfirmCede={handleConfirmCede}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen || !currentUser}
        onClose={() => {
          if (currentUser) setIsAuthModalOpen(false);
        }}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          StorageService.setCurrentUser(user);
          StorageService.upsertUser(user);
          setActiveRole(user.role);
          setIsAuthModalOpen(false);
          showToast(`Bienvenue, ${user.prenom || user.full_name} !`);
          refreshData();
        }}
      />

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
