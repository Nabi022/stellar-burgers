import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const HARS_PATH = 'tests/hars';
const API_URL_PATTERN = '**/api';

const ACCESS_TOKEN = 'mock-access-token';
const REFRESH_TOKEN = 'mock-refresh-token';
const ORDER_NUMBER = '12345';

const CRATER_BUN = 'Краторная булка N-200i';
const FLUORESCENT_BUN = 'Флюоресцентная булка R2-D3';
const MARTIAN_CUTLET = 'Биокотлета из марсианской Магнолии';
const MARTIAN_CUTLET_ID = '643d69a5c3f7b9001cfa0941';
const MARTIAN_CUTLET_CALORIES = '4242';
const SPICY_SAUCE = 'Соус Spicy-X';

const INGREDIENT_MODAL_TITLE = 'Детали ингредиента';

const mockIngredientsRequest = async (page: Page): Promise<void> => {
  await page.routeFromHAR(`${HARS_PATH}/ingredients.har`, {
    url: `${API_URL_PATTERN}/ingredients`,
    notFound: 'abort',
  });
};

const addIngredient = async (page: Page, ingredientName: string): Promise<void> => {
  await page
    .getByRole('listitem')
    .filter({ hasText: ingredientName })
    .getByRole('button', { name: 'Добавить' })
    .click();
};

// Конструктор — секция, внутри которой находится кнопка оформления заказа
const getBurgerConstructor = (page: Page): Locator =>
  page.locator('section').filter({
    has: page.getByRole('button', { name: 'Оформить заказ' }),
  });

const getModal = (page: Page): Locator => page.getByRole('dialog');

test.describe('Добавление ингредиентов в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredientsRequest(page);
    await page.goto('/');
  });

  test('добавляет булку в верх и низ конструктора', async ({ page }) => {
    const burgerConstructor = getBurgerConstructor(page);

    await addIngredient(page, CRATER_BUN);

    await expect(burgerConstructor.getByText(`${CRATER_BUN} (верх)`)).toBeVisible();
    await expect(burgerConstructor.getByText(`${CRATER_BUN} (низ)`)).toBeVisible();
    await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(0);
  });

  test('заменяет булку при добавлении другой булки', async ({ page }) => {
    const burgerConstructor = getBurgerConstructor(page);

    await addIngredient(page, CRATER_BUN);
    await addIngredient(page, FLUORESCENT_BUN);

    await expect(burgerConstructor.getByText(`${FLUORESCENT_BUN} (верх)`)).toBeVisible();
    await expect(burgerConstructor.getByText(`${FLUORESCENT_BUN} (низ)`)).toBeVisible();
    await expect(burgerConstructor.getByText(CRATER_BUN)).toHaveCount(0);
  });

  test('добавляет начинку и соус в середину конструктора', async ({ page }) => {
    const burgerConstructor = getBurgerConstructor(page);

    await addIngredient(page, MARTIAN_CUTLET);
    await addIngredient(page, SPICY_SAUCE);

    await expect(burgerConstructor.getByText('Выберите начинку')).toHaveCount(0);
    await expect(burgerConstructor.getByText(MARTIAN_CUTLET)).toBeVisible();
    await expect(burgerConstructor.getByText(SPICY_SAUCE)).toBeVisible();
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredientsRequest(page);
    await page.goto('/');
    await page.getByRole('link').filter({ hasText: MARTIAN_CUTLET }).click();
  });

  test('открывается по клику на ингредиент и показывает данные этого ингредиента', async ({
    page,
  }) => {
    const modal = getModal(page);

    await expect(page).toHaveURL(new RegExp(`/ingredients/${MARTIAN_CUTLET_ID}$`));
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole('heading', { name: INGREDIENT_MODAL_TITLE })
    ).toBeVisible();
    await expect(modal.getByRole('heading', { name: MARTIAN_CUTLET })).toBeVisible();
    await expect(modal.getByText('Калории, ккал')).toBeVisible();
    await expect(
      modal.getByText(MARTIAN_CUTLET_CALORIES, { exact: true })
    ).toBeVisible();
  });

  test('закрывается по клику на крестик', async ({ page }) => {
    const modal = getModal(page);

    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    const modal = getModal(page);

    await expect(modal).toBeVisible();
    await page.locator('[class*="modal-overlay__overlay"]').click({
      position: { x: 5, y: 5 },
    });

    await expect(modal).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

test.describe('Оформление заказа', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      { name: 'accessToken', value: ACCESS_TOKEN, url: 'http://localhost:4000' },
    ]);
    await page.addInitScript((refreshToken: string) => {
      window.localStorage.setItem('refreshToken', refreshToken);
    }, REFRESH_TOKEN);

    await mockIngredientsRequest(page);
    await page.routeFromHAR(`${HARS_PATH}/user.har`, {
      url: `${API_URL_PATTERN}/auth/user`,
      notFound: 'abort',
    });
    await page.routeFromHAR(`${HARS_PATH}/order.har`, {
      url: `${API_URL_PATTERN}/orders`,
      notFound: 'abort',
    });

    await page.goto('/');
  });

  test('создаёт заказ, показывает его номер и очищает конструктор', async ({ page }) => {
    const burgerConstructor = getBurgerConstructor(page);
    const modal = getModal(page);

    await addIngredient(page, CRATER_BUN);
    await addIngredient(page, MARTIAN_CUTLET);

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: ORDER_NUMBER })).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();

    await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(burgerConstructor.getByText('Выберите начинку')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toHaveCount(0);
  });
});
