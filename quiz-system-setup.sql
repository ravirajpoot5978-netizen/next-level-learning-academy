-- Next Level Learning Academy: secure quiz database foundation
-- Run after the existing courses, course_chapters, course_enrollments tables exist.

CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.course_chapters(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) >= 2),
  sort_order integer NOT NULL DEFAULT 0
);

-- Keep answer keys separate so students cannot read correct answers before submitting.
CREATE TABLE IF NOT EXISTS public.quiz_answer_keys (
  question_id uuid PRIMARY KEY REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  correct_option_index integer NOT NULL CHECK (correct_option_index >= 0),
  explanation text
);

-- Attempt table is created now; score submission will be enabled through a secure server-side function later.
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0),
  total_questions integer NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.quizzes, public.quiz_questions, public.quiz_attempts TO authenticated;
GRANT ALL ON public.quizzes, public.quiz_questions, public.quiz_answer_keys TO authenticated;
GRANT SELECT ON public.quiz_answer_keys TO authenticated;

DROP POLICY IF EXISTS "Students read published quizzes when enrolled" ON public.quizzes;
CREATE POLICY "Students read published quizzes when enrolled" ON public.quizzes
FOR SELECT TO authenticated USING (
  (is_published = true AND EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    WHERE ce.course_id = quizzes.course_id AND ce.student_id = (SELECT auth.uid())
  )) OR (SELECT public.is_admin())
);

DROP POLICY IF EXISTS "Students read questions for accessible quizzes" ON public.quiz_questions;
CREATE POLICY "Students read questions for accessible quizzes" ON public.quiz_questions
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_id AND (
    (q.is_published = true AND EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = q.course_id AND ce.student_id = (SELECT auth.uid())
    )) OR (SELECT public.is_admin())
  ))
);

DROP POLICY IF EXISTS "Admins manage quizzes" ON public.quizzes;
CREATE POLICY "Admins manage quizzes" ON public.quizzes
FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Admins manage quiz questions" ON public.quiz_questions
FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins only read answer keys" ON public.quiz_answer_keys;
CREATE POLICY "Admins only read answer keys" ON public.quiz_answer_keys
FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
DROP POLICY IF EXISTS "Admins manage answer keys" ON public.quiz_answer_keys;
CREATE POLICY "Admins manage answer keys" ON public.quiz_answer_keys
FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Students read own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Students read own quiz attempts" ON public.quiz_attempts
FOR SELECT TO authenticated USING (student_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
DROP POLICY IF EXISTS "Admins manage quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Admins manage quiz attempts" ON public.quiz_attempts
FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

CREATE INDEX IF NOT EXISTS quizzes_course_id_idx ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS quiz_questions_quiz_id_idx ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_student_id_idx ON public.quiz_attempts(student_id);


-- Secure quiz submission: answer keys stay private; scoring happens inside PostgreSQL.
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
RETURNS TABLE(attempt_id uuid, score integer, total_questions integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_student_id uuid := auth.uid();
  v_total integer;
  v_answer_count integer;
  v_score integer;
  v_attempt_id uuid;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF jsonb_typeof(p_answers) <> 'array' THEN
    RAISE EXCEPTION 'Answers must be a JSON array';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.course_enrollments ce ON ce.course_id = q.course_id
    WHERE q.id = p_quiz_id AND q.is_published = true AND ce.student_id = v_student_id
  ) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Quiz is not available for this student';
  END IF;
  SELECT count(*) INTO v_total FROM public.quiz_questions qq WHERE qq.quiz_id = p_quiz_id;
  SELECT count(*) INTO v_answer_count FROM jsonb_array_elements(p_answers);
  IF v_total = 0 OR v_answer_count <> v_total THEN
    RAISE EXCEPTION 'Please answer every question';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_answers) a
    WHERE NOT (a ? 'question_id') OR NOT (a ? 'selected_index')
       OR (a->>'selected_index') !~ '^[0-9]+$'
  ) THEN
    RAISE EXCEPTION 'Invalid answer format';
  END IF;
  IF (SELECT count(DISTINCT a->>'question_id') FROM jsonb_array_elements(p_answers) a) <> v_total THEN
    RAISE EXCEPTION 'Duplicate or missing question answers';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_answers) a
    LEFT JOIN public.quiz_questions qq ON qq.id = (a->>'question_id')::uuid AND qq.quiz_id = p_quiz_id
    WHERE qq.id IS NULL OR (a->>'selected_index')::integer >= jsonb_array_length(qq.options)
  ) THEN
    RAISE EXCEPTION 'Invalid question or option';
  END IF;
  SELECT count(*)::integer INTO v_score
  FROM jsonb_array_elements(p_answers) a
  JOIN public.quiz_answer_keys ak ON ak.question_id = (a->>'question_id')::uuid
  WHERE ak.correct_option_index = (a->>'selected_index')::integer;
  INSERT INTO public.quiz_attempts(quiz_id, student_id, score, total_questions)
  VALUES (p_quiz_id, v_student_id, v_score, v_total)
  RETURNING id INTO v_attempt_id;
  RETURN QUERY SELECT v_attempt_id, v_score, v_total;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, jsonb) TO authenticated;
