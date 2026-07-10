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

  gsap.set(".daughterTxt",{
    scale: 0.5,
    // filter: "blur(5px)",
    opacity:0
  });

  gsap.set(".Arro_daugL",{
    width: "10%",
    x: "-150%",
    opacity:0
  });

  gsap.set(".Arro_daugR",{
    width: "10%",
    x: "150%",
    opacity:0
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
    filter: "blur(3px)"
  });

// <!-- ================================================== -->
// Set daugToSon_changing()
// <!-- ================================================== -->
  gsap.set(".sonOfTxt",{
    // position: "absolute",
    autoAlpha: 0,
    scale: 0.5,
    y: -2,
    // rotationX: -90
  });

  gsap.set(".ortuGrom",{
    position: "absolute",
    autoAlpha: 0,
    y: "40%"
  });

  gsap.set(".igGrom",{
    position: "absolute",
    pointerEvents: "none",
    y: -1.5,
    autoAlpha:0
  });
// <!-- ================================================== -->


function daughtersOf() {
  
  const Daugthers_Tl= gsap.timeline({
    defaults:{
      duration: 2,
      ease: "power3.out"
    }
  });

  Daugthers_Tl.to (".daughterTxt",{
    scale: 1,
    // filter: "blur(0px)",
    opacity:1,
  }, "startDaug")

  .to(".Arro_daugL, .Arro_daugR", {
    width: "30%",
    x: 0,
    opacity:1
  }, "startDaug=0")

  .to(".namaOrtu_Wrap", {
    y:0,
    opacity: 1,
  }, "startDaug=0")

  return Daugthers_Tl;
}

// Animation For "The Bride" to "the groom" changing
function brideTo_groom () {

const brideToGrom_Tl = gsap.timeline({
  paused: true,
  defaults:{ overwrite: "auto" }
});

// FADE OUT "THE BRIDE"
brideToGrom_Tl.to(".tBrideTxt .charH", {
  autoAlpha: 0,
  y: 15,
  skewX: 40,
  rotationX: -90,
  color: "yellow",
  stagger: 0.07,
  duration: 0.8,
  ease: "power4.in"
})
  
.to(".tGroomTxt",{
    autoAlpha:1,
    duration:0.01
},"startBride-groom")

.to(Grom_txt.chars,{
    autoAlpha: 1,
    y: 0,
    skewX: 0,
    rotationX: 0,
    color: "rgb(153 102 62 / 1)",
    stagger: 0.07,
    duration: 0.8,
    ease: "power4.out"
  },"startBride-groom");

  return brideToGrom_Tl;
}

// Animation for the couple name changing
function coupleName_change () {
  
const nameChange_Tl = gsap.timeline({
  paused: true,
  defaults:{ overwrite: "auto" }
});

// FADE OUT "THE BRIDE"
nameChange_Tl.to(".coupleName .charH", {
  autoAlpha: 0,
  x: "100%",
  skewX: 15,
  color: "yellow",
  // filter: "blur(8px)",
  // once: true,
  stagger: {
    amount: 1,
    from: "start"
  },
  duration: 2,
  ease: "power4.in"
})

// FADE IN 
.to(".coupleName_grom", { 
    autoAlpha: 1, 
    duration: 0.01 },"startNameCouple")
  
.to(nameGroom_txt.chars,{
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

  },"startNameCouple");

  return nameChange_Tl;
}

// animation for daugther of to son of changing
function daugToSon_changing() {

  const DaugFadeout_tl = gsap.timeline({
    paused: true,
    delay: 4,
    duration: 5,
    ease: "sine.out"
  });

  DaugFadeout_tl
  .to(".daughterTxt",{
    scale: 0.5,
    autoAlpha: 0
  }, 0)

  .to(".Arro_daugL",{
    x: "17%",
  }, 0)


  .to(".Arro_daugR",{
    x: "-17%",
  }, 0)
    
  .to(".sonOfTxt",{
    autoAlpha: 1,
    scale: 1,
    y: 0,
    // rotationX: 0
  }, 0.1)

  .to(".ortuBride",{
    autoAlpha: 0,
    scale: 0.7,
    y: "15%"
  }, 0.5)
    
  .to(".ortuGrom",{
    autoAlpha: 1,
    y: 0    
  }, 0.6)

  .to(".igBride", {
    y: 1,
    autoAlpha:0,
    pointerEvents: "none"
  }, 0.8)

  .to(".igGrom", {
    y: 0,
    autoAlpha:1,
    pointerEvents: "auto"
  }, 0.88);

return DaugFadeout_tl 
}