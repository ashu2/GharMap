import { expect, type Page, type TestInfo } from '@playwright/test';

export const isDesktop = (info: TestInfo) => info.project.name === 'desktop';

export const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main' });

/** The open bottom sheet (phone) or dialog (desktop). */
export const dialog = (page: Page, name?: string) => page.getByRole('dialog', name ? { name } : undefined);

export const toast = (page: Page) => page.locator('.toast');

export const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

/** The find bar: bottom dock on phones, left rail on desktop. */
export const findBox = (page: Page) => page.getByRole('searchbox', { name: 'Find anything in your home' });

/** The answer card that appears in the dock when something is found. */
export const answer = (page: Page) => page.getByRole('region', { name: 'Where it is' });

/** A cupboard drawn in the room view. */
export const cupboard = (page: Page, name: string) => page.getByRole('region', { name, exact: true });

/** A thing's chip in the room view. */
export const thing = (page: Page, name: string) => page.locator('.thing', { hasText: name });

export const roomCard = (page: Page, name: string) => page.locator('.room-card', { hasText: name });

/** The name field on the fill-a-shelf screen. */
export const fillInput = (page: Page) => page.getByLabel('Name of the thing');

/** Picks a place in the open place picker by its label within a room. */
export async function pickPlace(page: Page, label: string) {
  await expect(dialog(page, 'Choose a place')).toBeVisible();
  await dialog(page, 'Choose a place').getByRole('button', { name: label, exact: true }).click();
}
