/**
 * Invitation Framework
 * Generated File
 * Do NOT edit directly.
 */


// ======================================
// js/core/bootstrap.js
// ======================================

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


// ======================================
// js/core/config.js
// ======================================

/**
 * Global configuration
 */

Invitation.config = {

    debug: true,

    version: Invitation.version

};


// ======================================
// js/core/state.js
// ======================================

/**
 * Shared runtime state
 */

Invitation.state = {

    initialized: false,

    loading: false,

    device: null,

    scrollY: 0

};


// ======================================
// js/core/utils.js
// ======================================

/**
 * Shared utilities
 */

Invitation.utils = {};


// ======================================
// js/core/dom.js
// ======================================

/**
 * Invitation Framework
 * DOM Cache
 */

(function () {

    const dom = window.Invitation.dom;

    /**
     * Cache shared DOM elements.
     *
     * Every element here may not exist on every invitation template.
     * Always allow null values.
     */
    dom.cache = function () {

        // =========================
        // Comments
        // =========================

        this.comments =
            document.getElementById("comments");

        this.commentsPagination =
            document.getElementById("comments-pagination");

        this.commentsTrigger =
            document.getElementById("comments-trigger");

        this.floatingWishBtn =
            document.getElementById("floatingWishBtn");

        this.floatingShowLess =
            document.getElementById("floatingShowLess");

    };

})();


// ======================================
// js/core/init.js
// ======================================

/**
 * Invitation Framework
 * Initialization
 */

(function () {

    window.Invitation.init = function () {

        this.dom.cache();

        this.state.initialized = true;

        this.debug.log("Framework initialized.");

    };

})();


// ======================================
// js/debug/flags.js
// ======================================

Invitation.debug = {

    enabled: true,

    logInit: true,

    logScroll: true,

    logThree: true,

    showFPS: false

};


// ======================================
// js/debug/logger.js
// ======================================

Invitation.debug.log = function (...args) {

    if (!Invitation.debug.enabled) return;

    console.log("[Invitation]", ...args);

};


// ======================================
// js/main.js
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    window.Invitation.init();

});

