import { createSlice, nanoid } from '@reduxjs/toolkit';

import { createOrder } from './order-slice';

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

type TMovePayload = {
  from: number;
  to: number;
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: nanoid() },
      }),
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter((item) => item.id !== action.payload);
    },
    moveIngredient: (state, action: PayloadAction<TMovePayload>) => {
      const { from, to } = action.payload;
      if (to < 0 || to >= state.ingredients.length) return;
      const [movedItem] = state.ingredients.splice(from, 1);
      state.ingredients.splice(to, 0, movedItem);
    },
  },
  selectors: {
    selectConstructorItems: (state) => state,
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.fulfilled, () => initialState);
  },
});

export const { addIngredient, removeIngredient, moveIngredient } =
  constructorSlice.actions;

export const { selectConstructorItems } = constructorSlice.selectors;

export default constructorSlice.reducer;
