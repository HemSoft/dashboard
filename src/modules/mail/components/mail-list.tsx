import type { MailMessage } from "../types";
import { MailItem } from "./mail-item";

interface MailListProps {
  messages: MailMessage[];
  onSelectMessage?: (message: MailMessage) => void;
}

/**
 * Mail List Component
 * Displays a list of email messages
 */
export function MailList({ messages, onSelectMessage }: MailListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No messages</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <MailItem
          key={message.id}
          message={message}
          onSelect={onSelectMessage}
        />
      ))}
    </div>
  );
}
