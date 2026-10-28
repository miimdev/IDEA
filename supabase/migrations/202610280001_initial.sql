-- Run only on a dedicated project after checking for existing names.
-- No browser code ever receives a service_role credential.
BEGIN;
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (char_length(slug) BETWEEN 1 AND 120 AND slug ~ '^[a-z0-9-]+$'),
  title_fa text NOT NULL CHECK (char_length(title_fa) BETWEEN 1 AND 200),
  title_en text NOT NULL CHECK (char_length(title_en) BETWEEN 1 AND 200),
  category text NOT NULL CHECK (category IN ('branding','web','mobile','content')),
  client_fa text NOT NULL CHECK (char_length(client_fa) <= 200),
  client_en text NOT NULL CHECK (char_length(client_en) <= 200),
  year integer NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  summary_fa text NOT NULL CHECK (char_length(summary_fa) <= 500),
  summary_en text NOT NULL CHECK (char_length(summary_en) <= 500),
  description_fa text NOT NULL CHECK (char_length(description_fa) <= 10000),
  description_en text NOT NULL CHECK (char_length(description_en) <= 10000),
  cover text NOT NULL CHECK (char_length(cover) <= 2048),
  images jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(images) = 'array'),
  technologies text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (char_length(slug) BETWEEN 1 AND 120 AND slug ~ '^[a-z0-9-]+$'),
  icon text NOT NULL CHECK (icon IN ('content','mobile','web','branding')),
  title_fa text NOT NULL CHECK (char_length(title_fa) <= 200), title_en text NOT NULL CHECK (char_length(title_en) <= 200),
  description_fa text NOT NULL CHECK (char_length(description_fa) <= 1000), description_en text NOT NULL CHECK (char_length(description_en) <= 1000),
  detail_fa text NOT NULL CHECK (char_length(detail_fa) <= 5000), detail_en text NOT NULL CHECK (char_length(detail_en) <= 5000),
  capabilities_fa text[] NOT NULL DEFAULT '{}', capabilities_en text[] NOT NULL DEFAULT '{}', technologies text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0
);
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (char_length(slug) BETWEEN 1 AND 120 AND slug ~ '^[a-z0-9-]+$'),
  title_fa text NOT NULL CHECK (char_length(title_fa) <= 250), title_en text NOT NULL CHECK (char_length(title_en) <= 250),
  category_fa text NOT NULL CHECK (char_length(category_fa) <= 100), category_en text NOT NULL CHECK (char_length(category_en) <= 100),
  excerpt_fa text NOT NULL CHECK (char_length(excerpt_fa) <= 1000), excerpt_en text NOT NULL CHECK (char_length(excerpt_en) <= 1000),
  body_fa text NOT NULL CHECK (char_length(body_fa) <= 50000), body_en text NOT NULL CHECK (char_length(body_en) <= 50000),
  published_at date NOT NULL DEFAULT CURRENT_DATE, read_minutes integer NOT NULL CHECK (read_minutes BETWEEN 1 AND 180),
  cover text NOT NULL CHECK (char_length(cover) <= 2048), sort_order integer NOT NULL DEFAULT 0
);
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fa text NOT NULL CHECK (char_length(name_fa) <= 200), name_en text NOT NULL CHECK (char_length(name_en) <= 200),
  role_fa text NOT NULL CHECK (char_length(role_fa) <= 200), role_en text NOT NULL CHECK (char_length(role_en) <= 200),
  color text NOT NULL DEFAULT '#705297' CHECK (color ~ '^#[a-fA-F0-9]{6}$'), sort_order integer NOT NULL DEFAULT 0
);
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_fa text NOT NULL CHECK (char_length(quote_fa) <= 2500), quote_en text NOT NULL CHECK (char_length(quote_en) <= 2500),
  name_fa text NOT NULL CHECK (char_length(name_fa) <= 200), name_en text NOT NULL CHECK (char_length(name_en) <= 200),
  role_fa text NOT NULL CHECK (char_length(role_fa) <= 200), role_en text NOT NULL CHECK (char_length(role_en) <= 200),
  initials text NOT NULL CHECK (char_length(initials) <= 5), sort_order integer NOT NULL DEFAULT 0
);
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 1 AND 150), sort_order integer NOT NULL DEFAULT 0
);
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254 AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  project_type text NOT NULL CHECK (project_type IN ('branding','web','mobile','content','other')),
  budget text NOT NULL DEFAULT '' CHECK (char_length(budget) <= 100),
  message text NOT NULL CHECK (char_length(btrim(message)) BETWEEN 10 AND 5000),
  website text NOT NULL DEFAULT '' CHECK (website = ''),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254 AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  website text NOT NULL DEFAULT '' CHECK (website = ''),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX newsletter_subscribers_email_lower_key ON public.newsletter_subscribers (lower(email));

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Explicit privileges as well as RLS: the two inboxes have no public SELECT grant.
REVOKE ALL ON public.projects, public.services, public.blog_posts, public.team_members, public.testimonials, public.clients, public.contact_messages, public.newsletter_subscribers FROM anon, authenticated;
GRANT SELECT ON public.projects, public.services, public.blog_posts, public.team_members, public.testimonials, public.clients TO anon, authenticated;
GRANT INSERT (name,email,project_type,budget,message,website) ON public.contact_messages TO anon, authenticated;
GRANT INSERT (email,website) ON public.newsletter_subscribers TO anon, authenticated;
CREATE POLICY "Public projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public services" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public blog posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public team" ON public.team_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public clients" ON public.clients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Submit contact only" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (website = '');
CREATE POLICY "Subscribe only" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (website = '');
COMMIT;
