import { Avatar } from "@/components/ui/avatar";
import { avatarColor } from "@/lib/avatar-color";
import type { TripMemberView } from "@/lib/trips/queries";

/** Overlapping crew avatars for the trip header (Travaa.dc.html). Owner first. */
export function MemberStack({
  members,
  max = 6,
}: {
  readonly members: readonly TripMemberView[];
  readonly max?: number;
}) {
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((m) => (
        <Avatar
          key={m.id}
          initial={m.name.slice(0, 1).toUpperCase()}
          color={avatarColor(m.id)}
          className="ring-background -ml-[9px] size-[34px] text-[13px] ring-[2.5px] first:ml-0"
        />
      ))}
      {overflow > 0 ? (
        <span className="ring-background bg-muted text-muted-foreground -ml-[9px] flex size-[34px] items-center justify-center rounded-full text-[12px] font-semibold ring-[2.5px]">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
