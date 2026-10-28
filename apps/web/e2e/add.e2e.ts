import { expect, test } from '@playwright/test';
import { dialog, h1, itemRow, mainNav, nameInput, openAdd, pickPlace, toast } from './helpers';

test('quick add: Enter saves, times and starts the next item', async ({ page }) => {
  await page.goto('/space/bd-1');
  await page.getByRole('button', { name: 'Add item here' }).click();
  await expect(dialog(page, 'Add item')).toBeVisible();
  await expect(nameInput(page)).toBeFocused();
  await expect(page.locator('.where-path')).toHaveText('Master Bedroom › Bed Drawer › Left Drawer');
  await expect(page.locator('.timer')).toContainText(' s');

  await page.keyboard.type('Spare keys');
  await page.keyboard.press('Enter');
  await expect(toast(page)).toContainText(/Added Spare keys · [\d.]+ s/);
  await expect(nameInput(page)).toHaveValue('');
  await expect(nameInput(page)).toBeFocused();

  await page.keyboard.type('Torch');
  await page.keyboard.press('Enter');
  await expect(toast(page)).toContainText('Added Torch');

  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(itemRow(page, 'Spare keys')).toBeVisible();
  await expect(itemRow(page, 'Torch')).toBeVisible();

  // Survives a reload, and both entries reach the speed log.
  await page.reload();
  await expect(itemRow(page, 'Spare keys')).toBeVisible();
  await mainNav(page).getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByText('Last 12 items added')).toBeVisible();
  await expect(page.getByText('67 items in')).toBeVisible();
});

test('picking a suggestion keeps Enter-to-save working', async ({ page }) => {
  await page.goto('/');
  await openAdd(page);
  await page.keyboard.type('Pow');
  await dialog(page).getByRole('button', { name: 'Power bank' }).click();
  await expect(nameInput(page)).toHaveValue('Power bank');
  await expect(nameInput(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(toast(page)).toContainText('Added Power bank');
});

test('Save is disabled until there is a name', async ({ page }) => {
  await page.goto('/');
  await openAdd(page);
  await expect(dialog(page).getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(dialog(page).getByRole('button', { name: 'Save and add next' })).toBeDisabled();
  await nameInput(page).fill('   ');
  await expect(dialog(page).getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await page.keyboard.press('Enter');
  await expect(toast(page)).toBeHidden();
});

test('changing the place keeps what you typed', async ({ page }) => {
  await page.goto('/');
  await openAdd(page);
  await nameInput(page).fill('Umbrella');
  await dialog(page).getByRole('button', { name: /Change/ }).click();
  await pickPlace(page, 'Storage Rack › Top Shelf');

  await expect(dialog(page, 'Add item')).toBeVisible();
  await expect(nameInput(page)).toHaveValue('Umbrella');
  await expect(page.locator('.where-path')).toHaveText('Store Room › Storage Rack › Top Shelf');

  await dialog(page).getByRole('button', { name: 'Increase quantity' }).click();
  await dialog(page).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(dialog(page)).toBeHidden();

  await page.goto('/space/rk-top');
  await expect(itemRow(page, 'Umbrella')).toContainText('2');
});

test('Add from an item page targets that item’s place', async ({ page }) => {
  await page.goto('/item/i42');
  await openAdd(page);
  await expect(page.locator('.where-path')).toHaveText('Master Bedroom › Wooden Almirah › Right Side');
});

test('Escape and the backdrop close sheets, picker first', async ({ page }) => {
  await page.goto('/');
  await openAdd(page);
  await dialog(page).getByRole('button', { name: /Change/ }).click();
  await expect(dialog(page, 'Choose a place')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog(page, 'Add item')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();

  await openAdd(page);
  await page.getByRole('button', { name: 'Close', exact: true }).click({ position: { x: 20, y: 20 } });
  await expect(dialog(page)).toBeHidden();
});

test('a shelf stays pickable after adding a section inside it', async ({ page }) => {
  await page.goto('/space/rk-top');
  await page.getByRole('button', { name: 'Add section' }).click();
  await expect(dialog(page, 'Add a section')).toContainText('Inside Top Shelf');
  await page.keyboard.type('Blue Box');
  await page.keyboard.press('Enter');
  await expect(toast(page)).toContainText('Added section Blue Box');
  await expect(page.locator('.tile', { hasText: 'Blue Box' })).toContainText('Empty');

  await openAdd(page);
  await dialog(page).getByRole('button', { name: /Change/ }).click();
  const picker = dialog(page, 'Choose a place');
  await expect(picker.getByRole('button', { name: 'Storage Rack › Top Shelf', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(picker.getByRole('button', { name: 'Storage Rack › Top Shelf › Blue Box', exact: true })).toBeVisible();

  await pickPlace(page, 'Storage Rack › Top Shelf › Blue Box');
  await nameInput(page).fill('Fairy lights');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await page.locator('.tile', { hasText: 'Blue Box' }).click();
  await expect(h1(page)).toHaveText('Blue Box');
  await expect(itemRow(page, 'Fairy lights')).toBeVisible();
});
