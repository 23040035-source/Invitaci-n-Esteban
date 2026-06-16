/* =====================================================
INVITACIÓN DIGITAL PREMIUM
ESTEBAN ESPITIA VALERO
script.js
===================================================== */

/* =====================================================
VARIABLES GLOBALES
===================================================== */

let player;
let musicPlaying = false;

/* =====================================================
LOADER
===================================================== */

window.addEventListener("load", () => {


setTimeout(() => {

    const loader = document.getElementById("loader");

    if (loader) {
        loader.style.opacity = "0";

        setTimeout(() => {
            loader.style.display = "none";
        }, 600);
    }

}, 2000);


});

/* =====================================================
APERTURA DEL SOBRE
===================================================== */

const openButton = document.getElementById("openInvitation");

if (openButton) {


openButton.addEventListener("click", () => {

    const envelopeSection =
        document.getElementById("envelope-section");

    const invitation =
        document.getElementById("invitation");

    const musicButton =
        document.getElementById("musicButton");

    envelopeSection.style.transition =
        "all .8s ease";

    envelopeSection.style.opacity = "0";

    setTimeout(() => {

        envelopeSection.style.display = "none";

        invitation.classList.remove("hidden");

        musicButton.classList.remove("hidden");

        iniciarMusica();

        iniciarScrollAnimations();

        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }, 300);

    }, 800);

});


}

/* =====================================================
CUENTA REGRESIVA
===================================================== */

const eventDate = new Date(
"July 04, 2026 15:00:00"
).getTime();

function updateCountdown() {


const now = new Date().getTime();

const distance = eventDate - now;

if (distance <= 0) {

    document.getElementById("days").innerText = "00";
    document.getElementById("hours").innerText = "00";
    document.getElementById("minutes").innerText = "00";
    document.getElementById("seconds").innerText = "00";

    return;
}

const days =
    Math.floor(distance / (1000 * 60 * 60 * 24));

const hours =
    Math.floor(
        (distance %
            (1000 * 60 * 60 * 24))
        /
        (1000 * 60 * 60)
    );

const minutes =
    Math.floor(
        (distance %
            (1000 * 60 * 60))
        /
        (1000 * 60)
    );

const seconds =
    Math.floor(
        (distance %
            (1000 * 60))
        /
        1000
    );

document.getElementById("days").innerText =
    String(days).padStart(2, "0");

document.getElementById("hours").innerText =
    String(hours).padStart(2, "0");

document.getElementById("minutes").innerText =
    String(minutes).padStart(2, "0");

document.getElementById("seconds").innerText =
    String(seconds).padStart(2, "0");


}

setInterval(updateCountdown, 1000);

updateCountdown();

/* =====================================================
ANIMACIONES DE SCROLL
===================================================== */

function iniciarScrollAnimations() {


const elementos =
    document.querySelectorAll(".fade-in");

const observer =
    new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                }

            });

        },
        {
            threshold: 0.15
        }
    );

elementos.forEach((el) => {
    observer.observe(el);
});


}

/* =====================================================
YOUTUBE API
===================================================== */

function onYouTubeIframeAPIReady() {


player = new YT.Player(
    "youtube-player",
    {
        height: "0",
        width: "0",

        videoId: "udXsTQarNQg",

        playerVars: {

            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1

        },

        events: {

            onReady: () => {
                console.log(
                    "YouTube listo"
                );
            }

        }

    }
);


}

/* =====================================================
INICIAR MÚSICA
===================================================== */

function iniciarMusica() {


if (!player) return;

try {

    player.playVideo();

    musicPlaying = true;

    actualizarBotonMusica();

} catch (error) {

    mostrarBotonActivar();

}


}

/* =====================================================
BOTÓN ACTIVAR MÚSICA
===================================================== */

function mostrarBotonActivar() {


const btn =
    document.getElementById("musicButton");

btn.innerHTML = "▶";

btn.classList.remove("hidden");


}

/* =====================================================
BOTÓN PLAY / PAUSE
===================================================== */

const musicButton =
document.getElementById("musicButton");

if (musicButton) {


musicButton.addEventListener("click", () => {

    if (!player) return;

    try {

        if (musicPlaying) {

            player.pauseVideo();

            musicPlaying = false;

        } else {

            player.playVideo();

            musicPlaying = true;

        }

        actualizarBotonMusica();

    } catch (error) {

        console.error(error);

    }

});


}

function actualizarBotonMusica() {


const btn =
    document.getElementById("musicButton");

if (!btn) return;

btn.innerHTML =
    musicPlaying ? "⏸" : "▶";


}

/* =====================================================
FORMULARIO RSVP
===================================================== */

const rsvpForm =
document.getElementById("rsvpForm");

if (rsvpForm) {


rsvpForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const nombre =
            document
                .getElementById("nombre")
                .value
                .trim();

        const asistentes =
            document
                .getElementById("asistentes")
                .value;

        const responseMessage =
            document.getElementById(
                "responseMessage"
            );

        if (
            nombre.length < 2
        ) {

            responseMessage.innerHTML =
                "Ingresa un nombre válido.";

            responseMessage.style.color =
                "red";

            return;
        }

        if (
            asistentes < 1 ||
            asistentes > 20
        ) {

            responseMessage.innerHTML =
                "Cantidad inválida.";

            responseMessage.style.color =
                "red";

            return;
        }

        try {

            responseMessage.innerHTML =
                "Enviando...";

            responseMessage.style.color =
                "#6f4e37";

            const response =
                await fetch(
                    "/confirmar",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                nombre,
                                asistentes
                            })
                    }
                );

            const data =
                await response.json();

            if (
                data.success
            ) {

                responseMessage.innerHTML =
                    "¡Gracias por confirmar tu asistencia!";

                responseMessage.style.color =
                    "green";

                rsvpForm.reset();

            } else {

                responseMessage.innerHTML =
                    data.message ||
                    "Ocurrió un error";

                responseMessage.style.color =
                    "red";

            }

        } catch (error) {

            console.error(error);

            responseMessage.innerHTML =
                "No fue posible conectar con el servidor.";

            responseMessage.style.color =
                "red";

        }

    }
);


}

/* =====================================================
BOTÓN GOOGLE MAPS (RESPALDO)
===================================================== */

document
.querySelectorAll("a[href*='maps']")
.forEach((link) => {


    link.addEventListener(
        "click",
        () => {

            console.log(
                "Abriendo Google Maps..."
            );

        }
    );

});


/* =====================================================
PREVENIR DOBLE ENVÍO
===================================================== */

let enviando = false;

if (rsvpForm) {


rsvpForm.addEventListener(
    "submit",
    () => {

        if (enviando)
            return false;

        enviando = true;

        setTimeout(() => {
            enviando = false;
        }, 3000);

    }
);


}

/* =====================================================
EFECTO SUAVE EN BOTONES
===================================================== */

document
.querySelectorAll(
"button, .btn-primary"
)
.forEach((btn) => {


    btn.addEventListener(
        "mouseenter",
        () => {

            btn.style.transform =
                "translateY(-2px)";

        }
    );

    btn.addEventListener(
        "mouseleave",
        () => {

            btn.style.transform =
                "translateY(0)";

        }
    );

});




console.log(`
=================================
INVITACIÓN DIGITAL PREMIUM
ESTEBAN ESPITIA VALERO
Cumpleaños #3
04 JULIO 2026
=================================
`);

