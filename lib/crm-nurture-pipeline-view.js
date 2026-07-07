/**
 * Build per-client nurture pipeline rows for Staff CRM Pipeline tab.
 */
const { buildNurtureSequenceCatalog } = require("./crm-nurture-sequence-catalog");
const { getCrmNurtureEmail, getCrmNurtureSms } = require("./crm-nurture-templates");
const {
  mergeEnrollmentTimeline,
  projectFutureContactedTasks,
} = require("./crm-nurture-engine");

const EMAIL_LABELS = {
  welcome: "Welcome",
  educational_day2: "Day 2 educational",
  contacted_educational: "Contacted nurture",
};

const SMS_LABELS = {
  welcome_sms: "Welcome",
  day2_sms: "Day 2 check-in",
};

function phaseLabelForTask(task) {
  const p = (task && task.payload) || {};
  if (p.projected) return "Contacted (planned)";
  if (p.recurring) return "Contacted";
  if (task.task_type === "stage_transition") return "New (days 0–3)";
  if (p.day != null && Number(p.day) <= 3) return "New (days 0–3)";
  if (["email", "sms", "call"].includes(task.task_type) && !p.recurring) return "New (days 0–3)";
  return "";
}

function taskStepName(task) {
  const p = (task && task.payload) || {};
  const type = String((task && task.task_type) || "").toLowerCase();
  if (type === "call") {
    const attempt = Number(p.attempt) || "?";
    return p.recurring ? `Call — Recurring (#${attempt})` : `Call — Attempt #${attempt}`;
  }
  if (type === "stage_transition") {
    return `Move to ${p.to_stage || "contacted"} stage`;
  }
  if (type === "email") {
    const label = EMAIL_LABELS[p.template] || p.template || "nurture";
    return p.recurring ? `Email — ${label} (recurring)` : `Email — ${label}`;
  }
  if (type === "sms") {
    const label = SMS_LABELS[p.template] || p.template || "nurture";
    return `SMS — ${label}`;
  }
  if (type === "notification") return "Internal notification";
  return type || "Step";
}

function catalogStepName(step) {
  if (step.channel === "call") {
    return step.call_attempt ? `Call — Attempt #${step.call_attempt}` : "Call task (Julie)";
  }
  if (step.channel === "stage_transition") return "Move to Contacted stage";
  if (step.channel === "email") {
    const label = EMAIL_LABELS[step.template] || step.template || "Email";
    return step.recurring ? `Email — ${label} (recurring)` : `Email — ${label}`;
  }
  if (step.channel === "sms") {
    const label = SMS_LABELS[step.template] || step.template || "SMS";
    return `SMS — ${label}`;
  }
  return step.channel_label || step.channel || "Step";
}

function channelUi(type) {
  const map = {
    call: "Call",
    email: "Email",
    sms: "SMS",
    stage_transition: "System",
    notification: "Internal",
    system: "System",
  };
  return map[String(type || "").toLowerCase()] || type || "";
}

function previewFromTask(task, contact, settings) {
  const p = (task && task.payload) || {};
  const type = String((task && task.task_type) || "").toLowerCase();
  if (type === "call") {
    return {
      kind: "call",
      description:
        p.recurring
          ? "Julie calls the lead on the recurring Contacted schedule."
          : `Julie calls the lead — attempt #${p.attempt || "?"}.`,
    };
  }
  if (type === "stage_transition") {
    return {
      kind: "system",
      description: `Automatically move lead to ${p.to_stage || "contacted"} if still in New stage.`,
    };
  }
  if (type === "email") {
    const tpl = getCrmNurtureEmail(p.template, contact || {}, settings);
    return {
      kind: "email",
      editable: false,
      subject: (tpl && tpl.subject) || "",
      body: (tpl && tpl.html) || "",
    };
  }
  if (type === "sms") {
    return {
      kind: "sms",
      editable: false,
      text: getCrmNurtureSms(p.template, contact || {}, settings) || "",
    };
  }
  if (type === "notification") {
    return { kind: "system", description: "Internal staff notification (not sent to lead)." };
  }
  return null;
}

function previewFromCatalog(step) {
  if (step.channel === "call") {
    return {
      kind: "call",
      description: (step.preview && step.preview.description) || "Julie call task.",
    };
  }
  if (step.channel === "stage_transition") {
    return {
      kind: "system",
      description: (step.preview && step.preview.description) || "Stage automation.",
    };
  }
  if (step.channel === "email") {
    return {
      kind: "email",
      editable: false,
      subject: (step.preview && step.preview.subject) || "",
      body: (step.preview && step.preview.html) || "",
    };
  }
  if (step.channel === "sms") {
    return {
      kind: "sms",
      editable: false,
      text: (step.preview && step.preview.body) || "",
    };
  }
  return null;
}

function mapTaskStatus(task, nowIso) {
  const status = String((task && task.status) || "").toLowerCase();
  const due = task && task.due_at ? new Date(task.due_at).getTime() : 0;
  const now = nowIso ? new Date(nowIso).getTime() : Date.now();
  if (status === "skipped" && task.cancelled_reason === "backdated_past_due") return "missed";
  if (task.payload && task.payload.projected) return "upcoming";
  if (status === "pending" && due > now) return "upcoming";
  return status || "pending";
}

function detailReason(task) {
  if (!task) return null;
  if (task.cancelled_reason) return String(task.cancelled_reason);
  if (task.error) return String(task.error);
  return null;
}

function tasksToRows(tasks, callTasksByNurtureId, contact, settings, nowIso) {
  const sorted = (tasks || []).slice().sort((a, b) => {
    const da = new Date(a.due_at || 0).getTime();
    const db = new Date(b.due_at || 0).getTime();
    return da - db;
  });

  let nextIdx = sorted.findIndex((t) => {
    const s = mapTaskStatus(t, nowIso);
    return s === "pending" || s === "upcoming";
  });

  return sorted.map((task, idx) => {
    const callTask = callTasksByNurtureId && callTasksByNurtureId.get(task.id);
    const sentAt =
      task.completed_at ||
      (callTask && callTask.completed_at) ||
      null;
    return {
      stageNumber: idx + 1,
      task_id: task.id || null,
      phase_label: phaseLabelForTask(task),
      name: taskStepName(task),
      channel: task.task_type === "stage_transition" ? "system" : task.task_type,
      channelUi: channelUi(task.task_type),
      scheduled_at: task.due_at || null,
      actual_sent_at: sentAt,
      status: mapTaskStatus(task, nowIso),
      is_next: idx === nextIdx,
      detail_reason:
        task.cancelled_reason === "backdated_past_due" ? null : detailReason(task),
      preview: previewFromTask(task, contact, settings),
      recurring: !!(task.payload && task.payload.recurring),
    };
  });
}

function catalogStepsForStage(stage, settings, contact) {
  const catalog = buildNurtureSequenceCatalog(settings);
  const s = String(stage || "new").toLowerCase();
  const phases = s === "new" ? ["new"] : ["new", "contacted"];
  const steps = (catalog.steps || []).filter((st) => phases.includes(st.phase));
  return steps.map((step, idx) => ({
    stageNumber: idx + 1,
    phase_label: step.phase === "contacted" ? "Contacted" : "New (days 0–3)",
    name: catalogStepName(step),
    channel: step.channel === "stage_transition" ? "system" : step.channel,
    channelUi: channelUi(step.channel),
    scheduled_at: null,
    actual_sent_at: null,
    status: "not_enrolled",
    is_next: idx === 0,
    detail_reason: null,
    preview: previewFromCatalog(step),
  }));
}

function sequenceLabelForStage(stage) {
  const s = String(stage || "new").toLowerCase();
  if (s === "new") return "New — intensive sequence (days 0–3)";
  if (s === "lost") return "Newsletter only — no auto nurture";
  return "New (days 0–3) + Contacted long-term";
}

function findNextSendAt(tasks, nowIso) {
  const pending = (tasks || [])
    .filter((t) => {
      const s = mapTaskStatus(t, nowIso);
      return s === "pending" || s === "upcoming";
    })
    .sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
  return pending.length ? pending[0].due_at : null;
}

function buildClientPipelineView(opts) {
  const {
    enrollment,
    tasks,
    callTasks,
    settings,
    contact,
    pipelineStage,
    includeStopped,
  } = opts || {};
  const nowIso = new Date().toISOString();
  const callTasksByNurtureId = new Map();
  (callTasks || []).forEach((ct) => {
    if (ct && ct.nurture_task_id) callTasksByNurtureId.set(ct.nurture_task_id, ct);
  });

  const stage = pipelineStage || (enrollment && enrollment.stage) || "new";
  const enrolled = !!(enrollment && ["active", "paused"].includes(String(enrollment.status)));

  let steps = [];
  if (enrollment && (enrolled || includeStopped)) {
    const now = new Date();
    let timeline = mergeEnrollmentTimeline(enrollment, tasks, settings, now);
    if (String(enrollment.stage || "").toLowerCase() === "contacted") {
      timeline = timeline.concat(projectFutureContactedTasks(timeline, settings, now, 3));
      timeline.sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
    }
    steps = tasksToRows(timeline, callTasksByNurtureId, contact, settings, nowIso);
  } else if (!enrollment || !enrolled) {
    steps = catalogStepsForStage(stage, settings, contact);
  }

  const nurtureMeta = enrollment
    ? {
        id: enrollment.id,
        status: enrollment.status,
        stage: enrollment.stage,
        enrolled_at: enrollment.enrolled_at,
        cancelled_reason: enrollment.cancelled_reason || null,
        completed_at: enrollment.completed_at || null,
        next_send_at: findNextSendAt(tasks, nowIso),
        backdated: !!(enrollment.enrolled_at && enrollment.created_at &&
          new Date(enrollment.enrolled_at).getTime() <
            new Date(enrollment.created_at).getTime() - 60000),
      }
    : null;

  return {
    enrolled,
    pipeline_stage: stage,
    nurture_enrollment: nurtureMeta,
    steps,
    sequence_label: sequenceLabelForStage(stage),
  };
}

module.exports = {
  buildClientPipelineView,
  taskStepName,
  catalogStepsForStage,
  channelUi,
};
