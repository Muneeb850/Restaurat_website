/* Page-specific behaviour: home · menu · reserve · contact */
(function () {
  const MB = window.MB;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const hasGsap = !!window.gsap;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const HOURS = MB.HOURS;
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const pad = (n) => String(n).padStart(2, "0");
  const fmtH = (h) => `${pad(Math.floor(h))}:${pad(Math.round((h % 1) * 60))}`;

  // seals + "add to bag" buttons anywhere on the page
  $$("[data-seal]").forEach((el) => (el.outerHTML = MB.seal()));
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (!b) return;
    MB.addToCart(b.dataset.add, b);
    b.classList.add("is-added");
    const label = b.querySelector("span");
    if (label) { label.textContent = "Added"; setTimeout(() => { label.textContent = "Add"; b.classList.remove("is-added"); }, 1400); }
  });

  /* ---------------- HOME ---------------- */
  if (page === "home") {
    const picks = ["liege-classic", "brussels-berry", "speculoos", "chocolat-noir", "chicken-waffle", "banana-caramel"];
    const track = $("#sigTrack");
    track.innerHTML = picks.map((id, i) => {
      const m = MB.MENU.find((x) => x.id === id);
      return `<article class="sig-card ${i % 2 ? "" : "pattern"}" style="${i % 2 ? "background:var(--wine-deep)" : ""}">
        <div class="sig-card__media"><span class="sig-card__num">${pad(i + 1)} / ${pad(picks.length)}</span>${MB.photoFor(m)}</div>
        <div class="sig-card__body"><div><h3>${m.name}</h3><p>${m.desc}</p></div>
          <div style="display:grid;justify-items:end;gap:.6rem"><span class="price">${MB.money(m.price)}</span>
          <button class="add-btn" data-add="${m.id}" aria-label="Add ${m.name} to bag">+ <span>Add</span></button></div></div>
      </article>`;
    }).join("") + `<a href="menu.html" class="sig-card" style="display:grid;place-items:center;background:var(--cream);color:var(--wine);min-height:100%">
        <div style="text-align:center;padding:2rem"><h2 style="font-size:4rem"><em>Full</em><br>menu</h2><p class="muted" style="margin-top:1rem">16 dishes & drinks →</p></div></a>`;

    // photo strips: every dish, split across two rows (each row doubled so it never runs out)
    const tile = (m) => `<a class="strip__tile" href="menu.html?cat=${m.cat}"><img src="images/${m.id}.jpg" alt="${m.name}" loading="lazy"><span>${m.name}</span></a>`;
    const half = Math.ceil(MB.MENU.length / 2);
    const rowA = MB.MENU.slice(0, half), rowB = MB.MENU.slice(half);
    $("#stripA").innerHTML = [...rowA, ...rowA].map(tile).join("");
    $("#stripB").innerHTML = [...rowB, ...rowB].map(tile).join("");
  }

  /* ---------------- MENU ---------------- */
  if (page === "menu") {
    const grid = $("#menuGrid");
    const params = new URLSearchParams(location.search);
    let cat = params.get("cat") || "all", q = "";
    if (cat !== "all" && !MB.MENU.some((m) => m.cat === cat)) cat = "all";

    // every dish is built once; filtering only shows/hides cards, and Flip glides the survivors
    // into their new places while leavers shrink away and newcomers pop in
    grid.innerHTML = MB.MENU.map((m) => `
        <article class="dish" data-tilt data-id="${m.id}" data-flip-id="${m.id}">
          <div class="dish__media ${m.cat === "drinks" ? "" : "pattern"}" style="${m.cat === "drinks" ? "background:var(--wine-deep)" : ""}">
            ${m.badge ? `<span class="dish__tag">${m.badge}</span>` : ""}${MB.photoFor(m)}</div>
          <div class="dish__body">
            <div class="dish__top"><h3>${m.name}</h3><span class="price">${MB.money(m.price)}</span></div>
            <p>${m.desc}</p>
            <div class="dish__foot"><div class="diet">${m.diet.map((d) => `<span title="${{ V: "Vegetarian", VG: "Vegan", GF: "Gluten free" }[d]}">${d}</span>`).join("")}</div>
              <button class="add-btn" data-add="${m.id}" aria-label="Add ${m.name} to bag">+ <span>Add</span></button></div>
          </div>
        </article>`).join("") + `<div class="empty-state" hidden><h3><em></em></h3><p>Try another word or category.</p></div>`;
    const cards = $$(".dish", grid), empty = $(".empty-state", grid);
    const canFlip = hasGsap && !reduced && window.Flip;
    if (canFlip) gsap.registerPlugin(Flip);

    function draw(animate) {
      const show = new Set(MB.MENU.filter((m) => (cat === "all" || m.cat === cat) &&
        (!q || (m.name + " " + m.desc).toLowerCase().includes(q))).map((m) => m.id));
      const state = animate && canFlip ? Flip.getState(cards) : null;
      // hold the grid's height while cards are in flight, so the page below doesn't jump
      const before = grid.offsetHeight;
      if (state) grid.style.minHeight = before + "px";
      cards.forEach((c) => (c.hidden = !show.has(c.dataset.id)));
      empty.hidden = show.size > 0;
      $("em", empty).textContent = `No waffles match “${q}”`;
      $("#menuCount").textContent = `${show.size} ${show.size === 1 ? "item" : "items"}`;
      if (state) {
        Flip.from(state, { duration: 0.75, ease: "expo.inOut", stagger: 0.025, absolute: true, scale: true,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.7, rotate: -4 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: "back.out(1.6)", stagger: 0.04 }),
          onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.7, rotate: 4, duration: 0.45, ease: "power2.in" }),
          onComplete: () => {
            // then ease the grid to its new natural height
            grid.style.minHeight = "";
            const after = grid.offsetHeight;
            gsap.fromTo(grid, { height: before }, { height: after, duration: 0.5, ease: "power3.inOut", clearProps: "height",
              onComplete: () => window.ScrollTrigger && ScrollTrigger.refresh() });
          } });
        if (!empty.hidden) gsap.from(empty, { y: 30, opacity: 0, duration: 0.6, ease: "power3.out" });
      } else if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
    MB.bindInteractions(grid);

    $$(".chip[data-cat]").forEach((c) => c.classList.toggle("is-active", c.dataset.cat === cat));
    $("#filters").addEventListener("click", (e) => {
      const c = e.target.closest(".chip"); if (!c) return;
      cat = c.dataset.cat;
      $$(".chip").forEach((x) => x.classList.toggle("is-active", x === c));
      const u = new URL(location.href);
      cat === "all" ? u.searchParams.delete("cat") : u.searchParams.set("cat", cat);
      history.replaceState(null, "", u);
      draw(true);
    });
    let tmr;
    $("#menuSearch").addEventListener("input", (e) => {
      clearTimeout(tmr);
      tmr = setTimeout(() => { q = e.target.value.trim().toLowerCase(); draw(true); }, 180);
    });
    draw(false);
    // first reveal: each card rises in as it scrolls into view, its photo unveiling upward
    if (hasGsap && !reduced && window.ScrollTrigger) {
      ScrollTrigger.batch(cards.filter((c) => !c.hidden), { start: "top 90%", once: true, onEnter: (batch) => {
        gsap.from(batch, { y: 80, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08, clearProps: "opacity,transform" });
        gsap.from(batch.map((c) => $(".dish__media", c)), { clipPath: "inset(100% 0% 0% 0%)", duration: 1.2, ease: "expo.out", stagger: 0.08, clearProps: "clipPath" });
        gsap.from(batch.map((c) => $(".dish-photo", c)).filter(Boolean), { scale: 1.35, duration: 1.6, ease: "expo.out", stagger: 0.08, clearProps: "transform" });
      } });
    }
  }

  /* ---------------- RESERVE ---------------- */
  if (page === "reserve") {
    const form = $("#reserveForm");
    const dateIn = form.date, slotsEl = $("#slots"), timeIn = form.time;
    const today = new Date();
    const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const max = new Date(); max.setDate(max.getDate() + 60);
    dateIn.min = iso(today); dateIn.max = iso(max);
    // default: next open day
    const first = new Date(today);
    // skip closed days, and today once its last slot (close − 1.5h) is within the 30-min booking lead
    const nowH = today.getHours() + today.getMinutes() / 60;
    while (!HOURS[first.getDay()] || (iso(first) === iso(today) && nowH + 0.5 >= HOURS[first.getDay()][1] - 1.5)) first.setDate(first.getDate() + 1);
    dateIn.value = iso(first);

    let guests = 2, seating = "Indoor";

    // date strip: the next 30 days as tappable cards; closed days (and a fully past today) are disabled
    const strip = $("#dateStrip");
    const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = [];
    for (let k = 0; k < 30; k++) { const d = new Date(today); d.setDate(today.getDate() + k); days.push(d); }
    strip.innerHTML = days.map((d) => {
      const h = HOURS[d.getDay()], v = iso(d);
      const off = !h || (v === iso(today) && v !== iso(first));
      const label = v === iso(today) ? "Today" : DAYS[d.getDay()].slice(0, 3);
      return `<button type="button" class="day" role="option" data-date="${v}" ${off ? "disabled" : ""} aria-label="${d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}${off ? " (closed)" : ""}">
        <small>${label}</small><b>${d.getDate()}</b><small>${h ? MON[d.getMonth()] : "Closed"}</small></button>`;
    }).join("");
    function markDay(scroll) {
      $$(".day", strip).forEach((b) => { const on = b.dataset.date === dateIn.value; b.classList.toggle("is-active", on); b.setAttribute("aria-selected", on); });
      const cur = $(".day.is-active", strip);
      if (cur && scroll) strip.scrollTo({ left: cur.offsetLeft - strip.clientWidth / 2 + cur.offsetWidth / 2, behavior: "smooth" });
    }
    strip.addEventListener("click", (e) => {
      const b = e.target.closest(".day:not([disabled])"); if (!b) return;
      dateIn.value = b.dataset.date;
      const f = dateIn.closest(".field"); f.classList.remove("has-error"); $(".field__err", f).textContent = "";
      markDay(true); buildSlots(true);
    });

    function buildSlots(animate) {
      const d = dateIn.value ? new Date(dateIn.value + "T00:00") : null;
      timeIn.value = "";
      if (!d) { slotsEl.innerHTML = ""; return summary(); }
      const h = HOURS[d.getDay()];
      if (!h) { slotsEl.innerHTML = `<p class="muted" style="margin:0">We're closed on ${DAYS[d.getDay()]}s — please pick another day.</p>`; return summary(); }
      const isToday = iso(d) === iso(new Date()), nowH = new Date().getHours() + new Date().getMinutes() / 60;
      // group the half-hour slots into morning / afternoon / evening
      const groups = [["Morning", []], ["Afternoon", []], ["Evening", []]];
      for (let t = h[0]; t <= h[1] - 1.5; t += 0.5) {
        const past = isToday && t <= nowH + 0.5;
        groups[t < 12 ? 0 : t < 17 ? 1 : 2][1].push(`<button type="button" data-time="${fmtH(t)}" ${past ? "disabled" : ""}>${fmtH(t)}</button>`);
      }
      const html = groups.filter(([, b]) => b.length).map(([n, b]) => `<div class="slot-group"><span class="slot-group__label">${n}</span><div class="seg">${b.join("")}</div></div>`).join("");
      slotsEl.innerHTML = html || `<p class="muted" style="margin:0">No more tables today — try tomorrow.</p>`;
      if (animate && hasGsap && !reduced) gsap.from($$("button", slotsEl), { y: 14, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.012, clearProps: "all" });
      summary();
    }
    slotsEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-time]"); if (!b) return;
      $$("button", slotsEl).forEach((x) => x.classList.toggle("is-active", x === b));
      timeIn.value = b.dataset.time;
      const f = timeIn.closest(".field"); f.classList.remove("has-error"); $(".field__err", f).textContent = "";
      summary();
    });
    dateIn.addEventListener("change", () => { markDay(true); buildSlots(true); });

    const out = $("#guestOut");
    $("#stepper").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      guests = Math.min(12, Math.max(1, guests + (b.dataset.step === "+" ? 1 : -1)));
      out.textContent = guests;
      $("#bigParty").hidden = guests < 9;
      summary();
    });
    function setSeat(b) {
      seating = b.dataset.seat;
      $$("#seatSeg button").forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", x === b); });
    }
    $("#seatSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      setSeat(b);
      summary();
    });

    // ticket values flash when they change
    function put(sel, v) {
      const el = $(sel);
      if (el.textContent === v) return;
      el.textContent = v;
      el.classList.remove("is-flash"); void el.offsetWidth; el.classList.add("is-flash");
    }
    function summary() {
      const d = dateIn.value ? new Date(dateIn.value + "T00:00") : null;
      put("#sumDate", d ? d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : "—");
      put("#sumTime", timeIn.value || "—");
      put("#sumGuests", guests + (guests === 1 ? " guest" : " guests"));
      put("#sumSeat", seating);
    }

    function drawBookings() {
      const list = MB.store.get("mb-bookings", []).filter((b) => new Date(b.date + "T" + b.time) > new Date(Date.now() - 3 * 3600e3));
      const wrap = $("#bookings");
      wrap.innerHTML = list.length ? list.map((b) => `
        <div class="booking"><div><b>${new Date(b.date + "T00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${b.time}</b>
          <span class="muted">${b.guests} guests · ${b.seating} · ${b.ref}</span></div>
          <button data-cancel="${b.ref}">Cancel</button></div>`).join("")
        : `<p class="muted" style="margin:.6rem 0 0">No upcoming bookings yet.</p>`;
    }
    $("#bookings").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cancel]"); if (!b) return;
      if (!confirm("Cancel this reservation?")) return;
      MB.store.set("mb-bookings", MB.store.get("mb-bookings", []).filter((x) => x.ref !== b.dataset.cancel));
      drawBookings();
      MB.toast("Reservation cancelled");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!MB.validate(form)) return;
      const d = new Date(dateIn.value + "T00:00");
      if (!HOURS[d.getDay()]) { MB.toast("We're closed that day — please choose another."); return; }
      const ref = MB.ref("RB");
      const booking = { ref, date: dateIn.value, time: timeIn.value, guests, seating, name: form.name.value, email: form.email.value, phone: form.phone.value, notes: form.notes.value };
      const all = MB.store.get("mb-bookings", []);
      all.push(booking);
      all.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      MB.store.set("mb-bookings", all);
      MB.openModal(MB.successHTML("Table reserved", ref,
        `See you ${d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} at ${booking.time}, ${MB.escapeHTML(booking.name.split(" ")[0])}. A table for ${guests} (${seating.toLowerCase()}) is held for 15 minutes.`));
      MB.drawCheck();
      form.reset(); guests = 2; out.textContent = 2; $("#bigParty").hidden = true;
      setSeat($("#seatSeg [data-seat=Indoor]"));
      dateIn.value = iso(first); markDay(true); buildSlots(); drawBookings();
    });

    markDay(false);
    buildSlots();
    drawBookings();
  }

  /* ---------------- CONTACT ---------------- */
  if (page === "contact") {
    const now = new Date(), day = now.getDay(), h = HOURS[day], nowH = now.getHours() + now.getMinutes() / 60;
    const open = h && nowH >= h[0] && nowH < h[1];
    const st = $("#openStatus");
    let next = "";
    if (!open) {
      // next opening: later today, or the first open day after
      if (h && nowH < h[0]) next = ` · opens ${fmtH(h[0])}`;
      else for (let k = 1; k <= 7; k++) { const d = (day + k) % 7; if (HOURS[d]) { next = ` · opens ${k === 1 ? "tomorrow" : DAYS[d]} ${fmtH(HOURS[d][0])}`; break; } }
    }
    st.textContent = open ? `Open now · until ${fmtH(h[1])}` : `Closed now${next}`;
    st.classList.toggle("is-closed", !open);
    const order = [1, 2, 3, 4, 5, 6, 0];
    $("#hoursList").innerHTML = order.map((d) => `<li class="${d === day ? "is-today" : ""}"><span>${DAYS[d]}</span><span>${HOURS[d] ? fmtH(HOURS[d][0]) + " – " + fmtH(HOURS[d][1]) : "Closed"}</span></li>`).join("");

    const form = $("#contactForm");
    // topic chips drive the (visually hidden) required select
    const chips = $("#topicChips");
    const pickTopic = (t) => {
      form.topic.value = t;
      $$("button", chips).forEach((b) => b.classList.toggle("is-active", b.dataset.topic === t));
      const f = form.topic.closest(".field"); if (t) { f.classList.remove("has-error"); $(".field__err", f).textContent = ""; }
    };
    chips.addEventListener("click", (e) => { const b = e.target.closest("button[data-topic]"); if (b) pickTopic(b.dataset.topic); });
    form.addEventListener("reset", () => setTimeout(() => pickTopic(""), 0));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!MB.validate(form)) return;
      const msgs = MB.store.get("mb-messages", []);
      msgs.push({ name: form.name.value, email: form.email.value, topic: form.topic.value, message: form.message.value, at: Date.now() });
      MB.store.set("mb-messages", msgs);
      MB.openModal(MB.successHTML("Message sent", "Merci!", `Thanks ${MB.escapeHTML(form.name.value.split(" ")[0])} — we usually reply within one working day.`));
      MB.drawCheck();
      form.reset();
    });

    $$(".faq__q").forEach((q) => q.addEventListener("click", () => {
      const item = q.parentElement, open = !item.classList.contains("is-open");
      $$(".faq__item").forEach((i) => { i.classList.remove("is-open"); $(".faq__q", i).setAttribute("aria-expanded", "false"); });
      item.classList.toggle("is-open", open);
      q.setAttribute("aria-expanded", open);
      setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 650);
    }));
  }

  MB.boot();
})();
