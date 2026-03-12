import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Loader2, Users, BookOpen, Trash2, Plus, BarChart3, Bell, Eye, TrendingUp, FileText, Save, ClipboardList, CheckCircle, XCircle, Newspaper, Terminal, Code2 } from "lucide-react";
import { toast } from "sonner";

type Tab = "overview" | "students" | "problems" | "testcases" | "submissions" | "blog" | "notice" | "content";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [students, setStudents] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [posts, setPosts] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newProblem, setNewProblem] = useState({ title: "", subject: "Mathematics", topic: "", difficulty: "Easy", track: "IMO", statement: "" });
  const [newPost, setNewPost] = useState({ title: "", content: "", excerpt: "", author: "Irtiqa STEM", category: "", published: true });
  const [adding, setAdding] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [postAdding, setPostAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [points, setPoints] = useState("10");
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [tcLoading, setTcLoading] = useState(false);
  const [newTc, setNewTc] = useState({ input: "", expected_output: "", is_sample: true });
  const [tcAdding, setTcAdding] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { toast.error("Access denied."); navigate("/"); return; }
    loadAll();
  }, [isAdmin, authLoading, navigate]);

  const loadAll = async () => {
    const [{ data: s }, { data: p }, { data: rawSub }, { data: v }, { data: st }, { data: bp }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("problems").select("*").order("created_at", { ascending: false }),
      supabase.from("submissions").select("*").order("submitted_at", { ascending: false }),
      supabase.from("page_visits").select("*").order("visited_at", { ascending: false }).limit(500),
      supabase.from("site_settings").select("*"),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
    ]);
    const profileMap: Record<string, any> = {};
    (s ?? []).forEach((prof: any) => { profileMap[prof.id] = prof; });
    const problemMap: Record<number, any> = {};
    (p ?? []).forEach((prob: any) => { problemMap[prob.id] = prob; });
    const enriched = (rawSub ?? []).map((item: any) => ({
      ...item,
      profiles: profileMap[item.user_id] ?? null,
      problems: problemMap[item.problem_id] ?? null,
    }));
    setStudents(s ?? []); setProblems(p ?? []); setSubmissions(enriched);
    setVisits(v ?? []); setPosts(bp ?? []);
    const m: Record<string, string> = {};
    (st ?? []).forEach((r: any) => { m[r.key] = r.value; });
    setSettings(m); setDataLoading(false);
  };

  const loadTestCases = async (problemId: number) => {
    setTcLoading(true); setSelectedProblemId(problemId);
    const { data } = await supabase.from("test_cases").select("*").eq("problem_id", problemId).order("id");
    setTestCases(data ?? []); setTcLoading(false);
  };

  const addTestCase = async () => {
    if (!newTc.input.trim() || !newTc.expected_output.trim() || !selectedProblemId) return;
    setTcAdding(true);
    const { error } = await supabase.from("test_cases").insert([{ ...newTc, problem_id: selectedProblemId }]);
    if (error) toast.error(error.message);
    else { toast.success("Test case added!"); await loadTestCases(selectedProblemId); setNewTc({ input: "", expected_output: "", is_sample: true }); }
    setTcAdding(false);
  };

  const deleteTestCase = async (id: number) => {
    if (!confirm("Delete?")) return;
    await supabase.from("test_cases").delete().eq("id", id);
    setTestCases(prev => prev.filter(tc => tc.id !== id));
    toast.success("Deleted.");
  };

  const addProblem = async () => {
    if (!newProblem.title.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("problems").insert([newProblem]);
    if (error) toast.error(error.message);
    else { toast.success("Problem added!"); const { data } = await supabase.from("problems").select("*").order("created_at", { ascending: false }); setProblems(data ?? []); setNewProblem({ title: "", subject: "Mathematics", topic: "", difficulty: "Easy", track: "IMO", statement: "" }); }
    setAdding(false);
  };

  const deleteProblem = async (id: number) => {
    if (!confirm("Delete this problem?")) return;
    await supabase.from("problems").delete().eq("id", id);
    setProblems(problems.filter((p) => p.id !== id));
  };

  const saveEdit = async () => {
    if (!editingProblem || !editingProblem.title.trim()) return;
    setEditSaving(true);
    const { error } = await supabase.from("problems").update({
      title: editingProblem.title,
      subject: editingProblem.subject,
      topic: editingProblem.topic,
      difficulty: editingProblem.difficulty,
      track: editingProblem.track,
      statement: editingProblem.statement,
    }).eq("id", editingProblem.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Problem updated!");
      setProblems(prev => prev.map(p => p.id === editingProblem.id ? { ...p, ...editingProblem } : p));
      setEditingProblem(null);
    }
    setEditSaving(false);
  };

  const addPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setPostAdding(true);
    const { error } = await supabase.from("blog_posts").insert([newPost]);
    if (error) toast.error(error.message);
    else { toast.success("Post published!"); const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false }); setPosts(data ?? []); setNewPost({ title: "", content: "", excerpt: "", author: "Irtiqa STEM", category: "", published: true }); }
    setPostAdding(false);
  };

  const deletePost = async (id: number) => {
    if (!confirm("Delete?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts(posts.filter((p) => p.id !== id));
    toast.success("Deleted.");
  };

  const reviewSubmission = async (id: number, status: "correct" | "wrong") => {
    const pts = status === "correct" ? parseInt(points) || 10 : 0;
    const { error } = await supabase.from("submissions").update({ status, points: pts, admin_feedback: feedback, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Reviewed!"); setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, points: pts, admin_feedback: feedback } : s)); setReviewId(null); setFeedback(""); setPoints("10"); }
  };

  const saveSetting = async (key: string, value: string) => {
    setSaving(true);
    await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    toast.success("Saved!"); setSettings(prev => ({ ...prev, [key]: value })); setSaving(false);
  };

  const todayVisits = visits.filter(v => new Date(v.visited_at).toDateString() === new Date().toDateString()).length;
  const signedInVisits = visits.filter(v => v.is_authenticated).length;
  const guestVisits = visits.filter(v => !v.is_authenticated).length;
  const pageStats = visits.reduce((acc: Record<string, number>, v) => { acc[v.page] = (acc[v.page] || 0) + 1; return acc; }, {});
  const topPages = Object.entries(pageStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const pendingCount = submissions.filter(s => s.status === "pending").length;

  if (authLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "students", label: `Students (${students.length})`, icon: Users },
    { id: "problems", label: `Problems (${problems.length})`, icon: BookOpen },
    { id: "testcases", label: "Test Cases", icon: Terminal },
    { id: "submissions", label: "Submissions", icon: ClipboardList, badge: pendingCount },
    { id: "blog", label: `Blog (${posts.length})`, icon: Newspaper },
    { id: "notice", label: "Notice", icon: Bell },
    { id: "content", label: "Edit Content", icon: FileText },
  ];

  return (
    <div className="container-narrow px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary"><Shield className="h-6 w-6 text-primary-foreground" /></div>
        <div><h1 className="text-3xl font-bold">Admin Panel</h1><p className="text-sm text-muted-foreground">Irtiqa STEM — Full Control</p></div>
        <Badge className="ml-auto bg-amber-100 text-amber-800">Admin</Badge>
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => setTab(id)} className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            <Icon className="h-4 w-4" /> {label}
            {badge ? <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{badge}</span> : null}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[{ icon: Users, label: "Total Students", value: students.length, color: "text-blue-600" }, { icon: BookOpen, label: "Total Problems", value: problems.length, color: "text-purple-600" }, { icon: Eye, label: "Total Visits", value: visits.length, color: "text-green-600" }, { icon: TrendingUp, label: "Today Visits", value: todayVisits, color: "text-orange-600" }].map(({ icon: Icon, label, value, color }) => (
              <Card key={label}><CardContent className="flex items-center gap-4 p-6"><Icon className={`h-10 w-10 ${color}`} /><div><div className="text-3xl font-bold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div></CardContent></Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card><CardContent className="flex items-center gap-4 p-6"><ClipboardList className="h-10 w-10 text-yellow-500" /><div><div className="text-3xl font-bold">{submissions.length}</div><div className="text-xs text-muted-foreground">Total Submissions</div></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6"><CheckCircle className="h-10 w-10 text-green-500" /><div><div className="text-3xl font-bold">{submissions.filter(s => s.status === "correct").length}</div><div className="text-xs text-muted-foreground">Correct</div></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6"><Users className="h-10 w-10 text-blue-400" /><div><div className="text-3xl font-bold">{signedInVisits}</div><div className="text-xs text-muted-foreground">Signed-In Visits</div></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6"><Eye className="h-10 w-10 text-gray-400" /><div><div className="text-3xl font-bold">{guestVisits}</div><div className="text-xs text-muted-foreground">Guest Visits</div></div></CardContent></Card>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><CardHeader><CardTitle>Top Pages</CardTitle></CardHeader><CardContent>{topPages.length === 0 ? <p className="text-sm text-muted-foreground">No visits yet.</p> : <div className="space-y-3">{topPages.map(([page, count]) => (<div key={page} className="flex items-center justify-between"><span className="text-sm font-medium">{page || "/"}</span><div className="flex items-center gap-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((count / visits.length) * 200, 100)}px` }} /><span className="text-sm text-muted-foreground">{count}</span></div></div>))}</div>}</CardContent></Card>
            <Card><CardHeader><CardTitle>Recent Students</CardTitle></CardHeader><CardContent><div className="space-y-2">{students.slice(0, 5).map((s) => (<div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"><div><p className="text-sm font-medium">{s.full_name || "No name"}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>{s.grade && <Badge variant="secondary" className="text-xs">{s.grade}</Badge>}</div>))}{students.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}</div></CardContent></Card>
          </div>
        </div>
      )}

      {tab === "students" && (
        <Card><CardHeader><CardTitle>All Students</CardTitle></CardHeader><CardContent>{dataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="space-y-2">{students.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}{students.map((s) => { const userSubs = submissions.filter(sub => sub.user_id === s.id); const totalPoints = userSubs.reduce((sum, sub) => sum + (sub.points || 0), 0); return (<div key={s.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{s.full_name || "No name"}</p><p className="text-sm text-muted-foreground">{s.email}</p>{s.school && <p className="text-xs text-muted-foreground">{s.school}</p>}</div><div className="flex flex-col items-end gap-1">{s.grade && <Badge variant="secondary">{s.grade}</Badge>}<span className="text-xs text-muted-foreground">{userSubs.length} subs · {totalPoints} pts</span></div></div>); })}</div>}</CardContent></Card>
      )}

      {tab === "problems" && (
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add New Problem</CardTitle></CardHeader><CardContent className="space-y-3">
            <Input placeholder="Problem title *" value={newProblem.title} onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={newProblem.subject} onChange={(e) => setNewProblem({ ...newProblem, subject: e.target.value })}><option>Mathematics</option><option>Informatics</option></select>
              <Input placeholder="Topic" value={newProblem.topic} onChange={(e) => setNewProblem({ ...newProblem, topic: e.target.value })} />
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={newProblem.difficulty} onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option></select>
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={newProblem.track} onChange={(e) => setNewProblem({ ...newProblem, track: e.target.value })}><option>IMO</option><option>IOI</option></select>
            </div>
            <Textarea placeholder="Problem statement" value={newProblem.statement} onChange={(e) => setNewProblem({ ...newProblem, statement: e.target.value })} rows={3} />
            <Button onClick={addProblem} disabled={adding || !newProblem.title.trim()} className="gap-2">{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Problem</Button>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>All Problems ({problems.length})</CardTitle></CardHeader><CardContent><div className="space-y-2">{problems.length === 0 && <p className="text-sm text-muted-foreground">No problems yet.</p>}{problems.map((p) => (<div key={p.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.subject} · {p.topic} · {p.difficulty} · {p.track}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => { setTab("testcases"); loadTestCases(p.id); }}><Terminal className="h-3 w-3" /> Test Cases</Button><Button variant="outline" size="sm" className="gap-1 text-xs text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setEditingProblem({ ...p })}><FileText className="h-3 w-3" /> Edit</Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProblem(p.id)}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div></CardContent></Card>
        </div>
      )}

      {editingProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-card border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Problem</h2>
              <button onClick={() => setEditingProblem(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/70"><XCircle className="h-4 w-4" /></button>
            </div>
            <Input placeholder="Problem title *" value={editingProblem.title} onChange={e => setEditingProblem({ ...editingProblem, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={editingProblem.subject} onChange={e => setEditingProblem({ ...editingProblem, subject: e.target.value })}><option>Mathematics</option><option>Informatics</option></select>
              <Input placeholder="Topic" value={editingProblem.topic ?? ""} onChange={e => setEditingProblem({ ...editingProblem, topic: e.target.value })} />
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={editingProblem.difficulty} onChange={e => setEditingProblem({ ...editingProblem, difficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option></select>
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={editingProblem.track} onChange={e => setEditingProblem({ ...editingProblem, track: e.target.value })}><option>IMO</option><option>IOI</option></select>
            </div>
            <Textarea placeholder="Problem statement" value={editingProblem.statement ?? ""} onChange={e => setEditingProblem({ ...editingProblem, statement: e.target.value })} rows={6} />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditingProblem(null)}>Cancel</Button>
              <Button onClick={saveEdit} disabled={editSaving || !editingProblem.title.trim()} className="gap-2">
                {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {tab === "testcases" && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Terminal className="h-4 w-4" /> Manage Test Cases</CardTitle><CardDescription>Select a problem to manage its test cases</CardDescription></CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Problem</label>
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={selectedProblemId ?? ""} onChange={e => e.target.value ? loadTestCases(Number(e.target.value)) : setSelectedProblemId(null)}>
                  <option value="">-- Choose a problem --</option>
                  {problems.map(p => <option key={p.id} value={p.id}>{p.title} ({p.track})</option>)}
                </select>
              </div>
              {selectedProblemId && (
                <>
                  <div className="mb-6 rounded-xl border p-4 bg-muted/30 space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Add Test Case</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Input</label>
                        <Textarea placeholder="e.g. 5&#10;1 2 3 4 5" value={newTc.input} onChange={e => setNewTc({ ...newTc, input: e.target.value })} rows={4} className="font-mono text-sm resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Expected Output</label>
                        <Textarea placeholder="e.g. 15" value={newTc.expected_output} onChange={e => setNewTc({ ...newTc, expected_output: e.target.value })} rows={4} className="font-mono text-sm resize-none" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium">Show as sample?</label>
                      <button onClick={() => setNewTc({ ...newTc, is_sample: !newTc.is_sample })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newTc.is_sample ? "bg-primary" : "bg-gray-300"}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newTc.is_sample ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                      <span className="text-xs text-muted-foreground">{newTc.is_sample ? "Visible to students" : "Hidden"}</span>
                    </div>
                    <Button onClick={addTestCase} disabled={tcAdding || !newTc.input.trim() || !newTc.expected_output.trim()} className="gap-2">
                      {tcAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Test Case
                    </Button>
                  </div>
                  {tcLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Existing Test Cases ({testCases.length})</h3>
                      {testCases.length === 0 && <p className="text-sm text-muted-foreground">No test cases yet.</p>}
                      {testCases.map((tc, i) => (
                        <div key={tc.id} className="rounded-xl border overflow-hidden">
                          <div className="flex items-center justify-between bg-muted/60 px-4 py-2 border-b">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">Test {i + 1} <Badge variant={tc.is_sample ? "default" : "secondary"} className="text-xs">{tc.is_sample ? "Sample" : "Hidden"}</Badge></span>
                            <Button variant="ghost" size="sm" className="text-destructive h-7 w-7 p-0" onClick={() => deleteTestCase(tc.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                            <div className="p-3"><p className="text-xs font-medium text-muted-foreground mb-1">Input</p><pre className="text-xs font-mono bg-background rounded p-2 whitespace-pre-wrap border">{tc.input}</pre></div>
                            <div className="p-3"><p className="text-xs font-medium text-muted-foreground mb-1">Expected Output</p><pre className="text-xs font-mono bg-background rounded p-2 whitespace-pre-wrap border">{tc.expected_output}</pre></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "submissions" && (
        <div className="space-y-3">
          {dataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
            {submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
            {submissions.map((sub) => (
              <Card key={sub.id} className={sub.status === "pending" ? "border-yellow-200 bg-yellow-50/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium">{sub.profiles?.full_name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{sub.profiles?.email}</span>
                        <Badge variant={sub.status === "correct" ? "default" : sub.status === "wrong" ? "destructive" : "secondary"} className="text-xs capitalize">{sub.status}</Badge>
                        {sub.points > 0 && <Badge className="bg-green-100 text-green-700 text-xs">+{sub.points} pts</Badge>}
                        {sub.language && <Badge variant="outline" className="text-xs flex items-center gap-1"><Code2 className="h-3 w-3" />{sub.language}</Badge>}
                      </div>
                      <p className="text-sm font-medium text-primary mb-2">{sub.problems?.title}</p>
                      {sub.language && sub.language !== "text" ? (
                        <div className="rounded-lg overflow-hidden border">
                          <div className="bg-[#181825] px-3 py-1.5 text-xs text-[#6c7086] flex items-center gap-2"><Code2 className="h-3 w-3" />{sub.language}</div>
                          <pre className="bg-[#1e1e2e] text-[#cdd6f4] text-xs font-mono p-3 overflow-x-auto max-h-48 whitespace-pre-wrap">{sub.answer}</pre>
                        </div>
                      ) : (
                        <p className="rounded bg-muted p-2 text-sm">{sub.answer}</p>
                      )}
                      {sub.admin_feedback && <p className="mt-1 text-xs text-muted-foreground">Feedback: {sub.admin_feedback}</p>}
                    </div>
                    {reviewId === sub.id ? (
                      <div className="flex flex-col gap-2 min-w-[180px] shrink-0">
                        <Input placeholder="Points" value={points} onChange={(e) => setPoints(e.target.value)} className="text-sm" />
                        <Input placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="text-sm" />
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 gap-1 bg-green-600 hover:bg-green-700" onClick={() => reviewSubmission(sub.id, "correct")}><CheckCircle className="h-3 w-3" /> Correct</Button>
                          <Button size="sm" variant="destructive" className="flex-1 gap-1" onClick={() => reviewSubmission(sub.id, "wrong")}><XCircle className="h-3 w-3" /> Wrong</Button>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setReviewId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="shrink-0" onClick={() => { setReviewId(sub.id); setFeedback(sub.admin_feedback || ""); setPoints(sub.points?.toString() || "10"); }}>Review</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>}
        </div>
      )}

      {tab === "blog" && (
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> Write New Post</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Post title *" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-3"><Input placeholder="Author" value={newPost.author} onChange={(e) => setNewPost({ ...newPost, author: e.target.value })} /><Input placeholder="Category" value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })} /></div>
              <Textarea placeholder="Short excerpt" value={newPost.excerpt} onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })} rows={2} />
              <Textarea placeholder="Full content *" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows={8} />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Published</span>
                <button onClick={() => setNewPost({ ...newPost, published: !newPost.published })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newPost.published ? "bg-primary" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newPost.published ? "translate-x-6" : "translate-x-1"}`} /></button>
                <span className="text-sm text-muted-foreground">{newPost.published ? "Visible" : "Draft"}</span>
              </div>
              <Button onClick={addPost} disabled={postAdding || !newPost.title.trim() || !newPost.content.trim()} className="gap-2">{postAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Publish</Button>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>All Posts ({posts.length})</CardTitle></CardHeader><CardContent><div className="space-y-2">{posts.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}{posts.map((p) => (<div key={p.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.published ? "Published" : "Draft"} · {new Date(p.created_at).toLocaleDateString()}</p></div><Button variant="ghost" size="sm" className="text-destructive" onClick={() => deletePost(p.id)}><Trash2 className="h-4 w-4" /></Button></div>))}</div></CardContent></Card>
        </div>
      )}

      {tab === "notice" && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notice</CardTitle><CardDescription>Popup on homepage.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            <button onClick={() => saveSetting("notice_enabled", settings.notice_enabled === "true" ? "false" : "true")} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notice_enabled === "true" ? "bg-primary" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notice_enabled === "true" ? "translate-x-6" : "translate-x-1"}`} /></button>
            <span className={`text-sm font-medium ${settings.notice_enabled === "true" ? "text-green-600" : "text-gray-500"}`}>{settings.notice_enabled === "true" ? "ACTIVE" : "INACTIVE"}</span>
          </div>
          <div><label className="mb-1 block text-sm font-medium">Title</label><Input value={settings.notice_title ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, notice_title: e.target.value }))} /></div>
          <div><label className="mb-1 block text-sm font-medium">Message</label><Textarea value={settings.notice_text ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, notice_text: e.target.value }))} rows={4} /></div>
          <Button onClick={async () => { setSaving(true); await Promise.all([supabase.from("site_settings").upsert({ key: "notice_title", value: settings.notice_title ?? "" }), supabase.from("site_settings").upsert({ key: "notice_text", value: settings.notice_text ?? "" })]); toast.success("Saved!"); setSaving(false); }} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
        </CardContent></Card>
      )}

      {tab === "content" && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Edit Homepage</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium">Hero Title</label><Input value={settings.hero_title ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))} /></div>
          <div><label className="mb-1 block text-sm font-medium">Hero Subtitle</label><Textarea value={settings.hero_subtitle ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))} rows={3} /></div>
          <Button onClick={async () => { setSaving(true); await Promise.all([supabase.from("site_settings").upsert({ key: "hero_title", value: settings.hero_title ?? "" }), supabase.from("site_settings").upsert({ key: "hero_subtitle", value: settings.hero_subtitle ?? "" })]); toast.success("Saved!"); setSaving(false); }} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
        </CardContent></Card>
      )}
    </div>
  );
}
