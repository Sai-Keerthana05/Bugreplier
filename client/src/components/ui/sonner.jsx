import * as React from "react";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNameToast:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        classNameDescription: "group-[.toast]:text-muted-foreground",
        classNameActionButton:
          "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      }}
      {...props}
    />
  );
};

export { Toaster };
