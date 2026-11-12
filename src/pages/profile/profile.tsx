import { ProfileUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import {
  selectUser,
  selectUserError,
  updateUser,
} from '../../services/slices/user-slice';
import { useDispatch, useSelector } from '../../services/store';

import type { TUser } from '@utils-types';

type TProfileFormValue = {
  name: string;
  email: string;
  password: string;
};

const getFormValue = (user: TUser | null): TProfileFormValue => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  password: '',
});

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const error = useSelector(selectUserError);

  const [formValue, setFormValue] = useState(getFormValue(user));

  useEffect(() => {
    setFormValue(getFormValue(user));
  }, [user]);

  const isFormChanged =
    formValue.name !== (user?.name ?? '') ||
    formValue.email !== (user?.email ?? '') ||
    Boolean(formValue.password);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    void dispatch(
      updateUser({
        name: formValue.name,
        email: formValue.email,
        ...(formValue.password ? { password: formValue.password } : {}),
      })
    );
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();
    setFormValue(getFormValue(user));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      updateUserError={error ?? ''}
    />
  );
};
