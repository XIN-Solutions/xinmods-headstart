/**
 * Cookiebar handler
 */
(function() {

    function wasAccepted() {
        return localStorage.getItem("cookie_accepted") === "true";
    }

    function setAccepted() {
        localStorage.setItem("cookie_accepted", "true");
    }


    document.addEventListener("DOMContentLoaded", () => {

        const el = document.querySelector("[data-cookie-accept]");
        const bar = el.closest(".c-cookiebar");

        // not accepted yet? show banner.
        if (!wasAccepted()) {
            bar.classList.remove("d-none");
        }

        // click on "ok"? set accepted and hide bar.
        el.addEventListener("click", (evt) => {
            bar.classList.add("d-none");
            setAccepted();
            evt.preventDefault();
        })
    });

})();
