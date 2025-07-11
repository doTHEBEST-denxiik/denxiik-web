const fs = require('fs').promises;
const path = require('path');

// --- Configuration ---
const config = {
    languages: ['ukr', 'es', 'va'], // Add all languages you support
    baseUrl: 'https://igcu-castellon-vinaros-torreblanca.com',
    defaultImage: '/img/logo.webp'
};

async function generateBlogPosts() {
    try {
        console.log('Starting blog post generation for all languages...');

        for (const lang of config.languages) {
            console.log(`Generating posts for language: ${lang.toUpperCase()}`);

            const postsDataPath = path.join(__dirname, 'data', lang, 'blog', 'posts.json');
            const templatePath = path.join(__dirname, lang, 'blog', 'post-template.html');
            const outputDir = path.join(__dirname, lang, 'blog'); // Output to language-specific blog folder

            // 1. Ensure the output directory exists for the current language
            await fs.mkdir(outputDir, { recursive: true });

            // 2. Read the template and the posts data for the current language
            const template = await fs.readFile(templatePath, 'utf-8');
            const posts = JSON.parse(await fs.readFile(postsDataPath, 'utf-8'));

            // 3. Loop through each post and generate its HTML file
            for (const post of posts) {
                let finalHtml = template;

                // The URL path includes the language prefix and no longer includes "/posts/"
                const postUrl = `${config.baseUrl}/${lang}/blog/${post.id}.html`;
                const description = post.description || post.content.replace(/<[^>]*>/g, '').substring(0, 80);
                const imageUrl = post.images && post.images.length > 0
                    ? new URL(post.images[0].replace('../../', '/'), config.baseUrl).href
                    : new URL(config.defaultImage, config.baseUrl).href;

                // 4. Replace all placeholders with actual data
                finalHtml = finalHtml
                    .replace(/\{\{postTitle\}\}|<%= postTitle %>/g, post.title)
                    .replace(/\{\{metaDescription\}\}|"\{\{ogDescription\}\}"|"\{\{twitterDescription\}\}"/g, `"${description}"`)
                    // Corrected line for og:image and twitter:image
                    .replace(/\{\{ogImage\}\}|\{\{twitterImage\}\}/g, imageUrl) 
                    .replace(/\{\{ogImageAlt\}\}/g, post.title)
                    // Link placeholders now point to the new structure including language
                    .replace(/https:\/\/nasha-tserkva\.com\/blog\/\{\{postId\}\}/g, postUrl)
                    .replace(/\{\{postId\}\}/g, `${post.id}.html`)
                    // Dynamically set hreflang links based on current language being processed
                    .replace(/<link rel="alternate" hreflang="en" href="https:\/\/nasha-tserkva\/en\/blog\/" \/>/, `<link rel="alternate" hreflang="en" href="${config.baseUrl}/en/blog/${post.id}.html" />`)
                    .replace(/<link rel="alternate" hreflang="es" href="https:\/\/nasha-tserkva\/es\/blog\/" \/>/, `<link rel="alternate" hreflang="es" href="${config.baseUrl}/es/blog/${post.id}.html" />`)
                    .replace(/<link rel="alternate" hreflang="ukr" href="https:\/\/nasha-tserkva\/ukr\/blog\/" \/>/, `<link rel="alternate" hreflang="ukr" href="${config.baseUrl}/ukr/blog/${post.id}.html" />`);


                // 5. Save the new, complete HTML file
                const outputFilePath = path.join(outputDir, `${post.id}.html`);
                await fs.writeFile(outputFilePath, finalHtml);
                console.log(`Successfully generated: ${outputFilePath}`);
            }
        }

        console.log('Blog post generation complete for all languages!');

    } catch (error) {
        console.error('Error during blog post generation:', error);
    }
}

generateBlogPosts();