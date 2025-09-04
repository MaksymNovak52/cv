import { CandidateRow } from "@/type";

function hashStr(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickAvatar(c: CandidateRow) {
  const key =
    (c as any).application_id ??
    (c as any).id ??
    c.full_name ??
    Math.random().toString();

  const h = hashStr(String(key));

  const folders = ["man", "woman"];
  const folder = folders[h % folders.length];

  const counts: Record<string, number> = { man: 4, woman: 4 };
  const count = counts[folder] ?? 4;

  const idx = (Math.floor(h / folders.length) % count) + 1;
  return `/${folder}/img-${idx}.png`;
}

export { pickAvatar };
