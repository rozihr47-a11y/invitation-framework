    
(function () {

    const Invitation = window.Invitation;

    Invitation.modules.comments =
        Invitation.modules.comments || {};

const sheetId = "13xLjhbICv4BGzHm1WCKom9Uof8A15g2axBjzTKbsVi0"; 
const gid = "234595483";

Invitation.utils.formatRelativeTime(date)

Invitation.utils.escapeHtml(str)

let commentsData = [];
let optimisticComments = [];

let lastCommentsFetch = 0;
const FETCH_COOLDOWN = 60000; // 30 sec

let currentPage = 1;
const commentsPerPage = 10;

let hasLoadedMore = false;

let loadMoreObserver = null;

let isKomSecVisible = false;
let isLoadMoreVisible = false;

async function loadComments() {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));

    let rows = json.table.rows || [];
    rows = rows.reverse();

    commentsData = rows.map(row => {
      const timestampStr = row.c[0]?.f || ""; // timestamp
      const name = row.c[1]?.v || "";          // name
      const association = (row.c[2]?.v || "").trim();   // association
      const comment = row.c[3]?.v || "";       // comment
      const response = row.c[4]?.v || "";      // admin response

      return { timestampStr, name, association, comment, response };
    });

    optimisticComments =
      optimisticComments.filter(opt => {
    
        return !commentsData.some(real =>
          real.name === opt.name &&
          real.comment === opt.comment
        );
    
      });

    const previousScroll = window.scrollY;
    
    renderComments();

window.scrollTo(0, previousScroll);
    
  } catch (err) {
    console.error("Error loading comments:", err);
    Invitation.dom.comments.innerHTML =
      "<p>⚠️ Could not load comments. Check internet connection or contact admin.</p>";
  }
}

function renderComments() {
  const container = Invitation.dom.comments;
  container.innerHTML = "";

  const start = 0;
  const end = currentPage * commentsPerPage;

  const mergedComments = [
    ...optimisticComments,
    ...commentsData
  ];
  
  const visibleComments =
    mergedComments.slice(start, end);

  visibleComments.forEach(item => {
    if (item.name && item.comment && item.timestampStr) {

      const dateObj = new Date(item.timestampStr);

      const formatted = isNaN(dateObj)
        ? Invitation.utils.escapeHtml(item.timestampStr)
        : Invitation.utils.formatRelativeTime(dateObj);

      const el = document.createElement("div");
      
      el.className = "comment-thread";

      el.innerHTML = `
      <div class="comment">
    
        <div class="comment-header">
          <strong>${Invitation.utils.escapeHtml(item.name)}</strong>
    
          ${
            item.association
              ? `<span class="separator"> | </span>
                 <span class="association">${Invitation.utils.escapeHtml(item.association)}</span>`
              : ""
          }
    
          <span class="date">${formatted}</span>
        </div>
    
        <p>${Invitation.utils.escapeHtml(item.comment)}</p>
    
      </div>
    
      ${
        item.response
          ? `
          <div class="admin-response">
    
            <div class="admin-response-header">
              <div class="header-plai">
                <strong>Eric & Farah</strong>
              
              </div>
    
              <span class="balas">Membalas</span>
            </div>
    
            <p><span class="reply-mention">@${Invitation.utils.escapeHtml(item.name)}</span>  ${Invitation.utils.escapeHtml(item.response)}</p>
</div>
          `
          : ""
      }
    `;

      container.appendChild(el);
    }
  });

  renderPaginationButtons();

  observeLoadMoreButton();

}

function renderPaginationButtons() {

  const pagination = Invitation.dom.commentsPagination;

  pagination.innerHTML = "";

  const totalVisible = currentPage * commentsPerPage;



  // LOAD MORE
  if (totalVisible < commentsData.length) {

    const moreBtn = document.createElement("button");
    
    moreBtn.id = "loadMoreBtn";
    moreBtn.className = "load-more-btn";

    moreBtn.innerText = "Load More";

     moreBtn.addEventListener("click", () => {
    
      currentPage++;
    
      hasLoadedMore = true;
    
      renderComments();
    
      observeLoadMoreButton();
    
    });

    pagination.appendChild(moreBtn);
  }
}



function observeLoadMoreButton() {

  const btn =
    document.getElementById("loadMoreBtn");

  if (loadMoreObserver) {
    loadMoreObserver.disconnect();
  }

  if (!btn) {

    isLoadMoreVisible = false;

    updateFloatingButtons();

    return;
  }

  loadMoreObserver =
    new IntersectionObserver(
      ([entry]) => {

        isLoadMoreVisible =
          entry.isIntersecting;

        updateFloatingButtons();

      },
      {
        threshold: 0.1
      }
    );

  loadMoreObserver.observe(btn);
}

function updateFloatingButtons() {

  const wishBtn =
    Invitation.dom.floatingWishBtn;

  const lessBtn =
    Invitation.dom.floatingShowLess;

  if (!wishBtn || !lessBtn) return;

  // BERIKAN UCAPAN

  wishBtn.classList.toggle(
    "visible",
    isKomSecVisible &&
    !isLoadMoreVisible
  );

  // SHOW LESS

  lessBtn.classList.toggle(
    "visible",
    hasLoadedMore &&
    isKomSecVisible &&
    !isLoadMoreVisible
  );

}

window.addEventListener("load", () => {

let commentInterval = null;

// function startCommentsPolling() {
//   if (commentInterval) return;

//   loadComments();

//   // commentInterval = setInterval(() => {
//   //   loadComments();
//   // }, 30000);

//   console.log("Comments polling START");
// }

function startCommentsPolling() {

  const now = Date.now();

  if (
    now - lastCommentsFetch >
    FETCH_COOLDOWN
  ) {

    lastCommentsFetch = now;

    loadComments();

    // console.log("Comments refreshed");
  }

}


function stopCommentsPolling() {
  clearInterval(commentInterval);
  commentInterval = null;

  // console.log("Comments polling STOP");
}



Invitation.dom.floatingShowLess.addEventListener("click", () => {

    currentPage = 1;
    
    hasLoadedMore = false;
    
    isLoadMoreVisible = false;

    
    if (loadMoreObserver) {
      loadMoreObserver.disconnect();
    }

    renderComments();
    updateFloatingButtons();

    Invitation.dom.floatingShowLess.classList.remove("visible");

    document
      .querySelector(".KomSec")
      .scrollIntoView({
        behavior: "smooth"
      });

});



//comment sentinel trigger
const komSecObserver = new IntersectionObserver(
  ([entry]) => {

      isKomSecVisible =
        entry.isIntersecting;

      updateFloatingButtons();

  },
  {
    rootMargin: "-30% 0px -30% 0px"
  }
);

komSecObserver.observe(
  Invitation.dom.commentsTrigger
);
  
ScrollTrigger.create({
  trigger: ".KomSec",
  start: "top bottom",
  end: "bottom 50%",
  // markers: true,

  onEnter: startCommentsPolling,
  onEnterBack: startCommentsPolling,

  onLeave: stopCommentsPolling,
  onLeaveBack: stopCommentsPolling
});

});

})();
