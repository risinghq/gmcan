import caretDown from "@tabler/icons/filled/caret-down.svg";
import caretRight from "@tabler/icons/filled/caret-right.svg";
import arrowLeft from "@tabler/icons/outline/arrow-left.svg";
import arrowUp from "@tabler/icons/outline/arrow-up.svg";
import article from "@tabler/icons/outline/article.svg";
import book from "@tabler/icons/outline/book.svg";
import briefcase from "@tabler/icons/outline/briefcase.svg";
import calendarEvent from "@tabler/icons/outline/calendar-event.svg";
import chartBar from "@tabler/icons/outline/chart-bar.svg";
import chevronDown from "@tabler/icons/outline/chevron-down.svg";
import chevronLeft from "@tabler/icons/outline/chevron-left.svg";
import chevronRight from "@tabler/icons/outline/chevron-right.svg";
import circleCheck from "@tabler/icons/outline/circle-check.svg";
import clockEdit from "@tabler/icons/outline/clock-edit.svg";
import externalLink from "@tabler/icons/outline/external-link.svg";
import fileDescription from "@tabler/icons/outline/file-description.svg";
import history from "@tabler/icons/outline/history.svg";
import layoutDashboard from "@tabler/icons/outline/layout-dashboard.svg";
import menu from "@tabler/icons/outline/menu-2.svg";
import news from "@tabler/icons/outline/news.svg";
import school from "@tabler/icons/outline/school.svg";
import search from "@tabler/icons/outline/search.svg";
import user from "@tabler/icons/outline/user.svg";
import users from "@tabler/icons/outline/users.svg";
import x from "@tabler/icons/outline/x.svg";

export const ICONS = {
  "arrow-left": arrowLeft,
  "arrow-up": arrowUp,
  article,
  book,
  briefcase,
  "calendar-event": calendarEvent,
  "chart-bar": chartBar,
  "caret-down": caretDown,
  "caret-right": caretRight,
  "chevron-down": chevronDown,
  "chevron-left": chevronLeft,
  "chevron-right": chevronRight,
  "circle-check": circleCheck,
  "clock-edit": clockEdit,
  "external-link": externalLink,
  "file-description": fileDescription,
  history,
  "layout-dashboard": layoutDashboard,
  menu,
  news,
  school,
  search,
  user,
  users,
  x,
};

export type IconName = keyof typeof ICONS;
