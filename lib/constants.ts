export const PROJECT_STATUSES = [
  "discovery",
  "scoping",
  "waiting_client",
  "validation",
  "ready_for_dev",
  "in_development",
  "testing",
  "delivered",
  "closed"
] as const;

export const FLOW_DIRECTIONS = ["unidirectional", "bidirectional"] as const;
export const FLOW_TRIGGERS = ["webhook", "api_polling", "manual"] as const;
export const FLOW_MODES = ["realtime", "scheduled", "manual"] as const;
export const FLOW_FREQUENCIES = ["instant", "5min", "15min", "hourly", "daily"] as const;
export const QUESTION_TYPES = ["text", "boolean", "select"] as const;
export const QUESTION_CATEGORIES = ["business", "functional", "technical", "security", "data"] as const;
export const QUESTION_STATUS = ["open", "waiting_client", "answered"] as const;
export const RISK_STATUS = ["open", "mitigated", "resolved"] as const;
export const MILESTONE_STATUS = ["todo", "in_progress", "done", "blocked"] as const;
export const PROJECT_SYSTEM_ROLES = ["source", "target", "both"] as const;

export const PROJECT_STATUS_LABELS: Record<(typeof PROJECT_STATUSES)[number], string> = {
  discovery: "Découverte",
  scoping: "Cadrage",
  waiting_client: "En attente client",
  validation: "Validation",
  ready_for_dev: "Prêt pour développement",
  in_development: "En développement",
  testing: "Tests",
  delivered: "Livré",
  closed: "Clôturé"
};

export const FLOW_DIRECTION_LABELS: Record<(typeof FLOW_DIRECTIONS)[number], string> = {
  unidirectional: "Unidirectionnel",
  bidirectional: "Bidirectionnel"
};

export const FLOW_TRIGGER_LABELS: Record<(typeof FLOW_TRIGGERS)[number], string> = {
  webhook: "Webhook",
  api_polling: "Polling API",
  manual: "Manuel"
};

export const FLOW_MODE_LABELS: Record<(typeof FLOW_MODES)[number], string> = {
  realtime: "Temps réel",
  scheduled: "Planifié",
  manual: "Manuel"
};

export const FLOW_FREQUENCY_LABELS: Record<(typeof FLOW_FREQUENCIES)[number], string> = {
  instant: "Instantané",
  "5min": "Toutes les 5 min",
  "15min": "Toutes les 15 min",
  hourly: "Toutes les heures",
  daily: "Quotidien"
};

export const FLOW_FREQUENCY_DB_LABELS: Record<string, string> = {
  instant: "Instantané",
  minutes_5: "Toutes les 5 min",
  minutes_15: "Toutes les 15 min",
  hourly: "Toutes les heures",
  daily: "Quotidien"
};

export const MAPPING_DIRECTIONS = ["source_to_target", "target_to_source"] as const;
export const MAPPING_DIRECTION_LABELS: Record<(typeof MAPPING_DIRECTIONS)[number], string> = {
  source_to_target: "Source → Cible",
  target_to_source: "Cible → Source"
};

export const QUESTION_STATUS_LABELS: Record<(typeof QUESTION_STATUS)[number], string> = {
  open: "Ouverte",
  waiting_client: "En attente client",
  answered: "Répondu"
};

export const RISK_STATUS_LABELS: Record<(typeof RISK_STATUS)[number], string> = {
  open: "Ouvert",
  mitigated: "Atténué",
  resolved: "Résolu"
};

export const MILESTONE_STATUS_LABELS: Record<(typeof MILESTONE_STATUS)[number], string> = {
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminé",
  blocked: "Bloqué"
};

export const PROJECT_SYSTEM_ROLE_LABELS: Record<(typeof PROJECT_SYSTEM_ROLES)[number], string> = {
  source: "Source",
  target: "Cible",
  both: "Les deux"
};
