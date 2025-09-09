import { CandidateRow } from "@/type";

function hashStr(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function normalizeGender(gRaw: unknown): "male" | "female" | "unknown" {
  const g = String(gRaw ?? "")
    .trim()
    .toLowerCase();

  const femaleSet = new Set([
    "female",
    "woman",
    "f",
    "girl",
    "жінка",
    "дівчина",
  ]);
  const maleSet = new Set([
    "male",
    "man",
    "m",
    "boy",
    "чоловік",
    "хлопець",
    "хлопчик",
  ]);

  if (femaleSet.has(g)) return "female";
  if (maleSet.has(g)) return "male";
  return "unknown";
}

function pickAvatar(c: CandidateRow) {
  const key =
    (c as any).application_id ??
    (c as any).id ??
    c.full_name ??
    Math.random().toString();

  const h = hashStr(String(key));
  const counts: Record<string, number> = { men: 4, man: 4, woman: 4 };

  const g = normalizeGender((c as any).gender);
  let folder: string;

  if (g === "female") {
    folder = "woman";
  } else if (g === "male") {
    folder = "men";
  } else {
    const fallbackFolders = ["men", "woman"];
    folder = fallbackFolders[h % fallbackFolders.length];
  }

  const count = counts[folder] ?? 4;
  const idx = (Math.floor(h / 2) % count) + 1;

  return `/${folder}/img-${idx}.png`;
}

export { pickAvatar };
