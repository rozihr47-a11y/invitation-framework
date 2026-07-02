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

        const races = document.querySelector(".races");

        function getScrollAmount() {
            let racesWidth = races.scrollWidth;
            return -(racesWidth - window.innerWidth);
        }

        const tl_horizontal = gsap.timeline();

        tl_horizontal.to({}, { duration: 1 }) // fake delay

        .to(races, {
        x: getScrollAmount,
        ease: "none",
        duration: 7,
        })

        .to({}, { duration: 1 });

        ScrollTrigger.create({
            trigger: ".horizontal-wrap",
            start: "top top",
            end: () => `+=${getScrollAmount() * -1}`,
            pin: true,
            scrub: 1,
            animation: tl_horizontal,
            invalidateOnRefresh: true,
            markers: false,
        });

    };

})();
