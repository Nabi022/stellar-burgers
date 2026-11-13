import ingredientsReducer, { fetchIngredients } from '../ingredients-slice';

import type { TIngredient } from '@utils-types';

const mockIngredients: TIngredient[] = [
  {
    _id: 'bun-1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
  },
];

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

describe('Редьюсер ингредиентов', () => {
  it('возвращает начальное состояние при неизвестном экшене и состоянии undefined', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  it('включает загрузку и сбрасывает ошибку на fetchIngredients.pending', () => {
    const previousState = { ...initialState, error: { message: 'Старая ошибка' } };

    const state = ingredientsReducer(
      previousState,
      fetchIngredients.pending('requestId')
    );

    expect(state).toEqual({ items: [], isLoading: true, error: null });
  });

  it('сохраняет ингредиенты и выключает загрузку на fetchIngredients.fulfilled', () => {
    const state = ingredientsReducer(
      { ...initialState, isLoading: true },
      fetchIngredients.fulfilled(mockIngredients, 'requestId')
    );

    expect(state).toEqual({ items: mockIngredients, isLoading: false, error: null });
  });

  it('сохраняет ошибку и выключает загрузку на fetchIngredients.rejected', () => {
    const error = new Error('Ошибка сети');

    const state = ingredientsReducer(
      { ...initialState, isLoading: true },
      fetchIngredients.rejected(error, 'requestId')
    );

    expect(state.isLoading).toBe(false);
    expect(state.items).toEqual([]);
    expect(state.error?.message).toBe('Ошибка сети');
  });
});
