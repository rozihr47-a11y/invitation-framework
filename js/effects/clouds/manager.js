(function () {

    const Invitation = window.Invitation;

    Invitation.effects =
        Invitation.effects || {};

    Invitation.effects.clouds =
        Invitation.effects.clouds || {};

    // Create a global utility namespace if it doesn't exist
    Invitation.utils = Invitation.utils || {};

    /**
     * Determines the device performance tier ('low', 'mid', 'high')
     * This is now the single source of truth for quality settings across all effects.
     */
    Invitation.utils.getQualityTier = function () {
        // 1. Allow forcing a quality setting via URL parameter for testing
        const urlParams = new URLSearchParams(window.location.search);
        const qualityOverride = urlParams.get('quality');
        if (qualityOverride === 'high' || qualityOverride === 'mid' || qualityOverride === 'low') {
            console.log(`Quality tier forced to: "${qualityOverride}" by URL parameter.`);
            return qualityOverride;
        }

        // 2. Heuristics-based detection
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4;
        const isMobile = matchMedia("(max-width:768px)").matches;

        // --- Tier 1: Low-End ---
        // Targets mobile devices with modest hardware (e.g., <= 4 cores OR <= 4GB RAM).
        // This provides a good baseline for older or budget phones.
        if (isMobile && (cores <= 4 || memory <= 4)) {
            return "low";
        }

        // --- Tier 2: Mid-Range ---
        // Catches all other mobile devices (which are generally less powerful than desktops)
        // and lower-to-mid range desktops/laptops.
        if (isMobile || cores <= 4 || memory < 16) {
            return "mid";
        }

        // --- Tier 3: High-End ---
        // Catches powerful desktops with many cores and ample memory.
        return "high";
    };

    Invitation.effects.clouds.init = function () {

        const THREE = window.__THREE__;

        if (!THREE) return;

        // All tiers use the instanced renderer — it is faster at every device level
        // (2 draw calls vs ~3,000) and renders more clouds with richer shading.
        Invitation.effects.clouds.instanced.init(THREE);

    };

})();