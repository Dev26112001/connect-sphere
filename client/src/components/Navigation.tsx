import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Compass, LogOut, User } from "lucide-react";

export function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-lg">
              C
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-foreground hidden sm:block">
              Companions
            </span>
          </div>
        </Link>

        {user ? (
          <nav className="flex items-center gap-2 sm:gap-6">
            <Link href="/">
              <div className={`cursor-pointer flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">Feed</span>
              </div>
            </Link>
            
            <Link href="/dashboard">
              <div className={`cursor-pointer flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </div>
            </Link>

            <div className="w-px h-6 bg-border mx-2" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profileImageUrl} alt={user.firstName || "User"} />
                    <AvatarFallback>{(user.firstName?.[0] || "U").toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        ) : (
          <div className="flex gap-4">
            <Link href="/api/login">
              <Button variant="ghost" className="hidden sm:flex hover:bg-transparent hover:text-primary">
                Log in
              </Button>
            </Link>
            <Link href="/api/login">
              <Button className="rounded-full bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
