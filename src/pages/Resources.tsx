import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, Loader2, ExternalLink } from "lucide-react";

interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  subject: string;
  file_url: string;
  file_type: string;
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<"Mathematics" | "Informatics">("Mathematics");

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });

      if (!error) setResources(data ?? []);
      setLoading(false);
    };
    fetchResources();
  }, []);

  const filtered = resources.filter((r) => r.subject === activeSubject);

  // Group by category
  const grouped = filtered.reduce((acc, resource) => {
    const cat = resource.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="container-narrow px-4 py-12">
      <div className="mb-10">
        <h1 className="mb-2 text-4xl font-bold">Learning Resources</h1>
        <p className="text-muted-foreground">
          Handpicked books and materials for every level of Olympiad preparation.
        </p>
      </div>

      {/* Subject tabs */}
      <div className="mb-8 flex gap-2">
        {(["Mathematics", "Informatics"] as const).map((subject) => (
          <button
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              activeSubject === subject
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No resources available yet for {activeSubject}.
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{category}</h2>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((resource) => (
                  <Card key={resource.id} className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base leading-snug">
                            {resource.title}
                          </CardTitle>
                          {resource.description && (
                            <CardDescription className="mt-1 text-xs">
                              {resource.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {resource.file_url ? (
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                        >
                          <Download className="h-4 w-4" />
                          Download / View
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No file available
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
