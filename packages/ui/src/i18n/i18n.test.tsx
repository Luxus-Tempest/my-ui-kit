import { render, screen } from "@testing-library/react";
import { axe } from "../../vitest.setup";
import { Calendar } from "../components/calendar/Calendar";
import { MessageDateSeparator } from "../components/chat/Chat";
import { DataTable } from "../components/data-table/DataTable";
import { DatePicker } from "../components/date-picker/DatePicker";
import { Dropzone, formatFileSize } from "../components/file-upload/FileUpload";
import { Pagination } from "../components/pagination/Pagination";
import { SearchBar } from "../components/search-bar/SearchBar";
import { Stat } from "../components/stat/Stat";
import { getLocaleDirection, LocaleProvider, useLocale } from "./LocaleProvider";
import { localeAr } from "./locales/ar";
import { localeEn } from "./locales/en";

const NOW = new Date(2026, 9, 12, 10, 0);

function English({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider locale="en-US" messages={localeEn}>
      {children}
    </LocaleProvider>
  );
}

describe("LocaleProvider", () => {
  it("sans provider, tout est en français (fr-FR)", () => {
    function Locale() {
      return <span>{useLocale()}</span>;
    }
    render(
      <>
        <Locale />
        <SearchBar aria-label="Recherche" defaultValue="budget" />
        <Pagination pageCount={5} />
      </>,
    );
    expect(screen.getByText("fr-FR")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Effacer la recherche" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page suivante" })).toBeInTheDocument();
  });

  it("en anglais : libellés, dates et nombres de plusieurs composants", () => {
    render(
      <English>
        <SearchBar aria-label="Search" defaultValue="budget" />
        <Pagination pageCount={5} />
        <DatePicker aria-label="Due date" />
        <MessageDateSeparator date={NOW} now={NOW} />
        <Stat label="Revenue" value={12_900} delta={0.124} />
        <Dropzone aria-label="Files" accept={["image/png", ".jpg", ".pdf"]} maxSize={10 * 1024 * 1024} />
        <DataTable aria-label="Invoices" columns={[{ accessorKey: "id", header: "Id" }]} data={[{ id: "A" }]} />
      </English>,
    );
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
    // Pagination seule et pagination de la table : les deux en anglais.
    expect(screen.getAllByRole("button", { name: "Next page" })).toHaveLength(2);
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    // Nombre compact et variation dans la locale anglaise.
    expect(screen.getByText("12.9K")).toBeInTheDocument();
    expect(screen.getByText("Up 12.4%, favorable")).toBeInTheDocument();
    // « PNG, JPG ou PDF » devient une disjonction anglaise, la taille prend les unités anglaises.
    expect(screen.getByText("PNG, JPG, or PDF · 10 MB max.")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search the table" })).toBeInTheDocument();
  });

  it("la prop `labels` d'un composant l'emporte sur le catalogue", () => {
    render(
      <English>
        <Pagination pageCount={5} labels={{ next: "Suivante, s'il vous plaît" }} />
      </English>,
    );
    expect(screen.getByRole("button", { name: "Suivante, s'il vous plaît" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
  });

  it("les providers s'emboîtent : l'intérieur ne remplace que ce qu'il précise", () => {
    function Locale() {
      return <span data-testid="locale">{useLocale()}</span>;
    }
    render(
      <English>
        <LocaleProvider messages={{ pagination: { next: "Onward" } }}>
          <Locale />
          <Pagination pageCount={5} />
        </LocaleProvider>
      </English>,
    );
    expect(screen.getByTestId("locale")).toHaveTextContent("en-US");
    expect(screen.getByRole("button", { name: "Onward" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
  });

  it("calendrier : la semaine suit la locale (dimanche en en-US, lundi en français)", () => {
    const { container, unmount } = render(
      <English>
        <Calendar mode="single" defaultMonth={NOW} />
      </English>,
    );
    expect(container.querySelector(".ui-calendar__weekday")).toHaveAttribute("aria-label", "Sunday");
    unmount();
    const fr = render(<Calendar mode="single" defaultMonth={NOW} />);
    expect(fr.container.querySelector(".ui-calendar__weekday")).toHaveAttribute("aria-label", "lundi");
  });

  it("arabe : sens de lecture et pluriels (un, deux, quelques, beaucoup)", () => {
    expect(getLocaleDirection("ar-MA")).toBe("rtl");
    expect(getLocaleDirection("he")).toBe("rtl");
    expect(getLocaleDirection("fr-FR")).toBe("ltr");
    expect(getLocaleDirection("en")).toBe("ltr");
    const results = localeAr.dataTable.results;
    expect(results(1)).toBe("نتيجة واحدة");
    expect(results(2)).toBe("نتيجتان");
    expect(results(3)).toBe("3 نتائج");
    expect(results(11)).toBe("11 نتيجة");
  });

  it("formatFileSize : locale et unités", () => {
    expect(formatFileSize(1_258_291)).toBe("1,2\u00a0Mo");
    expect(formatFileSize(1_258_291, { locale: "en-US", units: ["B", "KB", "MB", "GB", "TB"] })).toBe("1.2\u00a0MB");
  });

  it("sans violation d'accessibilité en anglais", async () => {
    const { container } = render(
      <English>
        <SearchBar aria-label="Search" defaultValue="budget" />
        <Pagination pageCount={5} />
      </English>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
