import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { selectIsAuthChecked, selectUser } from '../../services/slices/user-slice';
import { useSelector } from '../../services/store';

import type { Location } from 'react-router-dom';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: React.JSX.Element;
};

type TLocationState = {
  from?: Location;
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children,
}: TProtectedRouteProps): React.JSX.Element => {
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (onlyUnAuth && user) {
    const from = (location.state as TLocationState | null)?.from ?? { pathname: '/' };
    return <Navigate to={from} replace />;
  }

  return children;
};
