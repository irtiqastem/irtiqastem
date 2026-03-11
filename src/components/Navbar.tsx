import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.webp";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Olympiad Tracks", path: "/olympiad-tracks" },
  { label: "STEM Hub", path: "/stem-hub" },
  { label: "Practice", path: "/practice" },
  { label: "Resources", path: "/resources" },
  { label: "Scholarships", path: "/scholarships" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg" role="navigation" aria-label="Main navigation">
      <div className="container-narrow flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Irtiqa STEM Home">
          <img src={logo} alt="Irtiqa STEM logo" className="h-12 w-12 rounded-full object-cover border-2 border-primary/20" />
          <span className="text-lg font-bold text-foreground">Irtiqa<span className="text-accent">STEM</span></span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${location.pathname === link.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/admin")} aria-label="Admin Panel">
                  <Shield className="h-4 w-4" /> Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/dashboard")} aria-label="Dashboard">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="gap-1" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <Button size="sm" className="gold-gradient border-0 font-semibold text-navy" onClick={() => navigate("/auth")}>Join Now</Button>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === link.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="mt-2 space-y-1">
              {isAdmin && (
                <Button variant="ghost" size="sm" className="w-full justify-start gap-1" onClick={() => { navigate("/admin"); setMobileOpen(false); }}>
                  <Shield className="h-4 w-4" /> Admin Panel
                </Button>
              )}
              <Button variant="ghost" size="sm" className="w-full justify-start gap-1" onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-1 text-destructive" onClick={signOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          ) : (
            <Button size="sm" className="gold-gradient mt-2 w-full border-0 font-semibold text-navy" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Join Now</Button>
          )}
        </div>
      )}
    </nav>
  );
}
