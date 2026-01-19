import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Receipt,
  Upload,
  Calculator,
  PieChart,
  Tags,
  Bell,
  Settings,
  Sparkles,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const mainMenuItems = [
  {
    titleKey: "nav.dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    titleKey: "nav.transactions",
    url: "/transactions",
    icon: Receipt,
  },
  {
    titleKey: "nav.upload",
    url: "/upload",
    icon: Upload,
  },
  {
    titleKey: "nav.taxes",
    url: "/taxes",
    icon: Calculator,
  },
  {
    titleKey: "nav.analytics",
    url: "/analytics",
    icon: PieChart,
  },
  {
    titleKey: "nav.assistant",
    url: "/assistant",
    icon: MessageCircle,
  },
];

const settingsItems = [
  {
    titleKey: "nav.categories",
    url: "/categories",
    icon: Tags,
  },
  {
    titleKey: "nav.reminders",
    url: "/reminders",
    icon: Bell,
  },
  {
    titleKey: "nav.settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { t, language } = useI18n();
  const { user, logoutMutation } = useAuth();

  const subtitle = language === "kk" ? "Қаржылық көмекші" : "Финансовый помощник";
  const mainLabel = language === "kk" ? "Басты" : "Главное";
  const settingsLabel = language === "kk" ? "Баптаулар" : "Настройки";
  const logoutLabel = language === "kk" ? "Шығу" : "Выйти";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">esepte</span>
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{mainLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.url.replace("/", "") || "dashboard"}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{settingsLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.url.replace("/", "")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        {user && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground truncate flex-1">
              {user.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-1" />
              {logoutLabel}
            </Button>
          </div>
        )}
        <div className="rounded-lg bg-primary/10 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">esepte</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {language === "kk" ? "ИП-лерге арналған қаржылық есеп" : "Финансовый учёт для ИП"}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
