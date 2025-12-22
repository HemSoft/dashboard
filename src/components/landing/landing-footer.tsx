import { APP_NAME } from "@/lib/version";
import Link from "next/link";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{APP_NAME}</span>
            <span className="text-muted-foreground">
              © {currentYear}
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="transition-colors hover:text-foreground"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
