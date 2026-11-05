import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  forgotPasswordApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  resetPasswordApi,
  updateUserApi,
} from '../../utils/burger-api';
import { deleteCookie, setCookie } from '../../utils/cookie';

import type { TLoginData, TRegisterData } from '../../utils/burger-api';
import type { TUser } from '@utils-types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

type TResetPasswordData = {
  password: string;
  token: string;
};

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
};

// Получение пользователя
export const fetchUser = createAsyncThunk('user/fetch', async () => {
  if (!localStorage.getItem(REFRESH_TOKEN_KEY)) {
    return null;
  }

  const response = await getUserApi();
  return response.user;
});

// Авторизация
export const loginUser = createAsyncThunk('user/login', async (data: TLoginData) => {
  const response = await loginUserApi(data);

  setCookie(ACCESS_TOKEN_KEY, response.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

  return response.user;
});

// Регистрация
export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);

    setCookie(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

    return response.user;
  }
);

// Обновление данных пользователя
export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>) => {
    const response = await updateUserApi(data);
    return response.user;
  }
);

// Восстановление пароля
export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (data: { email: string }) => forgotPasswordApi(data)
);

// Установка нового пароля
export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async (data: TResetPasswordData) => resetPasswordApi(data)
);

// Выход из аккаунта
export const logoutUser = createAsyncThunk('user/logout', async () => {
  try {
    await logoutApi();
  } finally {
    deleteCookie(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,

  reducers: {},

  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectUserError: (state) => state.error,
    selectUserLoading: (state) => state.isLoading,
  },

  extraReducers: (builder) => {
    builder

      // Проверка авторизации
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
        state.isLoading = false;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.isAuthChecked = true;
        state.isLoading = false;
      })

      // Вход
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось войти';
      })

      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось зарегистрироваться';
      })

      // Обновление профиля
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось обновить данные';
      })

      // Выход
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        state.error = action.error.message ?? 'Ошибка выхода';
      });
  },
});

export const { selectUser, selectIsAuthChecked, selectUserError, selectUserLoading } =
  userSlice.selectors;

export default userSlice.reducer;
