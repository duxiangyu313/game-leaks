-- ═══════════════════════════════════════════
-- 重建 UGC 投稿表（/submit 页面依赖，数据库简化时被误删）
-- 在 Supabase Dashboard → SQL Editor 执行
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ugc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  category text,
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  game_name text,
  content_level text NOT NULL DEFAULT 'free' CHECK (content_level IN ('free','gold','diamond')),
  tags text[],
  cover_image text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','needs_changes')),
  revenue_split numeric,
  review_note text,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  submitted_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ugc_submissions_status ON public.ugc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_ugc_submissions_user ON public.ugc_submissions(user_id);

ALTER TABLE public.ugc_submissions ENABLE ROW LEVEL SECURITY;

-- 投稿人: 可提交自己的稿件、查看自己的稿件
CREATE POLICY "ugc_insert_own" ON public.ugc_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ugc_select_own" ON public.ugc_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 管理员(diamond): 可查看/审核全部稿件
CREATE POLICY "ugc_select_admin" ON public.ugc_submissions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond')
  );
CREATE POLICY "ugc_update_admin" ON public.ugc_submissions
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond')
  );

SELECT 'ugc_submissions rebuilt' AS status;
