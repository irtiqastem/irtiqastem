import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Code2, Trophy, Users, Target, Award, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { label: "Students Enrolled", value: "2,500+", icon: Users },
  { label: "Contests Hosted", value: "45+", icon: Trophy },
  { label: "Problems Solved", value: "18,000+", icon: Target },
  { label: "Medals Won", value: "120+", icon: Award },
];

const features = [
  {
    icon: BookOpen,
    title: "IMO Track",
    description: "Structured preparation for International Mathematical Olympiad through NSTC, PMO, and NMO pathways.",
    link: "/olympiad-tracks",
  },
  {
    icon: Code2,
    title: "IOI Track",
    description: "Competitive programming preparation covering C++, algorithms, and data structures for IOI.",
    link: "/olympiad-tracks",
  },
  {
    icon: Lightbulb,
    title: "STEM Guidance",
    description: "Expert guidance on academic profiles, research opportunities, and international STEM programs.",
    link: "/stem-hub",
  },
  {
    icon: Trophy,
    title: "Practice & Compete",
    description: "Solve curated problems, participate in contests, and track your progress on the leaderboard.",
    link: "/practice",
  },
];

export default function Index() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="relative container-narrow px-4 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <span className="mb-4 inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              Non-Profit · Pakistan
            </span>
            <h1 className="mb-6 text-4xl font-black leading-tight text-primary-foreground md:text-6xl">
              Explore. Excel.{" "}
              <span className="text-accent">Evolve.</span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80 md:text-xl">
              Irtiqa STEM bridges the gap between talent and opportunity — providing structured
              Olympiad preparation and STEM guidance for Pakistan's students in grades 6–9.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gold-gradient border-0 font-semibold text-navy">
                <Link to="/olympiad-tracks">
                  Join Olympiad Track <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent font-semibold text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/practice">Practice Problems</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="container-narrow grid grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-accent" />
              <div className="text-2xl font-bold text-foreground md:text-3xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problem Statement */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              The STEM Gap in Pakistan
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Thousands of talented students across Pakistan lack access to structured Olympiad preparation.
              Without proper guidance, mentorship, and resources, their potential goes untapped.
              Irtiqa STEM exists to change that — providing a clear, free, and rigorous path from
              classroom to international competition.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-muted/50">
        <div className="container-narrow">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
            Your Path to Excellence
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={feature.link}
                  className="card-hover group block rounded-xl border bg-card p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient section-padding">
        <div className="container-narrow text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            Join thousands of students preparing for international Olympiads. Free, structured, and built for Pakistan.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gold-gradient border-0 font-semibold text-navy">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/scholarships">Explore Scholarships</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
