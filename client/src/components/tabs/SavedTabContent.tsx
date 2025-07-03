import { TabsContent } from "@/components/ui/tabs";

interface SavedTabContentProps {
  category: string;
}

export function SavedTabContent({ category }: SavedTabContentProps) {
  return (
    <TabsContent value="saved" className="scrollbar-hide">
      <div className="bg-white bg-opacity-10 rounded-3xl p-8 text-center shadow-lg backdrop-blur-sm">
        <h3 className="text-white text-4xl font-bold mb-6">
          Saved {category.charAt(0).toUpperCase() + category.slice(1)}
        </h3>
        <p className="text-white text-2xl opacity-90">
          Your favorite {category} will appear here once you save them.
        </p>
      </div>
    </TabsContent>
  );
}
