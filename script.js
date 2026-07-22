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
   Boutique : panier (sélection) -> paiement Stripe par article
   ========================================================= */
(function () {
  "use strict";

  var cart = [];
  try {
    var saved = localStorage.getItem("ougot_cart");
    if (saved) cart = JSON.parse(saved) || [];
  } catch (e) { cart = []; }
  // Nettoyage d'anciens paniers (ancien format avec quantités)
  cart = cart.filter(function (it) { return it && it.name; });

  var overlay = document.getElementById("cart-overlay");
  var drawer  = document.getElementById("cart-drawer");
  var openBtn = document.getElementById("cart-btn");
  var closeBtn= document.getElementById("cart-close");
  var countEl = document.getElementById("cart-count");
  var itemsEl = document.getElementById("cart-items");
  var emptyEl = document.getElementById("cart-empty");
  var payNote = document.getElementById("cart-pay-note");

  if (!drawer) return;

  function save() { try { localStorage.setItem("ougot_cart", JSON.stringify(cart)); } catch (e) {} }
  function euros(n) { return n.toLocaleString("fr-FR") + " €"; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // Clé unique d'un article (nom + taille + pareve/halavi)
  cart.forEach(function (it) { if (!it.key) it.key = it.name + "|" + (it.serves || ""); });

  function inCart(key) {
    for (var i = 0; i < cart.length; i++) if (cart[i].key === key) return true;
    return false;
  }
  function addToCart(item) {
    if (!inCart(item.key)) cart.push(item);
    save(); render();
  }
  function removeItem(key) {
    cart = cart.filter(function (i) { return i.key !== key; });
    save(); render();
  }

  function render() {
    var c = cart.length;
    if (c > 0) { countEl.hidden = false; countEl.textContent = c; }
    else { countEl.hidden = true; }

    itemsEl.innerHTML = "";
    if (c === 0) {
      emptyEl.hidden = false;
      if (payNote) payNote.hidden = true;
      return;
    }
    emptyEl.hidden = true;
    if (payNote) payNote.hidden = false;

    cart.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "cart-item";
      var action = it.pay
        ? '<a class="btn btn-pay btn-sm ci-pay" href="' + esc(it.pay) + '" target="_blank" rel="noopener">Payer 💳</a>'
        : '<span class="ci-devis">Sur devis</span>';
      li.innerHTML =
        '<h4>' + esc(it.name) + '</h4>' +
        '<span class="ci-price">' + euros(it.price) + '</span>' +
        (it.serves ? '<span class="ci-serves">' + esc(it.serves) + '</span>' : '<span></span>') +
        action +
        '<button type="button" class="ci-remove">Retirer</button>';
      li.querySelector(".ci-remove").addEventListener("click", function () { removeItem(it.key); });
      itemsEl.appendChild(li);
    });
  }

  function openDrawer() {
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add("is-open"); });
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    overlay.classList.remove("is-open");
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(function () { overlay.hidden = true; }, 320);
  }

  // Lecture de la sélection (taille + pareve/halavi) d'une carte gâteau
  function readCake(card) {
    var name = (card.querySelector("h3") || {}).textContent || "";
    name = name.trim();
    var size = card.querySelector(".opt-size .opt.is-active");
    var kind = card.querySelector(".opt-kind .opt.is-active");
    var serves = size ? size.dataset.serves : "";
    var price = size ? parseFloat(size.dataset.price) : 0;
    var pay = size ? (size.dataset.pay || "") : "";
    var k = kind ? kind.dataset.kind : "";
    var serveLabel = (serves ? serves : "") + (k ? " · " + k : "");
    return {
      name: name,
      price: price,
      serves: serveLabel,
      pay: pay,
      key: name + "|" + serves + "|" + k
    };
  }

  // Met à jour le prix affiché + le bouton « Payer » selon la taille choisie
  function updateCard(card) {
    var size = card.querySelector(".opt-size .opt.is-active");
    var priceEl = card.querySelector(".price");
    var payBtn = card.querySelector(".cake-pay");
    if (size && priceEl) priceEl.textContent = size.dataset.price + " €";
    if (size && payBtn) {
      var pay = size.dataset.pay || "";
      if (pay) {
        payBtn.setAttribute("href", pay);
        payBtn.setAttribute("target", "_blank");
        payBtn.setAttribute("rel", "noopener");
        payBtn.textContent = "Payer en ligne 💳";
        payBtn.classList.remove("is-devis");
      } else {
        payBtn.setAttribute("href", "#contact");
        payBtn.removeAttribute("target");
        payBtn.removeAttribute("rel");
        payBtn.textContent = "Réserver — sur devis 💬";
        payBtn.classList.add("is-devis");
      }
    }
  }

  // Boutons d'option (taille / pareve-halavi)
  document.querySelectorAll(".cake .opt-group").forEach(function (group) {
    group.querySelectorAll(".opt").forEach(function (opt) {
      opt.addEventListener("click", function () {
        group.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("is-active"); });
        opt.classList.add("is-active");
        updateCard(group.closest(".cake"));
      });
    });
  });

  document.querySelectorAll(".add-to-cart").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".cake");
      var item = card
        ? readCake(card)
        : {
            name: btn.dataset.name,
            price: parseFloat(btn.dataset.price),
            serves: btn.dataset.serves || "",
            pay: btn.dataset.pay || "",
            key: btn.dataset.name + "|" + (btn.dataset.serves || "")
          };
      addToCart(item);
      var label = btn.textContent;
      btn.textContent = "✓ Ajouté";
      btn.classList.add("added");
      setTimeout(function () { btn.textContent = label; btn.classList.remove("added"); }, 1100);
      openDrawer();
    });
  });

  openBtn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer(); });

  render();
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
