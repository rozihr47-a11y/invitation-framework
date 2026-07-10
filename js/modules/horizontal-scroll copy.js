// // /**
// //  * Invitation Framework
// //  * Horizontal Scroll Module
// //  */

// // (function () {

// //     const Invitation = window.Invitation;

// //     Invitation.modules.horizontalScroll =
// //         Invitation.modules.horizontalScroll || {};

// //     //==================================
// //     // Public API
// //     //==================================

// //     Invitation.modules.horizontalScroll.init = function () {

// //         gsap.registerPlugin(ScrollTrigger);

// //         const races = document.querySelector(".races");

// //         function getScrollAmount() {
// //             let racesWidth = races.scrollWidth;
// //             return -(racesWidth - window.innerWidth);
// //         }

// //         // function getScrollAmount() {

// //         //     return -(races.scrollWidth - races.clientWidth);

// //         // }

// //         const tl_horizontal = gsap.timeline({
// //             defaults: {
// //                 ease: "none"
// //             }
// //         });

// //         tl_horizontal
// //         // .to({}, { duration: 1 })

// //         .to(races, {
// //             x: getScrollAmount,
// //             // duration: 7
// //         })
        
// //         // .to({}, { duration: 1 });

// //         ScrollTrigger.create({
// //             trigger: ".horizontal-wrap",
// //             start: "top top",
// //             end: () => `+=${getScrollAmount() * -1}`,
// //             // endTrigger: "#Horizontal-driver",
// //             // end: "bottom bottom",
// //             pin: true,
// //             // pinType: "transform",
// //             scrub: true,
// //             animation: tl_horizontal,
// //             invalidateOnRefresh: true,
// //             markers: false,   
// //         });

// //         window.addEventListener("load", () => {

// //             requestAnimationFrame(() => {

// //                 ScrollTrigger.refresh();

// //             });

// //         });

// //     };

// // })();

// /**
//  * Invitation Framework
//  * Horizontal Scroll Module
//  */
// (function () {
//     const Invitation = window.Invitation;
//     Invitation.modules.horizontalScroll = Invitation.modules.horizontalScroll || {};

//     Invitation.modules.horizontalScroll.init = function () {
//         gsap.registerPlugin(ScrollTrigger);

//         const races = document.querySelector(".races");

//         function getScrollAmount() {
//             let racesWidth = races.scrollWidth;
//             return -(racesWidth - window.innerWidth);
//         }

//         const tl_horizontal = gsap.timeline({
//             defaults: { ease: "none" }
//         });

//         tl_horizontal.to(races, {
//             x: getScrollAmount,
//         });
        
//         ScrollTrigger.create({
//             trigger: ".horizontal-trigger",
//             start: "top top",
//             end: () => `+=${getScrollAmount() * -1}`,
//             pin: true,
//             scrub: true, // or try scrub: 0.5 for smoother easing
//             animation: tl_horizontal,
//             invalidateOnRefresh: true,
//             // anticipatePin: 1, // Add this to prevent the "bounce"
//             markers: true,   
//         });

//         // Ensure refresh happens after ALL assets (like images) load
//         window.addEventListener("load", () => {
//             ScrollTrigger.refresh();
//         });
        
//         // Also good practice: refresh if the window resizes significantly
//         let timeout;
//         window.addEventListener("resize", () => {
//             clearTimeout(timeout);
//             timeout = setTimeout(() => ScrollTrigger.refresh(), 250);
//         });
//     };
// })();

/**
 * Invitation Framework
 * Horizontal Scroll Module (React-Safe Version)
 */
// (function () {
//     const Invitation = window.Invitation || { modules: {} };
//     Invitation.modules.horizontalScroll = Invitation.modules.horizontalScroll || {};

//     Invitation.modules.horizontalScroll.init = function () {
//         gsap.registerPlugin(ScrollTrigger);

//         const races = document.querySelector(".races");
//         const scrollTrack = document.querySelector(".scroll-track");

//         if (!races || !scrollTrack) return; // Failsafe

//         // We use a function here so it recalculates if the screen is resized
//         const getScrollAmount = () => -(races.scrollWidth - window.innerWidth);

//         gsap.to(races, {
//             x: getScrollAmount,
//             ease: "none",
//             scrollTrigger: {
//                 trigger: scrollTrack, // We trigger off the tall parent
//                 start: "5% top",
//                 end: "90% bottom", // Animation lasts exactly as long as the parent is tall
//                 scrub: 1, // '1' adds a tiny bit of smoothing to the scroll
//                 invalidateOnRefresh: true,
//                 markers: false
//                 // Notice there is NO pin: true here!
//             }
//         });

//         // Ensure recalculation after images load
//         window.addEventListener("load", () => {
//             ScrollTrigger.refresh();
//         });
//     };
    
//     // Initialize
//     // Invitation.modules.horizontalScroll.init();
// })();

/**
 * Invitation Framework
 * Horizontal Scroll Module (Dynamic Content Version)
 */
(function () {
    const Invitation = window.Invitation || { modules: {} };
    Invitation.modules.horizontalScroll = Invitation.modules.horizontalScroll || {};

    Invitation.modules.horizontalScroll.init = function () {
        gsap.registerPlugin(ScrollTrigger);

        const races = document.querySelector(".races");
        const scrollTrack = document.querySelector(".scroll-track");

        if (!races || !scrollTrack) return; 

        // 1. Calculate horizontal distance
        const getScrollAmount = () => races.scrollWidth - window.innerWidth;

        // 2. Dynamic Height Calculation for 1:1 Scroll Ratio
        const syncTrackHeight = () => {
            const scrollAmount = getScrollAmount();
            if (scrollAmount > 0) {
                // Track Height = Window Height + Horizontal Scroll Distance
                scrollTrack.style.height = `${scrollAmount + window.innerHeight}px`;
            } else {
                // If content is too small to scroll, just make it a normal section
                scrollTrack.style.height = "100vh";
            }
        };

        // Run calculation once on load
        syncTrackHeight();

        // 3. Set up the GSAP Animation
        gsap.to(races, {
            x: () => -getScrollAmount(), // Use a function here so it updates dynamically
            ease: "none",
            scrollTrigger: {
                trigger: scrollTrack,
                start: "5% top",
                end: "95% bottom", 
                scrub: 1,
                invalidateOnRefresh: true, // Crucial: forces GSAP to use the new x values on refresh
                markers: false
            }
        });

        // 4. The Magic: Watch for Dynamic React Changes
        // This observer triggers automatically whenever elements inside .races hide or show
        const resizeObserver = new ResizeObserver(() => {
            syncTrackHeight();       // Update the CSS height
            ScrollTrigger.refresh(); // Tell GSAP to recalculate everything
        });
        
        // Start watching the races container
        resizeObserver.observe(races);

        // 5. Cleanup on Window Resize
        let timeout;
        window.addEventListener("resize", () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                syncTrackHeight();
                ScrollTrigger.refresh();
            }, 100);
        });
    };
    
    // Invitation.modules.horizontalScroll.init();
})();