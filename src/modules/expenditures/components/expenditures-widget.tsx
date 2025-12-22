import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, ExternalLink, Wallet } from "lucide-react";
import Link from "next/link";
import { getExpenditures, isCurrentUserAdmin } from "../actions";
import {
    calculateNextBillingDate,
    calculateTotalCost,
    formatBillingCycle,
    formatCurrency,
} from "../types";

export async function ExpendituresWidget() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return null;
  }

  const { sources, error } = await getExpenditures();

  const grandTotal = sources.reduce((sum, s) => sum + calculateTotalCost(s), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-start gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground mt-1" />
          <div>
            <CardTitle>Expenditures</CardTitle>
            <CardDescription className="text-xs">
              Subscriptions & consumption costs
            </CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/expenditures">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive mb-4">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {sources.length === 0 && !error ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              No expenditure sources configured
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/expenditures">Add Source</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sources.map((source) => {
              const total = calculateTotalCost(source);
              const nextBilling = calculateNextBillingDate(source);
              const formattedDate = nextBilling.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <div key={source.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{source.name}</span>
                      {source.detailsUrl && (
                        <a
                          href={source.detailsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Base: {formatCurrency(source.baseCost)}
                      {formatBillingCycle(source.billingCycle)}
                      {source.consumptionCost > 0 && (
                        <span>
                          {" "}
                          · Consumption: {formatCurrency(source.consumptionCost)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatCurrency(total)}</div>
                    <div className="text-xs text-muted-foreground">
                      Next: {formattedDate}
                    </div>
                  </div>
                </div>
              );
            })}

            {sources.length > 0 && (
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
