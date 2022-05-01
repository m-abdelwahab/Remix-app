import { Form, useTransition } from '@remix-run/react';
import { Button } from '../shared';
import { TextInput } from '../shared/text-input';

export const ChangePassword = () => {
  const transition = useTransition();

  return (
    <div>
      <h3 className="text-xl leading-6 text-gray-900 mb-3">Change password</h3>
      <Form method="post" className="space-y-4 max-w-xs">
        <fieldset>
          <label
            htmlFor="currentPassword"
            className="block mb-1 text-sm text-gray-700"
          >
            Current Password
          </label>
          <TextInput
            id="currentPassword"
            type="password"
            name="currentPassword"
          />
        </fieldset>
        <fieldset>
          <label
            htmlFor="newPassword"
            className="text-sm mb-1 block text-gray-700"
          >
            New Password
          </label>
          <TextInput id="newPassword" type="password" name="newPassword" />
        </fieldset>
        <Button
          isLoading={
            transition.state === 'submitting' &&
            transition.submission.formData.get('_action') === 'updatePassword'
          }
          name="_action"
          value="updatePassword"
          type="submit"
        >
          Update password
        </Button>
      </Form>
    </div>
  );
};
