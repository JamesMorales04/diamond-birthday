import { test, expect, type Locator } from '@playwright/test';

/**
 * Assert that a single wheel label is visible, has non-zero dimensions,
 * and its center point falls within the wheel's circular clip boundary
 * (border-radius: 50% + overflow: hidden).
 *
 * The wheel's bounding box includes its 3px border. Since
 * border-radius: 50% + overflow: hidden clips at the outer border
 * edge, using the full bounding-box radius is correct for the clip
 * boundary. A 1px tolerance is allowed for rendering imprecision.
 *
 * Note: This only guards the label *center* point. Very long labels may
 * have edges that clip outside the wheel boundary even when the center
 * is within bounds — this heuristic does not detect that case.
 */
async function expectLabelWithinWheel(
  label: Locator,
  wheelCenterX: number,
  wheelCenterY: number,
  wheelRadius: number,
) {
  await expect(label).toBeVisible();

  const box = await label.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.height).toBeGreaterThan(0);

  const labelCenterX = box!.x + box!.width / 2;
  const labelCenterY = box!.y + box!.height / 2;
  const distanceFromCenter = Math.sqrt(
    (labelCenterX - wheelCenterX) ** 2 + (labelCenterY - wheelCenterY) ** 2,
  );

  // Allow 1px tolerance for floating-point / sub-pixel rendering imprecision
  expect(distanceFromCenter).toBeLessThanOrEqual(wheelRadius + 1);
}

/**
 * Full-page E2E test verifying the site renders in Spanish.
 * Asserts against key centralized content strings visible in the DOM.
 */
test.describe('Full-page Spanish rendering', () => {
  test('page title and language attribute are set to Spanish', async ({
    page,
  }) => {
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
    await expect(page.locator('.hero__subtitle')).toContainText(
      'Feliz cumpleaños, mi esposita',
    );

    // The age line with wife's name
    await expect(
      page.getByText(
        'años de hacerme sentir que la vida es mucho más bonita contigo',
      ),
    ).toBeVisible();

    // Wife's name (inside .hero__name to avoid strict-mode ambiguity with other occurrences)
    await expect(page.locator('.hero__name')).toHaveText('Mi Esposita');

    // Scroll hint
    await expect(
      page.getByText('Baja, mi amorcito. Te hice un rinconcito para nosotros.'),
    ).toBeVisible();
  });

  test('timeline section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    // Section title and subtitle
    await expect(page.getByText('Nuestra historia, mi amor')).toBeVisible();
    await expect(
      page.getByText(
        'Cafecitos, notitas, abrazos, patitas y una vida que seguimos eligiendo todos los días',
      ),
    ).toBeVisible();

    // First timeline entry title
    await expect(page.getByText('La casa dejó de sentirse fría')).toBeVisible();
  });

  test('letters section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Cartas para mi esposita')).toBeVisible();
    await expect(
      page.getByText(
        'Todo lo que a veces no me cabe en un mensaje, pero siempre me cabe en el corazón',
      ),
    ).toBeVisible();

    // First letter title
    await expect(
      page.getByText('Cuando esta casa empezó a sentirse nuestra'),
    ).toBeVisible();
  });

  test('gallery section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    // Use explicit id selector to avoid strict-mode collision with the all-tab
    // button (which contains 'Nuestros recuerditos' as a substring)
    await expect(page.locator('#gallery-title')).toHaveText(
      'Nuestros recuerditos',
    );
    await expect(
      page.getByText('Momentos que se quedaron conmigo porque estabas tú'),
    ).toBeVisible();

    // Category tab buttons
    await expect(page.getByText('Todos nuestros recuerditos')).toBeVisible();
    await expect(page.getByText('Nuestras aventuritas')).toBeVisible();
    await expect(
      page.getByText('Cafecitos, notitas y calorcito'),
    ).toBeVisible();
    await expect(
      page.getByText('Nuestra familia y nuestro futuro'),
    ).toBeVisible();
  });

  test('surprise section renders Spanish content and reveals', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByText('Una cosita más, mi amor')).toBeVisible();
    await expect(
      page.getByText('Todavía hay algo que mi corazón quiere decirte...'),
    ).toBeVisible();
    await expect(page.getByText('Descúbrelo, mi esposita')).toBeVisible();

    // Click reveal and verify headline appears
    await page.getByText('Descúbrelo, mi esposita').click();
    await expect(
      page.getByText('Tú hiciste de esta casa un hogar'),
    ).toBeVisible();
  });

  test('trivia section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByText('¿Qué tanto recuerdas de nosotros?'),
    ).toBeVisible();
    // A trivia question in Spanish should appear (all questions contain "¿")
    await expect(page.locator('.trivia__question')).toBeVisible();
  });

  test('scratch card section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Un mensajito para mi esposita')).toBeVisible();
    await expect(
      page.getByText(
        'Raspa despacito para descubrir algo que tengo guardado para ti',
      ),
    ).toBeVisible();
  });

  test('spinner section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByText('Ruleta de planes con mi esposita'),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Gira, mi amor, y dejemos que el destino elija una bobadita bonita para hacer juntos',
      ),
    ).toBeVisible();
    // Use role-based locator to avoid strict-mode collision with the subtitle
    // (which contains 'Gira, mi amor' as a substring)
    await expect(
      page.getByRole('button', { name: 'Gira, mi amor' }),
    ).toBeVisible();

    // Verify two wheel options in Spanish from the current content set
    await expect(page.getByText('Cafecito y notita')).toBeVisible();
    await expect(page.getByText('Huevito con salsa')).toBeVisible();
  });

  test('spinner wheel labels are all visible and positioned within the wheel boundary', async ({
    page,
  }) => {
    await page.goto('/');

    const spinnerSection = page.locator('.spinner-section');
    const wheel = page.locator('.spinner-section__wheel');

    // The spinner section starts hidden (opacity: 0, translateY(30px)) and
    // uses an IntersectionObserver to add .spinner-section--visible, which
    // triggers an 800ms CSS transition to opacity: 1 / translateY(0).
    // Scroll into view to trigger the observer, then wait for the transition
    // to complete by polling opacity. This ensures stable label positions
    // before geometry measurement.
    await spinnerSection.scrollIntoViewIfNeeded();
    await expect(spinnerSection).toHaveCSS('opacity', '1');

    await expect(wheel).toBeVisible();

    const labels = page.locator('.spinner-section__label');
    const allLabels = await labels.all();
    expect(allLabels.length).toBeGreaterThanOrEqual(2);

    // Get the wheel bounding box once for all label checks
    const wheelBox = await wheel.boundingBox();
    expect(wheelBox).not.toBeNull();

    const wheelCenterX = wheelBox!.x + wheelBox!.width / 2;
    const wheelCenterY = wheelBox!.y + wheelBox!.height / 2;
    const wheelRadius = Math.min(wheelBox!.width, wheelBox!.height) / 2;

    for (const label of allLabels) {
      await expectLabelWithinWheel(
        label,
        wheelCenterX,
        wheelCenterY,
        wheelRadius,
      );
    }
  });

  test('mini-games section renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Jueguitos de nuestra familia')).toBeVisible();
    await expect(
      page.getByText(
        'Un poquito de diversión para mi esposita, nuestros bebés y todas nuestras bobaditas lindas',
      ),
    ).toBeVisible();

    // Game card names in Spanish — scope to .minigames__card-name to avoid
    // strict-mode collision with gallery elements (the gallery title
    // "Nuestros recuerditos" and the all-tab button match
    // 'Nuestros Recuerditos' case-insensitively)
    await expect(
      page.locator('.minigames__card-name', { hasText: 'Chester al Vuelo' }),
    ).toBeVisible();
    await expect(
      page.locator('.minigames__card-name', {
        hasText: 'Nuestros Recuerditos',
      }),
    ).toBeVisible();

    // Game descriptions in Spanish — scope to .minigames__card-desc
    await expect(
      page.locator('.minigames__card-desc', {
        hasText: 'Ayuda a Chester a volar con sus orejitas entre corazones',
      }),
    ).toBeVisible();
    await expect(
      page.locator('.minigames__card-desc', {
        hasText: 'Encuentra los pares de nuestra familia y nuestros momentos',
      }),
    ).toBeVisible();
  });

  test('footer renders Spanish content', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByText(
        'Hecho con todo mi corazón para mi esposita, mi koalita bonita y la mujer con la que quiero construir cada mañana.',
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Te amo mucho, mi amor. Tú, yo y nuestros bebés: siempre.',
      ),
    ).toBeVisible();
  });

  test('memories button renders Spanish content', async ({ page }) => {
    await page.goto('/');

    // The trigger button identified by its aria-label (avoids strict-mode conflict with the button's own text content)
    await expect(
      page.getByRole('button', {
        name: /Abrir nuestros recuerdos fotográficos/i,
      }),
    ).toBeVisible();
  });
});
