/* ==========================================================================
   КАДР — фотостудия. Логика.
   ========================================================================== */
(() => {
  "use strict";
  const B = window.BRAND, S = window.SERVICES, W = window.WORKS, IMG = window.IMG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = (n) => Math.round(n).toLocaleString("ru-RU");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const srcset = (id, ws = [500, 900, 1400]) => ws.map((w) => `${IMG(id, w)} ${w}w`).join(", ");
  const genreName = (id) => (S.find((s) => s.id === id) || {}).title || id;

  /* Бренд */
  function brand() {
    $$("[data-brand]").forEach((el) => { const v = B[el.dataset.brand]; if (v != null) el.textContent = v; });
    const hrefs = {
      tel: "tel:" + B.phone.replace(/[^\d+]/g, ""),
      wa: "https://wa.me/" + B.whatsapp,
      mail: "mailto:" + B.email,
      ig: "https://instagram.com/" + B.instagram,
      tg: "https://t.me/" + B.telegram,
      map: "https://2gis.kz/almaty/search/" + encodeURIComponent(B.mapQuery),
    };
    $$("[data-brand-href]").forEach((el) => (el.href = hrefs[el.dataset.brandHref]));
    document.title = `${B.name} — ${B.tagline}`;
  }

  /* Hero + лента */
  function hero() {
    const img = $("#heroImg"), id = W[0][0];
    img.sizes = "(max-width:1000px) 90vw, 46vw";
    img.srcset = srcset(id, [600, 1000, 1400]);
    img.src = IMG(id, 1000);
    $("#heroExif").textContent = W[0][3];
    const ids = W.map((w) => w[0]);
    const row = ids.map((x) => `<img loading="lazy" src="${IMG(x, 400, 60)}" alt="">`).join("");
    $("#strip").innerHTML = row + row;
  }

  /* Шапка */
  function header() {
    const hdr = $("#hdr");
    const upd = () => hdr.classList.toggle("solid", window.scrollY > 40);
    upd(); window.addEventListener("scroll", upd, { passive: true });
    const burger = $("#burger");
    const close = () => { document.body.classList.remove("menu-open", "locked"); burger.setAttribute("aria-expanded", "false"); };
    burger.addEventListener("click", () => {
      const open = !document.body.classList.contains("menu-open");
      document.body.classList.toggle("menu-open", open);
      document.body.classList.toggle("locked", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    $$("#nav a").forEach((a) => a.addEventListener("click", close));
  }

  /* Услуги */
  function services() {
    $("#svcGrid").innerHTML = S.map((s) => `
      <article class="svc reveal">
        <div class="svc-ph"><img loading="lazy" sizes="(max-width:820px) 100vw, 45vw" srcset="${srcset(s.cover)}" src="${IMG(s.cover, 900)}" alt="${esc(s.title)}"><span class="svc-no">${s.no}</span></div>
        <div class="svc-body">
          <h3>${esc(s.title)}</h3>
          <p class="svc-kicker">${esc(s.kicker)}</p>
          <p class="svc-lead">${esc(s.lead)}</p>
          <ul class="svc-list">${s.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
          <div class="svc-meta">
            <div><span class="t">Время · ${esc(s.time)}</span><div class="p">от ${money(s.from)} ₸</div></div>
            <button class="btn btn-mini" data-book="${s.id}">Записаться</button>
          </div>
        </div>
      </article>`).join("");
    $$("[data-book]").forEach((b) => b.addEventListener("click", () => { prefill([b.dataset.book]); $("#book").scrollIntoView({ behavior: "smooth" }); }));

    $("#quick").innerHTML = window.QUICK.map(([t, p, d]) =>
      `<div class="reveal"><b>${esc(t)}</b><span class="pr">${esc(p)}</span><small>${esc(d)}</small></div>`).join("");
  }

  /* Портфолио — контактный лист */
  let filter = "all";
  function works() {
    const counts = { all: W.length };
    S.forEach((s) => (counts[s.id] = W.filter((w) => w[2] === s.id).length));
    const chips = [["all", "Все"], ...S.filter((s) => counts[s.id]).map((s) => [s.id, s.title])];
    $("#filters").innerHTML = chips.map(([id, t]) => `<button class="chip" data-f="${id}">${esc(t)}<sup>${counts[id]}</sup></button>`).join("");
    $$("#filters .chip").forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.f)));

    $("#sheet").innerHTML = W.map((w, i) => `
      <figure class="shot reveal" data-i="${i}" data-g="${w[2]}">
        <div class="shot-ph"><img loading="lazy" sizes="(max-width:520px) 50vw, 25vw" srcset="${srcset(w[0])}" src="${IMG(w[0], 600)}" alt="${esc(w[1])}"></div>
        <span class="num">№${String(i + 1).padStart(4, "0")}</span>
        <figcaption class="shot-cap"><b>${esc(w[1])}</b><span>${esc(w[3])}</span></figcaption>
      </figure>`).join("");
    $$(".shot").forEach((el) => el.addEventListener("click", () => lbOpen(+el.dataset.i)));
    setFilter("all");
  }
  function setFilter(f) {
    filter = f;
    $$("#filters .chip").forEach((b) => b.classList.toggle("on", b.dataset.f === f));
    $$(".shot").forEach((el) => el.classList.toggle("hide", !(f === "all" || el.dataset.g === f)));
  }

  /* Залы */
  function halls() {
    $("#hallsGrid").innerHTML = window.HALLS.map((h) => `
      <article class="hall reveal">
        <div class="hall-ph"><img loading="lazy" sizes="(max-width:820px) 100vw, 30vw" srcset="${srcset(h.photo)}" src="${IMG(h.photo, 900)}" alt="${esc(h.name)}"></div>
        <div class="hall-body"><h3>${esc(h.name)}</h3><p class="note">${esc(h.note)}</p><p>${esc(h.desc)}</p></div>
      </article>`).join("");
  }

  /* Пакеты */
  function packages() {
    $("#pkgGrid").innerHTML = window.PACKAGES.map((p) => `
      <article class="pkg reveal${p.featured ? " feat" : ""}">
        ${p.featured ? '<span class="lbl">Популярный</span>' : '<span class="lbl">Пакет</span>'}
        <h3>${esc(p.name)}</h3>
        <div class="amt">${money(p.price)} <small>₸ / ${esc(p.unit)}</small></div>
        <span class="for">${esc(p.for)}</span>
        <ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        <button class="btn" data-pkg="${esc(p.name)}">Выбрать пакет</button>
      </article>`).join("");
    $$("[data-pkg]").forEach((b) => b.addEventListener("click", () => {
      const note = $("#form").elements.note;
      note.value = `Интересует пакет «${b.dataset.pkg}». ` + note.value.replace(/^Интересует пакет .*?\. ?/, "");
      $("#book").scrollIntoView({ behavior: "smooth" });
    }));
  }

  /* FAQ */
  function faq() {
    $("#faq").innerHTML = window.FAQ.map(([q, a]) =>
      `<div class="qa"><button aria-expanded="false">${esc(q)}<span class="pm"></span></button><div class="qa-a"><div><p>${esc(a)}</p></div></div></div>`).join("");
    $$(".qa button").forEach((b) => b.addEventListener("click", () => {
      const qa = b.parentElement, open = !qa.classList.contains("open");
      qa.classList.toggle("open", open); b.setAttribute("aria-expanded", String(open));
    }));
  }

  /* Лайтбокс */
  const lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  let visible = [], pos = 0;
  function lbOpen(i) {
    visible = W.map((w, k) => k).filter((k) => filter === "all" || W[k][2] === filter);
    pos = visible.indexOf(i); if (pos < 0) pos = 0;
    lbShow(); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.classList.add("locked");
  }
  function lbShow() {
    const w = W[visible[pos]];
    lbImg.src = IMG(w[0], 1600, 85); lbImg.alt = w[1];
    lbCap.textContent = `№${String(visible[pos] + 1).padStart(4, "0")} · ${w[1]} · ${w[3]} · ${genreName(w[2])}`;
  }
  function lbClose() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.classList.remove("locked"); }
  const lbStep = (d) => { pos = (pos + d + visible.length) % visible.length; lbShow(); };
  $("#lbX").addEventListener("click", lbClose);
  $("#lbPrev").addEventListener("click", (e) => { e.stopPropagation(); lbStep(-1); });
  $("#lbNext").addEventListener("click", (e) => { e.stopPropagation(); lbStep(1); });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "FIGURE") lbClose(); });
  let tx = null;
  lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1); tx = null; });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") lbClose();
    if (e.key === "ArrowLeft") lbStep(-1);
    if (e.key === "ArrowRight") lbStep(1);
  });

  /* Форма */
  function form() {
    $("#formSvc").innerHTML = S.map((s) =>
      `<label class="check" data-id="${s.id}"><input type="checkbox"><span class="box"></span>${esc(s.title.split(" и ")[0].split(",")[0])}</label>`).join("");
    $$("#formSvc .check").forEach((l) => l.querySelector("input").addEventListener("change", (e) => l.classList.toggle("on", e.target.checked)));

    const f = $("#form"), phone = f.elements.phone;
    phone.addEventListener("input", () => {
      let d = phone.value.replace(/\D/g, "");
      if (d.startsWith("8")) d = "7" + d.slice(1);
      if (d && !d.startsWith("7")) d = "7" + d;
      d = d.slice(0, 11);
      const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
      phone.value = d ? "+7" + (p[0] ? " " + p[0] : "") + (p[1] ? " " + p[1] : "") + (p[2] ? " " + p[2] : "") + (p[3] ? " " + p[3] : "") : "";
    });
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = f.elements.name;
      const ok1 = name.value.trim().length > 1, ok2 = phone.value.replace(/\D/g, "").length === 11;
      name.closest(".field").classList.toggle("err", !ok1);
      phone.closest(".field").classList.toggle("err", !ok2);
      if (!ok1 || !ok2) return (ok1 ? phone : name).focus();
      const chosen = $$("#formSvc .check.on").map((l) => genreName(l.dataset.id));
      const msg = [
        `Здравствуйте! Заявка с сайта ${B.name}.`,
        `Имя: ${name.value.trim()}`,
        `Телефон: ${phone.value}`,
        chosen.length && `Жанр: ${chosen.join(", ")}`,
        f.elements.date.value && `Дата: ${f.elements.date.value}`,
        f.elements.note.value.trim() && `Комментарий: ${f.elements.note.value.trim()}`,
      ].filter(Boolean).join("\n");
      $("#formWa").href = `https://wa.me/${B.whatsapp}?text=${encodeURIComponent(msg)}`;
      $("#formOk").hidden = false;
    });
  }
  function prefill(ids) {
    $$("#formSvc .check").forEach((l) => { const on = ids.includes(l.dataset.id); l.classList.toggle("on", on); l.querySelector("input").checked = on; });
    $("#formOk").hidden = true;
  }

  /* Reveal */
  function reveal() {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  }

  brand(); hero(); header(); services(); works(); halls(); packages(); faq(); form(); reveal();
})();
