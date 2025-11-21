import { test, expect } from "@playwright/test";

test.describe("MediTrack AI UI smoke tests", () => {
  test("landing page renders hero copy", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Cloud-Based Multi-Agent Medical Record Intelligence/i
      })
    ).toBeVisible();
    await expect(page.getByText("Docling powered ingestion")).toBeVisible();
  });

  test("upload page shows patient id input", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByLabel("Patient ID")).toBeVisible();
    await expect(page.getByRole("button", { name: /Upload & Ingest/i })).toBeEnabled();
  });
});

