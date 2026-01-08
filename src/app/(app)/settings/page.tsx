import { EmailSettings } from '@/components/booking-fix/email-settings';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <EmailSettings />
    </div>
  );
}
// Cache-Bust-ID: $(date +%s)
