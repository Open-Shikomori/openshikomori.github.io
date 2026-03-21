-- Admin console foundation: schema fixes, admin RPCs, audit logging, and user provisioning

-- ============================================
-- SCHEMA FIXES
-- ============================================

ALTER TABLE clips
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE corrections
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS review_note TEXT;

ALTER TABLE global_goals
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_clips_status_created_at
  ON clips(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clips_language_dialect_created_at
  ON clips(language, dialect, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_corrections_status_created_at
  ON corrections(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_created_at
  ON users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_stats_xp_total
  ON user_stats(xp_total DESC);

DROP TRIGGER IF EXISTS update_clips_updated_at ON clips;
CREATE TRIGGER update_clips_updated_at
  BEFORE UPDATE ON clips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_corrections_updated_at ON corrections;
CREATE TRIGGER update_corrections_updated_at
  BEFORE UPDATE ON corrections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADMIN HELPERS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_config
    WHERE user_id = COALESCE(p_user_id, auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_config
    WHERE user_id = COALESCE(p_user_id, auth.uid())
      AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.assert_admin()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.assert_superadmin()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Superadmin access required';
  END IF;
END;
$$;

-- ============================================
-- ADMIN AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  after_state JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit log" ON admin_audit_log;
CREATE POLICY "Admins can read audit log"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert audit log" ON admin_audit_log;
CREATE POLICY "Admins can insert audit log"
  ON admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at
  ON admin_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor_id
  ON admin_audit_log(actor_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.insert_admin_audit_log(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_before_state JSONB DEFAULT '{}'::jsonb,
  p_after_state JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();

  INSERT INTO admin_audit_log (actor_id, action, entity_type, entity_id, before_state, after_state)
  VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    COALESCE(p_before_state, '{}'::jsonb),
    COALESCE(p_after_state, '{}'::jsonb)
  );
END;
$$;

-- ============================================
-- SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read platform settings" ON platform_settings;
CREATE POLICY "Admins can read platform settings"
  ON platform_settings
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update platform settings" ON platform_settings;
CREATE POLICY "Admins can update platform settings"
  ON platform_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO platform_settings (key, value)
VALUES
  ('contribution_limits', '{"dailyContributionLimit":50,"dailyCorrectionLimit":100,"requireManualReview":true}'::jsonb),
  ('speech_settings', '{"transcriptionProvider":"browser","transcriptionModel":"web_speech","voiceStorage":"r2","autoApproveClips":false}'::jsonb),
  ('site_preferences', '{"showCommunitySection":true,"showRoadmap":true,"maintenanceMode":false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- AUTH USER PROVISIONING
-- ============================================

INSERT INTO public.users (id, created_at, updated_at, is_public, contribution_count)
SELECT
  au.id,
  COALESCE(au.created_at, NOW()),
  NOW(),
  FALSE,
  0
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;

INSERT INTO public.user_stats (
  id,
  xp_total,
  xp_daily,
  current_streak,
  best_streak,
  recordings_count,
  corrections_count,
  reviews_count,
  daily_goal
)
SELECT
  au.id,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  10
FROM auth.users au
LEFT JOIN public.user_stats us ON us.id = au.id
WHERE us.id IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, created_at, updated_at, is_public, contribution_count)
  VALUES (NEW.id, COALESCE(NEW.created_at, NOW()), NOW(), FALSE, 0)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_stats (
    id,
    xp_total,
    xp_daily,
    current_streak,
    best_streak,
    recordings_count,
    corrections_count,
    reviews_count,
    daily_goal
  )
  VALUES (NEW.id, 0, 0, 0, 0, 0, 0, 0, 10)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================
-- ADMIN RPCS
-- ============================================

CREATE OR REPLACE FUNCTION public.admin_get_dashboard()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  PERFORM public.assert_admin();

  WITH language_totals AS (
    SELECT
      CASE
        WHEN language = 'comorian' THEN COALESCE(dialect, 'comorian')
        ELSE language
      END AS category,
      count(*)::INT AS clip_count,
      COALESCE(sum(duration), 0)::INT AS total_seconds
    FROM clips
    WHERE status = 'approved'
    GROUP BY 1
    ORDER BY clip_count DESC, category
  )
  SELECT jsonb_build_object(
    'stats', jsonb_build_object(
      'totalUsers', (SELECT count(*)::INT FROM users),
      'activeContributors', (
        SELECT count(*)::INT
        FROM user_stats
        WHERE COALESCE(recordings_count, 0) + COALESCE(corrections_count, 0) > 0
      ),
      'publicContributors', (SELECT count(*)::INT FROM users WHERE is_public = TRUE),
      'totalClips', (SELECT count(*)::INT FROM clips),
      'pendingClips', (SELECT count(*)::INT FROM clips WHERE status = 'pending'),
      'approvedClips', (SELECT count(*)::INT FROM clips WHERE status = 'approved'),
      'rejectedClips', (SELECT count(*)::INT FROM clips WHERE status = 'rejected'),
      'pendingCorrections', (SELECT count(*)::INT FROM corrections WHERE status = 'pending'),
      'approvedHours', ROUND(COALESCE((SELECT sum(duration) FROM clips WHERE status = 'approved'), 0)::NUMERIC / 3600, 1),
      'admins', (SELECT count(*)::INT FROM admin_config)
    ),
    'languageBreakdown', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'category', category,
          'clipCount', clip_count,
          'totalSeconds', total_seconds
        )
      )
      FROM language_totals
    ), '[]'::jsonb),
    'recentActivity', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', activity.id,
          'createdAt', activity.created_at,
          'kind', activity.kind,
          'summary', activity.summary,
          'actorName', activity.actor_name,
          'actorEmail', activity.actor_email
        )
        ORDER BY activity.created_at DESC
      )
      FROM (
        SELECT
          aal.id,
          aal.created_at,
          'admin'::TEXT AS kind,
          concat(aal.action, ' ', aal.entity_type) AS summary,
          COALESCE(u.display_name, split_part(au.email, '@', 1), 'Admin') AS actor_name,
          au.email AS actor_email
        FROM admin_audit_log aal
        LEFT JOIN users u ON u.id = aal.actor_id
        LEFT JOIN auth.users au ON au.id = aal.actor_id
        ORDER BY aal.created_at DESC
        LIMIT 12
      ) activity
    ), '[]'::jsonb)
  )
  INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  avatar TEXT,
  home_island TEXT,
  is_public BOOLEAN,
  contribution_count INTEGER,
  recordings_count INTEGER,
  corrections_count INTEGER,
  reviews_count INTEGER,
  xp_total INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_contribution_date DATE,
  last_contributed_at TIMESTAMPTZ,
  admin_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();

  RETURN QUERY
  SELECT
    u.id,
    au.email::TEXT,
    u.display_name,
    u.avatar,
    u.home_island,
    COALESCE(u.is_public, FALSE) AS is_public,
    COALESCE(u.contribution_count, 0) AS contribution_count,
    COALESCE(us.recordings_count, 0) AS recordings_count,
    COALESCE(us.corrections_count, 0) AS corrections_count,
    COALESCE(us.reviews_count, 0) AS reviews_count,
    COALESCE(us.xp_total, 0) AS xp_total,
    u.created_at,
    u.updated_at,
    us.last_contribution_date,
    u.last_contributed_at,
    ac.role
  FROM users u
  LEFT JOIN auth.users au ON au.id = u.id
  LEFT JOIN user_stats us ON us.id = u.id
  LEFT JOIN admin_config ac ON ac.user_id = u.id
  WHERE
    p_search IS NULL
    OR COALESCE(u.display_name, '') ILIKE '%' || p_search || '%'
    OR COALESCE(au.email, '') ILIKE '%' || p_search || '%'
  ORDER BY COALESCE(u.created_at, NOW()) DESC
  LIMIT GREATEST(COALESCE(p_limit, 100), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_contributors(
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  avatar TEXT,
  home_island TEXT,
  is_public BOOLEAN,
  contribution_count INTEGER,
  recordings_count INTEGER,
  corrections_count INTEGER,
  reviews_count INTEGER,
  xp_total INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_contribution_date DATE,
  last_contributed_at TIMESTAMPTZ,
  admin_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();

  RETURN QUERY
  SELECT *
  FROM public.admin_list_users(p_search, p_limit, p_offset)
  WHERE
    is_public = TRUE
    OR recordings_count > 0
    OR corrections_count > 0
    OR reviews_count > 0
  ORDER BY contribution_count DESC, created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_admins()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();

  RETURN QUERY
  SELECT
    ac.user_id,
    au.email::TEXT,
    u.display_name,
    ac.role,
    ac.created_at
  FROM admin_config ac
  LEFT JOIN auth.users au ON au.id = ac.user_id
  LEFT JOIN users u ON u.id = ac.user_id
  ORDER BY
    CASE ac.role WHEN 'superadmin' THEN 0 ELSE 1 END,
    ac.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_admin(
  p_user_id UUID,
  p_role TEXT DEFAULT 'admin'
)
RETURNS admin_config
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_row admin_config;
  result_row admin_config;
BEGIN
  PERFORM public.assert_superadmin();

  IF p_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Invalid admin role';
  END IF;

  SELECT * INTO current_row
  FROM admin_config
  WHERE user_id = p_user_id;

  INSERT INTO admin_config (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role
  RETURNING * INTO result_row;

  PERFORM public.insert_admin_audit_log(
    'upsert',
    'admin_config',
    p_user_id::TEXT,
    COALESCE(to_jsonb(current_row), '{}'::jsonb),
    to_jsonb(result_row)
  );

  RETURN result_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_remove_admin(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_row admin_config;
BEGIN
  PERFORM public.assert_superadmin();

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot remove your own admin access';
  END IF;

  SELECT * INTO current_row
  FROM admin_config
  WHERE user_id = p_user_id;

  DELETE FROM admin_config
  WHERE user_id = p_user_id;

  PERFORM public.insert_admin_audit_log(
    'delete',
    'admin_config',
    p_user_id::TEXT,
    COALESCE(to_jsonb(current_row), '{}'::jsonb),
    '{}'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_user_profile(
  p_user_id UUID,
  p_display_name TEXT DEFAULT NULL,
  p_avatar TEXT DEFAULT NULL,
  p_home_island TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT NULL
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_row users;
  result_row users;
BEGIN
  PERFORM public.assert_admin();

  SELECT * INTO current_row
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  UPDATE users
  SET
    display_name = COALESCE(p_display_name, display_name),
    avatar = COALESCE(p_avatar, avatar),
    home_island = COALESCE(p_home_island, home_island),
    is_public = COALESCE(p_is_public, is_public)
  WHERE id = p_user_id
  RETURNING * INTO result_row;

  PERFORM public.insert_admin_audit_log(
    'update',
    'user_profile',
    p_user_id::TEXT,
    to_jsonb(current_row),
    to_jsonb(result_row)
  );

  RETURN result_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_activity(p_limit INTEGER DEFAULT 25)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  actor_id UUID,
  actor_name TEXT,
  actor_email TEXT,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();

  RETURN QUERY
  SELECT
    aal.id,
    aal.created_at,
    aal.actor_id,
    COALESCE(u.display_name, split_part(au.email, '@', 1), 'Admin') AS actor_name,
    au.email::TEXT,
    aal.action,
    aal.entity_type,
    aal.entity_id
  FROM admin_audit_log aal
  LEFT JOIN users u ON u.id = aal.actor_id
  LEFT JOIN auth.users au ON au.id = aal.actor_id
  ORDER BY aal.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 25), 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_clips(
  p_status TEXT DEFAULT NULL,
  p_language TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  audio_url TEXT,
  duration INTEGER,
  language TEXT,
  dialect TEXT,
  transcription TEXT,
  status TEXT,
  correction_count INTEGER,
  is_duplicate BOOLEAN,
  contributed_by UUID,
  contributor_name TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  transcription_history JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();

  RETURN QUERY
  SELECT
    c.id,
    c.audio_url,
    c.duration,
    c.language,
    c.dialect,
    c.transcription,
    c.status,
    COALESCE(c.correction_count, 0) AS correction_count,
    COALESCE(c.is_duplicate, FALSE) AS is_duplicate,
    c.contributed_by,
    COALESCE(u.display_name, split_part(au.email, '@', 1), 'Contributor') AS contributor_name,
    c.reviewed_by,
    c.reviewed_at,
    c.created_at,
    c.updated_at,
    COALESCE(c.transcription_history, '[]'::jsonb)
  FROM clips c
  LEFT JOIN users u ON u.id = c.contributed_by
  LEFT JOIN auth.users au ON au.id = c.contributed_by
  WHERE
    (p_status IS NULL OR c.status = p_status)
    AND (p_language IS NULL OR c.language = p_language)
    AND (
      p_search IS NULL
      OR c.transcription ILIKE '%' || p_search || '%'
      OR COALESCE(u.display_name, '') ILIKE '%' || p_search || '%'
    )
  ORDER BY c.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 100), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_clip(
  p_clip_id UUID,
  p_status TEXT DEFAULT NULL,
  p_transcription TEXT DEFAULT NULL,
  p_is_duplicate BOOLEAN DEFAULT NULL
)
RETURNS clips
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_row clips;
  result_row clips;
  next_history JSONB;
BEGIN
  PERFORM public.assert_admin();

  SELECT * INTO current_row
  FROM clips
  WHERE id = p_clip_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clip not found';
  END IF;

  IF p_status IS NOT NULL AND p_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid clip status';
  END IF;

  next_history := COALESCE(current_row.transcription_history, '[]'::jsonb);

  IF p_transcription IS NOT NULL AND btrim(p_transcription) <> '' AND p_transcription <> current_row.transcription THEN
    next_history := next_history || jsonb_build_object(
      'text', p_transcription,
      'source', 'admin_edit',
      'updated_at', NOW(),
      'updated_by', auth.uid()
    );
  END IF;

  UPDATE clips
  SET
    status = COALESCE(p_status, status),
    transcription = COALESCE(NULLIF(p_transcription, ''), transcription),
    is_duplicate = COALESCE(p_is_duplicate, is_duplicate),
    reviewed_by = CASE WHEN p_status IS NULL THEN reviewed_by ELSE auth.uid() END,
    reviewed_at = CASE WHEN p_status IS NULL THEN reviewed_at ELSE NOW() END,
    transcription_history = next_history
  WHERE id = p_clip_id
  RETURNING * INTO result_row;

  PERFORM public.insert_admin_audit_log(
    'update',
    'clip',
    p_clip_id::TEXT,
    to_jsonb(current_row),
    to_jsonb(result_row)
  );

  RETURN result_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_corrections(
  p_status TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  clip_id UUID,
  original_text TEXT,
  suggested_text TEXT,
  status TEXT,
  review_note TEXT,
  suggested_by UUID,
  suggester_name TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  audio_url TEXT,
  clip_language TEXT,
  clip_dialect TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();

  RETURN QUERY
  SELECT
    c.id,
    c.clip_id,
    c.original_text,
    c.suggested_text,
    c.status,
    c.review_note,
    c.suggested_by,
    COALESCE(u.display_name, split_part(au.email, '@', 1), 'Contributor') AS suggester_name,
    c.reviewed_by,
    c.reviewed_at,
    c.created_at,
    clip.audio_url,
    clip.language,
    clip.dialect
  FROM corrections c
  LEFT JOIN users u ON u.id = c.suggested_by
  LEFT JOIN auth.users au ON au.id = c.suggested_by
  LEFT JOIN clips clip ON clip.id = c.clip_id
  WHERE
    (p_status IS NULL OR c.status = p_status)
    AND (
      p_search IS NULL
      OR c.original_text ILIKE '%' || p_search || '%'
      OR c.suggested_text ILIKE '%' || p_search || '%'
      OR COALESCE(u.display_name, '') ILIKE '%' || p_search || '%'
    )
  ORDER BY c.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 100), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_correction(
  p_correction_id UUID,
  p_decision TEXT,
  p_review_note TEXT DEFAULT NULL
)
RETURNS corrections
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_row corrections;
  result_row corrections;
BEGIN
  PERFORM public.assert_admin();

  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid correction decision';
  END IF;

  SELECT * INTO current_row
  FROM corrections
  WHERE id = p_correction_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Correction not found';
  END IF;

  UPDATE corrections
  SET
    status = p_decision,
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    review_note = p_review_note
  WHERE id = p_correction_id
  RETURNING * INTO result_row;

  IF p_decision = 'approved' THEN
    UPDATE clips
    SET
      transcription = current_row.suggested_text,
      status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = NOW(),
      transcription_history = COALESCE(transcription_history, '[]'::jsonb) || jsonb_build_object(
        'text', current_row.suggested_text,
        'source', 'correction',
        'correction_id', current_row.id,
        'approved_by', auth.uid(),
        'approved_at', NOW()
      )
    WHERE id = current_row.clip_id;
  END IF;

  UPDATE user_stats
  SET
    reviews_count = COALESCE(reviews_count, 0) + 1,
    updated_at = NOW()
  WHERE id = auth.uid();

  PERFORM public.insert_admin_audit_log(
    'review',
    'correction',
    p_correction_id::TEXT,
    to_jsonb(current_row),
    to_jsonb(result_row)
  );

  RETURN result_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_correction_v2(
  correction_id UUID,
  decision TEXT,
  admin_uid UUID,
  review_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF admin_uid IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'admin_uid must match the current session user';
  END IF;

  PERFORM public.admin_review_correction(correction_id, decision, review_note);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings_json JSONB;
  goals_json JSONB;
  roadmap_json JSONB;
BEGIN
  PERFORM public.assert_admin();

  SELECT jsonb_build_object(
    'id', id,
    'target_hours', target_hours,
    'target_dialects', target_dialects,
    'target_languages_hours', target_languages_hours,
    'updated_at', updated_at,
    'updated_by', updated_by
  )
  INTO goals_json
  FROM global_goals
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1;

  SELECT COALESCE(jsonb_object_agg(key, value), '{}'::jsonb)
  INTO settings_json
  FROM platform_settings;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'stage', p.stage,
      'period', p.period,
      'order_index', p.order_index,
      'items', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', i.id,
            'title', i.title,
            'description', i.description,
            'status', i.status,
            'order_index', i.order_index
          )
          ORDER BY i.order_index
        ), '[]'::jsonb)
        FROM roadmap_items i
        WHERE i.phase_id = p.id
      )
    )
    ORDER BY p.order_index
  ), '[]'::jsonb)
  INTO roadmap_json
  FROM roadmap_phases p;

  RETURN jsonb_build_object(
    'goals', COALESCE(goals_json, '{}'::jsonb),
    'platform', COALESCE(settings_json, '{}'::jsonb),
    'roadmap', roadmap_json
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_settings(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_goals global_goals;
  next_goals JSONB := COALESCE(p_payload->'goals', '{}'::jsonb);
  platform_payload JSONB := COALESCE(p_payload->'platform', '{}'::jsonb);
BEGIN
  PERFORM public.assert_admin();

  SELECT * INTO current_goals
  FROM global_goals
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1;

  IF current_goals.id IS NULL THEN
    INSERT INTO global_goals (target_hours, target_dialects, target_languages_hours, updated_by)
    VALUES (10, 4, '{}'::jsonb, auth.uid())
    RETURNING * INTO current_goals;
  END IF;

  UPDATE global_goals
  SET
    target_hours = COALESCE((next_goals->>'target_hours')::INTEGER, target_hours),
    target_dialects = COALESCE((next_goals->>'target_dialects')::INTEGER, target_dialects),
    target_languages_hours = COALESCE(next_goals->'target_languages_hours', target_languages_hours),
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE id = current_goals.id;

  INSERT INTO platform_settings (key, value, updated_at, updated_by)
  SELECT
    entry.key,
    entry.value,
    NOW(),
    auth.uid()
  FROM jsonb_each(platform_payload) AS entry
  ON CONFLICT (key)
  DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = EXCLUDED.updated_at,
    updated_by = EXCLUDED.updated_by;

  PERFORM public.insert_admin_audit_log(
    'update',
    'settings',
    'platform',
    jsonb_build_object(
      'goals', COALESCE(to_jsonb(current_goals), '{}'::jsonb)
    ),
    public.admin_get_settings()
  );

  RETURN public.admin_get_settings();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_site_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  goals JSONB;
  phases JSONB;
  site_preferences JSONB;
BEGIN
  SELECT jsonb_build_object(
    'target_hours', target_hours,
    'target_dialects', target_dialects,
    'target_languages_hours', target_languages_hours
  )
  INTO goals
  FROM global_goals
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'stage', p.stage,
      'period', p.period,
      'order_index', p.order_index,
      'items', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'title', i.title,
            'description', i.description,
            'status', i.status,
            'order_index', i.order_index
          )
          ORDER BY i.order_index
        ), '[]'::jsonb)
        FROM roadmap_items i
        WHERE i.phase_id = p.id
      )
    )
    ORDER BY p.order_index
  ), '[]'::jsonb)
  INTO phases
  FROM roadmap_phases p;

  SELECT value
  INTO site_preferences
  FROM platform_settings
  WHERE key = 'site_preferences';

  RETURN jsonb_build_object(
    'goals', COALESCE(goals, '{}'::jsonb),
    'roadmap', COALESCE(phases, '[]'::jsonb),
    'site_preferences', COALESCE(site_preferences, '{}'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_contributors(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_profile(UUID, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_activity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_clips(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_clip(UUID, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_corrections(TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_correction(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_settings(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_superadmin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_site_data() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_dataset_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER) TO anon, authenticated;
