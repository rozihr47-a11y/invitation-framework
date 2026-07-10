function buildRays() {
  const wrap      = document.getElementById("raysWrap");
  const RAY_COUNT = 20;

  for (let i = 0; i < RAY_COUNT; i++) {
    const el_rays        = document.createElement("div");
    el_rays.className    = "ray";
    const baseAngle = gsap.utils.mapRange(0, RAY_COUNT - 1, -95, 95, i);

    // store baseAngle on the element so the animation can read it later
    el_rays.dataset.baseAngle = baseAngle;

    gsap.set(el_rays, { rotation: baseAngle, opacity: 0, scaleY: 0 });
    wrap.appendChild(el_rays);
  }
}

buildRays(); // call immediately with the rest of your DOM setup





function initRays() {
  const rays = document.querySelectorAll(".ray");
  const tl_rays   = gsap.timeline({paused:true});

  rays.forEach((el_rays) => {
    // const baseAngle  = parseFloat(el_rays.dataset.baseAngle);
    const startDelay = gsap.utils.random(0, 2.5);   // position in timeline, not delay
    const riseDur    = gsap.utils.random(2, 3.5);
    const breathDur  = gsap.utils.random(6, 12);
    // const shimmerDur = gsap.utils.random(3, 6);

    // Phase 1 — rise (positioned in timeline, fully reversible)
    // tl_rays.to(el_rays, {
    //   opacity: 1,
    //   scaleY:  0.8,
    //   duration: riseDur,
    //   ease:    "power2.out",
    //   stagger: {
    //     each: 0.15,
    //     from: "random"
    //   }
    // }, startDelay)  // <-- position, not delay

    // Phase 2 — breath (chained after rise, still in timeline)
    // tl_rays.fromTo(el_rays, { opacity: 0.5 }, {
    //   opacity: 1,
    //   duration: breathDur,
    //   ease:     "sine.inOut",
    //   yoyo:     true,
    //   repeat:   -1,         // repeat inside timeline is fine for play
    // }, startDelay + riseDur);

    // Phase 3 — shimmer (same — in timeline, reversible)
  //   tl_rays.to(el_rays, {
  //     opacity:  gsap.utils.random(0.4, 1),
  //     duration: shimmerDur,
  //     ease:     "sine.inOut",
  //     yoyo:     true,
  //     repeat:   -1, 
  //   }, startDelay + riseDur); // same start as breath
  });

  return tl_rays;
}