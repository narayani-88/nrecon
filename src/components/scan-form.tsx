'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, Target } from 'lucide-react';

const formSchema = z.object({
  target: z.string().min(1, 'Target IP or hostname is required.'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must confirm you have permission to scan this target.',
  }),
});

type ScanFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
};

export function ScanForm({ onSubmit, isLoading }: ScanFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: '',
      consent: false,
    },
  });

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">New Scan</CardTitle>
        <CardDescription>Enter a target IP address or hostname to begin scanning.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="target-input">Target</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="target-input"
                        placeholder="e.g., 127.0.0.1 or example.com"
                        {...field}
                        className="pl-10 h-11 text-base"
                        aria-describedby="target-description"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-accent/50">
                   <FormControl>
                    <Checkbox 
                      id="consent-checkbox"
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      aria-describedby="consent-description"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="consent-checkbox" className="cursor-pointer">
                      Ethical Hacking Agreement
                    </FormLabel>
                    <FormDescription id="consent-description">
                      I confirm that I own or have explicit, written permission to perform security tests on the specified target. I understand that unauthorized scanning is illegal.
                    </FormDescription>
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} size="lg" className="w-full font-bold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Start Secure Scan
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
