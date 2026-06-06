-- 自定义注册函数（绕过 GoTrue 生成列兼容问题）
CREATE OR REPLACE FUNCTION public.signup_user(
  p_email text,
  p_password text
) RETURNS json AS $$
DECLARE
  v_user_id uuid;
  v_encrypted_password text;
BEGIN
  -- 检查邮箱是否已注册
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN json_build_object('error', '该邮箱已注册');
  END IF;

  SELECT crypt(p_password, gen_salt('bf')) INTO v_encrypted_password;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    v_encrypted_password,
    now(),
    now(),
    json_build_object('provider', 'email', 'providers', json_build_array('email')),
    json_build_object('email_verified', true),
    now(),
    now()
  ) RETURNING id INTO v_user_id;

  INSERT INTO auth.identities (
    id, user_id, provider, provider_id,
    identity_data, created_at, updated_at, last_sign_in_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    'email',
    v_user_id::text,
    json_build_object(
      'email', p_email,
      'email_verified', false,
      'phone_verified', false,
      'sub', v_user_id::text
    ),
    now(),
    now(),
    now()
  );

  RETURN json_build_object('user_id', v_user_id, 'email', p_email, 'status', 'ok');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 验证密码函数
CREATE OR REPLACE FUNCTION public.verify_password(
  p_email text,
  p_password text
) RETURNS json AS $$
DECLARE
  v_user record;
BEGIN
  SELECT id, email, encrypted_password, raw_app_meta_data, raw_user_meta_data
  INTO v_user
  FROM auth.users
  WHERE email = p_email;

  IF v_user IS NULL THEN
    RETURN json_build_object('valid', false, 'error', '用户不存在');
  END IF;

  IF v_user.encrypted_password = crypt(p_password, v_user.encrypted_password) THEN
    -- 更新 last_sign_in_at
    UPDATE auth.users SET last_sign_in_at = now() WHERE id = v_user.id;
    RETURN json_build_object('valid', true, 'user_id', v_user.id, 'email', v_user.email);
  ELSE
    RETURN json_build_object('valid', false, 'error', '密码错误');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
