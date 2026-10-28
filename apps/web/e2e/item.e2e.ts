import { expect, test } from '@playwright/test';
import { h1, pickPlace, toast } from './helpers';

test('quantity stops at zero and notes persist', async ({ page }) => {
  await page.goto('/item/i0');
  await expect(h1(page)).toHaveText('Milk');
  const qty = page.locator('.step-val');
  await expect(qty).toHaveText('2 L');

  const dec = page.getByRole('button', { name: 'Decrease quantity' });
  await dec.click();
  await dec.click();
  await dec.click();
  await expect(qty).toHaveText('0 L');
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(qty).toHaveText('1 L');

  const notes = page.getByLabel('Notes');
  await notes.fill('Amul toned, back of shelf');
  await page.reload();
  await expect(qty).toHaveText('1 L');
  await expect(notes).toHaveValue('Amul toned, back of shelf');

  // Notes are searchable.
  await page.goto('/search');
  await page.getByRole('searchbox').fill('amul');
  await expect(page.locator('.result-name')).toHaveText(['Milk']);
});

test('moving an item updates its place, history and map highlight', async ({ page }) => {
  await page.goto('/item/i42');
  await expect(h1(page)).toHaveText('Passports');
  await expect(page.locator('.history li')).toHaveCount(1);

  await page.getByRole('button', { name: 'Move' }).click();
  await expect(page.getByRole('heading', { name: 'Move to…' })).toBeVisible();
  await pickPlace(page, 'Bed Drawer › Left Drawer');

  await expect(toast(page)).toContainText('Moved to Master Bedroom › Bed Drawer › Left Drawer');
  await expect(page.locator('.location')).toHaveText('Master Bedroom › Bed Drawer › Left Drawer');
  await expect(page.locator('.history li').first()).toHaveText(
    'Moved from Master Bedroom › Wooden Almirah › Right Side',
  );
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Bed Drawer');

  await page.getByRole('button', { name: 'Show on map' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.comp[data-lit]')).toHaveText('Left Drawer · Passports');

  await page.reload();
  await page.goto('/space/wa-right');
  await expect(page.getByText('2 items inside')).toBeVisible();
});

test('moving to the same place changes nothing', async ({ page }) => {
  await page.goto('/item/i42');
  await page.getByRole('button', { name: 'Move' }).click();
  await pickPlace(page, 'Wooden Almirah › Right Side');
  await expect(page.locator('.history li')).toHaveCount(1);
  await expect(toast(page)).toBeHidden();
});
