(function(){

const Invitation = window.Invitation;

Invitation.effects =
    Invitation.effects || {};

Invitation.effects.clouds =
    Invitation.effects.clouds || {};

function getDeviceTier(){

    const cores =
        navigator.hardwareConcurrency || 4;

    const memory =
        navigator.deviceMemory || 4;

    const isMobile =
        matchMedia("(max-width:768px)").matches;

    if(isMobile && (cores <= 4 || memory <= 4))
        return "low";

    if(cores <= 4 || memory <= 4)
        return "mid";

    return "high";

}

Invitation.effects.clouds.init = function(){

    const tier = getDeviceTier();

    const THREE = window.__THREE__;

    if(!THREE) return;

    console.log("Cloud tier:", tier);

    if(tier === "low"){

        Invitation.effects.clouds.instanced.init(THREE);

    }else{

        Invitation.effects.clouds.original.init(THREE);

    }

};

})();