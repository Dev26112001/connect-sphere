import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee, Users, MapPin } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center py-20 overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold uppercase tracking-wider mb-6">
              Platonic Connections Only
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
              Find your <span className="text-primary italic">people</span>, <br />
              not just profiles.
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Companions connects you with people who want to <i>do</i> the same things you do. 
              No dating, no swiping—just shared intentions and meaningful moments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/api/login">
                <Button size="lg" className="rounded-full px-8 text-lg h-14 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                  Start Connecting
                </Button>
              </a>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-lg h-14 border-2">
                Learn how it works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={<Coffee className="w-8 h-8 text-primary" />}
              title="Post Intentions"
              description="Share what you want to do—grab coffee, play chess, or hike a trail."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-secondary" />}
              title="Meet Platonically"
              description="A strictly non-dating space focused on friendship and shared activities."
            />
            <FeatureCard 
              icon={<MapPin className="w-8 h-8 text-primary" />}
              title="Local & Remote"
              description="Find companions in your city or connect virtually for discussions."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="mb-4 p-3 bg-muted/30 w-fit rounded-2xl">{icon}</div>
      <h3 className="text-xl font-serif font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
