import React from "react";
import clsx from "clsx";

const Button = ({ variant = "ghost", className, children, ...props }) => {
  const baseStyles =
    "px-4 py-2 rounded-md transition focus:outline-none focus:ring";

  const variants = {
    ghost: "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
  };

  return (
    <button className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

export { Button };
