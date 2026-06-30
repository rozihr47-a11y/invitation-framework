/**
 * Invitation Framework
 * DOM Cache
 */

(function () {

    const dom = window.Invitation.dom;

    /**
     * Cache shared DOM elements.
     *
     * Every element here may not exist on every invitation template.
     * Always allow null values.
     */
    dom.cache = function () {

        // =========================
        // Comments
        // =========================

        this.comments =
            document.getElementById("comments");

        this.commentsPagination =
            document.getElementById("comments-pagination");

        this.commentsTrigger =
            document.getElementById("comments-trigger");

        this.floatingWishBtn =
            document.getElementById("floatingWishBtn");

        this.floatingShowLess =
            document.getElementById("floatingShowLess");

        // =========================
        // Calendar
        // =========================

        this.calendarWidget =
            document.querySelector(".add-to-calendar");

        this.calendarButton =
            this.calendarWidget?.querySelector(".atc-btn");

        this.googleCalendar =
            this.calendarWidget?.querySelector(".google-cal");

        this.appleCalendar =
            this.calendarWidget?.querySelector(".apple-cal");
            
    };

})();