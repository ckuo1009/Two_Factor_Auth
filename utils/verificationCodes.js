const verificationCodes = {};

// save each user's verification code
const codes = new Map();

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//save the user's verification code in map
function storeVerificationCode(email, code) {
  console.log("email: " + email + " code: " + code);
  codes.set(email, { code, timestamp: Date.now() });
}

function getVerificationCode(email) {
  const entry = codes.get(email);

  if (!entry) return null;

  // if the code is expired, null
  const now = Date.now();
  const timeDiff = (now - entry.timestamp) / 1000; // 秒
  if (timeDiff > 600) {
    console.log("test1");
    codes.delete(email);
    return null;
  }
  return entry.code;
}

function clearVerificationCode(email) {
  codes.delete(email);
}

function canResendCode(email) {
  const entry = codes.get(email);
  if (!entry) return true;

  const now = Date.now();
  const timeDiff = (now - entry.timestamp) / 1000; // second
  return timeDiff > 60;
}

module.exports = {
  generateVerificationCode,
  storeVerificationCode,
  getVerificationCode,
  clearVerificationCode,
};
