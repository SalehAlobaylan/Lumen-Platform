# Aggregation Service Requirements (Node.js Worker Fleet)

This document outlines the requirements for the **Aggregation Service**, utilizing a Node.js worker architecture. It is responsible for the "heavy lifting" of the platform: ingesting content, processing media, and generating vector embeddings.

## 1. Core Responsibilities
- **Ingestion**: Scrape/Fetch content from various sources (RSS, YouTube API, Twitter/X API, Web Scraping).
- **Processing**: Normalize data into the `ContentItem` schema.
- **Media Generation**: Generate TTS audio (for articles), transcode video/audio, and create thumbnails using tools like FFmpeg.
- **Enrichment**: Generate vector embeddings (for semantic search) and extract tags/topics.
- **Storage**: Upload assets to Object Storage (S3/R2) and write metadata to the primary database (or call CMS internal APIs).

## 2. Ingestion Pipelines

### 2.1 RSS/Web Article Pipeline
- **Input**: RSS Feed URL.
- **Steps**:
  1. Poll feed for new items.
  2. Parse item (Title, Link, PubDate).
  3. **Scrape**: Fetch full article content if only excerpt is provided. Clean HTML to plain text/markdown.
  4. **Text-to-Speech (TTS)**: Send body text to TTS provider (OpenAI/ElevenLabs) to generate `AUDIO` track.
  5. **Upload**: Save audio to S3.
  6. **Persist**: Create `ContentItem` with type `ARTICLE` (with attached audio metadata) or `PODCAST` (if purely audio).

### 2.2 Video/Podcast Pipeline (YouTube/Spotify)
- **Input**: Channel/Playlist URL.
- **Steps**:
  1. Poll for new media.
  2. **Download**: Use `yt-dlp` or similar for metadata and media stream.
  3. **Transcode**: Convert to standard mp4/mp3 format optimized for mobile streaming (HLS preferred, or optimized MP4).
  4. **Transcript**: Generate Whisper transcript if not provided.
  5. **Upload**: Assets to S3.

### 2.3 Social Pipeline (X/Twitter, Reddit)
- **Input**: API access or scraping target.
- **Steps**:
  1. Fetch recent posts.
  2. Filter for high engagement (noise reduction).
  3. **Contextualize**: If a "Comment" or "Reply", fetch the parent context.
  4. **Persist**: Create `ContentItem` with type `TWEET` or `COMMENT`.

## 3. Data Enrichment

### 3.1 Vector Embeddings
- **Requirement**: Compute embeddings for every `ContentItem` (Title + Excerpt + Body).
- **Model**: OpenAI `text-embedding-3-small` or local equivalent.
- **Output**: Vector array (e.g., 1536 dimensions).
- **Storage**: Store in `pgvector` column in the CMS database.

### 3.2 Metadata Extraction
- Auto-generate `topic_tags` based on content analysis.
- Extract `transcript_id` references for audio/video.

## 4. Operational Requirements
- **Queue-Based**: All jobs must be idempotent and triggered via a message queue (Redis/BullMQ, SQS, or RabbitMQ).
- **Scalability**: Must support horizontal scaling of workers (k8s pods) to handle bursts in ingestion.
- **Fault Tolerance**: Automatic retries for network failures (scraping limits, API rate limits).
- **Status Reporting**: Update the CMS database with status `PENDING` -> `PROCESSING` -> `READY` or `FAILED`.

## 5. Artifacts Produced
- **Original Media**: The source file (S3).
- **Processed Media**: Optimized mobile version (S3).
- **Thumbnail**: Generated or fetched image (S3).
- **Database Record**: Fully populated `ContentItem` row.
