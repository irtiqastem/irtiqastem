import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, XCircle, Clock, FileText, Trophy, BookOpen, GraduationCap, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !isAdmin) return null;

  return (
    <>
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-primary-foreground md:text-3xl">Admin Panel</h1>
            <p className="text-primary-foreground/70">Manage problems, submissions, blog posts, and scholarships.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <Tabs defaultValue="problems">
            <TabsList className="mb-6 grid w-full max-w-lg grid-cols-4">
              <TabsTrigger value="problems" className="gap-1 text-xs"><Trophy className="h-3.5 w-3.5" /> Problems</TabsTrigger>
              <TabsTrigger value="submissions" className="gap-1 text-xs"><Clock className="h-3.5 w-3.5" /> Reviews</TabsTrigger>
              <TabsTrigger value="blog" className="gap-1 text-xs"><FileText className="h-3.5 w-3.5" /> Blog</TabsTrigger>
              <TabsTrigger value="scholarships" className="gap-1 text-xs"><GraduationCap className="h-3.5 w-3.5" /> Scholarships</TabsTrigger>
            </TabsList>

            <TabsContent value="problems"><ProblemsTab /></TabsContent>
            <TabsContent value="submissions"><SubmissionsTab /></TabsContent>
            <TabsContent value="blog"><BlogTab /></TabsContent>
            <TabsContent value="scholarships"><ScholarshipsTab /></TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
}

function ProblemsTab() {
  const [problems, setProblems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProblems = async () => {
    const { data } = await supabase.from("problems").select("*").order("created_at", { ascending: false });
    setProblems(data || []);
  };

  useEffect(() => { fetchProblems(); }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const tagsRaw = (form.get("tags") as string) || "";

    const { error } = await supabase.from("problems").insert({
      title: form.get("title") as string,
      difficulty: form.get("difficulty") as string,
      track: form.get("track") as string,
      tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      statement: form.get("statement") as string,
      sample_input: form.get("sample_input") as string,
      sample_output: form.get("sample_output") as string,
      created_by: user?.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Problem added!" });
      setOpen(false);
      fetchProblems();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Problems ({problems.length})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Problem</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Problem</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><Label>Title</Label><Input name="title" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Difficulty</Label>
                  <select name="difficulty" className="w-full rounded-md border bg-background px-3 py-2 text-sm" required>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <Label>Track</Label>
                  <select name="track" className="w-full rounded-md border bg-background px-3 py-2 text-sm" required>
                    <option value="IMO">IMO</option>
                    <option value="IOI">IOI</option>
                  </select>
                </div>
              </div>
              <div><Label>Tags (comma separated)</Label><Input name="tags" placeholder="Algebra, Geometry" /></div>
              <div><Label>Problem Statement</Label><Textarea name="statement" rows={4} required /></div>
              <div><Label>Sample Input</Label><Textarea name="sample_input" rows={2} /></div>
              <div><Label>Sample Output</Label><Textarea name="sample_output" rows={2} /></div>
              <Button type="submit" className="w-full">Add Problem</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {problems.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <span className="font-medium text-foreground">{p.title}</span>
              <div className="flex gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">{p.track}</Badge>
                <Badge variant="outline" className="text-xs">{p.difficulty}</Badge>
              </div>
            </div>
          </div>
        ))}
        {problems.length === 0 && <p className="text-muted-foreground text-center py-8">No problems yet.</p>}
      </div>
    </div>
  );
}

function SubmissionsTab() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchSubs = async () => {
    const { data } = await supabase
      .from("submissions")
      .select("*, problems(title), profiles:user_id(full_name)")
      .order("submitted_at", { ascending: false });
    setSubmissions(data || []);
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleEvaluate = async (id: string, status: "accepted" | "rejected") => {
    const { error } = await supabase
      .from("submissions")
      .update({ status, evaluated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Submission ${status}` });
      fetchSubs();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Pending Submissions</h2>
      <div className="space-y-3">
        {submissions.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{(s.problems as any)?.title || "Unknown Problem"}</p>
                  <p className="text-sm text-muted-foreground">
                    by {(s.profiles as any)?.full_name || "Unknown"} · {new Date(s.submitted_at).toLocaleDateString()}
                  </p>
                  <pre className="mt-2 rounded bg-muted p-2 text-xs text-foreground max-h-24 overflow-auto">{s.answer}</pre>
                </div>
                <div className="flex items-center gap-1">
                  {s.status === "pending" ? (
                    <>
                      <Button size="icon" variant="ghost" className="text-success" onClick={() => handleEvaluate(s.id, "accepted")}>
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleEvaluate(s.id, "rejected")}>
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </>
                  ) : (
                    <Badge variant={s.status === "accepted" ? "default" : "destructive"} className="text-xs">
                      {s.status}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {submissions.length === 0 && <p className="text-muted-foreground text-center py-8">No submissions yet.</p>}
      </div>
    </div>
  );
}

function BlogTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;

    const { error } = await supabase.from("blog_posts").insert({
      title,
      slug: title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      content: form.get("content") as string,
      category: form.get("category") as string,
      excerpt: form.get("excerpt") as string,
      published: true,
      author_id: user?.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post published!" });
      setOpen(false);
      fetchPosts();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Blog Posts ({posts.length})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Blog Post</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><Label>Title</Label><Input name="title" required /></div>
              <div>
                <Label>Category</Label>
                <select name="category" className="w-full rounded-md border bg-background px-3 py-2 text-sm" required>
                  <option value="STEM Programs">STEM Programs</option>
                  <option value="Academic Profile">Academic Profile</option>
                  <option value="Olympiad Strategy">Olympiad Strategy</option>
                  <option value="Research">Research Opportunities</option>
                  <option value="Extracurriculars">Extracurriculars</option>
                  <option value="Certifications">Certifications</option>
                </select>
              </div>
              <div><Label>Excerpt</Label><Input name="excerpt" placeholder="Brief summary..." /></div>
              <div><Label>Content</Label><Textarea name="content" rows={8} required /></div>
              <Button type="submit" className="w-full">Publish Post</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <span className="font-medium text-foreground">{p.title}</span>
              <div className="flex gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                <Badge variant={p.published ? "default" : "outline"} className="text-xs">
                  {p.published ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-muted-foreground text-center py-8">No posts yet.</p>}
      </div>
    </div>
  );
}

function ScholarshipsTab() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchScholarships = async () => {
    const { data } = await supabase.from("scholarships").select("*").order("created_at", { ascending: false });
    setScholarships(data || []);
  };

  useEffect(() => { fetchScholarships(); }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const { error } = await supabase.from("scholarships").insert({
      name: form.get("name") as string,
      country: form.get("country") as string,
      eligibility: form.get("eligibility") as string,
      deadline: form.get("deadline") as string,
      coverage: form.get("coverage") as string,
      apply_link: form.get("apply_link") as string,
      category: form.get("category") as string,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Scholarship added!" });
      setOpen(false);
      fetchScholarships();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Scholarships ({scholarships.length})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Scholarship</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Scholarship</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div><Label>Scholarship Name</Label><Input name="name" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Country</Label><Input name="country" required /></div>
                <div><Label>Eligibility</Label><Input name="eligibility" placeholder="Grade 8+" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Deadline</Label><Input name="deadline" placeholder="March 2026" /></div>
                <div><Label>Coverage</Label><Input name="coverage" placeholder="Full Tuition" /></div>
              </div>
              <div>
                <Label>Category</Label>
                <select name="category" className="w-full rounded-md border bg-background px-3 py-2 text-sm" required>
                  <option value="National">National</option>
                  <option value="International">International</option>
                  <option value="STEM Only">STEM Only</option>
                  <option value="Fully Funded">Fully Funded</option>
                </select>
              </div>
              <div><Label>Apply Link</Label><Input name="apply_link" placeholder="https://..." /></div>
              <Button type="submit" className="w-full">Add Scholarship</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {scholarships.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <span className="font-medium text-foreground">{s.name}</span>
              <div className="flex gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">{s.country}</Badge>
                <Badge variant="outline" className="text-xs">{s.category}</Badge>
              </div>
            </div>
          </div>
        ))}
        {scholarships.length === 0 && <p className="text-muted-foreground text-center py-8">No scholarships yet.</p>}
      </div>
    </div>
  );
}
