/**
 * Invitation Framework
 * Calendar Module
 *
 * All event data is defined here — no data-* attributes needed on HTML.
 *
 * Events are matched to widgets BY ORDER: the first event in the array
 * maps to the first .add-to-calendar widget on the page, the second to
 * the second, and so on.
 *
 * Required HTML structure per widget (no data-* attributes needed):
 *
 *   <div class="add-to-calendar">
 *       <button class="atc-btn">Add to Calendar</button>
 *       <div class="atc-dropdown">
 *           <a class="google-cal" target="_blank" rel="noopener">Google Calendar</a>
 *           <a class="apple-cal">Apple Calendar</a>
 *       </div>
 *   </div>
 */

(function () {

    const Invitation = window.Invitation;

    Invitation.modules.calendar =
        Invitation.modules.calendar || {};

    //==================================
    // Event Data
    // Order must match the order of
    // .add-to-calendar widgets on the page.
    //==================================

    const events = [

        {
            name: "Akad Nikah",
            description: "Akad nikah Eric dan Farah",
            location: "Masjid Al-Ikhlas, Jakarta",
            startDate: "2025-11-20",
            startTime: "08:00",
            endDate: "2025-11-20",
            endTime: "10:00",
            timeZone: "Asia/Jakarta",
        },

        {
            name: "Resepsi",
            description: "Resepsi Eric dan Farah",
            location: "Gedung Serbaguna",
            startDate: "2025-11-20",
            startTime: "10:00",
            endDate: "2025-11-20",
            endTime: "17:00",
            timeZone: "Asia/Makassar",
        },

        // Add more events here to match additional widgets on the page...

    ];

    //==================================
    // Private Functions
    //==================================

    function toGoogleDate(date, time) {

        return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;

    }

    function buildGoogleURL(event) {

        const gStart = toGoogleDate(event.startDate, event.startTime);
        const gEnd = toGoogleDate(event.endDate, event.endTime);

        return (
            "https://calendar.google.com/calendar/render?" +
            new URLSearchParams({
                action: "TEMPLATE",
                text: event.name,
                details: event.description,
                location: event.location,
                dates: `${gStart}/${gEnd}`,
                ctz: event.timeZone,
            }).toString()
        );

    }

    function buildICSURL(event) {

        const gStart = toGoogleDate(event.startDate, event.startTime);
        const gEnd = toGoogleDate(event.endDate, event.endTime);

        // ICS format is whitespace-sensitive — lines must start at column 0
        const icsData =
            `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;TZID=${event.timeZone}:${gStart}
DTEND;TZID=${event.timeZone}:${gEnd}
SUMMARY:${event.name}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsData], { type: "text/calendar" });

        return URL.createObjectURL(blob);

    }

    function initWidget(widget, index) {

        const event = events[index];

        if (!event) {

            console.warn(
                `[calendar.js] No event defined for widget at index ${index}. ` +
                `Add an entry to the events array in calendar.js.`
            );
            return;

        }

        // Toggle dropdown
        const btn = widget.querySelector(".atc-btn");

        if (!btn) {

            console.warn(
                `[calendar.js] No .atc-btn found inside widget at index ${index}.`
            );
            return;

        }

        btn.addEventListener("click", (e) => {

            e.stopPropagation();
            widget.classList.toggle("open");

        });

        // Close when clicking outside this widget
        document.addEventListener("click", (e) => {

            if (!widget.contains(e.target)) {

                widget.classList.remove("open");

            }

        });

        // Google Calendar
        const googleLink = widget.querySelector(".google-cal");

        if (googleLink) {

            googleLink.href = buildGoogleURL(event);

        }

        // Apple / ICS Calendar
        const appleLink = widget.querySelector(".apple-cal");

        if (appleLink) {

            appleLink.href = buildICSURL(event);
            appleLink.download = `${event.name}.ics`;

        }

    }

    //==================================
    // Public API
    //==================================

    Invitation.modules.calendar.init = function () {

        const widgets =
            document.querySelectorAll(".add-to-calendar");

        if (!widgets.length) return;

        widgets.forEach(initWidget);

    };

})();