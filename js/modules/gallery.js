/**
 * Invitation Framework
 * Gallery Module
 */

(function () {

    const Invitation = window.Invitation;

    Invitation.modules.gallery =
        Invitation.modules.gallery || {};

    //==================================
    // Public API
    //==================================

    Invitation.modules.gallery.init = function () {

        const lightbox = GLightbox({
  selector: '.glightbox',

  touchNavigation: true,
  keyboardNavigation: true,
//   loop: true,
closeOnOutsideClick: true,
  openEffect: 'zoom',       // smooth cinematic feel
  closeEffect: 'fade',
  slideEffect: 'zoom',
  zoomable: true,
  dragToleranceY: 0,
//   draggable: true,           // minimal UI
  closeButton: true,
  autoplayVideos: true,
  plyr: {
 // Default not required to include
    config: {
      youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0
      }
    }
  },


});


lightbox.on('open', () => {
  // Prevent GSAP ScrollTrigger from bugging out when lightbox is active
  ScrollTrigger.refresh();
});

lightbox.on('close', () => {
  // Recalculate GSAP triggers once lightbox collapses
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
});


const isMobile = window.matchMedia("(max-width: 768px)").matches;

if (isMobile) {
//   document.querySelectorAll('.photo-frame a.glightbox').forEach(link => {
document.querySelectorAll('.photo-frame:not(.videoSec) a.glightbox').forEach(link => {

    const frame = link.closest('.photo-frame');
    let tapped = false;

    link.addEventListener('click', (e) => {
      
      // FIRST TAP → block GLightbox
      if (!tapped) {
        e.preventDefault();
        e.stopImmediatePropagation(); // 🔥 stronger than stopPropagation

        // reset others
        document.querySelectorAll('.photo-frame').forEach(f => {
          f.classList.remove('active');
        });

        frame.classList.add('active');
        tapped = true;

        setTimeout(() => tapped = false, 2000);
        return;
      }

      // SECOND TAP → allow GLightbox
      tapped = false;
      frame.classList.remove('active');

    }, true); // 🔥 THIS is the key (capture phase)
  });
}

// 🔥 Force behavior: click anywhere except image → close
lightbox.on('open', () => {
  const container = document.querySelector('.glightbox-container');

  container.addEventListener('click', (e) => {
    const clickedMedia =
        e.target.closest('.gslide-image img') ||
        e.target.closest('.gslide-video') ||
        e.target.closest('iframe');
    const clickedClose = e.target.closest('.gclose');
    const clickedNext = e.target.closest('.gnext');
    const clickedPrev = e.target.closest('.gprev');

    // ignore clicks on image, close, or navigation
    if (clickedMedia || clickedClose || clickedNext || clickedPrev) {
      return;
    }

    // otherwise → close
    lightbox.close();
  });
});

    };

})();