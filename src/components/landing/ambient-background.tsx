export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div className={"pointer-events-none absolute inset-0 -z-10 overflow-hidden " + (className ?? "")}>
      <div className="absolute inset-0 grid-mask" />
      <div className="animate-aurora absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
      <div className="animate-float-slow absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-[100px]" />
      <div className="animate-float absolute right-[-4rem] bottom-0 h-96 w-96 rounded-full bg-accent-2/15 blur-[110px]" />
      <div className="noise-overlay" />
    </div>
  );
}
