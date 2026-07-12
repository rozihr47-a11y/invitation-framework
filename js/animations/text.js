// Animation For daughter of Txt fade in

// # Text Splitter:
// <!-- ================================================== -->
let Grom_txt;

if (!document.querySelector(".tGroomTxt .charH")) {
  Grom_txt = textSplitter(document.querySelector(".tGroomTxt"));
} else {
  Grom_txt = {
    chars: document.querySelectorAll(".tGroomTxt .charH")
  };
}


let nameGroom_txt;

// prevent splitting twice
if (!document.querySelector(".coupleName_grom .charH")) {
  nameGroom_txt = textSplitter(document.querySelector(".coupleName_grom"));
} else {
  nameGroom_txt = {
    chars: document.querySelectorAll(".coupleName_grom .charH")
  };
}
// <!-- ================================================== -->


// # Initial State:
// <!-- ================================================== -->
// Set daughtersOf() 
// <!-- ================================================== -->

gsap.set(".daughterTxt", {
  scale: 0.5,
  // filter: "blur(5px)",
  opacity: 0
});

gsap.set(".Arro_daugL", {
  width: "10%",
  x: "-150%",
  opacity: 0
});

gsap.set(".Arro_daugR", {
  width: "10%",
  x: "150%",
  opacity: 0
});

gsap.set(".namaOrtu_Wrap", {
  y: "40%",
  opacity: 0,
});

// <!-- ================================================== -->
// Set brideTo_groom () 
// <!-- ================================================== -->



gsap.set(".tGroomTxt", {
  autoAlpha: 0,
  top: "auto"
});
gsap.set(Grom_txt.chars, {
  autoAlpha: 0,
  y: -15,
  skewX: -40,
  rotationX: -90,
  color: "yellow",
  willChange: "transform, opacity"
});
// <!-- ================================================== -->
// Set coupleName_change ()
// <!-- ================================================== -->
gsap.set(".coupleName_grom", {
  autoAlpha: 0,
  bottom: "auto"
});

gsap.set(nameGroom_txt.chars, {
  willChange: "filter, opacity, skew",
  display: "inline-block",
  opacity: 0,
  x: "-100%",
  skewX: -15,
});

// <!-- ================================================== -->
// Set daugToSon_changing()
// <!-- ================================================== -->
gsap.set(".sonOfTxt", {
  // position: "absolute",
  autoAlpha: 0,
  scale: 0.5,
  y: -2,
  // rotationX: -90
});

gsap.set(".ortuGrom", {
  position: "absolute",
  autoAlpha: 0,
  y: "40%"
});

gsap.set(".igGrom", {
  position: "absolute",
  pointerEvents: "none",
  y: -1.5,
  autoAlpha: 0
});
// <!-- ================================================== -->


function daughtersOf() {

  const Daugthers_Tl = gsap.timeline({
    defaults: {
      duration: 2,
      ease: "power3.out"
    }
  });

  Daugthers_Tl.to(".daughterTxt", {
    scale: 1,
    // filter: "blur(0px)",
    opacity: 1,
  }, "startDaug")

    .to(".Arro_daugL, .Arro_daugR", {
      width: "30%",
      x: 0,
      opacity: 1
    }, "startDaug=0")

    .to(".namaOrtu_Wrap", {
      y: 0,
      opacity: 1,
    }, "startDaug=0")

  return Daugthers_Tl;
}

// Animation For "The Bride" to "the groom" changing
function brideTo_groom() {

  const brideToGrom_Tl = gsap.timeline({
    paused: true,
    defaults: { overwrite: "auto" }
  });

  // FADE OUT "THE BRIDE"
  brideToGrom_Tl.fromTo(".tBrideTxt .charH", {
    autoAlpha: 1,
    y: 0,
    skewX: 0,
    rotationX: 0,
    color: "rgb(153 102 62 / 1)"
  }, {
    autoAlpha: 0,
    y: 15,
    skewX: 40,
    rotationX: -90,
    color: "yellow",
    stagger: 0.07,
    duration: 0.8,
    ease: "power4.in",
    immediateRender: false
  })

    .to(".tGroomTxt", {
      autoAlpha: 1,
      duration: 0.01
    }, "startBride-groom")

    .fromTo(Grom_txt.chars, {
      autoAlpha: 0,
      y: -15,
      skewX: -40,
      rotationX: -90,
      color: "yellow"
    }, {
      autoAlpha: 1,
      y: 0,
      skewX: 0,
      rotationX: 0,
      color: "rgb(153 102 62 / 1)",
      stagger: 0.07,
      duration: 0.8,
      ease: "power4.out",
      immediateRender: false
    }, "startBride-groom");

  return brideToGrom_Tl;
}

// Animation for the couple name changing
function coupleName_change() {

  const nameChange_Tl = gsap.timeline({
    paused: true,
    defaults: { overwrite: "auto" }
  });

  // FADE OUT "THE BRIDE"
  nameChange_Tl.fromTo(".coupleName .charH", {
    autoAlpha: 1,
    x: "0%",
    skewX: 0,
    filter: "blur(0px)",
    color: "#99663e"
  }, {
    autoAlpha: 0,
    x: "100%",
    skewX: 15,
    color: "yellow",
    stagger: {
      amount: 1,
      from: "start"
    },
    duration: 2,
    ease: "power4.in",
    immediateRender: false
  })

    // FADE IN 
    .to(".coupleName_grom", {
      autoAlpha: 1,
      duration: 0.01
    }, "startNameCouple")

    .fromTo(nameGroom_txt.chars, {
      opacity: 0,
      x: "-100%",
      skewX: -15,
      filter: "blur(3px)"
    }, {
      x: '0%',
      skewX: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.5,
      stagger: {
        amount: 1,
        from: "start"
      },
      ease: "power3.out",
      color: "#99663e",
      immediateRender: false
    }, "startNameCouple");

  return nameChange_Tl;
}

// animation for daugther of to son of changing
function daugToSon_changing() {

  const DaugFadeout_tl = gsap.timeline({
    paused: true,
    delay: 4, // Restore original delay
    defaults: { ease: "sine.out" }
  });

  DaugFadeout_tl
    .fromTo(".daughterTxt", {
      scale: 1,
      autoAlpha: 1
    }, {
      scale: 0.5,
      autoAlpha: 0,
      immediateRender: false
    }, 0)

    .fromTo(".Arro_daugL", {
      x: "0%"
    }, {
      x: "17%",
      immediateRender: false
    }, 0)

    .fromTo(".Arro_daugR", {
      x: "0%"
    }, {
      x: "-17%",
      immediateRender: false
    }, 0)

    .fromTo(".sonOfTxt", {
      autoAlpha: 0,
      scale: 0.5,
      y: -2
    }, {
      autoAlpha: 1,
      scale: 1,
      y: 0,
      immediateRender: false
    }, 0.1)

    .fromTo(".ortuBride", {
      autoAlpha: 1,
      scale: 1,
      y: "0%"
    }, {
      autoAlpha: 0,
      scale: 0.7,
      y: "15%",
      immediateRender: false
    }, 0.5)

    .fromTo(".ortuGrom", {
      autoAlpha: 0,
      y: "40%"
    }, {
      autoAlpha: 1,
      y: 0,
      immediateRender: false
    }, 0.6)

    .fromTo(".igBride", {
      y: 0,
      autoAlpha: 1,
      pointerEvents: "auto"
    }, {
      y: 1,
      autoAlpha: 0,
      pointerEvents: "none",
      immediateRender: false
    }, 0.8)

    .fromTo(".igGrom", {
      y: -1.5,
      autoAlpha: 0,
      pointerEvents: "none"
    }, {
      y: 0,
      autoAlpha: 1,
      pointerEvents: "auto",
      immediateRender: false
    }, 0.88);

  return DaugFadeout_tl
}