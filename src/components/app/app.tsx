import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute,
} from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { Preloader } from '@ui';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  fetchIngredients,
  selectIngredients,
  selectIngredientsError,
  selectIsIngredientsLoading,
} from '../../services/slices/ingredients-slice';
import { fetchUser } from '../../services/slices/user-slice';
import { useDispatch, useSelector } from '../../services/store';

import type { AppContentProps } from './type';
import type { Location } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

type TLocationState = {
  background?: Location;
};

type TDetailsPageProps = {
  title: string;
  children: React.JSX.Element;
};

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const ingredients = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIsIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(fetchUser());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        ingredients={ingredients}
        isLoading={isIngredientsLoading}
        error={ingredientsError}
      />
    </div>
  );
};

export default App;

const AppContent = ({
  ingredients,
  isLoading,
  error,
}: AppContentProps): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={clsx(styles.message, 'text', 'text_type_main-medium')}>
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  if (!ingredients.length) {
    return (
      <p className={clsx(styles.message, 'text', 'text_type_main-medium')}>
        Нет ингредиентов
      </p>
    );
  }

  return <RouteComponent />;
};

const DetailsPage = ({ title, children }: TDetailsPageProps): React.JSX.Element => (
  <main className={styles.detailPageWrap}>
    <h1 className={clsx(styles.detailHeader, 'text', 'text_type_main-large', 'mb-5')}>
      {title}
    </h1>
    {children}
  </main>
);

const ORDER_NUMBER_LENGTH = 6;
const ORDER_NUMBER_FILLER = '0';

const formatOrderTitle = (number: string | undefined): string =>
  `#${(number ?? '').padStart(ORDER_NUMBER_LENGTH, ORDER_NUMBER_FILLER)}`;

const OrderPage = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  return (
    <DetailsPage title={formatOrderTitle(number)}>
      <OrderInfo />
    </DetailsPage>
  );
};

const OrderModal = ({ onClose }: { onClose: () => void }): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  return (
    <Modal title={formatOrderTitle(number)} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};

const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const background = (location.state as TLocationState | null)?.background;

  const handleModalClose = (): void => {
    void navigate(-1);
  };

  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route
          path="/ingredients/:id"
          element={
            <DetailsPage title="Детали ингредиента">
              <IngredientDetails />
            </DetailsPage>
          }
        />
        <Route path="/feed/:number" element={<OrderPage />} />
        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={handleModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={<OrderModal onClose={handleModalClose} />}
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <OrderModal onClose={handleModalClose} />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};
