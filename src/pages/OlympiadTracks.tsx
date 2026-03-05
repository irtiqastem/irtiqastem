import { motion } from "framer-motion";
import { BookOpen, Code2, ChevronRight, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const imoTopics = [
  { name: "Algebra", subtopics: ["Equations", "Inequalities", "Polynomials", "Sequences & Series"] },
  { name: "Geometry", subtopics: ["Triangles", "Circles", "Transformations", "Projective Geometry"] },
  { name: "Number Theory", subtopics: ["Divisibility", "Primes", "Modular Arithmetic", "Diophantine Equations"] },
  { name: "Combinatorics", subtopics: ["Counting", "Graph Theory", "Pigeonhole Principle", "Probability"] },
];

const imoPath = [
  { stage: "NSTC", desc: "National Science Talent Contest — School level screening" },
  { stage: "PMO", desc: "Pakistan Mathematical Olympiad — National qualifier" },
  { stage: "NMO", desc: "National Mathematical Olympiad — Team selection" },
  { stage: "IMO", desc: "International Mathematical Olympiad — Global stage" },
];

const ioiTopics = [
  { name: "Fundamentals", subtopics: ["C++ Basics", "Input/Output", "STL Library", "Complexity Analysis"] },
  { name: "Data Structures", subtopics: ["Arrays & Strings", "Stacks & Queues", "Trees", "Segment Trees"] },
  { name: "Algorithms", subtopics: ["Sorting", "Binary Search", "Greedy", "Divide & Conquer"] },
  { name: "Advanced", subtopics: ["Dynamic Programming", "Graph Theory", "Network Flow", "Geometry"] },
];

const ioiPath = [
  { stage: "POI Qualifier", desc: "Pakistan Olympiad in Informatics — Online round" },
  { stage: "POI Finals", desc: "National finals and team selection tests" },
  { stage: "Training Camp", desc: "Intensive preparation with mentors" },
  { stage: "IOI", desc: "International Olympiad in Informatics" },
];

function PathTimeline({ steps }: { steps: { stage: string; desc: string }[] }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
      {steps.map((step, i) => (
        <motion.div
          key={step.stage}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="relative mb-6 last:mb-0"
        >
          <div className="absolute -left-5 top-1 h-4 w-4 rounded-full border-2 border-accent bg-card" />
          <h4 className="font-semibold text-foreground">{step.stage}</h4>
          <p className="text-sm text-muted-foreground">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

function TopicGrid({ topics }: { topics: { name: string; subtopics: string[] }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {topics.map((topic, i) => (
        <motion.div
          key={topic.name}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl border bg-card p-5"
        >
          <h4 className="mb-3 font-semibold text-foreground">{topic.name}</h4>
          <ul className="space-y-1.5">
            {topic.subtopics.map((sub) => (
              <li key={sub} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                {sub}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}

export default function OlympiadTracks() {
  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container-narrow px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="mb-3 text-3xl font-bold text-primary-foreground md:text-5xl">
              Olympiad Tracks
            </h1>
            <p className="max-w-2xl text-primary-foreground/80 text-lg">
              Choose your path — Mathematics or Informatics. Follow a structured roadmap
              from fundamentals to international competition.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <Tabs defaultValue="imo" className="w-full">
            <TabsList className="mb-8 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="imo" className="gap-2">
                <BookOpen className="h-4 w-4" /> IMO Track
              </TabsTrigger>
              <TabsTrigger value="ioi" className="gap-2">
                <Code2 className="h-4 w-4" /> IOI Track
              </TabsTrigger>
            </TabsList>

            <TabsContent value="imo">
              <div className="grid gap-10 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <h2 className="mb-2 text-2xl font-bold text-foreground">Mathematics Olympiad</h2>
                  <p className="mb-6 text-muted-foreground">
                    Master the four pillars of competition mathematics. Our structured syllabus
                    takes you from school-level to IMO-level problem solving.
                  </p>
                  <TopicGrid topics={imoTopics} />
                </div>
                <div className="lg:col-span-2">
                  <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                    <ChevronRight className="h-5 w-5 text-accent" /> Competition Pathway
                  </h3>
                  <PathTimeline steps={imoPath} />

                  <div className="mt-8 rounded-xl border bg-muted/50 p-5">
                    <h4 className="mb-2 font-semibold text-foreground">Weekly Practice</h4>
                    <p className="text-sm text-muted-foreground">
                      Every week, new problem sets are released aligned with the syllabus roadmap.
                      Mock tests simulate real competition environments.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ioi">
              <div className="grid gap-10 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <h2 className="mb-2 text-2xl font-bold text-foreground">Informatics Olympiad</h2>
                  <p className="mb-6 text-muted-foreground">
                    Build competitive programming skills from scratch. Learn C++, master algorithms,
                    and prepare for POI and IOI competitions.
                  </p>
                  <TopicGrid topics={ioiTopics} />
                </div>
                <div className="lg:col-span-2">
                  <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                    <ChevronRight className="h-5 w-5 text-accent" /> Competition Pathway
                  </h3>
                  <PathTimeline steps={ioiPath} />

                  <div className="mt-8 rounded-xl border bg-muted/50 p-5">
                    <h4 className="mb-2 font-semibold text-foreground">Skill Progression</h4>
                    <p className="text-sm text-muted-foreground">
                      Follow our structured learning tree from basic C++ to advanced algorithms.
                      Each level unlocks harder problems and real contest archives.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
}
