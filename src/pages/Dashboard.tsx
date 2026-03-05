import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, Target, CheckCircle2, Award, Calendar, BookOpen, Code2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Stats = {
  submitted: number;
  accepted: number;
  pending: number;
};

const badges = [
  { name: "Bronze Solver", icon: "🥉", threshold: 10 },
  { name: "Silver Solver", icon: "🥈", threshold: 25 },
  { name: "Gold Solver", icon: "🥇", threshold: 50 },
];

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ submitted: 0, accepted: 0, pending: 0 });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data } = await supabase
        .from("submissions")
        .select("status")
        .eq("user_id", user.id);

      if (data) {
        setStats({
          submitted: data.length,
          accepted: data.filter((s: any) => s.status === "accepted").length,
          pending: data.filter((s: any) => s.status === "pending").length,
        });
      }
    };
    fetchStats();
  }, [user]);

  if (loading || !user) return null;

  const earnedBadges = badges.filter((b) => stats.accepted >= b.threshold);
  const nextBadge = badges.find((b) => stats.accepted < b.threshold);

  return (
    <>
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
              {(profile?.full_name || user.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground md:text-3xl">
                {profile?.full_name || "Student"}
              </h1>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile?.track && (
                  <Badge className="bg-accent/20 text-accent border-0">
                    {profile.track === "Both" ? "IMO & IOI" : `${profile.track} Track`}
                  </Badge>
                )}
                {profile?.grade && (
                  <Badge variant="secondary">Grade {profile.grade}</Badge>
                )}
                <span className="text-sm text-primary-foreground/60">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { label: "Problems Submitted", value: stats.submitted, icon: Target, color: "text-primary" },
              { label: "Accepted", value: stats.accepted, icon: CheckCircle2, color: "text-success" },
              { label: "Pending Review", value: stats.pending, icon: Calendar, color: "text-accent" },
              { label: "Badges Earned", value: earnedBadges.length, icon: Award, color: "text-gold" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-accent" /> Badges & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {badges.map((badge) => {
                    const earned = stats.accepted >= badge.threshold;
                    return (
                      <div key={badge.name} className="flex items-center gap-3">
                        <span className={`text-2xl ${earned ? "" : "grayscale opacity-40"}`}>{badge.icon}</span>
                        <div className="flex-1">
                          <div className={`font-medium ${earned ? "text-foreground" : "text-muted-foreground"}`}>
                            {badge.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {earned ? "Earned!" : `${badge.threshold - stats.accepted} more to go`}
                          </div>
                        </div>
                        {earned && <CheckCircle2 className="h-4 w-4 text-success" />}
                      </div>
                    );
                  })}
                </div>

                {nextBadge && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress to {nextBadge.name}</span>
                      <span>{stats.accepted}/{nextBadge.threshold}</span>
                    </div>
                    <Progress value={(stats.accepted / nextBadge.threshold) * 100} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate("/practice")}
                >
                  <Target className="h-4 w-4 text-primary" /> Solve Practice Problems
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate("/olympiad-tracks")}
                >
                  <BookOpen className="h-4 w-4 text-accent" /> View Olympiad Tracks
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate("/resources")}
                >
                  <Code2 className="h-4 w-4 text-success" /> Learning Resources
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate("/scholarships")}
                >
                  <Award className="h-4 w-4 text-gold" /> Explore Scholarships
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
