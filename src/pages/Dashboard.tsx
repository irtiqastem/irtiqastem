import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Target, ArrowRight, Loader2, Star } from "lucide-react";

interface Submission {
  id: number;
  problem_id: number;
  status: string;
  created_at: string;
}

interface Achievement {
  title: string;
  icon: string;
  earned_at: string;
}

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [{ data: subs }, { data: achv }] = await Promise.all([
        supabase
          .from("submissions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("user_achievements")
          .select("earned_at, achievements(title, icon)")
          .eq("user_id", user.id),
      ]);
      setSubmissions(subs ?? []);
      setAchievements(
        (achv ?? []).map((a: any) => ({ ...a.achievements, earned_at: a.earned_at }))
      );
      setDataLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const solved = submissions.filter((s) => s.status === "correct").length;
  const attempted = submissions.length;
  const displayName = profile?.full_name || user.email?.split("@")[0] || "Student";

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

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: "Problems Attempted", value: attempted },
          { icon: Target, label: "Problems Solved", value: solved },
          { icon: Trophy, label: "Achievements", value: achievements.length },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
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
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" /> Achievements
            </CardTitle>
            <CardDescription>Badges you have earned</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No achievements yet. Start solving problems!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {achievements.map((a) => (
                  <div
                    key={a.title}
                    className="flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-sm"
                  >
                    <span>{a.icon}</span> {a.title}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump back into your learning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Practice Problems", href: "/practice", desc: "Solve today's problems" },
              { label: "Olympiad Tracks", href: "/olympiad-tracks", desc: "Follow your roadmap" },
              { label: "Browse Resources", href: "/resources", desc: "Find study materials" },
              { label: "Scholarships", href: "/scholarships", desc: "Find funding opportunities" },
            ].map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                className="h-auto w-full justify-between px-3 py-2.5"
                asChild
              >
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
