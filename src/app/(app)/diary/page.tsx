
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { format, isSameDay, startOfMonth, parseISO, setHours, setMinutes } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getDiaryEntries, addOrUpdateDiaryEntry, deleteDiaryEntry, type DiaryEntry, type DiaryActionResponse } from '@/lib/diary-actions';
import { PlusCircle, Edit, Trash2, Loader2, Clock, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialFormState: DiaryActionResponse = { success: false, message: '' };

const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (isEditing ? 'Save Changes' : 'Add Entry')}
        </Button>
    )
}

function DiaryEntryForm({ entry, onFormSubmit }: { entry: Partial<DiaryEntry> | null, onFormSubmit: (payload: FormData) => void }) {
    const [title, setTitle] = useState(entry?.title || '');
    const [notes, setNotes] = useState(entry?.notes || '');
    const [visibility, setVisibility] = useState<DiaryEntry['visibility']>(entry?.visibility || 'Private');
    const [location, setLocation] = useState(entry?.location || '');

    const [startTime, setStartTime] = useState(() => entry?.startTime ? format(parseISO(entry.startTime), 'HH:mm') : '09:00');
    const [endTime, setEndTime] = useState(() => entry?.endTime ? format(parseISO(entry.endTime), 'HH:mm') : '09:30');

    return (
        <form action={onFormSubmit} className="space-y-4">
            <input type="hidden" name="entryId" value={entry?.id || ''} />
            <input type="hidden" name="datePart" value={entry?.startTime || new Date().toISOString()} />
             <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Select name="startTime" value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Select name="endTime" value={endTime} onValueChange={setEndTime}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Boardroom, Teams Link..." />
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notes / Agenda</Label>
                <Textarea id="notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>Visibility</Label>
                <RadioGroup name="visibility" value={visibility} onValueChange={(val: DiaryEntry['visibility']) => setVisibility(val)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Private" id="private"/>
                        <Label htmlFor="private">Private</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Company" id="company" />
                        <Label htmlFor="company">Company</Label>
                    </div>
                </RadioGroup>
            </div>

            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <SubmitButton isEditing={!!entry?.id} />
            </DialogFooter>
        </form>
    );
}

export default function DiaryPage() {
    const { toast } = useToast();
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [month, setMonth] = useState(startOfMonth(new Date()));
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [editingEntry, setEditingEntry] = useState<Partial<DiaryEntry> | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const fetchEntries = async () => {
        setIsLoading(true);
        const userEmail = localStorage.getItem('userEmail');
        const userCompany = localStorage.getItem('userCompany');
        if (userEmail && userCompany) {
            const fetchedEntries = await getDiaryEntries({userEmail, userCompany});
            setEntries(fetchedEntries);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const [formState, formAction] = useFormState(addOrUpdateDiaryEntry, initialFormState);
    
    const deleteActionWithId = editingEntry?.id ? deleteDiaryEntry.bind(null, editingEntry.id) : null;
    const [deleteState, deleteAction] = useFormState(deleteActionWithId || (() => Promise.resolve(initialFormState)), initialFormState);


    useEffect(() => {
        if (formState.message) {
            toast({
                title: formState.success ? 'Success' : 'Error',
                description: formState.message,
                variant: formState.success ? 'default' : 'destructive',
            });
            if (formState.success) {
                setIsFormOpen(false);
                setEditingEntry(null);
                fetchEntries();
            }
        }
    }, [formState, toast]);
    
     useEffect(() => {
        if (deleteState.message && deleteState.message !== '') {
            toast({
                title: deleteState.success ? 'Success' : 'Error',
                description: deleteState.message,
                variant: deleteState.success ? 'default' : 'destructive',
            });
            if (deleteState.success) {
                fetchEntries();
            }
        }
    }, [deleteState, toast]);

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
    };

    const handleAddNewEntry = () => {
        if (selectedDate) {
            const defaultStartTime = setMinutes(setHours(selectedDate, 9), 0);
            setEditingEntry({ startTime: defaultStartTime.toISOString() });
            setIsFormOpen(true);
        } else {
            toast({ title: 'Select a Date', description: 'Please select a day on the calendar to add an entry.' });
        }
    };

    const handleEditEntry = (entry: DiaryEntry) => {
        setEditingEntry(entry);
        setIsFormOpen(true);
    }
    
    const handleDeleteEntry = (entry: DiaryEntry) => {
        setEditingEntry(entry);
    }

    const companyModifiers = useMemo(() => entries.filter(e => e.visibility === 'Company' && e.startTime).map(e => parseISO(e.startTime)), [entries]);
    const privateModifiers = useMemo(() => entries.filter(e => e.visibility === 'Private' && e.startTime).map(e => parseISO(e.startTime)), [entries]);

    const entriesForSelectedDay = useMemo(() => entries
        .filter(entry => selectedDate && entry.startTime && isSameDay(parseISO(entry.startTime), selectedDate))
        .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()), [entries, selectedDate]);


    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Diary</h2>
                    <p className="text-muted-foreground">Your personal and company-wide calendar.</p>
                </div>
                <Button onClick={handleAddNewEntry}><PlusCircle className="mr-2 h-4 w-4" /> Add Entry</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-1">
                    <CardContent className="p-4 flex justify-center">
                       {isLoading ? <Skeleton className="h-[300px] w-full max-w-md" /> : (
                         <Calendar
                            mode="single"
                            selected={selectedDate || undefined}
                            onSelect={(day) => day && handleDayClick(day)}
                            month={month}
                            onMonthChange={setMonth}
                            modifiers={{ company: companyModifiers, private: privateModifiers }}
                            modifiersStyles={{
                                company: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' },
                                private: { border: '2px solid hsl(var(--primary))' },
                            }}
                        />
                       )}
                    </CardContent>
                    <CardHeader className="border-t pt-4">
                        <CardTitle>Legend</CardTitle>
                    </CardHeader>
                     <CardContent>
                         <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: 'hsl(var(--primary))' }}/>Company Entry</div>
                            <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2 border-2" style={{ borderColor: 'hsl(var(--primary))' }} />Private Entry</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{selectedDate ? format(selectedDate, 'PPP') : 'Select a Day'}</CardTitle>
                        <CardDescription>Entries for the selected day.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ) : entriesForSelectedDay.length > 0 ? (
                            entriesForSelectedDay.map(entry => (
                                <div key={entry.id} className="p-4 border rounded-lg">
                                     <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{entry.title}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                <Clock className="h-4 w-4" />
                                                {format(parseISO(entry.startTime), 'HH:mm')}
                                                {entry.endTime && ` - ${format(parseISO(entry.endTime), 'HH:mm')}`}
                                            </p>
                                            {entry.location && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {entry.location}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant={entry.visibility === 'Company' ? 'default' : 'secondary'}>{entry.visibility}</Badge>
                                    </div>
                                    {entry.notes && <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">{entry.notes}</p>}
                                    <div className="flex justify-end gap-1 mt-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditEntry(entry)}><Edit className="h-4 w-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteEntry(entry)}><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            {deleteActionWithId && (
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the entry titled "{editingEntry?.title}".</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <form action={deleteAction}><AlertDialogAction type="submit">Delete</AlertDialogAction></form>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                            )}
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-20">
                                <Clock className="mx-auto h-12 w-12" />
                                <p className="mt-4">No entries for this day.</p>
                             </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <Dialog open={isFormOpen} onOpenChange={(open) => { if(!open) setEditingEntry(null); setIsFormOpen(open); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEntry?.id ? 'Edit' : 'Add'} Diary Entry</DialogTitle>
                        <DialogDescription>
                            {editingEntry?.id ? 'Update the details for your entry.' : `Adding a new entry for ${selectedDate ? format(selectedDate, 'PPP') : ''}.`}
                        </DialogDescription>
                    </DialogHeader>
                    {editingEntry && <DiaryEntryForm entry={editingEntry} onFormSubmit={formAction} />}
                </DialogContent>
            </Dialog>

        </div>
    );
}
