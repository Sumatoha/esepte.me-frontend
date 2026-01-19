import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Bot, User, Loader2, Sparkles, HelpCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const { t, language } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = language === "kk"
    ? [
        "ЖК салық режимдерінің түрлері қандай?",
        "Упрощённая декларация 4% қалай жұмыс істейді?",
        "Әлеуметтік төлемдерді қалай есептеуге болады?",
        "2026 жылғы НК өзгерістері қандай?",
      ]
    : [
        "Какие виды налоговых режимов для ИП?",
        "Как работает упрощённая декларация 4%?",
        "Как рассчитать социальные отчисления?",
        "Какие изменения в НК 2026?",
      ];

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/assistant/chat", { 
        question,
        language,
        history: messages.slice(-6),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    },
    onError: () => {
      setMessages((prev) => [...prev, { role: "assistant", content: t("assistant.error") }]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    chatMutation.mutate(question);
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    chatMutation.mutate(question);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold" data-testid="text-assistant-title">
            {t("assistant.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("assistant.subtitle")}
          </p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <Sparkles className="h-12 w-12 text-primary/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === "kk" ? "Сұрақ қойыңыз" : "Задайте вопрос"}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  {language === "kk" 
                    ? "Мен Қазақстандағы ЖК салықтары, декларациялар, есептер туралы көмектесе аламын"
                    : "Я могу помочь с вопросами о налогах ИП в Казахстане, декларациях, отчётности"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-xl">
                  {suggestedQuestions.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="text-left justify-start h-auto py-3 px-4"
                      onClick={() => handleSuggestedQuestion(question)}
                      data-testid={`button-suggested-${idx}`}
                    >
                      <HelpCircle className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                    data-testid={`message-${msg.role}-${idx}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-3 max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex gap-3" data-testid="message-loading">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="rounded-lg px-4 py-3 bg-muted">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("assistant.thinking")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("assistant.placeholder")}
                className="min-h-[44px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                data-testid="input-chat"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || chatMutation.isPending}
                data-testid="button-send"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
