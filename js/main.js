document.addEventListener("DOMContentLoaded", () => {

    window.Invitation.init();

    if (window.Invitation.modules.comments?.init) {
        window.Invitation.modules.comments.init();
    }

    if (window.Invitation.modules.calendar?.init) {
        window.Invitation.modules.calendar.init();
    }

    if (window.Invitation.modules.popover?.init) {
        window.Invitation.modules.popover.init();
    }

});