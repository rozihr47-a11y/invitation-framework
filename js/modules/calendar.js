/**
 * Invitation Framework
 * Calendar Module
 */

(function () {

    const Invitation = window.Invitation;

    Invitation.modules.calendar =
        Invitation.modules.calendar || {};

    //==================================
    // Private Functions
    //==================================

    function toGoogleDate(date, time) {

        return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;

    }

    //==================================
    // Public API
    //==================================

    Invitation.modules.calendar.init = function () {

        const widget = Invitation.dom.calendarWidget;

        if (!widget) return;

        const btn = Invitation.dom.calendarButton;

        btn.addEventListener("click", () => {

            widget.classList.toggle("open");

        });

        document.addEventListener("click", (e) => {

            if (!widget.contains(e.target)) {

                widget.classList.remove("open");

            }

        });

        // Read data attributes

        const name = widget.dataset.name;
        const description = widget.dataset.description;
        const location = widget.dataset.location;
        const startDate = widget.dataset.startDate;
        const startTime = widget.dataset.startTime;
        const endDate = widget.dataset.endDate;
        const endTime = widget.dataset.endTime;
        const timeZone = widget.dataset.timeZone;

        const gStart =
            toGoogleDate(startDate, startTime);

        const gEnd =
            toGoogleDate(endDate, endTime);

        // Google Calendar

        const googleURL =
            "https://calendar.google.com/calendar/render?" +
            new URLSearchParams({

                action: "TEMPLATE",

                text: name,

                details: description,

                location: location,

                dates: `${gStart}/${gEnd}`,

                ctz: timeZone

            }).toString();

        Invitation.dom.googleCalendar.href =
            googleURL;

        // Apple Calendar (.ics)

        const icsData =
`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;TZID=${timeZone}:${gStart}
DTEND;TZID=${timeZone}:${gEnd}
SUMMARY:${name}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

        const blob =
            new Blob([icsData], {
                type: "text/calendar"
            });

        const icsURL =
            URL.createObjectURL(blob);

        Invitation.dom.appleCalendar.href =
            icsURL;

        Invitation.dom.appleCalendar.download =
            `${name}.ics`;

    };

})();