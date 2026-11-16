-- Next Level Learning Academy: secure attempts for Admin-published Learning Lab quizzes
-- Run once in Supabase SQL Editor after learning-lab-content.sql.

CREATE TABLE IF NOT EXISTS public.learning_lab_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.learning_lab_items(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0),
  total_questions integer NOT NULL CHECK (total_questions > 0 AND score <= total_questions),
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS learning_lab_quiz_attempts_student_idx
  ON public.learning_lab_quiz_attempts (student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS learning_lab_quiz_attempts_item_idx
  ON public.learning_lab_quiz_attempts (item_id, submitted_at DESC);

ALTER TABLE public.learning_lab_quiz_attempts ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.learning_lab_quiz_attempts TO authenticated;

DROP POLICY IF EXISTS "Students read own Learning Lab quiz attempts" ON public.learning_lab_quiz_attempts;
CREATE POLICY "Students read own Learning Lab quiz attempts"
ON public.learning_lab_quiz_attempts FOR SELECT TO authenticated
USING (student_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

-- Do not expose the answer index in the published quiz JSON to students.
-- Students fetch only the sanitized quiz through this function; Admins retain table access.
DROP POLICY IF EXISTS "Published learning lab items are readable" ON public.learning_lab_items;
CREATE POLICY "Published learning lab items are readable"
ON public.learning_lab_items FOR SELECT
USING ((is_published = true AND item_type <> 'quiz') OR (SELECT public.is_admin()));

DROP FUNCTION IF EXISTS public.get_published_learning_lab_quizzes();
CREATE FUNCTION public.get_published_learning_lab_quizzes()
RETURNS TABLE(id uuid, title text, subject text, content jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT li.id, li.title, li.subject,
    CASE WHEN jsonb_typeof(li.content -> 'questions') = 'array' THEN
      jsonb_set(
        li.content,
        '{questions}',
        COALESCE(
          (SELECT jsonb_agg(q.value - 'answer' ORDER BY q.ordinality)
           FROM jsonb_array_elements(li.content -> 'questions') WITH ORDINALITY AS q(value, ordinality)),
          '[]'::jsonb
        ),
        true
      )
    ELSE li.content END AS content
  FROM public.learning_lab_items li
  WHERE li.item_type = 'quiz' AND li.is_published = true
  ORDER BY li.created_at DESC
  LIMIT 60;
$$;
REVOKE ALL ON FUNCTION public.get_published_learning_lab_quizzes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_published_learning_lab_quizzes() TO anon, authenticated;

-- PostgreSQL validates answers, calculates the score and returns answer review only
-- after submission. Students cannot directly insert or modify attempt scores.
DROP FUNCTION IF EXISTS public.submit_learning_lab_quiz_attempt(uuid, jsonb);
CREATE FUNCTION public.submit_learning_lab_quiz_attempt(
  p_item_id uuid,
  p_answers jsonb
)
RETURNS TABLE(attempt_id uuid, score integer, total_questions integer, review jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_student_id uuid := auth.uid();
  v_content jsonb;
  v_questions jsonb;
  v_question jsonb;
  v_options jsonb;
  v_total integer;
  v_score integer := 0;
  v_idx integer;
  v_selected integer;
  v_answer integer;
  v_attempt_id uuid;
  v_review jsonb := '[]'::jsonb;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF COALESCE(jsonb_typeof(p_answers), '') <> 'array' THEN
    RAISE EXCEPTION 'Answers must be a JSON array';
  END IF;

  SELECT li.content INTO v_content
  FROM public.learning_lab_items li
  WHERE li.id = p_item_id AND li.item_type = 'quiz'
    AND (li.is_published = true OR public.is_admin());

  IF v_content IS NULL THEN
    RAISE EXCEPTION 'Published quiz not found';
  END IF;

  v_questions := v_content -> 'questions';
  IF COALESCE(jsonb_typeof(v_questions), '') <> 'array' THEN
    RAISE EXCEPTION 'Quiz questions are invalid';
  END IF;
  v_total := jsonb_array_length(v_questions);
  IF v_total < 1 OR v_total > 100 OR jsonb_array_length(p_answers) <> v_total THEN
    RAISE EXCEPTION 'Answer count does not match quiz questions';
  END IF;

  FOR v_idx IN 0..v_total - 1 LOOP
    v_question := v_questions -> v_idx;
    v_options := v_question -> 'options';
    IF COALESCE(jsonb_typeof(v_options), '') <> 'array' THEN
      RAISE EXCEPTION 'Options are invalid for question %', v_idx + 1;
    END IF;
    IF jsonb_array_length(v_options) < 2
       OR v_question ->> 'answer' IS NULL
       OR (v_question ->> 'answer') !~ '^[0-9]+$' THEN
      RAISE EXCEPTION 'Question % is invalid', v_idx + 1;
    END IF;
    v_answer := (v_question ->> 'answer')::integer;
    IF v_answer >= jsonb_array_length(v_options) THEN
      RAISE EXCEPTION 'Correct answer index is invalid for question %', v_idx + 1;
    END IF;

    IF p_answers -> v_idx <> 'null'::jsonb THEN
      IF COALESCE(jsonb_typeof(p_answers -> v_idx), '') <> 'number'
         OR (p_answers ->> v_idx) !~ '^[0-9]+$' THEN
        RAISE EXCEPTION 'Selected answer is invalid for question %', v_idx + 1;
      END IF;
      v_selected := (p_answers ->> v_idx)::integer;
      IF v_selected >= jsonb_array_length(v_options) THEN
        RAISE EXCEPTION 'Selected option is invalid for question %', v_idx + 1;
      END IF;
      IF v_selected = v_answer THEN
        v_score := v_score + 1;
      END IF;
    END IF;

    v_review := v_review || jsonb_build_array(jsonb_build_object(
      'correct_index', v_answer,
      'explanation', COALESCE(v_question ->> 'explanation', '')
    ));
  END LOOP;

  INSERT INTO public.learning_lab_quiz_attempts(item_id, student_id, score, total_questions)
  VALUES (p_item_id, v_student_id, v_score, v_total)
  RETURNING id INTO v_attempt_id;

  RETURN QUERY SELECT v_attempt_id, v_score, v_total, v_review;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_learning_lab_quiz_attempt(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_learning_lab_quiz_attempt(uuid, jsonb) TO authenticated;
