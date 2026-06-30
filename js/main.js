document.addEventListener("DOMContentLoaded", () => {

    window.Invitation.init();

    if (window.Invitation.modules.comments?.init) {
        window.Invitation.modules.comments.init();
    }

    if (window.Invitation.modules.calendar?.init) {
        window.Invitation.modules.calendar.init();
    }

});