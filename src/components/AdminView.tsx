import React, { useState } from 'react';
import { UserProfile, Course, RegistrationChannel, UserRole, CourseStatus } from '../types';
import { isPlatformOwner } from '../lib/auth-helpers';
import { 
  Crown, 
  Users, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  ExternalLink, 
  FileSpreadsheet, 
  Mail, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Send,
  Bell,
  Sparkles,
  RefreshCw,
  Package,
  Bike,
  Shield,
  Code,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Smartphone
} from 'lucide-react';

interface AdminViewProps {
  currentUser?: UserProfile | null;
  users: UserProfile[];
  courses: Course[];
  onToggleUserVerification: (userId: string) => void;
  onRefreshData: () => void;
  onUpdateCourseStatus?: (courseId: string, newStatus: CourseStatus) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  users,
  courses,
  onToggleUserVerification,
  onRefreshData,
  onUpdateCourseStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'sheets' | 'push' | 'courses' | 'code'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [filterCanal, setFilterCanal] = useState<'all' | RegistrationChannel>('all');
  
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEdgeFn, setCopiedEdgeFn] = useState(false);
  const [copiedAppsScript, setCopiedAppsScript] = useState(false);
  const [copiedCodeNotice, setCopiedCodeNotice] = useState(false);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  // Push notification live test state
  const [pushTestStatus, setPushTestStatus] = useState<string | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.telephone?.includes(searchTerm);

    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesCanal = filterCanal === 'all' || u.canal === filterCanal;

    return matchesSearch && matchesRole && matchesCanal;
  });

  // Export to CSV for Google Sheets & Excel
  const handleExportCSV = () => {
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Rôle', 'Canal Inscription', 'Statut Vérifié', 'Ville', 'Date Inscription'];
    const rows = filteredUsers.map((u) => [
      `"${(u.nom || '').replace(/"/g, '""')}"`,
      `"${(u.prenom || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.telephone || '').replace(/"/g, '""')}"`,
      `"${u.role || ''}"`,
      `"${u.canal || 'email'}"`,
      `"${u.verifie ? 'Vérifié' : 'En attente'}"`,
      `"${u.ville || 'Casablanca'}"`,
      `"${new Date(u.created_at).toLocaleDateString('fr-FR')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `coursen_utilisateurs_casablanca_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy TSV directly to clipboard (Paste straight into Google Sheets with Ctrl+V)
  const handleCopyForGoogleSheet = () => {
    const headers = ['Nom\tPrénom\tEmail\tTéléphone\tRôle\tCanal Inscription\tStatut Vérifié\tVille\tDate Inscription'];
    const rows = filteredUsers.map((u) => 
      `${u.nom || ''}\t${u.prenom || ''}\t${u.email || ''}\t${u.telephone || ''}\t${u.role || ''}\t${u.canal || 'email'}\t${u.verifie ? 'Vérifié' : 'En attente'}\t${u.ville || 'Casablanca'}\t${new Date(u.created_at).toLocaleDateString('fr-FR')}`
    );

    const tsvText = [headers, ...rows].join('\n');
    navigator.clipboard.writeText(tsvText);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2500);
  };

  // Copy all emails as a comma-separated list
  const handleCopyAllEmails = () => {
    const emails = filteredUsers.map(u => u.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  // Trigger Google Sheet Webhook (Request #10)
  const handleTriggerWebhook = async () => {
    if (!webhookUrl.trim()) {
      setWebhookStatus('Veuillez renseigner l\'URL de votre Webhook Google Apps Script.');
      return;
    }

    try {
      setIsSendingWebhook(true);
      setWebhookStatus('Envoi des données vers Google Sheets en cours…');
      const payload = {
        app: 'CourSEN Casablanca',
        exported_at: new Date().toISOString(),
        total_users: users.length,
        users: users.map(u => ({
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          telephone: u.telephone,
          role: u.role,
          canal: u.canal,
          verifie: u.verifie,
          date_inscription: u.created_at
        }))
      };

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setWebhookStatus('✓ Données transmises à Google Sheets avec succès !');
    } catch (e: any) {
      setWebhookStatus('Erreur de transmission : ' + (e?.message || 'Vérifiez l\'URL'));
    } finally {
      setIsSendingWebhook(false);
    }
  };

  // Live Push Notification Tester (Request #9)
  const handleTestPushNotification = async () => {
    if (!('Notification' in window)) {
      setPushTestStatus('Les notifications ne sont pas prises en charge par ce navigateur.');
      return;
    }

    try {
      setPushTestStatus('Demande d\'autorisation du navigateur…');
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        const notif = new Notification('🔔 CourSEN : Nouvelle course disponible !', {
          body: 'Gauthier → Maârif · 35 DH · Client : Karim B. (Appuyez pour accepter)',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'coursen-test-push',
          vibrate: [200, 100, 200],
        } as NotificationOptions);

        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        setPushTestStatus('✓ Notification push envoyée sur votre écran avec succès !');
      } else if (permission === 'denied') {
        setPushTestStatus('⚠️ Notifications refusées dans les paramètres de votre navigateur.');
      } else {
        setPushTestStatus('Notification en attente d\'autorisation.');
      }
    } catch (err: any) {
      setPushTestStatus('Erreur : ' + (err?.message || 'Impossible de déclencher la notification.'));
    }
  };

  const googleUsersCount = users.filter(u => u.canal === 'google').length;
  const emailUsersCount = users.filter(u => u.canal === 'email').length;
  const coursiersCount = users.filter(u => u.role === 'coursier').length;
  const apporteursCount = users.filter(u => u.role === 'apporteur').length;
  const coursiersVerifiesCount = users.filter(u => u.role === 'coursier' && u.verifie).length;

  const sqlCodeSnippet = `-- 1. Table des souscriptions Push pour les coursiers
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'coursier',
  endpoint TEXT NOT NULL UNIQUE,
  auth TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer la sécurité RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les coursiers peuvent enregistrer leur appareil"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id);

-- 3. Fonction déclencheur lors d'une nouvelle course en_attente
CREATE OR REPLACE FUNCTION public.notify_coursiers_on_new_course()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'en_attente' THEN
    -- Appelle l'Edge Function Supabase 'send-course-push'
    PERFORM net.http_post(
      url := 'https://<VOTRE-PROJECT-REF>.supabase.co/functions/v1/send-course-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger automatique sur la table courses
DROP TRIGGER IF EXISTS tr_new_course_push ON public.courses;
CREATE TRIGGER tr_new_course_push
  AFTER INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_coursiers_on_new_course();`;

  const edgeFunctionSnippet = `// supabase/functions/send-course-push/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

serve(async (req) => {
  const { record } = await req.json();
  
  // Clés VAPID pour Push Notifications Web & PWA
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
  webpush.setVapidDetails("mailto:falldiagne28@gmail.com", vapidPublicKey, vapidPrivateKey);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Récupère tous les abonnements push des coursiers disponibles
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("role", "coursier");

  const payload = JSON.stringify({
    title: "⚡ CourSEN : Nouvelle course !",
    body: \`De \${record.depart_adresse} à \${record.arrivee_adresse} (\${record.prix_total} DH)\`,
    url: "/?course=" + record.id,
    courseId: record.id
  });

  const promises = (subs || []).map(sub => 
    webpush.sendNotification({
      endpoint: sub.endpoint,
      keys: { auth: sub.auth, p256dh: sub.p256dh }
    }, payload).catch(err => console.error("Push failed for sub:", sub.id, err))
  );

  await Promise.all(promises);

  return new Response(JSON.stringify({ success: true, count: subs?.length || 0 }), {
    headers: { "Content-Type": "application/json" }
  });
});`;

  const appsScriptSnippet = `// Code Google Apps Script pour synchroniser automatiquement avec Google Sheets
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Si la feuille est vide, ajouter les en-têtes
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Nom", "Prénom", "Email", "Téléphone", 
        "Rôle", "Canal Inscription", "Statut Vérifié", "Date Inscription"
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#10b981").setFontColor("#ffffff");
    }
    
    // Ajouter chaque utilisateur inscrit
    data.users.forEach(function(u) {
      sheet.appendRow([
        u.nom || "", 
        u.prenom || "", 
        u.email || "", 
        u.telephone || "", 
        u.role || "", 
        u.canal || "email", 
        u.verifie ? "Oui" : "Non", 
        u.date_inscription || new Date().toISOString()
      ]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.users.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  // Strict Owner Access check
  if (!isPlatformOwner(currentUser)) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-xs text-slate-400 space-y-4 max-w-md mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Crown className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Espace Propriétaire Réservé</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cet espace est strictement accessible uniquement après connexion avec l'adresse courriel <b className="text-white">falldiagne28@gmail.com</b> ou le numéro de téléphone <b className="text-white">0607463625</b>.
          </p>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          Utilisateur actuel : <span className="text-amber-300">{currentUser?.email || currentUser?.telephone || 'Non connecté'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header with Owner Identification */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/60 border border-purple-500/50 rounded-3xl p-4 sm:p-5 shadow-xl shadow-purple-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-400/10 shrink-0">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white font-display">
                  Espace Propriétaire CourSEN
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold uppercase tracking-wide">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Propriétaire : <span className="font-semibold text-white">falldiagne28@gmail.com</span> · Tél : <span className="font-semibold text-white">0607463625</span> · Accès direct sans passer par Supabase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            <a
              href="/coursen-casablanca-source.zip"
              download="coursen-casablanca-source.zip"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md shadow-amber-500/20"
              title="Télécharger l'intégralité du code source en archive ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger Code (.ZIP)</span>
            </a>

            <button
              onClick={onRefreshData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition cursor-pointer"
              title="Actualiser les données"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-purple-800/40">
          <div className="bg-slate-900/80 border border-purple-900/60 rounded-xl p-2.5">
            <span className="text-[10px] text-purple-300 font-semibold block uppercase tracking-wider">Total Inscrits</span>
            <span className="text-xl font-black text-white">{users.length}</span>
          </div>

          <div className="bg-slate-900/80 border border-purple-900/60 rounded-xl p-2.5">
            <span className="text-[10px] text-rose-300 font-semibold block uppercase tracking-wider flex items-center gap-1">
              <span>🔴 Inscrits Google</span>
            </span>
            <span className="text-xl font-black text-rose-300">{googleUsersCount}</span>
          </div>

          <div className="bg-slate-900/80 border border-purple-900/60 rounded-xl p-2.5">
            <span className="text-[10px] text-sky-300 font-semibold block uppercase tracking-wider flex items-center gap-1">
              <span>🔵 Inscrits Email</span>
            </span>
            <span className="text-xl font-black text-sky-300">{emailUsersCount}</span>
          </div>

          <div className="bg-slate-900/80 border border-purple-900/60 rounded-xl p-2.5">
            <span className="text-[10px] text-emerald-300 font-semibold block uppercase tracking-wider">Coursiers Actifs</span>
            <span className="text-xl font-black text-emerald-400">{coursiersCount}</span>
          </div>

          <div className="bg-slate-900/80 border border-purple-900/60 rounded-xl p-2.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-amber-300 font-semibold block uppercase tracking-wider">Total Courses</span>
            <span className="text-xl font-black text-amber-300">{courses.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Inscrits & Courriels ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sheets'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Liaison Google Sheets</span>
        </button>

        <button
          onClick={() => setActiveTab('push')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'push'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Push & Supabase Config</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'courses'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Gestion Courses ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'code'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Code Source Complet (.ZIP)</span>
        </button>
      </div>

      {/* TAB 1: USERS & COURRIELS */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {/* Quick Actions & Export bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">{filteredUsers.length}</span> résultat(s) affiché(s)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAllEmails}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 text-xs font-bold transition cursor-pointer"
                title="Copier tous les courriels pour envoyer un email de groupe"
              >
                {copiedEmails ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmails ? 'Courriels copiés !' : 'Copier tous les courriels'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger CSV</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, courriel, tél…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Canal Filter (Request #10) */}
            <select
              value={filterCanal}
              onChange={(e) => setFilterCanal(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">Tous les canaux (Google & Email)</option>
              <option value="google">Inscrits via Google OAuth</option>
              <option value="email">Inscrits via Email direct</option>
            </select>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">Tous les rôles (Coursiers & Clients)</option>
              <option value="coursier">Coursiers uniquement</option>
              <option value="apporteur">Clients (Apporteurs) uniquement</option>
            </select>
          </div>

          {/* User List Cards */}
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                Aucun utilisateur ne correspond à vos filtres.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isGoogle = u.canal === 'google';
                return (
                  <div
                    key={u.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 transition space-y-2.5 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        {/* Name & Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <b className="text-sm font-bold text-white">
                            {u.full_name || `${u.prenom || ''} ${u.nom || ''}`.trim() || 'Utilisateur'}
                          </b>

                          {/* Role badge */}
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            u.role === 'coursier'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}>
                            {u.role === 'coursier' ? '🛵 Coursier' : '📦 Client'}
                          </span>

                          {/* Canal badge (Request #10) */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isGoogle
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          }`}>
                            {isGoogle ? '🔴 Google OAuth' : '🔵 Email direct'}
                          </span>

                          {/* Owner badge if owner email */}
                          {u.email === 'falldiagne28@gmail.com' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                              <Crown className="w-3 h-3" /> Propriétaire
                            </span>
                          )}
                        </div>

                        {/* Courriel (Email) prominent display (Request #10) */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1.5">
                          <div className="flex items-center gap-1 text-slate-300 font-medium bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                            <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="font-mono text-white select-all">{u.email}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(u.email);
                              }}
                              title="Copier le courriel"
                              className="text-slate-400 hover:text-white ml-1 p-0.5"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Phone / WhatsApp */}
                          {u.telephone && (
                            <a
                              href={`https://wa.me/${u.telephone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800 transition"
                              title="Contacter sur WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{u.telephone}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Right Action: Verification toggle button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onToggleUserVerification(u.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            u.verifie
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {u.verifie ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Compte Vérifié</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span>En attente de validation</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Footer Details */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                      <span>Date : {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{u.nombre_courses || 0} course(s) · {u.ville || 'Casablanca'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIAISON GOOGLE SHEETS */}
      {activeTab === 'sheets' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Exporter et Synchroniser avec Google Sheets (Request #10)</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Vous pouvez exporter la liste complète de vos inscrits vers vos feuilles Google Sheets de deux manières ultra-simples :
            </p>

            {/* Quick Export buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <b className="text-white text-xs block">Méthode 1 : Copier-Coller instantané (Ctrl+V)</b>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Cliquez sur le bouton ci-dessous, ouvrez une feuille Google Sheet vierge, et faites simplement <b>Ctrl+V</b> (ou <b>Cmd+V</b>). Toutes les colonnes se remplissent instantanément.
                </p>
                <button
                  onClick={handleCopyForGoogleSheet}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow"
                >
                  {copiedTsv ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedTsv ? '✓ Tableau copié dans le presse-papier !' : 'Copier pour Google Sheets'}</span>
                </button>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <b className="text-white text-xs block">Méthode 2 : Fichier CSV pour Google Drive / Excel</b>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Téléchargez le fichier CSV encodé en UTF-8 avec séparateurs. Vous pouvez l'importer directement dans Google Sheets (Fichier &gt; Importer) ou dans Microsoft Excel.
                </p>
                <button
                  onClick={handleExportCSV}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le fichier CSV</span>
                </button>
              </div>
            </div>

            {/* Method 3: Automated Webhook */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Méthode 3 : Synchronisation Automatique en direct (Google Apps Script Webhook)</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Connectez votre Google Sheet à l'application. Chaque fois qu'un coursier ou client s'inscrit, il sera ajouté automatiquement sur une nouvelle ligne dans votre Google Sheet !
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleTriggerWebhook}
                  disabled={isSendingWebhook}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingWebhook ? 'Envoi…' : 'Envoyer maintenant'}</span>
                </button>
              </div>

              {webhookStatus && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                  webhookStatus.includes('✓') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {webhookStatus}
                </div>
              )}

              {/* Code snippet for Google Apps Script */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-purple-400" />
                    Code à coller dans Extensions &gt; Apps Script :
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(appsScriptSnippet);
                      setCopiedAppsScript(true);
                      setTimeout(() => setCopiedAppsScript(false), 2500);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    {copiedAppsScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAppsScript ? 'Copié !' : 'Copier le script'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[10px] overflow-x-auto select-all max-h-40">
                  {appsScriptSnippet}
                </pre>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>1. Dans Google Sheets, allez dans <b>Extensions &gt; Apps Script</b>.</p>
                  <p>2. Effacez le code existant, collez le script ci-dessus et cliquez sur <b>Enregistrer</b> (💾).</p>
                  <p>3. Cliquez sur <b>Déployer &gt; Nouveau déploiement</b>, choisissez <b>Application Web</b>, avec accès réglé sur <b>« Tout le monde »</b>.</p>
                  <p>4. Copiez l'URL obtenue et collez-la dans le champ Webhook ci-dessus !</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUSH NOTIFICATIONS & SUPABASE CONFIGURATION GUIDE (Request #9) */}
      {activeTab === 'push' && (
        <div className="space-y-4">
          {/* Live Push Tester Section */}
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Bell className="w-5 h-5" />
              <span>Testeur de Notification Push en Direct sur votre appareil</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Testez immédiatement si les notifications push fonctionnent sur votre téléphone ou navigateur. En cliquant sur le bouton ci-dessous, votre appareil demandera l'autorisation et émettra une notification de démonstration d'une nouvelle course à Casablanca :
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleTestPushNotification}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>Tester la Notification Push maintenant</span>
              </button>

              <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Statut Permission :{' '}
                <span className={pushPermission === 'granted' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {pushPermission === 'granted' ? '✓ Accordée' : pushPermission === 'denied' ? '✗ Refusée' : 'En attente'}
                </span>
              </div>
            </div>

            {pushTestStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                pushTestStatus.includes('✓') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {pushTestStatus}
              </div>
            )}
          </div>

          {/* Complete Step-by-Step Supabase Push Configuration Guide */}
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Guide de Configuration des Notifications Push avec Supabase (Request #9)</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pour que chaque coursier reçoive une notification push dès qu'un client dépose une course (même quand l'application est fermée ou en arrière-plan), voici l'architecture recommandée avec Supabase :
            </p>

            {/* Architecture Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 block uppercase">Étape 1 : Le Client</span>
                <p className="text-slate-300">Le client publie une course dans la table <code>courses</code> avec <code>statut = 'en_attente'</code>.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-purple-400 block uppercase">Étape 2 : Supabase Trigger</span>
                <p className="text-slate-300">Un Database Webhook déclenche une Supabase Edge Function instantanément.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">Étape 3 : Le Coursier</span>
                <p className="text-slate-300">L'Edge Function envoie le push WebPush / VAPID sur l'écran du téléphone du coursier.</p>
              </div>
            </div>

            {/* Step 1: SQL Script */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <b className="text-white text-xs flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  1. Script SQL à exécuter dans Supabase &gt; SQL Editor :
                </b>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlCodeSnippet);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'SQL Copié !' : 'Copier le SQL'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[10px] overflow-x-auto select-all max-h-56">
                {sqlCodeSnippet}
              </pre>
            </div>

            {/* Step 2: Supabase Edge Function Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <b className="text-white text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  2. Code de l'Edge Function Supabase (<code>send-course-push</code>) :
                </b>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(edgeFunctionSnippet);
                    setCopiedEdgeFn(true);
                    setTimeout(() => setCopiedEdgeFn(false), 2500);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  {copiedEdgeFn ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEdgeFn ? 'Code Copié !' : 'Copier la fonction'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 text-amber-200 font-mono text-[10px] overflow-x-auto select-all max-h-56">
                {edgeFunctionSnippet}
              </pre>
            </div>

            {/* Option Express: OneSignal Integration */}
            <div className="bg-indigo-950/30 border border-indigo-500/40 p-3.5 rounded-xl text-xs space-y-1.5 text-slate-200">
              <b className="text-indigo-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                Alternative 2 minutes : Utiliser OneSignal avec Supabase
              </b>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Si vous ne souhaitez pas gérer les clés VAPID et serveurs Deno, vous pouvez créer un compte gratuit sur <b>OneSignal</b>. Dans Supabase, un simple Database Webhook envoie une requête HTTP POST vers l'API REST de OneSignal avec votre <code>ONESIGNAL_APP_ID</code> et <code>REST_API_KEY</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COURSES SUPERVISION WITHOUT SUPABASE */}
      {activeTab === 'courses' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <span className="text-xs font-bold text-white">
              Supervision des Courses en Direct ({courses.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Gérez toutes les courses directement sans ouvrir Supabase
            </span>
          </div>

          <div className="space-y-2">
            {courses.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                Aucune course enregistrée pour le moment.
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 space-y-2 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate max-w-[200px]">
                          {course.depart_adresse} → {course.arrivee_adresse}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          course.statut === 'livree'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : course.statut === 'en_cours'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : course.statut === 'en_attente'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {course.statut}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400 mt-1">
                        <span>Client : <b className="text-white">{course.apporteur_nom || 'Client'}</b></span>
                        {course.coursier_nom && (
                          <span>Coursier : <b className="text-emerald-400">{course.coursier_nom}</b></span>
                        )}
                        <span>{course.distance_km} km</span>
                        <span className="font-bold text-emerald-400">{course.prix_total} DH (Com: {course.commission_plateforme} DH)</span>
                      </div>

                      {course.description_detail && (
                        <p className="text-[11px] text-slate-300 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800 mt-1.5">
                          📝 {course.description_detail}
                        </p>
                      )}
                    </div>

                    {/* Quick Status Action for the Owner */}
                    {onUpdateCourseStatus && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {course.statut !== 'livree' && (
                          <button
                            onClick={() => onUpdateCourseStatus(course.id, 'livree')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
                          >
                            Valider Livrée
                          </button>
                        )}
                        {course.statut !== 'annulee' && (
                          <button
                            onClick={() => onUpdateCourseStatus(course.id, 'annulee')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>Créée le {new Date(course.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Paiement : {course.mode_paiement === 'especes' ? 'Espèces' : 'Carte'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CODE SOURCE COMPLET DE L'APPLICATION */}
      {activeTab === 'code' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Card Téléchargement Direct */}
          <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/60 border border-indigo-500/40 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  Code Source Intégral & Prêt à Déployer
                </span>
                <h3 className="text-base font-black text-white">
                  Télécharger le Code Complet de l'Application CourSEN
                </h3>
                <p className="text-xs text-slate-300">
                  Vous pouvez télécharger l'intégralité du projet en archive ZIP prête à l'emploi (avec tous les composants, styles, données de Casablanca et configurations) ou en fichier texte unique.
                </p>
              </div>
            </div>

            {/* Téléchargement Boutons Principaux */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href="/coursen-casablanca-source.zip"
                download="coursen-casablanca-source.zip"
                className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-extrabold leading-tight">Télécharger l'Archive (.ZIP)</div>
                  <div className="text-[10px] font-semibold opacity-80">Projet complet prêt (57 Ko)</div>
                </div>
              </a>

              <a
                href="/coursen_code_complet.txt"
                download="coursen_code_complet.txt"
                className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                <Code className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-extrabold leading-tight">Télécharger en 1 Fichier (.TXT)</div>
                  <div className="text-[10px] font-semibold text-indigo-200">Tout le code assemblé (204 Ko)</div>
                </div>
              </a>
            </div>

            <div className="flex items-center justify-between text-xs text-indigo-200 bg-indigo-950/40 border border-indigo-800/40 rounded-xl px-3.5 py-2.5">
              <span>💡 Également exportable directement via le menu <b>Settings ⚙️ &gt; Export to ZIP / GitHub</b> d'AI Studio</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/coursen-casablanca-source.zip');
                  setCopiedCodeNotice(true);
                  setTimeout(() => setCopiedCodeNotice(false), 2500);
                }}
                className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCodeNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeNotice ? 'Lien copié !' : 'Copier lien ZIP'}</span>
              </button>
            </div>
          </div>

          {/* Guide d'Exécution Locale */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Comment lancer l'application sur votre machine (en 3 étapes)
            </h4>

            <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 text-xs font-mono text-emerald-300 space-y-2">
              <p className="text-slate-400 text-[11px] font-sans"># 1. Décompresser l'archive téléchargée :</p>
              <div className="bg-slate-900 p-2 rounded-lg text-slate-200">unzip coursen-casablanca-source.zip && cd coursen-casablanca</div>

              <p className="text-slate-400 text-[11px] font-sans pt-1"># 2. Installer les dépendances Node.js :</p>
              <div className="bg-slate-900 p-2 rounded-lg text-slate-200">npm install</div>

              <p className="text-slate-400 text-[11px] font-sans pt-1"># 3. Lancer le serveur de développement local :</p>
              <div className="bg-slate-900 p-2 rounded-lg text-emerald-400 font-bold">npm run dev</div>
            </div>

            <p className="text-xs text-slate-400">
              L'application s'ouvrira immédiatement sur <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded font-mono">http://localhost:3000</code> avec tous les modules actifs.
            </p>
          </div>

          {/* Inventaire des fichiers inclus dans l'archive */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" />
              Arborescence & Fichiers Inclus dans l'Archive
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="font-mono text-emerald-400 font-bold">/src/App.tsx</div>
                <div className="text-[11px] text-slate-400">Composant racine, synchronisation temps réel, GPS & sécurité propriétaire</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="font-mono text-purple-400 font-bold">/src/components/AdminView.tsx</div>
                <div className="text-[11px] text-slate-400">Espace Propriétaire, emails, export Google Sheets & notifications</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="font-mono text-sky-400 font-bold">/src/components/CoursierView.tsx</div>
                <div className="text-[11px] text-slate-400">Écran coursiers, détection de proximité à Casablanca & cession 15%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="font-mono text-amber-400 font-bold">/src/components/ApporteurView.tsx</div>
                <div className="text-[11px] text-slate-400">Publication de colis, calcul des tarifs au KM & étages</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="font-mono text-emerald-400 font-bold">/src/data/casablanca.ts</div>
                <div className="text-[11px] text-slate-400">Base de données des 20 quartiers de Casablanca avec coordonnées GPS</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="font-mono text-rose-400 font-bold">/src/lib/supabase.ts</div>
                <div className="text-[11px] text-slate-400">Connecteur Supabase + système de persistance locale de secours</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
