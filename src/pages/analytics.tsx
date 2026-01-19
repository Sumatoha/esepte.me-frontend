import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { CategoryBreakdown, MonthlyData, Transaction } from "@/types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount);
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear];

type Period = "month" | "quarter" | "year";

export default function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [period, setPeriod] = useState<Period>("month");

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<MonthlyData[]>({
    queryKey: ["/api/dashboard/monthly", selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/monthly?year=${selectedYear}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const { data: categoryBreakdown, isLoading: categoryLoading } = useQuery<{
    income: CategoryBreakdown[];
    expense: CategoryBreakdown[];
  }>({
    queryKey: ["/api/analytics/categories", selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/categories?year=${selectedYear}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Calculate summary statistics
  const totalIncome = monthlyData?.reduce((sum, m) => sum + m.income, 0) ?? 0;
  const totalExpenses = monthlyData?.reduce((sum, m) => sum + m.expenses, 0) ?? 0;
  const avgMonthlyIncome = monthlyData?.length ? totalIncome / monthlyData.length : 0;
  const avgMonthlyExpenses = monthlyData?.length ? totalExpenses / monthlyData.length : 0;

  // Calculate month-over-month change
  const lastMonth = monthlyData?.[monthlyData.length - 1];
  const prevMonth = monthlyData?.[monthlyData.length - 2];
  const incomeChange = prevMonth && lastMonth
    ? ((lastMonth.income - prevMonth.income) / prevMonth.income) * 100
    : 0;
  const expenseChange = prevMonth && lastMonth
    ? ((lastMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100
    : 0;

  // Prepare comparison data for bar chart
  const comparisonData = monthlyData?.map((m) => ({
    ...m,
    profit: m.income - m.expenses,
  })) ?? [];

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Аналитика</h1>
          <p className="text-sm text-muted-foreground">
            Детальный анализ финансовых показателей
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[120px] sm:w-[140px]" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">По месяцам</SelectItem>
              <SelectItem value="quarter">По кварталам</SelectItem>
              <SelectItem value="year">По годам</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-[80px] sm:w-[100px]" data-testid="select-analytics-year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Средний доход/мес</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 truncate">{formatCurrency(avgMonthlyIncome)}</p>
                {incomeChange !== 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {incomeChange > 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-chart-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-chart-5" />
                    )}
                    <span className={`text-xs font-medium ${incomeChange > 0 ? "text-chart-1" : "text-chart-5"}`}>
                      {Math.abs(incomeChange).toFixed(1)}% vs прош. месяц
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-chart-1/10 shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Средние расходы/мес</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 truncate">{formatCurrency(avgMonthlyExpenses)}</p>
                {expenseChange !== 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {expenseChange < 0 ? (
                      <ArrowDownRight className="h-4 w-4 text-chart-1" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-chart-5" />
                    )}
                    <span className={`text-xs font-medium ${expenseChange < 0 ? "text-chart-1" : "text-chart-5"}`}>
                      {Math.abs(expenseChange).toFixed(1)}% vs прош. месяц
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-chart-5/10 shrink-0">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-chart-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Рентабельность</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
                  {totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Прибыль / Доход
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-chart-4/10 shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Всего транзакций</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">{transactions?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  За выбранный период
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-chart-2/10 shrink-0">
                <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Доходы vs Расходы</CardTitle>
            <CardDescription>Сравнение по месяцам</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : comparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Доходы"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Расходы"
                    fill="hsl(var(--chart-5))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Нет данных для отображения</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Динамика прибыли</CardTitle>
            <CardDescription>Тренд чистой прибыли по месяцам</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : comparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Прибыль"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Нет данных для отображения</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Доходы по категориям</CardTitle>
            <CardDescription>Распределение источников дохода</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : categoryBreakdown?.income && categoryBreakdown.income.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown.income}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="amount"
                      nameKey="categoryName"
                    >
                      {categoryBreakdown.income.map((entry, index) => (
                        <Cell
                          key={entry.categoryId}
                          fill={entry.categoryColor || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {categoryBreakdown.income.map((cat, index) => (
                    <div key={cat.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.categoryColor || COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{cat.categoryName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{formatCurrency(cat.amount)}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {cat.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <PieChartIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Нет данных о доходах</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Расходы по категориям</CardTitle>
            <CardDescription>Распределение статей расходов</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : categoryBreakdown?.expense && categoryBreakdown.expense.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown.expense}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="amount"
                      nameKey="categoryName"
                    >
                      {categoryBreakdown.expense.map((entry, index) => (
                        <Cell
                          key={entry.categoryId}
                          fill={entry.categoryColor || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {categoryBreakdown.expense.map((cat, index) => (
                    <div key={cat.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.categoryColor || COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{cat.categoryName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{formatCurrency(cat.amount)}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {cat.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <PieChartIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Нет данных о расходах</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
