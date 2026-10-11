import { arMA } from "react-day-picker/locale";
import { formatFileSize } from "../../components/file-upload/FileUpload";
import type { UiMessages } from "../messages";

/*
 * Catalogue arabe (ar-MA : chiffres latins, comme au Maroc). À passer avec la
 * locale et le sens de lecture :
 *   <ThemeProvider dir="rtl">
 *     <LocaleProvider locale="ar-MA" messages={localeAr}>…</LocaleProvider>
 *   </ThemeProvider>
 * À faire relire par un locuteur natif avant une mise en production.
 */

const LOCALE = "ar-MA";
const n = (value: number) => value.toLocaleString(LOCALE);
const rules = new Intl.PluralRules("ar");

/** L'arabe a six formes : zéro, un, deux, quelques (3–10), beaucoup (11–99), autre. */
function plural(count: number, forms: { zero?: string; one: string; two: string; few: string; many: string; other?: string }) {
  const form = rules.select(count) as keyof typeof forms;
  return forms[form] ?? forms.other ?? forms.many;
}
const UNITS = ["بايت", "ك.ب", "م.ب", "ج.ب", "ت.ب"] as const;

export const localeAr: UiMessages = {
  alertDialog: { cancel: "إلغاء" },
  bottomNavigation: {
    label: "التنقل الرئيسي",
    badgeNew: "جديد",
    badgeCount: (count) =>
      plural(count, {
        one: "عنصر جديد واحد",
        two: "عنصران جديدان",
        few: `${n(count)} عناصر جديدة`,
        many: `${n(count)} عنصرًا جديدًا`,
        other: `${n(count)} عنصر جديد`,
      }),
    badgeOverflow: (max) => `أكثر من ${n(max)} عنصر جديد`,
  },
  breadcrumb: { label: "مسار التنقل", more: "مستويات أخرى" },
  calendar: { locale: arMA },
  carousel: {
    carousel: "عرض دوّار",
    slide: "شريحة",
    slidePosition: (position, count) => `${n(position)} من ${n(count)}`,
    previous: "الشريحة السابقة",
    next: "الشريحة التالية",
    dots: "اختيار شريحة",
    goTo: (position) => `الانتقال إلى الشريحة ${n(position)}`,
    status: (position, count) => `الشريحة ${n(position)} من ${n(count)}`,
  },
  chart: {
    category: "الفئة",
    legend: (title) => `مفتاح الرسم: ${title}`,
    keyboardHint: "استخدم مفاتيح الأسهم لتصفح القيم؛ البيانات الكاملة في الجدول التالي.",
    roleDescription: "رسم بياني",
    total: "المجموع",
    other: "أخرى",
    label: "التسمية",
    value: "القيمة",
    share: "النسبة",
  },
  chat: {
    me: "أنت",
    sending: "جارٍ الإرسال…",
    sent: "تم الإرسال",
    read: "تمت القراءة",
    failed: "لم يُرسَل",
    retry: "إعادة المحاولة",
    newMessages: "رسائل جديدة",
    scrollToBottom: "الانتقال إلى آخر الرسائل",
    conversation: "محادثة",
    today: "اليوم",
    yesterday: "أمس",
    typing: (name) => (name ? `${name} يكتب…` : "جارٍ الكتابة…"),
    send: "إرسال",
    placeholder: "اكتب رسالة…",
    composer: "رسالة",
  },
  chip: { remove: (label) => (label ? `إزالة ${label}` : "إزالة") },
  combobox: {
    placeholder: "اختر…",
    searchPlaceholder: "بحث…",
    empty: "لا توجد نتائج",
    list: "الخيارات",
    selectedCount: (count) =>
      plural(count, {
        one: "عنصر واحد محدد",
        two: "عنصران محددان",
        few: `${n(count)} عناصر محددة`,
        many: `${n(count)} عنصرًا محددًا`,
        other: `${n(count)} عنصر محدد`,
      }),
  },
  command: { title: "لوحة الأوامر", description: "ابحث عن أمر أو صفحة." },
  dataTable: {
    searchPlaceholder: "بحث…",
    searchLabel: "البحث في الجدول",
    reset: "إعادة التعيين",
    columns: "الأعمدة",
    columnsMenuTitle: "الأعمدة المعروضة",
    showAllColumns: "إظهار الكل",
    hiddenColumns: (count) => ` (${n(count)} مخفية)`,
    density: "الكثافة",
    densityCompact: "مضغوطة",
    densityDefault: "عادية",
    densityComfortable: "مريحة",
    exportCsv: "تصدير",
    selectAll: "تحديد الكل",
    selectRow: (rowLabel) => `تحديد ${rowLabel}`,
    rowFallback: (index) => `الصف ${n(index + 1)}`,
    selectedCount: (count) =>
      plural(count, {
        zero: "لا صفوف محددة",
        one: "صف واحد محدد",
        two: "صفان محددان",
        few: `${n(count)} صفوف محددة`,
        many: `${n(count)} صفًا محددًا`,
        other: `${n(count)} صف محدد`,
      }),
    selectAllRows: (count) => `تحديد جميع الصفوف (${n(count)})`,
    clearSelection: "إلغاء التحديد",
    selectionCleared: "تم إلغاء التحديد",
    bulkActions: "إجراءات على العناصر المحددة",
    actions: "إجراءات",
    rowActions: (rowLabel) => `إجراءات ${rowLabel}`,
    columnMenu: (title) => `خيارات العمود ${title}`,
    sortAscending: "ترتيب تصاعدي",
    sortDescending: "ترتيب تنازلي",
    clearSorting: "إزالة الترتيب",
    hideColumn: "إخفاء العمود",
    facetPrefix: "تصفية: ",
    facetSearch: (title) => `تصفية: ${title}`,
    facetEmpty: "لا توجد خيارات",
    facetSummary: (title, selected) => `${title} · ${selected.length === 1 ? selected[0] : n(selected.length)}`,
    facetSelected: () => " محدد",
    rowsPerPage: "صفوف في الصفحة",
    range: (from, to, total) => (total === 0 ? "0 من 0" : `${n(from)}–${n(to)} من ${n(total)}`),
    emptyTitle: "لا توجد بيانات",
    emptyDescription: "ستظهر الصفوف هنا فور إضافتها.",
    noResultsTitle: "لا توجد نتائج",
    noResultsDescription: "لا يطابق أي صف البحث أو عوامل التصفية.",
    clearFilters: "مسح عوامل التصفية",
    loading: "جارٍ التحميل…",
    results: (count) =>
      plural(count, {
        zero: "لا نتائج",
        one: "نتيجة واحدة",
        two: "نتيجتان",
        few: `${n(count)} نتائج`,
        many: `${n(count)} نتيجة`,
        other: `${n(count)} نتيجة`,
      }),
    yes: "نعم",
    no: "لا",
  },
  datePicker: {
    placeholder: "اختر تاريخًا",
    clear: "مسح التاريخ",
    trigger: "اختر تاريخًا",
    dialog: "اختر تاريخًا",
    today: "اليوم",
    rangePlaceholder: "اختر فترة",
    rangeClear: "مسح التواريخ",
    rangeTrigger: "اختر فترة",
    rangeDialog: "اختر فترة",
    presets: "الفترات",
    pending: (from) => `من ${from} — اختر تاريخ النهاية`,
    presetLabels: {
      last7Days: "آخر 7 أيام",
      last30Days: "آخر 30 يومًا",
      thisMonth: "هذا الشهر",
      lastMonth: "الشهر الماضي",
      thisYear: "هذه السنة",
    },
  },
  descriptionList: { copy: "نسخ", copied: "تم النسخ" },
  dialog: { close: "إغلاق" },
  fileUpload: {
    title: "أفلِت ملفاتك هنا",
    browse: (
      <>
        أو <span className="ui-dropzone__link">تصفّح ملفاتك</span>
      </>
    ),
    dragActive: "أفلِت للرفع",
    dragReject: "نوع الملف غير مقبول",
    invalidType: "نوع الملف غير مقبول",
    tooLarge: (maxSize) => `الملف كبير جدًا (الحد الأقصى ${formatFileSize(maxSize, { locale: LOCALE, units: UNITS })})`,
    tooMany: (maxFiles) =>
      maxFiles <= 0
        ? "تم بلوغ الحد الأقصى لعدد الملفات"
        : maxFiles === 1
          ? "ملف واحد فقط في كل مرة"
          : `عدد الملفات كبير جدًا (الحد الأقصى ${n(maxFiles)})`,
    accepted: (count) =>
      plural(count, {
        one: "تمت إضافة ملف واحد",
        two: "تمت إضافة ملفين",
        few: `تمت إضافة ${n(count)} ملفات`,
        many: `تمت إضافة ${n(count)} ملفًا`,
        other: `تمت إضافة ${n(count)} ملف`,
      }),
    rejected: (count) =>
      plural(count, {
        one: "تم رفض ملف واحد",
        two: "تم رفض ملفين",
        few: `تم رفض ${n(count)} ملفات`,
        many: `تم رفض ${n(count)} ملفًا`,
        other: `تم رفض ${n(count)} ملف`,
      }),
    remove: (name) => `إزالة ${name}`,
    cancel: (name) => `إلغاء رفع ${name}`,
    retry: "إعادة المحاولة",
    retryLabel: (name) => `إعادة محاولة رفع ${name}`,
    progress: (name) => `جارٍ رفع ${name}`,
    done: "تم الرفع",
    error: "فشل الرفع",
    compactTitle: "اسحب ملفاتك إلى هنا",
    compactBrowse: "تصفّح",
    sizeUnits: UNITS,
    kinds: { images: "صور", videos: "مقاطع فيديو", audio: "صوت", text: "نص" },
    maxSizeHint: (size) => `${size} كحد أقصى`,
    maxFilesHint: (count) =>
      plural(count, {
        one: "ملف واحد كحد أقصى",
        two: "ملفان كحد أقصى",
        few: `${n(count)} ملفات كحد أقصى`,
        many: `${n(count)} ملفًا كحد أقصى`,
        other: `${n(count)} ملف كحد أقصى`,
      }),
  },
  inputOtp: { label: "رمز التحقق" },
  link: { newTab: "يُفتح في علامة تبويب جديدة" },
  numberInput: { decrement: "إنقاص", increment: "زيادة" },
  pagination: {
    nav: "ترقيم الصفحات",
    previous: "الصفحة السابقة",
    next: "الصفحة التالية",
    page: (page) => `الصفحة ${n(page)}`,
    status: (page, total) => `الصفحة ${n(page)} من ${n(total)}`,
  },
  rating: {
    label: "التقييم",
    valueText: (_value, formatted, max) => `${formatted} من ${n(max)}`,
  },
  resizable: { handle: "تغيير حجم اللوحات" },
  searchBar: { clear: "مسح البحث" },
  sidebar: {
    label: "الشريط الجانبي",
    show: "إظهار الشريط الجانبي",
    hide: "إخفاء الشريط الجانبي",
    toggle: "إظهار / إخفاء الشريط الجانبي",
  },
  slider: { value: "القيمة", min: "الحد الأدنى", max: "الحد الأقصى", valueOf: (position, count) => `القيمة ${n(position)} من ${n(count)}` },
  sparkline: {
    empty: "الاتجاه: لا توجد بيانات",
    trend: (from, to, count, period) => `الاتجاه: من ${from} إلى ${to} خلال ${n(count)} ${period}`,
    period: "فترات",
  },
  spinner: { label: "جارٍ التحميل" },
  stat: {
    increase: "ارتفاع بنسبة",
    decrease: "انخفاض بنسبة",
    unchanged: "مستقر",
    favorable: "إيجابي",
    unfavorable: "سلبي",
    trendPeriod: "أشهر",
  },
  stepper: {
    step: (position, count) => `الخطوة ${n(position)} من ${n(count)}`,
    complete: "مكتملة",
    error: "بها خطأ",
    label: "الخطوات",
  },
  timePicker: { list: "الأوقات المقترحة", placeholder: "hh:mm", time: "الوقت", date: "التاريخ", dateTime: "التاريخ والوقت" },
  toast: { close: "إغلاق الإشعار", region: "الإشعارات" },
  treeView: {
    loading: (label) => `جارٍ تحميل محتوى ${label}…`,
    error: (label) => `تعذّر تحميل محتوى ${label}. أعد فتح المجلد للمحاولة مجددًا.`,
    errorHint: "فشل التحميل",
  },
};
