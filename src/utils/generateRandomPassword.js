const generatePassword = () => {
  let password = '';
  const str =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= 9; i++) {
    const char = Math.floor(Math.random() * str.length + 1);
    password += str.charAt(char);
  }
  return password;
};

export default generatePassword;
