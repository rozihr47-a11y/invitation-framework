(function () {

const Invitation = window.Invitation;

Invitation.effects =
    Invitation.effects || {};

Invitation.effects.loveStory =
    Invitation.effects.loveStory || {};

Invitation.effects.loveStory.init = function () {

    const THREE = window.__THREE__;
    if (!THREE) {
        console.error("THREE not found");
        return;
    }
    gsap.registerPlugin(ScrollTrigger);
    // ═══════════════════════════════════════════════════
    // CONFIGURATION & COLORS
    // ═══════════════════════════════════════════════════
    const style = getComputedStyle(document.documentElement);
    const COLORS = {
    sceneBg: new THREE.Color(style.getPropertyValue('--scene-bg').trim() || '#FDEEEF'),
    star1: new THREE.Color(style.getPropertyValue('--star-color-1').trim() || '#d4af37'),
    star2: new THREE.Color(style.getPropertyValue('--star-color-2').trim() || '#ffeeaa'),
    };


    // ═══════════════════════════════════════════════════
    // CORE SETUP
    // ═══════════════════════════════════════════════════
    const isMobile = window.innerWidth < 768;

    // ==================================================
    // DOM Cache
    // ==================================================

    const dom = {

        canvas: document.getElementById("three-canvas"),

        wrapper: document.getElementById("canvas-wrapper"),

        experience: document.getElementById("experience-container"),

        storySection: document.querySelector(".love_storySec"),

        storyTitle: document.querySelector(".storyTitle")

    };

    // Use the centralized quality manager.
    // Love Story only has 'low' and 'high', so 'mid' tier from the manager defaults to 'high'.
    const tier = Invitation.utils.getQualityTier();
    const QUALITY = tier === "low" ? "low" : "high";
    // Step 1: Set a reasonable DPR for a good performance baseline.
    // const DPR = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
       const DPR = Math.min(window.devicePixelRatio, isMobile ? 1.3 : 1.5);

    // const canvas = document.getElementById('three-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
        
    // const container = document.getElementById("canvas-wrapper");

    function resizeRenderer() {
    const width = dom.wrapper.clientWidth;
    const height = dom.wrapper.clientHeight;

    renderer.setSize(width, height, false); // don't override CSS
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    }

        
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(DPR);
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(COLORS.sceneBg.getHex(), 0.009, 10);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 250);
    camera.position.set(0, 0, 22);

    resizeRenderer();


    // ── Post-processing ──
    const composer = null;


    // ─────────────────────────────────────────────────
    // BACKGROUND — deep space sphere with hue shift
    // ─────────────────────────────────────────────────
    const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { 
        uT: { value: 0 }, 
        uTime: { value: 0 },
        uColorB: { value: COLORS.sceneBg },
        
    },
    vertexShader: `
        varying vec3 vPos;
        void main() { vPos = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }
    `,
    fragmentShader: `
        uniform float uT, uTime;
    
        uniform vec3 uColorB;
        

        varying vec3 vPos;
        // float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }

        // // A simple, fast noise function built from the hash.
        // float noise(vec2 p) {
        //     vec2 i = floor(p);
        //     vec2 f = fract(p);
        //     f = f*f*(3.0-2.0*f); // smoothstep
        //     float a = hash(i);
        //     float b = hash(i + vec2(1.0, 0.0));
        //     float c = hash(i + vec2(0.0, 1.0));
        //     float d = hash(i + vec2(1.0, 1.0));
        //     return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        // }

        void main(){
        vec3 d = normalize(vPos);
        float v = d.y*.5+.5;

        vec3 col = uColorB;

        // The aurora effect has been removed.

        // subtle vignette at top
        col *= 1.0 - pow(v,3.0)*0.4;
        gl_FragColor = vec4(col,1.0);
        }
    `,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(180, 32, 32), skyMat));

    // ─────────────────────────────────────────────────
    // PARALLAX DUST MOTES
    // ─────────────────────────────────────────────────
    let particles = null;
    function createParticles() {
        const PARTICLE_COUNT = QUALITY === "low" ? 450 : 1000;
        const pPos = new Float32Array(PARTICLE_COUNT * 3);
        const pSz  = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 20 + 2;
            const z = (Math.random() - 0.5) * 200;

            pPos[i*3]   = Math.cos(angle) * radius;
            pPos[i*3+1] = Math.sin(angle) * radius;
            pPos[i*3+2] = z;
            pSz[i] = Math.random() * 0.5 + 0.07;
        }

        const particleGeom = new THREE.BufferGeometry();
        particleGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        particleGeom.setAttribute('aSize', new THREE.BufferAttribute(pSz, 1));

        const particleMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uStar1: { value: COLORS.star1 },
                uStar2: { value: COLORS.star2 }
            },
            vertexShader: `
                attribute float aSize;
                varying float vRand;
                void main(){
                    vRand = fract(sin(dot(position.xy,vec2(12.989,78.233)))*43758.5);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = aSize * (350.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 uStar1, uStar2;
                uniform float uTime;
                varying float vRand;
                void main(){
                    // Diamond shape for a star-like glint
                    vec2 p = abs(gl_PointCoord - 0.5);
                    float d = p.x + p.y;
                    float baseAlpha = 1.0 - smoothstep(0.45, 0.5, d);

                    // Twinkle effect using sine wave, with unique speed/phase per particle
                    float twinkle = 0.5 + 0.5 * sin(uTime * (3.0 + vRand * 4.0) + vRand * 6.283);
                    
                    // A sharp "glint" effect by raising twinkle to a high power for intensity
                    float glint = pow(twinkle, 10.0);

                    vec3 col = mix(uStar1, uStar2, vRand);
                    gl_FragColor = vec4(col, baseAlpha * (twinkle * 0.6 + glint * 0.4));
                }
            `,
            transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        });
        particles = new THREE.Points(particleGeom, particleMat);
        scene.add(particles);
    }

    // ─────────────────────────────────────────────────
    // TEXT PANELS
    // ─────────────────────────────────────────────────
    let fstTitle = '"The first met"';
    let secTitle = "Will you be mine?";
    let thirdTitle = "Will you marry me";
    let fontTitle = "'Recia Serif Display', sans-serif";
    let fontStory = "'Beau Rivage', cursive";

    const PANEL_DATA = [
    {
        lines:    ['A couple of years ago, Farah signed up for Tinder just to talk to people out of boredom. She and her friends jokingly started swiping right on everyone.'],
        label:    `${fstTitle}`,
        accent:   '#aa8c2c',
        position: new THREE.Vector3( -2.8,    0,    0),
        rotation: new THREE.Euler(0,  0, 0),
    },
    {
        lines:    ['They began talking immediately, swapping stories and messages before moving to Snapchat and FaceTime over the next few weeks'],
        label:    `${secTitle}`,
        accent:   '#aa8c2c',
        position: new THREE.Vector3(-2.8,  0, -30),
        rotation: new THREE.Euler(0,  0, 0),
    },
    {
        lines:    ["About a year into their relationship, Eric moved into Farah's apartment for three months before they bought their own house together."],
        label:    `${thirdTitle}`,
        accent:   '#aa8c2c',
        position: new THREE.Vector3( -2.8, 0, -62),
        rotation: new THREE.Euler(0, 0, 0),
    },
    ];

    const IMAGE_DATA = [
    {
        src: window.imageLoveStory1,
        position: new THREE.Vector3(-2.8, 0, -8), // between panel 1 & 2
        scale: new THREE.Vector2(6.7, 10),
    },
    {
        src: window.imageLoveStory2,
        position: new THREE.Vector3(-2.8, 0, -45), // between panel 2 & 3
        scale: new THREE.Vector2(6.7, 10),
    },
    {
        src: window.imageLoveStory3,
        position: new THREE.Vector3(-2.8, -0.7, -78), // after panel 3
        scale: new THREE.Vector2(10, 6),
    }
    ];

    const imageTimings = [
    { start: 0.16, end: 0.29 },
    { start: 0.39, end: 0.57 },
    { start: 0.7, end: 0.9 },
    ];


    function buildTextCanvas({ lines, label, accent }) {
    // Step 2: Implement "Texture Oversampling" for sharp text on a low-DPR canvas.
    // We render the canvas at a higher resolution, and the GPU's downsampling preserves sharpness.
    const SHARPNESS_FACTOR = 1.5;

    const W = 1050 * SHARPNESS_FACTOR;
    const H = 650 * SHARPNESS_FACTOR;

    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');

    const textX = 500 * SHARPNESS_FACTOR;
    const maxWidth = W - textX - (200 * SHARPNESS_FACTOR);

    function wrapText(context, text, maxWidth) {
        const words = text.split(' ');
        const wrappedLines = [];
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = context.measureText(currentLine + " " + word).width;
            if (width < maxWidth) currentLine += " " + word;
            else { wrappedLines.push(currentLine); currentLine = word; }
        }
        wrappedLines.push(currentLine);
        return wrappedLines;
    }

    let fontSize = 66 * SHARPNESS_FACTOR;
    let lineHeight = 88 * SHARPNESS_FACTOR;
    ctx.font = ` ${fontSize}px ${fontStory}`;
    
    let allWrappedLines = [];
    lines.forEach(line => {
        allWrappedLines = allWrappedLines.concat(wrapText(ctx, line, maxWidth));
    });
    
    if (allWrappedLines.length > 4) {
        fontSize = Math.max(32 * SHARPNESS_FACTOR, (66 - (allWrappedLines.length - 4) * 6) * SHARPNESS_FACTOR);
        lineHeight = fontSize * 1.2; // This ratio is fine
        ctx.font = `italic ${fontSize}px ${fontStory}`;
        allWrappedLines = [];
        lines.forEach(line => {
            allWrappedLines = allWrappedLines.concat(wrapText(ctx, line, maxWidth));
        });
    }

    ctx.font = `500 ${40 * SHARPNESS_FACTOR}px ${fontTitle}`;
    ctx.fillStyle = accent + 'cc';
    ctx.textAlign = 'center';
    ctx.fillText(label, textX, 140 * SHARPNESS_FACTOR);

    ctx.font = `${fontSize}px ${fontStory}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFF';
    
    const totalHeight = allWrappedLines.length * lineHeight;
    const startY = (H / 2) - (totalHeight / 2) + (lineHeight / 2);

    allWrappedLines.forEach((line, i) => {
        ctx.fillText(line, textX, startY + (i * lineHeight));
    });

    return c;
    }

    const panelVert = `
    varying vec2 vUv;
    void main(){
        vUv = uv;
        gl_Position = projectionMatrix*modelViewMatrix*vec4(position,2.0);
    }
    `;

    const panelFrag = `
    uniform sampler2D uTex;
    uniform float uAlpha;
    varying vec2 vUv;
    void main(){
        vec4 tex = texture2D(uTex, vUv);
        // REMOVED: +0.08 offset and vig to remove glass frame
        float a = tex.a * uAlpha;
        gl_FragColor = vec4(tex.rgb * a, a);
    }
    `;



    let panels = [];

    async function createPanels() {
    await document.fonts.load("40px 'Recia Serif Display'");
    await document.fonts.load("66px 'Beau Rivage'");
    await document.fonts.ready;

    panels = PANEL_DATA.map(d => {
        const tex  = new THREE.CanvasTexture(buildTextCanvas(d));

        const geo  = new THREE.PlaneGeometry(13, 6.5);
        const mat  = new THREE.ShaderMaterial({
        uniforms: {
            uTex:   { value: tex },
            uAlpha: { value: 0 },
        },
        vertexShader: panelVert,
        fragmentShader: panelFrag,
        blending: THREE.AdditiveBlending, 
        depthWrite: false,
        premultipliedAlpha: true
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(d.position);
        mesh.rotation.copy(d.rotation);
        scene.add(mesh);

        return mesh;
    });
    }

    function buildImagePanel({ position, scale }, texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
    
        const geo = new THREE.PlaneGeometry(scale.x, scale.y);
    
        const mat = new THREE.ShaderMaterial({
        uniforms: {
        uTex: { value: texture },
        uAlpha: { value: 0 }
        },
        vertexShader: panelVert,
        fragmentShader: `
        uniform sampler2D uTex;
        uniform float uAlpha;
        varying vec2 vUv; 

        void main() {
            vec4 tex = texture2D(uTex, vUv);

            // subtle cinematic fade edges
            float vignette = smoothstep(0.0, 0.2, vUv.x) *
                            smoothstep(1.0, 0.8, vUv.x) *
                            smoothstep(0.0, 0.2, vUv.y) *
                            smoothstep(1.0, 0.8, vUv.y);


            // Lower the maximum alpha to 80% to ensure the glitter is always visible.
            float alpha = tex.a * uAlpha * vignette * 0.8;

            // Apply premultiplied alpha for correct blending.
            gl_FragColor = vec4(tex.rgb, alpha);
        }
        `,
        transparent: true,
        depthWrite: false
    });
    
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(position);
    
        scene.add(mesh);
        return mesh;
    }

    let imagePanels = [];

    async function createImagePanels() {
        const loader = new THREE.TextureLoader();
        const texturePromises = IMAGE_DATA.map(data => new Promise(resolve => loader.load(data.src, resolve)));
        const textures = await Promise.all(texturePromises);
        imagePanels = IMAGE_DATA.map((data, i) => buildImagePanel(data, textures[i]));
    }

    // ─────────────────────────────────────────────────
    // GLOWING RIBBON CURVE
    // ─────────────────────────────────────────────────

    const bezierData = [
    {
        p: new THREE.Vector3(-3.845, -0.866, 19.087),
        hl: new THREE.Vector3(-3.731, -1.182, 19.984),
        hr: new THREE.Vector3(-3.997, -0.446, 17.892),
    },
    {
        p: new THREE.Vector3(-4.651, 0.088, 15.104),
        hl: new THREE.Vector3(-4.473, -0.096, 16.713),
        hr: new THREE.Vector3(-5.295, 0.752, 9.279),
    },
    {
        p: new THREE.Vector3(-5.000, 0.000, -0.000),
        hl: new THREE.Vector3(-4.931, 0.738, 5.852),
        hr: new THREE.Vector3(-5.037, -0.403, -3.194),
    },
    {
        p: new THREE.Vector3(-5.000, -2.000, -8.000),
        hl: new THREE.Vector3(-5.000, -2.351, -4.800),
        hr: new THREE.Vector3(-5.000, -1.809, -9.736),
    },
    {
        p: new THREE.Vector3(-5.000, 0.000, -12.000),
        hl: new THREE.Vector3(-5.100, -0.319, -10.286),
        hr: new THREE.Vector3(-4.600, 1.269, -18.824),
    },
    {
        p: new THREE.Vector3(-3.033, -1.726, -29.616),
        hl: new THREE.Vector3(-2.340, -2.522, -26.324),
        hr: new THREE.Vector3(-3.414, -1.287, -31.428),
    },
    {
        p: new THREE.Vector3(-5.000, 2.000, -31.000),
        hl: new THREE.Vector3(-5.864, 0.669, -30.308),
        hr: new THREE.Vector3(-4.552, 2.691, -31.359),
    },
    {
        p: new THREE.Vector3(-2.718, 2.011, -31.293),
        hl: new THREE.Vector3(-3.413, 2.632, -31.146),
        hr: new THREE.Vector3(-1.992, 2.929, -31.176),
    },
    {
        p: new THREE.Vector3(-0.310, 2.251, -32.014),
        hl: new THREE.Vector3(-0.821, 2.383, -31.182),
        hr: new THREE.Vector3(2.249, 1.589, -36.176),
    },
    {
        p: new THREE.Vector3(-4.000, -3.000, -49.000),
        hl: new THREE.Vector3(-3.242, -3.034, -41.952),
        hr: new THREE.Vector3(-4.350, -2.984, -52.253),
    },
    {
        p: new THREE.Vector3(-3.984, -1.143, -61.962),
        hl: new THREE.Vector3(-3.312, -1.789, -61.568),
        hr: new THREE.Vector3(-4.249, -0.889, -62.117),
    },
    {
        p: new THREE.Vector3(-4.701, -0.954, -62.512),
        hl: new THREE.Vector3(-4.506, -1.159, -62.281),
        hr: new THREE.Vector3(-5.005, -0.637, -62.870),
    },
    {
        p: new THREE.Vector3(-4.764, 0.684, -62.909),
        hl: new THREE.Vector3(-4.743, 0.134, -62.776),
        hr: new THREE.Vector3(-4.773, 0.922, -62.966),
    },
    {
        p: new THREE.Vector3(-5.469, 0.884, -62.856),
        hl: new THREE.Vector3(-5.678, 0.627, -62.746),
        hr: new THREE.Vector3(-4.935, 1.538, -63.135),
    },
    {
        p: new THREE.Vector3(-2.914, 2.603, -63.198),
        hl: new THREE.Vector3(-3.540, 2.516, -63.538),
        hr: new THREE.Vector3(-2.486, 2.343, -62.945),
    },
    {
        p: new THREE.Vector3(-0.241, 1.012, -63.683),
        hl: new THREE.Vector3(-0.125, 1.057, -63.392),
        hr: new THREE.Vector3(-0.381, 0.957, -64.037),
    },
    {
        p: new THREE.Vector3(-1.084, 0.910, -63.594),
        hl: new THREE.Vector3(-1.082, 1.090, -63.592),
        hr: new THREE.Vector3(-1.091, 0.254, -63.599),
    },
    {
        p: new THREE.Vector3(-1.019, -0.738, -63.737),
        hl: new THREE.Vector3(-0.825, -0.291, -63.673),
        hr: new THREE.Vector3(-1.111, -0.949, -63.768),
    },
    {
        p: new THREE.Vector3(-2.144, -0.995, -63.496),
        hl: new THREE.Vector3(-1.585, -0.940, -63.499),
        hr: new THREE.Vector3(-2.902, -1.068, -63.492),
    },
    {
        p: new THREE.Vector3(-2.862, -3.000, -71.732),
        hl: new THREE.Vector3(-2.519, -2.997, -69.633),
        hr: new THREE.Vector3(-3.389, -3.005, -74.955),
    },
    {
        p: new THREE.Vector3(-3.463, -3.000, -94.000),
        hl: new THREE.Vector3(-3.145, -3.133, -89.415),
        hr: new THREE.Vector3(-3.788, -2.864, -98.688),
    },
    {
        p: new THREE.Vector3(-4.000, -2.000, -106.000),
        hl: new THREE.Vector3(-4.000, -2.390, -101.315),
        hr: new THREE.Vector3(-4.000, -1.610, -110.685),
    },
    ];

    const curves = [];

    for (let i = 0; i < bezierData.length - 1; i++) {
    const a = bezierData[i];
    const b = bezierData[i + 1];

    curves.push(
        new THREE.CubicBezierCurve3(
        a.p,
        a.hr,
        b.hl,
        b.p
        )
    );
    }

    const path = new THREE.CurvePath();
    curves.forEach(c => path.add(c));

    const ribbonPoints = path.getSpacedPoints(200);

    const mainCurve = new THREE.CatmullRomCurve3(ribbonPoints);

    function createRibbonMaterial() {
    return new THREE.ShaderMaterial({
        defines: {
            IS_LOW_QUALITY: QUALITY === 'low',
        },
        uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uTwist: { value: 0.3 },

        uC1: { value: new THREE.Color("#aa8c2c") },
        uC2: { value: new THREE.Color("#e1c773") },
        uC3: { value: new THREE.Color("#d4af37") }
        },

        vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `,

        fragmentShader: `
        uniform float uTime, uScroll, uTwist;
    uniform vec3 uC1, uC2, uC3;

    varying vec2 vUv;

    void main() {

    float x = vUv.y;
    float y = vUv.x;

    // ✅ proper twist usage
    float twist = sin(x * 6.28 + uTime * 0.5) * uTwist;
    float yTwisted = y + twist;

    // 🎨 gradient
    float t = smoothstep(0.0, 1.0, x);
    vec3 col = mix(mix(uC1, uC2, t), uC3, t * t);

    // ✅ use twisted coord
    float dist = abs(yTwisted - 0.5) * 2.0;

    // core
    float core = smoothstep(0.2, 0.02, dist);

    // glow
    float glow = smoothstep(1.2, 0.0, dist);

    #ifdef IS_LOW_QUALITY
        // A much cheaper, but still pleasant glow for mobile. ~pow(glow, 4)
        // This is 75% cheaper than the high quality version.
        glow *= glow;
        glow *= glow;
    #else
        // The original cinematic, but expensive glow. ~pow(glow, 16)
        glow *= glow;
        // glow *= glow;
        // glow *= glow;
        // glow *= glow;
    #endif
    // ─────────────────────────────
    // ⚡ Pulse (cheap but effective)
    // ─────────────────────────────
    float pulse = 0.5 + 0.5 * sin(x * 8.0 - uTime * 2.0);
    // ─────────────────────────────
    // 🎯 Scroll reveal
    // ─────────────────────────────
    float reveal = smoothstep(uScroll, uScroll - 0.06, x);
    // head highlight
    float head = smoothstep(uScroll + 0.15, uScroll, x);
    // ─────────────────────────────
    // 🎨 FINAL COLOR
    // ─────────────────────────────
    // Reverting to original logic to ensure exact color reproduction.
    // The core of the ribbon has its own color calculation.
    vec3 coreColor = col * (1.0 + pulse * 0.3);
    // The glow is an additive color layer on top.
    vec3 glowColor = col * (0.6 + pulse * 0.6) * glow;

    vec3 finalColor = coreColor * core + glowColor;

    // ─────────────────────────────
    // 🔍 ALPHA (important for shape)
    // ─────────────────────────────
    float alpha = core * 0.9 + glow * 0.6;

    alpha *= reveal;
    alpha += head * 0.8;

    float startFade = smoothstep(0.0, 0.02, uScroll);
    alpha *= startFade;

    gl_FragColor = vec4(finalColor, alpha);
    }`,

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    }

    function createRibbonStrip(curve, width = 0.6, segments = 200, twistAmount = 2.0) {
    const positions = [];
    const uvs = [];
    const indices = [];

    const frames = curve.computeFrenetFrames(segments, false);

    // --- Optimization: Pre-allocate vectors to reuse inside the loop ---
    const p = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const side = new THREE.Vector3();
    const left = new THREE.Vector3();
    const right = new THREE.Vector3();
    const tempBinormal = new THREE.Vector3();
    // --- End Optimization ---

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;

        curve.getPoint(t, p); // Optimized: write to existing vector

        const normal = frames.normals[i];
        const binormal = frames.binormals[i];

        const angle = t * Math.PI * twistAmount;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // --- Optimization: Reuse vectors to avoid creating new ones per iteration ---
        tempBinormal.copy(binormal).multiplyScalar(sin);
        dir.copy(normal).multiplyScalar(cos).add(tempBinormal).normalize();
        side.copy(dir).multiplyScalar(width);
        left.copy(p).add(side);
        right.copy(p).sub(side);
        // --- End Optimization ---

        positions.push(left.x, left.y, left.z);
        positions.push(right.x, right.y, right.z);

        // uv
        uvs.push(0, t);
        uvs.push(1, t);
    }
    // indices
    for (let i = 0; i < segments; i++) {
        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;

        indices.push(a, b, c);
        indices.push(b, d, c);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    return geometry;
    }


    // ─────────────────────────────────────────────────
    // Optimized 
    // ─────────────────────────────────────────────────
    let ribbon;

    function createRibbon() {
    const ribbonGeo = createRibbonStrip(
        mainCurve,
        QUALITY === 'low' ? 0.2 : 0.2,
        QUALITY === 'low' ? 250 : 300,
        1
    );

    const ribbonMat = createRibbonMaterial();

    ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    scene.add(ribbon);
    }


    // ─────────────────────────────────────────────────
    // CAMERA PATH
    // ─────────────────────────────────────────────────
    const camPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3( -3,    -1,  20),
    new THREE.Vector3( -3,    -1,  14),
    new THREE.Vector3( -3,  -1,   6),
    new THREE.Vector3(-3,    -1,  -4),
    new THREE.Vector3(-3,    -1, -16),
    new THREE.Vector3(-3,  -1, -28),
    new THREE.Vector3(-3, -1, -36),
    new THREE.Vector3(-3, -1, -46),
    new THREE.Vector3( -3, -1, -57),
    new THREE.Vector3( -3, -1, -65),

    new THREE.Vector3(-3, -1, -75),
    new THREE.Vector3( -3, -1, -80),
    new THREE.Vector3( -3, -1, -95),
    new THREE.Vector3( -3, -1, -100),

    ]);

    const lookPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3( -3,    0,    2),
    new THREE.Vector3( -3,    0,   -4),
    new THREE.Vector3( -3,    0,  -12),
    new THREE.Vector3(-3,    0, -22),
    new THREE.Vector3(-3,    0, -30),
    new THREE.Vector3(-3,    0, -36),
    new THREE.Vector3(-3,    0,  -46),
    new THREE.Vector3( -3,   0,  -57),
    new THREE.Vector3( -3, 0,-64),
    new THREE.Vector3( -3, 0,-72),

    new THREE.Vector3( -3,   0,  -80),
    new THREE.Vector3( -3, 0,-87),
    new THREE.Vector3( -3, 0,-94),
    new THREE.Vector3( -3, 0,-99),
    ]);

    // ─────────────────────────────────────────────────
    // SCROLL STATE
    // ─────────────────────────────────────────────────
    
    let smLookAt   = new THREE.Vector3();
    let smLookAtTgt= new THREE.Vector3();
    let hasScrolled = false;

    smLookAt.copy(lookPath.getPoint(0));
    smLookAtTgt.copy(smLookAt);

    function easeInOutQuart(t) {
    return t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2,4)/2;
    }




    function smoothFade(t, start, end) {
    const fadeIn = THREE.MathUtils.smoothstep(t, start, start + 0.08);
    const fadeOut = 1.0 - THREE.MathUtils.smoothstep(t, end - 0.08, end);
    return fadeIn * fadeOut;
    }

    // Console log for tweaking animation
    let lastLoggedT = -1;

    function logT(t) {
    const rounded = Math.round(t * 1000) / 1000;

    if (rounded !== lastLoggedT) {
        console.log("t:", rounded);
        lastLoggedT = rounded;
    }
    }

    // ─────────────────────────────────────────────────
    // TIMING CONTROL
    // ─────────────────────────────────────────────────


    gsap.set(dom.storyTitle,{opacity:0, filter: "blur(3px)"});
    const Tl_TitleStory= gsap.timeline({paused: true});
        Tl_TitleStory.to(dom.storyTitle,{
            filter: "blur(0px)",
            duration: 0.5,
            ease: "sine.inOut"
        })
        
    gsap.set("#canvas-wrapper",{opacity:0});
        
    const timeController = { t: 0 };
    const tl = gsap.timeline({
    scrollTrigger: {
        // trigger: dom.storySection,
        trigger: "#loveStoryTrack",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        // pin: true, // Pinning is handled by the parent container's CSS
        // pinSpacing: false,
        // markers: true, // Removed for production
        // anticipatePin: 1
    }
    });

    const GsapEase = "sine.inOut";

    tl.to(dom.storyTitle,{
    opacity: 1,
    duration: 0.8,
    ease: "none"
    });

    tl.to(Tl_TitleStory, {
    progress: 1,
    duration: 1,
    ease: "none"
    }, 0.3);

    tl.to(dom.storyTitle,{
    opacity: 0,
    duration: 1.2,
    delay: 0.2,
    ease: "none"
    });
        
    // base progression
    tl.to(timeController, {
    t: 0.0,
    duration: 0.5,
    ease: GsapEase
    }, ">-2");

    tl.to("#canvas-wrapper",{
    opacity: 1,
    duration: 1,
    ease: "none"
    },">-0.2");

    // 🎯 slow-mo around first text
    tl.to(timeController, {
    t: 0.16,
    duration: 2, // longer duration = slower motion
    ease: GsapEase
    },">-0.5");

    // move faster again
    tl.to(timeController, {
    t: 0.21,
    duration: 1.7,
    ease: GsapEase
    });

    // 🎯 slow-mo second text
    tl.to(timeController, {
    t: 0.365,
    duration: 2,
    ease: GsapEase
    });

    // move
    tl.to(timeController, {
    t: 0.49,
    duration: 1,
    ease: GsapEase
    });

    // 🎯 slow-mo third text
    tl.to(timeController, {
    t: 0.64,
    duration: 3.5,
    ease: GsapEase
    });

    // finish
    tl.to(timeController, {
    t: 0.79,
    duration: 2,
    ease: "none"
    });

        
    // Transition section
    tl.to(dom.storySection, {
    "--r-gold": "100%",
    "--stop-stag": "10%",
    duration: 1.4
    }, "startTrans");

    /* ✨ highlight (fastest) */
    tl.to(dom.storySection, {
    "--r-highlight": "20%",
    duration: 1.3
    }, "startTrans+=0.05");

    /* 🟡 gold */


    /* 🌸 pink */
    tl.to(dom.storySection, {
    "--r-pink": "150%",
    duration: 1.5
    }, "startTrans+=0.12");

    /* 💜 violet */
    tl.to(dom.storySection, {
    "--r-violet": "170%",
    duration: 1.6
    }, "startTrans+=0.2");

    /* BASE MASK (drives everything) */
    tl.to(dom.storySection, {
    "--reveal": "100%",
    "--stop": "5%",
    ease: "none",
    duration: 1,
    }, "startTrans+=0.3");
    // ─────────────────────────────────────────────────
    // ANIMATE
    // ─────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let time = 0;
    const _camTarget = new THREE.Vector3();
    const _lookTarget = new THREE.Vector3();


    let isRendering = false;

    function animate() {
    if (!isRendering) return;

    requestAnimationFrame(animate);

    const dt = clock.getDelta();
    time += dt;

    const t = timeController.t;

    // logT(t)

    camPath.getPoint(t, _camTarget);  
    
        camera.position.lerp(_camTarget, QUALITY === "low" ? 0.18 : 0.12);

    lookPath.getPoint(Math.min(t + 0.002, 1), _lookTarget);

    smLookAt.lerp(_lookTarget, QUALITY === "low" ? 0.1 : 0.06);

    camera.lookAt(smLookAt);

    const targetFOV = 62 - t * 22 + Math.sin(t * Math.PI) * 5;
    camera.fov += (targetFOV - camera.fov) * 0.04;
    camera.updateProjectionMatrix();

    const peakTs = [0.12, 0.5, 0.75];

    if (panels.length) {
    panels.forEach((mesh, i) => {
        const dist = Math.abs(t - peakTs[i]);
        const alpha = Math.max(0, 1 - dist / 0.28);
        mesh.material.uniforms.uAlpha.value += (alpha - mesh.material.uniforms.uAlpha.value) * 0.07;
        mesh.rotation.y = PANEL_DATA[i].rotation.y + Math.sin(time*0.35 + i*1.2)*0.008;
    });
    }

    if (imagePanels.length) {
    imagePanels.forEach((mesh, i) => {
    const timing = imageTimings[i];

    const visibility = smoothFade(t, timing.start, timing.end);

    // smooth interpolation (cinematic easing)
    mesh.material.uniforms.uAlpha.value +=
        (visibility - mesh.material.uniforms.uAlpha.value) * 0.08;

    // subtle float (keep this, it's nice)
    mesh.position.y += Math.sin(time * 0.6 + i) * 0.002;
    });
    }

    if (ribbon) {
    ribbon.material.uniforms.uTime.value = time;
    ribbon.material.uniforms.uScroll.value = t;
    }

    if (particles) {
        particles.material.uniforms.uTime.value = time;
    }

    skyMat.uniforms.uT.value     = t;
    skyMat.uniforms.uTime.value  = time;
    
    renderer.render(scene, camera);
    }

    console.log(
        document.querySelector("#canvas-wrapper")
            .getBoundingClientRect()
    );
        
    let assetsInitialized = false;
    let initializationPromise = null;

    function initializeAssets() {
        // If initialization is already in progress or done, return the existing promise
        if (initializationPromise) return initializationPromise;

        // Start the async initialization process
        initializationPromise = (async () => {
            // Use Promise.all to load fonts and images concurrently
            await Promise.all([
                createPanels(),
                createImagePanels()
            ]);

            // These are synchronous and fast, can run after async assets are ready
            createRibbon();
            createParticles();

            // "Warm up" the renderer by doing one render pass.
            // This compiles shaders and uploads textures to the GPU.
            renderer.render(scene, camera);

            assetsInitialized = true;
            console.log("Love Story assets initialized and pre-warmed.");
        })();

        return initializationPromise;
    }
    
    const storyST = ScrollTrigger.create({
        trigger: "#loveStoryTrack",
        start: "-50% top",
        endTrigger: ".afterStory",
        end: "bottom top",

        onEnter: () => {
            // Ensure assets are fully loaded, then start the render loop
            initializeAssets().then(() => {
                if (!isRendering) {
                    isRendering = true;
                    animate();
                }
            });
        },
        onLeave: () => { isRendering = false; },
        onEnterBack: () => {
            initializeAssets().then(() => {
                if (!isRendering) {
                    isRendering = true;
                    animate();
                }
            });
        },
        onLeaveBack: () => { isRendering = false; },
    });

    // This new, separate trigger pre-warms assets to prevent stutter.
    const prewarmST = ScrollTrigger.create({
        trigger: "#loveStoryTrack",
        start: "top bottom", // Fires as soon as the section enters the viewport
        once: true,          // Only runs once
        onEnter: () => {
            // Kick off the asset loading process early. We don't need to wait for it here.
            initializeAssets();
        }
    });


    // ─────────────────────────────────────────────────
    // TOUCH SCROLL
    // ─────────────────────────────────────────────────
    // The custom touch scroll handler has been removed.
    // GSAP's ScrollTrigger provides smooth scrubbing on touch devices out of the box,
    // and removing the manual handler prevents conflicts with the browser's native scrolling.

    // ─────────────────────────────────────────────────
    // RESIZE
    // ─────────────────────────────────────────────────
    window.addEventListener('resize', resizeRenderer, { passive: true });
    // window.addEventListener('orientationchange', resizeRenderer);

    // window.visualViewport?.addEventListener('resize', resizeRenderer);

    function destroy() {

        // stop rendering
        isRendering = false;

        // remove panels
        panels.forEach(panel => {

            panel.geometry.dispose();
            panel.material.uniforms.uTex.value.dispose();
            panel.material.dispose();

            scene.remove(panel);

        });

        panels.length = 0;

        // remove image panels
        imagePanels.forEach(panel => {

            panel.geometry.dispose();
            panel.material.uniforms.uTex.value.dispose();
            panel.material.dispose();

            scene.remove(panel);

        });

        imagePanels.length = 0;

        // remove ribbon
        if (ribbon) {

            ribbon.geometry.dispose();
            ribbon.material.dispose();

            scene.remove(ribbon);

            ribbon = null;

        }

        if (particles) {
            particles.geometry.dispose();
            particles.material.dispose();
            scene.remove(particles);
            particles = null;
        }

        renderer.forceContextLoss();
        renderer.dispose();
        storyST.kill();
        prewarmST.kill();
        window.removeEventListener("resize", resizeRenderer);

    }

    Invitation.effects.loveStory.destroy = destroy;

};

})();