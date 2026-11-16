-- Run after the course_enrollments table has been created.
-- Grants the dashboard the minimum access it needs and restricts student enrollment to published courses.

-- Students may read published courses; admins may read all courses.
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.courses TO authenticated;
DROP POLICY IF EXISTS "Students view published courses" ON public.courses;
CREATE POLICY "Students view published courses"
ON public.courses FOR SELECT TO authenticated
USING (is_published = true OR public.is_admin());

-- Students may view their own enrollments and enroll themselves in published courses.
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.course_enrollments TO authenticated;
DROP POLICY IF EXISTS "Students view own enrollments" ON public.course_enrollments;
CREATE POLICY "Students view own enrollments"
ON public.course_enrollments FOR SELECT TO authenticated
USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Students enroll themselves" ON public.course_enrollments;
CREATE POLICY "Students enroll themselves"
ON public.course_enrollments FOR INSERT TO authenticated
WITH CHECK (
  student_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_id AND c.is_published = true
  )
);

-- Ensure the language preference column exists, then allow students to update only that field.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'hinglish'
CHECK (preferred_language IN ('hi', 'en', 'hinglish'));
GRANT UPDATE (preferred_language) ON public.profiles TO authenticated;
