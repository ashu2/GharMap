import { expect, test } from '@playwright/test';
import { dialog, isDesktop, mainNav, openAdd } from './helpers';

test('phone: tab bar at the bottom, add opens a bottom sheet', async ({ page }, info) => {
  test.skip(isDesktop(info), 'phone layout only');
  await page.goto('/');
  const viewport = page.viewportSize()!;

  const nav = (await mainNav(page).boundingBox())!;
  expect(nav.y + nav.height).toBeCloseTo(viewport.height, -1);
  expect(nav.width).toBeCloseTo(viewport.width, -1);
  await expect(page.locator('.nav-brand')).toBeHidden();
  await expect(mainNav(page).getByRole('button', { name: /^Add$/ })).toBeVisible();

  await openAdd(page);
  const sheet = (await dialog(page).boundingBox())!;
  expect(sheet.y + sheet.height).toBeCloseTo(viewport.height, -1);
});

test('desktop: sidebar nav, three map columns, centred dialog', async ({ page }, info) => {
  test.skip(!isDesktop(info), 'desktop layout only');
  await page.goto('/');
  const viewport = page.viewportSize()!;

  const nav = (await mainNav(page).boundingBox())!;
  expect(nav.x).toBe(0);
  expect(nav.height).toBeCloseTo(viewport.height, -1);
  expect(nav.width).toBeLessThan(300);
  await expect(page.locator('.nav-brand')).toBeVisible();
  await expect(mainNav(page).getByRole('button', { name: 'Add item' })).toBeVisible();

  // Content sits to the right of the sidebar.
  const heading = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
  expect(heading.x).toBeGreaterThan(nav.width);

  await expect(page.locator('.map-col')).toHaveCount(3);

  await openAdd(page);
  const box = (await dialog(page).boundingBox())!;
  expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(40);
  expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThan(40);
});

test('nav marks the current tab', async ({ page }) => {
  await page.goto('/space/kitchen');
  await expect(mainNav(page).getByRole('link', { name: 'Map' })).toHaveAttribute('aria-current', 'page');
  await mainNav(page).getByRole('link', { name: 'Settings' }).click();
  await expect(mainNav(page).getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
  await expect(mainNav(page).getByRole('link', { name: 'Map' })).not.toHaveAttribute('aria-current', 'page');
});

test('no console errors across the main screens', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push(e.message));
  for (const path of ['/', '/space/kitchen', '/space/fridge-top', '/item/i0', '/search', '/settings']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  await openAdd(page);
  expect(errors).toEqual([]);
});
