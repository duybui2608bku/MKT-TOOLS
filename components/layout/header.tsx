interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/60 backdrop-blur-xl px-6">
      <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-sm">
          AD
        </div>
      </div>
    </header>
  );
}
