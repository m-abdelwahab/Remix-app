import { Form } from '@remix-run/react';
import { useState } from 'react';
import VerificationInput from 'react-verification-input';
import { Loader } from '../shared/loader';

export const FormSwitcher = ({ actionData, transition }) => {
  const [activeForm, setActiveForm] = useState(0);

  return (
    <div>
      <h2 className="text-2xl font-medium mb-5">
        Second Factor authentication
      </h2>
      <>
        {activeForm === 0 && (
          <Form method="post">
            <h3 className="text-xl mb-3 font-medium">Authenticator app</h3>
            <p>Use the code that is generated by your authenticator app</p>
            <div className="max-w-xs mt-5 mb-10 ">
              <label
                htmlFor="authenticationCode"
                className="block text-sm font-medium text-gray-700 mb-5"
              >
                Passcode
              </label>
              <VerificationInput
                autoFocus
                placeholder=" "
                removeDefaultStyles
                classNames={{
                  container: 'container',
                  character: 'character',
                  characterInactive: 'character--inactive',
                  characterSelected: 'character--selected',
                }}
                inputProps={{
                  name: 'authenticationCode',
                }}
              />
            </div>
            <input
              type="hidden"
              name="authenticationChallengeId"
              value={actionData?.totpChallengeId}
            />
            <input type="hidden" name="userId" value={actionData?.userId} />
            {actionData?.errors?.authCode && (
              <div className="pt-1 my-4 text-red-700" id="password-error">
                {actionData.errors.authCode}
              </div>
            )}
            <button
              className="inline-flex items-center px-4 py-3 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              name="_action"
              value="verify"
              type="submit"
            >
              Verify{' '}
              {transition.state === 'submitting' &&
                transition.submission.formData.get('_action') === 'verify' && (
                  <Loader width={4} height={4} />
                )}
            </button>
            <button
              className="block text-gray-700 font-medium my-5 underline"
              onClick={() => setActiveForm(1)}
            >
              Use SMS
            </button>
          </Form>
        )}
      </>
      <>
        {activeForm === 1 && (
          <div>
            <h3 className="text-xl mb-3 font-medium">Text message</h3>
            <p>
              Use the code that is sent to your registered phone number
            </p>{' '}
            <Form method="post">
              <input
                type="hidden"
                name="smsFactorId"
                value={actionData?.smsFactorId}
              />
              <button
                className=" my-5 inline-flex items-center px-4 py-3 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                name="_action"
                value="SMS"
                type="submit"
              >
                Send authentication code{' '}
                {transition.state === 'submitting' &&
                  transition.submission.formData.get('_action') === 'SMS' && (
                    <Loader width={4} height={4} />
                  )}
              </button>
            </Form>
            <Form method="post">
              <div className="max-w-xs mt-5 mb-10">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-5"
                >
                  Passcode
                </label>
                <VerificationInput
                  autoFocus
                  placeholder=" "
                  removeDefaultStyles
                  classNames={{
                    container: 'container',
                    character: 'character',
                    characterInactive: 'character--inactive',
                    characterSelected: 'character--selected',
                  }}
                  inputProps={{
                    name: 'authenticationCode',
                  }}
                />
              </div>
              <input type="hidden" name="userId" value={actionData?.userId} />
              <input
                type="hidden"
                name="authenticationChallengeId"
                value={actionData?.smsChallengeId}
              />
              <button
                className="inline-flex items-center px-4 py-3 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                name="_action"
                value="verify"
                type="submit"
              >
                Verify{' '}
                {transition.state === 'submitting' &&
                  transition.submission.formData.get('_action') ===
                    'verify' && <Loader width={4} height={4} />}
              </button>
              <button
                className="block text-gray-700 font-medium my-5 underline"
                onClick={() => setActiveForm(0)}
              >
                Use TOTP
              </button>
            </Form>
          </div>
        )}
      </>
    </div>
  );
};