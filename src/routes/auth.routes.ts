import express from "express";
import axios from "axios";
import URL from "url";

const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://r3nder-x18m.vercel.app";

// GET /auth/discord → redirects user to Discord OAuth
router.get("/auth/discord", (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL!)}&response_type=code&scope=identify%20guilds%20email`;
    res.redirect(discordAuthUrl);
});

// GET /auth/callback → handles OAuth response
router.get("/auth/callback", async (req, res) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("No code provided");

    try {
        // Exchange code for access_token
        const tokenResponse = await axios.post("https://discord.com/api/oauth2/token", new URL.URLSearchParams({
            client_id: CLIENT_ID!,
            client_secret: CLIENT_SECRET!,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: CALLBACK_URL!,
            scope: "identify guilds email"
        }).toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const { access_token } = (tokenResponse.data as any);

        // Fetch user data
        const userResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const userData = userResponse.data as any;
        // Store user in session
        (req.session as any).user = userData;

        // Fetch user guilds
        const guildsResponse = await axios.get("https://discord.com/api/users/@me/guilds", {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        (req.session as any).user.guilds = guildsResponse.data;

        console.log(`[Auth] User ${userData.username} logged in successfully.`);


        // Redirect to frontend dashboard
        res.redirect(`${FRONTEND_URL}/portal`);
    } catch (error: any) {
        console.error("[Auth Error]", error.response?.data || error.message);
        res.status(500).send("Authentication failed");
    }
});

// GET /api/auth/logout → handles user logout
router.get("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send("Logout failed");
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out" });
    });
});

export default router;

