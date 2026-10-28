import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { toast } from './helpers';

const dataLine = (page: Page) => page.locator('.para').first();

async function exportBackup(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export backup (JSON)' }).click(),
  ]);
  const path = await download.path();
  return { name: download.suggestedFilename(), path, text: await readFile(path, 'utf8') };
}

test('entry speed shows the median against the 10 s target', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('.big-num')).toHaveText('7.1 s');
  await expect(page.locator('.pill')).toHaveText('On target');
  await expect(page.locator('.bar')).toHaveCount(10);
  await expect(page.locator('.bar[style*="rgb(217, 119, 6)"]')).toHaveCount(2); // 11.0 s and 12.1 s
});

test('export downloads a valid backup', async ({ page }) => {
  await page.goto('/settings');
  const file = await exportBackup(page);
  expect(file.name).toMatch(/^gharmap-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const backup = JSON.parse(file.text);
  expect(backup).toMatchObject({ app: 'gharmap', version: 1 });
  expect(backup.data.items).toHaveLength(65);
  await expect(toast(page)).toHaveText('Backup downloaded');
});

test('reset asks first, and restores the demo home', async ({ page }) => {
  await page.goto('/item/i0');
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(page.locator('.step-val')).toHaveText('3 L');

  await page.goto('/settings');
  page.once('dialog', d => d.dismiss());
  await page.getByRole('button', { name: 'Reset to demo data' }).click();
  await page.goto('/item/i0');
  await expect(page.locator('.step-val')).toHaveText('3 L');

  await page.goto('/settings');
  page.once('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Reset to demo data' }).click();
  await expect(toast(page)).toHaveText('Demo data restored');
  await page.goto('/item/i0');
  await expect(page.locator('.step-val')).toHaveText('2 L');
});

test('import restores a backup and rejects bad files', async ({ page }) => {
  // Make a change, back it up, then wipe it with a reset.
  await page.goto('/space/bd-1');
  await page.getByRole('button', { name: 'Add item here' }).click();
  await page.keyboard.type('Spare keys');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');

  await page.goto('/settings');
  await expect(dataLine(page)).toContainText('66 items');
  const file = await exportBackup(page);
  page.once('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Reset to demo data' }).click();
  await expect(dataLine(page)).toContainText('65 items');

  const input = page.locator('input[type=file]');

  // Cancelling the confirmation keeps the current data.
  page.once('dialog', d => d.dismiss());
  await input.setInputFiles(file.path);
  await expect(dataLine(page)).toContainText('65 items');

  page.once('dialog', d => {
    expect(d.message()).toContain('66 items');
    void d.accept();
  });
  await input.setInputFiles(file.path);
  await expect(toast(page)).toHaveText('Backup restored');
  await expect(dataLine(page)).toContainText('66 items');

  for (const [contents, error] of [
    ['not json', 'This file is not valid JSON'],
    ['{"app":"something-else"}', 'This is not a GharMap backup'],
    ['{"app":"gharmap","version":1,"data":{"spaces":[],"items":[]}}', 'Backup has no home space'],
  ]) {
    await input.setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(contents!) });
    await expect(toast(page)).toHaveText(error!);
  }
  await expect(dataLine(page)).toContainText('66 items');
});
