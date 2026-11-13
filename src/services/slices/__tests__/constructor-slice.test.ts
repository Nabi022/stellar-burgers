import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
} from '../constructor-slice';
import { createOrder } from '../order-slice';

import type { TIngredient, TOrder } from '@utils-types';

const bun: TIngredient = {
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
};

const secondBun: TIngredient = {
  ...bun,
  _id: 'bun-2',
  name: 'Вторая булка',
};

const filling: TIngredient = {
  ...bun,
  _id: 'filling-1',
  name: 'Начинка',
  type: 'main',
};

const secondFilling: TIngredient = {
  ...bun,
  _id: 'filling-2',
  name: 'Вторая начинка',
  type: 'sauce',
};

const createdOrder: TOrder = {
  _id: 'order-1',
  status: 'done',
  name: 'Краторный бургер',
  createdAt: '2026-11-13T10:00:00.000Z',
  updatedAt: '2026-11-13T10:00:00.000Z',
  number: 123,
  ingredients: ['bun-1', 'filling-1'],
};

const initialState = {
  bun: null,
  ingredients: [],
};

describe('Редьюсер конструктора бургера', () => {
  it('возвращает начальное состояние при неизвестном экшене', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  it('добавляет булку в конструктор', () => {
    const state = constructorReducer(initialState, addIngredient(bun));

    expect(state.bun).toMatchObject(bun);
    expect(typeof state.bun?.id).toBe('string');
  });

  it('заменяет предыдущую булку новой', () => {
    const previousState = {
      bun: { ...bun, id: 'old-id' },
      ingredients: [],
    };

    const state = constructorReducer(previousState, addIngredient(secondBun));

    expect(state.bun).toMatchObject(secondBun);
    expect(state.bun?.id).not.toBe('old-id');
  });

  it('добавляет начинку с уникальным id', () => {
    const state = constructorReducer(initialState, addIngredient(filling));

    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]).toMatchObject(filling);
    expect(typeof state.ingredients[0].id).toBe('string');
  });

  it('удаляет начинку по id', () => {
    const previousState = {
      bun: null,
      ingredients: [
        { ...filling, id: 'id-1' },
        { ...secondFilling, id: 'id-2' },
      ],
    };

    const state = constructorReducer(previousState, removeIngredient('id-1'));

    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0].id).toBe('id-2');
  });

  it('изменяет порядок начинок', () => {
    const previousState = {
      bun: null,
      ingredients: [
        { ...filling, id: 'id-1' },
        { ...secondFilling, id: 'id-2' },
      ],
    };

    const state = constructorReducer(previousState, moveIngredient({ from: 0, to: 1 }));

    expect(state.ingredients[0].id).toBe('id-2');
    expect(state.ingredients[1].id).toBe('id-1');
  });

  it('не изменяет порядок при перемещении за границы массива', () => {
    const previousState = {
      bun: null,
      ingredients: [
        { ...filling, id: 'id-1' },
        { ...secondFilling, id: 'id-2' },
      ],
    };

    const state = constructorReducer(previousState, moveIngredient({ from: 0, to: 5 }));

    expect(state.ingredients.map((item) => item.id)).toEqual(['id-1', 'id-2']);
  });

  it('очищает конструктор после успешного создания заказа', () => {
    const previousState = {
      bun: { ...bun, id: 'bun-id' },
      ingredients: [{ ...filling, id: 'id-1' }],
    };

    const state = constructorReducer(
      previousState,
      createOrder.fulfilled(createdOrder, 'requestId', [])
    );

    expect(state).toEqual(initialState);
  });
});
