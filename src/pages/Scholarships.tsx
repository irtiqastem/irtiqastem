import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, GraduationCap, ExternalLink, Filter, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const allTags = ["National", "International", "STEM Only", "Fully Funded"];

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("scholarships").select("*").eq("active", true).order("created_at", { ascending: false });
      setScholarships(data ?? []);
      setLoading(false);
    };
    fetch();
    supabase.from("page_visits").insert([{ page: "/scholarships" }]).then(() => {});
  }, []);

  const filtered = scholarships.filter((s) => filter === "all" ? true : s.tags?.includes(filter));

  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 text-3xl font-bold text-primary-foreground md:text-5xl">Scholarships & Opportunities</h1>
            <p className="max-w-2xl text-primary-foreground/80 text-lg">Financial support and programs to help Pakistani students pursue STEM excellence globally.</p>
          </motion.div>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-narrow px-4">
          <div className="mb-8 flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scholarships</SelectItem>
                {allTags.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">{scholarships.length === 0 ? "No scholarships added yet. Check back soon!" : "No scholarships match your filter."}</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filtered.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card-hover rounded-xl border bg-card p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{s.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">{(s.tags ?? []).map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}</div>
                    </div>
                    {s.link && s.link !== "#" ? (
                      <a href={s.link} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon" className="shrink-0 text-primary"><ExternalLink className="h-4 w-4" /></Button></a>
                    ) : (
                      <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" disabled><ExternalLink className="h-4 w-4" /></Button>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {s.country}</div>
                    <div className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> {s.eligibility}</div>
                    <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {s.deadline}</div>
                    <div className="font-medium text-foreground">{s.coverage}</div>
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
