function cloudSlide() {

  const cloudSlide_tl = gsap.timeline({
    // paused: true,
    ease: "power3.out",
  });

  cloudSlide_tl
  .from(".cloudFrame_L",{
    x: "-40%",
    opacity: 0,
    duration: 1.5,
  }, "startPlay")

  .from(".cloudFrame_R",{
    x: "40%",
    opacity: 0,
    duration: 1.5,
  }, "startPlay");

  return cloudSlide_tl;
  
}


function initFlowerWave() {
  const stems = document.querySelectorAll(".flowerStem");

  const Tl_FlowerWaving = gsap.timeline({paused:true});
  stems.forEach((stem) => {

    // Each stem gets its own random personality
    const swayAngle  = gsap.utils.random(4, 11);
    const duration   = gsap.utils.random(3, 6);
    const delay      = gsap.utils.random(0, 4);
    const yDrift     = gsap.utils.random(-3, 3);
    const scaleShift = gsap.utils.random(0.97, 1.01);
    const dir        = Math.random() > 0.5 ? 1 : -1;

    // Rotate from the base (transform-origin at bottom center)
    gsap.set(stem, { transformOrigin: "50% 100%" });

    // Main cinematic sway — ease in/out for romantic feel
    Tl_FlowerWaving.to(stem, {
      rotation: swayAngle * dir,
      scaleY:   scaleShift,
      y:        yDrift,
      duration,
      delay,
      ease:     "sine.inOut",
      yoyo:     true,
      repeat:   -1,
    }, 0)

    // Secondary micro-drift — offset phase for organic layering
    .to(stem, {
      rotation: (swayAngle * 0.3) * -dir,
      duration: duration * 0.6,
      delay:    delay + duration * 0.4,
      ease:     "sine.inOut",
      yoyo:     true,
      repeat:   -1,
    }, 0);

  });

  return Tl_FlowerWaving
}






function initFlowerGrowth() {
  // const wraps = document.querySelectorAll(".flowers_Wrap");
  const Tl_FlowerGrowth = gsap.timeline();

    const flowers = gsap.utils.toArray(".flowers_Wrap");

  gsap.set(flowers, {
    scale: 0.0,
    y: 40,
    opacity: 0,
    transformOrigin: "50% 100%" // grow from bottom like a stem
  });

  Tl_FlowerGrowth.to(flowers, {
    scale: 1,
    y: 0,
    opacity: 1,
    duration: 3,
    ease: "power3.out",
    stagger: {
      each: 0.15,
      from: "random" // random order
    }
  });

  return Tl_FlowerGrowth;
}