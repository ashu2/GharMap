import { expect, type Page, type TestInfo } from '@playwright/test';

export const isDesktop = (info: TestInfo) => info.project.name === 'desktop';

export const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main' });

/** The open bottom sheet (phone) or dialog (desktop). */
export const dialog = (page: Page, name?: string) => page.getByRole('dialog', name ? { name } : undefined);

export async function openAdd(page: Page) {
  await mainNav(page).getByRole('button', { name: /^Add/ }).click();
  await expect(dialog(page, 'Add item')).toBeVisible();
}

export const nameInput = (page: Page) => page.getByLabel('What is it?');

export const toast = (page: Page) => page.locator('.toast');

export const itemRow = (page: Page, name: string) => page.locator('.item-row', { hasText: name });

export const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

/** Opens the place picker from the add sheet and picks a place by its label within a room. */
export async function pickPlace(page: Page, label: string) {
  await expect(dialog(page, 'Choose a place')).toBeVisible();
  await dialog(page, 'Choose a place').getByRole('button', { name: label, exact: true }).click();
}
