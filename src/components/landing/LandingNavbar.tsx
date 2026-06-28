import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Trophy, Sun, Moon, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Sports", href: "#sports" },
  { label: "Features", href: "#features" },
  { label: "Branches", href: "#branches" },
  { label: "Contact", href: "#contact" },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-athletic-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-athletic-sm group-hover:shadow-athletic-md transition-all">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-gradient">AURA</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button variant="hero" size="sm" onClick={() => navigate("/register")}>
              Get Started
            </Button>
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent text-left transition-colors"
              >
                {link.label}
              </button>
            ))}
            <hr className="my-2 border-border" />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => { setMobileOpen(false); navigate("/login"); }}
            >
              Sign In
            </Button>
            <Button
              variant="hero"
              className="w-full justify-start"
              onClick={() => { setMobileOpen(false); navigate("/register"); }}
            >
              Get Started
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
