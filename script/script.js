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
    const mainButton = document.getElementById('language-main-button');
    const languageOptions = document.getElementById('language-options');

    mainButton.addEventListener('click', function(event) {
        languageOptions.classList.toggle('show');
        event.stopPropagation();
    });

    // Close the language options if the user clicks anywhere outside of the selector
    document.addEventListener('click', function(event) {
        const isClickInside = languageOptions.contains(event.target) || mainButton.contains(event.target);
        if (!isClickInside && languageOptions.classList.contains('show')) {
            languageOptions.classList.remove('show');
        }
    });
}