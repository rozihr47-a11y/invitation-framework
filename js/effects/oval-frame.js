/**
 * Invitation Framework
 * Oval Frame Effect
 */

(function () {

  const Invitation = window.Invitation;

  Invitation.effects =
    Invitation.effects || {};

  Invitation.effects.ovalFrame =
    Invitation.effects.ovalFrame || {};

  Invitation.effects.ovalFrame.init = function () {

    gsap.registerPlugin(ScrollTrigger);

    const THREE = window.__THREE__;
    if (!THREE) {
      console.error("THREE not found");
      return;
    }

    //   const {
    //     disableBodyScroll,
    //     enableBodyScroll,
    //     clearAllBodyScrollLocks
    // } = bodyScrollLock;



    const el = document.querySelector(".goldOvalFrame");
    if (!el) return;

    const isMobile = window.innerWidth < 768;

    const img = el.querySelector("img");

    /* ==========================
       SCENE
    ========================== */

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      el.offsetWidth / -2,
      el.offsetWidth / 2,
      el.offsetHeight / 2,
      el.offsetHeight / -2,
      0.1,
      10
    );

    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(el.clientWidth, el.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.1));
    // el.appendChild(renderer.domElement);

    const canvas = renderer.domElement;
    el.appendChild(canvas);

    // use THIS instead of selector
    gsap.set(canvas, { autoAlpha: 0 });

    /* ==========================
       TEXTURES
    ========================== */

    const loader = new THREE.TextureLoader();

    const imageTex = loader.load(img.src);
    const dispTex = loader.load(el.dataset.displacement);

    dispTex.wrapS = dispTex.wrapT = THREE.RepeatWrapping;

    /* ==========================
       SHADER
    ========================== */

    const material = new THREE.ShaderMaterial({

      defines: {
        IS_MOBILE: isMobile,
      },
      uniforms: {
        dispFactor: { value: 0.0 },
        effectFactor: { value: parseFloat(el.dataset.intensity) },
        uTexture: { value: imageTex },
        uDisp: { value: dispTex }
      },

      vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,

      fragmentShader: `
     precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uDisp;
uniform float dispFactor;
uniform float effectFactor;

void main(){

  vec4 baseImg = texture(uTexture, vUv);

  if (dispFactor <= 0.00001) {
    gl_FragColor = vec4(baseImg.rgb, 0.0);
    return;
  }

  vec4 disp = texture(uDisp, vUv);

  // ==========================
  // ORGANIC NOISE
  // ==========================
  float noise = pow(disp.r, 1.5) * 0.35 * dispFactor;
  float noise2 = disp.g * 0.15 * dispFactor;
  float combinedNoise = noise + noise2;

  // ==========================
  // DISTORTED REVEAL LINE
  // ==========================
  float revealLine = dispFactor + combinedNoise;

  // ==========================
  // VARIABLE EDGE SOFTNESS
  // ==========================
  float edgeWidth = 0.08 + disp.r * 0.08;

  float baseMask = 1.0 - smoothstep(
    revealLine,
    revealLine + edgeWidth,
    vUv.y
  );

  float mask = clamp(baseMask, 0.0, 1.0);

  // ==========================
  // EDGE DETECTION
  // ==========================
  float edge = abs(vUv.y - revealLine);

  float edgeMask = (1.0 - smoothstep(0.0, 0.06, edge)) * dispFactor;

  // ==========================
  // UV DISTORTION
  // ==========================
  vec2 offset = vec2(
    disp.r * edgeMask * effectFactor * 0.06,
    disp.g * edgeMask * effectFactor * 0.06
  );

  vec4 img = texture(uTexture, vUv + offset);

  // ==========================
  // ✨ GOLD LIGHT (cheap + elegant)
  // ==========================

  // soft highlight falloff
  float highlight = smoothstep(0.06, 0.0, edge) * dispFactor;

  // directional feel (top-light bias)
  float lightDir = smoothstep(0.0, 1.0, vUv.y);

  // subtle shimmer (very cheap)
  float shimmer = sin(vUv.y * 80.0 + dispFactor * 12.0) * 0.015;

  // gold tone (balanced, not too yellow)
  vec3 gold = vec3(1.0, 0.82, 0.45);

  // mix gold only on edge
  vec3 colorWithGold = mix(
    img.rgb,
    gold,
    highlight * 0.6 * lightDir + shimmer
  );

  // ==========================
  // SUBTLE FLICKER (life)
  // ==========================
  #ifndef IS_MOBILE
    float flicker = sin(vUv.y * 120.0 + dispFactor * 20.0) * 0.01;
    mask += flicker * dispFactor;
  #endif

  // ==========================
  // FINAL OUTPUT
  // ==========================
  gl_FragColor = vec4(colorWithGold, img.a * mask);
}
    `,

      transparent: true
    });

    window.dispUniform = material.uniforms.dispFactor;
    /* ==========================
       GEOMETRY
    ========================== */

    const geometry = new THREE.PlaneGeometry(
      el.offsetWidth,
      el.offsetHeight
    );

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    /* ==========================
       RENDER LOOP
    ========================== */

    let isActive = false;

    function render() {
      if (!isActive) return;
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    // render();

    let ornateY = 0;
    let ornateTopTween;

    function updateOrnateY() {
      const ornate = document.querySelector(".ornateTop");
      const groom = document.querySelector(".tBrideTxt");
      const desiredGap = 15;

      ornateY =
        groom.getBoundingClientRect().top -
        ornate.getBoundingClientRect().bottom -
        desiredGap;

      if (ornateTopTween) {
        ornateTopTween.invalidate();
        if (framePlayed) {
          Tl_frameLeave.progress(1);
        }
      }
    }

    window.addEventListener("load", updateOrnateY);
    window.addEventListener("resize", updateOrnateY);

    /* ==========================
       SCROLL TRIGGER
    ========================== */


    gsap.set(".textQuote", {
      backgroundImage:
        "linear-gradient(-35deg, rgb(0 0 0 / 0) -500%, rgb(153 102 62 / 1) -300%, rgb(153 102 62 / 1) -200%, rgb(0 0 0 / 0) 0%)",
    });

    gsap.set(".goldFrame", { autoAlpha: 0 });

    gsap.set(".ornateTop", { opacity: 0 });
    gsap.set(".ornateBot", { opacity: 0 });

    const tBrideTxt = textSplitter(document.querySelector(".tBrideTxt"));

    gsap.set(tBrideTxt.chars, {
      y: -30,
      rotationX: -90,
      // z: -120,
      skewX: -40,
      opacity: 0,
      filter: isMobile ? "none" : "blur(3px)",
      // x: -50
      color: "yellow",
      willChange: "transform, opacity"
    });

    gsap.set(".tBrideTxt", {
      maskImage: "linear-gradient(to right,black -200%,transparent 0%)"
    });

    // Nama & daughter of Animation
    const coupleName = textSplitter(document.querySelector(".coupleName"));

    gsap.set(coupleName.words, {
      display: "inline-flex",
      // overflow: "hidden",
    });

    gsap.set(coupleName.chars, {
      display: "inline-block",
      x: "-100%",
      skewX: -15,
      opacity: 0,
      filter: isMobile ? "none" : "blur(8px)",
      color: "yellow",
      willChange: "filter, opacity, skew"
    });

    gsap.set(".quoteTxt_wrap", {
      maskImage: "linear-gradient(to bottom,black 100%,transparent 200%)"
    });

    gsap.set(".coupleName", {
      maskImage: "linear-gradient(to right,black -200%,transparent 0%)"
    });

    // gsap.set(".coupleName_grom .charH", {
    //   willChange: "filter, opacity, skew"
    // });

    // gsap.to("#raysWrap", {
    //   opacity: 0,
    //   scale:  0,
    // });

    // gsap.set(".grid__cnt__img canvas",{autoAlpha: 0});


    //Nama & daughter of timeline

    const tl_coupleName = gsap.timeline({
      defaults: {
        ease: "power3.out"
      },
      // paused: true,
    });

    // Animate each character with stagger
    tl_coupleName
      .to(".coupleName", {
        maskImage: "linear-gradient(to right,black 100%,transparent 100%)",
        duration: 0.5,
      })

      .to(coupleName.chars, {
        x: '0%',
        skewX: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 2,
        stagger: {
          amount: 1,
          from: "start"
        },
        ease: "power3.out",
        color: "#99663e",
      }, "<0.5");




    function getScrollLockTarget() {

      const ua = navigator.userAgent;

      const isIOSSafari =
        /iPad|iPhone|iPod/.test(ua) &&
        /Safari/.test(ua) &&
        !/CriOS|FxiOS|EdgiOS/.test(ua);

      return isIOSSafari
        ? document.documentElement   // iOS Safari
        : document.body;             // Everything else
    }

    const scrollLockTarget = getScrollLockTarget();

    //   console.log("UA:", navigator.userAgent);
    // console.log("Target:", scrollLockTarget);
    // console.log("Is body?", scrollLockTarget === document.body);
    // console.log("Is html?", scrollLockTarget === document.documentElement);

    const Tl_frameLeave = gsap.timeline({
      paused: true
    });

    Tl_frameLeave
      .to(material.uniforms.dispFactor, {
        value: 1,
        duration: 2,
        ease: "sine.inOut",
      }, "startLabel")

      .to(".quoteTxt_wrap", {
        maskImage: "linear-gradient(to bottom,black -100%,transparent 0%)",
        duration: 2
      }, "startLabel=0")

      .to(".goldFrame", {
        autoAlpha: 1,
        duration: 1,
      }, ">")

      .to(".ornateBot", {
        autoAlpha: 0,
        ease: "none",
        duration: 1,
      }, "startLabel=0")

      .to(".ornateTop", {
        y: () => ornateY,
        ease: "none",
        duration: 1,
      }, "startLabel=0.5")

      .add(cloudSlide(), "startLabel+=0.5")

      .add(initFlowerGrowth(), "startLabel+=0.8")

      .to(".picTransi", {
        "--pic-trans-shift1": "-100%",
        "--pic-trans-shift2": "0%",
        duration: 1.5,
        ease: "sine.inOut",
      }, "startLabel+=1")


      .to(".tBrideTxt", {
        maskImage: "linear-gradient(to right,black 100%,transparent 100%)",
        duration: 0.5,
      }, "startLabel+=1")

      .to(".ray", {
        opacity: 1,
        scaleY: 0.8,
        duration: 4,
        ease: "sine.inOut",
        stagger: {
          each: 0.12,
          from: "end"
        }
      }, "startLabel+=0.5")


      .to(tBrideTxt.chars, {
        y: 0,
        rotationX: 0,
        // z: 0,
        opacity: 1,
        x: 0,
        skewX: 0,
        filter: "blur(0px)",
        color: "rgb(153 102 62 / 1)",
        ease: "expo.out",
        duration: 2,
        stagger: {
          each: 0.2,
          from: "start",
        }
      }, "startLabel+=1.5")

      .add(tl_coupleName, "startLabel+=2")

      .add(daughtersOf(), "startLabel+=3")

      .set(scrollLockTarget, { clearProps: "overflow" }, "startLabel+=4.5");

    // Set callbacks to unlock the scroll when the animation finishes or is fully reversed.
    Tl_frameLeave.eventCallback("onReverseComplete", () => {
      gsap.set(scrollLockTarget, { clearProps: "overflow" });
    });

    ornateTopTween = Tl_frameLeave.getChildren(true, true, false).find(tween => {
      const targets = typeof tween.targets === "function" ? tween.targets() : [];
      return targets.includes(document.querySelector(".ornateTop"));
    });


    let framePlayed = false;
    // let raysPlayed = false;

    const raysTL = initRays();
    const flowerWaveTL = initFlowerWave();

    const Tl_quote = gsap.timeline({
      scrollTrigger: {
        trigger: ".nextSect_wraper",
        start: "top 70%",
        end: "10% top",
        scrub: 1,
        // markers: true,
        preventOverlaps: true
      }

    });


    Tl_quote.to(".textQuote", {
      backgroundImage:
        "linear-gradient(-35deg, rgb(0 0 0 / 0) 100%, rgb(153 102 62 / 1) 300%, rgb(153 102 62 / 1) 400%, rgb(0 0 0 / 0) 600%)",
      // y: 0,
      ease: "none",
    });

    // trigger the frame animation immediately after

    // 1️⃣ Bottom ornate reveals first
    Tl_quote.to(".ornateBot", {
      opacity: 1,
      ease: "none",
      duration: 0.4,
    }, 0); // start of timeline


    // 2️⃣ Top ornate reveals mid scrub
    Tl_quote.to(".ornateTop", {
      opacity: 1,
      ease: "none",
      duration: 0.4,
    }, 0.05); // halfway through scrub

    // This function creates the scroll-locking trigger. It will only be called if needed.
    function createScrollLockTrigger() {
      ScrollTrigger.create({
        trigger: ".nextSect_wraper",
        start: () => Tl_quote.scrollTrigger.end,
        end: () => Tl_quote.scrollTrigger.end + 1,
        onEnter: () => {
          // If this trigger runs, it means the lock is enabled and we should play.
          if (!framePlayed) {
            framePlayed = true;
            gsap.set(scrollLockTarget, { overflow: 'hidden' });
            setTimeout(() => {
              Tl_frameLeave.timeScale(1).play();
              flowerWaveTL.timeScale(1).play();
            }, 30);
          }
        },
        onLeaveBack: () => {
          if (framePlayed) {
            framePlayed = false;
            Tl_frameLeave.timeScale(2).reverse();
            flowerWaveTL.timeScale(2).pause();
          }
        },
      });
    }

    // Always create the scroll lock trigger so scroll-back behavior works!
    createScrollLockTrigger();

    // Check scroll position immediately on initialization to set correct state
    // before other ScrollTriggers calculate their updates.
    const nextSect = document.querySelector(".nextSect_wraper");
    if (nextSect) {
      const rect = nextSect.getBoundingClientRect();
      const triggerTop = rect.top + window.scrollY;
      const lockStartPosition = triggerTop + nextSect.offsetHeight * 0.1;
      const currentScroll = window.scrollY;

      if (currentScroll >= lockStartPosition) {
        framePlayed = true;
        Tl_frameLeave.progress(1);
      }
    }


    ScrollTrigger.create({
      trigger: ".nextSect_wraper",
      start: "10% bottom",
      end: "70% bottom",
      // markers: true,

      onEnter: () => {
        isActive = true;
        render();
        flowerWaveTL.timeScale(2).play();
        // gsap.set(".grid__cnt__img canvas",{display: "block"});
      },
      onLeave: () => {
        isActive = false;
        flowerWaveTL.timeScale(2).pause();
        // gsap.set(".grid__cnt__img canvas",{display: "none"});

      },
      onEnterBack: () => {
        isActive = true;
        render();
        flowerWaveTL.timeScale(2).play();
        // gsap.set(".grid__cnt__img canvas",{display: "block"});
      },
      onLeaveBack: () => {
        isActive = false;
        flowerWaveTL.timeScale(2).pause();
        // gsap.set(".grid__cnt__img canvas",{display: "none"});
      },

    });

    ScrollTrigger.create({
      trigger: ".nextSect_wraper",
      start: "top top",
      end: "50% top",
      // markers: true,

      onEnter: () => {
        // gsap.set(".grid__cnt__img canvas",{display: "block"});
        gsap.set(".grid__cnt__img canvas", { autoAlpha: 1 });
      },

      // onLeave: () => {
      //   gsap.set(".grid__cnt__img canvas",{autoAlpha: 0});

      // },
      // onEnterBack: () => {
      //   gsap.set(".grid__cnt__img canvas",{autoAlpha: 1});
      // },

      onLeaveBack: () => {
        gsap.set(".grid__cnt__img canvas", { autoAlpha: 0 });
      },

    });

  };

})();