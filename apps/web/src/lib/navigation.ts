import {
  BarChart3,
  Bell,
  LayoutDashboard,
  MessageSquareMore,
  Settings,
} from "lucide-react";

export const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Event Log", href: "/event-log", icon: MessageSquareMore },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;
