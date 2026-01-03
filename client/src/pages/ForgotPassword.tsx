import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPassword() {
  // Get token from URL if present (for password reset)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  return <ForgotPasswordForm token={token || undefined} />;
}
