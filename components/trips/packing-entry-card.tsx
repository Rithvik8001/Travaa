import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { PackingListView } from "@/lib/trips/packing";

export function PackingEntryCard({
  tripId,
  lists,
}: {
  readonly tripId: string;
  readonly lists: readonly PackingListView[];
}) {
  const total = lists.reduce((sum, list) => sum + list.totalCount, 0);
  const completed = lists.reduce((sum, list) => sum + list.completedCount, 0);

  return (
    <section aria-labelledby="packing-entry-title">
      <Card className="p-5 min-[560px]:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="packing-entry-title"
              className="text-ink text-[19px] font-semibold tracking-[-0.02em]"
            >
              Packing
            </h2>
            <p className="text-muted-foreground mt-1 text-[13.5px] leading-[1.5]">
              Shared lists for the crew, private lists for your own bag.
            </p>
            {total > 0 ? (
              <p className="text-subtle-foreground mt-2 font-mono text-[12px] tabular-nums">
                {completed} of {total} packed across {lists.length}{" "}
                {lists.length === 1 ? "list" : "lists"}
              </p>
            ) : null}
          </div>
          <Link
            href={`/trips/${tripId}/packing`}
            className="text-ink hover:bg-surface-2 rounded-[6px] px-3 py-1.5 text-[13.5px] font-medium transition-[background-color]"
          >
            Open packing →
          </Link>
        </div>
      </Card>
    </section>
  );
}
