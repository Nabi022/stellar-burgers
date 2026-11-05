import { combineReducers } from '@reduxjs/toolkit';

import constructorReducer from './slices/constructor-slice';
import feedReducer from './slices/feed-slice';
import ingredientsReducer from './slices/ingredients-slice';
import orderDetailsReducer from './slices/order-details-slice';
import orderReducer from './slices/order-slice';
import profileOrdersReducer from './slices/profile-orders-slice';
import userReducer from './slices/user-slice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  user: userReducer,
  order: orderReducer,
  orderDetails: orderDetailsReducer,
  feed: feedReducer,
  profileOrders: profileOrdersReducer,
});
