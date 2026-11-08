const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const outputDir = path.join(process.cwd(), ".local-secrets");
const outputFile = path.join(outputDir, "encryption-keys.env");

fs.mkdirSync(outputDir, { recursive: true });

if (fs.existsSync(outputFile)) {
  throw new Error(
    "Keys already exist. Refusing to overwrite existing keys."
  );
}

function generateKeyPair(prefix) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 3072,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  const escapePem = (pem) =>
    pem.trim().replace(/\r?\n/g, "\\n");

  return [
    `${prefix}_PUBLIC_KEY="${escapePem(publicKey)}"`,
    `${prefix}_PRIVATE_KEY="${escapePem(privateKey)}"`,
  ];
}

const lines = [
  ...generateKeyPair("REGISTRATION_ENCRYPTION"),
  'REGISTRATION_ENCRYPTION_KEY_ID="registration-v1"',
  ...generateKeyPair("DOCUMENT_ENCRYPTION"),
  'DOCUMENT_ENCRYPTION_KEY_ID="document-v1"',
];

fs.writeFileSync(outputFile, lines.join("\n") + "\n", {
  flag: "wx",
});

console.log(`Encryption keys generated at: ${outputFile}`);
console.log("Copy the values into .env.local.");
console.log("Keep the private keys secret. Never commit this file.");