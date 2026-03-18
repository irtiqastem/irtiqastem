import { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Loader2, Users, BookOpen, Trash2, Plus, BarChart3, Bell, Eye, TrendingUp, FileText, Save, ClipboardList, CheckCircle, XCircle, Pencil, X, GraduationCap } from "lucide-react";
import { toast } from "sonner";

type Tab = "overview" | "students" | "problems" | "submissions" | "scholarships" | "notice" | "content";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [students, setStudents] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [newScholarship, setNewScholarship] = useState({ name: "", country: "", eligibility: "", deadline: "", coverage: "", tags: "", description: "", link: "" });
  const [addingScholarship, setAddingScholarship] = useState(false);
  const [editScholarship, setEditScholarship] = useState<any | null>(null);
  const [updatingScholarship, setUpdatingScholarship] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [newProblem, setNewProblem] = useState({ title: "", subject: "Mathematics", topic: "", difficulty: "Easy", track: "IMO", statement: "", correct_answer: "", solution: "" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [points, setPoints] = useState("10");
  const [editProblem, setEditProblem] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { toast.error("Access denied."); navigate("/"); return; }
    loadAll();
  }, [isAdmin, authLoading, navigate]);

  const loadAll = async () => {
    const [{ data: s }, { data: p }, { data: sub }, { data: v }, { data: st }, { data: sch }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("problems").select("*").order("created_at", { ascending: false }),
      supabase.from("submissions").select("*, profiles(full_name, email), problems(title)").order("submitted_at", { ascending: false }),
      supabase.from("page_visits").select("*").order("visited_at", { ascending: false }).limit(500),
      supabase.from("site_settings").select("*"),
      supabase.from("scholarships").select("*").order("created_at", { ascending: false }),
    ]);
    setStudents(s ?? []);
    setProblems(p ?? []);
    setSubmissions(sub ?? []);
    setVisits(v ?? []);
    const m: Record<string, string> = {};
    (st ?? []).forEach((r: any) => { m[r.key] = r.value; });
    setSettings(m);
    setScholarships(sch ?? []);
    setDataLoading(false);
  };

  const addProblem = async () => {
    if (!newProblem.title.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("problems").insert([newProblem]);
    if (error) toast.error(error.message);
    else {
      toast.success("Problem added!");
      const { data } = await supabase.from("problems").select("*").order("created_at", { ascending: false });
      setProblems(data ?? []);
      setNewProblem({ title: "", subject: "Mathematics", topic: "", difficulty: "Easy", track: "IMO", statement: "", correct_answer: "", solution: "" });
    }
    setAdding(false);
  };

  const deleteProblem = async (id: number) => {
    if (!confirm("Delete this problem?")) return;
    const { error } = await supabase.from("problems").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setProblems(problems.filter((p) => p.id !== id));
  };

  const updateProblem = async () => {
    if (!editProblem || !editProblem.title.trim() || !editProblem.correct_answer?.trim()) return;
    setUpdating(true);
    const { error } = await supabase.from("problems").update({
      title: editProblem.title, subject: editProblem.subject, topic: editProblem.topic,
      difficulty: editProblem.difficulty, track: editProblem.track, statement: editProblem.statement,
      correct_answer: editProblem.correct_answer, solution: editProblem.solution,
    }).eq("id", editProblem.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Problem updated!");
      setProblems(prev => prev.map(p => p.id === editProblem.id ? { ...p, ...editProblem } : p));
      setEditProblem(null);
    }
    setUpdating(false);
  };

  const addScholarship = async () => {
    if (!newScholarship.name.trim()) return;
    setAddingScholarship(true);
    const tagsArray = newScholarship.tags.split(",").map(t => t.trim()).filter(Boolean);
    const { error } = await supabase.from("scholarships").insert([{ ...newScholarship, tags: tagsArray, active: true }]);
    if (error) toast.error(error.message);
    else {
      toast.success("Scholarship added!");
      const { data } = await supabase.from("scholarships").select("*").order("created_at", { ascending: false });
      setScholarships(data ?? []);
      setNewScholarship({ name: "", country: "", eligibility: "", deadline: "", coverage: "", tags: "", description: "", link: "" });
    }
    setAddingScholarship(false);
  };

  const deleteScholarship = async (id: string) => {
    if (!confirm("Delete this scholarship?")) return;
    const { error } = await supabase.from("scholarships").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setScholarships(scholarships.filter(s => s.id !== id));
  };

  const updateScholarship = async () => {
    if (!editScholarship) return;
    setUpdatingScholarship(true);
    const tagsArray = typeof editScholarship.tags === "string"
      ? editScholarship.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : editScholarship.tags;
    const { error } = await supabase.from("scholarships").update({ ...editScholarship, tags: tagsArray }).eq("id", editScholarship.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Scholarship updated!");
      setScholarships(prev => prev.map(s => s.id === editScholarship.id ? { ...s, ...editScholarship, tags: tagsArray } : s));
      setEditScholarship(null);
    }
    setUpdatingScholarship(false);
  };

  const reviewSubmission = async (id: number, status: "correct" | "wrong") => {
    const pts = status === "correct" ? parseInt(points) || 10 : 0;
    const { error } = await supabase.from("submissions").update({ status, points: pts, admin_feedback: feedback, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Reviewed!");
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, points: pts, admin_feedback: feedback } : s));
      setReviewId(null); setFeedback(""); setPoints("10");
    }
  };

  const saveSetting = async (key: string, value: string) => {
    setSaving(true);
    await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    toast.success("Saved!");
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaving(false);
  };

  const todayVisits = visits.filter(v => new Date(v.visited_at).toDateString() === new Date().toDateString()).length;
  const pageStats = visits.reduce((acc: Record<string, number>, v) => { acc[v.page] = (acc[v.page] || 0) + 1; return acc; }, {});
  const topPages = Object.entries(pageStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const pendingCount = submissions.filter(s => s.status === "pending").length;

  if (authLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "students", label: `Students (${students.length})`, icon: Users },
    { id: "problems", label: `Problems (${problems.length})`, icon: BookOpen },
    { id: "submissions", label: "Submissions", icon: ClipboardList, badge: pendingCount },
    { id: "scholarships", label: `Scholarships (${scholarships.length})`, icon: GraduationCap },
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
            {[{ icon: Users, label: "Total Students", value: students.length, color: "text-blue-600" }, { icon: BookOpen, label: "Total Problems", value: problems.length, color: "text-purple-600" }, { icon: Eye, label: "Total Visits", value: visits.length, color: "text-green-600" }, { icon: TrendingUp, label: "Today's Visits", value: todayVisits, color: "text-orange-600" }].map(({ icon: Icon, label, value, color }) => (
              <Card key={label}><CardContent className="flex items-center gap-4 p-6"><Icon className={`h-10 w-10 ${color}`} /><div><div className="text-3xl font-bold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div></CardContent></Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="flex items-center gap-4 p-6"><ClipboardList className="h-10 w-10 text-yellow-500" /><div><div className="text-3xl font-bold">{submissions.length}</div><div className="text-xs text-muted-foreground">Total Submissions</div></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6"><CheckCircle className="h-10 w-10 text-green-500" /><div><div className="text-3xl font-bold">{submissions.filter(s => s.status === "correct").length}</div><div className="text-xs text-muted-foreground">Correct</div></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6"><Bell className="h-10 w-10 text-red-500" /><div><div className="text-3xl font-bold">{pendingCount}</div><div className="text-xs text-muted-foreground">Pending Review</div></div></CardContent></Card>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><CardHeader><CardTitle>Top Pages</CardTitle></CardHeader><CardContent>{topPages.length === 0 ? <p className="text-sm text-muted-foreground">No visits yet.</p> : <div className="space-y-3">{topPages.map(([page, count]) => (<div key={page} className="flex items-center justify-between"><span className="text-sm font-medium">{page || "/"}</span><div className="flex items-center gap-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((count / visits.length) * 200, 100)}px` }} /><span className="text-sm text-muted-foreground">{count}</span></div></div>))}</div>}</CardContent></Card>
            <Card><CardHeader><CardTitle>Recent Students</CardTitle></CardHeader><CardContent><div className="space-y-2">{students.slice(0, 5).map((s) => (<div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"><div><p className="text-sm font-medium">{s.full_name || "No name"}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>{s.grade && <Badge variant="secondary" className="text-xs">{s.grade}</Badge>}</div>))}{students.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}</div></CardContent></Card>
          </div>
        </div>
      )}

      {tab === "students" && (
        <Card><CardHeader><CardTitle>All Students</CardTitle><CardDescription>Every registered student</CardDescription></CardHeader><CardContent>{dataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="space-y-2">{students.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}{students.map((s) => { const userSubs = submissions.filter(sub => sub.user_id === s.id); const totalPoints = userSubs.reduce((sum, sub) => sum + (sub.points || 0), 0); return (<div key={s.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{s.full_name || "No name"}</p><p className="text-sm text-muted-foreground">{s.email}</p>{s.school && <p className="text-xs text-muted-foreground">{s.school}</p>}</div><div className="flex flex-col items-end gap-1">{s.grade && <Badge variant="secondary">{s.grade}</Badge>}<span className="text-xs text-muted-foreground">{userSubs.length} submissions · {totalPoints} pts</span></div></div>); })}</div>}</CardContent></Card>
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
            <Textarea placeholder="Problem statement (shown to students)" value={newProblem.statement} onChange={(e) => setNewProblem({ ...newProblem, statement: e.target.value })} rows={3} />
            <Input placeholder="Correct answer (e.g. 3.75) — used for auto-checking *" value={newProblem.correct_answer} onChange={(e) => setNewProblem({ ...newProblem, correct_answer: e.target.value })} />
            <Textarea placeholder="Solution explanation (shown to student after submitting)" value={newProblem.solution} onChange={(e) => setNewProblem({ ...newProblem, solution: e.target.value })} rows={4} />
            <Button onClick={addProblem} disabled={adding || !newProblem.title.trim() || !newProblem.correct_answer.trim()} className="gap-2">{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Problem</Button>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>All Problems ({problems.length})</CardTitle></CardHeader><CardContent><div className="space-y-2">{dataLoading && <Loader2 className="h-4 w-4 animate-spin" />}{!dataLoading && problems.length === 0 && <p className="text-sm text-muted-foreground">No problems yet.</p>}{problems.map((p) => (<div key={p.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.subject} · {p.topic} · {p.difficulty} · {p.track}</p></div><div className="flex gap-1"><Button variant="ghost" size="sm" className="text-primary" onClick={() => setEditProblem({ ...p })}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProblem(p.id)}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div></CardContent></Card>
        </div>
      )}

      <Dialog open={!!editProblem} onOpenChange={(o) => { if (!o) setEditProblem(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Edit Problem</DialogTitle></DialogHeader>
          {editProblem && (
            <div className="space-y-3 mt-2">
              <Input placeholder="Problem title *" value={editProblem.title} onChange={(e) => setEditProblem({ ...editProblem, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <select className="rounded-md border bg-background px-3 py-2 text-sm" value={editProblem.subject} onChange={(e) => setEditProblem({ ...editProblem, subject: e.target.value })}><option>Mathematics</option><option>Informatics</option></select>
                <Input placeholder="Topic" value={editProblem.topic || ""} onChange={(e) => setEditProblem({ ...editProblem, topic: e.target.value })} />
                <select className="rounded-md border bg-background px-3 py-2 text-sm" value={editProblem.difficulty} onChange={(e) => setEditProblem({ ...editProblem, difficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option></select>
                <select className="rounded-md border bg-background px-3 py-2 text-sm" value={editProblem.track} onChange={(e) => setEditProblem({ ...editProblem, track: e.target.value })}><option>IMO</option><option>IOI</option></select>
              </div>
              <Textarea placeholder="Problem statement" value={editProblem.statement || ""} onChange={(e) => setEditProblem({ ...editProblem, statement: e.target.value })} rows={4} />
              <Input placeholder="Correct answer *" value={editProblem.correct_answer || ""} onChange={(e) => setEditProblem({ ...editProblem, correct_answer: e.target.value })} />
              <Textarea placeholder="Solution explanation" value={editProblem.solution || ""} onChange={(e) => setEditProblem({ ...editProblem, solution: e.target.value })} rows={4} />
              <div className="flex gap-2 pt-1">
                <Button onClick={updateProblem} disabled={updating || !editProblem.title.trim() || !editProblem.correct_answer?.trim()} className="flex-1 gap-2">{updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</Button>
                <Button variant="outline" onClick={() => setEditProblem(null)} className="gap-2"><X className="h-4 w-4" /> Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {tab === "submissions" && (
        <div className="space-y-3">
          {dataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
            {submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
            {submissions.map((sub) => (
              <Card key={sub.id} className={sub.status === "pending" ? "border-yellow-200 bg-yellow-50/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{sub.profiles?.full_name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{sub.profiles?.email}</span>
                        <Badge variant={sub.status === "correct" ? "default" : sub.status === "wrong" ? "destructive" : "secondary"} className="text-xs capitalize">{sub.status}</Badge>
                        {sub.points > 0 && <Badge className="bg-green-100 text-green-700 text-xs">+{sub.points} pts</Badge>}
                      </div>
                      <p className="mt-1 text-sm font-medium text-primary">{sub.problems?.title}</p>
                      <p className="mt-2 rounded bg-muted p-2 text-sm">{sub.answer}</p>
                      {sub.admin_feedback && <p className="mt-1 text-xs text-muted-foreground">Feedback: {sub.admin_feedback}</p>}
                    </div>
                    {reviewId === sub.id ? (
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        <Input placeholder="Points (e.g. 10)" value={points} onChange={(e) => setPoints(e.target.value)} className="text-sm" />
                        <Input placeholder="Feedback (optional)" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="text-sm" />
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 gap-1 bg-green-600 hover:bg-green-700" onClick={() => reviewSubmission(sub.id, "correct")}><CheckCircle className="h-3 w-3" /> Correct</Button>
                          <Button size="sm" variant="destructive" className="flex-1 gap-1" onClick={() => reviewSubmission(sub.id, "wrong")}><XCircle className="h-3 w-3" /> Wrong</Button>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setReviewId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => { setReviewId(sub.id); setFeedback(sub.admin_feedback || ""); setPoints(sub.points?.toString() || "10"); }}>Review</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>}
        </div>
      )}

      {tab === "scholarships" && (
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add New Scholarship</CardTitle></CardHeader><CardContent className="space-y-3">
            <Input placeholder="Scholarship name *" value={newScholarship.name} onChange={(e) => setNewScholarship({ ...newScholarship, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Country (e.g. Pakistan, USA)" value={newScholarship.country} onChange={(e) => setNewScholarship({ ...newScholarship, country: e.target.value })} />
              <Input placeholder="Eligibility (e.g. Grade 9+)" value={newScholarship.eligibility} onChange={(e) => setNewScholarship({ ...newScholarship, eligibility: e.target.value })} />
              <Input placeholder="Deadline (e.g. March 2026)" value={newScholarship.deadline} onChange={(e) => setNewScholarship({ ...newScholarship, deadline: e.target.value })} />
              <Input placeholder="Coverage (e.g. Fully Funded)" value={newScholarship.coverage} onChange={(e) => setNewScholarship({ ...newScholarship, coverage: e.target.value })} />
            </div>
            <Input placeholder="Tags — comma separated (e.g. National, STEM Only, Fully Funded)" value={newScholarship.tags} onChange={(e) => setNewScholarship({ ...newScholarship, tags: e.target.value })} />
            <Textarea placeholder="Short description (shown on card)" value={newScholarship.description} onChange={(e) => setNewScholarship({ ...newScholarship, description: e.target.value })} rows={2} />
            <Input placeholder="Application link (e.g. https://...)" value={newScholarship.link} onChange={(e) => setNewScholarship({ ...newScholarship, link: e.target.value })} />
            <Button onClick={addScholarship} disabled={addingScholarship || !newScholarship.name.trim()} className="gap-2">{addingScholarship ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Scholarship</Button>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>All Scholarships ({scholarships.length})</CardTitle></CardHeader><CardContent>
            <div className="space-y-2">{dataLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {!dataLoading && scholarships.length === 0 && <p className="text-sm text-muted-foreground">No scholarships yet.</p>}
            {scholarships.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.country} · {s.eligibility} · {s.deadline} · {s.coverage}</p>
                  <div className="mt-1 flex flex-wrap gap-1">{(s.tags ?? []).map((t: string) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="text-primary" onClick={() => setEditScholarship({ ...s, tags: (s.tags ?? []).join(", ") })}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteScholarship(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}</div>
          </CardContent></Card>
        </div>
      )}

      <Dialog open={!!editScholarship} onOpenChange={(o) => { if (!o) setEditScholarship(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Edit Scholarship</DialogTitle></DialogHeader>
          {editScholarship && (
            <div className="space-y-3 mt-2">
              <Input placeholder="Scholarship name *" value={editScholarship.name} onChange={(e) => setEditScholarship({ ...editScholarship, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Country" value={editScholarship.country || ""} onChange={(e) => setEditScholarship({ ...editScholarship, country: e.target.value })} />
                <Input placeholder="Eligibility" value={editScholarship.eligibility || ""} onChange={(e) => setEditScholarship({ ...editScholarship, eligibility: e.target.value })} />
                <Input placeholder="Deadline" value={editScholarship.deadline || ""} onChange={(e) => setEditScholarship({ ...editScholarship, deadline: e.target.value })} />
                <Input placeholder="Coverage" value={editScholarship.coverage || ""} onChange={(e) => setEditScholarship({ ...editScholarship, coverage: e.target.value })} />
              </div>
              <Input placeholder="Tags (comma separated)" value={typeof editScholarship.tags === "string" ? editScholarship.tags : (editScholarship.tags ?? []).join(", ")} onChange={(e) => setEditScholarship({ ...editScholarship, tags: e.target.value })} />
              <Input placeholder="Application link" value={editScholarship.link || ""} onChange={(e) => setEditScholarship({ ...editScholarship, link: e.target.value })} />
              <div className="flex gap-2 pt-1">
                <Button onClick={updateScholarship} disabled={updatingScholarship || !editScholarship.name.trim()} className="flex-1 gap-2">{updatingScholarship ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</Button>
                <Button variant="outline" onClick={() => setEditScholarship(null)} className="gap-2"><X className="h-4 w-4" /> Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {tab === "notice" && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notice / Announcement</CardTitle><CardDescription>Appears as a popup on homepage.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            <button onClick={() => saveSetting("notice_enabled", settings.notice_enabled === "true" ? "false" : "true")} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notice_enabled === "true" ? "bg-primary" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notice_enabled === "true" ? "translate-x-6" : "translate-x-1"}`} /></button>
            <span className={`text-sm font-medium ${settings.notice_enabled === "true" ? "text-green-600" : "text-gray-500"}`}>{settings.notice_enabled === "true" ? "ACTIVE" : "INACTIVE"}</span>
          </div>
          <div><label className="mb-1 block text-sm font-medium">Title</label><Input value={settings.notice_title ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, notice_title: e.target.value }))} placeholder="e.g. Important Announcement" /></div>
          <div><label className="mb-1 block text-sm font-medium">Message</label><Textarea value={settings.notice_text ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, notice_text: e.target.value }))} rows={4} placeholder="Your announcement..." /></div>
          <Button onClick={async () => { setSaving(true); await Promise.all([supabase.from("site_settings").upsert({ key: "notice_title", value: settings.notice_title ?? "" }), supabase.from("site_settings").upsert({ key: "notice_text", value: settings.notice_text ?? "" })]); toast.success("Notice saved!"); setSaving(false); }} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Notice</Button>
        </CardContent></Card>
      )}

      {tab === "content" && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Edit Homepage Content</CardTitle><CardDescription>Changes appear on live site after saving.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium">Hero Title</label><Input value={settings.hero_title ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))} /></div>
          <div><label className="mb-1 block text-sm font-medium">Hero Subtitle</label><Textarea value={settings.hero_subtitle ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))} rows={3} /></div>
          <Button onClick={async () => { setSaving(true); await Promise.all([supabase.from("site_settings").upsert({ key: "hero_title", value: settings.hero_title ?? "" }), supabase.from("site_settings").upsert({ key: "hero_subtitle", value: settings.hero_subtitle ?? "" })]); toast.success("Content saved!"); setSaving(false); }} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</Button>
        </CardContent></Card>
      )}
    </div>
  );
}
