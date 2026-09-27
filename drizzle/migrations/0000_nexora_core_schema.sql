-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- assign role on profile creation; owner email becomes admin
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email text;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = NEW.id;
  IF lower(coalesce(_email,'')) = 'aahmdmhy819@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_assign_role AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- CATALOG TABLES
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'أخرى',
  image_url text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  discount_price numeric(10,2),
  rating numeric(2,1) NOT NULL DEFAULT 5,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  year integer,
  genre text NOT NULL DEFAULT '',
  rating numeric(3,1) NOT NULL DEFAULT 8,
  description text NOT NULL DEFAULT '',
  poster_url text,
  watch_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.movies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movies TO authenticated;
GRANT ALL ON public.movies TO service_role;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movies public read" ON public.movies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "movies admin write" ON public.movies FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  start_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'تصميمات',
  description text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio TO authenticated;
GRANT ALL ON public.portfolio TO service_role;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio public read" ON public.portfolio FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "portfolio admin write" ON public.portfolio FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ORDERS
CREATE SEQUENCE public.order_number_seq START 1000;
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number integer NOT NULL DEFAULT nextval('public.order_number_seq'),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  governorate text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  payment_method text NOT NULL DEFAULT 'الدفع عند الاستلام',
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'جديد',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT USAGE ON SEQUENCE public.order_number_seq TO anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders insert any" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "orders select own" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders admin delete" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid,
  name text NOT NULL,
  image_url text,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1
);
GRANT SELECT, INSERT ON public.order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items insert any" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "order items select own" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);

-- SERVICE REQUESTS
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  project_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  ad_type text NOT NULL DEFAULT '',
  size text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'جديد',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.service_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests insert any" ON public.service_requests FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "requests select own" ON public.service_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "requests admin update" ON public.service_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "requests admin delete" ON public.service_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- MESSAGES
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.messages TO anon;
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages insert any" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "messages admin read" ON public.messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "messages admin delete" ON public.messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- SETTINGS
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('whatsapp_number', '201034663437'),
  ('hero_title', 'كل ما تحتاجه في مكان واحد'),
  ('hero_subtitle', 'متجر إلكتروني • أفلام وفيديوهات • تصميم إعلانات • معرض أعمال');

INSERT INTO public.products (name, description, category, image_url, price, discount_price, rating, stock) VALUES
  ('سماعات NEXORA Air Pro', 'سماعات لاسلكية بعزل ضوضاء فعّال وبطارية 30 ساعة.', 'إلكترونيات', '/images/product-headphones.jpg', 2500, 1899, 4.8, 14),
  ('ساعة NEXORA Watch S2', 'ساعة ذكية بشاشة AMOLED وتتبع صحي متكامل.', 'أجهزة', '/images/product-watch.jpg', 3200, 2750, 4.6, 9),
  ('لوحة مفاتيح NEXORA Glow', 'لوحة مفاتيح ميكانيكية بإضاءة RGB للألعاب.', 'ألعاب', '/images/product-keyboard.jpg', 1800, 1450, 4.7, 21),
  ('حقيبة NEXORA Urban', 'حقيبة ظهر مقاومة للماء بجيب مخصص للابتوب.', 'إكسسوارات', '/images/product-backpack.jpg', 950, 749, 4.5, 30);

INSERT INTO public.movies (title, year, genre, rating, description, poster_url, watch_url) VALUES
  ('NEXORA Origins', 2025, 'وثائقي قصير', 9.1, 'فيلم قصير من إنتاجنا يحكي رحلة بناء منصة NEXORA.', '/images/movie-origins.jpg', ''),
  ('Neon City', 2024, 'خيال علمي', 8.4, 'عمل سينمائي من إنتاجنا الخاص داخل مدينة نيون مستقبلية.', '/images/movie-neon.jpg', ''),
  ('Brand Stories', 2025, 'إعلاني', 8.9, 'مجموعة فيديوهات إعلانية أنتجناها لعلامات تجارية.', '/images/movie-brand.jpg', ''),
  ('Desert Light', 2023, 'دراما قصيرة', 8.2, 'فيلم قصير مرخّص بالكامل لعرضه على منصتنا.', '/images/movie-desert.jpg', '');

INSERT INTO public.services (name, description, image_url, start_price) VALUES
  ('تصميم إعلانات السوشيال ميديا', 'تصميمات إعلانية جاذبة لمنصات التواصل الاجتماعي.', '/images/service-social.jpg', 250),
  ('تصميم بوستات وبانرات', 'جرافيك ترويجي احترافي بمقاسات مختلفة.', '/images/service-banner.jpg', 200),
  ('تصميم إعلانات المنتجات', 'تصميمات تركز على إبراز المنتج وزيادة المبيعات.', '/images/service-product-ad.jpg', 350),
  ('مونتاج إعلانات فيديو', 'مونتاج فيديوهات ترويجية قصيرة بمؤثرات احترافية.', '/images/service-video.jpg', 500);

INSERT INTO public.portfolio (title, category, description, image_url) VALUES
  ('حملة إعلانية لمتجر إلكتروني', 'إعلانات', 'سلسلة تصميمات إعلانية لحملة تخفيضات.', '/images/service-social.jpg'),
  ('هوية بصرية لعلامة تقنية', 'تصميمات', 'تصميم شعار وهوية كاملة بأسلوب نيون حديث.', '/images/service-banner.jpg'),
  ('مونتاج إعلان منتج', 'مونتاج', 'فيديو ترويجي مدته 30 ثانية لمنتج إلكتروني.', '/images/movie-brand.jpg'),
  ('تصوير وتصميم منتجات', 'منتجات', 'صور منتجات وتصميمات عرض للمتجر.', '/images/product-headphones.jpg');