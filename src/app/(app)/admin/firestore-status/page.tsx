
'use server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Database } from 'lucide-react';
import { getFirestoreInstance, firebaseConfig } from '@/lib/firebase';
import { getCountFromServer, collection } from 'firebase/firestore';

interface CollectionStatus {
    name: string;
    count: number;
    status: 'checked' | 'error';
    message?: string;
}

export default async function FirestoreStatusPage() {
    let connectionStatus: 'connected' | 'error' = 'connected';
    let connectionMessage: string = 'Successfully connected to Firestore.';
    let collectionChecks: CollectionStatus[] = [];
    const collectionsToTest = ['users', 'products', 'orders', 'promotions', 'diaries'];
    const firestore = getFirestoreInstance();

    try {
        if (!firestore) {
            throw new Error('Firestore service is not available.');
        }

        for (const collectionName of collectionsToTest) {
             try {
                const collRef = collection(firestore, collectionName);
                const snapshot = await getCountFromServer(collRef);
                collectionChecks.push({
                    name: collectionName.charAt(0).toUpperCase() + collectionName.slice(1),
                    count: snapshot.data().count,
                    status: 'checked',
                });
            } catch (error) {
                collectionChecks.push({
                    name: collectionName.charAt(0).toUpperCase() + collectionName.slice(1),
                    count: 0,
                    status: 'error',
                    message: `Collection not found or permission error.`
                });
            }
        }

    } catch (error) {
        connectionStatus = 'error';
        if (error instanceof Error) {
            connectionMessage = error.message;
        } else {
            connectionMessage = 'An unknown error occurred while connecting to Firestore.';
        }
        console.error("Firestore Status Check Error:", error);
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Firestore Status</h2>
                <p className="text-muted-foreground">
                    A live check of the connection and key data collections in your Firestore database.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Live Status Check</CardTitle>
                </CardHeader>
                <CardContent>
                    {connectionStatus === 'connected' ? (
                         <div className="flex flex-col items-start p-6 rounded-lg bg-green-50 border border-green-200">
                            <div className="flex items-start w-full">
                                <CheckCircle className="h-10 w-10 text-green-500 mr-6 mt-1 flex-shrink-0" />
                                <div className="flex-grow">
                                    <h3 className="text-xl font-semibold text-green-800">Connection Successful</h3>
                                    <p className="text-green-700/80 mb-4">
                                       The application is successfully connected to the Firestore database.
                                    </p>
                                    <div className="flex items-center gap-4 rounded-lg bg-green-100/70 p-3 my-4">
                                        <Database className="h-6 w-6 text-green-700" />
                                        <div>
                                            <p className="text-sm font-semibold text-green-900">Connected Project ID</p>
                                            <p className="text-lg font-mono font-semibold text-green-800">{firebaseConfig.projectId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full pl-16 mt-4">
                                <h4 className="font-semibold text-green-800 mb-2">Collection Status</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {collectionChecks.map(check => (
                                        <div key={check.name} className={`p-3 rounded-md ${check.status === 'checked' ? 'bg-green-100' : 'bg-destructive/10'}`}>
                                            <p className="font-semibold text-green-900">{check.name}</p>
                                             {check.status === 'checked' ? (
                                                <p className="text-sm text-green-700/90">{check.count} documents found.</p>
                                             ) : (
                                                 <p className="text-xs text-destructive/80">{check.message}</p>
                                             )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center p-6 rounded-lg bg-destructive/10 border border-destructive/20">
                            <AlertCircle className="h-12 w-12 text-destructive mr-6" />
                            <div>
                                <h3 className="text-xl font-semibold text-destructive">Connection Failed</h3>
                                <p className="text-destructive/80">
                                   The application could not connect to Firestore. See the error below.
                                </p>
                                 <p className="text-sm text-destructive/70 mt-2 font-mono bg-destructive/10 p-2 rounded-md">
                                   {connectionMessage}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
                 <CardFooter>
                    <CardDescription>
                        This check verifies the connection and status of core data collections.
                    </CardDescription>
                </CardFooter>
            </Card>
        </div>
    );
}
