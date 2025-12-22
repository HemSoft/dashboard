import { LandingPage } from "@/components/landing";
import { createClient } from "@/lib/supabase/server";
import { ExpendituresWidget } from "@/modules/expenditures";
import { PRWidget } from "@/modules/github-prs";
import { NewsWidget } from "@/modules/news";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your personal dashboard overview.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <PRWidget />
        <NewsWidget />
        <ExpendituresWidget />
      </div>
    </div>
  );
}
