import { Dialog, Transition } from "@headlessui/react";
import { FC, Fragment, ReactNode, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import cn from "classnames";

interface Props {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
}

const Modal: FC<Props> = ({ title, children, open, onClose, className }) => {
  const closeRef = useRef(null);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className={cn("relative z-30", className)} onClose={onClose} initialFocus={closeRef}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center text-center md:items-start">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300 transform"
              enterFrom="opacity-0 translate-y-full md:translate-y-0"
              enterTo="opacity-100 translate-y-0 md:translate-y-full"
              leave="ease-in duration-200 transform"
              leaveFrom="opacity-100 translate-y-0 md:translate-y-full"
              leaveTo="opacity-0 translate-y-full md:translate-y-0"
            >
              <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-t-2xl bg-bg px-3 py-5 text-left align-middle shadow-xl transition-all md:rounded-2xl md:p-5">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-text text-center">
                  {title}
                </Dialog.Title>
                <XMarkIcon
                  ref={closeRef}
                  className="w-6 h-6 absolute top-5 right-5 cursor-pointer hover:text-red-400"
                  onClick={onClose}
                />
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
