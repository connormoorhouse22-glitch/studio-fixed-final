
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type.startsWith('image/jpeg')) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please select a JPEG image file.',
        });
        setFile(null);
        setPreview(null);
      }
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a JPEG file to upload.',
      });
      return;
    }

    setIsLoading(true);

    // In a real application, you would handle the file upload to a server or cloud storage here.
    // This functionality would require backend development to process the file and update the homepage.
    // For this prototype, we'll simulate the upload process.
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Upload Successful',
        description: `File "${file.name}" has been uploaded. A developer would now need to link this to the homepage.`,
      });
      setFile(null);
      setPreview(null);
      // Clear the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Homepage Image</h2>
        <p className="text-muted-foreground">
          Upload a new JPEG image to be displayed on the homepage.
        </p>
      </div>
       <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertTitle>Developer Note</AlertTitle>
          <AlertDescription>
            This interface allows for image selection and simulated upload. The backend logic to replace the homepage image needs to be implemented separately.
          </AlertDescription>
        </Alert>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Homepage Image Upload</CardTitle>
          <CardDescription>
            Select a JPEG file to upload for the homepage hero section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Choose a JPEG image</Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/jpeg"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
            {preview && (
              <div className="mt-4">
                <Label>Image Preview</Label>
                <div className="mt-2 aspect-video w-full relative overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Image preview" className="object-cover w-full h-full" />
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !file}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              Upload for Homepage
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
