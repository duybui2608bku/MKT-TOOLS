interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-14 items-center border-b border-border bg-card px-6">
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
    </header>
  );
}
