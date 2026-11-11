import { expect, test } from '@playwright/test';
import { cupboard, fillInput, h1, thing } from './helpers';

const rows = (page: import('@playwright/test').Page) => page.locator('.fill-row');

test('fill a shelf: Enter adds, commas add several, x2 sets the quantity', async ({ page }) => {
  await page.goto('/space/master');
  await cupboard(page, 'Bed Drawer').getByRole('link', { name: 'Add things to Left Drawer' }).click();
  await expect(page).toHaveURL('/fill/bd-1');
  await expect(h1(page)).toHaveText('Left Drawer');
  await expect(page.getByText('Master Bedroom › Bed Drawer')).toBeVisible();
  await expect(fillInput(page)).toBeFocused();
  await expect(rows(page)).toHaveCount(3);
  await expect(page.locator('.fill-stats')).toContainText('Nothing added yet');

  await page.keyboard.type('spare keys');
  await page.keyboard.press('Enter');
  await expect(rows(page).first()).toContainText('Spare keys');
  await expect(rows(page).first()).toContainText('New');
  await expect(fillInput(page)).toHaveValue('');
  await expect(fillInput(page)).toBeFocused();

  await page.keyboard.type('torch x2, tape');
  await page.keyboard.press('Enter');
  await expect(page.locator('.fill-row[data-new]')).toHaveCount(3);
  await expect(rows(page).filter({ hasText: 'Torch' })).toContainText('× 2');
  await expect(page.locator('.fill-stats')).toContainText(/^3 added · [\d.]+ s each/);
  await expect(page.getByText('Here now · 6')).toBeVisible();

  await page.getByRole('link', { name: 'Done' }).click();
  await expect(page).toHaveURL('/space/master');
  await expect(thing(page, 'Spare keys')).toBeVisible();
  await expect(thing(page, 'Torch')).toContainText('× 2');

  // Survives a reload, and every thing reaches the speed log.
  await page.reload();
  await expect(thing(page, 'Tape')).toBeVisible();
  await page.goto('/settings');
  await expect(page.getByText('Last 13 things added')).toBeVisible();
  await expect(page.getByText('68 items in')).toBeVisible();
});

test('blank input adds nothing; one-tap chips add and then go away', async ({ page }) => {
  await page.goto('/fill/bd-1');
  await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeDisabled();
  await fillInput(page).fill('  ,  ');
  await page.keyboard.press('Enter');
  await expect(rows(page)).toHaveCount(3);

  await page.getByRole('button', { name: 'Torch' }).click();
  await expect(rows(page).first()).toContainText('Torch');
  await expect(page.getByRole('button', { name: 'Torch' })).toHaveCount(0);
});

test('the + adds an article with a photo, then asks where to place it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add an article' }).click();
  await page.getByLabel('What is it?').fill('Drill machine');
  // A 1x1 PNG stands in for a camera shot; it is saved as a small JPEG.
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==', 'base64');
  await page.getByLabel('Take a photo').setInputFiles({ name: 'shot.png', mimeType: 'image/png', buffer: png });
  await expect(page.getByAltText('Photo of the article')).toBeVisible();
  await page.getByRole('button', { name: 'Next: where is it?' }).click();
  await expect(page.getByRole('heading', { name: 'Where is Drill machine?' })).toBeVisible();
  await page.getByRole('button', { name: /Left Drawer/ }).first().click();
  await expect(page.getByText(/Added Drill machine to/)).toBeVisible();
  await expect(page.getByAltText('Photo of Drill machine').first()).toBeVisible();
  const photo = await page.getByAltText('Photo of Drill machine').first().getAttribute('src');
  expect(photo).toMatch(/^data:image\/jpeg/);
});
