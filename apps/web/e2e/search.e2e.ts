import { expect, test } from '@playwright/test';
import { dialog, h1, itemRow, mainNav, nameInput } from './helpers';

const searchBox = (page: import('@playwright/test').Page) => page.getByRole('searchbox', { name: 'Search items' });

test('search finds items by name and by notes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Find anything/ }).click();
  await expect(searchBox(page)).toBeFocused();

  await searchBox(page).fill('passport');
  await expect(page.getByText('1 match')).toBeVisible();
  await expect(page.locator('.result-path')).toHaveText('Master Bedroom › Wooden Almirah › Right Side');

  // "blue folder" only appears in the Passports notes.
  await searchBox(page).fill('blue folder');
  await expect(page.locator('.result-name')).toHaveText(['Passports']);

  // Names starting with the query rank first.
  await searchBox(page).fill('sh');
  await expect(page.locator('.result-name').first()).toHaveText(/^Sh/);
});

test('often-searched chips and clear', async ({ page }) => {
  await page.goto('/search');
  await page.getByRole('button', { name: 'medicines' }).click();
  await expect(searchBox(page)).toHaveValue('medicines');
  await expect(page.locator('.result-name')).toHaveText(['Medicines']);

  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(searchBox(page)).toHaveValue('');
  await expect(searchBox(page)).toBeFocused();
  await page.keyboard.type('remote');
  await expect(page.locator('.result-name')).toHaveText(['Remote Controls']);
});

test('query survives switching tabs', async ({ page }) => {
  await page.goto('/search');
  await searchBox(page).fill('charger');
  await mainNav(page).getByRole('link', { name: 'Map' }).click();
  await mainNav(page).getByRole('link', { name: 'Search' }).click();
  await expect(searchBox(page)).toHaveValue('charger');
});

test('a result lights up its path on the map', async ({ page }) => {
  await page.goto('/search');
  await searchBox(page).fill('passport');
  await page.locator('.result', { hasText: 'Passports' }).click();

  await expect(page).toHaveURL('/');
  const found = page.locator('.found-card');
  await expect(found).toContainText('Passports');
  await expect(found).toContainText('Master Bedroom › Wooden Almirah › Right Side');
  await expect(page.locator('.room-card[data-lit]')).toHaveAttribute('aria-label', 'Master Bedroom');
  await expect(page.locator('.unit[data-lit]')).toContainText('Wooden Almirah');
  await expect(page.locator('.comp[data-lit]')).toHaveText('Right Side · Passports');

  // The highlight follows into the space views.
  await page.locator('.unit', { hasText: 'Wooden Almirah' }).click();
  await expect(page.locator('.tile[data-lit]')).toContainText('Has Passports');
  await page.goBack();

  await found.getByRole('button', { name: 'Open that shelf' }).click();
  await expect(h1(page)).toHaveText('Right Side');
  await expect(itemRow(page, 'Passports')).toHaveAttribute('data-lit', 'true');
  await page.goBack();

  await found.getByRole('button', { name: 'Item details' }).click();
  await expect(h1(page)).toHaveText('Passports');
  await page.goBack();

  await page.getByRole('button', { name: 'Clear highlight' }).click();
  await expect(found).toBeHidden();
  await expect(page.locator('[data-lit]')).toHaveCount(0);
});

test('no results offers to add the item', async ({ page }) => {
  await page.goto('/search');
  await searchBox(page).fill('Umbrella');
  await expect(page.getByText('Nothing called “Umbrella” yet')).toBeVisible();

  await page.getByRole('button', { name: 'Add “Umbrella”' }).click();
  await expect(dialog(page, 'Add item')).toBeVisible();
  await expect(nameInput(page)).toHaveValue('Umbrella');
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(dialog(page)).toBeHidden();
  await expect(page.locator('.result-name')).toHaveText(['Umbrella']);
});
