import { act, render, renderHook, screen } from "@testing-library/react";
import { useControllableState } from "./useControllableState";
import { useMediaQuery } from "./useMediaQuery";

describe("useControllableState", () => {
  it("non contrôlé : garde sa valeur et prévient", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
    act(() => result.current[1]((v) => v + 1));
    expect(result.current[0]).toBe(3);
  });

  it("contrôlé : suit la prop, ne change que par le parent", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useControllableState({ value, defaultValue: 0, onChange }), {
      initialProps: { value: 5 },
    });
    act(() => result.current[1](6));
    expect(onChange).toHaveBeenCalledWith(6);
    expect(result.current[0]).toBe(5);
    rerender({ value: 6 });
    expect(result.current[0]).toBe(6);
  });

  it("n'appelle pas onChange si la valeur ne change pas", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: "a", onChange }));
    act(() => result.current[1]("a"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("useMediaQuery", () => {
  it("lit la media query et suit ses changements", async () => {
    let matches = false;
    const listeners = new Set<() => void>();
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, l: () => void) => listeners.add(l),
      removeEventListener: (_: string, l: () => void) => listeners.delete(l),
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    function Probe() {
      const compact = useMediaQuery("(max-width: 640px)");
      return <span>{compact ? "compact" : "large"}</span>;
    }
    render(<Probe />);
    expect(screen.getByText("large")).toBeInTheDocument();
    act(() => {
      matches = true;
      listeners.forEach((l) => l());
    });
    expect(screen.getByText("compact")).toBeInTheDocument();
    window.matchMedia = original;
  });
});
