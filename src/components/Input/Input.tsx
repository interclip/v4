import React, { forwardRef } from 'react';
import { ComponentProps } from 'react';

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  function Input({ ...props }) {
    return (
      <input
        className={`border-2 border-[#EAEAEA] rounded-xl px-2.5 py-1.5 text-[#333333] dark:text-dark-text ${
          props.disabled ? 'bg-[#474747]' : 'bg-dark-secondary'
        } w-full`}
        {...props}
      />
    );
  },
);

export default Input;
