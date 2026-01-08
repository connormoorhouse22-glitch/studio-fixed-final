import { AiAssistantForm } from '@/components/ai-assistant-form';

export default function AiAssistantPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Personalized Sales Assistance</h2>
        <p className="text-muted-foreground">
          Leverage AI to get sales strategy suggestions based on context and past successes.
        </p>
      </div>
      <AiAssistantForm />
    </div>
  );
}
