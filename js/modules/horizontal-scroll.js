/**
 * Invitation Framework
 * Horizontal Scroll Module (With Speed Control)
 */
(function () {
    const Invitation = window.Invitation || { modules: {} };
    Invitation.modules.horizontalScroll = Invitation.modules.horizontalScroll || {};

    Invitation.modules.horizontalScroll.init = function () {
        gsap.registerPlugin(ScrollTrigger);

        const races = document.querySelector(".races");
        const scrollTrack = document.querySelector(".scroll-track");

        if (!races || !scrollTrack) return; 

        // --- SPEED CONTROL ---
        // 1 = Normal (1px scrolled down = 1px moved left)
        // 2 = Slower (Requires twice as much vertical scrolling)
        // 0.5 = Faster (Requires half as much vertical scrolling)
        const speedMultiplier = 1.5; 
        
        const getScrollAmount = () => races.scrollWidth - window.innerWidth;

        const syncTrackHeight = () => {
            const scrollAmount = getScrollAmount();
            if (scrollAmount > 0) {
                // We multiply the scrollAmount by our speed variable
                scrollTrack.style.height = `${(scrollAmount * speedMultiplier) + window.innerHeight}px`;
            } else {
                scrollTrack.style.height = "100vh";
            }
        };

        syncTrackHeight();

        gsap.to(races, {
            x: () => -getScrollAmount(), 
            ease: "none",
            scrollTrigger: {
                trigger: scrollTrack,
                start: "5% top",
                end: "90% bottom", 
                scrub: 1, // Keep this at 1 for visual smoothness, it does NOT control overall speed
                invalidateOnRefresh: true,
                markers: false
            }
        });

        const resizeObserver = new ResizeObserver(() => {
            syncTrackHeight();       
            ScrollTrigger.refresh(); 
        });
        
        resizeObserver.observe(races);

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