/**
 * Invitation Framework
 * Popover Module
 */

(function () {

    const Invitation = window.Invitation;

    Invitation.modules.popover =
        Invitation.modules.popover || {};

    //==================================
    // Public API
    //==================================

    Invitation.modules.popover.init = function () {

        const pop = Invitation.dom.popover;

        if (!pop) return;

        document.addEventListener("click", (e) => {

            if (e.target.matches("[data-action='open-pop']")) {

                pop.showPopover();

            }

            if (e.target.matches("[data-action='close-pop']")) {

                pop.hidePopover();

            }

        });

    };

})();