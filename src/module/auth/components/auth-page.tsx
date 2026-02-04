'use client';

import * as React from 'react';
import { useLogin } from '../hook/use-login';
import { Button } from '~/shared/ui/button';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '~/shared/ui/card';

const AuthPage = () => {
  const login = useLogin();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ username, password });
  };

  return (
    <div className="flex max-w-md w-full items-center justify-center px-4">
      <Card className="w-full gap-y-3">
        <CardHeader className='w-full text-center'>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-y-3" onSubmit={onSubmit}>
            <div className="grid gap-1.5">
              <Label htmlFor="auth-username">Username</Label>
              <Input
                id="auth-username"
                name="username"
                placeholder="Username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={login.isPending}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                name="password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={login.isPending}
              />
            </div>
            {login.errorMessage ? (
              <p className="text-destructive text-xs/relaxed">
                {login.errorMessage}
              </p>
            ) : null}
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
