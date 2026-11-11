import { expect, test } from '@playwright/test';
import { cupboard, fillInput, thing } from './helpers';

/** A new room with a loose pile dumped in it and one almirah to sort the pile into. */
async function pileInRoom(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add a room' }).click();
  await page.keyboard.type('Attic');
  await page.keyboard.press('Enter');
  await page.locator('.room-card', { hasText: 'Attic' }).click();
  await page.getByRole('link', { name: 'Add things to Attic' }).click();
  await fillInput(page).fill('Lego box, Storybooks');
  await page.keyboard.press('Enter');
  await page.getByRole('link', { name: 'Done' }).click();
  await page.getByRole('button', { name: /Add an almirah, cupboard or rack/ }).click();
  await page.keyboard.type('Steel Almirah');
  await page.keyboard.press('Enter');
  await expect(cupboard(page, 'Loose in Attic')).toContainText('Lego box');
  await expect(cupboard(page, 'Steel Almirah')).toBeVisible();
}

test('drag a loose thing from the room onto an almirah', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'HTML5 drag is a desktop gesture');
  await pileInRoom(page);
  await thing(page, 'Lego box').dragTo(cupboard(page, 'Steel Almirah').locator('.shelf').first());
  await expect(cupboard(page, 'Steel Almirah')).toContainText('Lego box');
  await expect(cupboard(page, 'Loose in Attic')).not.toContainText('Lego box');
  await expect(cupboard(page, 'Loose in Attic')).toContainText('Storybooks');
  await thing(page, 'Lego box').click();
  await expect(page.getByText('Moved from Attic')).toBeVisible();
});

test('tap Sort, pick several loose things, put them on a shelf', async ({ page }) => {
  await pileInRoom(page);
  await page.getByRole('button', { name: 'Sort' }).click();
  await thing(page, 'Lego box').click();
  await thing(page, 'Storybooks').click();
  await page.getByRole('button', { name: 'Put 2 selected in Steel Almirah' }).click();
  await expect(cupboard(page, 'Steel Almirah')).toContainText('Lego box');
  await expect(cupboard(page, 'Steel Almirah')).toContainText('Storybooks');
  await expect(page.locator('.toast')).toContainText('Moved 2 things to Steel Almirah');
});
