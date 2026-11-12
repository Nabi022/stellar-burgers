import { ResetPasswordUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { resetPassword } from '../../services/slices/user-slice';
import { useDispatch } from '../../services/store';

import type { SerializedError } from '@reduxjs/toolkit';

export const ResetPassword = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [errorText, setErrorText] = useState<string | undefined>(undefined);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    setErrorText(undefined);
    dispatch(resetPassword({ password, token }))
      .unwrap()
      .then(() => {
        localStorage.removeItem('resetPassword');
        void navigate('/login');
      })
      .catch((err: SerializedError) => setErrorText(err.message));
  };

  useEffect(() => {
    if (!localStorage.getItem('resetPassword')) {
      void navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  return (
    <ResetPasswordUI
      errorText={errorText}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
