
'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Grape, Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PublicHeader } from '@/components/public-header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendContactEmail, type ContactFormState } from './contact-actions';

const initialState: ContactFormState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      {pending ? 'Sending...' : 'Send Message'}
    </Button>
  );
}


export default function ContactPage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(sendContactEmail, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Message Sent!',
          description: state.message,
        });
        formRef.current?.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Sending Failed',
          description: state.message,
        });
      }
    }
  }, [state, toast]);


  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      <PublicHeader />
      <div className="container mx-auto max-w-6xl flex-1 px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-bold font-headline mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">We'd love to hear from you. Whether you have a question, feedback, or need support, our team is here to help.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Form</CardTitle>
                    <CardDescription>Send us a message and we'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={formAction} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="Your name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="Your email" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" placeholder="What is your message about?" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" placeholder="Your message..." className="min-h-[120px]" required />
                        </div>
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Mail className="h-6 w-6 text-primary" />
                            <a href="mailto:info@winespace.co.za" className="text-muted-foreground hover:text-primary">info@winespace.co.za</a>
                        </div>
                         <div className="flex items-center gap-4">
                            <Phone className="h-6 w-6 text-primary" />
                            <span className="text-muted-foreground">(+27) 82 8234 035</span>
                        </div>
                         <div className="flex items-start gap-4">
                            <MapPin className="h-6 w-6 text-primary mt-1" />
                            <p className="text-muted-foreground">
                                19 Charme Street, Paradyskloof<br/>
                                Stellenbosch, Western Cape<br/>
                                7600, South Africa
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
       <footer className="w-full py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} WineSpace. All rights reserved.
      </footer>
    </main>
  );
}
