
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function IntegrationSettings() {
    return (
        <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect with third-party services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p>Slack</p>
                <Button variant="outline">Connect</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p>Google Calendar</p>
                <Button variant="secondary" disabled>Connected</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p>Salesforce</p>
                <Button variant="outline">Connect</Button>
              </div>
            </CardContent>
          </Card>
    )
}
