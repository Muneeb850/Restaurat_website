/* Menu data + procedural SVG illustrations (no image files needed) */
(function () {
  const MENU = [
    { id: "liege-classic", cat: "waffles", name: "Liège Classique", price: 9.5, badge: "Signature",
      desc: "Brioche dough, pearl sugar caramelised on cast iron. Nothing else needed.", diet: ["V"],
      art: { shape: "round", top: ["sugar"] } },
    { id: "brussels-berry", cat: "waffles", name: "Brussels Berry", price: 12.5, badge: "Bestseller",
      desc: "Light Brussels waffle, Chantilly, macerated strawberries & raspberries.", diet: ["V"],
      art: { shape: "rect", top: ["cream", "berries", "sugar"] } },
    { id: "speculoos", cat: "waffles", name: "Speculoos Dream", price: 13, badge: "",
      desc: "Lotus spread, crushed speculoos, vanilla bean ice cream.", diet: ["V"],
      art: { shape: "rect", top: ["drizzle-caramel", "crumbs", "scoop"] } },
    { id: "chocolat-noir", cat: "waffles", name: "Chocolat Noir", price: 12, badge: "",
      desc: "Callebaut 70% dark chocolate, hazelnut praline, sea salt.", diet: ["V"],
      art: { shape: "round", top: ["drizzle-choc", "nuts"] } },
    { id: "banana-caramel", cat: "waffles", name: "Banane Caramel", price: 12.5, badge: "",
      desc: "Brûléed banana, salted butter caramel, toasted pecans.", diet: ["V"],
      art: { shape: "rect", top: ["banana", "drizzle-caramel"] } },
    { id: "maple-butter", cat: "waffles", name: "Maple & Butter", price: 10, badge: "",
      desc: "Grade A maple syrup, cultured Normandy butter.", diet: ["V"],
      art: { shape: "rect", top: ["butter", "syrup"] } },

    { id: "chicken-waffle", cat: "savoury", name: "Fried Chicken & Waffle", price: 16.5, badge: "Chef's pick",
      desc: "Buttermilk chicken, hot honey, pickled chilli, chive waffle.", diet: [],
      art: { shape: "rect", top: ["chicken", "syrup"] } },
    { id: "salmon", cat: "savoury", name: "Smoked Salmon", price: 15, badge: "",
      desc: "Buckwheat waffle, crème fraîche, dill, capers, lemon.", diet: [],
      art: { shape: "round", top: ["salmon", "herbs"] } },
    { id: "croque", cat: "savoury", name: "Croque Gaufre", price: 14, badge: "",
      desc: "Ham, Gruyère & béchamel pressed in the waffle iron.", diet: [],
      art: { shape: "rect", top: ["cheese", "herbs"] } },
    { id: "avocado", cat: "savoury", name: "Avo & Egg", price: 13.5, badge: "",
      desc: "Smashed avocado, soft egg, chilli crunch, lime.", diet: ["V"],
      art: { shape: "round", top: ["avocado", "egg"] } },

    { id: "chocolat-chaud", cat: "drinks", name: "Chocolat Chaud", price: 5.5, badge: "",
      desc: "Belgian dark chocolate melted into steamed whole milk.", diet: ["V", "GF"],
      art: { cup: "choc" } },
    { id: "flat-white", cat: "drinks", name: "Flat White", price: 4, badge: "",
      desc: "Double ristretto, velvet milk. Oat on request.", diet: ["V", "GF"],
      art: { cup: "coffee" } },
    { id: "chai", cat: "drinks", name: "Spiced Chai", price: 4.5, badge: "",
      desc: "House-brewed masala chai with cinnamon and clove.", diet: ["V", "GF"],
      art: { cup: "chai" } },
    { id: "lemonade", cat: "drinks", name: "Raspberry Lemonade", price: 4.5, badge: "New",
      desc: "Fresh-pressed lemons, raspberry, sparkling water.", diet: ["VG", "GF"],
      art: { cup: "lemonade" } },

    { id: "frites", cat: "sides", name: "Belgian Frites", price: 5, badge: "",
      desc: "Twice-fried in beef dripping, with andalouse sauce.", diet: ["GF"],
      art: { cone: true } },
    { id: "bites", cat: "sides", name: "Waffle Bites", price: 6, badge: "",
      desc: "Six mini Liège bites with chocolate dip.", diet: ["V"],
      art: { shape: "mini", top: ["sugar"] } }
  ];

  /* ---------------- SVG illustrations ---------------- */
  let uid = 0;
  const rnd = (seed) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

  function waffleBody(shape, id) {
    const g = `wg${id}`, p = `wp${id}`, clip = `wc${id}`;
    let outline;
    if (shape === "round") outline = `<circle cx="100" cy="100" r="86"/>`;
    else if (shape === "mini") outline = `<rect x="34" y="34" width="132" height="132" rx="26"/>`;
    else outline = `<rect x="18" y="30" width="164" height="140" rx="20"/>`;
    const cell = shape === "round" ? 19 : 23;
    return `
      <defs>
        <radialGradient id="${g}" cx="40%" cy="35%" r="75%">
          <stop offset="0" stop-color="#f2c56d"/><stop offset=".6" stop-color="#d99a3c"/><stop offset="1" stop-color="#a8641f"/>
        </radialGradient>
        <pattern id="${p}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse" x="6" y="6">
          <rect x="3" y="3" width="${cell - 6}" height="${cell - 6}" rx="3" fill="#9a5418" opacity=".55"/>
          <rect x="3" y="3" width="${cell - 6}" height="3" rx="1.5" fill="#6d3610" opacity=".45"/>
        </pattern>
        <clipPath id="${clip}">${outline}</clipPath>
      </defs>
      <g>
        <g transform="translate(0 6)" fill="#3a0c12" opacity=".35">${outline}</g>
        <g fill="url(#${g})">${outline}</g>
        <g clip-path="url(#${clip})"><rect width="200" height="200" fill="url(#${p})"/></g>
        <g fill="none" stroke="#fbe2a8" stroke-opacity=".35" stroke-width="2">${outline}</g>
      </g>`;
  }

  const TOPPINGS = {
    sugar: (r) => Array.from({ length: 22 }, () => `<rect x="${40 + r() * 120}" y="${45 + r() * 110}" width="5" height="5" rx="1.5" fill="#fffaf0" opacity=".9" transform="rotate(${r() * 90} 100 100)"/>`).join(""),
    berries: (r) => [[70, 80], [118, 72], [96, 112], [132, 118], [62, 128], [104, 84]].map(([x, y], i) =>
      i % 2 ? `<circle cx="${x}" cy="${y}" r="11" fill="#c2213a"/><circle cx="${x - 3}" cy="${y - 4}" r="3" fill="#ff7a8a" opacity=".7"/>`
            : `<path d="M${x - 11} ${y - 6} q11 -10 22 0 q-3 18 -11 22 q-8 -4 -11 -22z" fill="#d42a3c"/><path d="M${x - 6} ${y - 9} l6 -6 l6 6" fill="none" stroke="#3f7a2c" stroke-width="3" stroke-linecap="round"/>`).join(""),
    cream: () => `<g><circle cx="100" cy="98" r="30" fill="#fffaf0"/><circle cx="88" cy="88" r="16" fill="#fff"/><path d="M80 112 q20 -14 40 0" stroke="#efe3c6" stroke-width="3" fill="none"/></g>`,
    scoop: () => `<g><circle cx="108" cy="92" r="28" fill="#f8efd8"/><circle cx="100" cy="84" r="9" fill="#fff" opacity=".8"/><circle cx="116" cy="102" r="2" fill="#3a1c10"/><circle cx="102" cy="104" r="1.6" fill="#3a1c10"/><circle cx="120" cy="86" r="1.6" fill="#3a1c10"/></g>`,
    "drizzle-caramel": () => `<path d="M30 70 C60 40, 80 120, 110 80 S160 60, 175 110 M40 130 C70 100, 100 160, 130 120 S165 120, 170 150" fill="none" stroke="#c97a1e" stroke-width="7" stroke-linecap="round" opacity=".95"/>`,
    "drizzle-choc": () => `<path d="M24 80 C60 50, 70 130, 105 90 S150 50, 178 100 M34 125 C70 95, 100 165, 135 120 S168 120, 176 140" fill="none" stroke="#3b1a12" stroke-width="8" stroke-linecap="round"/>`,
    syrup: () => `<path d="M60 60 C100 40, 140 70, 130 100 C120 130, 70 120, 80 150" fill="none" stroke="#a5531a" stroke-width="10" stroke-linecap="round" opacity=".85"/><path d="M62 58 C100 40, 138 68, 128 98" fill="none" stroke="#ffd18a" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>`,
    butter: () => `<g transform="rotate(-12 100 95)"><rect x="80" y="76" width="40" height="34" rx="6" fill="#fff1b8"/><rect x="80" y="76" width="40" height="9" rx="4" fill="#fffbe4"/></g>`,
    crumbs: (r) => Array.from({ length: 16 }, () => `<circle cx="${40 + r() * 120}" cy="${50 + r() * 100}" r="${2 + r() * 3}" fill="#8a4a16"/>`).join(""),
    nuts: (r) => Array.from({ length: 9 }, () => `<ellipse cx="${45 + r() * 110}" cy="${50 + r() * 100}" rx="6" ry="4.5" fill="#b9793a" transform="rotate(${r() * 180})" transform-origin="center"/>`).join(""),
    banana: () => [[70, 80], [100, 72], [130, 86], [82, 118], [116, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#f7e7a4"/><circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#c48a2c" stroke-width="3"/><circle cx="${x}" cy="${y}" r="3" fill="#c9a861"/>`).join(""),
    chicken: () => `<g><path d="M60 70 q40 -30 80 0 q14 30 -10 54 q-30 18 -60 0 q-24 -24 -10 -54z" fill="#b9682a"/><path d="M70 76 q30 -18 60 2" stroke="#e1a252" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="84" cy="96" r="3" fill="#7a3a12"/><circle cx="112" cy="104" r="3" fill="#7a3a12"/></g>`,
    salmon: () => `<g><path d="M55 80 q45 -30 90 0 q-45 26 -90 0z" fill="#f58e6a"/><path d="M60 110 q40 -24 80 2 q-40 20 -80 -2z" fill="#f7a07e"/><path d="M70 80 l60 0 M72 110 l58 0" stroke="#ffd6c4" stroke-width="2"/></g>`,
    herbs: (r) => Array.from({ length: 10 }, () => `<path d="M${50 + r() * 100} ${55 + r() * 90} l6 -4" stroke="#4d8a3a" stroke-width="3" stroke-linecap="round"/>`).join(""),
    cheese: () => `<path d="M40 70 q30 20 60 0 q30 -20 60 6 l-4 60 q-30 20 -60 0 q-30 -18 -56 0z" fill="#f6d36b" opacity=".92"/>`,
    avocado: () => `<g><ellipse cx="80" cy="100" rx="30" ry="34" fill="#9cc25a"/><ellipse cx="80" cy="100" rx="20" ry="24" fill="#cfe58e"/></g>`,
    egg: () => `<g><path d="M110 70 q40 -6 50 30 q4 36 -40 36 q-30 -4 -24 -36 q2 -26 14 -30z" fill="#fffaf0"/><circle cx="130" cy="102" r="15" fill="#ffb22b"/><circle cx="125" cy="97" r="4" fill="#ffe08a"/></g>`
  };

  function cupSVG(kind, id) {
    const fills = { choc: "#4a2015", coffee: "#a0663a", chai: "#c48a55", lemonade: "#f06b86" };
    const g = `cg${id}`;
    if (kind === "lemonade") {
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff93a8"/><stop offset="1" stop-color="#c8284c"/></linearGradient></defs>
        <path d="M60 40 h80 l-10 130 q-30 10 -60 0z" fill="#f3ead3" opacity=".35"/>
        <path d="M64 62 h72 l-8 104 q-28 8 -56 0z" fill="url(#${g})"/>
        <rect x="80" y="80" width="18" height="18" rx="4" fill="#fff" opacity=".5" transform="rotate(12 89 89)"/><rect x="104" y="100" width="16" height="16" rx="4" fill="#fff" opacity=".45"/>
        <circle cx="130" cy="58" r="18" fill="#f9e27a"/><circle cx="130" cy="58" r="12" fill="#fff3b0"/>
        <path d="M110 20 l-8 120" stroke="#f3ead3" stroke-width="6" stroke-linecap="round"/></svg>`;
    }
    return `<svg viewBox="0 0 200 200" aria-hidden="true">
      <defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e3d6b4"/></linearGradient></defs>
      <ellipse cx="100" cy="166" rx="74" ry="14" fill="#3a0c12" opacity=".35"/>
      <ellipse cx="100" cy="160" rx="70" ry="14" fill="#f3ead3"/>
      <path d="M48 70 h104 l-8 76 q-44 18 -88 0z" fill="url(#${g})"/>
      <path d="M150 88 q30 0 26 24 q-4 20 -30 18" fill="none" stroke="#e3d6b4" stroke-width="9"/>
      <ellipse cx="100" cy="70" rx="52" ry="12" fill="${fills[kind]}"/>
      ${kind === "coffee" ? `<path d="M88 70 q12 -10 24 0 q-12 8 -24 0z" fill="#f3ddb8"/><path d="M100 64 v10" stroke="#f3ddb8" stroke-width="3"/>` : ""}
      ${kind === "choc" ? `<rect x="84" y="62" width="10" height="10" rx="2" fill="#fff"/><rect x="104" y="64" width="10" height="10" rx="2" fill="#fff"/>` : ""}
      ${kind === "chai" ? `<circle cx="92" cy="70" r="2" fill="#6b3a1a"/><circle cx="108" cy="68" r="2" fill="#6b3a1a"/><circle cx="100" cy="73" r="2" fill="#6b3a1a"/>` : ""}
      <path d="M84 40 q-8 -12 2 -22 M104 44 q-8 -12 2 -24 M122 40 q-8 -12 2 -22" fill="none" stroke="#f3ead3" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      <text x="100" y="122" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="22" fill="#6e1e2b">MB</text>
    </svg>`;
  }

  function coneSVG() {
    const fries = Array.from({ length: 9 }, (_, i) => {
      const x = 62 + i * 9.5, h = 40 + ((i * 37) % 30);
      return `<rect x="${x}" y="${78 - h}" width="11" height="${h + 30}" rx="2" fill="${i % 2 ? "#f2c45f" : "#e8b142"}" transform="rotate(${(i - 4) * 4} ${x} 100)"/>`;
    }).join("");
    return `<svg viewBox="0 0 200 200" aria-hidden="true">${fries}
      <path d="M52 86 h96 l-30 96 h-36z" fill="#f3ead3"/><path d="M52 86 h96 l-4 14 h-88z" fill="#e3d6b4"/>
      <text x="100" y="140" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="20" fill="#6e1e2b">MB</text></svg>`;
  }

  function artFor(item) {
    const id = ++uid;
    const a = item.art;
    if (a.cup) return cupSVG(a.cup, id);
    if (a.cone) return coneSVG();
    const r = rnd(hash(item.id));
    const tops = (a.top || []).map((t) => (TOPPINGS[t] ? TOPPINGS[t](r) : "")).join("");
    return `<svg viewBox="0 0 200 200" aria-hidden="true">${waffleBody(a.shape, id)}${tops}</svg>`;
  }

  // real dish photo (images/<id>.jpg); falls back to the drawn illustration if the file is missing
  function photoFor(item) {
    return `<img class="dish-photo" src="images/${item.id}.jpg" alt="${item.name}" loading="lazy" decoding="async"
      onerror="this.outerHTML=MB.artFor(MB.MENU.find(function(m){return m.id==='${item.id}'}))">`;
  }

  const money = (n) => "€" + n.toFixed(2).replace(".", ",");

  window.MB = Object.assign(window.MB || {}, { MENU, artFor, photoFor, money });
})();
