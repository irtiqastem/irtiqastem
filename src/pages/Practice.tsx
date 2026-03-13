import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Send, Loader2, CheckCircle, XCircle, Lightbulb, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { MathText } from "@/components/MathText";

type Problem = {
  id: number;
  title: string;
  difficulty: string;
  topic: string;
  subject: string;
  track: string;
  tags: string[];
  statement: string;
  correct_answer: string;
  solution: string;
};

type Submission = {
  id: number;
  problem_id: number;
  status: string;
  points: number;
  answer: string;
};

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

export default function Practice() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [track, setTrack] = useState("all");
  const [selected, setSelected] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; correctAnswer: string; solution: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase.from("problems").select("*").order("id");
      setProblems(p ?? []);
      if (user) {
        const { data: s } = await supabase.from("submissions").select("*").eq("user_id", user.id);
        setSubmissions(s ?? []);
      }
      setLoading(false);
    };
    load();
    supabase.from("page_visits").insert([{ page: "/practice" }]).then(() => {});
  }, [user]);

  const filtered = problems.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
      !(p.topic || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (difficulty !== "all" && p.difficulty !== difficulty) return false;
    if (track !== "all" && p.track !== track) return false;
    return true;
  });

  const getSubmission = (problemId: number) => submissions.find(s => s.problem_id === problemId);

  const openProblem = (problem: Problem) => {
    const existing = getSubmission(problem.id);
    setSelected(problem);
    setAnswer("");
    if (existing) {
      setResult({ correct: existing.status === "correct", correctAnswer: problem.correct_answer, solution: problem.solution });
    } else {
      setResult(null);
    }
  };

  const closeDialog = () => { setSelected(null); setAnswer(""); setResult(null); };

  const submitAnswer = async () => {
    if (!user) { toast.error("Please sign in to submit answers."); return; }
    if (!answer.trim()) { toast.error("Please enter your answer first."); return; }
    if (!selected || getSubmission(selected.id)) return;
    setSubmitting(true);
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");
    const sortCommas = (s: string) => s.split(",").map(p => p.trim().toLowerCase()).sort().join(",");
    const userSorted = sortCommas(answer);
    const acceptedForms = (selected.correct_answer || "").split(/\s+or\s+/i).map(f => f.trim());
    const isCorrect = acceptedForms.some(form => normalize(answer) === normalize(form) || userSorted === sortCommas(form));
    const status = isCorrect ? "correct" : "wrong";
    const points = isCorrect ? 10 : 0;
    const { data, error } = await supabase.from("submissions").insert([{
      user_id: user.id, problem_id: selected.id, answer: answer.trim(), status, points, submitted_at: new Date().toISOString(),
    }]).select().single();
    if (error) { toast.error(error.message); }
    else {
      setSubmissions(prev => [...prev, data]);
      setResult({ correct: isCorrect, correctAnswer: selected.correct_answer, solution: selected.solution });
      if (isCorrect) toast.success("Correct! Well done! 🎉");
      else toast.error("Wrong answer. Study the solution below.");
    }
    setSubmitting(false);
  };

  const statusBadge = (sub: Submission | undefined) => {
    if (!sub) return <span className="text-xs text-muted-foreground">Not attempted</span>;
    if (sub.status === "correct") return (
      <span className="flex items-center gap-1 text-xs font-medium text-green-600">
        <CheckCircle className="h-3.5 w-3.5" /> Correct
        <Badge className="ml-1 bg-green-100 text-green-700 text-xs">+{sub.points}pts</Badge>
      </span>
    );
    return <span className="flex items-center gap-1 text-xs font-medium text-red-500"><XCircle className="h-3.5 w-3.5" /> Wrong</span>;
  };

  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 text-3xl font-bold text-primary-foreground md:text-5xl">Practice Problems</h1>
            <p className="max-w-2xl text-primary-foreground/80 text-lg">Sharpen your skills with curated problems. Submit your answer and see the solution instantly.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow px-4">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search problems or topics..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-[140px]"><Filter className="mr-2 h-3.5 w-3.5" /><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Track" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  <SelectItem value="IMO">IMO</SelectItem>
                  <SelectItem value="IOI">IOI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-xl border bg-card">
              <div className="hidden border-b px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-12 sm:gap-4">
                <span className="col-span-1">#</span>
                <span className="col-span-5">Problem</span>
                <span className="col-span-2">Difficulty</span>
                <span className="col-span-2">Track</span>
                <span className="col-span-2 text-right">Status</span>
              </div>
              {filtered.map((problem, i) => {
                const sub = getSubmission(problem.id);
                return (
                  <motion.div key={problem.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    onClick={() => openProblem(problem)}
                    className="grid grid-cols-1 cursor-pointer items-center gap-2 border-b px-6 py-4 last:border-0 hover:bg-muted/30 transition-colors sm:grid-cols-12 sm:gap-4">
                    <span className="hidden text-sm font-mono text-muted-foreground sm:block sm:col-span-1">{i + 1}</span>
                    <div className="sm:col-span-5 flex items-center gap-2">
                      {sub && (sub.status === "correct" ? <CheckCircle className="h-4 w-4 shrink-0 text-green-500" /> : <XCircle className="h-4 w-4 shrink-0 text-red-400" />)}
                      <div>
                        <span className="font-medium">{problem.title}</span>
                        {problem.topic && <div className="mt-1"><Badge variant="secondary" className="text-xs">{problem.topic}</Badge></div>}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColors[problem.difficulty] || "bg-gray-100 text-gray-700"}`}>{problem.difficulty}</span>
                    </div>
                    <div className="sm:col-span-2"><Badge variant="outline" className="text-xs">{problem.track || "IMO"}</Badge></div>
                    <div className="flex items-center justify-end sm:col-span-2">{statusBadge(sub)}</div>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  {problems.length === 0 ? "No problems added yet. Check back soon!" : "No problems match your filters."}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColors[selected?.difficulty || ""] || "bg-gray-100 text-gray-700"}`}>{selected?.difficulty}</span>
            <Badge variant="outline" className="text-xs">{selected?.track || "IMO"}</Badge>
            {selected?.topic && <Badge variant="secondary" className="text-xs">{selected.topic}</Badge>}
          </div>
          {selected?.statement && (
            <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">
              <MathText text={selected.statement} />
            </div>
          )}
          {result ? (
            <div className="space-y-4 mt-2">
              {result.correct ? (
                <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div><p className="font-semibold text-green-700">Correct! Way to go! 🎉</p><p className="text-xs text-green-600">+10 points earned</p></div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <div><p className="font-semibold text-red-600">Wrong Answer</p><p className="text-xs text-red-500">The correct answer was: <span className="font-bold">{result.correctAnswer}</span></p></div>
                </div>
              )}
              {result.solution && (
                <Tabs defaultValue="solution">
                  <TabsList className="w-full">
                    <TabsTrigger value="solution" className="flex-1 gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> Solution</TabsTrigger>
                  </TabsList>
                  <TabsContent value="solution">
                    <div className="rounded-lg border bg-card p-4 text-sm leading-relaxed text-foreground">
                      <MathText text={result.solution} />
                    </div>
                  </TabsContent>
                </Tabs>
              )}
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> This problem is locked — one attempt only.
              </div>
              <Button variant="outline" className="w-full" onClick={closeDialog}>Close</Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {user ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Your Answer</label>
                    <Input placeholder="Enter your answer (e.g. 3.75)" value={answer} onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && answer.trim()) submitAnswer(); }} autoFocus />
                    <p className="mt-1 text-xs text-muted-foreground">Press Enter or click Submit. You have one attempt only.</p>
                  </div>
                  <Button onClick={submitAnswer} disabled={submitting || !answer.trim()} className="w-full gap-2">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Answer
                  </Button>
                </>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-2">
                  <a href="#/auth" className="text-primary underline font-medium">Sign in</a> to submit your answer.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
