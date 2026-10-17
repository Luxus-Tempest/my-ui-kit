/*
 * Catalogue de libellés : un espace de noms par composant. Les valeurs
 * françaises vivent dans chaque composant (constantes `XXX_LABELS`) ; un
 * catalogue de langue (`localeEn`, `localeAr`) les fournit toutes, typé par
 * `UiMessages` : une clé oubliée dans une traduction est une erreur de type.
 */
import type { AlertDialogLabels } from "../components/alert-dialog/AlertDialog";
import type { BottomNavigationLabels } from "../components/bottom-navigation/BottomNavigation";
import type { BreadcrumbLabels } from "../components/breadcrumb/Breadcrumb";
import type { CalendarLabels } from "../components/calendar/Calendar";
import type { DataTableLabels } from "../components/data-table/types";
import type { DatePickerLabels } from "../components/date-picker/DatePicker";
import type { CarouselLabels } from "../components/carousel/Carousel";
import type { ChartLabels } from "../components/chart/charts";
import type { ChatLabels } from "../components/chat/Chat";
import type { ChipLabels } from "../components/chip/Chip";
import type { ComboboxLabels } from "../components/combobox/Combobox";
import type { NumberInputLabels } from "../components/number-input/NumberInput";
import type { RatingLabels } from "../components/rating/Rating";
import type { SidebarLabels } from "../components/sidebar/Sidebar";
import type { SliderLabels } from "../components/slider/Slider";
import type { SparklineLabels } from "../components/stat/Sparkline";
import type { TimePickerLabels } from "../components/time-picker/TimePicker";
import type { CommandLabels } from "../components/command/Command";
import type { DescriptionListLabels } from "../components/description-list/DescriptionList";
import type { DialogLabels } from "../components/dialog/Dialog";
import type { FileUploadLabels } from "../components/file-upload/FileUpload";
import type { InputOTPLabels } from "../components/input-otp/InputOTP";
import type { PaginationLabels } from "../components/pagination/Pagination";
import type { ResizableLabels } from "../components/resizable/Resizable";
import type { SearchBarLabels } from "../components/search-bar/SearchBar";
import type { SpinnerLabels } from "../components/spinner/Spinner";
import type { StatLabels } from "../components/stat/Stat";
import type { StepperLabels } from "../components/stepper/Stepper";
import type { ToastLabels } from "../components/toast/Toaster";
import type { TreeViewLabels } from "../components/tree-view/TreeView";
import type { LinkLabels } from "../components/typography/Typography";

export interface UiMessages {
  alertDialog: AlertDialogLabels;
  bottomNavigation: BottomNavigationLabels;
  breadcrumb: BreadcrumbLabels;
  calendar: CalendarLabels;
  carousel: Required<CarouselLabels>;
  chart: ChartLabels;
  chat: ChatLabels;
  chip: ChipLabels;
  combobox: ComboboxLabels;
  command: CommandLabels;
  dataTable: DataTableLabels;
  datePicker: DatePickerLabels;
  descriptionList: DescriptionListLabels;
  dialog: DialogLabels;
  fileUpload: FileUploadLabels;
  inputOtp: InputOTPLabels;
  link: LinkLabels;
  numberInput: NumberInputLabels;
  pagination: Required<PaginationLabels>;
  rating: RatingLabels;
  resizable: ResizableLabels;
  searchBar: SearchBarLabels;
  sidebar: SidebarLabels;
  slider: SliderLabels;
  sparkline: SparklineLabels;
  spinner: SpinnerLabels;
  stat: StatLabels;
  stepper: StepperLabels;
  timePicker: TimePickerLabels;
  toast: ToastLabels;
  treeView: TreeViewLabels;
}

/** Catalogue fourni à `LocaleProvider` : chaque espace de noms et chaque clé sont facultatifs. */
export type UiMessagesInput = { [K in keyof UiMessages]?: Partial<UiMessages[K]> };
