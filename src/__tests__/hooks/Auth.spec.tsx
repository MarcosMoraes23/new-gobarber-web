import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth, AuthProvider } from '../../hooks/auth';
import mockAdapter from 'axios-mock-adapter';
import api from '../../services/api';

const apiMock = new mockAdapter(api);

describe('Auth Hook', () => {
  it('should be to signing', async () => {
    const apiResponse = {
      user: {
        id: 'user-0909',
        name: 'test name',
        email: 'teste@gmail.com',
      },
      token: 'token-0000000',
    };

    apiMock.onPost('sessions').reply(200, apiResponse);

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: 'teste@gmail.com',
      password: '123123123',
    });

    await waitForNextUpdate();

    expect(setItemSpy).toHaveBeenCalledWith(
      '@Gobarber:token',
      apiResponse.token,
    );
    expect(setItemSpy).toHaveBeenCalledWith(
      '@Gobarber:user',
      JSON.stringify(apiResponse.user),
    );
    expect(result.current.user.email).toEqual('teste@gmail.com');
  });

  it('should restore saved data from storage when auth inits', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      switch (key) {
        case '@Gobarber:token':
          return 'token-0000000';
        case '@Gobarber:user':
          return JSON.stringify({
            id: 'user-0909',
            name: 'test name',
            email: 'teste@gmail.com',
          });
        default:
          return null;
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user.email).toEqual('teste@gmail.com');
  });

  it('should be able to signout', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      switch (key) {
        case '@Gobarber:token':
          return 'token-0000000';
        case '@Gobarber:user':
          return JSON.stringify({
            id: 'user-0909',
            name: 'test name',
            email: 'teste@gmail.com',
          });
        default:
          return null;
      }
    });

    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.signOut();
    });

    expect(removeItemSpy).toHaveBeenCalledTimes(2);
    expect(result.current.user).toBeUndefined();
  });

  it('should be able to update user data', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const user = {
      id: 'user-0909',
      name: 'test name',
      email: 'teste@gmail.com',
      avatar_url: 'image',
    };

    act(() => {
      result.current.updateUser(user);
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      '@Gobarber:user',
      JSON.stringify(user),
    );

    expect(result.current.user).toEqual(user);
  });
});
