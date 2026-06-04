import { NODE_ENV } from "../config/env.js" // Import NODE_ENV

export const logout = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: NODE_ENV === "production", // Now NODE_ENV is defined
      sameSite: NODE_ENV === "production" ? "none" : "lax",
    })
    .status(200)
    .json({ message: "Logged out successfully" })
}
