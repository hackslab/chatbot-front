import { ApplicationType } from "./types";

export const APPLICATION_TYPE_OPTIONS: { value: ApplicationType; label: string }[] = [
  { value: "API", label: "API" },
  { value: "TELEGRAM_BOT", label: "Telegram Bot" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "FACEBOOK", label: "Facebook" },
];

const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  API: "API",
  TELEGRAM_BOT: "Telegram Bot",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  FACEBOOK: "Facebook",
};

export function formatApplicationType(type?: ApplicationType) {
  if (!type) return "API";
  return APPLICATION_TYPE_LABELS[type] ?? type;
}
