
***

### File 3: `LLM_CONTEXT.md`
*Use this for instructing future AI Agents.*

```markdown
# Lumen: LLM Agent Context

**Use this file to understand the project boundaries and terminology.**

---

## 1. System Definitions
*   **Lumen:** A social app with a "For You" feed (Audio/Video) and a "News" feed (Read/View).
*   **Scroll Unit:** The atomic unit of content.
    *   For **News**, a unit is a **Slide** (1 Featured + 3 Related).
    *   For **For You**, a unit is a **Card** (1 Full-screen MP4).

## 2. Service Boundaries (Strict Rules)

### ✅ Aggregator Service (Node.js)
*   **DO:** Fetch data from external sources (RSS, Twitter).
*   **DO:** Convert MP3s to MP4s (FFmpeg). **This is critical.** We do not stream raw audio.
*   **DO:** Generate Vector Embeddings.
*   **DO:** Write to the `content_items` table.
*   **DON'T:** Serve API traffic to users.

### ✅ Feed Service / CMS (Golang)
*   **DO:** Read from `content_items`.
*   **DO:** Handle the logic for "1 Featured + 3 Related".
*   **DO:** Execute Vector Similarity searches (`ORDER BY embedding <=> query`).
*   **DO:** Serve JSON to the mobile app.
*   **DON'T:** Scrape websites or run FFmpeg conversions.

## 3. Key Engineering constraints
1.  **Vector Search:** We rely on `pgvector` for finding related news items. We do not use manual tagging for MVP.
2.  **Video Only:** The "For You" feed *must* return MP4 URLs. If the source is audio, the Aggregator must have already converted it.
3.  **Polymorphism:** A Tweet, an Article, and a Video all live in the `content_items` table to make vector search easier.

## 4. Common Tasks
*   *Task:* "Add a new news source." -> **Modify Aggregator (Node.js).**
*   *Task:* "Change ranking logic to favor recent items." -> **Modify Feed Service (Golang).**
*   *Task:* "Update video encoding settings." -> **Modify Aggregator (Node.js).**
