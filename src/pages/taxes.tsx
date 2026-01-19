import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Info,
} from "lucide-react";
import type { TaxCalculation, TaxSettings, TaxDeadline } from "@/types";

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

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];

export default function TaxesPage() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { toast } = useToast();

  const { data: settings } = useQuery<TaxSettings>({
    queryKey: ["/api/settings/tax"],
  });

  const { data: calculation, isLoading: calcLoading } = useQuery<TaxCalculation>({
    queryKey: ["/api/taxes/calculate", selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/taxes/calculate?year=${selectedYear}`);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const { data: deadlines } = useQuery<TaxDeadline[]>({
    queryKey: ["/api/deadlines"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (taxSystem: string) => {
      return apiRequest("PUT", "/api/settings/tax", { taxSystem, year: selectedYear });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/tax"] });
      queryClient.invalidateQueries({ queryKey: ["/api/taxes/calculate", selectedYear] });
      toast({
        title: "Настройки обновлены",
        description: "Система налогообложения изменена",
      });
    },
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

  const yearDeadlines = deadlines?.filter((d) => d.year === selectedYear) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Налоговый калькулятор</h1>
          <p className="text-muted-foreground">
            Расчёт налогов и управление платежами
          </p>
        </div>
        <Select
          value={selectedYear.toString()}
          onValueChange={(v) => setSelectedYear(parseInt(v))}
        >
          <SelectTrigger className="w-[120px]" data-testid="select-year">
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

      {/* Tax System Selection - Kazakhstan 2026 */}
      <Card>
        <CardHeader>
          <CardTitle>Специальный налоговый режим</CardTitle>
          <CardDescription>
            Налоговый кодекс РК 2026 года · МРП = 4 325 ₸
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Упрощённая декларация */}
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                settings?.taxSystem === "simplified_4"
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50 hover:border-muted-foreground/25"
              }`}
              onClick={() => updateSettingsMutation.mutate("simplified_4")}
              data-testid="option-simplified"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm sm:text-base">Упрощёнка</h4>
                <Badge variant={settings?.taxSystem === "simplified_4" ? "default" : "secondary"}>
                  4%
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                Упрощённая декларация. Налог 4% от дохода.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Лимит: 600 000 МРП/год (~2.6 млрд ₸)
              </p>
            </div>
            
            {/* Самозанятый */}
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                settings?.taxSystem === "self_employed"
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50 hover:border-muted-foreground/25"
              }`}
              onClick={() => updateSettingsMutation.mutate("self_employed")}
              data-testid="option-self-employed"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm sm:text-base">Самозанятый</h4>
                <Badge variant={settings?.taxSystem === "self_employed" ? "default" : "secondary"}>
                  4%
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                СНР для самозанятых. 0% ИПН + 4% соц.платежи.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Лимит: 300 МРП/мес (~1.3 млн ₸)
              </p>
            </div>
            
            {/* ОУР */}
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                settings?.taxSystem === "general"
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50 hover:border-muted-foreground/25"
              }`}
              onClick={() => updateSettingsMutation.mutate("general")}
              data-testid="option-general"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm sm:text-base">ОУР</h4>
                <Badge variant={settings?.taxSystem === "general" ? "default" : "secondary"}>
                  10-15%
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                Общеустановленный режим. Прогрессивная шкала.
              </p>
              <p className="text-xs text-muted-foreground/70">
                10% до 994 млн ₸, 15% свыше
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {calcLoading ? (
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
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Доходы за год</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 truncate">
                      {formatCurrency(calculation?.income ?? 0)}
                    </p>
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
                    <p className="text-xs sm:text-sm text-muted-foreground">Расходы за год</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 truncate">
                      {formatCurrency(calculation?.expenses ?? 0)}
                    </p>
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
                    <p className="text-xs sm:text-sm text-muted-foreground">Налоговая база</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 truncate">
                      {formatCurrency(calculation?.taxBase ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ставка: {calculation?.taxRate ?? 0}%
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-chart-4/10 shrink-0">
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-chart-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Налог к уплате</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 text-chart-2 truncate">
                      {formatCurrency(calculation?.taxAmount ?? 0)}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-chart-2/10 shrink-0">
                    <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Оценочные платежи по кварталам</CardTitle>
          <CardDescription>
            Помесячная разбивка для планирования бюджета (фактические сроки уплаты зависят от режима)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {calculation?.quarterlyPayments?.map((payment) => {
              const deadline = yearDeadlines.find(
                (d) => d.quarter === payment.quarter
              );

              return (
                <div
                  key={payment.quarter}
                  className={`p-4 rounded-lg border ${
                    payment.isPaid
                      ? "bg-chart-1/5 border-chart-1/20"
                      : "bg-muted/50"
                  }`}
                  data-testid={`quarter-${payment.quarter}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Q{payment.quarter}</span>
                    {payment.isPaid ? (
                      <Badge className="bg-chart-1 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Учтено
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Оценка</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-3">
                    Для планирования
                  </p>
                  {deadline && !payment.isPaid && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={deadline.isPaid ?? false}
                        onCheckedChange={(checked) =>
                          markPaidMutation.mutate({ id: deadline.id, isPaid: checked })
                        }
                        data-testid={`switch-paid-q${payment.quarter}`}
                      />
                      <Label className="text-sm">Отметить как учтено</Label>
                    </div>
                  )}
                </div>
              );
            }) ?? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Нет данных о платежах</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card - Kazakhstan 2026 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-chart-4" />
            Новый Налоговый кодекс РК 2026
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">О графике платежей:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Показаны оценочные суммы по кварталам</li>
                <li>• Используйте для планирования бюджета</li>
                <li>• Точные сроки уплаты уточняйте в НК РК</li>
              </ul>
              <h4 className="font-semibold mt-4">Изменения 2026:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Патент отменён с 1 января 2026</li>
                <li>• Упрощёнка: ставка повышена до 4%</li>
                <li>• НДС увеличен с 12% до 16%</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Социальные платежи ИП (от 1 МЗП):</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• ОПВ: 10% (от дохода)</li>
                <li>• СО: 3.5% (от дохода)</li>
                <li>• ОПВР: 3.5%</li>
                <li>• ВОСМС: 5%</li>
              </ul>
              <h4 className="font-semibold mt-4">МРП и МЗП 2026:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• МРП: 4 325 ₸</li>
                <li>• МЗП: 85 000 ₸</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" data-testid="button-export-report">
              <Download className="h-4 w-4 mr-2" />
              Скачать налоговый отчёт
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
