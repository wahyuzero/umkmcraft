/**
 * Modul team_members_grid — profil tim/kru (TEMPLATE_RESEARCH §4).
 * Referensi pola: Start Bootstrap Agency team, BootstrapMade chefs/trainers,
 * Framer Barber team section.
 * Tanpa foto → avatar inisial berlatar token tema (bukan gambar acak).
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SafeImage, SectionHeader, SectionShell } from "../primitives";

export type TeamMembersProps = SectionProps<"team_members_grid">;

export const teamDefaults: TeamMembersProps = {
  section_title: "Tim Kami",
  section_subtitle: "Orang-orang di balik layanan yang Anda terima.",
  members: [
    { name: "Nama Pemilik", role: "Founder", bio: "Berdiri sejak awal, menjaga kualitas tetap konsisten.", avatar_url: "" },
    { name: "Nama Kru", role: "Spesialis", bio: "Ahli di bidangnya, siap bantu kebutuhan Anda.", avatar_url: "" },
  ],
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

const AVATAR_TONES = [
  "bg-[color-mix(in_oklab,var(--uc-primary)_18%,var(--uc-surface))] text-[var(--uc-primary)]",
  "bg-[color-mix(in_oklab,var(--uc-secondary)_18%,var(--uc-surface))] text-[var(--uc-secondary)]",
  "bg-[color-mix(in_oklab,var(--uc-primary)_10%,var(--uc-surface))] text-[color-mix(in_oklab,var(--uc-primary)_80%,var(--uc-ink))]",
];

export function TeamMembersGrid({ id, props, category = "" }: { id: string; props: TeamMembersProps; category?: string }) {
  return (
    <SectionShell id={id} tone="surface">
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {props.members.map((member, i) => (
          <li
            key={i}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] p-6 text-center"
          >
            {member.avatar_url ? (
              <SafeImage
                src={member.avatar_url}
                alt={member.name}
                label={member.name}
                category={category}
                aspect="aspect-square"
                className="h-24 w-24 rounded-full"
              />
            ) : (
              <span
                aria-hidden
                className={`flex h-24 w-24 items-center justify-center rounded-full font-[family-name:var(--uc-font-heading)] text-2xl font-extrabold ${
                  AVATAR_TONES[i % AVATAR_TONES.length]
                }`}
              >
                {initialsOf(member.name)}
              </span>
            )}
            <div>
              <h3 className="font-[family-name:var(--uc-font-heading)] text-[1.05rem] font-extrabold text-[var(--uc-ink)]">
                {member.name}
              </h3>
              {member.role ? (
                <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--uc-primary)]">
                  {member.role}
                </p>
              ) : null}
            </div>
            {member.bio ? (
              <p className="text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_68%,transparent)]">
                {member.bio}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
