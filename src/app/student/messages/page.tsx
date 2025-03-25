"use client";

import { useState } from "react";
import {
  ImageIcon,
  Info,
  PenBox,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from "lucide-react";

import { StudentLayout } from "~/components/layout/student-layout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

const chats = [
  {
    id: "1",
    name: "Sarah Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "See you tomorrow!",
    lastMessageTime: "2m",
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "The meeting went well",
    lastMessageTime: "1h",
  },
  {
    id: "3",
    name: "Emma Thompson",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Thanks for your help!",
    lastMessageTime: "2h",
  },
  {
    id: "4",
    name: "James Rodriguez",
    avatar: "/placeholder.svg?height=32&width=32",
    lastMessage: "Looking forward to it",
    lastMessageTime: "1d",
  },
];

const messages = [
  {
    sender: "other",
    content: "Hey, how are you?",
  },
  {
    sender: "me",
    content: "I'm good, thanks! How about you?",
  },
  {
    sender: "other",
    content: "Doing great! Are we still on for tomorrow?",
  },
  {
    sender: "me",
    content: "Yes, definitely! Same time and place?",
  },
  {
    sender: "other",
    content: "Perfect! See you tomorrow!",
  },
  {
    sender: "me",
    content: "See you tomorrow! 👋",
  },
];

export default function StudentMessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");

  return (
    <StudentLayout className="flex-row items-start gap-4">
      <TooltipProvider>
        <div className="bg-background flex h-screen flex-1">
          <div className="flex w-80 flex-col border-r">
            <div className="border-b p-4">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Chats</h1>

                <Button variant="ghost" size="icon">
                  <PenBox className="h-5 w-5" />
                  <span className="sr-only">New message</span>
                </Button>
              </div>

              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />

                <Input placeholder="Search Messenger" className="pl-8" />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-1 overflow-auto p-4">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={cn(
                    "hover:bg-accent flex w-full items-center gap-3 rounded-lg p-3",
                    selectedChat === chat.id && "bg-accent",
                  )}
                >
                  <Avatar>
                    <AvatarImage src={chat.avatar} />

                    <AvatarFallback>{chat.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{chat.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {chat.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-muted-foreground truncate text-sm">
                      {chat.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          {selectedChat ? (
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={chats.find((c) => c.id === selectedChat)?.avatar}
                    />
                    <AvatarFallback>
                      {chats
                        .find((c) => c.id === selectedChat)
                        ?.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">
                      {chats.find((c) => c.id === selectedChat)?.name}
                    </h2>
                    <p className="text-muted-foreground text-sm">Active now</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start a voice call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Video className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start a video call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Conversation information</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-auto p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      message.sender === "me" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div className="flex max-w-[70%] items-end gap-2">
                      {message.sender !== "me" && (
                        <Avatar className="size-8">
                          <AvatarImage
                            src={
                              chats.find((c) => c.id === selectedChat)?.avatar
                            }
                          />
                          <AvatarFallback>
                            {chats
                              .find((c) => c.id === selectedChat)
                              ?.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <Card
                        className={cn(
                          "p-3 text-sm",
                          message.sender === "me"
                            ? "bg-flush-orange-500 text-white"
                            : "",
                        )}
                      >
                        {message.content}
                      </Card>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="h-5 w-5" />
                    <span className="sr-only">Add image</span>
                  </Button>
                  <Input placeholder="Aa" className="flex-1" />
                  <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                    <span className="sr-only">Add emoji</span>
                  </Button>
                  <Button size="icon">
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </TooltipProvider>
    </StudentLayout>
  );
}
