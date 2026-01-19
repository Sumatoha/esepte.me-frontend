import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calculator,
} from "lucide-react";
import type { TaxDeadline } from "@/types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDaysUntil(dateStr: string): number {
  const dueDate = new Date(dateStr);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const currentYear = new Date().getFullYear();

export default function RemindersPage() {
  const { toast } = useToast();

  const { data: deadlines, isLoading } = useQuery<TaxDeadline[]>({
    queryKey: ["/api/deadlines"],
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ id, isPaid }: { id: string; isPaid: boolean }) => {
      return apiRequest("PATCH", `/api/deadlines/${id}`, { isPaid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deadlines"] });
      toast({
        title: "Обновлено",
        description: "Статус платежа изменён",
      });
    },
  });

  const upcomingDeadlines = deadlines
    ?.filter((d) => !d.isPaid && d.year >= currentYear)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) ?? [];

  const paidDeadlines = deadlines
    ?.filter((d) => d.isPaid && d.year >= currentYear - 1)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()) ?? [];

  const overdueDeadlines = upcomingDeadlines.filter(
    (d) => new Date(d.dueDate) < new Date()
  );

  const urgentDeadlines = upcomingDeadlines.filter((d) => {
    const daysUntil = getDaysUntil(d.dueDate);
    return daysUntil > 0 && daysUntil <= 7;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Напоминания</h1>
        <p className="text-muted-foreground">
          Управление налоговыми сроками и напоминаниями
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Предстоящие</p>
                <p className="text-3xl font-bold mt-1">{upcomingDeadlines.length}</p>
                <p className="text-xs text-muted-foreground mt-1">платежей</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-4/10">
                <Calendar className="h-5 w-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {overdueDeadlines.length > 0 && (
          <Card className="border-destructive/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-destructive">Просрочено</p>
                  <p className="text-3xl font-bold mt-1 text-destructive">
                    {overdueDeadlines.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">требуют внимания</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {urgentDeadlines.length > 0 && (
          <Card className="border-chart-3/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-chart-3">Срочные</p>
                  <p className="text-3xl font-bold mt-1">{urgentDeadlines.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">в течение 7 дней</p>
                </div>
                <div className="p-3 rounded-lg bg-chart-3/10">
                  <Clock className="h-5 w-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Оплачено</p>
                <p className="text-3xl font-bold mt-1 text-chart-1">{paidDeadlines.length}</p>
                <p className="text-xs text-muted-foreground mt-1">за последний год</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-1/10">
                <CheckCircle className="h-5 w-5 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Предстоящие платежи</CardTitle>
              <CardDescription>Налоговые сроки и авансовые платежи</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : upcomingDeadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-16 w-16 text-chart-1/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">Все оплачено!</h3>
              <p className="text-muted-foreground max-w-sm">
                У вас нет предстоящих налоговых платежей. Отличная работа!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => {
                const daysUntil = getDaysUntil(deadline.dueDate);
                const isOverdue = daysUntil < 0;
                const isUrgent = daysUntil >= 0 && daysUntil <= 7;

                return (
                  <div
                    key={deadline.id}
                    className={`p-4 rounded-lg border ${
                      isOverdue
                        ? "border-destructive/50 bg-destructive/5"
                        : isUrgent
                          ? "border-chart-3/50 bg-chart-3/5"
                          : "bg-muted/50"
                    }`}
                    data-testid={`reminder-${deadline.id}`}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            isOverdue
                              ? "bg-destructive/10"
                              : isUrgent
                                ? "bg-chart-3/10"
                                : "bg-chart-2/10"
                          }`}
                        >
                          <Calculator
                            className={`h-5 w-5 ${
                              isOverdue
                                ? "text-destructive"
                                : isUrgent
                                  ? "text-chart-3"
                                  : "text-chart-2"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              Q{deadline.quarter} {deadline.year}
                            </h4>
                            {isOverdue ? (
                              <Badge variant="destructive">Просрочено</Badge>
                            ) : isUrgent ? (
                              <Badge className="bg-chart-3 text-white">
                                {daysUntil === 0 ? "Сегодня" : `${daysUntil} дн.`}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">{daysUntil} дней</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            До {formatDate(deadline.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            {deadline.amount
                              ? formatCurrency(Number(deadline.amount))
                              : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">к оплате</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={deadline.isPaid ?? false}
                            onCheckedChange={(checked) =>
                              markPaidMutation.mutate({ id: deadline.id, isPaid: checked })
                            }
                            data-testid={`switch-paid-${deadline.id}`}
                          />
                          <span className="text-sm text-muted-foreground">Оплачено</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paid Deadlines History */}
      {paidDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-chart-1" />
              <div>
                <CardTitle>История платежей</CardTitle>
                <CardDescription>Оплаченные налоговые платежи</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paidDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-chart-1/5 border border-chart-1/20"
                  data-testid={`paid-${deadline.id}`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-chart-1" />
                    <div>
                      <p className="font-medium">
                        Q{deadline.quarter} {deadline.year}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(deadline.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">
                      {deadline.amount ? formatCurrency(Number(deadline.amount)) : "—"}
                    </span>
                    <Switch
                      checked={deadline.isPaid ?? false}
                      onCheckedChange={(checked) =>
                        markPaidMutation.mutate({ id: deadline.id, isPaid: checked })
                      }
                      data-testid={`switch-unpaid-${deadline.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
