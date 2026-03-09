import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Loader2, Users, BookOpen, Trash2, Plus, BarChart3, Bell, Eye, TrendingUp, FileText, Save } from "lucide-react";
import { toast } from "sonner";

type Tab = "overview" | "students" | "problems" | "notice" | "content";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [students, setStudents] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [newProblem, setNewProblem] = useState({ title: "", subject: "Mathematics", topic: "", difficulty: "Easy", statement: "" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { toast.error("Access denied."); navigate("/"); return; }
    loadAll();
  }, [isAdmin, authLoading, navigate]);

  const loadAll = async () => {
    const [{ data: s }, { data: p }, { data: v }, { data: st }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("problems").select("*").order("created_at", { ascending: false }),
      supabase.from("page_visits").select("*").order("visited_at", { ascending: false }).limit(500),
      supabase.from("site_settings").select("*"),
    ]);
    setStudents(s ?? []);
    setProblems(p ?? []);
    setVisits(v ?? []);
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
      setNewProblem({ title: "", subject: "Mathematics", topic: "", difficulty: "Easy", statement: "" });
    }
    setAdding(false);
  };

  const deleteProblem = async (id: number) => {
    if (!confirm("Delete this problem?")) return;
    const { error } = await supabase.from("problems").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setProblems(problems.filter((p) => p.id !== id));
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

  if (authLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "students", label: `Students (${students.length})`, icon: Users },
    { id: "problems", label: `Problems (${problems.length})`, icon: BookOpen },
    { id: "notice", label: "Notice", icon: Bell },
    { id: "content", label: "Edit Content", icon: FileText },
  ];

  return (
    <div className="container-narrow px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Irtiqa STEM — Full Control</p>
        </div>
        <Badge className="ml-auto bg-amber-100 text-amber-800">Admin</Badge>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, label: "Total Students", value: students.length, color: "text-blue-600" },
              { icon: BookOpen, label: "Total Problems", value: problems.length, color: "text-purple-600" },
              { icon: Eye, label: "Total Visits", value: visits.length, color: "text-green-600" },
              { icon: TrendingUp, label: "Today's Visits", value: todayVisits, color: "text-orange-600" },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label}><CardContent className="flex items-center gap-4 p-6"><Icon className={`h-10 w-10 ${color}`} /><div><div className="text-3xl font-bold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div></CardContent></Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Top Pages</CardTitle></CardHeader>
              <CardContent>
                {topPages.length === 0 ? <p className="text-sm text-muted-foreground">No visits yet.</p> : (
                  <div className="space-y-3">
                    {topPages.map(([page, count]) => (
                      <div key={page} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{page || "/"}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((count / visits.length) * 200, 100)}px` }} />
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Recent Students</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {students.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <div><p className="text-sm font-medium">{s.full_name || "No name"}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>
                      {s.grade && <Badge variant="secondary" className="text-xs">{s.grade}</Badge>}
                    </div>
                  ))}
                  {students.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Notice Status</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className={`h-3 w-3 rounded-full ${settings.notice_enabled === "true" ? "bg-green-500" : "bg-gray-300"}`} />
              <span className="text-sm">Notice is <strong>{settings.notice_enabled === "true" ? "ACTIVE" : "INACTIVE"}</strong></span>
              <Button size="sm" variant="outline" onClick={() => setTab("notice")}>Manage</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "students" && (
        <Card>
          <CardHeader><CardTitle>All Students</CardTitle><CardDescription>Every registered student</CardDescription></CardHeader>
          <CardContent>
            {dataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <div className="space-y-2">
                {students.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="font-medium">{s.full_name || "No name"}</p><p className="text-sm text-muted-foreground">{s.email}</p>{s.school && <p className="text-xs text-muted-foreground">{s.school}</p>}</div>
                    <div className="flex flex-col items-end gap-1">{s.grade && <Badge variant="secondary">{s.grade}</Badge>}{s.city && <span className="text-xs text-muted-foreground">{s.city}</span>}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "problems" && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add New Problem</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Problem title *" value={newProblem.title} onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })} />
              <div className="grid grid-cols-3 gap-3">
                <select className="rounded-md border bg-background px-3 py-2 text-sm" value={newProblem.subject} onChange={(e) => setNewProblem({ ...newProblem, subject: e.target.value })}><option>Mathematics</option><option>Informatics</option></select>
                <Input placeholder="Topic" value={newProblem.topic} onChange={(e) => setNewProblem({ ...newProblem, topic: e.target.value })} />
                <select className="rounded-md border bg-background px-3 py-2 text-sm" value={newProblem.difficulty} onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option></select>
              </div>
              <Textarea placeholder="Problem statement (optional)" value={newProblem.statement} onChange={(e) => setNewProblem({ ...newProblem, statement: e.target.value })} rows={3} />
              <Button onClick={addProblem} disabled={adding || !newProblem.title.trim()} className="gap-2">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Problem
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>All Problems ({problems.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dataLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {!dataLoading && problems.length === 0 && <p className="text-sm text-muted-foreground">No problems yet.</p>}
                {problems.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.subject} · {p.topic} · {p.difficulty}</p></div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProblem(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "notice" && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notice / Announcement</CardTitle><CardDescription>Appears as a popup on the homepage for all visitors.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Status:</span>
                <button onClick={() => saveSetting("notice_enabled", settings.notice_enabled === "true" ? "false" : "true")} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notice_enabled === "true" ? "bg-primary" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notice_enabled === "true" ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm font-medium ${settings.notice_enabled === "true" ? "text-green-600" : "text-gray-500"}`}>{settings.notice_enabled === "true" ? "ACTIVE" : "INACTIVE"}</span>
              </div>
              <div><label className="mb-1 block text-sm font-medium">Title</label><Input value={settings.notice_title ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, notice_title: e.target.value }))} placeholder="e.g. Important Announcement" /></div>
              <div><label className="mb-1 block text-sm font-medium">Message</label><Textarea value={settings.notice_text ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, notice_text: e.target.value }))} rows={4} placeholder="Your announcement..." /></div>
              <Button onClick={async () => { setSaving(true); await Promise.all([supabase.from("site_settings").upsert({ key: "notice_title", value: settings.notice_title ?? "" }), supabase.from("site_settings").upsert({ key: "notice_text", value: settings.notice_text ?? "" })]); toast.success("Notice saved!"); setSaving(false); }} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Notice
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "content" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Edit Homepage Content</CardTitle><CardDescription>Changes appear on live site after saving.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="mb-1 block text-sm font-medium">Hero Title</label><Input value={settings.hero_title ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))} /></div>
            <div><label className="mb-1 block text-sm font-medium">Hero Subtitle</label><Textarea value={settings.hero_subtitle ?? ""} onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))} rows={3} /></div>
            <Button onClick={async () => { setSaving(true); await Promise.all([supabase.from("site_settings").upsert({ key: "hero_title", value: settings.hero_title ?? "" }), supabase.from("site_settings").upsert({ key: "hero_subtitle", value: settings.hero_subtitle ?? "" })]); toast.success("Content saved!"); setSaving(false); }} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
