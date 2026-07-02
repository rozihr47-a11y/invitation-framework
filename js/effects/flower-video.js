/**
 * Invitation Framework
 * Flower Video Effect
 */

(function () {

    const Invitation = window.Invitation;

    Invitation.effects =
        Invitation.effects || {};

    Invitation.effects.flowerVideo =
        Invitation.effects.flowerVideo || {};

    Invitation.effects.flowerVideo.init = function () {


        function waitForTHREE(cb) {
            if (window.__THREE__) cb(window.__THREE__);
            else requestAnimationFrame(() => waitForTHREE(cb));
        }

        waitForTHREE((THREE) => {


            function initFlower(container) {


                const video  = container.querySelector("video.packed");

                const canvas = container.querySelector("canvas");


            if (!video || !canvas) return;

            // ---- AUTOPLAY SAFETY ----
            video.play().catch(() => {
                document.body.addEventListener(
                "touchend",
                () => video.play(),
                // { once: true }
                );
            });

            let initialized = false;

            function initRenderer() {

                if (initialized) return;

                initialized = true;

                       const rect = container.getBoundingClientRect();
                        const dpr  = Math.min(window.devicePixelRatio, 1.5);

                        canvas.width  = rect.width  * dpr;
                        canvas.height = rect.height * dpr;

                        const renderer = new THREE.WebGLRenderer({
                        canvas,
                        alpha: true,
                        premultipliedAlpha: true,
                        antialias: false
                        });

                        renderer.setSize(canvas.width, canvas.height, false);
                        renderer.setPixelRatio(dpr);

                        const scene = new THREE.Scene();

                        const camera = new THREE.OrthographicCamera(
                        0, canvas.width,
                        canvas.height, 0,
                        -1, 1
                        );

                        const texture = new THREE.VideoTexture(video);
                        texture.minFilter = THREE.LinearFilter;
                        texture.magFilter = THREE.LinearFilter;
                        texture.generateMipmaps = false;

                        const material = new THREE.ShaderMaterial({
                        uniforms: {
                            videoTex: { value: texture },
                            gamma: { value: 1 }
                        },
                        vertexShader: `
                            varying vec2 vUv;
                            void main(){
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                            }
                        `,
                        fragmentShader: `
                            uniform sampler2D videoTex;
                            varying vec2 vUv;

                            void main() {

                            vec2 colorUV = vUv;
                            colorUV.x *= 0.5;

                            vec2 maskUV = vUv;
                            maskUV.x = maskUV.x * 0.5 + 0.5;

                            float mask = texture2D(videoTex, maskUV).r;

                            mask = smoothstep(0.2, 0.85, mask);
                            mask = clamp(mask + 0.02, 0.0, 1.0);

                            vec4 color = texture2D(videoTex, colorUV);

                            gl_FragColor = vec4(color.rgb, mask);
                            }
                        `,
                        transparent: true
                        });

                        const geometry = new THREE.PlaneGeometry(
                        canvas.width,
                        canvas.height
                        );

                        const mesh = new THREE.Mesh(geometry, material);
                        mesh.position.set(canvas.width / 2, canvas.height / 2, 0);
                        scene.add(mesh);

                function render() {
                requestAnimationFrame(render);

                if (!flowersPaused) {
                    texture.needsUpdate = true;
                }

                renderer.render(scene, camera);
                }

                let flowersPaused = false;
                const flowersClock = new THREE.Clock();

                        render();

                        ScrollTrigger.create({
                            trigger: ".nextSect_wraper",
                            start: "top top",

                            onEnter: () => {
                                flowersPaused = true;
                                video.pause(); // 🔥 THIS is the key
                            },

                            onLeaveBack: () => {
                                flowersPaused = false;
                                video.play();  // 🔥 resume playback
                                flowersClock.getDelta(); // reset timing
                            }
                            });

            }

            if (video.readyState >= 1) {

                initRenderer();

            } else {

                video.addEventListener(
                    "loadedmetadata",
                    initRenderer,
                    { once: true }
                );

            }
            
            }

            const flowers = document.querySelectorAll(".flower");

            flowers.forEach(initFlower);

        });

        

    };

})();