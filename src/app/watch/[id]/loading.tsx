
import { Skeleton } from "@/components/ui/skeleton";
import { VideoCardSkeleton } from "@/components/skeletons";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Video Player Skeleton */}
        <div className="aspect-video w-full">
            <Skeleton className="w-full h-full rounded-xl" />
        </div>

        {/* Video Info Skeleton */}
        <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                 <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                 </div>
            </div>
        </div>
        
        <Separator className="my-6" />

        {/* Comment Section Skeleton */}
        <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-4">
                 <Skeleton className="h-10 w-10 rounded-full" />
                 <Skeleton className="h-24 w-full rounded-md" />
            </div>
             <div className="space-y-6 mt-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-16 w-full rounded-md" />
                        </div>
                    </div>
                ))}
             </div>
        </div>
      </div>

      {/* Sidebar / Recommended (if any) */}
      <div className="w-full lg:w-[350px] space-y-4">
         <h3 className="font-semibold text-lg pb-2">Up Next</h3>
         <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="flex gap-2">
                    <Skeleton className="h-24 w-40 rounded-lg" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                 </div>
            ))}
         </div>
      </div>
    </div>
  );
}
