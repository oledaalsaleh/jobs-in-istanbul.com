-- Migration 0003: Performance indexes for high-throughput public queries
-- Resolves D1 rows_read quota by avoiding full table scans on published documents

-- 1. Index for published documents by type and slug (direct 1-row lookup for job and blog detail pages)
CREATE INDEX IF NOT EXISTS idx_documents_type_slug_pub 
  ON documents(type_id, slug, is_published, status);

-- 2. Keyset & date ordering index for published jobs list (homepage, feeds, sitemaps)
CREATE INDEX IF NOT EXISTS idx_documents_jobs_pub_date 
  ON documents(type_id, is_published, status, published_at DESC);

-- 3. General published status index by type (for categories, companies, settings)
CREATE INDEX IF NOT EXISTS idx_documents_type_pub_status 
  ON documents(type_id, is_published, status);

-- 4. Fast ordering by creation date for admin & background scrapers
CREATE INDEX IF NOT EXISTS idx_documents_type_created 
  ON documents(type_id, is_published, created_at DESC);

-- 5. Relation lookups (category -> job)
CREATE INDEX IF NOT EXISTS idx_docref_query 
  ON document_references(from_document_id, field_name, to_root_id);
