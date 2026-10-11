/*
 * API publique de @acme/ui. Les familles suivent la barre latérale de la
 * documentation (Composants/<Famille>/<Nom>) ; chaque composant exporte ses
 * composants **et** ses types. Voir CONTRIBUTING.md.
 */

/* ══ Thème ══════════════════════════════════════════════════════════════ */
export { ThemeProvider, useTheme } from "./theme/ThemeProvider";
export type { ThemeMode, ThemeOverrides, ThemeProviderProps } from "./theme/ThemeProvider";
export { DirectionProvider, useDirection } from "./theme/DirectionProvider";
export type { Direction, DirectionProviderProps } from "./theme/DirectionProvider";

/* ══ Hooks ══════════════════════════════════════════════════════════════ */
export { useMediaQuery, breakpoints } from "./hooks/useMediaQuery";
export { useControllableState } from "./hooks/useControllableState";
export type { UseControllableStateParams } from "./hooks/useControllableState";

/* ══ Actions ════════════════════════════════════════════════════════════ */
export { Button, buttonVariants } from "./components/button/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/button/Button";

export { Toggle } from "./components/toggle/Toggle";
export type { ToggleProps, ToggleVariant, ToggleSize } from "./components/toggle/Toggle";

export { ToggleGroup, ToggleGroupItem } from "./components/toggle/ToggleGroup";
export type { ToggleGroupProps, ToggleGroupItemProps, ToggleGroupVariant, ToggleGroupSize } from "./components/toggle/ToggleGroup";

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./components/button-group/ButtonGroup";
export type { ButtonGroupProps, ButtonGroupOrientation, ButtonGroupSeparatorProps, ButtonGroupTextProps } from "./components/button-group/ButtonGroup";

export { Chip, ChipGroup } from "./components/chip/Chip";
export type { ChipProps } from "./components/chip/Chip";

export { Fab, fabVariants } from "./components/speed-dial/Fab";
export type { FabProps, FabVariant, FabSize } from "./components/speed-dial/Fab";

export { SpeedDial, SpeedDialAction } from "./components/speed-dial/SpeedDial";
export type { SpeedDialProps, SpeedDialActionProps, SpeedDialDirection } from "./components/speed-dial/SpeedDial";

/* ══ Formulaire ═════════════════════════════════════════════════════════ */
export { Field, useFieldControl, useFieldContext } from "./components/field/Field";
export type { FieldProps } from "./components/field/Field";

export { Label } from "./components/label/Label";
export type { LabelProps } from "./components/label/Label";

export { Input, Textarea } from "./components/input/Input";
export type { InputProps, InputDensity, TextareaProps } from "./components/input/Input";

export {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "./components/input-group/InputGroup";
export type { InputGroupAddonProps } from "./components/input-group/InputGroup";

export { SearchBar } from "./components/search-bar/SearchBar";
export type { SearchBarProps } from "./components/search-bar/SearchBar";

export { NumberInput, parseNumber } from "./components/number-input/NumberInput";
export type { NumberInputProps } from "./components/number-input/NumberInput";

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "./components/input-otp/InputOTP";
export type { InputOTPProps, InputOTPSlotProps } from "./components/input-otp/InputOTP";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "./components/select/Select";
export type { SelectTriggerProps, SelectContentProps } from "./components/select/Select";

export { NativeSelect, NativeSelectOption, NativeSelectOptGroup } from "./components/native-select/NativeSelect";
export type { NativeSelectProps, NativeSelectDensity, NativeSelectOptionProps, NativeSelectOptGroupProps } from "./components/native-select/NativeSelect";

export { Combobox } from "./components/combobox/Combobox";
export type { ComboboxProps, ComboboxOption, ComboboxSingleProps, ComboboxMultipleProps } from "./components/combobox/Combobox";

export { Checkbox } from "./components/checkbox/Checkbox";
export type { CheckboxProps } from "./components/checkbox/Checkbox";

export { RadioGroup, RadioGroupItem } from "./components/radio/RadioGroup";
export type { RadioGroupProps, RadioGroupItemProps } from "./components/radio/RadioGroup";

export { Switch } from "./components/switch/Switch";
export type { SwitchProps } from "./components/switch/Switch";

export { Slider } from "./components/slider/Slider";
export type { SliderProps } from "./components/slider/Slider";

export { Rating } from "./components/rating/Rating";
export type { RatingProps, RatingSize } from "./components/rating/Rating";

export { Calendar } from "./components/calendar/Calendar";
export type { CalendarProps, DateRange, Matcher } from "./components/calendar/Calendar";

export { DatePicker, DateRangePicker, formatDate, formatDateRange, defaultDateRangePresets } from "./components/date-picker/DatePicker";
export type { DatePickerProps, DateRangePickerProps, DateRangePreset } from "./components/date-picker/DatePicker";

export { TimePicker, DateTimePicker, parseTime } from "./components/time-picker/TimePicker";
export type { TimePickerProps, DateTimePickerProps } from "./components/time-picker/TimePicker";

export { Dropzone, dropzoneVariants, FileUploadList, FileUploadItem, formatFileSize, getFileKind, isFileAccepted } from "./components/file-upload/FileUpload";
export type {
  DropzoneProps,
  DropzoneVariant,
  DropzoneLabels,
  FileRejection,
  FileRejectionCode,
  FileUploadError,
  FileUploadListProps,
  FileUploadItemProps,
  FileUploadItemLabels,
  FileUploadItemVariant,
  FileUploadStatus,
  FileKind,
  FormatFileSizeOptions,
} from "./components/file-upload/FileUpload";

/* ══ Affichage ══════════════════════════════════════════════════════════ */
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  getInitials,
} from "./components/avatar/Avatar";
export type {
  AvatarProps,
  AvatarSize,
  AvatarFallbackProps,
  AvatarBadgeProps,
  AvatarBadgeTone,
  AvatarGroupProps,
} from "./components/avatar/Avatar";

export { Badge, badgeVariants } from "./components/badge/Badge";
export type { BadgeProps, BadgeVariant } from "./components/badge/Badge";

export {
  Card,
  cardVariants,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardMedia,
  CardContent,
  CardFooter,
} from "./components/card/Card";
export type { CardProps, CardVariant } from "./components/card/Card";

export { List, ListSection, ListItem, ListItemIcon } from "./components/list/List";
export type { ListProps, ListSectionProps, ListItemProps, ListItemIconProps } from "./components/list/List";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./components/table/Table";
export type { TableProps, TableRowProps, TableHeadProps, TableCellProps, TableSortDirection } from "./components/table/Table";

export { AspectRatio } from "./components/aspect-ratio/AspectRatio";
export type { AspectRatioProps, AspectRatioFit } from "./components/aspect-ratio/AspectRatio";

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots, useCarousel } from "./components/carousel/Carousel";
export type {
  CarouselApi,
  CarouselOptions,
  CarouselPlugin,
  CarouselOrientation,
  CarouselProps,
  CarouselLabels,
  CarouselItemProps,
  CarouselControlProps,
  CarouselControlPlacement,
  CarouselDotsProps,
} from "./components/carousel/Carousel";

/* ══ Données ════════════════════════════════════════════════════════════ */
export { DataTable, createColumnHelper, flexRender } from "./components/data-table/DataTable";
export type {
  DataTableProps,
  DataTableInstance,
  CellContext,
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnHelper,
  HeaderContext,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
} from "./components/data-table/DataTable";
export { useDataTable } from "./components/data-table/useDataTable";
export type { UseDataTableOptions } from "./components/data-table/useDataTable";
export { DataTableView } from "./components/data-table/DataTableView";
export type { DataTableViewProps, DataTableRowEvent } from "./components/data-table/DataTableView";
export { DataTableToolbar, DataTableSearch, DataTableSelectionBar, DataTableDensityToggle } from "./components/data-table/DataTableToolbar";
export type {
  DataTableToolbarProps,
  DataTableSearchProps,
  DataTableSelectionBarProps,
  DataTableDensityToggleProps,
  DataTableBulkActions,
  DataTableBulkActionsContext,
} from "./components/data-table/DataTableToolbar";
export { DataTableColumnHeader, dataTableHeader } from "./components/data-table/DataTableColumnHeader";
export type { DataTableColumnHeaderProps } from "./components/data-table/DataTableColumnHeader";
export { DataTableFacetedFilter } from "./components/data-table/DataTableFacetedFilter";
export type { DataTableFacetedFilterProps } from "./components/data-table/DataTableFacetedFilter";
export { DataTableViewOptions } from "./components/data-table/DataTableViewOptions";
export type { DataTableViewOptionsProps } from "./components/data-table/DataTableViewOptions";
export { DataTablePagination } from "./components/data-table/DataTablePagination";
export type { DataTablePaginationProps } from "./components/data-table/DataTablePagination";
export {
  selectColumn,
  actionsColumn,
  dataTableFormatters,
  DataTableRowActions,
  DataTableRowCheckbox,
  DataTableSelectAllCheckbox,
  DataTableDefaultCell,
} from "./components/data-table/columns";
export type { SelectColumnOptions, ActionsColumnOptions } from "./components/data-table/columns";
export { DataTableProvider, defaultDataTableLabels, useDataTableLabels } from "./components/data-table/context";
export { exportCsv, toCsv } from "./components/data-table/export";
export type { DataTableCsvOptions } from "./components/data-table/export";
export { facetFilterFn } from "./components/data-table/utils";
export type {
  DataTableDensity,
  DataTableFilterOption,
  DataTableLabels,
  DataTablePersistedKey,
  DataTableState,
} from "./components/data-table/types";

export { TreeView, TreeItem } from "./components/tree-view/TreeView";
export type { TreeViewProps, TreeViewItem, TreeItemProps, TreeViewSelectionMode, TreeViewSize, TreeViewLabels } from "./components/tree-view/TreeView";

export {
  Timeline,
  TimelineGroup,
  TimelineItem,
  TimelineIndicator,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
} from "./components/timeline/Timeline";
export type { TimelineProps, TimelineAlign, TimelineGroupProps, TimelineIndicatorProps, TimelineTone, TimelineTimeProps } from "./components/timeline/Timeline";

export { DescriptionList, DescriptionItem, DescriptionTerm, DescriptionDetails } from "./components/description-list/DescriptionList";
export type {
  DescriptionListProps,
  DescriptionListLayout,
  DescriptionListVariant,
  DescriptionItemProps,
  DescriptionDetailsProps,
} from "./components/description-list/DescriptionList";

export { Stat, StatGroup } from "./components/stat/Stat";
export type { StatProps, StatGroupProps, StatSize, StatVariant, StatDeltaTone, StatLabels } from "./components/stat/Stat";
export { Sparkline } from "./components/stat/Sparkline";
export type { SparklineProps } from "./components/stat/Sparkline";

/* ══ Typographie ════════════════════════════════════════════════════════ */
export { Text, Heading, Link, Kbd, VisuallyHidden } from "./components/typography/Typography";
export type {
  TextProps,
  TextSize,
  TextWeight,
  TextTone,
  HeadingProps,
  HeadingLevel,
  HeadingSize,
  LinkProps,
} from "./components/typography/Typography";

/* ══ Mise en page ═══════════════════════════════════════════════════════ */
export { Box, Stack, HStack, Grid, Container } from "./components/layout/Layout";
export type { BoxProps, StackProps, GridProps, ContainerProps, Surface, Radius, Elevation } from "./components/layout/Layout";
export { space } from "./utils/space";
export type { Space } from "./utils/space";

export { Separator } from "./components/separator/Separator";
export type { SeparatorProps } from "./components/separator/Separator";

export { ScrollArea, ScrollBar } from "./components/scroll-area/ScrollArea";
export type { ScrollAreaProps } from "./components/scroll-area/ScrollArea";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/accordion/Accordion";
export type {
  AccordionProps,
  AccordionVariant,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
} from "./components/accordion/Accordion";

export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./components/collapsible/Collapsible";
export type { CollapsibleProps, CollapsibleTriggerProps, CollapsibleContentProps } from "./components/collapsible/Collapsible";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./components/resizable/Resizable";
export type {
  ResizablePanelGroupProps,
  ResizablePanelProps,
  ResizableHandleProps,
  ResizableOrientation,
  ResizablePanelHandle,
  ResizablePanelGroupHandle,
} from "./components/resizable/Resizable";

/* ══ Navigation ═════════════════════════════════════════════════════════ */
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/tabs/Tabs";
export type { TabsListProps } from "./components/tabs/Tabs";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  breadcrumbVariants,
} from "./components/breadcrumb/Breadcrumb";
export type {
  BreadcrumbProps,
  BreadcrumbSize,
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbPageProps,
  BreadcrumbSeparatorProps,
  BreadcrumbEllipsisProps,
} from "./components/breadcrumb/Breadcrumb";

export { Pagination, getPaginationRange, paginationVariants } from "./components/pagination/Pagination";
export type { PaginationProps, PaginationVariant, PaginationLabels, PaginationRangeItem } from "./components/pagination/Pagination";

export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "./components/sidebar/Sidebar";
export type {
  SidebarContextValue,
  SidebarProviderProps,
  SidebarProps,
  SidebarState,
  SidebarSide,
  SidebarVariant,
  SidebarCollapsible,
  SidebarTriggerProps,
  SidebarRailProps,
  SidebarGroupLabelProps,
  SidebarGroupActionProps,
  SidebarMenuButtonProps,
  SidebarMenuActionProps,
  SidebarMenuSubButtonProps,
} from "./components/sidebar/Sidebar";

export { AppBar, AppBarLeading, AppBarTitle, AppBarActions } from "./components/app-bar/AppBar";
export type { AppBarProps, AppBarTitleProps, AppBarVariant, AppBarDensity, AppBarTitleAlign, AppBarPosition } from "./components/app-bar/AppBar";

export { BottomNavigation, BottomNavigationItem } from "./components/bottom-navigation/BottomNavigation";
export type { BottomNavigationProps, BottomNavigationItemProps, BottomNavigationPosition } from "./components/bottom-navigation/BottomNavigation";

export { Stepper, Step, StepIndicator, StepTitle, StepDescription, StepSeparator, StepContent, useStepper } from "./components/stepper/Stepper";
export type {
  StepperProps,
  StepProps,
  StepIndicatorProps,
  StepStatus,
  StepperOrientation,
  StepperLabels,
  UseStepperOptions,
  UseStepperReturn,
} from "./components/stepper/Stepper";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarGroup,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "./components/menubar/Menubar";
export type { MenubarItemProps } from "./components/menubar/Menubar";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuGrid,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "./components/navigation-menu/NavigationMenu";
export type { NavigationMenuProps, NavigationMenuLinkProps, NavigationMenuGridProps } from "./components/navigation-menu/NavigationMenu";

/* ══ Surcouches ═════════════════════════════════════════════════════════ */
export { Tooltip, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "./components/tooltip/Tooltip";
export type { TooltipProps, TooltipContentProps } from "./components/tooltip/Tooltip";

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "./components/popover/Popover";

export { HoverCard, HoverCardTrigger, HoverCardContent } from "./components/hover-card/HoverCard";
export type { HoverCardProps, HoverCardContentProps } from "./components/hover-card/HoverCard";

export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuLabel,
  MenuSeparator,
  MenuGroup,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from "./components/menu/Menu";
export type { MenuItemProps } from "./components/menu/Menu";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "./components/context-menu/ContextMenu";
export type { ContextMenuItemProps } from "./components/context-menu/ContextMenu";

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./components/dialog/Dialog";
export type { DialogContentProps } from "./components/dialog/Dialog";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./components/alert-dialog/AlertDialog";
export type { AlertDialogContentProps } from "./components/alert-dialog/AlertDialog";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./components/sheet/Sheet";
export type { SheetContentProps } from "./components/sheet/Sheet";

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "./components/drawer/Drawer";
export type { DrawerProps, DrawerContentProps, DrawerDirection } from "./components/drawer/Drawer";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "./components/command/Command";
export type { CommandDialogProps, CommandItemProps, CommandSeparatorProps } from "./components/command/Command";

/* ══ Retour ═════════════════════════════════════════════════════════════ */
export { Alert, AlertTitle, AlertDescription, AlertAction } from "./components/alert/Alert";
export type { AlertProps, AlertTone } from "./components/alert/Alert";

export { Toaster, toast } from "./components/toast/Toaster";
export type { ToasterProps } from "./components/toast/Toaster";

export { Progress } from "./components/progress/Progress";
export type { ProgressProps, ProgressTone } from "./components/progress/Progress";

export { Spinner } from "./components/spinner/Spinner";
export type { SpinnerProps } from "./components/spinner/Spinner";

export { Skeleton } from "./components/skeleton/Skeleton";
export type { SkeletonProps } from "./components/skeleton/Skeleton";

export { EmptyState, emptyStateVariants } from "./components/empty-state/EmptyState";
export type { EmptyStateProps, EmptyStateVariant, EmptyStateSize, EmptyStateTitleElement } from "./components/empty-state/EmptyState";

/* ══ Messagerie ═════════════════════════════════════════════════════════ */
export {
  MessageList,
  MessageGroup,
  Message,
  MessageAttachment,
  MessageDateSeparator,
  TypingIndicator,
  ChatComposer,
  formatMessageDate,
} from "./components/chat/Chat";
export type {
  MessageListProps,
  MessageListLabels,
  MessageGroupProps,
  MessageProps,
  MessageLabels,
  MessageFrom,
  MessageStatus,
  MessagePosition,
  MessageAttachmentProps,
  MessageDateSeparatorProps,
  TypingIndicatorProps,
  ChatComposerProps,
} from "./components/chat/Chat";

/* ══ Graphiques (Apache ECharts) ════════════════════════════════════════ */
export { Chart } from "./components/chart/Chart";
export type { ChartProps, ChartOption, ChartSize } from "./components/chart/Chart";
export { LineChart, BarChart, DonutChart, ChartLegend, ChartDataTable } from "./components/chart/charts";
export type {
  LineChartProps,
  BarChartProps,
  DonutChartProps,
  DonutDatum,
  ChartSeries,
  ChartLegendProps,
  ChartLegendItem,
  ChartDataTableProps,
} from "./components/chart/charts";
export { readChartTokens, useChartTokens, buildChartTheme } from "./components/chart/theme";
export type { ChartTokens } from "./components/chart/theme";
export { registerChartModules } from "./components/chart/echarts";

/* ══ Utilitaires ════════════════════════════════════════════════════════ */
export { cn } from "./utils/cn";
