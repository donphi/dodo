'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { CircleX } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function DeleteAccountDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { deleteAccount, loading } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      // The redirect is handled in the deleteAccount function
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
                <CircleX aria-hidden="true" className="size-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                  Delete account
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                  We're sorry to see you go. Deleting your account will permanently remove all your data and settings. This action cannot be undone. Are you sure you want to continue?
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || loading}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:col-start-2 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                data-autofocus
                onClick={onClose}
                disabled={isDeleting || loading}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
