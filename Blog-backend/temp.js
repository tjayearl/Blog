import bcrypt from "bcryptjs";

const password = "Earlzone248Z";
const hash = await bcrypt.hash(password, 10);
console.log("✅ Hashed password:\n", hash);
