import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/auth/discord", (req, res) => {
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.CALLBACK_URL!)}&response_type=code&scope=identify%20guilds`;
  res.redirect(redirect);
});

router.get("/auth/callback", async (req: any, res: any) => {
  try {
    const code = req.query.code;

    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: process.env.CALLBACK_URL!,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const access_token = (tokenRes.data as any).access_token;


    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Store user session bit-perfectly
    (req.session as any).user = userRes.data;

    // Fetch user guilds
    const guildsRes = await axios.get("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    (req.session as any).user.guilds = guildsRes.data;

    res.redirect(process.env.FRONTEND_URL || "https://r3nder-x18m.vercel.app");
  } catch (err: any) {
    console.error("[OAuth Error]", err.response?.data || err.message);
    res.send("OAuth Failed");
  }
});

// GET /auth/logout → handles user logout
router.get("/auth/logout", (req: any, res: any) => {
    req.session.destroy((err: any) => {
        if (err) return res.status(500).send("Logout failed");
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out" });
    });
});

export default router;

