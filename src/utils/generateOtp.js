const generateOtp = (length) => {
  let otp = '';
  const str = '0123456789';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    const char = Math.floor(Math.random() * str.length);
    otp += str.charAt(char);
  }
  parseInt(otp, 10);
  return otp;
};

export default generateOtp;
