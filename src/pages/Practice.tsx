import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Send, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Problem = {
  id: number;
  title: string;
  difficulty: string;
  topic: string;
  subject: string;
  track: string;
  tags: string[];
  solved_by: number;
  statement: string;
};

type Submission = {
  id: number;
  problem_id: number;
  status: string;
  points: number;
  answer: string;
  admin_feedback: string;
};

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

const statusIcon = (status: string) => {
  if (status === "correct") return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (status === "wrong") return <XCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-yellow-500" />;
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

    // Track visit
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

  const submitAnswer = async () => {
    if (!user) { toast.error("Please sign in to submit answers."); return; }
    if (!answer.trim()) { toast.error("Please write your answer first."); return; }
    if (!selected) return;

    setSubmitting(true);
    const existing = getSubmission(selected.id);

    if (existing) {
      const { error } = await supabase.from("submissions").update({
        answer: answer.trim(),
        status: "pending",
        submitted_at: new Date().toISOString(),
      }).eq("id", existing.id);
      if (error) toast.error(error.message);
      else {
        toast.success("Answer resubmitted!");
        setSubmissions(prev => prev.map(s => s.id === existing.id ? { ...s, answer: answer.trim(), status: "pending" } : s));
      }
    } else {
      const { data, error } = await supabase.from("submissions").insert([{
        user_id: user.id,
        problem_id: selected.id,
        answer: answer.trim(),
        status: "pending",
      }]).select().single();
      if (error) toast.error(error.message);
      else {
        toast.success("Answer submitted! Admin will review it.");
        setSubmissions(prev => [...prev, data]);
      }
    }
    setSubmitting(false);
    setSelected(null);
    setAnswer("");
  };

  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 text-3xl font-bold text-primary-foreground md:text-5xl">Practice Problems</h1>
            <p className="max-w-2xl text-primary-foreground/80 text-lg">
              Sharpen your skills with curated problems. Submit your answers for review.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow px-4">
          {/* Filters */}
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
                  <motion.div
                    key={problem.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => { setSelected(problem); setAnswer(sub?.answer ?? ""); }}
                    className="grid grid-cols-1 cursor-pointer items-center gap-2 border-b px-6 py-4 last:border-0 hover:bg-muted/30 transition-colors sm:grid-cols-12 sm:gap-4"
                  >
                    <span className="hidden text-sm font-mono text-muted-foreground sm:block sm:col-span-1">{i + 1}</span>
                    <div className="sm:col-span-5">
                      <span className="font-medium">{problem.title}</span>
                      {problem.topic && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">{problem.topic}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColors[problem.difficulty] || "bg-gray-100 text-gray-700"}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <Badge variant="outline" className="text-xs">{problem.track || "IMO"}</Badge>
                    </div>
                    <div className="flex items-center justify-end gap-1 sm:col-span-2">
                      {sub ? (
                        <>
                          {statusIcon(sub.status)}
                          <span className="text-xs text-muted-foreground capitalize">{sub.status}</span>
                          {sub.points > 0 && <Badge className="text-xs bg-green-100 text-green-700">+{sub.points}pts</Badge>}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not attempted</span>
                      )}
                    </div>
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

      {/* Problem Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setAnswer(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColors[selected?.difficulty || ""] || "bg-gray-100 text-gray-700"}`}>
                {selected?.difficulty}
              </span>
              <Badge variant="outline" className="text-xs">{selected?.track || "IMO"}</Badge>
              {selected?.topic && <Badge variant="secondary" className="text-xs">{selected.topic}</Badge>}
            </div>

            {selected?.statement && (
              <div className="rounded-lg bg-muted p-4 text-sm">{selected.statement}</div>
            )}

            {getSubmission(selected?.id ?? 0) && (
              <div className={`rounded-lg p-3 text-sm ${
                getSubmission(selected?.id ?? 0)?.status === "correct" ? "bg-green-50 border border-green-200" :
                getSubmission(selected?.id ?? 0)?.status === "wrong" ? "bg-red-50 border border-red-200" :
                "bg-yellow-50 border border-yellow-200"
              }`}>
                <div className="flex items-center gap-2 font-medium">
                  {statusIcon(getSubmission(selected?.id ?? 0)?.status ?? "")}
                  Status: <span className="capitalize">{getSubmission(selected?.id ?? 0)?.status}</span>
                  {(getSubmission(selected?.id ?? 0)?.points ?? 0) > 0 && (
                    <Badge className="bg-green-100 text-green-700">+{getSubmission(selected?.id ?? 0)?.points} pts</Badge>
                  )}
                </div>
                {getSubmission(selected?.id ?? 0)?.admin_feedback && (
                  <p className="mt-1 text-muted-foreground">Feedback: {getSubmission(selected?.id ?? 0)?.admin_feedback}</p>
                )}
              </div>
            )}

            {user ? (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">Your Answer</label>
                  <Textarea
                    placeholder="Write your solution here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button onClick={submitAnswer} disabled={submitting || !answer.trim()} className="w-full gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {getSubmission(selected?.id ?? 0) ? "Resubmit Answer" : "Submit Answer"}
                </Button>
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                <a href="#/auth" className="text-primary underline">Sign in</a> to submit your answer.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
