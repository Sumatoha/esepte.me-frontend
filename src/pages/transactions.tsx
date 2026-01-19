import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Filter,
  Trash2,
  Receipt,
} from "lucide-react";
import type { Transaction, Category, InsertTransaction } from "@/types";

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
    month: "short",
  });
}

function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return `${(amount / 1000000).toFixed(1)} млн`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toFixed(0)} тыс`;
  }
  return new Intl.NumberFormat("ru-RU").format(amount);
}

const transactionSchema = z.object({
  amount: z.string().min(1, "Введите сумму"),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().optional(),
  description: z.string().min(1, "Введите описание"),
  date: z.string().min(1, "Выберите дату"),
  counterparty: z.string().optional(),
  isDeductible: z.boolean().default(true),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

function AddTransactionDialog({ 
  open, 
  onOpenChange,
  categories,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}) {
  const { toast } = useToast();
  
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      type: "expense",
      description: "",
      date: new Date().toISOString().split("T")[0],
      counterparty: "",
      isDeductible: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const payload: InsertTransaction = {
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId || null,
        description: data.description,
        date: data.date,
        counterparty: data.counterparty || null,
        isDeductible: data.isDeductible,
      };
      return apiRequest("POST", "/api/transactions", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly"] });
      toast({
        title: "Транзакция добавлена",
        description: "Запись успешно сохранена",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить транзакцию",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    createMutation.mutate(data);
  };

  const selectedType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить транзакцию</DialogTitle>
          <DialogDescription>
            Введите данные о доходе или расходе
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Доход</SelectItem>
                        <SelectItem value="expense">Расход</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сумма (KZT)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        data-testid="input-amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например: Оплата за услуги"
                      data-testid="input-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        data-testid="input-date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter((c) => c.type === selectedType)
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="counterparty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Контрагент (опционально)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Название компании или ИП"
                      data-testid="input-counterparty"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "expense" && (
              <FormField
                control={form.control}
                name="isDeductible"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-sm font-medium">
                        Учитывать в расходах для налога
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Для УСН 15% (доходы минус расходы)
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-deductible"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-transaction"
              >
                {createMutation.isPending ? "Сохранение..." : "Добавить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Transactions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense" | "transfer">("all");
  const { toast } = useToast();

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly"] });
      toast({
        title: "Удалено",
        description: "Транзакция успешно удалена",
      });
    },
  });

  const filteredTransactions = transactions?.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.counterparty?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesType;
  }) ?? [];

  const getCategoryInfo = (categoryId: string | null) => {
    if (!categoryId || !categories) return null;
    return categories.find((c) => c.id === categoryId);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Транзакции</h1>
          <p className="text-sm text-muted-foreground">Доходы и расходы</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="shrink-0" data-testid="button-add-transaction">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Добавить</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
            data-testid="input-search"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
        >
          <SelectTrigger className="w-[100px] sm:w-[130px] h-9" data-testid="select-filter-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="income">Доходы</SelectItem>
            <SelectItem value="expense">Расходы</SelectItem>
            <SelectItem value="transfer">Переводы</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Список транзакций</CardTitle>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {filteredTransactions.length} записей
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">Нет транзакций</h3>
              <p className="text-muted-foreground max-w-sm">
                {searchQuery || typeFilter !== "all"
                  ? "Попробуйте изменить параметры поиска"
                  : "Добавьте первую транзакцию или загрузите банковскую выписку"}
              </p>
              {!searchQuery && typeFilter === "all" && (
                <Button
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                  data-testid="button-add-first-transaction"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить транзакцию
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => {
                const category = getCategoryInfo(tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border hover-elevate transition-colors"
                    data-testid={`transaction-row-${tx.id}`}
                  >
                    {/* Icon */}
                    <div
                      className={`p-2 sm:p-2.5 rounded-lg shrink-0 ${
                        tx.type === "income" 
                          ? "bg-chart-1/10" 
                          : tx.type === "transfer" 
                            ? "bg-muted" 
                            : "bg-chart-5/10"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-chart-1" />
                      ) : tx.type === "transfer" ? (
                        <ArrowLeftRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      ) : (
                        <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-chart-5" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{tx.description}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatDate(tx.date)}
                        {tx.counterparty && ` · ${tx.counterparty}`}
                      </p>
                    </div>
                    
                    {/* Amount & Delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-semibold text-sm sm:text-base ${
                          tx.type === "income" 
                            ? "text-chart-1" 
                            : tx.type === "transfer" 
                              ? "text-muted-foreground" 
                              : "text-chart-5"
                        }`}
                      >
                        {tx.type === "income" ? "+" : tx.type === "transfer" ? "" : "-"}
                        {formatCurrencyCompact(Math.abs(Number(tx.amount)))} ₸
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => deleteMutation.mutate(tx.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${tx.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories ?? []}
      />
    </div>
  );
}
