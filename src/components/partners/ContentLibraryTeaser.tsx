import { tr } from "@/lib/chrome";
import { contentLibraryCategories } from "@/data/partnerProgram";
import { trData } from "@/lib/localizeContent";

export default function ContentLibraryTeaser() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {trData(contentLibraryCategories).map((cat) => (
        <div
          key={cat.title}
          className="group relative overflow-hidden rounded-2xl border border-hairline-light bg-paper-high p-6 transition-colors hover:border-signal/40"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-poppins text-base font-semibold text-text-dark">
              {cat.title}
            </h3>
            <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
              {cat.itemCount} öğe
            </span>
          </div>
          <p className="mt-3 max-h-0 overflow-hidden text-sm leading-relaxed text-text-muted opacity-0 transition-all duration-300 group-hover:max-h-24 group-hover:opacity-100">
            {cat.description}
          </p>
          <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.15em] text-signal">
            {tr("Partner hesabınıza dahildir")}
          </span>
        </div>
      ))}
    </div>
  );
}
