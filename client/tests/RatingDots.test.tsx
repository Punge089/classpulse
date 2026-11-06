// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

afterEach(cleanup);

test("TEST-54 rating exposes five radios, supports arrows and ignores read-only input", async () => {
  const { RatingDots } = await import("../src/components/pulse/RatingDots");
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { rerender } = render(<RatingDots value={3} name="rating" onChange={onChange} />);
  expect(screen.getAllByRole("radio")).toHaveLength(5);
  for (let value = 1; value <= 5; value++) {
    expect(screen.getByRole("radio", { name: "Rating " + value + " of 5" })).toBeTruthy();
  }
  expect((screen.getByRole("radio", { name: "Rating 3 of 5" }) as HTMLInputElement).checked).toBe(true);

  await user.click(screen.getByRole("radio", { name: "Rating 4 of 5" }));
  expect(onChange).toHaveBeenLastCalledWith(4);
  rerender(<RatingDots value={4} name="rating" onChange={onChange} />);
  await user.keyboard("{ArrowRight}");
  expect(onChange).toHaveBeenLastCalledWith(5);

  onChange.mockClear();
  rerender(<RatingDots value={4} name="rating" onChange={onChange} readOnly />);
  await user.click(screen.getByRole("radio", { name: "Rating 2 of 5" }));
  await user.keyboard("{ArrowLeft}{Space}");
  expect(onChange).not.toHaveBeenCalled();
  expect((screen.getByRole("radio", { name: "Rating 4 of 5" }) as HTMLInputElement).checked).toBe(true);
});
