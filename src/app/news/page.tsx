import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchNews, NewsItemComponent } from "@/modules/news";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default async function NewsPage() {
  const { items, errors } = await fetchNews();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">News</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest from your sources.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Some feeds failed to load</AlertTitle>
          <AlertDescription>
            {errors.map((e) => e.source).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {items.map((item) => (
          <NewsItemComponent key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No news items available</p>
          </div>
        )}
      </div>
    </div>
  );
}
