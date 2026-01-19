import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { DashboardStats, MonthlyData, DailyData, TaxDeadline, Transaction } from "@/types";

function formatCurrency(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1000000) {
    return `${(amount / 1000000).toFixed(1)} млн ₸`;
  }
  if (compact && Math.abs(amount) >= 100000) {
    return `${(amount / 1000).toFixed(0)} тыс ₸`;
  }
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " ₸";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendValue,
  variant = "default" 
}: {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  variant?: "default" | "income" | "expense" | "tax";
}) {
  const iconColors = {
    default: "text-primary",
    income: "text-chart-1",
    expense: "text-chart-5",
    tax: "text-chart-2",
  };

  const bgColors = {
    default: "bg-primary/10",
    income: "bg-chart-1/10",
    expense: "bg-chart-5/10",
    tax: "bg-chart-2/10",
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
            <h3 className="text-base sm:text-lg md:text-xl font-bold mt-1 break-words">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-chart-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-chart-5" />
                )}
                <span className={`text-xs font-medium ${trend === "up" ? "text-chart-1" : "text-chart-5"}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${bgColors[variant]}`}>
            <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Нет транзакций</p>
        <p className="text-xs text-muted-foreground mt-1">
          Добавьте первую транзакцию или загрузите выписку
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.slice(0, 5).map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          data-testid={`transaction-item-${tx.id}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${tx.type === "income" ? "bg-chart-1/10" : "bg-chart-5/10"}`}>
              {tx.type === "income" ? (
                <TrendingUp className="h-4 w-4 text-chart-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-chart-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
            </div>
          </div>
          <span className={`font-semibold ${tx.type === "income" ? "text-chart-1" : "text-chart-5"}`}>
            {tx.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(Number(tx.amount)))}
          </span>
        </div>
      ))}
    </div>
  );
}

function TaxDeadlines({ deadlines }: { deadlines: TaxDeadline[] }) {
  const upcomingDeadlines = deadlines
    .filter((d) => !d.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  if (upcomingDeadlines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Нет предстоящих платежей</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingDeadlines.map((deadline) => {
        const dueDate = new Date(deadline.dueDate);
        const isUrgent = dueDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

        return (
          <div
            key={deadline.id}
            className={`flex items-center justify-between p-3 rounded-lg ${isUrgent ? "bg-destructive/10" : "bg-muted/50"}`}
            data-testid={`deadline-item-${deadline.id}`}
          >
            <div className="flex items-center gap-3">
              {isUrgent && <AlertCircle className="h-4 w-4 text-destructive" />}
              <div>
                <p className="text-sm font-medium">Q{deadline.quarter} {deadline.year}</p>
                <p className="text-xs text-muted-foreground">
                  До {formatDate(deadline.dueDate)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-semibold">
                {deadline.amount ? formatCurrency(Number(deadline.amount)) : "—"}
              </span>
              {isUrgent && (
                <Badge variant="destructive" className="ml-2 text-xs">Скоро</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { t, language } = useI18n();
  const [chartView, setChartView] = useState<"monthly" | "daily">("monthly");
  
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<MonthlyData[]>({
    queryKey: ["/api/dashboard/monthly"],
  });

  const { data: dailyData, isLoading: dailyLoading } = useQuery<DailyData[]>({
    queryKey: ["/api/dashboard/daily?range=30"],
    enabled: chartView === "daily",
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: deadlines, isLoading: deadlinesLoading } = useQuery<TaxDeadline[]>({
    queryKey: ["/api/deadlines"],
  });

  const chartLoading = chartView === "monthly" ? monthlyLoading : dailyLoading;
  const chartData = chartView === "monthly" ? monthlyData : dailyData;
  const chartDataKey = chartView === "monthly" ? "month" : "label";
  const isLoading = statsLoading || monthlyLoading;
  
  const pageTitle = language === "kk" ? "Басқару тақтасы" : "Дашборд";
  const pageDesc = language === "kk" ? "Қаржылық белсенділігіңізге шолу" : "Обзор вашей финансовой активности";
  const txLabel = language === "kk" ? "транзакция" : "транзакций";
  const yearEstimate = language === "kk" ? "Жылға болжам" : "Оценка за год";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageDesc}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title={t("dashboard.totalIncome")}
              value={formatCurrency(stats?.totalIncome ?? 0, true)}
              icon={TrendingUp}
              variant="income"
              trend="up"
              trendValue={t("dashboard.thisYear")}
            />
            <StatCard
              title={t("dashboard.totalExpenses")}
              value={formatCurrency(stats?.totalExpenses ?? 0, true)}
              icon={TrendingDown}
              variant="expense"
              trend="down"
              trendValue={t("dashboard.thisYear")}
            />
            <StatCard
              title={t("dashboard.netProfit")}
              value={formatCurrency(stats?.netProfit ?? 0, true)}
              icon={Wallet}
              description={`${stats?.transactionCount ?? 0} ${txLabel}`}
            />
            <StatCard
              title={t("dashboard.estimatedTax")}
              value={formatCurrency(stats?.estimatedTax ?? 0, true)}
              icon={Calculator}
              variant="tax"
              description={yearEstimate}
            />
          </>
        )}
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income/Expense Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
            <div>
              <CardTitle>Доходы и расходы</CardTitle>
              <CardDescription>
                {chartView === "monthly" 
                  ? (language === "kk" ? "Айлар бойынша динамика" : "Динамика по месяцам")
                  : (language === "kk" ? "Соңғы 30 күн" : "Последние 30 дней")}
              </CardDescription>
            </div>
            <Tabs value={chartView} onValueChange={(v) => setChartView(v as "monthly" | "daily")}>
              <TabsList className="h-8" data-testid="chart-view-toggle">
                <TabsTrigger value="monthly" className="text-xs px-3" data-testid="toggle-monthly">
                  {language === "kk" ? "Айлар" : "Месяцы"}
                </TabsTrigger>
                <TabsTrigger value="daily" className="text-xs px-3" data-testid="toggle-daily">
                  {language === "kk" ? "Күндер" : "Дни"}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey={chartDataKey} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    interval={chartView === "daily" ? 4 : 0}
                    angle={chartView === "daily" ? -45 : 0}
                    textAnchor={chartView === "daily" ? "end" : "middle"}
                    height={chartView === "daily" ? 50 : 30}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    labelFormatter={(label) => chartView === "daily" ? label : label}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(var(--chart-1))"
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                    name={language === "kk" ? "Кіріс" : "Доходы"}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--chart-5))"
                    fill="url(#expenseGradient)"
                    strokeWidth={2}
                    name={language === "kk" ? "Шығыс" : "Расходы"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <BarChart className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Нет данных для отображения</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Добавьте транзакции, чтобы увидеть статистику
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Налоговые сроки</CardTitle>
            <CardDescription>Предстоящие платежи</CardDescription>
          </CardHeader>
          <CardContent>
            {deadlinesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <TaxDeadlines deadlines={deadlines ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Последние транзакции</CardTitle>
          <CardDescription>Недавняя финансовая активность</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <RecentTransactions transactions={transactions ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
