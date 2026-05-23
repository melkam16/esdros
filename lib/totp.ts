import { createHmac } from 'crypto';

// Base32 character set
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(str: string): Buffer {
  const cleanStr = str.replace(/=+$/, '').toUpperCase();
  const len = cleanStr.length;
  const buffer = Buffer.alloc(Math.floor((len * 5) / 8));
  
  let bits = 0;
  let val = 0;
  let index = 0;
  
  for (let i = 0; i < len; i++) {
    const c = cleanStr[i];
    const charVal = BASE32_CHARS.indexOf(c);
    if (charVal === -1) continue;
    
    val = (val << 5) | charVal;
    bits += 5;
    
    if (bits >= 8) {
      buffer[index++] = (val >> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  
  return buffer;
}

export function generateSecret(email: string, length = 16): { secret: string; otpauthUrl: string; qrCodeDataUrl: string } {
  const characters = BASE32_CHARS;
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  const label = encodeURIComponent(`Esdros Seminary:${email}`);
  const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=Esdros%20Theological%20Seminary`;
  
  // High-fidelity QR code API to fetch a scannable totp barcode
  const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(otpauthUrl)}`;
  
  return { secret, otpauthUrl, qrCodeDataUrl };
}

export function verifyTotp(token: string, secret: string, window = 1): boolean {
  if (!token || !secret) return false;
  const cleanToken = token.trim();
  if (cleanToken.length !== 6 || isNaN(Number(cleanToken))) return false;
  
  try {
    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);
    
    // Check dynamic counter windows to allow skew offsets
    for (let i = -window; i <= window; i++) {
      const val = counter + i;
      const buf = Buffer.alloc(8);
      
      // Write UInt64 big endian counter
      buf.writeUInt32BE(0, 0);
      buf.writeUInt32BE(val, 4);
      
      const hmac = createHmac('sha1', key);
      hmac.update(buf);
      const hmacResult = hmac.digest();
      
      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const binary = ((hmacResult[offset] & 0x7f) << 24) |
                     ((hmacResult[offset + 1] & 0xff) << 16) |
                     ((hmacResult[offset + 2] & 0xff) << 8) |
                     (hmacResult[offset + 3] & 0xff);
      
      const otp = (binary % 1000000).toString().padStart(6, '0');
      if (otp === cleanToken) {
        return true;
      }
    }
  } catch (err) {
    console.error('Error during TOTP verification:', err);
  }
  
  return false;
}
