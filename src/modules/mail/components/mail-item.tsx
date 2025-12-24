import type { MailMessage } from "../types";
import { formatMailAddress } from "../types";
import { Mail, Paperclip } from "lucide-react";

interface MailItemProps {
  message: MailMessage;
  onSelect?: (message: MailMessage) => void;
}

/**
 * Mail Item Component
 * Displays a single email message in a list
 */
export function MailItem({ message, onSelect }: MailItemProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(message);
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-md border transition-colors cursor-pointer
        hover:bg-accent
        ${message.isRead ? "bg-background" : "bg-muted/30"}
      `}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex-shrink-0 pt-1">
        <Mail
          className={`h-4 w-4 ${message.isRead ? "text-muted-foreground" : "text-primary"}`}
        />
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-medium text-sm truncate">
            {formatMailAddress(message.from)}
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
            {message.receivedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
        
        <div className={`text-sm mb-1 truncate ${message.isRead ? "font-normal" : "font-semibold"}`}>
          {message.subject || "(No subject)"}
        </div>
        
        <div className="text-xs text-muted-foreground line-clamp-2">
          {message.preview}
        </div>
        
        {message.hasAttachments && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            <span>Has attachments</span>
          </div>
        )}
      </div>
    </div>
  );
}
