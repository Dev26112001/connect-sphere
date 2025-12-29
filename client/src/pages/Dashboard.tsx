import { useAuth } from "@/hooks/use-auth";
import { useConnections, useUpdateConnectionStatus } from "@/hooks/use-connections";
import { useIntentions } from "@/hooks/use-intentions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: connections, isLoading: connectionsLoading } = useConnections();
  // We can filter intentions locally for "My Intentions" or create a new endpoint. 
  // For MVP, filtering the list is acceptable if dataset is small, but let's assume we filter client side from the main list for now as endpoint doesn't support creatorId filter explicitly in the prompt schema, 
  // though a real app would have /api/me/intentions.
  // Actually, let's just use the list endpoint and filter.
  const { data: allIntentions, isLoading: intentionsLoading } = useIntentions();
  
  const myIntentions = allIntentions?.filter(i => i.creatorId === user?.id) || [];
  
  if (connectionsLoading || intentionsLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-serif font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your intentions and connections.</p>
        </div>

        <Tabs defaultValue="received" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-auto">
            <TabsTrigger value="received" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Requests Received 
              {connections?.received.filter(c => c.status === 'pending').length ? (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">{connections.received.filter(c => c.status === 'pending').length}</Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="sent" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Requests Sent
            </TabsTrigger>
            <TabsTrigger value="intentions" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              My Intentions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            <div className="grid gap-4">
              {connections?.received.length === 0 ? (
                <EmptyState message="No incoming requests yet." />
              ) : (
                connections?.received.map(req => (
                  <ConnectionRequestCard key={req.id} connection={req} type="received" />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
             <div className="grid gap-4">
              {connections?.sent.length === 0 ? (
                <EmptyState message="You haven't sent any requests yet." />
              ) : (
                connections?.sent.map(req => (
                  <ConnectionRequestCard key={req.id} connection={req} type="sent" />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="intentions" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myIntentions.length === 0 ? (
               <EmptyState message="You haven't posted any intentions yet." />
            ) : (
              myIntentions.map(intention => (
                <Card key={intention.id} className="rounded-2xl border-border/60 shadow-sm hover:border-primary/30 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="font-serif text-lg">{intention.title}</CardTitle>
                      <Badge variant="outline" className="text-xs font-normal">{intention.category}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2 mt-2">{intention.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Posted {formatDistanceToNow(new Date(intention.createdAt!), { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border col-span-full">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

function ConnectionRequestCard({ connection, type }: { connection: any, type: 'sent' | 'received' }) {
  const { mutate: updateStatus, isPending } = useUpdateConnectionStatus();

  // For received, we show the requester. For sent, we show the intention creator (we'd need relation deeper but schema implies intention is included)
  // Schema for connection includes `intention` and `requester`.
  // If Type is Received: connection.requester is the person asking.
  // If Type is Sent: We want to see who owns the intention. The intention object has creatorId, but we might not have creator profile joined in connection relation directly unless we updated route schema. 
  // Let's assume standard expanded relations.

  const otherPerson = type === 'received' ? connection.requester : connection.intention?.creator; // Note: Intention relation in schema usually includes creator? Need to check backend relations.
  // If backend didn't deeply nest, we might miss the creator of the intention for "sent" view. 
  // Assuming basic functionality:
  
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
      <div className="flex gap-4 items-start">
        {otherPerson && (
          <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
            <AvatarImage src={otherPerson.profileImageUrl} />
            <AvatarFallback>{otherPerson.firstName?.[0]}</AvatarFallback>
          </Avatar>
        )}
        
        <div>
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            {type === 'received' ? (
              <>
                {otherPerson?.firstName} wants to connect
              </>
            ) : (
              <>
                Request to {connection.intention?.title}
              </>
            )}
            <StatusBadge status={connection.status} />
          </h4>
          
          {type === 'received' && (
            <p className="text-sm text-muted-foreground mt-1">
              For: <span className="font-medium text-foreground">{connection.intention?.title}</span>
            </p>
          )}

          {connection.message && (
             <div className="mt-3 bg-muted/30 p-3 rounded-lg text-sm italic text-muted-foreground flex gap-2">
               <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
               "{connection.message}"
             </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
        {type === 'received' && connection.status === 'pending' && (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 md:flex-none border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              onClick={() => updateStatus({ id: connection.id, status: 'rejected' })}
              disabled={isPending}
            >
              <X className="w-4 h-4 mr-1" /> Decline
            </Button>
            <Button 
              size="sm" 
              className="flex-1 md:flex-none bg-primary hover:bg-primary/90"
              onClick={() => updateStatus({ id: connection.id, status: 'accepted' })}
              disabled={isPending}
            >
              <Check className="w-4 h-4 mr-1" /> Accept
            </Button>
          </>
        )}
        
        {connection.status === 'accepted' && (
           <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2">
             Email {type === 'received' ? connection.requester?.email : 'Creator'} <ArrowRight className="w-3 h-3" />
           </Button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'accepted') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Accepted</Badge>;
  if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Declined</Badge>;
  return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Pending</Badge>;
}
