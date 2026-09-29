import { Skeleton, SkeletonRegion } from './Skeleton';

// Squelettes calqués sur la mise en page réelle de chaque page (mêmes conteneurs, mêmes marges) :
// le contenu remplace le squelette sans décalage.

const card = 'bg-white rounded-3xl border border-[#fed7aa]/60 shadow-xs';

export function CheckoutSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label} className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 gap-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-72 rounded-full hidden sm:block" />
      </div>
      <div className="mb-8 flex flex-col gap-3">
        <Skeleton className="h-3 w-52" />
        <Skeleton className="h-8 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className={`${card} p-6 flex flex-col gap-5`}>
            <Skeleton className="h-9 w-64" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <div className={`${card} p-6 flex flex-col gap-4`}>
            <Skeleton className="h-6 w-56" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-11 rounded-2xl" />
              <Skeleton className="h-11 rounded-2xl" />
            </div>
            <Skeleton className="h-11 rounded-2xl" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className={`${card} p-6 flex flex-col gap-4`}>
            <Skeleton className="h-6 w-48" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}

export function ConfirmationSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label} className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className={`${card} p-6 sm:p-10 flex flex-col items-center gap-4`}>
        <Skeleton className="h-10 w-56 rounded-2xl" />
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-8 w-full max-w-sm" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-16 w-full rounded-2xl mt-2" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </SkeletonRegion>
  );
}

export function SellerAdminSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label} className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      <div className="bg-gradient-dark rounded-3xl p-6 sm:p-8 border border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <Skeleton dark className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0" />
          <div className="flex flex-col gap-3 min-w-0 flex-1">
            <Skeleton dark className="h-4 w-48" />
            <Skeleton dark className="h-8 w-72 max-w-full" />
            <Skeleton dark className="h-4 w-80 max-w-full" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton dark className="h-10 w-44 max-w-full rounded-2xl" />
          <Skeleton dark className="h-10 w-40 max-w-full rounded-2xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${card} p-5 flex items-center justify-between`}>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="w-12 h-12 rounded-2xl" />
          </div>
        ))}
      </div>
      <div className={`${card} p-4 flex flex-col md:flex-row gap-4 justify-between`}>
        <Skeleton className="h-9 w-full max-w-md rounded-2xl" />
        <Skeleton className="h-8 w-80 max-w-full rounded-full" />
      </div>
      <div className={`${card} p-5 flex flex-col gap-5`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-8 w-28 rounded-2xl hidden md:block" />
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

// Fenêtre (modale) en cours de chargement : voile + indicateur discret au centre.
export function OverlayLoader({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-2xl border border-[#fed7aa]">
        <span aria-hidden="true" className="w-5 h-5 rounded-full border-2 border-[#ea580c] border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-[#0f172a]">{label}</span>
      </div>
    </div>
  );
}
