"use client";

import type { AI } from "@/app/_actions/ai";
import { createClassifiedAction } from "@/app/_actions/classified";
import { ClassifiedAISchema } from "@/app/schemas/classified-ai.schema";
import {
  SingleImageSchema,
  type SingleImageType,
} from "@/app/schemas/images.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { readStreamableValue, useActions, useUIState } from "ai/rsc";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { ImageUploader } from "./single-image-uploader";
import type { StreamableSkeletonProps } from "./streamable-skeleton";

export const CreateClassifiedDialog = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, startUploadTransition] = useTransition();
  const [isCreating, startCreateTransition] = useTransition();
  const { generateClassified } = useActions<typeof AI>();
  const [messages, setMessages] = useUIState<typeof AI>();

  const imageForm = useForm<SingleImageType>({
    resolver: zodResolver(SingleImageSchema),
  });
  const createForm = useForm<StreamableSkeletonProps>({
    //@ts-ignore
    resolver: zodResolver(
      ClassifiedAISchema.extend({
        make: z.object({
          id: z.number().int(),
          name: z.string(),
          image: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
      })
    ),
  });

  const handleImageUpload = (url: string) => {
    imageForm.setValue("image", url);
  };

  const onImageSubmit: SubmitHandler<SingleImageType> = (data) => {
    startUploadTransition(async () => {
      const responseMessage = await generateClassified(data.image);
      if (!responseMessage) return;
      setMessages((currentMessages) => [...currentMessages, responseMessage]);
      for await (const value of readStreamableValue(
        responseMessage.classified
      )) {
        if (value) createForm.reset(value);
      }
    });
  };

  const onCreateSubmit: SubmitHandler<StreamableSkeletonProps> = (data) => {
    startCreateTransition(async () => {
      setMessages([]);
      const { success, message } = await createClassifiedAction(data);

      if (!success) {
        toast({
          title: "Error",
          description: message,
          type: "background",
          duration: 2500,
          variant: "destructive",
        });

        return;
      }
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button className="ml-4" size="sm">
          Create New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-4xl bg-white text-black p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-semibold">
            Create New Classified
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {messages.length ? (
            <Form {...createForm}>
              <form
                className="space-y-6"
                onSubmit={createForm.handleSubmit(onCreateSubmit)}
              >
                <div className="grid grid-cols-1 gap-6">
                  {messages.map((message) => (
                    <div className="w-full rounded-lg" key={message.id}>
                      {message.display}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isCreating || isUploading}
                    type="submit"
                    className="flex items-center gap-x-2 px-4"
                  >
                    {isCreating || isUploading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : null}
                    {isUploading ? "Uploading..." : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...imageForm}>
              <form
                className="space-y-6"
                onSubmit={imageForm.handleSubmit(onImageSubmit)}
              >
                <div className="w-full flex justify-center p-4">
                  <div className="w-full max-w-2xl">
                    <ImageUploader onUploadComplete={handleImageUpload} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isUploading}
                    type="submit"
                    className="flex items-center gap-x-2 px-4"
                  >
                    {isUploading && (
                      <Loader2 className="animate-spin h-4 w-4" />
                    )}
                    Upload
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
