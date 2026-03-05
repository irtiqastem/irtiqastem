import { motion } from "framer-motion";
import { BookOpen, FileText, Video, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Resource = {
  title: string;
  description: string;
  type: "book" | "worksheet" | "video";
  category: "math" | "informatics";
};

const resources: Resource[] = [
  { title: "Problem Solving Through Recreational Mathematics", description: "Classic text for building mathematical intuition and problem-solving skills.", type: "book", category: "math" },
  { title: "Art and Craft of Problem Solving", description: "Comprehensive guide to mathematical competition strategies.", type: "book", category: "math" },
  { title: "Number Theory: Concepts & Problems", description: "Focused resource covering all number theory topics for Olympiads.", type: "book", category: "math" },
  { title: "Geometry Revisited", description: "Essential geometry text by Coxeter for advanced Olympiad prep.", type: "book", category: "math" },
  { title: "Competitive Programmer's Handbook", description: "Free comprehensive guide to algorithms and data structures for IOI.", type: "book", category: "informatics" },
  { title: "Introduction to Algorithms (CLRS)", description: "The definitive reference for algorithm design and analysis.", type: "book", category: "informatics" },
  { title: "Algebra Practice Set — Level 1", description: "50 problems covering linear equations, inequalities, and polynomials.", type: "worksheet", category: "math" },
  { title: "Combinatorics Worksheet Pack", description: "Counting principles, permutations, and graph theory exercises.", type: "worksheet", category: "math" },
  { title: "C++ Basics Worksheet", description: "Practice exercises covering syntax, loops, and basic I/O.", type: "worksheet", category: "informatics" },
  { title: "Dynamic Programming Problem Set", description: "25 DP problems ranging from easy to competition-level.", type: "worksheet", category: "informatics" },
];

const typeIcons = { book: BookOpen, worksheet: FileText, video: Video };

function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = typeIcons[resource.type];
  return (
    <div className="card-hover flex gap-4 rounded-xl border bg-card p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{resource.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
        <Button variant="ghost" size="sm" className="mt-2 gap-1 px-0 text-primary hover:text-primary/80">
          <Download className="h-3.5 w-3.5" /> Download / View
        </Button>
      </div>
    </div>
  );
}

export default function Resources() {
  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 text-3xl font-bold text-primary-foreground md:text-5xl">
              Learning Resources
            </h1>
            <p className="max-w-2xl text-primary-foreground/80 text-lg">
              Curated books, worksheets, and materials for both Mathematics and Informatics Olympiad preparation.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <Tabs defaultValue="math">
            <TabsList className="mb-8 grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="math">Math Olympiad</TabsTrigger>
              <TabsTrigger value="informatics">Informatics</TabsTrigger>
            </TabsList>

            {["math", "informatics"].map((cat) => (
              <TabsContent key={cat} value={cat}>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-1">Books</h2>
                  <p className="text-sm text-muted-foreground mb-4">Recommended reading for structured learning.</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {resources
                      .filter((r) => r.category === cat && r.type === "book")
                      .map((r, i) => (
                        <motion.div key={r.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                          <ResourceCard resource={r} />
                        </motion.div>
                      ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Worksheets & Problem Sets</h2>
                  <p className="text-sm text-muted-foreground mb-4">Practice materials organized by topic and difficulty.</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {resources
                      .filter((r) => r.category === cat && r.type === "worksheet")
                      .map((r, i) => (
                        <motion.div key={r.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                          <ResourceCard resource={r} />
                        </motion.div>
                      ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </>
  );
}
