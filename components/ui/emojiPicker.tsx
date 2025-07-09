import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";

export function EmojiPickerPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="h-20 w-20 bg-accent rounded-full flex justify-center items-center text-gray-500 cursor-pointer">
          Logo
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <EmojiPicker
          onEmojiClick={(e, emojiObject) => console.log(emojiObject)}
        />
      </PopoverContent>
    </Popover>
  );
}
