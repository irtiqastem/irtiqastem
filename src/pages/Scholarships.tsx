import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, GraduationCap, ExternalLink, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Scholarship = {
  name: string;
  country: string;
  eligibility: string;
  deadline: string;
  coverage: string;
  tags: string[];
  link: string;
};

const scholarships: Scholarship[] = [
  { name: "NUST Merit Scholarship", country: "Pakistan", eligibility: "Grade 9+", deadline: "March 2026", coverage: "Full Tuition", tags: ["National", "STEM Only"], link: "#" },
  { name: "Aga Khan Foundation Scholarship", country: "International", eligibility: "Grade 8+", deadline: "April 2026", coverage: "Fully Funded", tags: ["International", "Fully Funded"], link: "#" },
  { name: "LUMS NOP Scholarship", country: "Pakistan", eligibility: "Grade 9+", deadline: "May 2026", coverage: "Full Tuition + Stipend", tags: ["National", "Fully Funded"], link: "#" },
  { name: "RSI (Research Science Institute)", country: "USA", eligibility: "Grade 8-9", deadline: "January 2026", coverage: "Fully Funded", tags: ["International", "STEM Only", "Fully Funded"], link: "#" },
  { name: "PROMYS Summer Program", country: "USA", eligibility: "Grade 8-9", deadline: "February 2026", coverage: "Fully Funded", tags: ["International", "STEM Only", "Fully Funded"], link: "#" },
  { name: "HEC Need Based Scholarship", country: "Pakistan", eligibility: "Grade 9+", deadline: "Rolling", coverage: "Tuition + Living", tags: ["National", "Fully Funded"], link: "#" },
  { name: "IMO Foundation Travel Grant", country: "International", eligibility: "IMO Qualifiers", deadline: "June 2026", coverage: "Travel + Accommodation", tags: ["International", "STEM Only"], link: "#" },
  { name: "Google Code-in Alumni Fund", country: "International", eligibility: "Grade 7+", deadline: "November 2025", coverage: "Partial", tags: ["International", "STEM Only"], link: "#" },
];

const allTags = ["National", "International", "STEM Only", "Fully Funded"];

export default function Scholarships() {
  const [filter, setFilter] = useState("all");

  const filtered = scholarships.filter((s) => {
    if (filter === "all") return true;
    return s.tags.includes(filter);
  });

  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 text-3xl font-bold text-primary-foreground md:text-5xl">
              Scholarships & Opportunities
            </h1>
            <p className="max-w-2xl text-primary-foreground/80 text-lg">
              Financial support and programs to help Pakistani students pursue STEM excellence globally.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="mb-8 flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scholarships</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card-hover rounded-xl border bg-card p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 text-primary">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {s.country}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" /> {s.eligibility}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {s.deadline}
                  </div>
                  <div className="font-medium text-foreground">{s.coverage}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
