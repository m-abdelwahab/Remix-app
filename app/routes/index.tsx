import { Link } from '@remix-run/react';
import { useOptionalUser } from '~/hooks/useOptionalUser';

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative min-h-screen bg-white ">
      {user ? (
        <Link
          to="/settings"
          className="max-w-sm mx-auto mt-40 flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base  text-indigo-700 shadow-md hover:bg-indigo-50 sm:px-8"
        >
          Settings
        </Link>
      ) : (
        <div>
          <p className="text-xl text-center mt-40">
            Remix app that has user auth + 2FA.
          </p>
          <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none">
            {user ? (
              <Link
                to="/settings"
                className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base  text-indigo-700 shadow-md hover:bg-indigo-50 sm:px-8"
              >
                Settings
              </Link>
            ) : (
              <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                <Link
                  to="/signup"
                  className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base  text-indigo-700 shadow-md hover:bg-indigo-50 sm:px-8"
                >
                  Sign up
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center rounded-md bg-indigo-500 px-4 py-3  text-white hover:bg-indigo-600  "
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
