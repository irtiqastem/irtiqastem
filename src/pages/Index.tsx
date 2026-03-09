import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Code2, Trophy, Users, Target, Award, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { label: "Students Enrolled", value: "2,500+", icon: Users },
  { label: "Contests Hosted", value: "45+", icon: Trophy },
  { label: "Problems Solved", value: "18,000+", icon: Target },
  { label: "Medals Won", value: "120+", icon: Award },
];

const features = [
  { icon: BookOpen, title: "IMO Track", description: "Structured preparation for International Mathematical Olympiad through NSTC, PMO, and NMO pathways.", link: "/olympiad-tracks" },
  { icon: Code2, title: "IOI Track", description: "Competitive programming preparation covering C++, algorithms, and data structures for IOI.", link: "/olympiad-tracks" },
  { icon: Lightbulb, title: "STEM Guidance", description: "Expert guidance on academic profiles, research opportunities, and international STEM programs.", link: "/stem-hub" },
  { icon: Trophy, title: "Practice & Compete", description: "Solve curated problems, participate in contests, and track your progress on the leaderboard.", link: "/practice" },
];

export default function Index() {
  const [notice, setNotice] = useState<{ title: string; text: string } | null>(null);
  const [heroTitle, setHeroTitle] = useState("Explore. Excel. Evolve.");
  const [heroSubtitle, setHeroSubtitle] = useState("Irtiqa STEM bridges the gap between talent and opportunity — providing structured Olympiad preparation and STEM guidance for Pakistan's students in grades 6–9.");

  useEffect(() => {
    // Track visit
    supabase.from("page_visits").insert([{ page: "/" }]).then(() => {});

    // Load settings
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (!data) return;
      const map: Record<string, string> = {};
      data.forEach((r: any) => { map[r.key] = r.value; });

      if (map.hero_title) setHeroTitle(map.hero_title);
      if (map.hero_subtitle) setHeroSubtitle(map.hero_subtitle);

      const dismissed = sessionStorage.getItem("notice_dismissed");
      if (map.notice_enabled === "true" && map.notice_text && !dismissed) {
        setNotice({ title: map.notice_title || "Announcement", text: map.notice_text });
      }
    });
  }, []);

  const dismissNotice = () => {
    sessionStorage.setItem("notice_dismissed", "1");
    setNotice(null);
  };

  return (
    <>
      {/* Notice Popup */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-xl border-2 border-primary bg-card p-8 shadow-2xl"
            >
              <button
                onClick={dismissNotice}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-lg">📢</span>
                <h3 className="text-xl font-bold">{notice.title}</h3>
              </div>
              <p className="text-muted-foreground">{notice.text}</p>
              <Button onClick={dismissNotice} className="mt-6 w-full">Got it</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="container-narrow relative px-4 py-24 md:py-36">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-accent" /> Non-Profit · Pakistan
            </div>
            <h1 className="mb-6 text-5xl font-black leading-tight text-white md:text-7xl">
              {heroTitle}
            </h1>
            <p className="mb-10 max-w-2xl text-lg text-white/80">{heroSubtitle}</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gold-gradient border-0 font-semibold text-navy">
                <Link to="/olympiad-tracks">Join Olympiad Track <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
                <Link to="/practice">Practice Problems</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="container-narrow px-4 py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <Icon className="mx-auto mb-2 h-6 w-6 text-accent" />
                <div className="text-3xl font-black text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container-narrow px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">Everything You Need to Excel</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">From olympiad preparation to STEM career guidance — we have you covered.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description, link }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Link to={link} className="group flex flex-col gap-4 rounded-xl border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
                    Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
