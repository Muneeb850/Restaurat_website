/* ==========================================================
   Procedural 3D waffle (Three.js r128, no model files)
   <canvas data-waffle="hero|stack">
   Renders only while visible; pixel ratio capped for smoothness.
   ========================================================== */
(function () {
  if (!window.THREE) return;
  const T = THREE;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lin = (hex) => new T.Color(hex).convertSRGBToLinear();

  function roundedRectShape(w, h, r) {
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  function makeEnv(renderer) {
    // tiny studio: warm wine room + two soft boxes; baked once into PMREM
    const pm = new T.PMREMGenerator(renderer);
    const env = new T.Scene();
    env.add(new T.Mesh(new T.SphereGeometry(10, 16, 8), new T.MeshBasicMaterial({ color: lin("#5a1622"), side: T.BackSide })));
    const box = (c, x, y, z, w, h) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: lin(c), side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    box("#fff3dc", -4, 5, 4, 6, 3);
    box("#ffc77a", 6, 1, -2, 3, 6);
    box("#ffffff", 0, -3, 7, 8, 1.5);
    const rt = pm.fromScene(env, 0.04);
    pm.dispose();
    return rt.texture;
  }

  function buildWaffle(opts) {
    const g = new T.Group();
    const W = opts.w || 3.4, H = opts.h || 2.8, D = 0.34, cols = opts.cols || 5, rows = opts.rows || 4;
    const pocket = new T.MeshStandardMaterial({ color: lin("#b06a24"), roughness: 0.62, metalness: 0 });
    const crust = new T.MeshStandardMaterial({ color: lin("#e3a64d"), roughness: 0.5, metalness: 0 });

    const base = new T.Mesh(
      new T.ExtrudeGeometry(roundedRectShape(W, H, 0.38), { depth: D, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 4, curveSegments: 10 }),
      pocket
    );
    base.geometry.translate(0, 0, -D / 2);
    g.add(base);

    // grid ridges on both faces as one InstancedMesh (1 draw call)
    const ridgeDepth = 0.26, rw = 0.2;
    const inset = 0.16;
    const iw = W - inset * 2, ih = H - inset * 2;
    const count = (cols + 1 + rows + 1) * 2;
    const ridgeGeo = new T.BoxGeometry(1, 1, 1);
    const ridges = new T.InstancedMesh(ridgeGeo, crust, count);
    const m = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(), p = new T.Vector3();
    let i = 0;
    [1, -1].forEach((side) => {
      const z = side * (D / 2 + 0.1 + ridgeDepth / 2 - 0.02);
      for (let c = 0; c <= cols; c++) {
        p.set(-iw / 2 + (iw / cols) * c, 0, z); s.set(rw, ih, ridgeDepth);
        ridges.setMatrixAt(i++, m.compose(p, q, s));
      }
      for (let r = 0; r <= rows; r++) {
        p.set(0, -ih / 2 + (ih / rows) * r, z); s.set(iw + rw, rw, ridgeDepth);
        ridges.setMatrixAt(i++, m.compose(p, q, s));
      }
    });
    g.add(ridges);
    const topZ = D / 2 + 0.1 + ridgeDepth;

    if (opts.toppings) {
      // pearl sugar (instanced)
      const sugarMat = new T.MeshStandardMaterial({ color: lin("#fffaf0"), roughness: 0.35 });
      const sugar = new T.InstancedMesh(new T.IcosahedronGeometry(0.06, 0), sugarMat, 46);
      for (let k = 0; k < 46; k++) {
        p.set((Math.random() - 0.5) * iw, (Math.random() - 0.5) * ih, topZ + 0.02);
        const e = new T.Euler(Math.random() * 3, Math.random() * 3, 0);
        q.setFromEuler(e); const sc = 0.7 + Math.random() * 0.8; s.set(sc, sc, sc);
        sugar.setMatrixAt(k, m.compose(p, q, s));
      }
      q.identity();
      g.add(sugar);

      // syrup ribbon
      const syrupMat = new T.MeshPhysicalMaterial({ color: lin("#8f3f0c"), roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6 });
      const pts = [];
      for (let k = 0; k <= 10; k++) {
        const t = k / 10;
        pts.push(new T.Vector3((t - 0.5) * iw * 1.02, Math.sin(t * Math.PI * 2.2) * ih * 0.28 + 0.2, topZ + 0.05));
      }
      // last point drips over the edge
      pts.push(new T.Vector3(W / 2 + 0.05, pts[10].y - 0.2, topZ - 0.15));
      pts.push(new T.Vector3(W / 2 + 0.12, pts[10].y - 0.7, 0));
      const syrup = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 90, 0.075, 8, false), syrupMat);
      g.add(syrup);
      const drop = new T.Mesh(new T.SphereGeometry(0.11, 16, 12), syrupMat);
      drop.scale.set(1, 1.35, 1); drop.position.set(W / 2 + 0.12, pts[10].y - 0.78, 0);
      g.add(drop);
      g.userData.drop = drop;

      // butter pat
      const butter = new T.Mesh(
        new T.ExtrudeGeometry(roundedRectShape(0.75, 0.62, 0.12), { depth: 0.18, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 }),
        new T.MeshStandardMaterial({ color: lin("#fff0b5"), roughness: 0.3, emissive: lin("#3a2a00"), emissiveIntensity: 0.15 })
      );
      butter.position.set(-0.35, -0.25, topZ - 0.02);
      butter.rotation.z = 0.35;
      g.add(butter);
    }
    return g;
  }

  function dust(n, spread) {
    const geo = new T.BufferGeometry(), pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      seed[i] = Math.random();
    }
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("seed", new T.BufferAttribute(seed, 1));
    const mat = new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uPR: { value: 1 }, uColor: { value: new T.Color("#f3ead3") } },
      vertexShader: `
        attribute float seed; uniform float uTime; uniform float uPR; varying float vA;
        void main(){
          vec3 p = position;
          p.y += mod(uTime * (0.08 + seed * 0.12) + seed * 10.0, 10.0) - 5.0;
          p.x += sin(uTime * 0.3 + seed * 20.0) * 0.25;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (2.0 + seed * 5.0) * uPR * (6.0 / -mv.z);
          vA = 0.25 + seed * 0.55;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor; varying float vA;
        void main(){ float d = length(gl_PointCoord - 0.5); if(d > 0.5) discard; gl_FragColor = vec4(uColor, vA * smoothstep(0.5, 0.0, d)); }`
    });
    return new T.Points(geo, mat);
  }

  function Scene(canvas) {
    const variant = canvas.dataset.waffle || "hero";
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const renderer = new T.WebGLRenderer({ canvas, antialias: dpr < 2, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(dpr);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new T.Scene();
    scene.environment = makeEnv(renderer);
    const camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    scene.add(new T.HemisphereLight(lin("#ffe9c7"), lin("#3a0c12"), 0.5));
    const key = new T.DirectionalLight(lin("#fff1d6"), 1.6); key.position.set(-4, 5, 6); scene.add(key);
    const rim = new T.DirectionalLight(lin("#ff9f5a"), 1.2); rim.position.set(5, -2, -4); scene.add(rim);

    const root = new T.Group(); scene.add(root);
    const items = [];
    if (variant === "stack") {
      for (let k = 0; k < 3; k++) {
        const w = buildWaffle({ toppings: k === 2, w: 3, h: 3, cols: 4, rows: 4 });
        w.rotation.x = -Math.PI / 2;
        w.rotation.z = k * 0.4;
        w.position.y = k * 0.78 - 0.8;
        root.add(w); items.push(w);
      }
      root.rotation.x = 0.45;
    } else {
      const w = buildWaffle({ toppings: true });
      root.add(w); items.push(w);
      // a second, smaller waffle drifting behind for depth
      const back = buildWaffle({ toppings: false, w: 2, h: 2, cols: 3, rows: 3 });
      back.position.set(-3.6, 2, -4); back.rotation.set(0.6, 0.8, 0.3);
      scene.add(back); items.push(back);
    }
    const particles = dust(window.innerWidth < 700 ? 120 : 260, 16);
    particles.material.uniforms.uPR.value = dpr;
    scene.add(particles);

    const state = { mx: 0, my: 0, tx: 0, ty: 0, intro: reduced ? 1 : 0, visible: true, running: false, t: 0 };
    const clock = new T.Clock();

    function layout() {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, r.width), h = Math.max(1, r.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      const narrow = w / h < 1;
      state.baseX = variant === "hero" ? (narrow ? 0 : 2.1) : 0;
      state.baseY = variant === "hero" ? (narrow ? 1.4 : 0.6) : 0;
      state.baseS = narrow ? 0.72 : 1;
    }

    function frame() {
      if (!state.running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      state.t += dt;
      state.mx += (state.tx - state.mx) * 0.06;
      state.my += (state.ty - state.my) * 0.06;

      // hero: scroll drives a turn + lift as you leave the section
      const sp = variant === "hero" ? Math.min(window.scrollY / window.innerHeight, 1.2) : 0;
      const ease = 1 - Math.pow(1 - state.intro, 3);

      if (variant === "hero") {
        const w = items[0];
        w.position.x = state.baseX + sp * -1.2;
        w.position.y = state.baseY + Math.sin(state.t * 0.9) * 0.12 - sp * 1.6;
        w.rotation.x = -0.55 + state.my * 0.35 + sp * 1.4 + (1 - ease) * -1.5;
        w.rotation.y = -0.45 + state.mx * 0.5 + sp * 1.8 + (1 - ease) * 3.2;
        w.rotation.z = 0.18 + Math.sin(state.t * 0.6) * 0.04;
        const sc = state.baseS * (0.4 + ease * 0.6) * (1 - sp * 0.15);
        w.scale.setScalar(sc);
        const d = w.userData.drop;
        if (d) d.scale.y = 1.35 + Math.sin(state.t * 2.2) * 0.12;
        const b = items[1];
        b.rotation.y += dt * 0.25; b.rotation.x += dt * 0.12;
        b.position.y = 2 + Math.sin(state.t * 0.7) * 0.25 - sp * 0.6;
      } else {
        root.rotation.y = state.t * 0.25 + state.mx * 0.4;
        root.rotation.x = 0.45 + state.my * 0.2;
        root.position.y = Math.sin(state.t) * 0.1;
        root.scale.setScalar(state.baseS * (0.5 + ease * 0.5));
        items.forEach((w, k) => { w.position.y = (k * 0.78 - 0.8) * (0.3 + ease * 0.7); });
      }
      particles.rotation.y = state.mx * 0.15;
      particles.material.uniforms.uTime.value = state.t;
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }

    function start() { if (state.running || !state.visible || document.hidden) return; state.running = true; clock.getDelta(); requestAnimationFrame(frame); }
    function stop() { state.running = false; }

    new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; state.visible ? start() : stop(); }, { rootMargin: "100px" }).observe(canvas);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    if (window.ResizeObserver) new ResizeObserver(layout).observe(canvas); else addEventListener("resize", layout);
    if (!reduced) {
      addEventListener("pointermove", (e) => {
        state.tx = (e.clientX / innerWidth) * 2 - 1;
        state.ty = (e.clientY / innerHeight) * 2 - 1;
      }, { passive: true });
    }

    layout();
    start();

    return {
      intro(delay) {
        if (reduced) return;
        if (window.gsap) gsap.to(state, { intro: 1, duration: 2.2, delay: delay || 0, ease: "power3.out" });
        else state.intro = 1;
      }
    };
  }

  const scenes = [];
  document.querySelectorAll("canvas[data-waffle]").forEach((c) => {
    try { scenes.push(Scene(c)); } catch (err) { console.warn("WebGL unavailable", err); c.remove(); }
  });
  window.MB = Object.assign(window.MB || {}, { scenes });
})();
