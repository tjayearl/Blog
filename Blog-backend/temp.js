const bcrypt = require("bcryptjs");

async function hashPasswords() {
    console.log("Generating password hashes for admin users...\n");

    const tjayPassword = "Earlzone248Z";
    const tjayHash = await bcrypt.hash(tjayPassword, 10);
    console.log(`--- Tjay Earl ---`);
    console.log(`Password: ${tjayPassword}`);
    console.log(`Hash: ${tjayHash}\n`);

    const inesPassword = "KibeRocks2024"; // A secure, new password for Ines
    const inesHash = await bcrypt.hash(inesPassword, 10);
    console.log(`--- Ines Kibe ---`);
    console.log(`Password: ${inesPassword}`);
    console.log(`Hash: ${inesHash}\n`);

    console.log("ACTION REQUIRED: Copy these hash values into the 'adminUsers' array in 'Blog-backend/models/routes/blogRoutes.js'.");
}

hashPasswords();
