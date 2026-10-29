// RideDeck — couche compte & cloud (partagée par toutes les pages)
(function () {
  'use strict';
  var cfg = window.RIDEDECK_CONFIG || {};
  var configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  var client = null;
  if (configured && window.supabase && window.supabase.createClient) {
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { storageKey: 'ridedeck-auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }
  function cachedUser() {
    try {
      var t = JSON.parse(localStorage.getItem('ridedeck-auth'));
      if (!t || !t.user) return null;
      return { id: t.user.id, email: t.user.email, name: (t.user.user_metadata || {}).name || '' };
    } catch (e) { return null; }
  }
  function url(p) { return new URL(p, location.href).href; }
  function frError(e) {
    var m = (e && (e.message || e.error_description)) || String(e || '');
    if (/invalid login credentials/i.test(m)) return 'Email ou mot de passe incorrect.';
    if (/email not confirmed/i.test(m)) return 'Confirme d’abord ton email : clique sur le lien reçu.';
    if (/already registered|already exists/i.test(m)) return 'Un compte existe déjà avec cet email. Connecte-toi.';
    if (/password should be at least|weak password|password is too/i.test(m)) return 'Mot de passe trop faible : 8 caractères minimum.';
    if (/rate limit|too many/i.test(m)) return 'Trop de tentatives. Réessaie dans quelques minutes.';
    if (/invalid email|unable to validate email/i.test(m)) return 'Adresse email invalide.';
    if (/failed to fetch|network|load failed/i.test(m)) return 'Connexion impossible. Vérifie ton accès internet.';
    if (/same.*password|different from the old/i.test(m)) return 'Choisis un mot de passe différent de l’ancien.';
    return m || 'Une erreur est survenue.';
  }
  window.RD = { configured: configured, client: client, cachedUser: cachedUser, url: url, frError: frError };
})();
