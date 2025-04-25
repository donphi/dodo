import { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Send, AlertTriangle } from 'lucide-react';

interface FeedbackDialogProps {
  status?: 'success' | 'error';
  onClose?: () => void;
}

export default function FeedbackDialog({ 
  status = 'success', 
  onClose 
}: FeedbackDialogProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Close dialog when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                status === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {status === 'success' ? (
                  <Send className="h-6 w-6 text-green-600" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                )}
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {status === 'success' ? 'Message Sent' : 'Error Sending Message'}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {status === 'success'
                      ? 'Thank you for your message. We will get back to you as soon as we can.'
                      : 'Your information was saved, but there was an issue with the email notification. Our team will still receive your message.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                {status === 'success' ? 'Close' : 'Try Again'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}