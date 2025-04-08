"use client";

import { loginUser, registerUser } from "@/actions/user-actions";
import LoginModal from "./modals/login-modal";
import SignUpModal from "./modals/signup-modal";

export default function LoginButtons() {
  return (
    <div className="flex gap-3">
      <LoginModal onLogin={loginUser} />
      <SignUpModal onSignUp={registerUser} />
    </div>
  );
}
