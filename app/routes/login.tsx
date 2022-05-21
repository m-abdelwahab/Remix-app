import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { getUserId, createUserSession } from '~/utils/session.server';
import { verifyLogin } from '~/models/user.server';
import { redirectSafely } from '~/utils/redirectSafely.server';
import { validateEmail } from '~/utils/validation/validateEmail.server';
import { workos } from '~/lib/workos.server';
import { LoginForm, TwoFactorForm } from '~/components/auth';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect('/');
  return null;
};

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const redirectTo = redirectSafely(formData.get('redirectTo'), '/');
  const remember = formData.get('remember');
  const { _action, ...values } = Object.fromEntries(formData);

  switch (_action) {
    case 'login':
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (!validateEmail(email!)) {
        return json<ActionData>(
          { errors: { email: 'Email is invalid' } },
          { status: 400 },
        );
      }

      if (typeof password !== 'string') {
        return json<ActionData>(
          { errors: { password: 'Password is required' } },
          { status: 400 },
        );
      }

      if (password.length < 8) {
        return json<ActionData>(
          { errors: { password: 'Password is too short' } },
          { status: 400 },
        );
      }

      const user = await verifyLogin(email, password);

      if (!user) {
        return json<ActionData>(
          { errors: { email: 'Invalid email or password' } },
          { status: 400 },
        );
      }

      const hasMfaEnabled = user.totpFactorId || user.smsFactorId;

      if (!hasMfaEnabled) {
        return createUserSession({
          request,
          userId: user.id,
          remember: remember === 'on',
          redirectTo,
        });
      }

      const hasTotpEnabled = user.totpFactorId && !user.smsFactorId;

      if (hasTotpEnabled) {
        const totpChallenge = await workos.mfa.challengeFactor({
          authenticationFactorId: `${user.totpFactorId}`,
        });

        return {
          userId: user.id,
          totpChallengeId: user.totpFactorId && totpChallenge.id,
          totpFactorId: user.totpFactorId,
        };
      }

      const hasSmsEnabled = user.smsFactorId && !user.totpFactorId;

      if (hasSmsEnabled) {
        const smsChallenge = await workos.mfa.challengeFactor({
          authenticationFactorId: `${user.smsFactorId}`,
        });

        return {
          userId: user.id,
          phoneNumber: user.phoneNumber!.substring(
            user.phoneNumber!.length - 3,
          ),
          smsChallengeId: user.smsFactorId && smsChallenge.id,
          smsFactorId: user.smsFactorId,
        };
      }

      const hasAllFactorsEnabled = user.totpFactorId && user.smsFactorId;

      if (hasAllFactorsEnabled) {
        const totpChallenge = await workos.mfa.challengeFactor({
          authenticationFactorId: `${user.totpFactorId}`,
        });

        return {
          userId: user.id,
          totpChallengeId: totpChallenge.id,
          totpFactorId: user.totpFactorId,
          smsFactorId: user.smsFactorId,
        };
      }

    case 'sms':
      const smsChallenge = await workos.mfa.challengeFactor({
        authenticationFactorId: `${values.smsFactorId}`,
      });

      return {
        smsFactorId: values.smsFactorId,
        smsChallengeId: smsChallenge.id,
        totpFactorId: values.totpFactorId,
      };

    case 'verify':
      const {
        authenticationCode,
        authenticationChallengeId,
        userId,
        totpFactorId,
        smsFactorId,
      } = values;

      if (!authenticationChallengeId) {
        return json(
          {
            totpFactorId,
            smsFactorId,
            authenticationChallengeId,
            errors: {
              authCode: `Something went wrong. Please try again`,
            },
          },
          { status: 400 },
        );
      }
      const response = await workos.mfa.verifyFactor({
        authenticationChallengeId: `${authenticationChallengeId}`,
        code: `${authenticationCode}`,
      });

      if (!response.valid) {
        return json(
          {
            totpFactorId,
            smsFactorId,
            authenticationChallengeId,
            errors: {
              authCode: `Something went wrong. Please try again`,
            },
          },
          { status: 400 },
        );
      }

      return createUserSession({
        request,
        userId: `${userId}`,
        remember: remember === 'on' ? true : false,
        redirectTo,
      });
  }
};

export const meta: MetaFunction = () => {
  return {
    title: 'Login',
  };
};

export default function LoginPage() {
  const actionData = useActionData();
  const hasMfaEnabled = actionData?.smsFactorId || actionData?.totpFactorId;

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8 my-20">
        <h1 className="text-4xl text-center text-gray-800 mb-10">Log in</h1>
        {!hasMfaEnabled && <LoginForm />}
        <TwoFactorForm />
      </div>
    </div>
  );
}
