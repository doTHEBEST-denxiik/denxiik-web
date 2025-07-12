// Function to load content from another HTML file
function loadHTML(filename, elementId) {
    return fetch(filename)
        .then(response => {
            if (!response.ok) {
                // Log error if fetch was not successful (e.g., 404)
                throw new Error(`HTTP error! status: ${response.status} for ${filename}`);
            }
            return response.text();
        })
        .then(html => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
            } else {
                console.error(`Element with ID '${elementId}' not found for loading HTML from '${filename}'.`);
            }
        })
        .catch(error => {
            console.error('Error loading HTML fragment:', error);
            // Optionally, set a fallback message or handle the UI for failed fragments
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = `<p style="color: red;">Failed to load content for ${elementId}.</p>`;
            }
        });
}

function initializeLanguageOptions() {
    // Menu toggle
    document.querySelector('.menu-toggle').addEventListener('click', function () {
        document.querySelector('.nav-bar').classList.toggle('active');
    });

    const mainButton = document.getElementById('language-main-button');
    const languageOptions = document.getElementById('language-options');

    mainButton.addEventListener('click', function (event) {
        languageOptions.classList.toggle('show');
        event.stopPropagation();
    });

    // Close the language options if the user clicks anywhere outside of the selector
    document.addEventListener('click', function (event) {
        const isClickInside = languageOptions.contains(event.target) || mainButton.contains(event.target);
        if (!isClickInside && languageOptions.classList.contains('show')) {
            languageOptions.classList.remove('show');
        }
    });


    const floatingButtonContainer = document.querySelector('.floating-button-container');
    const mainFloatingButton = document.querySelector('.main-floating-button');

    mainFloatingButton.addEventListener('click', () => {
        floatingButtonContainer.classList.toggle('active');
    });

    // Close the list if the user clicks outside of the container
    window.addEventListener('click', (event) => {
        if (!floatingButtonContainer.contains(event.target)) {
            floatingButtonContainer.classList.remove('active');
        }
    });

    // Menu toggle
    document.querySelector('.menu-toggle').addEventListener('click', function () {
        document.querySelector('.nav-bar').classList.toggle('active');
    });

    // Contact functionality
    document.querySelectorAll("#emailButton, #emailContact").forEach(element => {
        element.addEventListener("click", function () {
            var email = "borisevich16102002@gmail.com";
            var subject = encodeURIComponent("Consulta");
            var body = encodeURIComponent("Hola,\n\nEstoy interesado en conocerte más.");

            var mailtoLink = "mailto:" + email + "?subject=" + subject + "&body=" + body;
            var gmailWebLink = "https://mail.google.com/mail/?view=cm&fs=1&to=" + email + "&su=" + subject + "&body=" + body;
            var gmailAppAndroid = "intent://compose?to=" + email + "&subject=" + subject + "&body=" + body + "#Intent;scheme=mailto;package=com.google.android.gm;end;";

            var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            var isAndroid = /Android/i.test(navigator.userAgent);

            if (isAndroid) {
                window.location.href = gmailAppAndroid;
            } else if (isIOS) {
                window.open(gmailWebLink, "_blank");
            } else {
                window.location.href = mailtoLink;
            }

            setTimeout(function () {
                if (confirm("¿No se abrió ningún cliente de correo? ¿Quieres abrir Gmail en su lugar?")) {
                    window.open(gmailWebLink, "_blank");
                }
            }, 2000);
        })
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const navBar = document.querySelector('.nav-bar');
    const dropdowns = document.querySelectorAll('.nav-bar .dropdown');

    if (menuToggle && navBar) {
        menuToggle.addEventListener('click', function () {
            navBar.classList.toggle('active');

            // Cerrar todos los desplegables cuando se alterna el menú principal
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        });
    } else {
        console.warn("No se encontró el botón de alternancia del menú o la barra de navegación. Revisa tu estructura HTML.");
    }

    // Añadir un listener de clic a cada desplegable para la vista móvil
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');
        if (dropdownLink) {
            dropdownLink.addEventListener('click', function (event) {
                // Comprobar si estamos en una pantalla pequeña
                if (window.innerWidth <= 1080) {
                    event.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
}