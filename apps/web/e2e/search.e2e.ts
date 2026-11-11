import { expect, test } from '@playwright/test';
import { answer, findBox, h1, isDesktop, pickPlace, roomCard, toast } from './helpers';

const name = (page: import('@playwright/test').Page) => answer(page).locator('.answer-name');

test('the answer appears in place and lights up the map', async ({ page }) => {
  await page.goto('/');
  await findBox(page).fill('passport');
  await expect(page).toHaveURL('/');

  await expect(answer(page)).toContainText('Found');
  await expect(name(page)).toHaveText('Passports');
  await expect(answer(page)).toContainText('× 2');
  await expect(answer(page).locator('.step')).toContainText(['Master Bedroom', 'Wooden Almirah', 'Right Side']);
  await expect(answer(page).locator('.step[data-last]')).toContainText('Right Side');
  await expect(answer(page).locator('.cell')).toHaveCount(3);
  await expect(answer(page).locator('.cell[data-lit]')).toHaveText('Right Side · Passports here');
  await expect(answer(page)).toContainText('Both family passports, in the blue folder.');

  await expect(page.locator('.room-card[data-lit]')).toHaveAttribute('aria-label', 'Master Bedroom');
  await expect(roomCard(page, 'Master Bedroom').locator('.room-count')).toHaveText('Here');
  await expect(page.locator('.room-card[data-dim]')).toHaveCount(5);

  // "blue folder" only appears in the Passports notes.
  await findBox(page).fill('blue folder');
  await expect(name(page)).toHaveText('Passports');

  // Names starting with the query rank first, and the count of matches shows.
  await findBox(page).fill('sh');
  await expect(name(page)).toHaveText(/^Sh/);
  await expect(answer(page)).toContainText(/\d+ matches/);
});

test('often-looked-for chips, and clear', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'medicines' }).click();
  await expect(findBox(page)).toHaveValue('medicines');
  await expect(name(page)).toHaveText('Medicines');

  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(findBox(page)).toHaveValue('');
  await expect(findBox(page)).toBeFocused();
  await expect(answer(page)).toBeHidden();
  await page.keyboard.type('remote');
  await expect(name(page)).toHaveText('Remote Controls');
});

test('another match can be picked without retyping', async ({ page }) => {
  await page.goto('/');
  await findBox(page).fill('ch');
  await expect(name(page)).toHaveText('Cheese');
  await answer(page).locator('.other-match', { hasText: 'Chargers' }).click();
  await expect(name(page)).toHaveText('Chargers');
  await expect(findBox(page)).toHaveValue('ch');
  await expect(page.locator('.room-card[data-lit]')).toHaveAttribute('aria-label', 'Master Bedroom');
});

test('“It’s not there” moves the thing in one tap', async ({ page }) => {
  await page.goto('/');
  await findBox(page).fill('passport');
  await answer(page).getByRole('button', { name: /not there/ }).click();
  await expect(answer(page)).toContainText('Where did you find it?');
  await answer(page).getByRole('button', { name: 'Bed Drawer › Left Drawer' }).click();

  await expect(answer(page)).toContainText('Moved just now');
  await expect(answer(page).locator('.step[data-last]')).toContainText('Left Drawer');
  await expect(answer(page).locator('.cell[data-lit]')).toHaveText('Left Drawer · Passports here');

  await answer(page).getByRole('link', { name: 'Quantity, notes and history' }).click();
  await expect(h1(page)).toHaveText('Passports');
  await expect(page.locator('.history li').first()).toHaveText('Moved from Master Bedroom › Wooden Almirah › Right Side');
});

test('“It’s not there” can send it to another room', async ({ page }) => {
  await page.goto('/');
  await findBox(page).fill('milk');
  await answer(page).getByRole('button', { name: /not there/ }).click();
  await answer(page).getByRole('button', { name: 'Another room…' }).click();
  await pickPlace(page, 'Storage Rack › Top Shelf');
  await expect(toast(page)).toHaveText('Moved to Store Room › Storage Rack › Top Shelf');
  await expect(page.locator('.room-card[data-lit]')).toHaveAttribute('aria-label', 'Store Room');
  await expect(answer(page)).toContainText('Moved just now');

  // Cancel leaves things where they are.
  await answer(page).getByRole('button', { name: /not there/ }).click();
  await answer(page).getByRole('button', { name: 'Cancel' }).click();
  await expect(answer(page).locator('.step[data-last]')).toContainText('Top Shelf');
});

test('no match offers to add it, then shows where it went', async ({ page }) => {
  await page.goto('/');
  await findBox(page).fill('Umbrella');
  await expect(page.getByText('Nothing called “Umbrella” yet')).toBeVisible();
  await expect(page.locator('[data-lit]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Add “Umbrella”' }).click();
  await pickPlace(page, 'Storage Rack › Top Shelf');
  await expect(toast(page)).toHaveText('Added Umbrella to Store Room › Storage Rack › Top Shelf');
  await expect(name(page)).toHaveText('Umbrella');
  await expect(findBox(page)).toHaveValue('');

  await page.reload();
  await findBox(page).fill('umbrella');
  await expect(answer(page).locator('.step[data-last]')).toContainText('Top Shelf');
});

test('“Got it” clears the answer and the map', async ({ page }) => {
  await page.goto('/');
  await findBox(page).fill('charger');
  await expect(name(page)).toHaveText('Chargers');
  await answer(page).getByRole('button', { name: 'Got it' }).click();
  await expect(answer(page)).toBeHidden();
  await expect(findBox(page)).toHaveValue('');
  await expect(page.locator('[data-lit], [data-dim]')).toHaveCount(0);
});

test('the highlight follows into the room', async ({ page }) => {
  await page.goto('/');
  await findBox(page).fill('passport');
  await roomCard(page, 'Master Bedroom').click();
  await expect(h1(page)).toHaveText('Master Bedroom');
  await expect(page.locator('.shelf[data-lit] .shelf-name')).toHaveText('Right Side');
  await expect(page.locator('.thing[data-lit]')).toContainText('Passports');
  await expect(answer(page)).toBeVisible();
});

test('“Show on map” from a thing’s page', async ({ page }) => {
  await page.goto('/item/i42');
  await page.getByRole('button', { name: 'Show on map' }).click();
  await expect(page).toHaveURL('/');
  await expect(name(page)).toHaveText('Passports');
  await expect(page.locator('.room-card[data-lit]')).toHaveAttribute('aria-label', 'Master Bedroom');
});

test('desktop: “/” jumps to the find bar', async ({ page }, info) => {
  test.skip(!isDesktop(info), 'keyboard shortcut');
  await page.goto('/settings');
  await page.keyboard.press('/');
  await expect(findBox(page)).toBeFocused();
  await page.keyboard.type('torch/');
  await expect(findBox(page)).toHaveValue('torch/');
});
