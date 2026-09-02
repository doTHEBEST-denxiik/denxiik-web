const fs = require('fs').promises;
const path = require('path');

// --- Configuration ---
const config = {
    languages: ['en', 'es', 'ukr'], // Add all languages you support
    baseUrl: 'https://www.denxiik.com',
    defaultImage: '/img/logo.webp'
};

// Static (non-blog) pages, keyed by language. slug is the folder name under each language directory.
const staticPages = {
    en: [
        { slug: 'index', changefreq: 'monthly', priority: '1.0' },
        { slug: 'blog', changefreq: 'weekly', priority: '0.8' },
        { slug: 'contact', changefreq: 'yearly', priority: '0.5' },
        { slug: 'links-of-interest', changefreq: 'monthly', priority: '0.5' }
    ],
    es: [
        { slug: 'index', changefreq: 'monthly', priority: '1.0' },
        { slug: 'blog', changefreq: 'weekly', priority: '0.8' },
        { slug: 'contact', changefreq: 'yearly', priority: '0.5' },
        { slug: 'enlaces-de-interest', changefreq: 'monthly', priority: '0.5' }
    ],
    ukr: [
        { slug: 'index', changefreq: 'monthly', priority: '1.0' },
        { slug: 'blog', changefreq: 'weekly', priority: '0.8' },
        { slug: 'contact', changefreq: 'yearly', priority: '0.5' },
        { slug: 'interests', changefreq: 'monthly', priority: '0.5' }
    ]
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeXml(value) {
    return escapeHtml(value).replace(/'/g, '&apos;');
}

async function generateBlogPosts() {
    console.log('Starting blog post generation for all languages...');

    // Collects { lang, id, date } for every generated post, used by generateSitemap().
    const allPosts = [];

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
                .replace(/\{\{postTitle\}\}|<%= postTitle %>/g, escapeHtml(post.title))
                .replace(/\{\{metaDescription\}\}/g, escapeHtml(description))
                .replace(/\{\{ogDescription\}\}/g, escapeHtml(description))
                .replace(/\{\{twitterDescription\}\}/g, escapeHtml(description))
                // Corrected line for og:image and twitter:image
                .replace(/\{\{ogImage\}\}|\{\{twitterImage\}\}/g, imageUrl)
                .replace(/\{\{ogImageAlt\}\}/g, escapeHtml(post.title))
                .replace(/\{\{postUrl\}\}/g, postUrl)
                .replace(/\{\{postId\}\}/g, `${post.id}.html`);

            // 5. Save the new, complete HTML file
            const outputFilePath = path.join(outputDir, `${post.id}.html`);
            await fs.writeFile(outputFilePath, finalHtml);
            console.log(`Successfully generated: ${outputFilePath}`);

            allPosts.push({ lang, id: post.id, date: post.date });
        }
    }

    console.log('Blog post generation complete for all languages!');
    return allPosts;
}

async function generateSitemap(posts) {
    console.log('Generating sitemap.xml...');

    const today = new Date().toISOString().split('T')[0];
    const urls = [];

    // Root redirect page
    urls.push({ loc: `${config.baseUrl}/`, lastmod: today, changefreq: 'yearly', priority: '1.0' });

    // Static pages per language
    for (const lang of config.languages) {
        for (const page of staticPages[lang]) {
            urls.push({
                loc: `${config.baseUrl}/${lang}/${page.slug}/`,
                lastmod: today,
                changefreq: page.changefreq,
                priority: page.priority
            });
        }
    }

    // Blog posts
    for (const post of posts) {
        urls.push({
            loc: `${config.baseUrl}/${post.lang}/blog/${post.id}.html`,
            lastmod: post.date,
            changefreq: 'monthly',
            priority: '0.6'
        });
    }

    const body = urls
        .map(u => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

    const outputPath = path.join(__dirname, 'sitemap.xml');
    await fs.writeFile(outputPath, xml);
    console.log(`Successfully generated: ${outputPath} (${urls.length} URLs)`);
}

async function main() {
    try {
        const posts = await generateBlogPosts();
        await generateSitemap(posts);
    } catch (error) {
        console.error('Error during build:', error);
        process.exitCode = 1;
    }
}

main();