-- Contacted-stage nurture: email only (4 call attempts stay in New sequence days 0–3).

UPDATE public.crm_nurture_settings
SET
  config = (config #- '{contacted_sequence,call_interval_days}') #- '{contacted_sequence,call_time}',
  updated_at = now()
WHERE settings_key = 'default';

UPDATE public.crm_nurture_tasks t
SET
  status = 'cancelled',
  cancelled_reason = 'contacted_calls_removed'
FROM public.crm_nurture_enrollments e
WHERE t.enrollment_id = e.id
  AND e.stage = 'contacted'
  AND t.task_type = 'call'
  AND t.status = 'pending';

UPDATE public.crm_call_tasks
SET status = 'cancelled'
WHERE stage = 'contacted'
  AND status = 'pending';
