"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const chartLoading = <Skeleton className="h-[320px] w-full rounded-lg" />;

const LoanReductionChart = dynamic(() => import("./loan-reduction-chart"), {
  ssr: false,
  loading: () => chartLoading,
});
const PrincipalInterestChart = dynamic(() => import("./principal-interest-chart"), {
  ssr: false,
  loading: () => chartLoading,
});
const PrincipalInterestPie = dynamic(() => import("./principal-interest-pie"), {
  ssr: false,
  loading: () => chartLoading,
});
const YearlyBreakdownChart = dynamic(() => import("./yearly-breakdown-chart"), {
  ssr: false,
  loading: () => chartLoading,
});

export function ChartsSection() {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Visual Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reduction">
          <TabsList className="flex-wrap">
            <TabsTrigger value="reduction">Loan Reduction</TabsTrigger>
            <TabsTrigger value="stacked">Principal vs Interest</TabsTrigger>
            <TabsTrigger value="pie">Total Split</TabsTrigger>
            <TabsTrigger value="yearly">Year-wise</TabsTrigger>
          </TabsList>
          <TabsContent value="reduction" className="pt-4">
            <LoanReductionChart />
          </TabsContent>
          <TabsContent value="stacked" className="pt-4">
            <PrincipalInterestChart />
          </TabsContent>
          <TabsContent value="pie" className="pt-4">
            <PrincipalInterestPie />
          </TabsContent>
          <TabsContent value="yearly" className="pt-4">
            <YearlyBreakdownChart />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
