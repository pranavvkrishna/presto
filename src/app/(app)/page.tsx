import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Presto</h1>
      <p className="text-muted-foreground">
        UCI campus rentals — rent what you need from other students, and find what UCI lends for free.
      </p>
      <p className="text-sm text-muted-foreground">Coming soon. M0 setup complete.</p>
      <Button type="button">Get started</Button>
    </main>
  );
}
