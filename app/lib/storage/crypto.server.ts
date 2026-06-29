import {
	createCipheriv,
	createDecipheriv,
	createHash,
	randomBytes,
} from "node:crypto";

// Server-only. Encrypts the storage connection blob before it touches the DB.
// Never import from a client component. The key comes from STORAGE_CONFIG_SECRET
// (any string); we hash it to a fixed 32-byte AES-256 key so operators don't
// have to produce exactly 32 bytes of entropy by hand.

const AlgorithmName = "aes-256-gcm";

const IvLength = 12;

const deriveKey = (): Buffer => {
	const secret = process.env.STORAGE_CONFIG_SECRET;

	if (!secret) {
		throw new Error("STORAGE_CONFIG_SECRET is not set");
	}

	return createHash("sha256").update(secret).digest();
};

// Returns `iv:authTag:ciphertext`, each part base64.
export const encryptSecret = (plaintext: string): string => {
	const iv = randomBytes(IvLength);
	const cipher = createCipheriv(AlgorithmName, deriveKey(), iv);
	const ciphertext = Buffer.concat([
		cipher.update(plaintext, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();

	return [
		iv.toString("base64"),
		authTag.toString("base64"),
		ciphertext.toString("base64"),
	].join(":");
};

export const decryptSecret = (payload: string): string => {
	const [ivPart, tagPart, dataPart] = payload.split(":");

	if (!ivPart || !tagPart || !dataPart) {
		throw new Error("Malformed encrypted payload");
	}

	const decipher = createDecipheriv(
		AlgorithmName,
		deriveKey(),
		Buffer.from(ivPart, "base64")
	);

	decipher.setAuthTag(Buffer.from(tagPart, "base64"));

	return Buffer.concat([
		decipher.update(Buffer.from(dataPart, "base64")),
		decipher.final(),
	]).toString("utf8");
};

export const isStorageSecretConfigured = (): boolean =>
	Boolean(process.env.STORAGE_CONFIG_SECRET);
