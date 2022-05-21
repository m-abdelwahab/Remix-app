import { json } from '@remix-run/node';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import {
  enrollAuthenticationFactor,
  updatePhoneNumber,
} from '~/models/user.server';
import { requireUser, requireUserId } from '~/utils/session.server';

import { workos } from '~/lib/workos.server';
import {
  SelectFactor,
  Verify,
  Activated,
} from '~/components/settings/mfa/setup';

export const loader: LoaderFunction = async ({ request }) => {
  return await requireUserId(request);
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  let formData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);

  const {
    authenticationCode,
    authenticationChallengeId,
    authFactorType,
    qr_code,
  } = values;

  switch (_action) {
    case 'selectFactor':
      if (!authFactorType) {
        return json(
          { errors: { message: 'This field is required' } },
          { status: 400 },
        );
      }
      if (authFactorType === 'totp') {
        try {
          // change issuer field to your app name
          const authenticationFactor = await workos.mfa.enrollFactor({
            type: 'totp',
            issuer: 'Remix with WorkOS',
            user: user.email,
          });

          const authenticationChallenge = await workos.mfa.challengeFactor({
            authenticationFactorId: authenticationFactor.id,
          });

          return { authenticationFactor, authenticationChallenge, step: 1 };
        } catch (error) {
          return json({ errors: { message: error } }, { status: 400 });
        }
      }

      return { setupSMS: true, step: 1 };

    case 'phoneNumber':
      const { phoneNumber } = values;
      if (!phoneNumber) {
        return json(
          {
            setupSMS: true,
            step: 1,
            errors: { message: 'You need to provide a phone number' },
          },
          { status: 400 },
        );
      }

      try {
        const smsFactor = await workos.mfa.enrollFactor({
          type: 'sms',
          phoneNumber: `${phoneNumber}`,
        });

        const smsChallenge = await workos.mfa.challengeFactor({
          authenticationFactorId: smsFactor.id,
        });

        await updatePhoneNumber(`${user.id}`, `${phoneNumber}`);

        return { setupSMS: true, smsFactor, smsChallenge, step: 1 };
      } catch (error) {
        return json(
          {
            setupSMS: true,
            authFactorType: 'sms',
            step: 1,
            errors: { message: 'Something went wrong, please try again' },
          },
          { status: 400 },
        );
      }

    case 'verify':
      if (authenticationCode.toString().length !== 6) {
        return json(
          { errors: { title: 'Code must be 6 digits' } },
          { status: 400 },
        );
      }

      try {
        const response = await workos.mfa.verifyFactor({
          authenticationChallengeId: `${authenticationChallengeId}`,
          code: `${authenticationCode}`,
        });

        if (response.valid) {
          await enrollAuthenticationFactor(user.id, {
            smsFactorId:
              authFactorType === 'sms'
                ? response.challenge.authentication_factor_id
                : undefined,
            totpFactorId:
              authFactorType === 'totp'
                ? response.challenge.authentication_factor_id
                : undefined,
          });
          return { step: 2 };
        }

        return {
          errors: { authCode: 'Something went wrong' },
          authenticationFactor: {
            type: authFactorType === 'totp' ? 'totp' : null,
            totp: {
              qr_code,
            },
          },
          setupSMS: authFactorType === 'sms',
          authenticationChallenge: {
            id: authenticationChallengeId,
          },
          step: 1,
        };
      } catch (error) {
        console.log(error);
        return json({ errors: { message: error } }, { status: 400 });
      }
  }
  return null;
};

const MultiFactorAuthentication = () => {
  return (
    <section className="my-10">
      <h1 className="text-2xl font">Set up two-factor authentication (2FA)</h1>
      <ol className="my-8 relative border-l-2 border-gray-200">
        <SelectFactor />
        <Verify />
        <Activated />
      </ol>
    </section>
  );
};

export default MultiFactorAuthentication;
