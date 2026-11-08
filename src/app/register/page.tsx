import { RegistrationPageClient } from "@/components/registration/RegistrationPageClient";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="royal-page-shell flex min-h-full w-full flex-1 justify-center overflow-x-hidden px-3 py-5 sm:px-5 sm:py-10">
        <RegistrationPageClient />
      </main>
    </div>
  );
}
