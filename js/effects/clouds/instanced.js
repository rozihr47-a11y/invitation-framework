(function () {

    const Invitation = window.Invitation;

    Invitation.effects =
        Invitation.effects || {};

    Invitation.effects.clouds =
        Invitation.effects.clouds || {};

    Invitation.effects.clouds.instanced = {};

    Invitation.effects.clouds.instanced.init = function (THREE) {

        // const THREE = window.__THREE__;
        if (!THREE) return;

        gsap.registerPlugin(ScrollTrigger);

        const isMobile = matchMedia("(max-width: 768px)").matches;

        // -------------------------
        // CORE SETUP
        // -------------------------
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            30,
            window.innerWidth / window.innerHeight,
            1,
            4000
        );

        const START_Z = 1500;
        const START_TILT = THREE.MathUtils.degToRad(13);
        const END_TILT = THREE.MathUtils.degToRad(-10);

        camera.position.set(0, 3, START_Z);
        camera.rotation.x = START_TILT;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: "high-performance"
        });

        renderer.setPixelRatio(1);
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const container = document.getElementById("aurora-canvas");
        container.innerHTML = ""; // clear previous canvas
        container.appendChild(renderer.domElement);

        function resize() {
            // const w = innerWidth;
            // const h = innerHeight;
            const w = container.clientWidth;
            const h = container.clientHeight;

            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();

        // -------------------------
        // TEXTURE (reuse loader)
        // -------------------------
        const loader = new THREE.TextureLoader();
        const texture = loader.load(
            "https://cdn.jsdelivr.net/gh/izory/test-video@main/cloud10_pink.png"
        );

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;

        // -------------------------
        // MATERIAL (unchanged visually)
        // -------------------------
        const uniforms = {
            map: { value: texture },
            fogColor: { value: new THREE.Color("#fce8ea") },
            cloudColor: { value: new THREE.Color("#fce8ea") },
            fogNear: { value: 600.0 },
            fogFar: { value: 3200.0 },
            density: { value: 0.0 }
        };

        const material = new THREE.ShaderMaterial({
            defines: {
                IS_MOBILE: isMobile,
            },
            transparent: true,
            depthWrite: false,
            depthTest: true,
            uniforms,
            vertexShader: `
        varying vec2 vUv;
        varying float vY;

        void main() {
            vUv = uv;

            // apply instancing transform
            vec4 worldPosition = instanceMatrix * vec4(position, 1.0);

            vY = worldPosition.y;

            gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
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

        // cheap pseudo-random
        float rand(vec2 co){
            return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {

            vec4 tex = texture2D(map, vUv);

            // keep your bright soft cloud base
            tex.rgb = max(tex.rgb, vec3(0.92));

            // -------------------------
            // 🌫️ BREAK UP FLAT LAYERS
            // -------------------------
            float noise = sin(vUv.x * 6.0 + vY * 0.01) * 8.0;
            float verticalFade = smoothstep(180.0, -180.0, vY + noise);

            // -------------------------
            // 🌫️ DEPTH FOG
            // -------------------------
            float depth = gl_FragCoord.z / gl_FragCoord.w;
            float depthFade = smoothstep(fogNear, fogFar, depth);

            // -------------------------
            // 🌫️ PER-INSTANCE VARIATION
            // -------------------------
            float variation = sin(vY * 0.02 + vUv.x * 3.0) * 0.5 + 0.5;

            // stronger density shaping (more natural buildup)
            float boostedAlpha = tex.a * (1.0 + density * (2.0 + variation));

            // softer cloud edges (important!)
            float softAlpha = smoothstep(0.05, 0.85, boostedAlpha);

            float mistAlpha = softAlpha * verticalFade * (1.0 - depthFade);

            // -------------------------
            // 🌫️ COLOR VARIATION
            // -------------------------
            vec3 tintedCloud = tex.rgb * cloudColor * (0.9 + variation * 0.2);

            // -------------------------
            // ☀️ LIGHT SCATTERING
            // -------------------------
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

            // -------------------------
            // 🌫️ FINAL COLOR MIX
            // -------------------------
            vec3 mistColor = mix(
            tintedCloud + scatteredLight, // On mobile, scatteredLight will be vec3(0.0)
            fogColor,
            density * 0.35
            );

            gl_FragColor = vec4(mistColor, mistAlpha);
        }
        `
        });

        // -------------------------
        // INSTANCED CLOUDS
        // -------------------------
        const geometry = new THREE.PlaneGeometry(64, 64);

        const CLOUD_COUNT = isMobile ? 2800 : 4500;
        const CLOUD_MIN_X = -500;
        const CLOUD_MAX_X = 500;
        const X_RANGE = CLOUD_MAX_X - CLOUD_MIN_X;

        // helper objects (avoid allocations per loop)
        const dummy = new THREE.Object3D();

        function createInstancedClouds(offsetZ = 0) {
            const mesh = new THREE.InstancedMesh(geometry, material, CLOUD_COUNT);

            for (let i = 0; i < CLOUD_COUNT; i++) {
                const x = Math.random() * X_RANGE + CLOUD_MIN_X;
                const y = -Math.random() * Math.random() * 220 - 20;
                const z = i + offsetZ;

                const scale = Math.random() * Math.random() * 1.6 + 0.6;
                const rotZ = Math.random() * Math.PI;

                dummy.position.set(x, y, z);
                dummy.rotation.set(0, 0, rotZ);
                dummy.scale.setScalar(scale);

                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            }

            mesh.instanceMatrix.needsUpdate = true;

            return mesh;
        }

        // create TWO looping layers (same as before)
        const cloudMesh1 = createInstancedClouds(0);
        const cloudMesh2 = createInstancedClouds(-CLOUD_COUNT);

        // scene.add(cloudMesh1, cloudMesh2);

        // wrap them in groups for movement (important!)
        const cloudGroup = new THREE.Group();
        const cloudGroup2 = new THREE.Group();

        cloudGroup.add(cloudMesh1);
        cloudGroup2.add(cloudMesh2);

        scene.add(cloudGroup, cloudGroup2);

        function resetXLoopPositions() {
            cloudGroup.position.x = 0;
            cloudGroup2.position.x = -X_RANGE;
        }

        resetXLoopPositions();
        cloudGroup2.position.z = -CLOUD_COUNT;

        // -------------------------
        // ANIMATION LOOP (stable delta)
        // -------------------------
        const clock = new THREE.Clock();

        let isPaused = false;

        function animate() {
            requestAnimationFrame(animate);

            if (isPaused) {
                renderer.render(scene, camera);
                return;
            }

            // Cap delta to prevent large jumps if tab is backgrounded or on major frame drops
            const delta = Math.min(clock.getDelta(), 0.1) * 60;
            const move = delta * 0.12;

            cloudGroup.position.x += move;
            cloudGroup2.position.x += move;

            if (cloudGroup.position.x >= X_RANGE) {
                cloudGroup.position.x = cloudGroup2.position.x - X_RANGE;
            }
            if (cloudGroup2.position.x >= X_RANGE) {
                cloudGroup2.position.x = cloudGroup.position.x - X_RANGE;
            }

            renderer.render(scene, camera);
        }

        animate();

        // -------------------------
        // SCROLL (cached math)
        // -------------------------
        ScrollTrigger.create({
            trigger: ".driver",
            start: "5% 90%",
            endTrigger: ".next",
            end: "20% 50%",
            scrub: true,

            onUpdate: ({ progress: p }) => {
                const zEase = p * p * p;

                camera.position.z = START_Z + zEase * CLOUD_COUNT * 0.5;
                camera.rotation.x = THREE.MathUtils.lerp(START_TILT, END_TILT, p);

                const densityStart = 0.65;
                const d = THREE.MathUtils.clamp(
                    (p - densityStart) / (1.0 - densityStart),
                    0,
                    1
                );

                uniforms.density.value = Math.min(d * d * d, 0.9);
            },

            onEnter: () => {
                resetXLoopPositions();
                gsap.to("#aurora-canvas", {
                    maskImage: "linear-gradient(to bottom,transparent 0%,black 30%)",
                    duration: 0.3
                });
            },

            onLeave: () => {
                resetXLoopPositions();
                gsap.to("#aurora-canvas", {
                    maskImage: "linear-gradient(to bottom,transparent 75%,black 90%)",
                    duration: 0.3
                });
            },

            onEnterBack: () => {
                gsap.to("#aurora-canvas", {
                    maskImage: "linear-gradient(to bottom,transparent 0%,black 30%)",
                    duration: 0.3
                });
            },

            onLeaveBack: () => {
                gsap.to("#aurora-canvas", {
                    maskImage: "linear-gradient(to bottom,transparent 75%,black 90%)",
                    duration: 0.3
                });
            }
        });

        // -------------------------
        // OTHER GSAP (unchanged)
        // -------------------------
        gsap.to("#hero", {
            "--hero-trans-shift": "30%",
            ease: "none",
            scrollTrigger: {
                trigger: ".driver",
                start: "50% 90%",
                end: "+=50%",
                scrub: true
            }
        });

        gsap.to(".BgColor_solid", {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
                trigger: ".next",
                start: "top top",
                toggleActions: "play reverse play reverse"
            }
        });

        ScrollTrigger.create({
            trigger: ".nextSect_wraper",
            start: "top 0%",   // 👈 EXACT moment next section takes over

            // markers: true,

            onEnter: () => {
                isPaused = true;
            },

            onLeaveBack: () => {
                isPaused = false;
                clock.getDelta(); // prevent jump on resume
            }
        });

        addEventListener("resize", () => {
            resize();
            ScrollTrigger.refresh();
        });



    };

})();