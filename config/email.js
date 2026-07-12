const axios = require("axios");

const sendOTP = async (email, otp) => {
    await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
            sender: { name: "ChatApp", email: "mahabharat534@gmail.com" },
            to: [{ email }],
            subject: "Your ChatApp OTP Code",
            htmlContent: `
        <div style="font-family:Arial;max-width:400px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
          <h2 style="color:#25d366">ChatApp Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="font-size:40px;letter-spacing:8px;color:#111">${otp}</h1>
          <p style="color:#888">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
        },
        {
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
            },
        }
    );
};

module.exports = { sendOTP };