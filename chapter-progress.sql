-- Student chapter completion tracking
-- Run in Supabase SQL Editor after course_chapters and course_enrollments exist.
CREATE TABLE IF NOT EXISTS public.chapter_progress (
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.course_chapters(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, chapter_id)
);
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.chapter_progress TO authenticated;
DROP POLICY IF EXISTS "Students read own chapter progress" ON public.chapter_progress;
CREATE POLICY "Students read own chapter progress" ON public.chapter_progress
FOR SELECT TO authenticated USING (student_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));
DROP POLICY IF EXISTS "Enrolled students mark published chapters complete" ON public.chapter_progress;
CREATE POLICY "Enrolled students mark published chapters complete" ON public.chapter_progress
FOR INSERT TO authenticated WITH CHECK (
  student_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.course_chapters ch
    JOIN public.course_enrollments ce ON ce.course_id = ch.course_id
    WHERE ch.id = chapter_id AND ce.student_id = (SELECT auth.uid())
      AND ch.is_published = true
  )
);
DROP POLICY IF EXISTS "Students undo own chapter completion" ON public.chapter_progress;
CREATE POLICY "Students undo own chapter completion" ON public.chapter_progress
FOR DELETE TO authenticated USING (student_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Admins manage chapter progress" ON public.chapter_progress;
CREATE POLICY "Admins manage chapter progress" ON public.chapter_progress
FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
CREATE INDEX IF NOT EXISTS chapter_progress_student_idx ON public.chapter_progress(student_id);
