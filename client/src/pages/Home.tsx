import { useState } from "react";
import { useIntentions } from "@/hooks/use-intentions";
import { IntentionCard } from "@/components/IntentionCard";
import { CreateIntentionDialog } from "@/components/CreateIntentionDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  
  // Debounce search ideally, but for MVP direct state is okay
  const { data: intentions, isLoading } = useIntentions({ 
    search: search || undefined,
    category: category === "all" ? undefined : category 
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Community Intentions</h1>
            <p className="text-muted-foreground">Discover what others want to do today.</p>
          </div>
          <CreateIntentionDialog />
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 mb-10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search intentions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Hobbies">Hobbies</SelectItem>
              <SelectItem value="Discussion">Discussion</SelectItem>
              <SelectItem value="Activity">Activity</SelectItem>
              <SelectItem value="Learning">Learning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {intentions?.map((intention) => (
              <IntentionCard key={intention.id} intention={intention} />
            ))}
            
            {intentions?.length === 0 && (
              <div className="col-span-full text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                <p className="text-lg text-muted-foreground mb-4">No intentions found matching your criteria.</p>
                <CreateIntentionDialog />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
