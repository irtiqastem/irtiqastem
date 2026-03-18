import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Scholarship = {
  id: string;
  name: string;
  country: string;
  eligibility: string;
  deadline: string;
  coverage: string;
  description: string;
  category: string;
  tags: string[];
  link: string;
};

const categories = ["All", "Nonprofits", "Competitions", "Awards", "Summer Programs", "Internships", "Clubs", "Programs", "Scholarships"];

const categoryColors: Record<string, string> = {
  "Nonprofits":      "bg-blue-100 text-blue-700",
  "Competitions":    "bg-orange-100 text-orange-700",
  "Awards":          "bg-yellow-100 text-yellow-700",
  "Summer Programs": "bg-green-100 text-green-700",
  "Internships":     "bg-purple-100 text-purple-700",
  "Clubs":           "bg-pink-100 text-pink-700",
  "Programs":        "bg-cyan-100 text-cyan-700",
  "Scholarships":    "bg-red-100 text-red-700",
  "Medical":         "bg-rose-100 text-rose-700",
  "STEM":            "bg-emerald-100 text-emerald-700",
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
    const matchesCategory = filter === "All" ? true : s.category === filter;
    const matchesSearch = search === "" ? true :
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
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
              Discover programs, competitions, and awards that strengthen your academic profile.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow px-4">

          <div className="mb-6 flex flex-col gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search activities..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
                    filter === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {!loading && (
            <p className="mb-5 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> {filtered.length === 1 ? "activity" : "activities"}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              {scholarships.length === 0 ? "No activities added yet. Check back soon!" : "No activities match your search."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  className="flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">

                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-foreground leading-snug">{s.name}</h3>
                    {s.link && s.link.trim() !== "" && s.link !== "#" && (
                      <a href={s.link} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {s.category && (
                    <span className={`mb-3 self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[s.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.category}
                    </span>
                  )}

                  {s.description && (
                    <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  )}

                  {(s.country || s.eligibility || s.deadline || s.coverage) && (
                    <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground border-t pt-3">
                      {s.country && <div><span className="font-medium text-foreground/70">Country</span><p className="mt-0.5">{s.country}</p></div>}
                      {s.eligibility && <div><span className="font-medium text-foreground/70">Eligibility</span><p className="mt-0.5">{s.eligibility}</p></div>}
                      {s.deadline && <div><span className="font-medium text-foreground/70">Deadline</span><p className="mt-0.5">{s.deadline}</p></div>}
                      {s.coverage && <div><span className="font-medium text-foreground/70">Coverage</span><p className="mt-0.5 font-semibold text-foreground">{s.coverage}</p></div>}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
