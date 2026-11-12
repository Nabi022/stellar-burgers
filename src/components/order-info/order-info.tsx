import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { selectFeedOrders } from '../../services/slices/feed-slice';
import { selectIngredients } from '../../services/slices/ingredients-slice';
import {
  clearOrderDetails,
  fetchOrderByNumber,
  selectOrderDetails,
  selectOrderDetailsError,
  selectOrderDetailsLoading,
} from '../../services/slices/order-details-slice';
import { selectProfileOrders } from '../../services/slices/profile-orders-slice';
import { useDispatch, useSelector } from '../../services/store';

import type { TIngredient } from '@utils-types';

type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();

  const feedOrders = useSelector(selectFeedOrders);
  const profileOrders = useSelector(selectProfileOrders);
  const ingredients = useSelector(selectIngredients);
  const fetchedOrder = useSelector(selectOrderDetails);
  const isLoading = useSelector(selectOrderDetailsLoading);
  const error = useSelector(selectOrderDetailsError);

  const orderNumber = Number(number);

  const storedOrder = useMemo(
    () =>
      [...feedOrders, ...profileOrders].find((order) => order.number === orderNumber),
    [feedOrders, profileOrders, orderNumber]
  );

  useEffect(() => {
    if (!number || storedOrder) return;

    void dispatch(fetchOrderByNumber(orderNumber));

    return (): void => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, number, orderNumber, storedOrder]);

  const currentOrder =
    storedOrder ?? (fetchedOrder?.number === orderNumber ? fetchedOrder : null);

  const orderInfo = useMemo(() => {
    if (!currentOrder || !ingredients.length) return null;

    const date = new Date(currentOrder.createdAt);

    const ingredientsInfo = currentOrder.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((element) => element._id === item);

          if (ingredient) {
            acc[item] = { ...ingredient, count: 1 };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return { ...currentOrder, ingredientsInfo, date, total };
  }, [currentOrder, ingredients]);

  if (error && !currentOrder) {
    return <p>{error}</p>;
  }

  if (isLoading || !orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
