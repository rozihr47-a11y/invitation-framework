(function () {

  const Invitation = window.Invitation;

  Invitation.effects =
    Invitation.effects || {};

  Invitation.effects.pictureTransition =
    Invitation.effects.pictureTransition || {};

  Invitation.effects.pictureTransition.init = function () {

    const THREE = window.__THREE__;
    if (!THREE) {
      console.error("THREE not found");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const el = document.querySelector(".picTransi");
    if (!el) return;

    const imgs = el.querySelectorAll(".picT");
    if (imgs.length < 2) return;

    /* =========================
       SCENE
    ========================= */

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      el.offsetWidth / -2,
      el.offsetWidth / 2,
      el.offsetHeight / 2,
      el.offsetHeight / -2,
      0.1,
      10
    );

    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    // Optimized pixel ratio (caps at 2.0 universally to ensure maximum image sharpness on all screens while preventing GPU overkill)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));

    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.opacity = "0"; // hide until ready
    el.appendChild(renderer.domElement);

    /* =========================
       TEXTURES (FIXED LOADING)
    ========================= */

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "";

    let texture1, texture2, disp;

    const loadingManager = new THREE.LoadingManager(() => {
      const currentDispFactor = material.uniforms.dispFactor.value;

      material.uniforms.uDisp.value = disp;

      if (currentDispFactor >= 0.5) {
        // We are scrolled past or closer to texture2. Warm up with texture2.
        material.uniforms.uTexture1.value = texture2;
        material.uniforms.uTexture2.value = texture2;

        renderer.render(scene, camera);

        requestAnimationFrame(() => {
          material.uniforms.uTexture1.value = texture1;
        });
      } else {
        // We are scrolled before or closer to texture1. Warm up with texture1.
        material.uniforms.uTexture1.value = texture1;
        material.uniforms.uTexture2.value = texture1;

        renderer.render(scene, camera);

        requestAnimationFrame(() => {
          material.uniforms.uTexture2.value = texture2;
        });
      }

      // Show canvas AFTER warm-up
      renderer.domElement.style.opacity = "1";
    });

    loader.manager = loadingManager;

    function setupTexture(tex) {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.needsUpdate = true;
      return tex;
    }

    texture1 = loader.load(imgs[0].src, setupTexture);
    texture2 = loader.load(imgs[1].src, setupTexture);

    disp = loader.load(el.dataset.displacement, (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      return tex;
    });

    /* =========================
       SHADER
    ========================= */

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture1: { value: null },
        uTexture2: { value: null },
        uDisp: { value: null },

        dispFactor: { value: 0 },
        effectFactor: { value: parseFloat(el.dataset.intensity) || 0.5 }
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

      uniform sampler2D uTexture1;
      uniform sampler2D uTexture2;
      uniform sampler2D uDisp;

      uniform float dispFactor;
      uniform float effectFactor;

      void main(){

        vec4 dispTex = texture2D(uDisp, vUv);

        float strength = effectFactor * 0.2;

        vec2 distortedPosition = vec2(
          vUv.x + (dispTex.r * strength * dispFactor),
          vUv.y
        );

        vec2 distortedPosition2 = vec2(
          vUv.x - (dispTex.r * strength * (1.0 - dispFactor)),
          vUv.y
        );

        vec4 tex1 = texture2D(uTexture1, distortedPosition);
        vec4 tex2 = texture2D(uTexture2, distortedPosition2);

        vec4 finalColor = mix(tex1, tex2, dispFactor);

        // subtle cinematic sharpening
        float contrast = 1.05;
        float brightness = 0.01;

        finalColor.rgb = (finalColor.rgb - 0.5) * contrast + 0.5;
        finalColor.rgb += brightness;

        gl_FragColor = finalColor;
      }
    `,

      transparent: true
    });

    /* =========================
       GEOMETRY
    ========================= */

    const geometry = new THREE.PlaneGeometry(
      el.offsetWidth,
      el.offsetHeight,
      128, // optimized (was 256)
      128
    );

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    /* =========================
       RENDER LOOP
    ========================= */

    // function render() {
    //   renderer.render(scene, camera);
    //   requestAnimationFrame(render);
    // }

    let isRendering = false;

    function renderOnce() {
      renderer.render(scene, camera);
    }

    function startRenderLoop() {
      if (isRendering) return;
      isRendering = true;

      function loop() {
        if (!isRendering) return;
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
      }

      loop();
    }

    function stopRenderLoop() {
      isRendering = false;
    }

    /* =========================
       GSAP ANIMATION (UNCHANGED)
    ========================= */

    const brideGroomTL = brideTo_groom();
    const nameChange = coupleName_change();
    const namaOrtuChange = daugToSon_changing();

    let Txt_timelinePlayed = false;

    gsap.to(material.uniforms.dispFactor, {
      value: 1,
      ease: "none",
      // duration: 1.5,
      // delay: 3,
      scrollTrigger: {
        trigger: ".nextSect_wraper",
        start: "15% top",
        end: "35% top",
        scrub: true,
        // markers: true,

        onEnter: () => startRenderLoop(),
        onEnterBack: () => startRenderLoop(),

        onLeave: () => stopRenderLoop(),
        onLeaveBack: () => stopRenderLoop(),

        onUpdate: (self) => {

          renderOnce();

          if (self.progress > 0.25 && !Txt_timelinePlayed) {
            Txt_timelinePlayed = true;

            brideGroomTL.timeScale(1).play();
            nameChange.timeScale(1).play();
            namaOrtuChange.timeScale(1).play();
          }

          if (self.progress < 0.50 && Txt_timelinePlayed) {
            Txt_timelinePlayed = false;

            brideGroomTL.timeScale(2).reverse();
            nameChange.timeScale(2).reverse();
            namaOrtuChange.timeScale(2).reverse();
          }
        }
      }
    });

  };

})();