import { expect, test } from '@playwright/test';
import { cupboard, h1, isDesktop, roomCard, thing } from './helpers';

test('map shows every room with its count', async ({ page }, info) => {
  await page.goto('/');
  await expect(h1(page)).toHaveText('Gurgaon Flat');
  await expect(page.getByText('65 things · 6 rooms')).toBeVisible();

  await expect(page.locator('.room-card')).toHaveCount(6);
  await expect(roomCard(page, 'Kitchen').locator('.room-count')).toHaveText('21');
  await expect(roomCard(page, 'Kitchen')).toContainText('Top Shelf · Middle Shelf · Veg Tray');
  await expect(page.locator('.map-col')).toHaveCount(isDesktop(info) ? 3 : 2);
});

test('a room shows every cupboard, shelf and thing at once', async ({ page }) => {
  await page.goto('/');
  await roomCard(page, 'Master Bedroom').click();
  await expect(page).toHaveURL('/space/master');
  await expect(h1(page)).toHaveText('Master Bedroom');
  await expect(page.getByText('Gurgaon Flat · 15 things')).toBeVisible();

  await expect(cupboard(page, 'Wooden Almirah').locator('.shelf')).toHaveCount(3);
  await expect(cupboard(page, 'Bed Drawer').locator('.shelf')).toHaveCount(2);
  const right = cupboard(page, 'Wooden Almirah').locator('.shelf', { hasText: 'Right Side' });
  await expect(right.locator('.thing')).toHaveText(['Jewellery Box', 'Documents Folder', 'Passports× 2']);

  // A thing opens its page; Back returns to the room, then to the map.
  await thing(page, 'Passports').click();
  await expect(h1(page)).toHaveText('Passports');
  await page.getByRole('link', { name: 'Back' }).click();
  await expect(h1(page)).toHaveText('Master Bedroom');
  await page.getByRole('link', { name: 'Back' }).click();
  await expect(page).toHaveURL('/');
});

test('drill into a cupboard and a single shelf, and back out', async ({ page }) => {
  await page.goto('/space/master');
  await page.getByRole('link', { name: 'Wooden Almirah' }).click();
  await expect(page).toHaveURL('/space/wood-almirah');
  await expect(h1(page)).toHaveText('Wooden Almirah');
  await expect(page.getByText('Master Bedroom · 9 things')).toBeVisible();
  await expect(page.locator('.cupboard')).toHaveCount(3);

  await page.getByRole('link', { name: 'Right Side', exact: true }).click();
  await expect(h1(page)).toHaveText('Right Side');
  await expect(page.locator('.shelf')).toHaveCount(1);
  await expect(page.locator('.shelf-name')).toHaveText('Inside');
  await expect(page.locator('.thing')).toHaveCount(3);

  await page.goBack();
  await expect(h1(page)).toHaveText('Wooden Almirah');
  await page.getByRole('link', { name: 'Back' }).click();
  await expect(h1(page)).toHaveText('Master Bedroom');
});

test('broken links are handled', async ({ page }) => {
  await page.goto('/item/does-not-exist');
  await expect(page.getByText('This item no longer exists')).toBeVisible();
  await page.getByRole('link', { name: 'Back to the map' }).click();
  await expect(h1(page)).toHaveText('Gurgaon Flat');

  for (const path of ['/space/does-not-exist', '/fill/does-not-exist', '/edit/does-not-exist', '/fill/home']) {
    await page.goto(path);
    await expect(page.getByText('This place no longer exists')).toBeVisible();
  }

  await page.goto('/space/home');
  await expect(page).toHaveURL('/');

  await page.goto('/some/random/path');
  await expect(h1(page)).toHaveText('Gurgaon Flat');
});
