import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Calculator, TrendingUp, Shield, FileText } from "lucide-react";

const authSchema = z.object({
  username: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(4, "Минимум 4 символа"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    setLocation("/");
    return null;
  }

  const onSubmit = (data: AuthFormData) => {
    if (activeTab === "login") {
      loginMutation.mutate(data, {
        onSuccess: () => setLocation("/"),
      });
    } else {
      registerMutation.mutate(data, {
        onSuccess: () => setLocation("/"),
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">esepte</CardTitle>
            <CardDescription>
              Финансовый помощник для ИП Казахстана
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">Вход</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Регистрация</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Логин</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Введите логин"
                            data-testid="input-username"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Пароль</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Введите пароль"
                            data-testid="input-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending}
                    data-testid="button-submit"
                  >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {activeTab === "login" ? "Войти" : "Зарегистрироваться"}
                  </Button>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-8">
        <div className="max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Управляйте финансами вашего бизнеса
            </h2>
            <p className="text-muted-foreground">
              esepte помогает индивидуальным предпринимателям Казахстана вести учёт доходов и расходов, рассчитывать налоги и соблюдать сроки уплаты.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Расчёт налогов</h3>
                <p className="text-sm text-muted-foreground">
                  Автоматический расчёт по режимам 2026 года: упрощёнка, самозанятость, ОУР
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Импорт выписок</h3>
                <p className="text-sm text-muted-foreground">
                  Загружайте PDF и CSV выписки из Kaspi, Halyk и других банков
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Аналитика</h3>
                <p className="text-sm text-muted-foreground">
                  Графики доходов и расходов, разбивка по категориям
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Безопасность</h3>
                <p className="text-sm text-muted-foreground">
                  Ваши данные защищены паролем и хранятся на защищённом сервере
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
