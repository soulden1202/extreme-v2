"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { addComment } from "@/actions/comments";
import { Loader2 } from "lucide-react";
import { searchUsers } from "@/actions/users";

interface CommentFormProps {
  videoId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function CommentForm({ videoId, parentId, onSuccess, onCancel, autoFocus }: CommentFormProps) {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simple debounce implementation inside component for now
  const searchTimeout = useRef<NodeJS.Timeout>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Detect last word starting with @ 
    const words = newText.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord && lastWord.startsWith("@") && lastWord.length > 1) {
        const query = lastWord.slice(1);
        setMentionQuery(query);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            const results = await searchUsers(query);
            setMentionResults(results);
        }, 300);
    } else {
        setMentionQuery(null);
        setMentionResults([]);
    }
  };

  const handleSelectUser = (userName: string) => {
      const words = text.split(/\s+/);
      words.pop(); // remove the partial @mention
      const newText = [...words, `@${userName} `].join(" ");
      setText(newText);
      setMentionQuery(null);
      setMentionResults([]);
      textareaRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
        await addComment(videoId, text, parentId);
        setText("");
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error("Failed to post comment", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setText("");
    if (onCancel) onCancel();
  };

  if (!user) {
    return (
        <div className="flex gap-4 items-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Log in to comment</p>
        </div>
    );
  }

  return (
    <div className="flex gap-4 w-full relative">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={user.imageUrl} />
        <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2 relative">
        {mentionResults.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-background border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                {mentionResults.map(u => (
                    <button
                        key={u.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2"
                        onClick={() => handleSelectUser(u.name)}
                    >
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={u.imageUrl} />
                            <AvatarFallback>{u.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                    </button>
                ))}
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex-1 space-y-2">
            <Textarea 
                ref={textareaRef}
                placeholder={parentId ? "Add a reply..." : "Add a comment..."}
                value={text} 
                onChange={handleTextChange}
                className="min-h-[80px] bg-background resize-y"
                autoFocus={autoFocus}
            />
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" size="sm" disabled={isSubmitting || !text.trim()}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {parentId ? "Reply" : "Comment"}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
