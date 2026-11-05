import { FeedInfoUI } from '@ui';

import {
  selectFeedOrders,
  selectFeedTotal,
  selectFeedTotalToday,
} from '../../services/slices/feed-slice';
import { useSelector } from '../../services/store';

import type { TOrder } from '@utils-types';

const getOrderNumbersByStatus = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo = (): React.JSX.Element => {
  const orders = useSelector(selectFeedOrders);
  const total = useSelector(selectFeedTotal);
  const totalToday = useSelector(selectFeedTotalToday);

  const readyOrders = getOrderNumbersByStatus(orders, 'done');
  const pendingOrders = getOrderNumbersByStatus(orders, 'pending');

  const feed = {
    orders,
    total,
    totalToday,
    isLoading: false,
    error: null,
  };

  return (
    <FeedInfoUI readyOrders={readyOrders} pendingOrders={pendingOrders} feed={feed} />
  );
};
