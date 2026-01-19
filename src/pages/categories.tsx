import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Tags,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  Briefcase,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Heart,
  Gamepad2,
  GraduationCap,
  Wrench,
  Wallet,
  TrendingUp as ChartUp,
  Gift,
  FileText,
  Shield,
  Package,
} from "lucide-react";
import type { Category } from "@/types";

const CATEGORY_ICONS = [
  { value: "briefcase", label: "Работа", Icon: Briefcase },
  { value: "shopping", label: "Покупки", Icon: ShoppingCart },
  { value: "food", label: "Еда", Icon: Utensils },
  { value: "transport", label: "Транспорт", Icon: Car },
  { value: "home", label: "Дом", Icon: Home },
  { value: "health", label: "Здоровье", Icon: Heart },
  { value: "entertainment", label: "Развлечения", Icon: Gamepad2 },
  { value: "education", label: "Образование", Icon: GraduationCap },
  { value: "services", label: "Услуги", Icon: Wrench },
  { value: "salary", label: "Зарплата", Icon: Wallet },
  { value: "investment", label: "Инвестиции", Icon: ChartUp },
  { value: "gift", label: "Подарки", Icon: Gift },
  { value: "taxes", label: "Налоги", Icon: FileText },
  { value: "insurance", label: "Страховка", Icon: Shield },
  { value: "other", label: "Другое", Icon: Package },
];

const CATEGORY_COLORS = [
  { value: "#10b981", label: "Зелёный" },
  { value: "#8b5cf6", label: "Фиолетовый" },
  { value: "#f59e0b", label: "Оранжевый" },
  { value: "#3b82f6", label: "Синий" },
  { value: "#ef4444", label: "Красный" },
  { value: "#ec4899", label: "Розовый" },
  { value: "#14b8a6", label: "Бирюзовый" },
  { value: "#6366f1", label: "Индиго" },
];

const categorySchema = z.object({
  name: z.string().min(1, "Введите название"),
  icon: z.string().min(1, "Выберите иконку"),
  color: z.string().min(1, "Выберите цвет"),
  type: z.enum(["income", "expense"]),
});

type CategoryFormData = z.infer<typeof categorySchema>;

function getIconComponent(iconValue: string) {
  const iconConfig = CATEGORY_ICONS.find(i => i.value === iconValue);
  return iconConfig?.Icon || Package;
}

function CategoryDialog({
  open,
  onOpenChange,
  editCategory,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory?: Category;
}) {
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: editCategory
      ? {
          name: editCategory.name,
          icon: editCategory.icon,
          color: editCategory.color,
          type: editCategory.type as "income" | "expense",
        }
      : {
          name: "",
          icon: "other",
          color: "#10b981",
          type: "expense",
        },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (editCategory) {
        return apiRequest("PUT", `/api/categories/${editCategory.id}`, data);
      }
      return apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: editCategory ? "Категория обновлена" : "Категория добавлена",
        description: "Изменения сохранены",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить категорию",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editCategory ? "Редактировать категорию" : "Добавить категорию"}
          </DialogTitle>
          <DialogDescription>
            {editCategory
              ? "Измените параметры категории"
              : "Создайте новую категорию для транзакций"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например: Аренда офиса"
                      data-testid="input-category-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category-type">
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
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Иконка</FormLabel>
                  <div className="grid grid-cols-5 gap-2">
                    {CATEGORY_ICONS.map((iconOption) => {
                      const IconComponent = iconOption.Icon;
                      return (
                        <button
                          key={iconOption.value}
                          type="button"
                          className={`p-2 rounded-lg border transition-colors flex items-center justify-center hover-elevate ${
                            field.value === iconOption.value
                              ? "border-primary bg-primary/10"
                              : "border-transparent bg-muted/50"
                          }`}
                          onClick={() => field.onChange(iconOption.value)}
                          data-testid={`icon-${iconOption.value}`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цвет</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORY_COLORS.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          field.value === colorOption.value
                            ? "border-foreground scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: colorOption.value }}
                        onClick={() => field.onChange(colorOption.value)}
                        data-testid={`color-${colorOption.label}`}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-category"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-category"
              >
                {createMutation.isPending ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | undefined>();
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Удалено",
        description: "Категория успешно удалена",
      });
    },
  });

  const incomeCategories = categories?.filter((c) => c.type === "income") ?? [];
  const expenseCategories = categories?.filter((c) => c.type === "expense") ?? [];

  const openEdit = (category: Category) => {
    setEditCategory(category);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditCategory(undefined);
    setDialogOpen(true);
  };

  const renderCategoryIcon = (category: Category) => {
    const IconComponent = getIconComponent(category.icon);
    return <IconComponent className="h-5 w-5" style={{ color: category.color }} />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Категории</h1>
          <p className="text-muted-foreground">
            Управление категориями доходов и расходов
          </p>
        </div>
        <Button onClick={openCreate} data-testid="button-add-category">
          <Plus className="h-4 w-4 mr-2" />
          Добавить категорию
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <TrendingUp className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <CardTitle>Категории доходов</CardTitle>
                <CardDescription>{incomeCategories.length} категорий</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : incomeCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Tags className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Нет категорий доходов</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={openCreate}
                  data-testid="button-add-income-category"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                    data-testid={`category-${category.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {renderCategoryIcon(category)}
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(category)}
                        data-testid={`button-edit-${category.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(category.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${category.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-chart-5/10">
                <TrendingDown className="h-5 w-5 text-chart-5" />
              </div>
              <div>
                <CardTitle>Категории расходов</CardTitle>
                <CardDescription>{expenseCategories.length} категорий</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : expenseCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Tags className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Нет категорий расходов</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={openCreate}
                  data-testid="button-add-expense-category"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                    data-testid={`category-${category.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {renderCategoryIcon(category)}
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(category)}
                        data-testid={`button-edit-${category.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(category.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${category.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editCategory={editCategory}
      />
    </div>
  );
}
