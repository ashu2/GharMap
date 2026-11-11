import { expect, test, type Page } from '@playwright/test';
import { dialog, h1, mainNav, toast } from './helpers';

const row = (page: Page, name: string) => page.locator('.asset-row', { hasText: name });

/** Local date `n` days from today, as the date inputs want it. */
function inDays(n: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + n);
  const p = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** First of the month, `months` months back: an exact age whatever today's date is. */
function monthsAgo(months: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - months, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

test('assets tab lists the demo assets with their age, oldest first', async ({ page }) => {
  await page.goto('/');
  await mainNav(page).getByRole('link', { name: 'Assets' }).click();
  await expect(h1(page)).toHaveText('Assets');
  await expect(mainNav(page).getByRole('link', { name: 'Assets' })).toHaveAttribute('aria-current', 'page');

  await expect(page.locator('.asset-row')).toHaveCount(6);
  await expect(page.locator('.asset-row').first()).toContainText('Double-door fridge');
  await expect(page.locator('.asset-summary')).toContainText('6 assets · oldest is Double-door fridge');
  await expect(row(page, 'Family car')).toContainText('Car · Bought Mar 2019');
  await expect(row(page, 'Family car').locator('.asset-age')).toHaveText(/^\d+ yr( \d+ mo)?$/);
  await expect(row(page, 'Sofa set').locator('.asset-age')).toHaveText('Age not set');
});

test('add an asset, see its age, edit it, and it survives a reload', async ({ page }) => {
  await page.goto('/assets');
  await page.getByRole('button', { name: 'Add asset' }).click();
  const form = dialog(page, 'Add asset');
  await expect(form.getByRole('button', { name: 'Add asset' })).toBeDisabled();

  await form.getByLabel('What is it?').fill('Royal Enfield');
  await form.getByRole('button', { name: 'Bike' }).click();
  await form.getByLabel('Bought on').fill(monthsAgo(27));
  await expect(form.locator('.asset-age-hint')).toHaveText('Age: 2 yr 3 mo');
  await form.getByRole('button', { name: 'Add asset' }).click();

  await expect(toast(page)).toHaveText('Added Royal Enfield');
  await expect(dialog(page)).toBeHidden();
  await expect(row(page, 'Royal Enfield')).toContainText('Bike · Bought');
  await expect(row(page, 'Royal Enfield').locator('.asset-age')).toHaveText('2 yr 3 mo');
  await expect(page.locator('.asset-row')).toHaveCount(7);

  await page.reload();
  await row(page, 'Royal Enfield').click();
  const edit = dialog(page, 'Edit asset');
  await expect(edit.getByRole('button', { name: 'Bike' })).toHaveAttribute('aria-pressed', 'true');
  await edit.getByLabel('Bought on').fill(monthsAgo(5));
  await edit.getByRole('button', { name: 'Save changes' }).click();
  await expect(toast(page)).toHaveText('Saved Royal Enfield');
  await expect(row(page, 'Royal Enfield').locator('.asset-age')).toHaveText('5 mo');
});

test('removing an asset asks first', async ({ page }) => {
  await page.goto('/assets');
  await row(page, 'Scooter').click();
  page.once('dialog', d => d.dismiss());
  await dialog(page, 'Edit asset').getByRole('button', { name: 'Remove' }).click();
  await expect(dialog(page, 'Edit asset')).toBeVisible();

  page.once('dialog', d => d.accept());
  await dialog(page, 'Edit asset').getByRole('button', { name: 'Remove' }).click();
  await expect(toast(page)).toHaveText('Removed Scooter');
  await expect(row(page, 'Scooter')).toHaveCount(0);
  await expect(page.locator('.asset-row')).toHaveCount(5);
});

test('insurance and service dates show how close they are', async ({ page }) => {
  await page.goto('/assets');
  await expect(row(page, 'Family car').locator('.asset-due-soon')).toHaveText('Insurance expires in 20 days');
  await expect(row(page, 'Family car').locator('.asset-due-later')).toHaveText(/^Service due \d+ \w+ \d{4}$/);
  await expect(row(page, 'Scooter').locator('.asset-due-overdue')).toHaveText('Service overdue by 10 days');
  await expect(row(page, 'Double-door fridge').locator('.asset-due')).toHaveCount(0);
  await expect(page.locator('.asset-attention')).toContainText('2 need attention');

  // Renewing the car insurance and servicing the scooter clears both warnings.
  await row(page, 'Family car').click();
  await dialog(page, 'Edit asset').getByLabel('Insurance valid till').fill(inDays(365));
  await dialog(page, 'Edit asset').getByRole('button', { name: 'Save changes' }).click();
  await expect(row(page, 'Family car').locator('.asset-due-soon')).toHaveCount(0);
  await expect(page.locator('.asset-attention')).toContainText('1 needs attention');

  await row(page, 'Scooter').click();
  await dialog(page, 'Edit asset').getByLabel('Next service due').fill(inDays(1));
  await dialog(page, 'Edit asset').getByRole('button', { name: 'Save changes' }).click();
  await expect(row(page, 'Scooter').locator('.asset-due-soon')).toHaveText('Service due in 1 day');

  await page.reload();
  await row(page, 'Scooter').click();
  await dialog(page, 'Edit asset').getByLabel('Next service due').fill('');
  await dialog(page, 'Edit asset').getByRole('button', { name: 'Save changes' }).click();
  await expect(row(page, 'Scooter').locator('.asset-due')).toHaveCount(1);
  await expect(page.locator('.asset-attention')).toHaveCount(0);
});
