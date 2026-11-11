import { expect, test } from '@playwright/test';
import { answer, cupboard, findBox, h1, pickPlace, thing, toast } from './helpers';

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
  await page.goto('/');
  await findBox(page).fill('amul');
  await expect(answer(page).locator('.answer-name')).toHaveText('Milk');
});

test('moving a thing updates its place and history', async ({ page }) => {
  await page.goto('/item/i42');
  await expect(h1(page)).toHaveText('Passports');
  await expect(page.locator('.history li')).toHaveCount(1);
  await expect(page.locator('.step[data-last]')).toContainText('Right Side');

  await page.getByRole('button', { name: 'Move', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Move Passports' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Wooden Almirah › Right Side', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await pickPlace(page, 'Bed Drawer › Left Drawer');

  await expect(toast(page)).toContainText('Moved to Master Bedroom › Bed Drawer › Left Drawer');
  await expect(page.locator('.step[data-last]')).toContainText('Left Drawer');
  await expect(page.locator('.history li').first()).toHaveText(
    'Moved from Master Bedroom › Wooden Almirah › Right Side',
  );

  await page.reload();
  await page.goto('/space/master');
  await expect(cupboard(page, 'Wooden Almirah')).toContainText('8 things');
  await expect(cupboard(page, 'Bed Drawer')).toContainText('Passports');
});

test('moving to the same place changes nothing; Escape closes the picker', async ({ page }) => {
  await page.goto('/item/i42');
  await page.getByRole('button', { name: 'Move', exact: true }).click();
  await pickPlace(page, 'Wooden Almirah › Right Side');
  await expect(page.locator('.history li')).toHaveCount(1);
  await expect(toast(page)).toBeHidden();

  await page.getByRole('button', { name: 'Move', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('removing a thing asks first, hides it everywhere, and it can be restored', async ({ page }) => {
  await page.goto('/item/i42');
  page.once('dialog', d => d.dismiss());
  await page.getByRole('button', { name: 'Remove from this home' }).click();
  await expect(h1(page)).toHaveText('Passports');

  page.once('dialog', d => {
    expect(d.message()).toContain('Remove Passports');
    void d.accept();
  });
  await page.getByRole('button', { name: 'Remove from this home' }).click();
  await expect(toast(page)).toHaveText('Removed Passports');
  await expect(page).toHaveURL('/space/master');
  await expect(thing(page, 'Passports')).toHaveCount(0);
  await expect(cupboard(page, 'Wooden Almirah')).toContainText('8 things');

  // Gone from the count, from search, and its old link; still gone after a reload.
  await page.reload();
  await page.goto('/');
  await expect(page.getByText('64 things · 6 rooms')).toBeVisible();
  await findBox(page).fill('passport');
  await expect(page.getByText('Nothing called “passport” yet')).toBeVisible();
  await page.goto('/item/i42');
  await expect(page.getByText('This item no longer exists')).toBeVisible();

  // Settings lists it with where it was, and puts it back on the same shelf.
  await page.goto('/settings');
  const removed = page.getByRole('region', { name: 'Recently removed' });
  await expect(removed).toContainText('Was in Master Bedroom › Wooden Almirah › Right Side');
  await expect(page.getByText('64 items in')).toBeVisible();
  await removed.getByRole('button', { name: 'Restore Passports' }).click();
  await expect(toast(page)).toHaveText('Restored Passports');
  await expect(removed).toBeHidden();

  await page.goto('/space/master');
  await expect(cupboard(page, 'Wooden Almirah').locator('.shelf', { hasText: 'Right Side' })).toContainText('Passports');
  await thing(page, 'Passports').click();
  await expect(page.locator('.history li')).toHaveText(['Restored', 'Removed', 'Added from the prototype data']);
});
