import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Loader2, Users, BookOpen, Award, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const ADMIN_EMAIL = "arhammukhtar777@gmail.com";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  grade: string;
  school: string;
  created_at: string;
}

interface Problem {
  id: number;
  title: string;
  subject: string;
  difficulty: string;
  topic: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [tab, setTab] = useState<"students" | "problems">("students");
  const [students, setStudents] = useState<Profile[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newProblem, setNewProblem] = useState({
    title: "",
    subject: "Mathematics",
    topic: "",
    difficulty: "Easy",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    // Directly check session from supabase instead of relying on context
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const email = session.user.email;
      if (email !== ADMIN_EMAIL) {
        toast.error("Access denied. Admin only.");
        navigate("/");
        return;
      }

      setAllowed(true);
      setChecking(false);

      // Fetch data
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("problems").select("*").order("created_at", { ascending: false }),
      ]);
      setStudents(s ?? []);
      setProblems(p ?? []);
      setDataLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const addProblem = async () => {
    if (!newProblem.title.trim()) return;
    setAdding(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("problems")
      .insert([{ ...newProblem, created_by: session?.user.id }]);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Problem added!");
      const { data } = await supabase
        .from("problems")
        .select("*")
        .order("created_at", { ascending: false });
      setProblems(data ?? []);
      setNewProblem({ title: "", subject: "Mathematics", topic: "", difficulty: "Easy" });
    }
    setAdding(false);
  };

  const deleteProblem = async (id: number) => {
    const { error } = await supabase.from("problems").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Problem deleted.");
      setProblems(problems.filter((p) => p.id !== id));
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="container-narrow px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">{ADMIN_EMAIL}</p>
        </div>
        <Badge className="ml-auto bg-amber-100 text-amber-800">Admin</Badge>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: "Total Students", value: students.length },
          { icon: BookOpen, label: "Total Problems", value: problems.length },
          { icon: Award, label: "Achievements Available", value: 6 },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <Icon className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={tab === "students" ? "default" : "outline"}
          onClick={() => setTab("students")}
          className="gap-2"
        >
          <Users className="h-4 w-4" /> Students ({students.length})
        </Button>
        <Button
          variant={tab === "problems" ? "default" : "outline"}
          onClick={() => setTab("problems")}
          className="gap-2"
        >
          <BookOpen className="h-4 w-4" /> Problems ({problems.length})
        </Button>
      </div>

      {/* Students Tab */}
      {tab === "students" && (
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>Every registered student on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="space-y-3">
                {students.length === 0 && (
                  <p className="text-sm text-muted-foreground">No students registered yet.</p>
                )}
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{s.full_name || "No name set"}</p>
                      <p className="text-sm text-muted-foreground">{s.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.grade && <Badge variant="secondary">{s.grade}</Badge>}
                      {s.school && (
                        <span className="hidden text-xs text-muted-foreground sm:block">
                          {s.school}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Problems Tab */}
      {tab === "problems" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add New Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Problem title"
                value={newProblem.title}
                onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-3">
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={newProblem.subject}
                  onChange={(e) => setNewProblem({ ...newProblem, subject: e.target.value })}
                >
                  <option>Mathematics</option>
                  <option>Informatics</option>
                </select>
                <Input
                  placeholder="Topic (e.g. Geometry)"
                  value={newProblem.topic}
                  onChange={(e) => setNewProblem({ ...newProblem, topic: e.target.value })}
                />
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={newProblem.difficulty}
                  onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <Button
                onClick={addProblem}
                disabled={adding || !newProblem.title.trim()}
                className="gap-2"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Problem
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Problems</CardTitle>
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="space-y-2">
                  {problems.length === 0 && (
                    <p className="text-sm text-muted-foreground">No problems added yet.</p>
                  )}
                  {problems.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.subject} · {p.topic} · {p.difficulty}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteProblem(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
