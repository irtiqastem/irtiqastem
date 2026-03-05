import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export default function StemHub() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setPosts(data || []);
    };
    fetchPosts();
  }, []);

  const categories = ["all", ...new Set(posts.map((p) => p.category))];
  const filtered = category === "all" ? posts : posts.filter((p) => p.category === category);

  if (selectedPost) {
    return (
      <>
        <section className="hero-gradient py-12 md:py-16">
          <div className="container-narrow px-4">
            <button onClick={() => setSelectedPost(null)} className="text-sm text-primary-foreground/70 hover:text-primary-foreground mb-2 inline-block">
              ← Back to articles
            </button>
            <h1 className="text-2xl font-bold text-primary-foreground md:text-4xl">{selectedPost.title}</h1>
            <Badge className="mt-2 bg-accent/20 text-accent border-0">{selectedPost.category}</Badge>
          </div>
        </section>
        <section className="section-padding">
          <div className="container-narrow max-w-3xl">
            <div className="prose prose-lg text-foreground whitespace-pre-wrap">{selectedPost.content}</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 text-3xl font-bold text-primary-foreground md:text-5xl">
              STEM Guidance Hub
            </h1>
            <p className="max-w-2xl text-primary-foreground/80 text-lg">
              Expert guidance on STEM programs, Olympiad strategies, research opportunities, and building a strong academic profile.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No articles published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="card-hover block w-full text-left rounded-xl border bg-card p-6"
                  >
                    <Badge variant="secondary" className="mb-3 text-xs">{post.category}</Badge>
                    <h3 className="font-semibold text-foreground mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt || post.content.slice(0, 120) + "..."}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read more <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
