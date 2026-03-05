
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  grade INTEGER CHECK (grade BETWEEN 6 AND 12),
  track TEXT CHECK (track IN ('IMO', 'IOI', 'Both')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);

-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- First user becomes admin
CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

-- Problems table
CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  track TEXT NOT NULL CHECK (track IN ('IMO', 'IOI')),
  tags TEXT[] DEFAULT '{}',
  statement TEXT NOT NULL,
  sample_input TEXT,
  sample_output TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Problems are publicly viewable" ON public.problems FOR SELECT USING (true);
CREATE POLICY "Admins can manage problems" ON public.problems FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  answer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  evaluated_at TIMESTAMPTZ
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all submissions" ON public.submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update submissions" ON public.submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Blog posts (STEM guidance hub)
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  excerpt TEXT,
  published BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are public" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Scholarships table
CREATE TABLE public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  eligibility TEXT,
  deadline TEXT,
  coverage TEXT,
  apply_link TEXT,
  category TEXT CHECK (category IN ('National', 'International', 'STEM Only', 'Fully Funded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scholarships are public" ON public.scholarships FOR SELECT USING (true);
CREATE POLICY "Admins can manage scholarships" ON public.scholarships FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
