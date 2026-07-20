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
   Boutique : panier & commande
   ========================================================= */
(function () {
  "use strict";

  var ORDER_EMAIL = "contact@ougot.fr"; // ← e-mail qui reçoit les commandes (à personnaliser)

  var cart = [];
  try {
    var saved = localStorage.getItem("ougot_cart");
    if (saved) cart = JSON.parse(saved) || [];
  } catch (e) { cart = []; }

  var overlay   = document.getElementById("cart-overlay");
  var drawer    = document.getElementById("cart-drawer");
  var openBtn   = document.getElementById("cart-btn");
  var closeBtn  = document.getElementById("cart-close");
  var countEl   = document.getElementById("cart-count");
  var itemsEl   = document.getElementById("cart-items");
  var emptyEl   = document.getElementById("cart-empty");
  var totalRow  = document.getElementById("cart-total-row");
  var totalEl   = document.getElementById("cart-total");
  var checkoutBtn = document.getElementById("cart-checkout");

  var cartView    = document.getElementById("cart-view");
  var form        = document.getElementById("checkout-form");
  var backBtn     = document.getElementById("checkout-back");
  var addrField   = document.getElementById("addr-field");
  var summaryEl   = document.getElementById("checkout-summary");
  var doneView    = document.getElementById("checkout-done");
  var closeDone   = document.getElementById("checkout-close-done");

  if (!drawer) return; // page sans boutique

  function save() {
    try { localStorage.setItem("ougot_cart", JSON.stringify(cart)); } catch (e) {}
  }

  function euros(n) { return n.toLocaleString("fr-FR") + " €"; }

  function totalCount() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function totalPrice() { return cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0); }

  function findItem(name) {
    for (var i = 0; i < cart.length; i++) if (cart[i].name === name) return cart[i];
    return null;
  }

  function addToCart(name, price, serves) {
    var it = findItem(name);
    if (it) it.qty++;
    else cart.push({ name: name, price: price, serves: serves || "", qty: 1 });
    save(); render();
  }
  function changeQty(name, delta) {
    var it = findItem(name);
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) cart = cart.filter(function (i) { return i.name !== name; });
    save(); render();
  }
  function removeItem(name) {
    cart = cart.filter(function (i) { return i.name !== name; });
    save(); render();
  }

  function render() {
    // badge
    var c = totalCount();
    if (c > 0) { countEl.hidden = false; countEl.textContent = c; }
    else { countEl.hidden = true; }

    // items
    itemsEl.innerHTML = "";
    if (cart.length === 0) {
      emptyEl.hidden = false;
      totalRow.hidden = true;
      checkoutBtn.disabled = true;
    } else {
      emptyEl.hidden = true;
      totalRow.hidden = false;
      checkoutBtn.disabled = false;
      cart.forEach(function (it) {
        var li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML =
          '<h4>' + esc(it.name) + '</h4>' +
          '<span class="ci-price">' + euros(it.price * it.qty) + '</span>' +
          (it.serves ? '<span class="ci-serves">' + esc(it.serves) + '</span>' : '<span></span>') +
          '<div class="cart-qty">' +
            '<button type="button" aria-label="Retirer un">&minus;</button>' +
            '<span>' + it.qty + '</span>' +
            '<button type="button" aria-label="Ajouter un">+</button>' +
          '</div>' +
          '<button type="button" class="ci-remove">Retirer</button>';
        var btns = li.querySelectorAll(".cart-qty button");
        btns[0].addEventListener("click", function () { changeQty(it.name, -1); });
        btns[1].addEventListener("click", function () { changeQty(it.name, 1); });
        li.querySelector(".ci-remove").addEventListener("click", function () { removeItem(it.name); });
        itemsEl.appendChild(li);
      });
    }
    totalEl.textContent = euros(totalPrice());
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---- Drawer open/close ----
  function openDrawer() {
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add("is-open"); });
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    showView("cart");
  }
  function closeDrawer() {
    overlay.classList.remove("is-open");
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(function () { overlay.hidden = true; }, 320);
  }

  function showView(which) {
    cartView.hidden = which !== "cart";
    form.hidden = which !== "form";
    doneView.hidden = which !== "done";
  }

  // ---- Bind add-to-cart buttons ----
  document.querySelectorAll(".add-to-cart").forEach(function (btn) {
    btn.addEventListener("click", function () {
      addToCart(btn.dataset.name, parseFloat(btn.dataset.price), btn.dataset.serves);
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

  // ---- Checkout ----
  checkoutBtn.addEventListener("click", function () {
    if (cart.length === 0) return;
    renderSummary();
    showView("form");
  });
  backBtn.addEventListener("click", function () { showView("cart"); });

  form.querySelectorAll('input[name="mode"]').forEach(function (r) {
    r.addEventListener("change", function () {
      var livraison = form.querySelector('input[name="mode"]:checked').value === "Livraison";
      addrField.hidden = !livraison;
      addrField.querySelector("textarea").required = livraison;
    });
  });

  function renderSummary() {
    var html = "";
    cart.forEach(function (it) {
      html += '<div class="cs-line"><span>' + esc(it.name) + ' × ' + it.qty + '</span><span>' + euros(it.price * it.qty) + '</span></div>';
    });
    html += '<div class="cs-line cs-total"><span>Total</span><span>' + euros(totalPrice()) + '</span></div>';
    summaryEl.innerHTML = html;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var lines = [];
    lines.push("NOUVELLE COMMANDE — Ougot");
    lines.push("");
    lines.push("Client : " + data.get("nom"));
    lines.push("Téléphone : " + data.get("tel"));
    lines.push("E-mail : " + data.get("email"));
    lines.push("Réception : " + data.get("mode"));
    if (data.get("mode") === "Livraison") lines.push("Adresse : " + (data.get("adresse") || ""));
    lines.push("Date souhaitée : " + data.get("date"));
    if (data.get("message")) lines.push("Message : " + data.get("message"));
    lines.push("");
    lines.push("--- Commande ---");
    cart.forEach(function (it) {
      lines.push("• " + it.name + " × " + it.qty + " = " + euros(it.price * it.qty));
    });
    lines.push("");
    lines.push("TOTAL : " + euros(totalPrice()));
    lines.push("");
    lines.push("(Paiement à la récupération / livraison)");

    var subject = "Commande Ougot — " + data.get("nom");
    var body = lines.join("\n");
    var mailto = "mailto:" + ORDER_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    window.location.href = mailto;
    showView("done");
  });

  closeDone.addEventListener("click", function () {
    cart = []; save(); render();
    closeDrawer();
    showView("cart");
  });

  render();
})();
