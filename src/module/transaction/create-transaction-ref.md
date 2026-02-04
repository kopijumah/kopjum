'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/core/command';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/core/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/core/popover';
import { cn } from '@/lib/util';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
} from 'react-hook-form';
import { Button } from './button';

interface Options {
  value: string;
  label: string;
}

export interface FormSelectProps<T extends FieldValues, K extends Options> {
  control: Control<T>;
  name: Path<T>;
  setValue: UseFormSetValue<T>;
  options: K[];
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  scrollable?: boolean;
  optionsExcluded?: K[];
  onValueChange?: ((search: string) => void) | undefined;
}

export default function FormSelect<T extends FieldValues, K extends Options>({
  control,
  name,
  setValue,
  options,
  label,
  placeholder,
  emptyMessage,
  description,
  className,
  disabled,
  optionsExcluded,
  scrollable,
  onValueChange,
}: FormSelectProps<T, K>) {
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col space-y-0', className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <Popover modal={true} open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={disabled}
                  variant='outline'
                  role='combobox'
                  type='button'
                  className={cn(
                    'justify-between ring-inset w-full',
                    !field.value && 'text-neutral-400',
                  )}
                >
                  {field.value
                    ? options.find((option) => option.value === field.value)
                        ?.label
                    : placeholder}
                  <ChevronDown className='ml-2 h-4 w-4 shrink-0' />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className='max-h-[--radix-popover-content-available-height] w-[--radix-popover-trigger-width] p-0'>
              <Command>
                <CommandInput
                  onValueChange={onValueChange}
                  placeholder='Cari'
                />
                <CommandList>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup
                    className={`${scrollable ? 'max-h-44 overflow-auto' : ''}`}
                  >
                    {optionsExcluded
                      ? options
                          .filter(
                            (option) =>
                              !optionsExcluded.some(
                                (f) => f.value === option.value,
                              ),
                          )
                          .map((option) => (
                            <CommandItem
                              value={option.label}
                              key={option.value}
                              onSelect={() => {
                                setValue(
                                  name,
                                  option.value as PathValue<T, Path<T>>,
                                );
                                setOpen(false);
                              }}
                            >
                              {option.label}
                            </CommandItem>
                          ))
                      : options.map((option) => (
                          <CommandItem
                            value={option.label}
                            key={option.value}
                            onSelect={() => {
                              setValue(
                                name,
                                option.value as PathValue<T, Path<T>>,
                              );
                              setOpen(false);
                            }}
                          >
                            {option.label}
                          </CommandItem>
                        ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormDescription>{description}</FormDescription>
          <FormMessage className='pt-1' />
        </FormItem>
      )}
    />
  );
}
