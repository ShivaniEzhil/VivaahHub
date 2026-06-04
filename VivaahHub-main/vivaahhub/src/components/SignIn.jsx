
"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Modal, Button } from "react-bootstrap"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import indiaFlag from "../assets/images/IN-flag.webp"
import { DEFAULT_PHONE_PREFIX, formatPhoneInput, PHONE_PLACEHOLDER } from "../utils/phone.js"
import onboardingImg from "../assets/images/onboarding.png"
import "../styles/admin-auth.css"

const SignIn = () => {
  const [phone, setPhone] = useState(DEFAULT_PHONE_PREFIX)
  const [otp, setOtp] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const { signIn, verifySignInOtp, loading } = useAuth()
  const navigate = useNavigate()

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    const success = await signIn(phone)
    if (success) setShowOtpModal(true)
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    const success = await verifySignInOtp(phone, otp)
    if (success) {
      setShowOtpModal(false)
      navigate("/dashboard")
    }
  }

  return (
    <>
      <div className="main-container">
        <div className="logo-onbaording" style={{ backgroundImage: `url(${onboardingImg})` }}>
          <h1 className="logo">VivaahHub</h1>
        </div>
        <div className="sign-in-form col-6">
          <h4>Welcome to VivaahHub</h4>
          <form id="signin-form" onSubmit={handlePhoneSubmit}>
            <h5>Login</h5>
            <label htmlFor="phone">Contact Number *</label>
            <div className="phone-area">
              <img src={indiaFlag} alt="India Flag" />
              <input
                type="tel"
                name="phone"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                placeholder={PHONE_PLACEHOLDER}
                required
              />
            </div>
            <div className="redirect-to-sign-up pt-3">
              <Link to="/signup">Want to register?</Link>
            </div>
            <div className="back-forth-buttons">
              <div className="back-button">
                <Button type="button" onClick={() => navigate("/")}>
                  Back
                </Button>
              </div>
              <div className="submit--continue-button">
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Continue"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered dialogClassName="otp-modal">
        <Modal.Body className="otp-modal-content">
          <h6>Enter OTP</h6>
          <input
            type="text"
            id="otpInput"
            placeholder="Enter the OTP sent to your number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button className="verify-button" onClick={handleOtpSubmit} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <Button className="cancel-button" onClick={() => setShowOtpModal(false)}>
            Cancel
          </Button>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  )
}

export default SignIn