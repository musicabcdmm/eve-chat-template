import { AuthLayout } from "@/components/layouts/auth-layout";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <AuthLayout>
      <div className="space-y-6 rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
          <p className="mt-2 text-gray-300">
            We've sent a verification link to {searchParams.email}
          </p>
        </div>

        <div className="rounded-lg border border-blue-500/50 bg-blue-50/10 p-4">
          <p className="text-sm text-blue-200">
            Click the link in your email to verify your account. If you don't see it, check your
            spam folder.
          </p>
        </div>

        <div className="text-center text-sm text-gray-300">
          <p>Didn't receive the email?</p>
          <button className="mt-2 text-blue-400 hover:text-blue-300">Resend verification link</button>
        </div>
      </div>
    </AuthLayout>
  );
}
