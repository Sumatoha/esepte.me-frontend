import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Upload as UploadIcon,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Trash2,
} from "lucide-react";
import type { ParsedTransaction } from "@/types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface UploadResult {
  success: boolean;
  transactions: ParsedTransaction[];
  errors: string[];
  warnings: string[];
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<UploadResult | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const parseMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload/parse", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to parse file");
      }
      return response.json() as Promise<UploadResult>;
    },
    onSuccess: (data) => {
      setParseResult(data);
      setSelectedTransactions(new Set(data.transactions.map((_, i) => i)));
      if (data.success) {
        toast({
          title: "Файл обработан",
          description: `Найдено ${data.transactions.length} транзакций`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обработать файл",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (transactions: ParsedTransaction[]) => {
      return apiRequest("POST", "/api/upload/import", { transactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly"] });
      toast({
        title: "Импорт завершён",
        description: "Транзакции успешно добавлены",
      });
      setFile(null);
      setParseResult(null);
      setSelectedTransactions(new Set());
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось импортировать транзакции",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setParseResult(null);
      parseMutation.mutate(droppedFile);
    }
  }, [parseMutation]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParseResult(null);
      parseMutation.mutate(selectedFile);
    }
  }, [parseMutation]);

  const toggleTransaction = (index: number) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTransactions(newSelected);
  };

  const handleImport = () => {
    if (!parseResult) return;
    const transactionsToImport = parseResult.transactions.filter((_, i) => selectedTransactions.has(i));
    importMutation.mutate(transactionsToImport);
  };

  const resetUpload = () => {
    setFile(null);
    setParseResult(null);
    setSelectedTransactions(new Set());
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Загрузить выписку</h1>
        <p className="text-muted-foreground">
          Импортируйте банковскую выписку для автоматического добавления транзакций
        </p>
      </div>

      {/* Upload Area */}
      {!parseResult && (
        <Card>
          <CardContent className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-testid="upload-dropzone"
            >
              <input
                type="file"
                accept=".csv,.pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                data-testid="input-file"
              />
              <div className="flex flex-col items-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <UploadIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {parseMutation.isPending
                    ? "Обработка файла..."
                    : "Перетащите файл сюда"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  или нажмите для выбора файла
                </p>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <Badge variant="secondary">PDF</Badge>
                  <Badge variant="secondary">CSV</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Поддерживаемые банки: Kaspi, Halyk, Forte, Jusan
                </p>
                {parseMutation.isPending && (
                  <Progress value={66} className="w-48 mt-4" />
                )}
              </div>
            </div>

            {file && !parseMutation.isPending && (
              <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-chart-1" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetUpload}
                  data-testid="button-remove-file"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parse Results */}
      {parseResult && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card data-testid="card-income-count">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-1/10 shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-chart-1" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{parseResult.transactions.filter(t => t.type === 'income').length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Доходов</p>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-expense-count">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-5/10 shrink-0">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-chart-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{parseResult.transactions.filter(t => t.type === 'expense').length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Расходов</p>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-transfer-count">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted shrink-0">
                  <ArrowLeftRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{parseResult.transactions.filter(t => t.type === 'transfer').length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Переводов</p>
                </div>
              </CardContent>
            </Card>
            {(parseResult.warnings.length > 0 || parseResult.errors.length > 0) && (
              <Card>
                <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${parseResult.errors.length > 0 ? 'bg-destructive/10' : 'bg-chart-3/10'}`}>
                    {parseResult.errors.length > 0 ? (
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-chart-3" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold">{parseResult.errors.length + parseResult.warnings.length}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Замечаний</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Transfer notice */}
          {parseResult.transactions.filter(t => t.type === 'transfer').length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border" data-testid="notice-transfers-excluded">
              <ArrowLeftRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Собственные переводы не учитываются в налогах</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Переводы между вашими счетами (на депозит, на карту Kaspi Gold и т.д.) автоматически определены и не будут влиять на расчёт налогов.
                </p>
              </div>
            </div>
          )}

          {/* Transactions Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Предпросмотр транзакций</CardTitle>
                  <CardDescription>
                    Выбрано {selectedTransactions.size} из {parseResult.transactions.length}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={resetUpload}
                    data-testid="button-cancel-import"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={selectedTransactions.size === 0 || importMutation.isPending}
                    data-testid="button-import"
                  >
                    {importMutation.isPending ? "Импорт..." : "Импортировать"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {parseResult.transactions.map((tx, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTransactions.has(index)
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/50 opacity-60"
                    }`}
                    onClick={() => toggleTransaction(index)}
                    data-testid={`preview-transaction-${index}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTransactions.has(index)}
                      onChange={() => toggleTransaction(index)}
                      className="h-4 w-4 rounded border-input"
                      data-testid={`checkbox-transaction-${index}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{tx.date}</span>
                        {tx.counterparty && (
                          <>
                            <span>•</span>
                            <span className="truncate">{tx.counterparty}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={tx.type === "income" ? "default" : tx.type === "transfer" ? "outline" : "secondary"}>
                      {tx.type === "income" ? "Доход" : tx.type === "transfer" ? "Перевод" : "Расход"}
                    </Badge>
                    <span
                      className={`font-semibold whitespace-nowrap ${
                        tx.type === "income" 
                          ? "text-chart-1" 
                          : tx.type === "transfer" 
                            ? "text-muted-foreground" 
                            : "text-chart-5"
                      }`}
                    >
                      {tx.type === "income" ? "+" : tx.type === "transfer" ? "" : "-"}
                      {formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Errors/Warnings */}
          {(parseResult.errors.length > 0 || parseResult.warnings.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Замечания</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {parseResult.errors.map((error, i) => (
                  <div key={i} className="flex items-start gap-2 text-destructive">
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                ))}
                {parseResult.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2 text-chart-3">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="text-sm">{warning}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Поддерживаемые форматы</CardTitle>
          <CardDescription>
            Убедитесь, что файл соответствует одному из форматов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">CSV файлы</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Стандартный формат с колонками: дата, сумма, описание
              </p>
              <div className="text-xs font-mono bg-background p-2 rounded">
                Дата;Сумма;Описание<br />
                2024-01-15;-15000;Оплата аренды<br />
                2024-01-16;50000;Поступление от клиента
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">PDF выписки</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Выписки из казахстанских банков в PDF формате
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Kaspi Business</Badge>
                <Badge variant="outline">Halyk Bank</Badge>
                <Badge variant="outline">Forte Bank</Badge>
                <Badge variant="outline">Jusan</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
