-- Raise academy-materials bucket limit to 500 MB
UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE id = 'academy-materials';

-- Verify the bucket-level limit
SELECT id, name, file_size_limit
FROM storage.buckets
WHERE id = 'academy-materials';
