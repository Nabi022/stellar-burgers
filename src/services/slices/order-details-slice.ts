import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getOrderByNumberApi } from '../../utils/burger-api';

import type { TOrder } from '@utils-types';

type TOrderDetailsState = {
  order: TOrder | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: TOrderDetailsState = {
  order: null,
  isLoading: false,
  error: null,
};

export const fetchOrderByNumber = createAsyncThunk(
  'orderDetails/fetchByNumber',
  async (orderNumber: number) => {
    const response = await getOrderByNumberApi(orderNumber);
    return response.orders[0] ?? null;
  }
);

const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {
    clearOrderDetails: () => initialState,
  },
  selectors: {
    selectOrderDetails: (state) => state.order,
    selectOrderDetailsLoading: (state) => state.isLoading,
    selectOrderDetailsError: (state) => state.error,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
        if (!action.payload) {
          state.error = 'Заказ не найден';
        }
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить заказ';
      });
  },
});

export const { clearOrderDetails } = orderDetailsSlice.actions;

export const { selectOrderDetails, selectOrderDetailsLoading, selectOrderDetailsError } =
  orderDetailsSlice.selectors;

export default orderDetailsSlice.reducer;
