
'use server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPromotions } from '@/lib/promotion-actions';
import { PromotionsListAdmin } from './promotions-list-admin';


export default async function AdminPromotionsPage() {
    const promotions = await getPromotions();

    return (
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>All Active Promotions</CardTitle>
                    <CardDescription>A list of all promotions currently active on the platform, created by suppliers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PromotionsListAdmin promotions={promotions} />
                </CardContent>
            </Card>
        </div>
    );
}
