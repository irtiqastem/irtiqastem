import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-navy text-navy-foreground">
      <div className="container-narrow px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <GraduationCap className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-bold">Irtiqa STEM</span>
            </div>
            <p className="text-sm text-navy-foreground/70">
              Explore. Excel. Evolve. — Empowering Pakistan's next generation of STEM leaders.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-accent">Preparation</h4>
            <ul className="space-y-2 text-sm text-navy-foreground/70">
              <li><Link to="/olympiad-tracks" className="hover:text-accent transition-colors">IMO Track</Link></li>
              <li><Link to="/olympiad-tracks" className="hover:text-accent transition-colors">IOI Track</Link></li>
              <li><Link to="/practice" className="hover:text-accent transition-colors">Practice Problems</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-accent">Resources</h4>
            <ul className="space-y-2 text-sm text-navy-foreground/70">
              <li><Link to="/stem-hub" className="hover:text-accent transition-colors">STEM Guidance Hub</Link></li>
              <li><Link to="/resources" className="hover:text-accent transition-colors">Learning Materials</Link></li>
              <li><Link to="/scholarships" className="hover:text-accent transition-colors">Scholarships</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-accent">Contact</h4>
            <ul className="space-y-2 text-sm text-navy-foreground/70">
              <li>info@irtiqastem.org</li>
              <li>Pakistan</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-navy-foreground/10 pt-6 text-center text-xs text-navy-foreground/50">
          © 2026 Irtiqa STEM. A non-profit initiative for STEM education in Pakistan.
        </div>
      </div>
    </footer>
  );
}
