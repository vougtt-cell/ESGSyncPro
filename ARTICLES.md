# Articles Page Status

## Current Status

**Status:** Temporarily Hidden

The `articles.html` page is fully functional but currently hidden from users. The page uses static (mock) data embedded directly in the HTML markup.

### What Works:
- ✅ Fully functional UI/UX
- ✅ Article pagination
- ✅ Multilingual support (English/Polish)
- ✅ Responsive design (mobile, tablet, desktop versions)
- ✅ Navigation between articles
- ✅ Integration with header and footer

### What's Missing:
- ❌ Database connection
- ❌ Backend API for fetching articles
- ❌ Dynamic data loading
- ❌ Content management through admin panel

---

## Required Database Data

To fully enable the Articles page, it's necessary to create a table in the PostgreSQL database (Neon DB) with the following structure:

### Table: `articles`

```sql
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title_en VARCHAR(500) NOT NULL,
    title_pl VARCHAR(500) NOT NULL,
    description_en TEXT NOT NULL,
    description_pl TEXT NOT NULL,
    content_en TEXT,
    content_pl TEXT,
    author_name VARCHAR(255) NOT NULL,
    author_avatar_url VARCHAR(500),
    thumbnail_url VARCHAR(500) NOT NULL,
    published_date DATE NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    slug VARCHAR(255) UNIQUE
);
```

### Data Fields:

1. **id** - Unique article identifier
2. **title_en / title_pl** - Article title in English and Polish
3. **description_en / description_pl** - Brief article description
4. **content_en / content_pl** - Full article text (for article.html page)
5. **author_name** - Article author name
6. **author_avatar_url** - Author avatar URL (optional)
7. **thumbnail_url** - Article preview image URL
8. **published_date** - Publication date
9. **language** - Article language (en/pl)
10. **status** - Article status (draft/published/archived)
11. **created_at / updated_at** - Timestamps
12. **view_count** - View counter
13. **slug** - URL-friendly article identifier

---

## Integration Steps

### 1. Create Database Table

Execute the SQL script to create the `articles` table in Neon DB:

```sql
-- See structure above
```

### 2. Create Backend API Endpoints

The following endpoints need to be added to `server.js`:

#### GET `/api/articles`
Get list of articles with pagination

**Query Parameters:**
- `page` (optional) - page number (default: 1)
- `limit` (optional) - number of articles per page (default: 6)
- `language` (optional) - language (en/pl, default from request headers)

**Response:**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "Article Title",
      "description": "Article description",
      "author_name": "Author Name",
      "thumbnail_url": "/path/to/image.png",
      "published_date": "2025-02-11",
      "slug": "article-slug"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 18,
    "items_per_page": 6
  }
}
```

#### GET `/api/articles/:id` or `/api/articles/:slug`
Get full information about a single article

**Response:**
```json
{
  "id": 1,
  "title": "Article Title",
  "description": "Article description",
  "content": "Full article content...",
  "author_name": "Author Name",
  "author_avatar_url": "/path/to/avatar.png",
  "thumbnail_url": "/path/to/image.png",
  "published_date": "2025-02-11",
  "view_count": 150,
  "slug": "article-slug"
}
```

### 3. Frontend Integration

In the `articles.html` file, you need to:

1. **Replace static data with dynamic loading:**

```javascript
// Add function to load articles from API
async function loadArticles(page = 1, language = 'en') {
    try {
        const response = await fetch(`/api/articles?page=${page}&limit=6&language=${language}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading articles:', error);
        return null;
    }
}

// Function to render articles
function renderArticles(articles) {
    const container = document.querySelector('.space-y-6'); // Articles container
    container.innerHTML = '';
    
    articles.forEach(article => {
        const articleCard = createArticleCard(article);
        container.appendChild(articleCard);
    });
}

// Function to create article card
function createArticleCard(article) {
    // Create HTML card element based on API data
    // Replace static data with article.title, article.description, etc.
}
```

2. **Update pagination:**
   - Use `pagination` data from API response
   - Update article list when page changes

3. **Update "Read" button handlers:**
   - Redirect to `article.html?id={article.id}` or `article.html?slug={article.slug}`

### 4. Update article.html

In the `article.html` file, you need to:

1. **Add article data loading by ID or slug:**
```javascript
async function loadArticle(idOrSlug) {
    const response = await fetch(`/api/articles/${idOrSlug}`);
    const article = await response.json();
    return article;
}
```

2. **Render article content dynamically:**
   - Replace static content with API data
   - Update meta tags (title, description)
   - Add view counter

---

## How to Re-enable the Page on the Site

### Step 1: Uncomment Navigation Links

In `header.html`:

**Desktop Navigation (line ~159):**
```html
<!-- Uncomment this line: -->
<a href="articles.html" class="text-gray-700 text-base font-normal hover:text-green-500 transition-colors" data-translate="nav.article">Article</a>
```

**Mobile Navigation (line ~268):**
```html
<!-- Uncomment this block: -->
<a href="articles.html" class="mobile-menu-nav-item" data-translate="nav.article" onclick="toggleMobileMenu()">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
    </svg>
    <span>Article</span>
</a>
```

### Step 2: Remove Direct Access Protection

In `articles.html` (lines ~12-35):

**Remove or comment out:**
```html
<!-- Remove this comment block and redirect script: -->
<!-- TEMPORARILY HIDDEN: ... -->
<script>
    (function() {
        if (!window.ENABLE_ARTICLES_PAGE) {
            window.location.href = 'index.html';
        }
    })();
</script>
```

### Step 3: Verify Integration

1. Ensure the `articles` table is created in the database
2. Verify that API endpoints work correctly
3. Test article loading on the frontend
4. Check pagination and navigation
5. Test on different devices (mobile, tablets, desktops)

---

## Additional Recommendations

### SEO Optimization
- Add meta tags for each article
- Implement Open Graph tags
- Add structured data (JSON-LD)

### Performance
- Implement article caching on the backend
- Add lazy loading for images
- Optimize database queries (indexes)

### Security
- Validate input data in API
- Protect against SQL injection (use parameterized queries)
- Rate limiting for requests

### Analytics
- Add article view tracking
- Integration with analytics systems (Google Analytics, etc.)

---

## Notes

- All changes should be reversible
- Page code should not be deleted
- Code comments should explain the reason for hiding the page
- After database integration, mock data can be kept as a fallback in case of API errors
