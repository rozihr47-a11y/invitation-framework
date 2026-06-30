/**
 * Invitation Framework
 * Horizontal Scroll Module
 */

(function () {

    const Invitation = window.Invitation;

    Invitation.modules.horizontalScroll =
        Invitation.modules.horizontalScroll || {};

    //==================================
    // Public API
    //==================================

    Invitation.modules.horizontalScroll.init = function () {

        gsap.registerPlugin(ScrollTrigger);

        const races =
            document.querySelector(".races");

        if (!races) return;

        console.log(races.offsetWidth);

        function ScrollAmount() {

            console.log("getScrollAmount called");

            const racesWidth =
                races.scrollWidth;

            return -(racesWidth - window.innerWidth);

        }

        const tl_horizontal =
            gsap.timeline();

        tl_horizontal

            .to({}, {
                duration: 1
            })

            .to(races, {
                x: -100,
                ease: "none",
                duration: 7
            })

            .to({}, {
                duration: 1
            });

        ScrollTrigger.create({

            trigger: ".horizontal-wrap",

            start: "top top",

            end: "+=1000",

            pin: true,

            scrub: 1,

            animation: tl_horizontal,

            invalidateOnRefresh: true,

            markers: true

        });

    };

})();