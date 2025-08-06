const bcrypt = require("bcryptjs");

async function hashPasswords() {
    console.log("Generating password hashes for admin users...\n");

    const tjayPassword = "TjayTestPass1";
    const tjayHash = await bcrypt.hash(tjayPassword, 10);
    console.log(`--- Tjay Earl ---`);
    console.log(`Password: ${tjayPassword}`);
    console.log(`Hash: ${tjayHash}\n`);

    const inesPassword = "InesTestPass2";
    const inesHash = await bcrypt.hash(inesPassword, 10);
    console.log(`--- Ines Kibe ---`);
    console.log(`Password: ${inesPassword}`);
    console.log(`Hash: ${inesHash}\n`);

    console.log("ACTION REQUIRED: Copy these hash values into the 'adminUsers' array in 'Blog-backend/models/routes/blogRoutes.js'.");
}

hashPasswords();
