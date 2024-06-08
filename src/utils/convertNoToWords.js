/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
const ones = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
];
const teens = [
  '',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const tens = [
  '',
  'ten',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];
const scales = [
  '',
  'thousand',
  'million',
  'billion',
  'trillion',
  'quadrillion',
  'quintillion',
];

const convertThreeDigitsToWords = (number) => {
  let result = '';

  const hundreds = Math.floor(number / 100);
  const tensUnits = number % 100;

  if (hundreds !== 0) {
    result = `${ones[hundreds]} hundred`;
    if (tensUnits !== 0) {
      result += ' and ';
    }
  }

  if (tensUnits !== 0) {
    if (tensUnits < 10) {
      result += ones[tensUnits];
    } else if (tensUnits >= 11 && tensUnits <= 19) {
      const tensUnit = Math.floor(tensUnits - 10);
      result += teens[tensUnit];
    } else {
      const tensDigit = Math.floor(tensUnits / 10);
      const onesDigit = tensUnits % 10;
      result += `${tens[tensDigit]} `;
      if (onesDigit !== 0) {
        const oneDigit = Math.floor(onesDigit);
        result += `${ones[oneDigit]}`;
      }
    }
  }
  return result;
};

const convertNumberToWords = (number) => {
  if (number === 0) return 'zero';

  let integerPart = Math.floor(number);
  const fractionalPart = Math.round((number - integerPart) * 100);

  let result = '';
  let i = 0;

  if (integerPart !== 0) {
    do {
      const threeDigits = integerPart % 1000;
      if (threeDigits !== 0) {
        const scale = scales[i];
        result = `${convertThreeDigitsToWords(threeDigits)} ${scale} ${result}`;
      }
      i++;
      integerPart = Math.floor(integerPart / 1000);
    } while (integerPart > 0);
  }

  if (fractionalPart !== 0) {
    result += 'and ';
    result += convertThreeDigitsToWords(fractionalPart);
    result += ' Only';
  }
  return result.trim();
};

export default convertNumberToWords;
