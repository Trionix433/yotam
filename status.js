/* =========================================================
   Ougot — Ouvert / Fermé (fermeture temporaire du site)
   ---------------------------------------------------------
   POUR FERMER LE SITE  : mets  open: false
   POUR ROUVRIR LE SITE : remets open: true

   (Optionnel) Réouverture automatique : mets une date/heure
   dans reopenAt, ex "2026-07-23 18:00". Passé cette heure, le
   site se rouvre tout seul. Laisse "" si tu rouvres à la main.
   ========================================================= */
window.OUGOT_STATUS = {
  open: true,
  reopenAt: "",
  message: "Nous sommes momentanément fermés. Les commandes rouvrent très vite — merci de votre patience !"
};

/* ---- Ne pas toucher en dessous ---- */
(function () {
  "use strict";
  var st = window.OUGOT_STATUS || { open: true };

  var closed = st.open === false;
  if (closed && st.reopenAt) {
    var t = new Date(String(st.reopenAt).replace(" ", "T"));
    if (!isNaN(t.getTime()) && Date.now() >= t.getTime()) closed = false;
  }
  if (!closed) return;

  function apply() {
    if (!document.body || document.getElementById("ougot-closed-banner")) return;

    var el = document.createElement("div");
    el.id = "ougot-closed-banner";
    el.setAttribute("style",
      "position:sticky;top:0;left:0;right:0;z-index:99999;background:#8a3b2e;color:#fff;" +
      "text-align:center;padding:12px 18px;font-family:'Jost',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
      "font-size:.95rem;line-height:1.45;box-shadow:0 2px 10px rgba(0,0,0,.15);");
    el.innerHTML = "🔴 <strong>Commandes temporairement fermées.</strong> " +
      (st.message ? "<span style='opacity:.9'>" + st.message + "</span>" : "");
    document.body.insertBefore(el, document.body.firstChild);

    var sel = ".cake-order, .cake-pay, a.btn-pay, #btn-online, #btn-onsite, .send," +
              " a[href^='devis.html'], a[href^='commande.html'], .add-to-cart";
    document.querySelectorAll(sel).forEach(function (b) {
      b.style.pointerEvents = "none";
      b.style.opacity = ".45";
      b.setAttribute("aria-disabled", "true");
      if (b.tagName === "BUTTON") b.disabled = true;
      if (b.tagName === "A") b.removeAttribute("href");
    });
  }

  if (document.body) apply();
  else document.addEventListener("DOMContentLoaded", apply);
})();
