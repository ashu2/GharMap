import { expect, test } from '@playwright/test';
import { h1, pickPlace, toast } from './helpers';

test('start a new home, place a hunted-for thing, keep the assets', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('link', { name: 'Start a new, empty home' }).click();
  await expect(page).toHaveURL('/welcome');

  await page.getByLabel('Home name').fill('Dhanaura House');
  await expect(page.getByText('4 picked')).toBeVisible();
  await page.getByRole('button', { name: 'Kids Room' }).click();
  await expect(page.getByRole('button', { name: 'Kids Room' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByLabel('Another room').fill('Verandah');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Verandah' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('4 picked')).toBeVisible();

  // Declining the warning keeps the current home.
  page.once('dialog', d => d.dismiss());
  await page.getByRole('button', { name: 'Create my map' }).click();
  await expect(page).toHaveURL('/welcome');

  page.once('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Create my map' }).click();
  await expect(page).toHaveURL('/start');
  await expect(page.locator('.starter-count')).toHaveText('0 of 9 placed');

  await page.getByRole('button', { name: 'Set place for Torch' }).click();
  await pickPlace(page, 'Verandah');
  await expect(toast(page)).toHaveText('Added Torch to Verandah');
  await expect(page.locator('.starter-count')).toHaveText('1 of 9 placed');
  await expect(page.locator('.starter-row', { hasText: 'Torch' })).toContainText('Placed');

  await page.getByRole('link', { name: 'Go to my map' }).click();
  await expect(h1(page)).toHaveText('Dhanaura House');
  await expect(page.getByText('1 thing · 4 rooms')).toBeVisible();
  await expect(page.locator('.room-card')).toHaveCount(4);
  for (const room of ['Kitchen', 'Drawing Room', 'Master Bedroom', 'Verandah']) {
    await expect(page.getByRole('link', { name: room, exact: true })).toBeVisible();
  }
  await expect(page.locator('.room-card', { hasText: 'Verandah' }).locator('.room-count')).toHaveText('1');

  await page.reload();
  await expect(h1(page)).toHaveText('Dhanaura House');
  await page.goto('/assets');
  await expect(page.locator('.asset-row')).toHaveCount(6);
});
