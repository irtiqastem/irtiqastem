import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, X, Send, Filter, CheckCircle, Clock, XCircle, Code2, FileText, ChevronRight, Terminal } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Problem = { id: number; title: string; subject: string; topic: string; difficulty: string; track: string; statement: string; solved_by: number; };
type TestCase = { id: number; input: string; expected_output: string; is_sample: boolean; };
type Submission = { problem_id: number; status: string; };

const diffColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Hard: "bg-red-100 text-red-700 border-red-200",
};

const LANGUAGES = [
  { id: "cpp", label: "C++", placeholder: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    return 0;\n}` },
  { id: "python", label: "Python", placeholder: `# Your solution here\n\ndef solve():\n    pass\n\nsolve()` },
  { id: "java", label: "Java", placeholder: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Your solution here\n    }\n}` },
];

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
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [answer, setAnswer] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"problem" | "submit">("problem");

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

  const openProblem = async (p: Problem) => {
    setSelected(p);
    setActiveTab("problem");
    setAnswer(LANGUAGES[0].placeholder);
    setLanguage("cpp");
    const { data } = await supabase.from("test_cases").select("*").eq("problem_id", p.id).eq("is_sample", true).order("id");
    setTestCases(data ?? []);
  };

  const getStatus = (id: number) => userSubs.find(s => s.problem_id === id)?.status ?? null;

  const filtered = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || (p.topic ?? "").toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === "All" || p.difficulty === diffFilter;
    const matchTrack = trackFilter === "All" || p.track === trackFilter;
    return matchSearch && matchDiff && matchTrack;
  });

  const handleSubmit = async () => {
    if (!user) { toast.error("Please sign in to submit."); navigate("/auth"); return; }
    if (!answer.trim()) { toast.error("Please write your solution first."); return; }
    setSubmitting(true);
    const { error } = await supabase.from("submissions").insert([{
      user_id: user.id,
      problem_id: selected!.id,
      answer: answer.trim(),
      language,
      status: "pending",
      points: 0
    }]);
    if (error) toast.error(error.message);
    else {
      toast.success("Solution submitted! Pending review.");
      setUserSubs(prev => [...prev, { problem_id: selected!.id, status: "pending" }]);
      setSelected(null);
      setAnswer("");
    }
    setSubmitting(false);
  };

  const statusBadge = (status: string | null) => {
    if (!status) return null;
    if (status === "correct") return <span className="flex items-center gap-1 text-xs font-medium text-green-600"><CheckCircle className="h-3.5 w-3.5" /> Accepted</span>;
    if (status === "wrong") return <span className="flex items-center gap-1 text-xs font-medium text-red-500"><XCircle className="h-3.5 w-3.5" /> Wrong Answer</span>;
    return <span className="flex items-center gap-1 text-xs font-medium text-yellow-600"><Clock className="h-3.5 w-3.5" /> Pending</span>;
  };

  return (
    <>
      <section className="hero-gradient py-14 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-2 text-3xl font-bold text-primary-foreground md:text-5xl">Practice Problems</h1>
            <p className="text-primary-foreground/80">Solve olympiad-style problems, write code, and get expert feedback.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow px-4">
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search problems or topics..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
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

          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{filtered.length} problem{filtered.length !== 1 ? "s" : ""}</span>
            {user && <span>· {userSubs.filter(s => s.status === "correct").length} solved</span>}
            {user && userSubs.filter(s => s.status === "pending").length > 0 && <span className="text-yellow-600">· {userSubs.filter(s => s.status === "pending").length} pending</span>}
          </div>

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
                    <th className="px-4 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((p, i) => {
                    const status = getStatus(p.id);
                    return (
                      <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        onClick={() => openProblem(p)}
                        className="cursor-pointer transition-colors hover:bg-muted/30 group">
                        <td className="px-4 py-3.5 text-sm text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{p.title}</p>
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
                        <td className="px-4 py-3.5">
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-4xl rounded-t-2xl sm:rounded-2xl bg-card shadow-2xl flex flex-col"
              style={{ maxHeight: "92vh" }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-lg">{selected.title}</h2>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${diffColor[selected.difficulty] ?? ""}`}>{selected.difficulty}</span>
                  <Badge variant="secondary" className="text-xs">{selected.track}</Badge>
                  {selected.topic && <Badge variant="outline" className="text-xs">{selected.topic}</Badge>}
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors shrink-0 ml-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex border-b shrink-0">
                <button onClick={() => setActiveTab("problem")} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "problem" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <FileText className="h-4 w-4" /> Problem
                </button>
                <button onClick={() => setActiveTab("submit")} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "submit" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  <Code2 className="h-4 w-4" /> {selected.track === "IOI" ? "Code" : "Solution"}
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {activeTab === "problem" && (
                  <div className="p-6 space-y-6">
                    {selected.statement && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Problem Statement</h3>
                        <div className="rounded-xl bg-muted/40 border p-4 text-sm leading-relaxed whitespace-pre-wrap">{selected.statement}</div>
                      </div>
                    )}
                    {testCases.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                          <Terminal className="h-4 w-4" /> Sample Test Cases
                        </h3>
                        <div className="space-y-3">
                          {testCases.map((tc, i) => (
                            <div key={tc.id} className="rounded-xl border overflow-hidden">
                              <div className="bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground border-b">Example {i + 1}</div>
                              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                                <div className="p-4">
                                  <p className="text-xs font-semibold text-muted-foreground mb-2">Input</p>
                                  <pre className="text-sm font-mono bg-background rounded p-2 whitespace-pre-wrap border">{tc.input}</pre>
                                </div>
                                <div className="p-4">
                                  <p className="text-xs font-semibold text-muted-foreground mb-2">Expected Output</p>
                                  <pre className="text-sm font-mono bg-background rounded p-2 whitespace-pre-wrap border">{tc.expected_output}</pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button onClick={() => setActiveTab("submit")} className="gap-2 gold-gradient border-0 font-semibold text-navy">
                      {selected.track === "IOI" ? <><Code2 className="h-4 w-4" /> Write Code</> : <><Send className="h-4 w-4" /> Submit Solution</>}
                    </Button>
                  </div>
                )}
                {activeTab === "submit" && (
                  <div className="p-6 space-y-4">
                    {getStatus(selected.id) ? (
                      <div className="rounded-xl border bg-muted/30 p-6 text-center">
                        <div className="mb-2 flex justify-center">{statusBadge(getStatus(selected.id))}</div>
                        <p className="text-sm text-muted-foreground">You have already submitted a solution for this problem.</p>
                      </div>
                    ) : user ? (
                      <>
                        {selected.track === "IOI" ? (
                          <>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Language</label>
                              <div className="flex gap-2 flex-wrap">
                                {LANGUAGES.map(lang => (
                                  <button key={lang.id}
                                    onClick={() => { setLanguage(lang.id); setAnswer(lang.placeholder); }}
                                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${language === lang.id ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"}`}>
                                    <Code2 className="h-3.5 w-3.5" /> {lang.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Your Code</label>
                              <div className="rounded-xl overflow-hidden border">
                                <div className="flex bg-[#1e1e2e]">
                                  <div className="select-none bg-[#181825] px-3 py-4 text-right text-xs text-[#6c7086] font-mono leading-6 min-w-[3rem] shrink-0">
                                    {answer.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
                                  </div>
                                  <textarea
                                    value={answer}
                                    onChange={e => setAnswer(e.target.value)}
                                    className="flex-1 bg-[#1e1e2e] text-[#cdd6f4] font-mono text-sm leading-6 p-4 outline-none resize-none min-h-[300px] w-full"
                                    spellCheck={false}
                                    onKeyDown={e => {
                                      if (e.key === "Tab") {
                                        e.preventDefault();
                                        const s = e.currentTarget.selectionStart;
                                        const end = e.currentTarget.selectionEnd;
                                        const v = answer.substring(0, s) + "    " + answer.substring(end);
                                        setAnswer(v);
                                        setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 4; }, 0);
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex items-center justify-between bg-[#181825] border-t border-[#313244] px-4 py-2 text-xs text-[#6c7086]">
                                  <span>{LANGUAGES.find(l => l.id === language)?.label} · {answer.split("\n").length} lines</span>
                                  <span>Tab = 4 spaces</span>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div>
                            <label className="block text-sm font-semibold mb-2">Your Solution</label>
                            <Textarea placeholder="Write your full solution and reasoning here..." value={answer} onChange={e => setAnswer(e.target.value)} rows={8} className="resize-none" />
                          </div>
                        )}
                        <Button onClick={handleSubmit} disabled={submitting || !answer.trim()} className="w-full gap-2 gold-gradient border-0 font-semibold text-navy">
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Submit {selected.track === "IOI" ? "Code" : "Solution"}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">Your submission will be reviewed by our team.</p>
                      </>
                    ) : (
                      <div className="rounded-xl border bg-muted/30 p-6 text-center">
                        <p className="mb-3 text-sm text-muted-foreground">Sign in to submit your solution.</p>
                        <Button onClick={() => navigate("/auth")}>Sign In to Submit</Button>
                      </div>
                    )}
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
