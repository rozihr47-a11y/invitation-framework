document.addEventListener("DOMContentLoaded", () => {

    window.Invitation.init();

    if (window.Invitation.modules.comments?.init) {
        window.Invitation.modules.comments.init();
    }

});