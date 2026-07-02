import { test, expect } from '@playwright/test';

/**
 * Full-page E2E test verifying the site renders in Spanish.
 * Asserts against key centralized content strings visible in the DOM.
 */
test.describe('Full-page Spanish rendering', () => {
  test('page title and language attribute are set to Spanish', async ({ page }) => {
    await page.goto('/');

    // HTML lang attribute should be Spanish
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('es');

    // Document title should be Spanish
    await expect(page).toHaveTitle(/Cumpleaños de Diamante/);
  });

  test('hero section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    // The diamond birthday title (inside .hero__subtitle to avoid strict-mode ambiguity)
    await expect(page.locator('.hero__subtitle')).toContainText('Feliz Cumpleaños de Diamante');

    // The age line with wife's name
    await expect(page.getByText('años, brillantemente hermosa')).toBeVisible();

    // Wife's name (inside .hero__name to avoid strict-mode ambiguity with other occurrences)
    await expect(page.locator('.hero__name')).toHaveText('Mi Amor');

    // Scroll hint
    await expect(page.getByText('Desplázate para explorar')).toBeVisible();
  });

  test('timeline section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    // Section title and subtitle
    await expect(page.getByText('Nuestra Historia')).toBeVisible();
    await expect(page.getByText('Un viaje a través de los momentos que importan')).toBeVisible();

    // First timeline entry title
    await expect(page.getByText('El Primer Hola')).toBeVisible();
  });

  test('letters section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Cartas para Ti')).toBeVisible();
    await expect(page.getByText('Palabras de mi corazón al tuyo')).toBeVisible();

    // First letter title
    await expect(page.getByText('El Día en que Te Encontré')).toBeVisible();
  });

  test('gallery section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Nuestro Álbum de Fotos')).toBeVisible();
    await expect(page.getByText('Momentos capturados en el tiempo')).toBeVisible();

    // Category tab buttons
    await expect(page.getByText('Todas')).toBeVisible();
    await expect(page.getByText('Nuestro Viaje')).toBeVisible();
    await expect(page.getByText('Momentos Dulces')).toBeVisible();
    await expect(page.getByText('Tuya por Siempre')).toBeVisible();
  });

  test('surprise section renders Spanish content and reveals', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Una Pequeña Sorpresa')).toBeVisible();
    await expect(page.getByText('Algo especial te espera...')).toBeVisible();
    await expect(page.getByText('Toca para Descubrir')).toBeVisible();

    // Click reveal and verify headline appears
    await page.getByText('Toca para Descubrir').click();
    await expect(page.getByText('Eres Mi Diamante')).toBeVisible();
  });

  test('trivia section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('¿Qué Tanto Nos Conoces?')).toBeVisible();
    // A trivia question in Spanish should appear (all questions contain "¿")
    await expect(page.locator('.trivia__question')).toBeVisible();
  });

  test('scratch card section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Un Mensaje para Ti')).toBeVisible();
    await expect(page.getByText('Raspa para descubrir lo que hay en mi corazón')).toBeVisible();
  });

  test('spinner section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Ruleta del Romance')).toBeVisible();
    await expect(page.getByText('Gira para descubrir nuestra próxima aventura romántica')).toBeVisible();
    await expect(page.getByText('Gira por Amor')).toBeVisible();

    // Verify at least one wheel option in Spanish
    await expect(page.getByText('Bésame ♥')).toBeVisible();
    await expect(page.getByText('Vals Juntos')).toBeVisible();
  });

  test('mini-games section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Minijuegos')).toBeVisible();
    await expect(page.getByText('Un poco de diversión, solo para ti')).toBeVisible();

    // Game card names in Spanish
    await expect(page.getByText('Flappy Love')).toBeVisible();
    await expect(page.getByText('Juego de Memoria')).toBeVisible();

    // Game descriptions in Spanish
    await expect(page.getByText('Toca para volar entre corazones')).toBeVisible();
    await expect(page.getByText('Encuentra los pares coincidentes')).toBeVisible();
  });

  test('footer renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Hecho con todo mi corazón, para el diamante más precioso de mi vida.')).toBeVisible();
    await expect(page.getByText('Te amo. Por siempre y para siempre.')).toBeVisible();
  });

  test('memories button renders Spanish content', async ({ page }) => {
    await page.goto('/');

    // The trigger button identified by its aria-label (avoids strict-mode conflict with the button's own text content)
    await expect(page.getByRole('button', { name: /Abrir recuerdos fotográficos/i })).toBeVisible();
  });
});
