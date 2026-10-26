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
  }

  /* ---------------- MENU ---------------- */
  if (page === "menu") {
    const grid = $("#menuGrid");
    const params = new URLSearchParams(location.search);
    let cat = params.get("cat") || "all", q = "";
    if (cat !== "all" && !MB.MENU.some((m) => m.cat === cat)) cat = "all";

    function draw(animate) {
      const list = MB.MENU.filter((m) => (cat === "all" || m.cat === cat) &&
        (!q || (m.name + " " + m.desc).toLowerCase().includes(q)));
      grid.innerHTML = list.length ? list.map((m) => `
        <article class="dish" data-tilt>
          <div class="dish__media ${m.cat === "drinks" ? "" : "pattern"}" style="${m.cat === "drinks" ? "background:var(--wine-deep)" : ""}">
            ${m.badge ? `<span class="dish__tag">${m.badge}</span>` : ""}${MB.photoFor(m)}</div>
          <div class="dish__body">
            <div class="dish__top"><h3>${m.name}</h3><span class="price">${MB.money(m.price)}</span></div>
            <p>${m.desc}</p>
            <div class="dish__foot"><div class="diet">${m.diet.map((d) => `<span title="${{ V: "Vegetarian", VG: "Vegan", GF: "Gluten free" }[d]}">${d}</span>`).join("")}</div>
              <button class="add-btn" data-add="${m.id}" aria-label="Add ${m.name} to bag">+ <span>Add</span></button></div>
          </div>
        </article>`).join("")
        : `<div class="empty-state"><h3><em>No waffles match “${MB.escapeHTML(q)}”</em></h3><p>Try another word or category.</p></div>`;
      $("#menuCount").textContent = `${list.length} ${list.length === 1 ? "item" : "items"}`;
      MB.bindInteractions(grid);
      if (animate && hasGsap && !reduced) {
        gsap.fromTo($$(".dish", grid), { y: 60, opacity: 0, rotateX: -12 },
          { y: 0, opacity: 1, rotateX: 0, duration: 0.9, ease: "expo.out", stagger: 0.05, clearProps: "opacity" });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

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
    // first reveal when the grid scrolls in
    if (hasGsap && !reduced && window.ScrollTrigger) {
      gsap.from($$(".dish", grid), { y: 80, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.06,
        scrollTrigger: { trigger: grid, start: "top 85%", once: true }, clearProps: "opacity,transform" });
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

    function buildSlots() {
      const d = dateIn.value ? new Date(dateIn.value + "T00:00") : null;
      timeIn.value = "";
      if (!d) { slotsEl.innerHTML = ""; return summary(); }
      const h = HOURS[d.getDay()];
      if (!h) { slotsEl.innerHTML = `<p class="muted" style="margin:0">We're closed on ${DAYS[d.getDay()]}s — please pick another day.</p>`; return summary(); }
      const isToday = iso(d) === iso(new Date()), nowH = new Date().getHours() + new Date().getMinutes() / 60;
      let html = "";
      for (let t = h[0]; t <= h[1] - 1.5; t += 0.5) {
        const past = isToday && t <= nowH + 0.5;
        html += `<button type="button" data-time="${fmtH(t)}" ${past ? "disabled" : ""}>${fmtH(t)}</button>`;
      }
      slotsEl.innerHTML = html || `<p class="muted" style="margin:0">No more tables today — try tomorrow.</p>`;
      summary();
    }
    slotsEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-time]"); if (!b) return;
      $$("button", slotsEl).forEach((x) => x.classList.toggle("is-active", x === b));
      timeIn.value = b.dataset.time;
      const f = timeIn.closest(".field"); f.classList.remove("has-error"); $(".field__err", f).textContent = "";
      summary();
    });
    dateIn.addEventListener("change", buildSlots);

    const out = $("#guestOut");
    $("#stepper").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      guests = Math.min(12, Math.max(1, guests + (b.dataset.step === "+" ? 1 : -1)));
      out.textContent = guests;
      $("#bigParty").hidden = guests < 9;
      summary();
    });
    $("#seatSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      seating = b.dataset.seat;
      $$("#seatSeg button").forEach((x) => x.classList.toggle("is-active", x === b));
      summary();
    });

    function summary() {
      const d = dateIn.value ? new Date(dateIn.value + "T00:00") : null;
      $("#sumDate").textContent = d ? d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : "—";
      $("#sumTime").textContent = timeIn.value || "—";
      $("#sumGuests").textContent = guests + (guests === 1 ? " guest" : " guests");
      $("#sumSeat").textContent = seating;
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
      dateIn.value = iso(first); buildSlots(); drawBookings();
    });

    buildSlots();
    drawBookings();
  }

  /* ---------------- CONTACT ---------------- */
  if (page === "contact") {
    const now = new Date(), day = now.getDay(), h = HOURS[day], nowH = now.getHours() + now.getMinutes() / 60;
    const open = h && nowH >= h[0] && nowH < h[1];
    const st = $("#openStatus");
    st.textContent = open ? `Open now · until ${fmtH(h[1])}` : "Closed now";
    st.classList.toggle("is-closed", !open);
    const order = [1, 2, 3, 4, 5, 6, 0];
    $("#hoursList").innerHTML = order.map((d) => `<li class="${d === day ? "is-today" : ""}"><span>${DAYS[d]}</span><span>${HOURS[d] ? fmtH(HOURS[d][0]) + " – " + fmtH(HOURS[d][1]) : "Closed"}</span></li>`).join("");

    const form = $("#contactForm");
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
