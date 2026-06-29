/**
 * Invitation Framework
 * Bootstrap
 */

(function () {

    if (window.Invitation) {
        console.warn("Invitation Framework already initialized.");
        return;
    }

    window.Invitation = {

        version: "1.0.0",

        initialized: false,

        dom: {},

        state: {},

        config: {},

        utils: {},

        modules: {},

        debug: {}

    };

    console.log("✅ Invitation Bootstrap Loaded");

})();