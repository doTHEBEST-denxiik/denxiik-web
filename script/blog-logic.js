const blogPostsContainer = document.getElementById('blogPostsContainer');
const singlePostContainer = document.getElementById('singlePostContainer');
const loadMoreButton = document.getElementById('loadMorePosts');

let allPosts = [];
let postsPerPage = 5;
let currentIndex = 0;
let currentLanguage = 'ukr'; // Default to Ukrainian

// UPDATED: A more robust way to check if we are on a single post page.
// It checks if the path is an HTML file but not the main 'index.html'.
const isSinglePostPage = window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('/index.html');


async function fetchPosts() {
    // Determine the current language from the URL path
    // Example: /ukr/blog/index.html or /es/blog/index.html or /va/blog/index.html
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments.includes('ukr')) {
        currentLanguage = 'ukr';
    } else if (pathSegments.includes('es')) {
        currentLanguage = 'es';
    } else if (pathSegments.includes('va')) { // Add Valencian language detection
        currentLanguage = 'va';
    }

    try {
        // UPDATED: Fetch posts from the language-specific data folder
        const response = await fetch(`../../data/${currentLanguage}/blog/posts.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allPosts = await response.json();
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (isSinglePostPage) {
            displaySinglePost();
        } else {
            displayPostsList();
        }

    } catch (error) {
        console.error("Error fetching blog posts:", error);
        let errorMessage = '';
        if (currentLanguage === 'ukr') {
            errorMessage = 'Не вдалося завантажити дописи. Спробуйте пізніше.';
        } else if (currentLanguage === 'es') {
            errorMessage = 'No se pudieron cargar las publicaciones. Inténtelo de nuevo más tarde.';
        } else if (currentLanguage === 'va') { // Add Valencian translation for error message
            errorMessage = 'No s\'han pogut carregar les publicacions. Torneu-ho a intentar més tard.';
        }

        if (blogPostsContainer) {
            blogPostsContainer.innerHTML = `<p>${errorMessage}</p>`;
            if (loadMoreButton) loadMoreButton.style.display = 'none';
        } else if (singlePostContainer) {
            singlePostContainer.innerHTML = `<p>${errorMessage}</p>`;
        }
    }
}

function displayPostsList() {
    if (!blogPostsContainer) return;

    const fragment = document.createDocumentFragment();
    const postsToLoad = allPosts.slice(currentIndex, currentIndex + postsPerPage);

    postsToLoad.forEach(post => {
        const postElement = document.createElement('article');
        postElement.classList.add('blog-post');

        // UPDATED: Localize date string based on currentLanguage
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        let locale;
        if (currentLanguage === 'ukr') {
            locale = 'uk-UA';
        } else if (currentLanguage === 'es') {
            locale = 'es-ES';
        } else if (currentLanguage === 'va') { // Add Valencian locale
            locale = 'ca-ES-valencia'; // Or 'ca-ES' if 'ca-ES-valencia' is not supported by all browsers
        }
        const localizedDate = new Date(post.date).toLocaleDateString(locale, dateOptions);

        // UPDATED: Ensure the read more button text is localized
        let readMoreText;
        if (currentLanguage === 'ukr') {
            readMoreText = 'Читати далі';
        } else if (currentLanguage === 'es') {
            readMoreText = 'Leer más';
        } else if (currentLanguage === 'va') { // Add Valencian translation for read more button
            readMoreText = 'Llegir més';
        }


        // UPDATED: The link is now relative to index.html within the /blog/ directory, and we need to include the language prefix
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p class="post-date">${localizedDate}</p>
            <div class="post-content">${post.content.substring(0, 150)}...</div>
            <div class="post-carousel">
                <div class="carousel-track" id="carouselTrackList-${post.id}">
                </div>
            </div>
            <a href="${post.id}.html" class="read-more-button">${readMoreText}</a>
        `;
        fragment.appendChild(postElement);

        const carouselTrack = postElement.querySelector(`#carouselTrackList-${post.id}`);
        const carouselContainer = carouselTrack.parentElement;

        if (post.images && post.images.length > 0) {
            carouselContainer.classList.toggle('static-images', post.images.length <= 2);
            const imagesToDisplay = post.images.length > 2 ? [...post.images, ...post.images] : post.images;

            imagesToDisplay.forEach(imageSrc => {
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                carouselItem.innerHTML = `<img src="${imageSrc}" alt="${post.title} image">`;
                carouselTrack.appendChild(carouselItem);
            });
        } else {
            carouselContainer.style.display = 'none';
        }
    });

    blogPostsContainer.appendChild(fragment);
    currentIndex += postsToLoad.length;

    if (loadMoreButton) {
        // UPDATED: Localize load more button text
        let loadMoreButtonText;
        if (currentLanguage === 'ukr') {
            loadMoreButtonText = 'Завантажити ще';
        } else if (currentLanguage === 'es') {
            loadMoreButtonText = 'Cargar más';
        } else if (currentLanguage === 'va') { // Add Valencian translation for load more button
            loadMoreButtonText = 'Carregar més';
        }
        loadMoreButton.textContent = loadMoreButtonText;
        loadMoreButton.style.display = currentIndex >= allPosts.length ? 'none' : 'block';
    }
}

function displaySinglePost() {
    if (!singlePostContainer) return;

    const pathParts = window.location.pathname.split('/');
    const postId = pathParts.pop().replace('.html', '');

    let notFoundMessage = '';
    if (currentLanguage === 'ukr') {
        notFoundMessage = 'Допис не знайдено.';
    } else if (currentLanguage === 'es') {
        notFoundMessage = 'Publicación no encontrada.';
    } else if (currentLanguage === 'va') { // Add Valencian translation for not found message
        notFoundMessage = 'Publicació no trobada.';
    }

    if (!postId) {
        singlePostContainer.innerHTML = `<p>${notFoundMessage}</p>`;
        return;
    }

    const post = allPosts.find(p => p.id === postId);

    if (!post) {
        singlePostContainer.innerHTML = `<p>${notFoundMessage}</p>`;
        return;
    }

    // UPDATED: Localize date string based on currentLanguage
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    let locale;
    if (currentLanguage === 'ukr') {
        locale = 'uk-UA';
    } else if (currentLanguage === 'es') {
        locale = 'es-ES';
    } else if (currentLanguage === 'va') { // Add Valencian locale
        locale = 'ca-ES-valencia'; // Or 'ca-ES' if 'ca-ES-valencia' is not supported by all browsers
    }
    const localizedDate = new Date(post.date).toLocaleDateString(locale, dateOptions);

    // The content is displayed dynamically, while the meta tags are pre-rendered.
    const postElement = document.createElement('article');
    postElement.classList.add('blog-post', 'single-view');
    postElement.innerHTML = `
        <h2>${post.title}</h2>
        <p class="post-date">${localizedDate}</p>
        <div class="post-content">${post.content}</div>
        <div class="post-carousel">
            <div class="carousel-track" id="carouselTrackSingle-${post.id}">
            </div>
        </div>
    `;
    singlePostContainer.appendChild(postElement);

    const carouselTrack = postElement.querySelector(`#carouselTrackSingle-${post.id}`);
    const carouselContainer = carouselTrack.parentElement;

    if (post.images && post.images.length > 0) {
        carouselContainer.classList.toggle('static-images', post.images.length <= 2);
        const imagesToDisplay = post.images.length > 2 ? [...post.images, ...post.images] : post.images;

        imagesToDisplay.forEach(imageSrc => {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            // The image paths from posts.json (e.g., ../../img/...) are correct
            // relative to the new post location (/blog/post1.html), so no change is needed.
            carouselItem.innerHTML = `<img src="${imageSrc}" alt="${post.title} image">`;
            carouselTrack.appendChild(carouselItem);
        });
    } else {
        carouselContainer.style.display = 'none';
    }
}

if (loadMoreButton) {
    loadMoreButton.addEventListener('click', displayPostsList);
}

fetchPosts();