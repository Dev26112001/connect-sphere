import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useConnections() {
  return useQuery({
    queryKey: [api.connections.list.path],
    queryFn: async () => {
      const res = await fetch(api.connections.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return null; // Handled by auth boundary usually
        throw new Error("Failed to fetch connections");
      }
      return api.connections.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.connections.create.input>) => {
      const res = await fetch(api.connections.create.path, {
        method: api.connections.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Please login to connect");
        const error = await res.json();
        throw new Error(error.message || "Failed to send request");
      }
      return api.connections.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.connections.list.path] });
      toast({
        title: "Request Sent",
        description: "Your connection request has been sent successfully.",
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

export function useUpdateConnectionStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "accepted" | "rejected" }) => {
      const url = buildUrl(api.connections.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.connections.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update status");
      return api.connections.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.connections.list.path] });
      toast({
        title: variables.status === "accepted" ? "Connection Accepted" : "Request Ignored",
        description: variables.status === "accepted" ? "You can now chat with this person." : undefined,
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
