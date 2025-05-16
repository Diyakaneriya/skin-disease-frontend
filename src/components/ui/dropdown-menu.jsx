import React, { useState } from "react";

const DropdownMenu = ({ children }) => {
  return <div className="relative">{children}</div>;
};

const DropdownMenuTrigger = ({ children }) => {
  return <div className="cursor-pointer">{children}</div>;
};

const DropdownMenuContent = ({ children, align = "end", className }) => {
  return (
    <div className={`absolute mt-2 w-56 bg-white border rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ children, className, ...props }) => {
  return (
    <button
      className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
