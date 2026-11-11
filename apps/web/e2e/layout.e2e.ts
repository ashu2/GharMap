import { expect, test } from '@playwright/test';
import { dialog, findBox, h1, isDesktop, mainNav } from './helpers';

const dock = (page: import('@playwright/test').Page) => page.getByRole('complementary', { name: 'Find' });

test('phone: find dock at the bottom, nav icons at the top, forms get the whole screen', async ({ page }, info) => {
  test.skip(isDesktop(info), 'phone layout only');
  await page.goto('/');
  const viewport = page.viewportSize()!;

  const box = (await dock(page).boundingBox())!;
  expect(box.y + box.height).toBeCloseTo(viewport.height, -1);
  expect(box.width).toBeCloseTo(viewport.width, -1);
  const search = (await findBox(page).boundingBox())!;
  expect(search.y).toBeGreaterThan(viewport.height * 0.7);

  const nav = (await mainNav(page).boundingBox())!;
  expect(nav.y).toBeLessThan(40);
  expect(nav.x + nav.width).toBeGreaterThan(viewport.width - 40);
  await expect(page.locator('.rail-brand')).toBeHidden();

  // Deeper screens have a back button instead of the nav; forms hide the dock.
  await page.goto('/space/kitchen');
  await expect(mainNav(page)).toBeHidden();
  await expect(dock(page)).toBeVisible();
  await page.goto('/item/i0');
  await expect(dock(page)).toBeHidden();

  // The place picker is a bottom sheet.
  await page.getByRole('button', { name: 'Move', exact: true }).click();
  const sheet = (await dialog(page).boundingBox())!;
  expect(sheet.y + sheet.height).toBeCloseTo(viewport.height, -1);
});

test('desktop: find rail on the left, three map columns, centred dialog', async ({ page }, info) => {
  test.skip(!isDesktop(info), 'desktop layout only');
  await page.goto('/');
  const viewport = page.viewportSize()!;

  const rail = (await dock(page).boundingBox())!;
  expect(rail.x).toBe(0);
  expect(rail.y).toBe(0);
  expect(rail.width).toBe(340);
  const nav = (await mainNav(page).boundingBox())!;
  expect(nav.x).toBe(0);
  expect(nav.y + nav.height).toBeCloseTo(viewport.height, -1);
  await expect(page.locator('.rail-brand')).toBeVisible();
  await expect(mainNav(page).getByRole('link', { name: 'Settings' })).toContainText('Settings');

  // Content sits to the right of the rail, and the find bar is above the chips.
  const heading = (await h1(page).boundingBox())!;
  expect(heading.x).toBeGreaterThan(rail.width);
  const search = (await findBox(page).boundingBox())!;
  const chip = (await page.getByRole('button', { name: 'passport' }).boundingBox())!;
  expect(search.y).toBeLessThan(chip.y);
  await expect(page.locator('.map-col')).toHaveCount(3);

  // The rail stays on every screen.
  await page.goto('/item/i0');
  await expect(dock(page)).toBeVisible();
  await page.getByRole('button', { name: 'Move', exact: true }).click();
  const box = (await dialog(page).boundingBox())!;
  expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(40);
  expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThan(40);
});

test('nav marks the current section', async ({ page }) => {
  await page.goto('/');
  await expect(mainNav(page).getByRole('link', { name: 'Map' })).toHaveAttribute('aria-current', 'page');
  await mainNav(page).getByRole('link', { name: 'Settings' }).click();
  await expect(h1(page)).toHaveText('Settings');
  await expect(mainNav(page).getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
  await expect(mainNav(page).getByRole('link', { name: 'Map' })).not.toHaveAttribute('aria-current', 'page');
  await mainNav(page).getByRole('link', { name: 'Map' }).click();
  await expect(h1(page)).toHaveText('Gurgaon Flat');
});

test('no console errors across the main screens', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push(e.message));
  const paths = [
    '/', '/space/kitchen', '/space/fridge-top', '/item/i0', '/fill/bd-1', '/edit/master', '/assets', '/settings', '/welcome', '/start',
  ];
  for (const path of paths) {
    await page.goto(path);
    await expect(h1(page)).toBeVisible();
  }
  await page.goto('/item/i0');
  await page.getByRole('button', { name: 'Move', exact: true }).click();
  await expect(dialog(page, 'Choose a place')).toBeVisible();
  expect(errors).toEqual([]);
});
