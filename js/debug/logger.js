Invitation.debug.log = function (...args) {

    if (!Invitation.debug.enabled) return;

    console.log("[Invitation]", ...args);

};