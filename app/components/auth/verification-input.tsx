import Input from 'react-verification-input';

export const VerificationInput = ({ code, setCode }) => {
  const handleChange = (e) => {
    setCode(e.target.value);
  };
  return (
    <div className="max-w-xs">
      <label
        htmlFor="authenticationCode"
        className="block text-sm  text-gray-700 mb-2"
      >
        Passcode
      </label>
      <Input
        autoFocus
        value={code}
        placeholder=" "
        removeDefaultStyles
        classNames={{
          container: 'container',
          character: 'character',
          characterInactive: 'character--inactive',
          characterSelected: 'character--selected',
        }}
        inputProps={{
          onChange: (value) => handleChange(value),
          name: 'authenticationCode',
        }}
      />
    </div>
  );
};
