import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Target, ArrowRight, Loader2, Star, CheckCircle, Clock, XCircle } from "lucide-react";

interface Submission {
  id: number;
  problem_id: number;
  status: string;
  points: number;
  answer: string;
  admin_feedback: string;
  submitted_at: string;
  problems?: { title: string };
}

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: subs } = await supabase
        .from("submissions")
        .select("*, problems(title)")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });
      setSubmissions(subs ?? []);
      setDataLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  const correct = submissions.filter(s => s.status === "correct").length;
  const pending = submissions.filter(s => s.status === "pending").length;
  const totalPoints = submissions.reduce((sum, s) => sum + (s.points || 0), 0);
  const displayName = profile?.full_name || user.email?.split("@")[0] || "Student";

  const statusIcon = (status: string) => {
    if (status === "correct") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "wrong") return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="container-narrow px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {displayName} 👋</h1>
        <p className="text-muted-foreground">{user.email}</p>
        {profile?.grade && (
          <Badge variant="secondary" className="mt-2">
            {profile.grade}{profile.school ? ` · ${profile.school}` : ""}
          </Badge>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { icon: BookOpen, label: "Total Submitted", value: submissions.length, color: "text-blue-600" },
          { icon: CheckCircle, label: "Correct", value: correct, color: "text-green-600" },
          { icon: Clock, label: "Pending Review", value: pending, color: "text-yellow-600" },
          { icon: Trophy, label: "Total Points", value: totalPoints, color: "text-amber-500" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Recent Submissions
            </CardTitle>
            <CardDescription>Your latest problem attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <div className="space-y-2">
                {submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet. Start practicing!</p>}
                {submissions.slice(0, 6).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      {statusIcon(sub.status)}
                      <div>
                        <p className="text-sm font-medium">{sub.problems?.title || `Problem #${sub.problem_id}`}</p>
                        {sub.admin_feedback && <p className="text-xs text-muted-foreground">{sub.admin_feedback}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.points > 0 && <Badge className="bg-green-100 text-green-700 text-xs">+{sub.points} pts</Badge>}
                      <Badge variant="secondary" className="text-xs capitalize">{sub.status}</Badge>
                    </div>
                  </div>
                ))}
                {submissions.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                    <Link to="/practice">Practice more problems <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" /> Quick Actions
            </CardTitle>
            <CardDescription>Jump back into your learning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Practice Problems", href: "/practice", desc: "Solve and submit answers" },
              { label: "Olympiad Tracks", href: "/olympiad-tracks", desc: "Follow your roadmap" },
              { label: "Browse Resources", href: "/resources", desc: "Find study materials" },
              { label: "Scholarships", href: "/scholarships", desc: "Find funding opportunities" },
            ].map((link) => (
              <Button key={link.href} variant="ghost" className="h-auto w-full justify-between px-3 py-2.5" asChild>
                <Link to={link.href}>
                  <div className="text-left">
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
