import { motion } from "framer-motion";
import {
  Brain, MessageSquare, BarChart3, Shield, Bot, Database, Cpu,
  User, Users, ArrowRight, Sparkles, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  { icon: Brain, title: "AI-Powered Analysis", description: "Compact Gemma 3-270M model classifies complaints with high accuracy" },
  { icon: MessageSquare, title: "Intelligent Chat", description: "Natural conversations with context-aware responses" },
  { icon: BarChart3, title: "Real-time Analytics", description: "Comprehensive dashboards for all stakeholders" },
  { icon: Shield, title: "Enterprise Security", description: "Bank-grade security with role-based access control" },
];

const technology = [
  { icon: Bot, title: "Gemma 3-270M Foundation", description: "Fine-tuned compact Google Gemma 3-270M model with specialized complaint classification" },
  { icon: Database, title: "Amazon Reviews 2023 Dataset", description: "Trained on curated Amazon Fashion reviews with Gemini 2.5 Pro supervision" },
  { icon: Cpu, title: "Hybrid AI Architecture", description: "Gemma for classification + Gemini for orchestration and response generation" },
];

const userTypes = [
  { icon: User, type: "Customers", description: "Submit and track complaints, get instant AI assistance" },
  { icon: Users, type: "Managers", description: "Oversee complaint resolution and team performance" },
  { icon: Shield, type: "Administrators", description: "Full system control and advanced analytics" },
];

const metrics = [
  { value: "100%", label: "F1 across 4 tasks" },
  { value: "270M", label: "Parameters" },
  { value: "4", label: "Simultaneous predictions" },
  { value: "4.5k", label: "Curated examples" },
];

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

export const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <span className="font-bold tracking-tight">TriageLM</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#technology" className="transition-colors hover:text-foreground">Technology</a>
            <a href="#users" className="transition-colors hover:text-foreground">User Types</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" onClick={onGetStarted}>Get started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="page-gradient border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-card">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Powered by a fine-tuned Gemma 3-270M
            </span>
            <h1 className="mt-7 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
              The future of{" "}
              <span className="text-primary">complaint management</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              TriageLM turns unstructured customer complaints into structured, actionable
              decisions — classification, resolution and analytics in a single pass.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={onGetStarted} className="gap-2">
                Try TriageLM Chat Now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#technology">See how it works</a>
              </Button>
            </div>
          </motion.div>

          <motion.dl
            {...fadeUp}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-card sm:grid-cols-4"
          >
            {metrics.map((m) => (
              <div key={m.label} className="bg-card px-4 py-5">
                <dt className="text-2xl font-bold text-primary">{m.value}</dt>
                <dd className="mt-0.5 text-xs text-muted-foreground">{m.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for real support teams</h2>
          <p className="mt-4 text-muted-foreground">
            Everything needed to triage, resolve and learn from customer complaints.
          </p>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="surface surface-hover p-6 shadow-card"
            >
              <span className="inline-grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">The technology</h2>
            <p className="mt-4 text-muted-foreground">
              A small distilled model, trained on clean data, beating a far larger pipeline.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {technology.map((t, i) => (
              <motion.div
                key={t.title}
                {...fadeUp}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="surface p-7 shadow-card"
              >
                <span className="inline-grid h-11 w-11 place-items-center rounded-lg bg-info/10 text-info">
                  <t.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User types */}
      <section id="users" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">One system, three perspectives</h2>
          <p className="mt-4 text-muted-foreground">
            Each role gets a workspace scoped to what they actually need.
          </p>
        </motion.div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {userTypes.map((u, i) => (
            <motion.div
              key={u.type}
              {...fadeUp}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="surface surface-hover p-7 text-center shadow-card"
            >
              <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <u.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{u.type}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{u.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to try it?</h2>
            <p className="mt-4 text-muted-foreground">
              Pick any of the ten simulated users and explore the system from their point of view.
            </p>
            <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["No signup required", "Customer, manager and admin roles", "Live demo data"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                </li>
              ))}
            </ul>
            <Button size="lg" onClick={onGetStarted} className="mt-9 gap-2">
              Start TriageLM Chat Now <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
          TriageLM — complaint classification powered by Gemma 3-270M.
        </div>
      </footer>
    </div>
  );
};
