import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

type Post = {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  published: boolean;
  created_at: string;
};

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("published", true).order("created_at", { ascending: false }).then(({ data }) => {
      setPosts(data ?? []);
      setLoading(false);
    });
    supabase.from("page_visits").insert([{ page: "/blog" }]).then(() => {});
  }, []);

  return (
    <>
      <section className="hero-gradient py-16 md:py-20">
        <div className="container-narrow px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 text-3xl font-bold text-primary-foreground md:text-5xl">Blog & Updates</h1>
            <p className="max-w-2xl text-primary-foreground/80 text-lg">News, tips, and insights from the Irtiqa STEM team.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow px-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No posts yet. Check back soon!</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex flex-col rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-3 flex items-center justify-between">
                    {post.category && <Badge variant="secondary" className="text-xs">{post.category}</Badge>}
                  </div>
                  <h2 className="mb-2 text-lg font-bold leading-snug">{post.title}</h2>
                  <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">{post.excerpt || post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t">
                    {post.author && <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
