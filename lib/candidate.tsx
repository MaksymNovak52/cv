import { TabKey } from "@/type";

const cleanClearanceStatus = (clearance: string | null): string => {
  if (!clearance) return "";
  return clearance.replace(/^English\s*/i, "").trim();
};

function normalizeToTab(statusRaw?: string | null): TabKey {
  const s = (statusRaw || "").trim().toLowerCase();
  if (!s) return "new";
  if (/(reject|rejected|declin)/.test(s)) return "reject";
  if (/(hold|not[\s_-]?sure)/.test(s)) return "not-sure";
  if (/interview/.test(s)) return "interview";
  if (/(new|pending|applied|submitted)/.test(s)) return "new";
  return "new";
}

const validateEmail = (value: string) => {
  const v = value.trim();
  if (!v) return "Email is required";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!re.test(v)) return "Invalid email";
  return "";
};

const validatePassword = (value: string) => {
  if (!value) return "Password is required";
  if (value.length < 6) return "Password must be at least 6 characters";
  return "";
};

export {
  cleanClearanceStatus,
  normalizeToTab,
  validateEmail,
  validatePassword,
};
