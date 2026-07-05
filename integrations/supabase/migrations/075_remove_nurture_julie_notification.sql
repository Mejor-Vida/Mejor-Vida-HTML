-- New-lead staff email + IC CSV is handled by lib/ic-lead-notify.js (Gmail).
-- Remove duplicate nurture-engine Julie notification on Day 0 enrollment.

UPDATE public.crm_nurture_settings
SET
  config = config #- '{new_sequence,day0,julie_notification}',
  updated_at = now()
WHERE settings_key = 'default'
  AND config #> '{new_sequence,day0,julie_notification}' IS NOT NULL;

UPDATE public.crm_nurture_tasks
SET
  status = 'cancelled',
  cancelled_reason = 'removed_duplicate_ic_notify'
WHERE task_type = 'notification'
  AND status = 'pending';
