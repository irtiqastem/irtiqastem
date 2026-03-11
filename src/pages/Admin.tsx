import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Loader2, Users, BookOpen, Trash2, Plus, BarChart3, Bell, Eye, TrendingUp, FileText, Save, ClipboardList, CheckCircle, XCircle, Newspaper } from "lucide-react";
import { toast } from "sonner";

type Tab = "overview" | "students" | "problems" | "submissions" | "blog" | "notice" | "content";

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
  const [postAdding, setPostAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [points, setPoints] = useState("10");

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { toast.error("Access denied."); navigate("/"); return; }
    loadAll();
  }, [isAdmin, authLoading, navigate]);

  const loadAll = async () => {
    const [{ data: s }, { data: p }, { data: sub }, { data: v }, { data: st }, { data: bp }] = await Promise.all([
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
    const enriched = (sub ?? []).map((item: any) => ({
      ...item,
      profiles: profileMap[item.user_id] ?? null,
      problems: problemMap[item.problem_id] ?? null,
    }));
    setStudents(s ?? []);
    setProblems(p ?? []);
    setSubmissions(enriched);
    setVisits(v ?? []);
    setPosts(bp ?? []);
    const m: Record<string, string> = {};
    (st ?? []).forEach((r: any) => { m[r.key] = r.value; });
    setSettings(m);
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
      setNewProblem({ title: "", subject: "Mathematics", topic: "", difficulty: "Easy", track: "IMO", statement: "" });
    }
    setAdding(false);
  };

  const deleteProblem = async (id: number) => {
    if (!confirm("Delete this problem?")) return;
    const { error } = await supabase.from("problems").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setProblems(problems.filter((p) => p.id !== id));
  };

  const addPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setPostAdding(true);
    const { error } = await supabase.from("blog_posts").insert([newPost]);
    if (error) toast.error(error.message);
    else {
      toast.success("Post published!");
      const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      setPosts(data ?? []);
      setNewPost({ title: "", content: "", excerpt: "", author: "Irtiqa STEM", category: "", published: true });
    }
    setPostAdding(false);
  };

  const deletePost = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts(posts.filter((p) => p.id !== id));
    toast.success("Post deleted.");
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
    { id: "blog", label: `Blog (${posts.length})`, icon: Newspaper },
    { id: "notice", label: "Notice", icon: Bell },
    { id: "content", label: "Edit Content", icon: FileText },
  ];

  return (
    <div className="container-narrow px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
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
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="flex items-center gap-4 p-6"><ClipboardList className="h-10 w-10 text-yellow-500" /><div><div className="text-3xl font-bold">{submissions.length}</div><div className="text-xs text-muted-foreground">Total Submissions</div></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6"><CheckCircle className="h-10 w-10 text-green-500" /><div><div className="text-3xl font-bold">{submissions.filter(s => s.status === "correct").length}</div><div className="text-xs text-muted-foreground">Correct</div></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6"><Newspaper className="h-10 w-10 text-blue-500" /><div><div className="text-3xl font-bold">{posts.length}</div><div className="text-xs text-muted-foreground">Blog Posts</div></div></CardContent></Card>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><CardHeader><CardTitle>Top Pages</CardTitle></CardHeader><CardContent>{topPages.length === 0 ? <p className="text-sm text-muted-foreground">No visits yet.</p> : <div className="space-y-3">{topPages.map(([page, count]) => (<div key={page} className="flex items-center justify-between"><span className="text-sm font-medium">{page || "/"}</span><div className="flex items-center gap-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((count / visits.length) * 200, 100)}px` }} /><span className="text-sm text-muted-foreground">{count}</span></div></div>))}</div>}</CardContent></Card>
            <Card><CardHeader><CardTitle>Recent Students</CardTitle></CardHeader><CardContent><div className="space-y-2">{students.slice(0, 5).map((s) => (<div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"><div><p className="text-sm font-medium">{s.full_name || "No name"}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>{s.grade && <Badge variant="secondary" className="text-xs">{s.grade}</Badge>}</div>))}{students.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}</div></CardContent></Card>
          </div>
        </div>
      )}

      {tab === "students" && (
        <Card><CardHeader><CardTitle>All Students</CardTitle><CardDescription>Every registered student</CardDescription></CardHeader><CardContent>{dataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="space-y-2">{students.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}{students.map((s) => { const userSubs = submissions.filter(sub => sub.user_id === s.id); const totalPoints = userSubs.reduce((sum, sub) => sum + (sub.points || 0), 0); return (<div key={s.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{s.full_name || "No name"}</p><p className="text-sm text-muted-foreground">{s.email}</p>{s.school && <p className="text-xs text-muted-foreground">{s.school}</p>}</div><div className="flex flex-col items-end gap-1">{s.grade && <Badge variant="secondary">{s.grade}</Badge>}<span className="text-xs text-muted-foreground">{userSubs.length} subs · {totalPoints} pts</span></div></div>); })}</div>}</CardContent></Card>
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
          <Card><CardHeader><CardTitle>All Problems ({problems.length})</CardTitle></CardHeader><CardContent><div className="space-y-2">{!dataLoading && problems.length === 0 && <p className="text-sm text-muted-foreground">No problems yet.</p>}{problems.map((p) => (<div key={p.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.subject} · {p.topic} · {p.difficulty} · {p.track}</p></div><Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProblem(p.id)}><Trash2 className="h-4 w-4" /></Button></div>))}</div></CardContent></Card>
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
                        <Input placeholder="Points" value={points} onChange={(e) => setPoints(e.target.value)} className="text-sm" />
                        <Input placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="text-sm" />
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

      {tab === "blog" && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> Write New Post</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Post title *" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Author" value={newPost.author} onChange={(e) => setNewPost({ ...newPost, author: e.target.value })} />
                <Input placeholder="Category (e.g. News, Tips)" value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })} />
              </div>
              <Textarea placeholder="Short excerpt (shown in card preview)" value={newPost.excerpt} onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })} rows={2} />
              <Textarea placeholder="Full post content *" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows={8} />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Published</span>
                <button onClick={() => setNewPost({ ...newPost, published: !newPost.published })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newPost.published ? "bg-primary" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newPost.published ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm text-muted-foreground">{newPost.published ? "Visible to all" : "Draft"}</span>
              </div>
              <Button onClick={addPost} disabled={postAdding || !newPost.title.trim() || !newPost.content.trim()} className="gap-2">
                {postAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Publish Post
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>All Posts ({posts.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {posts.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
                {posts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.published ? "Published" : "Draft"} · {new Date(p.created_at).toLocaleDateString()} · {p.author}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deletePost(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "notice" && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notice</CardTitle><CardDescription>Appears as a popup on homepage.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            <button onClick={() => saveSetting("notice_enabled", settings.notice_enabled === "true" ? "false" : "true")} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notice_enabled === "true" ? "bg-primary" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notice_enabled === "true" ? "translate-x-6" : "translate-x-1"}`} /></button>
            <span className={`text-sm font-medium ${settings.notice_enabled === "true" ? "text-green-600" : "text-gray-500"}`}>{settings.notice_enabled === "true" ? "ACTIVE" : "INACTIVE"}</span>
          </div>
          <div><label className="mb-1 block text-sm font-medium">Title</label><Input value={settings.notice_title ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, notice_title: e.target.value }))} placeholder="Announcement title" /></div>
          <div><label className="mb-1 block text-sm font-medium">Message</label><Textarea value={settings.notice_text ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, notice_text: e.target.value }))} rows={4} placeholder="Your announcement..." /></div>
          <Button onClick={async () => { setSaving(true); await Promise.all([supabase.from("site_settings").upsert({ key: "notice_title", value: settings.notice_title ?? "" }), supabase.from("site_settings").upsert({ key: "notice_text", value: settings.notice_text ?? "" })]); toast.success("Saved!"); setSaving(false); }} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
        </CardContent></Card>
      )}

      {tab === "content" && (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Edit Homepage</CardTitle><CardDescription>Changes appear on live site after saving.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium">Hero Title</label><Input value={settings.hero_title ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))} /></div>
          <div><label className="mb-1 block text-sm font-medium">Hero Subtitle</label><Textarea value={settings.hero_subtitle ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))} rows={3} /></div>
          <Button onClick={async () => { setSaving(true); await Promise.all([supabase.from("site_settings").upsert({ key: "hero_title", value: settings.hero_title ?? "" }), supabase.from("site_settings").upsert({ key: "hero_subtitle", value: settings.hero_subtitle ?? "" })]); toast.success("Saved!"); setSaving(false); }} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
        </CardContent></Card>
      )}
    </div>
  );
}
