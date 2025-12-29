import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { MapPin, MessageCircle, User as UserIcon } from "lucide-react";
import { type Intention } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useCreateConnection } from "@/hooks/use-connections";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface IntentionCardProps {
  intention: Intention & { creator?: { firstName: string; lastName: string; profileImageUrl: string; id: string } };
}

export function IntentionCard({ intention }: IntentionCardProps) {
  const { user } = useAuth();
  const [connectOpen, setConnectOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { mutate: sendRequest, isPending } = useCreateConnection();

  const isOwner = user?.id === intention.creatorId;

  const handleConnect = () => {
    sendRequest({ intentionId: intention.id, message }, {
      onSuccess: () => {
        setConnectOpen(false);
        setMessage("");
      }
    });
  };

  const getInitials = (first?: string, last?: string) => {
    return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "??";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={intention.creator?.profileImageUrl} />
            <AvatarFallback className="bg-secondary/10 text-secondary">{getInitials(intention.creator?.firstName, intention.creator?.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {intention.creator?.firstName || "Anonymous"} {intention.creator?.lastName || ""}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
              {intention.category}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary/5 px-2 py-1 rounded-full">
          {formatDistanceToNow(new Date(intention.createdAt!), { addSuffix: true })}
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
        {intention.title}
      </h3>
      
      <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
        {intention.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {intention.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {intention.location}
            </span>
          )}
        </div>

        {!isOwner && (
          <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 gap-2"
              >
                Connect <MessageCircle className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Connect with {intention.creator?.firstName}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-muted-foreground mb-3 text-sm">Send a short message about why you'd like to connect regarding "{intention.title}".</p>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! I'd love to discuss..."
                  className="rounded-xl resize-none min-h-[100px] focus-visible:ring-primary/20"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setConnectOpen(false)} className="rounded-xl">Cancel</Button>
                <Button 
                  onClick={handleConnect} 
                  disabled={!message.trim() || isPending}
                  className="rounded-xl bg-primary hover:bg-primary/90"
                >
                  {isPending ? "Sending..." : "Send Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {isOwner && (
          <div className="text-xs text-muted-foreground italic px-3 py-2 bg-muted/50 rounded-lg">
            Your intention
          </div>
        )}
      </div>
    </motion.div>
  );
}
