import { json } from '@remix-run/node';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { enrollSMS, enrollTotp } from '~/prisma-actions/user.server';
import { displayToast } from '~/auth/displayToast';
import { getSession } from '~/auth/getSession';
import { requireUser } from '~/auth/requireUser';
import { requireUserId } from '~/auth/requireUserId';
import { workos } from '~/workos.server';
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
  const { session } = await getSession(request);
  let formData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);

  switch (_action) {
    case 'selectFactor':
      if (!values.authFactorType) {
        return json(
          { errors: { message: 'This field is required' } },
          { status: 400 },
        );
      }
      if (values.authFactorType === 'totp') {
        try {
          const totpFactor = await workos.mfa.enrollFactor({
            type: 'totp',
            issuer: user.email,
            user: user.email,
          });

          const totpChallenge = await workos.mfa.challengeFactor({
            authenticationFactorId: totpFactor.id,
          });

          return { totpFactor, totpChallenge, step: 1 };
        } catch (error) {
          return json({ errors: { message: error } }, { status: 400 });
        }
      }

      if (values.authFactorType === 'sms') {
        setTimeout(() => {}, 3000);
        return { smsFactor: true, step: 1 };
      }

    case 'phoneNumber':
      if (!values.phoneNumber) {
        return json(
          { errors: { message: 'You need to provide a phone number' } },
          { status: 400 },
        );
      }

      try {
        const smsFactor = await workos.mfa.enrollFactor({
          type: 'sms',
          phoneNumber: `${values.phoneNumber}`,
        });

        const smsChallenge = await workos.mfa.challengeFactor({
          authenticationFactorId: smsFactor.id,
        });

        return { smsFactor, smsChallenge, step: 1 };
      } catch (error) {
        displayToast(
          session,
          `Something went wrong, please try again`,
          'success',
        );
        return null;
      }

    case 'verify':
      const {
        authenticationCode,
        authenticationChallengeId,
        isSMSVerification,
      } = values;

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
          if (isSMSVerification === 'true') {
            await enrollSMS(
              user.id,
              response.challenge.authentication_factor_id,
            );
          } else {
            await enrollTotp(
              user.id,
              response.challenge.authentication_factor_id,
            );
          }
        }
        return { response, step: 2 };
      } catch (error) {
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
