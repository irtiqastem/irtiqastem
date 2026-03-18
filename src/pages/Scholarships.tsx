import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Scholarship = {
  id: string;
  name: string;
  country: string;
  eligibility: string;
  deadline: string;
  coverage: string;
  tags: string[];
  link: string;
};

const allTags = ["All", "National", "International", "STEM Only", "Fully Funded"];

const tagColors: Record<string, string> = {
  "National":      "bg-blue-100 text-blue-700",
  "International": "bg-purple-100 text-purple-700",
  "STEM Only":     "bg-green-100 text-green-700",
  "Fully Funded":  "bg-yellow-100 text-yellow-700",
};

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("scholarships")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      setScholarships(data ?? []);
      setLoading(false);
    };
    load();
    supabase.from("page_visits").insert([{ page: "/scholarships" }]).then(() => {});
  }, []);

  const filtered = scholarships.filter((s) => {
    const matchesTag = filter === "All" ? true : s.tags?.includes(filter);
    const matchesSearch = search === "" ? true :
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.coverage.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 text-3xl font-bold text-primary-foreground md:text-5xl">
              Extracurricular Activities
            </h1>
            <p className="max-w-2xl text-primary-foreground/80 text-lg">
              Financial support and programs to help Pakistani students pursue STEM excellence globally.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow px-4">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search scholarships..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button key={tag} onClick={() => setFilter(tag)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${filter === tag ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {!loading && (
            <p className="mb-5 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> {filtered.length === 1 ? "scholarship" : "scholarships"}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              {scholarships.length === 0 ? "No scholarships added yet. Check back soon!" : "No scholarships match your search."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  className="group relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-foreground leading-snug">{s.name}</h3>
                    {s.link && s.link !== "#" && s.link.trim() !== "" && (
                      <a href={s.link} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {(s.tags ?? []).map((tag) => (
                      <span key={tag} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tagColors[tag] ?? "bg-gray-100 text-gray-600"}`}>{tag}</span>
                    ))}
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground border-t pt-3">
                    <div><span className="font-medium text-foreground/70">Country</span><p className="mt-0.5">{s.country}</p></div>
                    <div><span className="font-medium text-foreground/70">Eligibility</span><p className="mt-0.5">{s.eligibility}</p></div>
                    <div><span className="font-medium text-foreground/70">Deadline</span><p className="mt-0.5">{s.deadline}</p></div>
                    <div><span className="font-medium text-foreground/70">Coverage</span><p className="mt-0.5 font-semibold text-foreground">{s.coverage}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
