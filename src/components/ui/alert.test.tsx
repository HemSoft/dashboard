import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("renders with default variant", () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test Description</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Test Title")).toBeDefined();
    expect(screen.getByText("Test Description")).toBeDefined();
  });

  it("renders with destructive variant", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("text-destructive");
  });

  it("applies custom className", () => {
    render(
      <Alert className="custom-class">
        <AlertTitle>Title</AlertTitle>
      </Alert>
    );

    expect(screen.getByRole("alert").className).toContain("custom-class");
  });

  it("AlertTitle applies custom className", () => {
    render(
      <Alert>
        <AlertTitle className="title-class">Title</AlertTitle>
      </Alert>
    );

    expect(screen.getByText("Title").className).toContain("title-class");
  });

  it("AlertDescription applies custom className", () => {
    render(
      <Alert>
        <AlertDescription className="desc-class">Description</AlertDescription>
      </Alert>
    );

    expect(screen.getByText("Description").className).toContain("desc-class");
  });
});
