import * as React from "react";
import { Primitive } from "@radix-ui/react-primitive";
import { ResizeObserver } from "@react-three/drei";

import { cn } from "@/lib/utils";

const Resizable = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("group/resizable flex", className)}
      {...props}
    />
  )
);
Resizable.displayName = "Resizable";

const ResizablePanelGroup = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex", className)} {...props} />
    );
  }
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1", className)} {...props} />
  )
);
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = React.forwardRef(
  ({ className, withHandle, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group/resizable_handle relative inline-flex h-full w-px select-none touch-none bg-border hover:bg-border transition-colors",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="absolute left-1/2 top-1/2 z-10 flex h-8 w-1 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-sm bg-border opacity-0 group-hover/resizable_handle:opacity-100">
          <div className="h-1 w-1 rounded-full bg-foreground/50" />
          <div className="h-1 w-1 rounded-full bg-foreground/50" />
          <div className="h-1 w-1 rounded-full bg-foreground/50" />
        </div>
      )}
    </div>
  )
);
ResizableHandle.displayName = "ResizableHandle";

export { Resizable, ResizablePanelGroup, ResizablePanel, ResizableHandle };
