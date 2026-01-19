import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import {
  Settings as SettingsIcon,
  Calculator,
  Bell,
  Palette,
  Download,
  Trash2,
  Info,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";
import type { TaxSettings } from "@/types";

const currentYear = new Date().getFullYear();

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { data: settings } = useQuery<TaxSettings>({
    queryKey: ["/api/settings/tax"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (taxSystem: string) => {
      return apiRequest("PUT", "/api/settings/tax", { taxSystem, year: currentYear });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/tax"] });
      queryClient.invalidateQueries({ queryKey: ["/api/taxes/calculate"] });
      toast({
        title: "Настройки обновлены",
        description: "Система налогообложения изменена",
      });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">
          Управление приложением и налоговыми параметрами
        </p>
      </div>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Налоговые настройки</CardTitle>
              <CardDescription>Выберите систему налогообложения</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                settings?.taxSystem === "usn_6"
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50 hover:border-muted-foreground/25"
              }`}
              onClick={() => updateSettingsMutation.mutate("usn_6")}
              data-testid="settings-usn-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">УСН 6%</h4>
                {settings?.taxSystem === "usn_6" && (
                  <Badge>Активно</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Упрощённая система налогообложения. Налог 6% от всех доходов.
              </p>
            </div>
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                settings?.taxSystem === "usn_15"
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/50 hover:border-muted-foreground/25"
              }`}
              onClick={() => updateSettingsMutation.mutate("usn_15")}
              data-testid="settings-usn-15"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">УСН 15%</h4>
                {settings?.taxSystem === "usn_15" && (
                  <Badge>Активно</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Налог 15% от прибыли (доходы минус расходы).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-chart-2" />
            <div>
              <CardTitle>Внешний вид</CardTitle>
              <CardDescription>Настройте тему приложения</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-chart-4" />
              ) : (
                <Sun className="h-5 w-5 text-chart-3" />
              )}
              <div>
                <Label className="text-base">Тёмная тема</Label>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" ? "Тёмная тема активна" : "Светлая тема активна"}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              data-testid="switch-dark-mode"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-chart-3" />
            <div>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>Настройте напоминания</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Напоминания о налогах</Label>
              <p className="text-sm text-muted-foreground">
                Получать напоминания за 7 дней до срока
              </p>
            </div>
            <Switch defaultChecked data-testid="switch-tax-reminders" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Еженедельный отчёт</Label>
              <p className="text-sm text-muted-foreground">
                Сводка по доходам и расходам
              </p>
            </div>
            <Switch data-testid="switch-weekly-report" />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Управление данными</CardTitle>
              <CardDescription>Экспорт и удаление данных</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Экспорт данных</Label>
              <p className="text-sm text-muted-foreground">
                Скачать все транзакции в формате CSV
              </p>
            </div>
            <Button variant="outline" data-testid="button-export-data">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base text-destructive">Удалить все данные</Label>
              <p className="text-sm text-muted-foreground">
                Безвозвратное удаление всех транзакций
              </p>
            </div>
            <Button variant="destructive" data-testid="button-delete-all">
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>О приложении</CardTitle>
              <CardDescription>esepte - Финансовый помощник для ИП</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-semibold">esepte</h4>
                <p className="text-sm text-muted-foreground">Версия 1.0.0</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-chart-4 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    Приложение создано для упрощения учёта финансов индивидуальных
                    предпринимателей на упрощённой системе налогообложения.
                  </p>
                  <p>
                    Функции: учёт транзакций, загрузка выписок, расчёт налогов,
                    напоминания о сроках, аналитика и отчёты.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
