import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateIntention } from "@/hooks/use-intentions";
import { insertIntentionSchema, type CreateIntentionRequest } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

const categories = ["Hobbies", "Discussion", "Activity", "Learning", "Other"];

export function CreateIntentionDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateIntention();
  
  const form = useForm<CreateIntentionRequest>({
    resolver: zodResolver(insertIntentionSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Discussion",
      tags: [],
      location: "Remote",
    },
  });

  function onSubmit(data: CreateIntentionRequest) {
    // Ensure tags are an array if user input is string (handling simple split for demo)
    // In a real complex form we'd use a tag input component. 
    // Here we assume standard zod schema handling or pre-processing.
    // For simplicity in this demo, we'll keep it direct.
    
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-lg gap-2 font-serif text-lg bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300">
          <Plus className="w-5 h-5" />
          New Intention
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] rounded-2xl p-0 overflow-hidden bg-card border-none shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-primary">Post an Intention</DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              What kind of connection are you looking for today?
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 pt-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Discussing Stoicism over coffee" {...field} className="rounded-xl border-2 focus-visible:ring-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-2">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Remote or NYC" {...field} value={field.value || ""} className="rounded-xl border-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share a bit more about what you're interested in..." 
                        className="min-h-[100px] resize-none rounded-xl border-2 focus-visible:ring-primary/20" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={isPending} className="rounded-xl px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isPending ? "Posting..." : "Post Intention"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
