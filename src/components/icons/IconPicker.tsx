"use client";

import React, { useState, useMemo } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DynamicLucideIcon from "./DynamicLucideIcon"; // Import the previously created component
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming ScrollArea is available

interface IconPickerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectIcon: (iconName: string) => void;
}

const iconNames = Object.keys(dynamicIconImports);
const MIN_SEARCH_LENGTH = 2; // Minimum characters to start searching

const IconPicker: React.FC<IconPickerProps> = ({
  isOpen,
  onOpenChange,
  onSelectIcon,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = useMemo(() => {
    if (searchTerm.length < MIN_SEARCH_LENGTH) {
      return []; // Return empty if search term is too short
    }
    return iconNames.filter((name) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleIconSelect = (iconName: string) => {
    onSelectIcon(iconName);
    onOpenChange(false); // Close dialog on selection
  };

  const iconButtonSize = 24; // Define a consistent size for icons in the picker

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose an Icon</DialogTitle>
          <DialogDescription>
            Type at least {MIN_SEARCH_LENGTH} characters to search for a Lucide
            icon.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input
            type="text"
            placeholder={`Search icons (e.g., check, user, arrow)...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            aria-label="Search icons"
          />
        </div>
        <ScrollArea className="flex-grow h-0 pr-6">
          {searchTerm.length < MIN_SEARCH_LENGTH ? (
            <p className="text-center text-muted-foreground py-10">
              Please type at least {MIN_SEARCH_LENGTH} characters to see
              results.
            </p>
          ) : filteredIcons.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              {`No icons found for "${searchTerm}".`}
            </p>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 py-4">
              {filteredIcons.map((iconName) => (
                <Button
                  key={iconName}
                  variant="outline"
                  size="icon"
                  className="p-2 aspect-square h-auto w-full flex items-center justify-center"
                  onClick={() => handleIconSelect(iconName)}
                  title={iconName}
                >
                  <DynamicLucideIcon name={iconName} size={iconButtonSize} />
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IconPicker;
