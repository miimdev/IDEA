-- Refresh only the untouched demonstration artwork. Custom project imagery is never overwritten.
BEGIN;
UPDATE public.projects AS p
SET cover = v.new_cover, images = v.new_images
FROM (VALUES
  ('nova-architecture','assets/work-nova.webp','["assets/work-nova.webp", "assets/work-kaan.webp"]'::jsonb,'assets/work-nova.webp','["assets/work-nova.webp", "assets/detail-nova.webp"]'::jsonb),
  ('seda-sound','assets/work-seda.webp','["assets/work-seda.webp", "assets/hero-art.webp"]'::jsonb,'assets/work-seda.webp','["assets/work-seda.webp", "assets/detail-seda.webp"]'::jsonb),
  ('kaan-beauty','assets/work-kaan.webp','["assets/work-kaan.webp", "assets/work-nova.webp"]'::jsonb,'assets/work-kaan.webp','["assets/work-kaan.webp", "assets/detail-kaan.webp"]'::jsonb),
  ('rah-travel','assets/work-nova.webp','["assets/work-nova.webp", "assets/work-seda.webp"]'::jsonb,'assets/work-rah.webp','["assets/work-rah.webp", "assets/detail-rah.webp"]'::jsonb),
  ('veera-finance','assets/work-seda.webp','["assets/work-seda.webp", "assets/work-nova.webp"]'::jsonb,'assets/work-veera.webp','["assets/work-veera.webp", "assets/detail-veera.webp"]'::jsonb),
  ('roshd-platform','assets/work-kaan.webp','["assets/work-kaan.webp", "assets/work-seda.webp"]'::jsonb,'assets/work-roshd.webp','["assets/work-roshd.webp", "assets/detail-roshd.webp"]'::jsonb),
  ('noon-campaign','assets/work-nova.webp','["assets/work-nova.webp", "assets/work-kaan.webp"]'::jsonb,'assets/work-noon.webp','["assets/work-noon.webp", "assets/detail-noon.webp"]'::jsonb),
  ('avar-living','assets/work-kaan.webp','["assets/work-kaan.webp", "assets/work-nova.webp"]'::jsonb,'assets/work-avar.webp','["assets/work-avar.webp", "assets/detail-avar.webp"]'::jsonb)
) AS v(slug, old_cover, old_images, new_cover, new_images)
WHERE p.slug = v.slug AND p.cover = v.old_cover AND p.images = v.old_images;

UPDATE public.blog_posts AS p
SET cover = v.new_cover
FROM (VALUES
  ('building-digital-trust','assets/work-nova.webp','assets/work-veera.webp'),
  ('creative-process','assets/work-seda.webp','assets/work-roshd.webp'),
  ('future-of-brands','assets/work-kaan.webp','assets/studio.webp')
) AS v(slug, old_cover, new_cover)
WHERE p.slug = v.slug AND p.cover = v.old_cover;
COMMIT;
