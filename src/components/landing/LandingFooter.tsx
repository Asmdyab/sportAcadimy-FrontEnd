import { Link } from "react-router-dom";
import { Trophy, Mail, Phone, MapPin, ArrowUp } from "lucide-react";

const quickLinks = [
  { label: "About Us", href: "#about" },
  { label: "Our Sports", href: "#sports" },
  { label: "Features", href: "#features" },
  { label: "Branches", href: "#branches" },
];

const sportsLinks = [
  { label: "Football", href: "#sports" },
  { label: "Basketball", href: "#sports" },
  { label: "Swimming", href: "#sports" },
  { label: "Tennis", href: "#sports" },
  { label: "Martial Arts", href: "#sports" },
  { label: "Athletics", href: "#sports" },
];

export default function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="bg-foreground/[0.02] border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-gradient">AURA</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering athletes of all ages with world-class coaching and
              modern facilities since 2016.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h4 className="font-semibold mb-4">Sports</h4>
            <ul className="space-y-2">
              {sportsLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:info@auraacademy.com" className="hover:text-foreground transition-colors">
                  info@auraacademy.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+96522001000" className="hover:text-foreground transition-colors">
                  +965 2200 1000
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Sports City, Kuwait</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AURA Sport Academy. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to top
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
