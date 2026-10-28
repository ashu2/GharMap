import { expect, test } from '@playwright/test';
import { h1, isDesktop, itemRow } from './helpers';

test('map shows every room with item counts', async ({ page }, info) => {
  await page.goto('/');
  await expect(h1(page)).toHaveText('Gurgaon Flat');
  await expect(page.getByText('65 items in 6 rooms')).toBeVisible();

  const rooms = page.locator('.room-card');
  await expect(rooms).toHaveCount(6);
  await expect(rooms.filter({ hasText: 'Kitchen' }).locator('.room-count')).toHaveText('21');
  await expect(page.locator('.map-col')).toHaveCount(isDesktop(info) ? 3 : 2);
});

test('drill down from room to shelf and back out', async ({ page }) => {
  await page.goto('/');
  await page.locator('.unit', { hasText: 'Wooden Almirah' }).click();
  await expect(page).toHaveURL('/space/wood-almirah');
  await expect(h1(page)).toHaveText('Wooden Almirah');
  await expect(page.locator('.tile')).toHaveCount(3);

  await page.locator('.tile', { hasText: 'Right Side' }).click();
  await expect(h1(page)).toHaveText('Right Side');
  await expect(page.getByText('3 items inside')).toBeVisible();
  await expect(itemRow(page, 'Passports')).toContainText('2');

  // Breadcrumb jumps up two levels.
  await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Master Bedroom' }).click();
  await expect(h1(page)).toHaveText('Master Bedroom');

  // Browser history works.
  await page.goBack();
  await expect(h1(page)).toHaveText('Right Side');

  // In-app back goes to the parent, then to the map from a room.
  await page.getByRole('link', { name: 'Back' }).click();
  await expect(h1(page)).toHaveText('Wooden Almirah');
  await page.getByRole('link', { name: 'Back' }).click();
  await expect(h1(page)).toHaveText('Master Bedroom');
  await page.getByRole('link', { name: 'Back' }).click();
  await expect(page).toHaveURL('/');
});

test('tapping a room header opens the room', async ({ page }) => {
  await page.goto('/');
  await page.locator('.room-head', { hasText: 'Kitchen' }).click();
  await expect(h1(page)).toHaveText('Kitchen');
  await expect(page.locator('.tile')).toHaveCount(3);
});

test('broken links are handled', async ({ page }) => {
  await page.goto('/item/does-not-exist');
  await expect(page.getByText('This item no longer exists')).toBeVisible();
  await page.getByRole('link', { name: 'Back to the map' }).click();
  await expect(h1(page)).toHaveText('Gurgaon Flat');

  await page.goto('/space/does-not-exist');
  await expect(page.getByText('This place no longer exists')).toBeVisible();

  await page.goto('/space/home');
  await expect(page).toHaveURL('/');

  await page.goto('/some/random/path');
  await expect(h1(page)).toHaveText('Gurgaon Flat');
});
