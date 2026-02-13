const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              Spin <span className="text-gradient">Story</span>
            </span>
          </div>

          <div className="flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2026 The Spin Story. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
