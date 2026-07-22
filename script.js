/* =========================================================
   Ougot — interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---- Année du footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Menu mobile ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });

    // Referme le menu après un clic sur un lien
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
      });
    });
  }

  /* ---- Header : ombre au scroll ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Révélation au scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Lien de navigation actif selon la section visible ---- */
  var sections = [];
  document.querySelectorAll(".primary-nav a[href^='#']").forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section) sections.push({ link: link, section: section });
  });

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            sections.forEach(function (s) { s.link.classList.remove("is-active"); });
            var match = sections.find(function (s) { return s.section === entry.target; });
            if (match) match.link.classList.add("is-active");
          }
        });
      },
      { threshold: 0.5, rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s.section); });
  }

  /* ---- FAQ : une seule réponse ouverte à la fois ---- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();

/* =========================================================
   Gâteaux : sélection (taille + pareve/halavi) -> page de commande
   ========================================================= */
(function () {
  "use strict";

  // Met à jour le prix affiché selon la taille choisie
  function updatePrice(card) {
    var size = card.querySelector(".opt-size .opt.is-active");
    var priceEl = card.querySelector(".price");
    if (size && priceEl) priceEl.textContent = size.dataset.price + " €";
  }

  // Rappel du délai de 6 jours sur chaque carte gâteau
  document.querySelectorAll(".cake .cake-actions").forEach(function (actions) {
    var p = document.createElement("p");
    p.className = "cake-delay";
    p.innerHTML = "🗓️ À commander au moins <strong>6 jours</strong> à l'avance";
    actions.parentNode.insertBefore(p, actions);
  });

  // Boutons d'option (taille / pareve-halavi)
  document.querySelectorAll(".cake .opt-group").forEach(function (group) {
    group.querySelectorAll(".opt").forEach(function (opt) {
      opt.addEventListener("click", function () {
        group.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("is-active"); });
        opt.classList.add("is-active");
        updatePrice(group.closest(".cake"));
      });
    });
  });

  // Bouton « Commander » -> page de commande avec la sélection
  document.querySelectorAll(".cake .cake-order").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".cake");
      if (!card) return;
      var name = (card.querySelector("h3") || {}).textContent.trim();
      var size = card.querySelector(".opt-size .opt.is-active");
      var kind = card.querySelector(".opt-kind .opt.is-active");
      var params = new URLSearchParams({
        produit: name,
        taille: size ? (size.dataset.serves || "") : "",
        prix: size ? (size.dataset.price || "") : "",
        kind: kind ? (kind.dataset.kind || "") : "",
        pay: size ? (size.dataset.pay || "") : ""
      });
      window.location.href = "commande.html?" + params.toString();
    });
  });
})();

/* =========================================================
   Devis rapide (pied de page) → e-mail à Ougot
   ========================================================= */
(function () {
  "use strict";
  var DEVIS_ENDPOINT = "https://formsubmit.co/ajax/ougot27@gmail.com";
  var form = document.getElementById("devis-form");
  if (!form) return;
  var input = form.querySelector('input[type="email"]');
  var phoneEl = document.getElementById("ff-phone");
  var eventEl = document.getElementById("ff-event");
  var dateEl = document.getElementById("ff-date");
  var messageEl = document.getElementById("ff-message");
  var btn = form.querySelector('button[type="submit"]');
  var msg = document.getElementById("devis-msg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = (input.value || "").trim();
    if (!email) return;
    var original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Envoi…";

    var payload = {
      email: email,
      _subject: "📩 Demande de devis — Ougot",
      _template: "table",
      _captcha: "false",
      "Type de demande": "Devis / être recontacté",
      "E-mail du client": email,
      "Téléphone": (phoneEl && phoneEl.value.trim()) || "—",
      "Type d'événement": (eventEl && eventEl.value.trim()) || "—",
      "Date souhaitée": (dateEl && dateEl.value.trim()) || "—",
      "Message": (messageEl && messageEl.value.trim()) || "—"
    };

    function finish(ok) {
      btn.disabled = false;
      btn.textContent = original;
      if (msg) {
        msg.hidden = false;
        msg.textContent = ok
          ? "✓ Merci ! Votre demande est envoyée, on vous recontacte très vite."
          : "Un souci d'envoi. Réessayez, ou écrivez-nous au 07 69 65 29 49.";
        msg.style.color = ok ? "var(--cream-soft)" : "#f0b8b0";
      }
      if (ok) {
        input.value = "";
        if (phoneEl) phoneEl.value = "";
        if (eventEl) eventEl.value = "";
        if (dateEl) dateEl.value = "";
        if (messageEl) messageEl.value = "";
      }
    }

    if (window.fetch) {
      fetch(DEVIS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function () { finish(true); })
        .catch(function () { finish(false); });
    } else {
      finish(false);
    }
  });
})();
