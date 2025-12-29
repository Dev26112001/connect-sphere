import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useIntentions(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: [api.intentions.list.path, filters],
    queryFn: async () => {
      const url = filters 
        ? `${api.intentions.list.path}?${new URLSearchParams(filters as Record<string, string>).toString()}`
        : api.intentions.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch intentions");
      return api.intentions.list.responses[200].parse(await res.json());
    },
  });
}

export function useIntention(id: number) {
  return useQuery({
    queryKey: [api.intentions.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.intentions.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch intention");
      return api.intentions.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateIntention() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.intentions.create.input>) => {
      const res = await fetch(api.intentions.create.path, {
        method: api.intentions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Please login to post");
        const error = await res.json();
        throw new Error(error.message || "Failed to create intention");
      }
      return api.intentions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.intentions.list.path] });
      toast({
        title: "Intention Posted",
        description: "Your intention is now visible to the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
