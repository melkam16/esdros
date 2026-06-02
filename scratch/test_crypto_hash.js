const { hash } = require('crypto');
try {
  const result = hash('sha256', 'Password!123');
  console.log("Type of result:", typeof result);
  console.log("Is Buffer:", Buffer.isBuffer(result));
  console.log("Value:", result);
  console.log("Hex Value:", result.toString('hex'));
} catch (e) {
  console.error("Error:", e);
}
