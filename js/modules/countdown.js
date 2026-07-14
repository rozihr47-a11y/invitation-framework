(function () {

    const Invitation = window.Invitation;

    Invitation.modules.countDown =
        Invitation.modules.countDown || {};

    Invitation.modules.countDown.init = function () {

        gsap.set(".dream-countdown", { attr: { "data-target": "2026-12-08T05:00:00" } });

        const countdown = document.querySelector(".dream-countdown");
        // const countdown_jam = document.querySelector(".jam_wrap");
        const target = new Date(countdown.dataset.target).getTime();

        const els = {
            days: countdown.querySelector('[data-unit="days"]'),
            hours: countdown.querySelector('[data-unit="hours"]'),
            minutes: countdown.querySelector('[data-unit="minutes"]'),
            seconds: countdown.querySelector('[data-unit="seconds"]')
        };

        let previous = {};

        function animate(el) {

            gsap.fromTo(
                el,
                {
                    y: 18,
                    opacity: 0,
                    filter: "blur(10px)",
                    scale: .92
                },
                {
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    scale: 1,
                    duration: 1.4,
                    ease: "expo.out"
                }
            );

            gsap.fromTo(
                el,
                { textShadow: "0 0 0px rgba(255,255,255,0)" },
                {
                    textShadow: "0 0 25px rgba(255,255,255,.35)",
                    duration: .7,
                    yoyo: true,
                    repeat: 1
                }
            );
        }

        function update() {

            const now = Date.now();
            const diff = Math.max(0, target - now);

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            const values = {
                days: String(d).padStart(2, "0"),
                hours: String(h).padStart(2, "0"),
                minutes: String(m).padStart(2, "0"),
                seconds: String(s).padStart(2, "0")
            };

            Object.keys(values).forEach(key => {

                if (previous[key] !== values[key]) {

                    els[key].textContent = values[key];
                    animate(els[key]);

                    previous[key] = values[key];
                }
            });
        }

        update();
        setInterval(update, 1000);

    };

})();