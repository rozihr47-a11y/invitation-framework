(function(){

const Invitation = window.Invitation;

Invitation.effects =
    Invitation.effects || {};

Invitation.effects.clouds =
    Invitation.effects.clouds || {};

Invitation.effects.clouds.original = {};

Invitation.effects.clouds.original.init = function(THREE){

  // const THREE = window.__THREE__;
        if (!THREE) return;

        gsap.registerPlugin(ScrollTrigger);

        const isMobile = matchMedia("(max-width: 768px)").matches;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 4000);

        camera.position.set(0, 3, 1500);
        camera.rotation.x = THREE.MathUtils.degToRad(14.2);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
        renderer.setPixelRatio(1);
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const container = document.getElementById("aurora-canvas");
        container.innerHTML = ""; // clear previous canvas
        container.appendChild(renderer.domElement);

        function resize() {
            renderer.setSize(innerWidth, innerHeight, false);
            camera.aspect = innerWidth / innerHeight;
            camera.updateProjectionMatrix();
        }
        resize();

        const texture = new THREE.TextureLoader().load("https://cdn.jsdelivr.net/gh/izory/test-video@main/cloud10_pink.png");
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;

        const material = new THREE.ShaderMaterial({
            defines: {
                IS_MOBILE: isMobile,
            },
            transparent: true,
            depthWrite: false,
            depthTest: true,
            uniforms: {
        map:      { value: texture },
        fogColor:{ value: new THREE.Color("#fce8ea") },
        cloudColor:{ value: new THREE.Color("#fce8ea") }, // 👈 NEW
        fogNear: { value: 600.0 },
        fogFar:  { value: 3200.0 },
        density: { value: 0.0 }
        },
            vertexShader: `
            varying vec2 vUv;
            varying float vY;

            void main() {
                vUv = uv;
                vY = position.y;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
            `,
            fragmentShader: `
            precision highp float;

        uniform sampler2D map;
        uniform vec3 fogColor;
        uniform vec3 cloudColor;
        uniform float fogNear;
        uniform float fogFar;
        uniform float density;

        varying vec2 vUv;
        varying float vY;

        void main() {

        vec4 tex = texture2D(map, vUv);

        tex.rgb = max(tex.rgb, vec3(0.92));

        float verticalFade = smoothstep(140.0, -140.0, vY);

        float depth = gl_FragCoord.z / gl_FragCoord.w;
        float depthFade = smoothstep(fogNear, fogFar, depth);

        float boostedAlpha = tex.a * (1.0 + density * 2.5);
        float softAlpha = smoothstep(0.1, 0.95, boostedAlpha);
        float mistAlpha = softAlpha * verticalFade * (1.0 - depthFade);

        vec3 tintedCloud = tex.rgb * cloudColor;

        vec3 scatteredLight = vec3(0.0);
        vec3 sunColor = vec3(1.0, 0.95, 0.9);

        #ifdef IS_MOBILE
            // Cheaper version for mobile to balance performance and visuals
            float t = (vY * 0.015 + 0.4 - 0.1) / 0.9; // Manual linear step
            float sunScatter = clamp(t, 0.0, 1.0);
            float glowFactor = 1.0 - density; // Linear falloff is cheaper than smoothstep
            scatteredLight = sunColor * sunScatter * glowFactor * 0.6;
        #else
            // High quality version for desktop
            float sunScatter = smoothstep(0.1, 1.0, vY * 0.015 + 0.4);
            float glowFactor = smoothstep(1.0, 0.0, density);
            scatteredLight = sunColor * sunScatter * glowFactor * 0.6;
        #endif

        vec3 mistColor = mix(tintedCloud + scatteredLight, fogColor, density * 0.35);

        gl_FragColor = vec4(mistColor, mistAlpha);
        }`
        });

        const geometry = new THREE.PlaneGeometry(64, 64);
        const cloudGroup = new THREE.Group();
        scene.add(cloudGroup);

        const CLOUD_COUNT = isMobile ? 1500 : 1500;
        const CLOUD_MIN_X = -500;
        const CLOUD_MAX_X = 500;
        const X_RANGE = CLOUD_MAX_X - CLOUD_MIN_X;

        for (let i = 0; i < CLOUD_COUNT; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
            Math.random() * X_RANGE + CLOUD_MIN_X,
            -Math.random() * Math.random() * 220 - 20,
            i
            );

            mesh.rotation.z = Math.random() * Math.PI;
            mesh.scale.setScalar(Math.random() * Math.random() * 1.6 + 0.6);
            cloudGroup.add(mesh);
        }

        const cloudGroup2 = cloudGroup.clone();
        scene.add(cloudGroup2);

        function resetXLoopPositions() {
            cloudGroup.position.x = 0;
            cloudGroup2.position.x = -X_RANGE;
        }

        resetXLoopPositions();
        cloudGroup.position.z = 0;
        cloudGroup2.position.z = -CLOUD_COUNT;

        let lastTime = performance.now();

        function animate(time) {
        requestAnimationFrame(animate);

        if (cloudsPausedOriginal) {
            renderer.render(scene, camera); // keep last frame visible
            return;
        }

        // Robust delta time calculation to prevent jumps
        const delta = time - lastTime;
        lastTime = time;

        // Cap delta to a max of 100ms (10fps) to avoid huge leaps
        const cappedDelta = Math.min(delta, 100);
        const effectiveDelta = cappedDelta * 0.03; // Keep original speed multiplier

        const driftSpeed = 0.12;
        cloudGroup.position.x += effectiveDelta * driftSpeed;
        cloudGroup2.position.x += effectiveDelta * driftSpeed;

        if (cloudGroup.position.x >= X_RANGE) {
            cloudGroup.position.x = cloudGroup2.position.x - X_RANGE;
        }
        if (cloudGroup2.position.x >= X_RANGE) {
            cloudGroup2.position.x = cloudGroup.position.x - X_RANGE;
        }

        renderer.render(scene, camera);
        }

        let cloudsPausedOriginal = false;
        animate(performance.now());

        
        ScrollTrigger.create({
            trigger: ".driver",
            start: "5% 90%",
            endTrigger: ".next",
            end: "20% 50%",
            scrub: true,
            onUpdate: self => {
            const p = self.progress;
            const zEase = p * p * p;
            camera.position.z = 1500 + zEase * CLOUD_COUNT * 0.5;

            const startTilt = THREE.MathUtils.degToRad(14.2);
            const endTilt = THREE.MathUtils.degToRad(-6.2);
            camera.rotation.x = THREE.MathUtils.lerp(startTilt, endTilt, p);

            const densityStart = 0.65;
            const d = THREE.MathUtils.clamp((p - densityStart) / (1.0 - densityStart), 0, 1);
            material.uniforms.density.value = Math.min(d * d * d, 0.9);

            },
            onEnter: () => {
            resetXLoopPositions();

            },
            
            onLeave: () => {
            resetXLoopPositions();

            },

        });

        gsap.set("#aurora-canvas",{
                maskImage: "linear-gradient(to bottom,transparent 75%,black 90%)",
            });


        gsap.to("#aurora-canvas",{
        maskImage: "linear-gradient(to bottom,transparent 0%,black 30%)",
        ease: "none",
        scrollTrigger:{
            trigger: ".driver",
            start: "top 80%",
            endTrigger: ".next",
            end: "20% 50%",
            scrub: true,
            
            // Test Pinning
            // markers: true,
        }
        });


        gsap.to ("#hero",{
        "--hero-trans-shift": "35%",
        "--hero-trans-shift2": "10%",
        duration: 1,
        ease: "none",
        scrollTrigger: {
            trigger: ".driver",
            start: "50% 90%",
            end: "+=50%",
            scrub:true,
        }
        });
        
        gsap.to(".BgColor_solid", {
        opacity: 1,
        duration: 1,
        ease: "none",
        scrollTrigger: {
            trigger: ".next",
            start: "top top",   // when element top hits viewport top
            // end: "30% 40%",
            toggleActions: "play reverse play reverse",
        },

        }, "+=1");

        ScrollTrigger.create({
        trigger: ".nextSect_wraper",
        start: "top top",

        onEnter: () => {
            cloudsPausedOriginal = true;
        },

        onLeaveBack: () => {
            cloudsPausedOriginal = false;
            lastTime = performance.now(); // 🔥 prevent jump
        }
        });

            addEventListener("resize", () => {
            resize();
            ScrollTrigger.refresh();
        });

        


};

})();