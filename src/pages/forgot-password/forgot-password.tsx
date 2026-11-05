import { ForgotPasswordUI } from '@ui-pages';
import { useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { forgotPassword } from '../../services/slices/user-slice';
import { useDispatch } from '../../services/store';

import type { SerializedError } from '@reduxjs/toolkit';

export const ForgotPassword = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [errorText, setErrorText] = useState<string | undefined>(undefined);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    setErrorText(undefined);
    dispatch(forgotPassword({ email }))
      .unwrap()
      .then(() => {
        localStorage.setItem('resetPassword', 'true');
        void navigate('/reset-password', { replace: true });
      })
      .catch((err: SerializedError) => setErrorText(err.message));
  };

  return (
    <ForgotPasswordUI
      errorText={errorText}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
