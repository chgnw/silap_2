type TransactionPrefix = "RDM" | "PCK" | "SUB";

const RANDOM_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateRandomString(length: number): string {
  let result = "";
  const charsLength = RANDOM_CHARS.length;

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * charsLength);
    result += RANDOM_CHARS.charAt(index);
  }

  return result;
}

export function generateTransactionCode(prefix: TransactionPrefix): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const datePart = `${day}${month}${year}`;
  const randomPart = generateRandomString(8);

  return `${prefix}-${datePart}-${randomPart}`;
}
