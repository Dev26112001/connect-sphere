import { useState } from "react";
import { motion } from "framer-motion";
import { useIntentions } from "@/hooks/use-intentions";
import { IntentionCard } from "@/components/IntentionCard";
import { CreateIntentionDialog } from "@/components/CreateIntentionDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Filter, Sparkles } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  
  // Debounce search ideally, but for MVP direct state is okay
  const { data: intentions, isLoading } = useIntentions({ 
    search: search || undefined,
    category: category === "all" ? undefined : category 
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4 py-12">
        
        {/* Header Section */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">
              Community <span className="gradient-text">Intentions</span>
            </h1>
            <p className="text-muted-foreground text-lg">Discover what others want to do today.</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <CreateIntentionDialog />
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 mb-10 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search intentions..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background border-border hover:border-primary/30 focus-visible:ring-primary/20 transition-all duration-300 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full lg:w-[200px] bg-background border-border hover:border-primary/30 focus-visible:ring-primary/20 transition-all duration-300 rounded-xl">
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
          </div>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <motion.div 
            className="flex justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading intentions...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {intentions?.map((intention, index) => (
              <motion.div
                key={intention.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <IntentionCard intention={intention} />
              </motion.div>
            ))}
            
            {intentions?.length === 0 && (
              <motion.div 
                className="col-span-full text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground mb-6">
                  {search || category !== "all" 
                    ? "No intentions found matching your criteria." 
                    : "No intentions yet. Be the first to post!"}
                </p>
                <CreateIntentionDialog />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
