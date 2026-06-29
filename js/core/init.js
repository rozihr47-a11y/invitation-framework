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