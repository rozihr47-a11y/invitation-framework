// function startInvitation() {

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

    if (window.Invitation.modules.gallery?.init) {
        window.Invitation.modules.gallery.init();
    }

    if (window.Invitation.modules.horizontalScroll?.init) {
        window.Invitation.modules.horizontalScroll.init();
    }

// }
