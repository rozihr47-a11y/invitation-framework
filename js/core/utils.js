/**
 * Shared utilities
 */

(function () {

    const Invitation = window.Invitation;

    Invitation.utils = Invitation.utils || {};

    Invitation.utils.formatRelativeTime = function (date) {

        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 10) return "Baru saja";
        if (diffSec < 60) return `${diffSec} detik yg lalu`;
        if (diffMin < 60) return `${diffMin} menit yg lalu`;
        if (diffHour < 24) return `${diffHour} jam yg lalu`;

        if (diffDay === 1) {
            return `Kemaren ${date.toLocaleTimeString("id", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            })}`;
        }

        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }).replace(",", " •");

    };

    Invitation.utils.escapeHtml = function (str) {

        if (!str && str !== 0) return "";

        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

    };

})();