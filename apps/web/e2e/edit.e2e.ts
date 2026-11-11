import { expect, test } from '@playwright/test';
import { cupboard, dialog, fillInput, h1, roomCard, thing, toast } from './helpers';

test('rename and recolour a room, rename a cupboard, add a shelf', async ({ page }) => {
  await page.goto('/space/master');
  await page.getByRole('link', { name: 'Edit' }).click();
  await expect(page).toHaveURL('/edit/master');

  const roomName = page.getByLabel('Room name');
  await roomName.fill('Main Bedroom');
  await expect(h1(page)).toHaveText('Main Bedroom');

  // A blank name is never saved: the field snaps back.
  await roomName.fill('');
  await roomName.blur();
  await expect(roomName).toHaveValue('Main Bedroom');

  await expect(page.getByRole('radio', { name: 'Violet' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('radio', { name: 'Blue' }).click();
  await expect(page.getByRole('radio', { name: 'Blue' })).toHaveAttribute('aria-checked', 'true');

  await page.getByLabel('Cupboard name').first().fill('Steel Almirah');
  await page.getByRole('region', { name: 'Steel Almirah' }).getByRole('button', { name: /Add a shelf or drawer/ }).click();
  await expect(dialog(page, 'Add a place')).toContainText('Inside Steel Almirah');
  await page.keyboard.type('Locker');
  await page.keyboard.press('Enter');
  await expect(toast(page)).toHaveText('Added Locker');
  await expect(page.getByLabel('Shelf name in Steel Almirah')).toHaveCount(4);

  await page.getByRole('link', { name: 'Done' }).click();
  await expect(h1(page)).toHaveText('Main Bedroom');
  await expect(cupboard(page, 'Steel Almirah').locator('.shelf', { hasText: 'Locker' })).toContainText('Empty');

  await page.reload();
  await page.goto('/');
  await expect(roomCard(page, 'Main Bedroom')).toContainText('Steel Almirah');
  await expect(roomCard(page, 'Main Bedroom')).toHaveCSS('--room', '#60A5FA');
});

test('add a room from the map, then fill it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add a room' }).click();
  await expect(dialog(page, 'Add a place')).toContainText('Add a room');
  await page.keyboard.type('Balcony');
  await page.keyboard.press('Enter');
  await expect(page.locator('.room-card')).toHaveCount(7);

  await roomCard(page, 'Balcony').click();
  await expect(page.locator('.shelf')).toContainText('Empty');
  await page.getByRole('link', { name: 'Add things to Balcony' }).click();
  await fillInput(page).fill('Plant pots x4');
  await page.keyboard.press('Enter');
  await page.getByRole('link', { name: 'Done' }).click();
  await expect(thing(page, 'Plant pots')).toContainText('× 4');

  // A new cupboard in the room.
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByRole('button', { name: /Add a cupboard/ }).click();
  await page.keyboard.type('Shoe Rack');
  await page.keyboard.press('Enter');
  await page.getByRole('link', { name: 'Done' }).click();
  await expect(cupboard(page, 'Shoe Rack')).toBeVisible();
  await expect(cupboard(page, 'Loose in Balcony')).toContainText('Plant pots');
});

test('add an almirah and its shelves straight from the room', async ({ page }) => {
  await page.goto('/space/kids');
  await page.getByRole('button', { name: /Add an almirah, cupboard or rack/ }).click();
  await expect(dialog(page, 'Add a place')).toContainText('Inside Kids Room');
  await page.keyboard.type('Steel Almirah');
  await page.keyboard.press('Enter');
  await expect(toast(page)).toHaveText('Added Steel Almirah');
  await expect(cupboard(page, 'Steel Almirah').locator('.shelf')).toContainText('Empty');

  await page.getByRole('button', { name: 'Add a shelf or drawer to Steel Almirah' }).click();
  await expect(dialog(page, 'Add a place')).toContainText('Inside Steel Almirah');
  await page.keyboard.type('Locker');
  await page.keyboard.press('Enter');
  await expect(cupboard(page, 'Steel Almirah').locator('.shelf-name')).toHaveText(['Locker']);

  // The new shelf can be filled, and shows up on the map.
  await cupboard(page, 'Steel Almirah').getByRole('link', { name: 'Add things to Locker' }).click();
  await fillInput(page).fill('Bank papers');
  await page.keyboard.press('Enter');
  await page.getByRole('link', { name: 'Done' }).click();
  await expect(thing(page, 'Bank papers')).toBeVisible();
  await page.goto('/');
  await expect(roomCard(page, 'Kids Room')).toContainText('Steel Almirah');

  // Inside a cupboard the button offers shelves, not furniture.
  await page.goto('/space/toy-shelf');
  await expect(page.getByRole('button', { name: /Add a shelf, drawer or box/ })).toBeVisible();
});
