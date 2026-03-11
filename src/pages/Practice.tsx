import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, X, Send, Filter, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Problem = { id: number; title: string; subject: string; topic: string; difficulty: string; track: string; statement: string; solved_by: number; };
type Submission = { problem_id: number; status: string; };

const diffColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Hard: "bg-red-100 text-red-700 border-red-200",
};

export default function Practice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [userSubs, setUserSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [trackFilter, setTrackFilter] = useState("All");
  const [selected, setSelected] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("page_visits").insert([{ page: "/practice" }]).then(() => {});
    supabase.from("problems").select("*").order("created_at", { ascending: true }).then(({ data }) => {
      setProblems(data ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("submissions").select("problem_id, status").eq("user_id", user.id).then(({ data }) => setUserSubs(data ?? []));
  }, [user]);

  const getStatus = (id: number) => userSubs.find(s => s.problem_id === id)?.status ?? null;

  const filtered = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.topic?.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === "All" || p.difficulty === diffFilter;
    const matchTrack = trackFilter === "All" || p.track === trackFilter;
    return matchSearch && matchDiff && matchTrack;
  });

  const handleSubmit = async () => {
    if (!user) { toast.error("Please sign in to submit."); navigate("/auth"); return; }
    if (!answer.trim()) { toast.error("Please write your answer first."); return; }
    setSubmitting(true);
    const { error } = await supabase.from("submissions").insert([{ user_id: user.id, problem_id: selected!.id, answer: answer.trim(), status: "pending", points: 0 }]);
    if (error) { toast.error(error.message); }
    else {
      toast.success("Submitted! Your answer is pending review.");
      setUserSubs(prev => [...prev, { problem_id: selected!.id, status: "pending" }]);
      setSelected(null);
      setAnswer("");
    }
    setSubmitting(false);
  };

  const statusBadge = (status: string | null) => {
    if (!status) return null;
    if (status === "correct") return <span className="flex items-center gap-1 text-xs font-medium text-green-600"><CheckCircle className="h-3.5 w-3.5" /> Correct</span>;
    if (status === "wrong") return <span className="flex items-center gap-1 text-xs font-medium text-red-500"><XCircle className="h-3.5 w-3.5" /> Wrong</span>;
    return <span className="flex items-center gap-1 text-xs font-medium text-yellow-600"><Clock className="h-3.5 w-3.5" /> Pending</span>;
  };

  return (
    <>
      <section className="hero-gradient py-14 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-2 text-3xl font-bold text-primary-foreground md:text-5xl">Practice Problems</h1>
            <p className="text-primary-foreground/80">Solve olympiad-style problems and get feedback from our team.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow px-4">
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search problems or topics..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {["All", "Easy", "Medium", "Hard"].map(d => (
                <button key={d} onClick={() => setDiffFilter(d)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors border ${diffFilter === d ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"}`}>{d}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {["All", "IMO", "IOI"].map(t => (
                <button key={t} onClick={() => setTrackFilter(t)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors border ${trackFilter === t ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"}`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{filtered.length} problem{filtered.length !== 1 ? "s" : ""}</span>
            {user && <span>· {userSubs.filter(s => s.status === "correct").length} solved</span>}
            {user && userSubs.filter(s => s.status === "pending").length > 0 && <span className="text-yellow-600">· {userSubs.filter(s => s.status === "pending").length} pending review</span>}
          </div>

          {/* Problems table */}
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground">No problems found.</div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <table className="w-full">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-10">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Problem</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Track</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((p, i) => {
                    const status = getStatus(p.id);
                    return (
                      <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        onClick={() => { setSelected(p); setAnswer(""); }}
                        className="cursor-pointer transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3.5 text-sm text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-foreground">{p.title}</p>
                          {p.topic && <p className="text-xs text-muted-foreground mt-0.5">{p.topic}</p>}
                        </td>
                        <td className="hidden px-4 py-3.5 sm:table-cell">
                          <Badge variant="secondary" className="text-xs">{p.track}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${diffColor[p.difficulty] ?? "bg-gray-100 text-gray-600"}`}>{p.difficulty}</span>
                        </td>
                        <td className="hidden px-4 py-3.5 md:table-cell">
                          {statusBadge(status) ?? <span className="text-xs text-muted-foreground">Not attempted</span>}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Problem modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-0 sm:items-center sm:pb-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl rounded-t-2xl sm:rounded-2xl bg-card shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-6 py-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${diffColor[selected.difficulty] ?? ""}`}>{selected.difficulty}</span>
                  <Badge variant="secondary" className="text-xs">{selected.track}</Badge>
                  {selected.topic && <Badge variant="outline" className="text-xs">{selected.topic}</Badge>}
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors"><X className="h-4 w-4" /></button>
              </div>

              <div className="p-6">
                <h2 className="mb-4 text-xl font-bold">{selected.title}</h2>
                {selected.statement && (
                  <div className="mb-6 rounded-xl bg-muted/50 border p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{selected.statement}</div>
                )}

                {getStatus(selected.id) ? (
                  <div className="rounded-xl border bg-muted/30 p-4 text-center">
                    <div className="mb-1">{statusBadge(getStatus(selected.id))}</div>
                    <p className="text-sm text-muted-foreground">You have already submitted an answer for this problem.</p>
                  </div>
                ) : user ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold">Your Answer / Solution</label>
                    <Textarea placeholder="Write your full solution here. Show your working and reasoning..." value={answer} onChange={e => setAnswer(e.target.value)} rows={6} className="resize-none" />
                    <Button onClick={handleSubmit} disabled={submitting || !answer.trim()} className="w-full gap-2 gold-gradient border-0 font-semibold text-navy">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Submit Answer
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">Your answer will be reviewed by our team and you'll receive feedback.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border bg-muted/30 p-6 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">Sign in to submit your answer and get feedback.</p>
                    <Button onClick={() => navigate("/auth")} className="gap-2">Sign In to Submit</Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
