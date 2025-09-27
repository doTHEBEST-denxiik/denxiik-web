const blogPostsContainer = document.getElementById('blogPostsContainer');
const singlePostContainer = document.getElementById('singlePostContainer');
const loadMoreButton = document.getElementById('loadMorePosts');

let allPosts = [];
let postsPerPage = 5;
let currentIndex = 0;
let currentLanguage = 'en'; 

// Detecta si la página actual es la vista de un solo post (ej: post4.html)
const isSinglePostPage = window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('/index.html');


// --------------------------------------------------
// 1. Fetching and Initialization
// --------------------------------------------------

async function fetchPosts() {
    // Determina el idioma actual basado en la ruta URL
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments.includes('ukr')) {
        currentLanguage = 'ukr';
    } else if (pathSegments.includes('es')) {
        currentLanguage = 'es';
    } else if (pathSegments.includes('va')) { 
        currentLanguage = 'va';
    } else if (pathSegments.includes('en')) {
        currentLanguage = 'en';
    }

    try {
        // Carga el JSON específico del idioma
        const response = await fetch(`../../data/${currentLanguage}/blog/posts.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allPosts = await response.json();
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordena por fecha descendente

        if (isSinglePostPage) {
            displaySinglePost();
        } else {
            displayPostsList();
        }

    } catch (error) {
        console.error("Error fetching blog posts:", error);
        
        // Manejo de errores localizado
        const errorMessage = getLocalizedText('fetchError');

        if (blogPostsContainer) {
            blogPostsContainer.innerHTML = `<p>${errorMessage}</p>`;
            if (loadMoreButton) loadMoreButton.style.display = 'none';
        } else if (singlePostContainer) {
            singlePostContainer.innerHTML = `<p>${errorMessage}</p>`;
        }
    }
}


// --------------------------------------------------
// 2. Helper Functions (Localization)
// --------------------------------------------------

function getLocale() {
    if (currentLanguage === 'ukr') {
        return 'uk-UA';
    } else if (currentLanguage === 'es') {
        return 'es-ES';
    } else if (currentLanguage === 'va') { 
        return 'ca-ES-valencia'; 
    }
    return 'en-US';
}

function getLocalizedText(key) {
    const translations = {
        readMore: { ukr: 'Читати далі', es: 'Leer más', va: 'Llegir més', en: 'Read more' },
        loadMore: { ukr: 'Завантажити ще', es: 'Cargar más', va: 'Carregar més', en: 'Load more' },
        notFound: { ukr: 'Допис не знайдено.', es: 'Publicación no encontrada.', va: 'Publicació no trobada.', en: 'Post not found.' },
        fetchError: { ukr: 'Не вдалося завантажити дописи. Спробуйте пізніше.', es: 'No se pudieron cargar las publicaciones. Inténtelo de nuevo más tarde.', va: 'No s\'han pogut carregar les publicacions. Torneu-ho a intentar més tard.', en: 'Error loading posts. Please try again later.' }
    };
    // Devuelve la traducción si existe, si no, usa la versión en inglés
    return translations[key][currentLanguage] || translations[key]['en']; 
}


// --------------------------------------------------
// 3. Post List View Rendering (with video embed preview)
// --------------------------------------------------

function displayPostsList() {
    if (!blogPostsContainer) return;

    const fragment = document.createDocumentFragment();
    const postsToLoad = allPosts.slice(currentIndex, currentIndex + postsPerPage);

    postsToLoad.forEach(post => {
        const postElement = document.createElement('article');
        postElement.classList.add('blog-post');

        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const localizedDate = new Date(post.date).toLocaleDateString(getLocale(), dateOptions);
        const readMoreText = getLocalizedText('readMore');
        
        // Estructura base del post
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

        
        // --- LÓGICA DE CONTENIDO DEL CARRUSEL (IMAGEN O VIDEO IFRAME) ---
        
        let contentToDisplay = [];
        let isVideoEmbed = false;

        if (post.images && post.images.length > 0) {
            // Caso 1: Tiene imágenes (comportamiento normal de carrusel)
            contentToDisplay = post.images.length > 2 ? [...post.images, ...post.images] : post.images;
        } else if (post.videoID) {
            // Caso 2: No tiene imágenes, pero tiene video. Insertamos el iframe.
            const videoEmbedHtml = `
                <div class="preview-video-wrapper">
                    <iframe 
                        src="https://www.youtube.com/embed/${post.videoID}?rel=0&amp;showinfo=0" 
                        frameborder="0" 
                        allow="autoplay; encrypted-media" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
            contentToDisplay = [videoEmbedHtml];
            isVideoEmbed = true;
        }
        
        if (contentToDisplay.length > 0) {
            // Para el vídeo, forzamos vista estática ya que solo es un elemento
            carouselContainer.classList.toggle('static-images', isVideoEmbed || contentToDisplay.length <= 2);
            
            contentToDisplay.forEach(item => {
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                
                if (isVideoEmbed) {
                    // Insertamos el iframe HTML directamente
                    carouselItem.innerHTML = item; 
                    carouselItem.classList.add('carousel-item-video'); 
                } else {
                    // Insertamos la imagen <img>
                    carouselItem.innerHTML = `<img src="${item}" alt="${post.title} preview">`;
                }

                carouselTrack.appendChild(carouselItem);
            });
        } else {
            carouselContainer.style.display = 'none';
        }
        // ---------------------------------------------------

    });

    blogPostsContainer.appendChild(fragment);
    currentIndex += postsToLoad.length;

    if (loadMoreButton) {
        const loadMoreButtonText = getLocalizedText('loadMore');
        loadMoreButton.textContent = loadMoreButtonText;
        loadMoreButton.style.display = currentIndex >= allPosts.length ? 'none' : 'block';
    }
}


// --------------------------------------------------
// 4. Single Post View Rendering (with static video embed)
// --------------------------------------------------

function displaySinglePost() {
    if (!singlePostContainer) return;

    const pathParts = window.location.pathname.split('/');
    const postId = pathParts.pop().replace('.html', '');
    const notFoundMessage = getLocalizedText('notFound');

    if (!postId) {
        singlePostContainer.innerHTML = `<p>${notFoundMessage}</p>`;
        return;
    }

    const post = allPosts.find(p => p.id === postId);

    if (!post) {
        singlePostContainer.innerHTML = `<p>${notFoundMessage}</p>`;
        return;
    }

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const localizedDate = new Date(post.date).toLocaleDateString(getLocale(), dateOptions);

    // --- LÓGICA DE VIDEO EMBED (Single Post) ---
    let videoHtml = '';
    if (post.videoID) {
        videoHtml = `
            <div class="blog-video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${post.videoID}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    }
    // --------------------------------------------

    const postElement = document.createElement('article');
    postElement.classList.add('blog-post', 'single-view');
    postElement.innerHTML = `
        <h2>${post.title}</h2>
        <p class="post-date">${localizedDate}</p>
        <div class="post-content">${post.content}</div>
        
        ${videoHtml}  <div class="post-carousel">
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
            carouselItem.innerHTML = `<img src="${imageSrc}" alt="${post.title} image">`;
            carouselTrack.appendChild(carouselItem);
        });
    } else {
        carouselContainer.style.display = 'none';
    }
}

// --------------------------------------------------
// 5. Event Listeners and Execution
// --------------------------------------------------

if (loadMoreButton) {
    loadMoreButton.addEventListener('click', displayPostsList);
}

// Inicia la carga de posts al inicio
fetchPosts();