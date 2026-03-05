import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Problem = {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  track: "IMO" | "IOI";
  solvedBy: number;
};

const problems: Problem[] = [
  { id: 1, title: "Sum of Consecutive Integers", difficulty: "Easy", tags: ["Algebra"], track: "IMO", solvedBy: 342 },
  { id: 2, title: "Triangle Inequality Proof", difficulty: "Medium", tags: ["Geometry"], track: "IMO", solvedBy: 187 },
  { id: 3, title: "GCD and LCM Relations", difficulty: "Easy", tags: ["Number Theory"], track: "IMO", solvedBy: 298 },
  { id: 4, title: "Pigeonhole Principle Application", difficulty: "Hard", tags: ["Combinatorics"], track: "IMO", solvedBy: 64 },
  { id: 5, title: "Array Rotation", difficulty: "Easy", tags: ["Arrays"], track: "IOI", solvedBy: 421 },
  { id: 6, title: "Binary Search on Answer", difficulty: "Medium", tags: ["Algorithms"], track: "IOI", solvedBy: 156 },
  { id: 7, title: "Shortest Path in Graph", difficulty: "Medium", tags: ["Graph Theory"], track: "IOI", solvedBy: 134 },
  { id: 8, title: "Longest Increasing Subsequence", difficulty: "Hard", tags: ["Dynamic Programming"], track: "IOI", solvedBy: 89 },
  { id: 9, title: "Modular Exponentiation", difficulty: "Medium", tags: ["Number Theory"], track: "IMO", solvedBy: 201 },
  { id: 10, title: "Recursive Backtracking", difficulty: "Hard", tags: ["Recursion"], track: "IOI", solvedBy: 73 },
];

const difficultyColors: Record<string, string> = {
  Easy: "badge-easy",
  Medium: "badge-medium",
  Hard: "badge-hard",
};

export default function Practice() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [track, setTrack] = useState("all");

  const filtered = problems.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (difficulty !== "all" && p.difficulty !== difficulty) return false;
    if (track !== "all" && p.track !== track) return false;
    return true;
  });

  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 text-3xl font-bold text-primary-foreground md:text-5xl">
              Practice Problems
            </h1>
            <p className="max-w-2xl text-primary-foreground/80 text-lg">
              Sharpen your skills with curated problems across Mathematics and Informatics.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search problems or tags..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  <SelectItem value="IMO">IMO</SelectItem>
                  <SelectItem value="IOI">IOI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Problem List */}
          <div className="rounded-xl border bg-card">
            <div className="hidden border-b px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-12 sm:gap-4">
              <span className="col-span-1">#</span>
              <span className="col-span-5">Problem</span>
              <span className="col-span-2">Difficulty</span>
              <span className="col-span-2">Track</span>
              <span className="col-span-2 text-right">Solved</span>
            </div>

            {filtered.map((problem, i) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-1 items-center gap-2 border-b px-6 py-4 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer sm:grid-cols-12 sm:gap-4"
              >
                <span className="hidden text-sm font-mono text-muted-foreground sm:block sm:col-span-1">
                  {problem.id}
                </span>
                <div className="sm:col-span-5">
                  <span className="font-medium text-foreground">{problem.title}</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {problem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColors[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <Badge variant="outline" className="text-xs">{problem.track}</Badge>
                </div>
                <span className="text-sm text-muted-foreground sm:col-span-2 sm:text-right">
                  {problem.solvedBy} solved
                </span>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center text-muted-foreground">
                No problems found matching your filters.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
