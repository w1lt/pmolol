"use client";

import React, {
  useState,
  ChangeEvent,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { useRouter } from "next/navigation";
// Import Prisma types - these will be available after prisma generate
import {
  Page as PrismaPage,
  ContentBlock as PrismaContentBlock,
  ContentType,
} from "@prisma/client";
// import { useDropzone } from "react-dropzone"; // Commented out
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  ExternalLink,
  GripVertical,
  Type,
  Link as LinkIcon,
  Heading1,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  updatePage,
  updatePageContentBlocks,
  ClientContentBlock,
} from "@/lib/actions";
import type { UpdatePageParams } from "@/lib/actions";
import Image from "next/image";
import DynamicLucideIcon from "../icons/DynamicLucideIcon";
import IconPicker from "../icons/IconPicker";

// Define props type for the PageEditor component
type PageEditorProps = {
  initialData: Omit<PrismaPage, "profileImage"> & {
    contentBlocks: PrismaContentBlock[];
    showWatermark?: boolean;
  };
};

// Color Preset definitions
const colorPresets = [
  {
    name: "Light",
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    accentColor: "#3B82F6",
  },
  {
    name: "Dark",
    backgroundColor: "#1F2937", // Cool Gray 700
    textColor: "#F3F4F6", // Cool Gray 100
    accentColor: "#60A5FA", // Blue 400
  },
  {
    name: "Midnight",
    backgroundColor: "#111827", // Gray 900
    textColor: "#D1D5DB", // Gray 300
    accentColor: "#818CF8", // Indigo 400
  },
  {
    name: "Sunset",
    backgroundColor: "#FFFBEB", // Amber 50
    textColor: "#422006", // Amber 950
    accentColor: "#F97316", // Orange 500
  },
  {
    name: "Forest",
    backgroundColor: "#F0FDF4", // Green 50
    textColor: "#14532D", // Green 900
    accentColor: "#22C55E", // Green 500
  },
];

// Define skeleton outside or as a memoized constant if used in multiple places with same style
const iconSkeleton = (size: number = 20, extraClass: string = "") => (
  <span
    style={{ width: size, height: size }}
    className={`inline-block align-middle animate-pulse bg-muted rounded ${extraClass}`}
  ></span>
);

export function PageEditor({ initialData }: PageEditorProps) {
  const router = useRouter();

  const {
    id,
    slug,
    title,
    description,
    bannerImage,
    backgroundColor,
    textColor,
    accentColor,
    fontFamily,
    userId,
    createdAt,
    updatedAt,
    aliases,
    showWatermark,
  } = initialData;

  const initialPageValues: Omit<
    PrismaPage,
    "profileImage" | "contentBlocks"
  > & { showWatermark?: boolean } = {
    id,
    slug,
    title,
    description,
    bannerImage,
    backgroundColor,
    textColor,
    accentColor,
    fontFamily,
    userId,
    createdAt,
    updatedAt,
    aliases,
    showWatermark: typeof showWatermark === "boolean" ? showWatermark : true,
  };

  const [page, setPage] = useState(initialPageValues);
  const [contentBlocks, setContentBlocks] = useState<PrismaContentBlock[]>(
    initialData.contentBlocks || []
  );
  const [previewUrl, setPreviewUrl] = useState(`/${initialData.slug}`);

  const [hasPendingPageChanges, setHasPendingPageChanges] = useState(false);
  const [hasPendingBlocksChanges, setHasPendingBlocksChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChangesToastId, setUnsavedChangesToastId] = useState<
    string | number | undefined
  >();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [rootUrl, setRootUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setRootUrl(window.location.origin);
    }
  }, []);

  const handleSaveChanges = useCallback(async () => {
    if (!hasPendingPageChanges && !hasPendingBlocksChanges) {
      toast.info("No changes to save.");
      return;
    }

    setIsSaving(true);
    if (unsavedChangesToastId) {
      toast.dismiss(unsavedChangesToastId);
      setUnsavedChangesToastId(undefined);
    }

    const savingPromise = async () => {
      if (hasPendingPageChanges) {
        const pageDataToSave: UpdatePageParams = {
          id: page.id,
          ...(page.title !== initialData.title && { title: page.title }),
          ...(page.description !== initialData.description && {
            description:
              page.description === null ? undefined : page.description,
          }),
          ...(page.slug !== initialData.slug && { slug: page.slug }),
          ...(page.bannerImage !== initialData.bannerImage && {
            bannerImage:
              page.bannerImage === null ? undefined : page.bannerImage,
          }),
          ...(page.fontFamily !== initialData.fontFamily && {
            fontFamily: page.fontFamily === null ? undefined : page.fontFamily,
          }),
          ...(page.backgroundColor !== initialData.backgroundColor && {
            backgroundColor:
              page.backgroundColor === null ? undefined : page.backgroundColor,
          }),
          ...(page.textColor !== initialData.textColor && {
            textColor: page.textColor === null ? undefined : page.textColor,
          }),
          ...(page.accentColor !== initialData.accentColor && {
            accentColor:
              page.accentColor === null ? undefined : page.accentColor,
          }),
          ...(JSON.stringify(page.aliases) !==
            JSON.stringify(initialData.aliases) && {
            aliases: page.aliases,
          }),
          ...(typeof page.showWatermark === "boolean" &&
            page.showWatermark !== (initialData.showWatermark ?? true) && {
              showWatermark: page.showWatermark,
            }),
        };
        if (Object.keys(pageDataToSave).length > 1) {
          await updatePage(pageDataToSave);
          setHasPendingPageChanges(false);
        }
      }

      if (hasPendingBlocksChanges) {
        const clientBlocks: ClientContentBlock[] = contentBlocks.map(
          (block) => ({
            id: block.id,
            type: block.type,
            position: block.position,
            title: block.title,
            url: block.url,
            icon: block.icon,
            textContent: block.textContent,
          })
        );
        await updatePageContentBlocks({
          pageId: page.id,
          contentBlocks: clientBlocks,
        });
        setHasPendingBlocksChanges(false);
      }
      router.refresh();
    };

    toast.promise(savingPromise(), {
      loading: "Saving changes...",
      success: () => {
        setIsSaving(false);
        return "Your changes have been saved!";
      },
      error: (err) => {
        setIsSaving(false);
        console.error("Error saving changes:", err);
        return err instanceof Error
          ? err.message
          : "Could not save changes. Please try again.";
      },
    });
  }, [
    page,
    contentBlocks,
    initialData,
    hasPendingPageChanges,
    hasPendingBlocksChanges,
    router,
    unsavedChangesToastId,
  ]);

  const handleSaveChangesRef = useRef(handleSaveChanges);
  useEffect(() => {
    handleSaveChangesRef.current = handleSaveChanges;
  }, [handleSaveChanges]);

  useEffect(() => {
    const shouldShowToast =
      (hasPendingPageChanges || hasPendingBlocksChanges) && !isSaving;

    if (shouldShowToast) {
      if (!unsavedChangesToastId) {
        const newToastId = toast("You have unsaved changes.", {
          duration: Infinity,
          action: {
            label: "Save Changes",
            onClick: () => handleSaveChangesRef.current(),
          },
          onDismiss: () => {
            setUnsavedChangesToastId(undefined);
          },
        });
        setUnsavedChangesToastId(newToastId);
      }
    } else {
      if (unsavedChangesToastId) {
        toast.dismiss(unsavedChangesToastId);
      }
    }
  }, [
    hasPendingPageChanges,
    hasPendingBlocksChanges,
    isSaving,
    unsavedChangesToastId,
  ]);

  const handlePageChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (name === "slug") setPreviewUrl(`/${value}`);

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setPage((prev) => ({ ...prev, [name]: checked }));
    } else {
      setPage((prev) => ({ ...prev, [name]: value }));
    }
    setHasPendingPageChanges(true);
  };

  const applyColorPreset = (preset: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  }) => {
    setPage((prev) => ({
      ...prev,
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
      accentColor: preset.accentColor,
    }));
    setHasPendingPageChanges(true);
  };

  const handleContentBlockChange = (
    id: string,
    field: keyof ClientContentBlock,
    value: string | number | null
  ) => {
    setContentBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, [field]: value } : block
      )
    );
    setHasPendingBlocksChanges(true);
  };

  const addContentBlock = (type: ContentType) => {
    let newBlockData: Omit<
      PrismaContentBlock,
      "id" | "pageId" | "createdAt" | "updatedAt" | "clicks"
    >;
    let newItems = [...contentBlocks];

    if (type === ContentType.HEADER) {
      newBlockData = {
        type,
        position: 0, // HEADER always goes to the top
        title: "Your Page Title",
        textContent: "Optional subheading for your page...",
        url: null,
        icon: null,
      };
      // Shift positions of other blocks
      newItems = newItems.map((block) => ({
        ...block,
        position: block.position + 1,
      }));
      newItems.unshift({
        ...newBlockData,
        id: `temp-${Date.now()}`,
        pageId: page.id,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PrismaContentBlock);
    } else {
      const newPosition =
        newItems.length > 0
          ? Math.max(...newItems.map((block) => block.position)) + 1
          : 0;
      newBlockData = {
        type,
        position: newPosition,
        title: type === ContentType.LINK ? "New Link" : "New Text Block",
        url: type === ContentType.LINK ? "https://" : null,
        icon: null,
        textContent:
          type === ContentType.TEXT ? "Start writing your text here..." : null,
      };
      newItems.push({
        ...newBlockData,
        id: `temp-${Date.now()}`,
        pageId: page.id,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PrismaContentBlock);
    }

    setContentBlocks(
      newItems.map((item, index) => ({ ...item, position: index }))
    ); // Re-normalize positions
    setHasPendingBlocksChanges(true);
  };

  const deleteContentBlock = (id: string) => {
    setContentBlocks((prev) => prev.filter((block) => block.id !== id));
    setHasPendingBlocksChanges(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setContentBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        const updatedItemsWithPosition = newItems.map((item, index) => ({
          ...item,
          position: index,
        }));
        setHasPendingBlocksChanges(true);
        return updatedItemsWithPosition;
      });
    }
  };

  const navItems = [
    {
      href: `${previewUrl.startsWith("/") ? previewUrl : "/" + previewUrl}`,
      label: "View Live Website",
    },
  ];

  return (
    <div className="container py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Edit Your Page Content</h1>
          <p className="text-muted-foreground">
            Manage your links and text blocks.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {navItems.map((item) => (
            <Button key={item.href} variant="outline" asChild>
              <a
                href={item.href}
                target={item.label !== "Dashboard" ? "_blank" : "_self"}
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-xl font-semibold">Content Blocks</h2>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    onClick={() => addContentBlock(ContentType.LINK)}
                    className="hover:cursor-pointer"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link
                  </Button>
                  <Button
                    onClick={() => addContentBlock(ContentType.TEXT)}
                    className="hover:cursor-pointer"
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Text
                  </Button>
                  <Button
                    onClick={() => addContentBlock(ContentType.HEADER)}
                    className="hover:cursor-pointer"
                  >
                    <Heading1 className="h-4 w-4 mr-2" />
                    Header
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {typeof window !== "undefined" && mounted && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={contentBlocks.map((block) => block.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {contentBlocks.map((block) => (
                        <SortableContentBlock
                          key={block.id}
                          block={block}
                          onDelete={deleteContentBlock}
                          onChange={handleContentBlockChange}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}

                {/* Message for when DND is not ready or no blocks */}
                {(!mounted || contentBlocks.length === 0) && (
                  <div className="text-center py-12 border-2 border-dashed rounded-md">
                    {contentBlocks.length === 0 && !mounted && (
                      <p className="text-muted-foreground mb-4">
                        Loading editor...
                      </p>
                    )}
                    {contentBlocks.length === 0 && mounted && (
                      <p className="text-muted-foreground">
                        No content yet. Add your first block!
                      </p>
                    )}
                    <Button
                      onClick={() => addContentBlock(ContentType.LINK)}
                      variant="outline"
                      className="mt-4 mr-2"
                      disabled={!mounted} // Disable if not mounted
                    >
                      <LinkIcon className="h-4 w-4 mr-2" /> Add Link
                    </Button>
                    <Button
                      onClick={() => addContentBlock(ContentType.TEXT)}
                      variant="outline"
                      className="mt-4 mr-2"
                      disabled={!mounted}
                    >
                      <Type className="h-4 w-4 mr-2" /> Add Text
                    </Button>
                    <Button
                      onClick={() => addContentBlock(ContentType.HEADER)}
                      variant="outline"
                      className="mt-4"
                      disabled={!mounted}
                    >
                      <Heading1 className="h-4 w-4 mr-2" /> Add Header
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-20">
                <h2 className="text-xl font-semibold mb-4">Preview</h2>
                <div className="border rounded-md p-4 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">
                      {rootUrl}
                      {previewUrl.startsWith("/")
                        ? previewUrl
                        : `/${previewUrl}`}
                    </p>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`${rootUrl}${
                          previewUrl.startsWith("/")
                            ? previewUrl
                            : `/${previewUrl}`
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <div
                    className="min-h-[500px] border rounded-md overflow-auto"
                    style={
                      {
                        backgroundColor: page.backgroundColor || "#FFFFFF",
                        color: page.textColor || "#000000",
                        fontFamily: page.fontFamily || "sans-serif",
                        "--bg-color": page.backgroundColor || "#FFFFFF",
                        "--text-color": page.textColor || "#000000",
                        "--accent-color": page.accentColor || "#3B82F6",
                      } as React.CSSProperties
                    }
                  >
                    <div className="max-w-md mx-auto space-y-8 py-8 px-4 md:py-12">
                      {page.bannerImage && (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-lg">
                          <Image
                            src={page.bannerImage}
                            alt={`${page.title} banner preview`}
                            fill
                            sizes="(max-width: 768px) 100vw, 768px"
                            className="object-cover"
                            key={page.bannerImage}
                          />
                        </div>
                      )}

                      {(() => {
                        const editorHeaderBlock = contentBlocks.find(
                          (block) => block.type === ContentType.HEADER
                        );
                        const previewDisplayTitle = editorHeaderBlock
                          ? editorHeaderBlock.title
                          : page.title;
                        const previewDisplayDescription = editorHeaderBlock
                          ? editorHeaderBlock.textContent
                          : page.description;
                        return (
                          <div className="flex flex-col items-center text-center pt-4">
                            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-color)]">
                              {previewDisplayTitle || "Untitled Page"}
                            </h1>
                            {previewDisplayDescription && (
                              <p className="mt-3 text-base opacity-90 text-[var(--text-color)]">
                                {previewDisplayDescription}
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      <div className="space-y-4 pt-4">
                        {contentBlocks
                          .filter((block) => block.type !== ContentType.HEADER)
                          .map((block) => {
                            if (block.type === ContentType.LINK) {
                              return (
                                <div key={block.id}>
                                  <div
                                    className="block w-full p-4 rounded-xl shadow-md bg-[var(--accent-color)] text-white cursor-pointer truncate"
                                    style={{
                                      backgroundColor:
                                        page.accentColor || "#3B82F6",
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-lg truncate">
                                        {block.title || "Untitled Link"}
                                      </span>
                                      {block.icon && (
                                        <Suspense
                                          fallback={iconSkeleton(20, "text-xl")}
                                        >
                                          <DynamicLucideIcon
                                            name={block.icon}
                                            className="text-xl text-white"
                                            key={`preview-content-${block.id}-${block.icon}`}
                                          />
                                        </Suspense>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            if (block.type === ContentType.TEXT) {
                              return (
                                <div
                                  key={block.id}
                                  className="p-4 rounded-lg bg-background/20 shadow text-[var(--text-color)]"
                                >
                                  {block.title && (
                                    <h2 className="text-xl font-semibold mb-2">
                                      {block.title}
                                    </h2>
                                  )}
                                  {block.textContent && (
                                    <div
                                      className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words"
                                      dangerouslySetInnerHTML={{
                                        __html: block.textContent.replace(
                                          /\n/g,
                                          "<br />"
                                        ),
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <h2 className="text-xl font-semibold">Page Styling</h2>

              {/* Color Presets Section */}
              <div>
                <Label>Color Presets</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyColorPreset(preset)}
                      className="w-full flex flex-col h-auto p-2 justify-start items-start group"
                    >
                      <span className="font-medium text-sm mb-1.5">
                        {preset.name}
                      </span>
                      <div className="flex space-x-1.5 w-full">
                        <div
                          className="h-4 w-1/3 rounded-sm border group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: preset.backgroundColor }}
                        />
                        <div
                          className="h-4 w-1/3 rounded-sm border group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: preset.textColor }}
                        />
                        <div
                          className="h-4 w-1/3 rounded-sm border group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: preset.accentColor }}
                        />
                      </div>
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Select a preset or define custom colors below.
                </p>
              </div>

              <div>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Input
                  id="fontFamily"
                  name="fontFamily"
                  value={page.fontFamily || ""}
                  onChange={handlePageChange}
                  className="mt-2"
                  placeholder="e.g., Inter, Roboto, Arial"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a font name. Ensure it&apos;s a web-safe font or
                  imported in your project.
                </p>
              </div>
              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <Input
                  id="backgroundColor"
                  name="backgroundColor"
                  type="color"
                  value={page.backgroundColor || "#FFFFFF"}
                  onChange={handlePageChange}
                  className="mt-2 h-10"
                />
              </div>
              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <Input
                  id="textColor"
                  name="textColor"
                  type="color"
                  value={page.textColor || "#000000"}
                  onChange={handlePageChange}
                  className="mt-2 h-10"
                />
              </div>
              <div>
                <Label htmlFor="accentColor">
                  Accent Color (Links/Buttons)
                </Label>
                <Input
                  id="accentColor"
                  name="accentColor"
                  type="color"
                  value={page.accentColor || "#3B82F6"}
                  onChange={handlePageChange}
                  className="mt-2 h-10"
                />
              </div>
              <div>
                <Label htmlFor="bannerImage">Banner Image URL (Optional)</Label>
                <Input
                  id="bannerImage"
                  name="bannerImage"
                  value={page.bannerImage || ""}
                  onChange={handlePageChange}
                  className="mt-2"
                  placeholder="https://example.com/your-banner.jpg"
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="sticky top-20">
                <h2 className="text-xl font-semibold mb-4">Preview</h2>
                <div className="border rounded-md p-4 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">
                      {rootUrl}
                      {previewUrl.startsWith("/")
                        ? previewUrl
                        : `/${previewUrl}`}
                    </p>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`${rootUrl}${
                          previewUrl.startsWith("/")
                            ? previewUrl
                            : `/${previewUrl}`
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <div
                    className="min-h-[500px] border rounded-md overflow-auto"
                    style={
                      {
                        backgroundColor: page.backgroundColor || "#FFFFFF",
                        color: page.textColor || "#000000",
                        fontFamily: page.fontFamily || "sans-serif",
                        "--bg-color": page.backgroundColor || "#FFFFFF",
                        "--text-color": page.textColor || "#000000",
                        "--accent-color": page.accentColor || "#3B82F6",
                      } as React.CSSProperties
                    }
                  >
                    <div className="max-w-md mx-auto space-y-8 py-8 px-4 md:py-12">
                      {page.bannerImage && (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-lg">
                          <Image
                            src={page.bannerImage}
                            alt={`${page.title} banner preview`}
                            fill
                            sizes="(max-width: 768px) 100vw, 768px"
                            className="object-cover"
                            key={page.bannerImage}
                          />
                        </div>
                      )}

                      {(() => {
                        const editorHeaderBlock = contentBlocks.find(
                          (block) => block.type === ContentType.HEADER
                        );
                        const previewDisplayTitle = editorHeaderBlock
                          ? editorHeaderBlock.title
                          : page.title;
                        const previewDisplayDescription = editorHeaderBlock
                          ? editorHeaderBlock.textContent
                          : page.description;
                        return (
                          <div className="flex flex-col items-center text-center pt-4">
                            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-color)]">
                              {previewDisplayTitle || "Untitled Page"}
                            </h1>
                            {previewDisplayDescription && (
                              <p className="mt-3 text-base opacity-90 text-[var(--text-color)]">
                                {previewDisplayDescription}
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      <div className="space-y-4 pt-4">
                        {contentBlocks
                          .filter((block) => block.type !== ContentType.HEADER)
                          .map((block) => {
                            if (block.type === ContentType.LINK) {
                              return (
                                <div key={block.id}>
                                  <div
                                    className="block w-full p-4 rounded-xl shadow-md bg-[var(--accent-color)] text-white cursor-pointer truncate"
                                    style={{
                                      backgroundColor:
                                        page.accentColor || "#3B82F6",
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-lg truncate">
                                        {block.title || "Untitled Link"}
                                      </span>
                                      {block.icon && (
                                        <Suspense
                                          fallback={iconSkeleton(20, "text-xl")}
                                        >
                                          <DynamicLucideIcon
                                            name={block.icon}
                                            className="text-xl text-white"
                                            key={`preview-appearance-${block.id}-${block.icon}`}
                                          />
                                        </Suspense>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            if (block.type === ContentType.TEXT) {
                              return (
                                <div
                                  key={block.id}
                                  className="p-4 rounded-lg bg-background/20 shadow text-[var(--text-color)]"
                                >
                                  {block.title && (
                                    <h2 className="text-xl font-semibold mb-2">
                                      {block.title}
                                    </h2>
                                  )}
                                  {block.textContent && (
                                    <div
                                      className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words"
                                      dangerouslySetInnerHTML={{
                                        __html: block.textContent.replace(
                                          /\n/g,
                                          "<br />"
                                        ),
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={page.title}
                      onChange={handlePageChange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">
                      Description{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={page.description || ""}
                      onChange={handlePageChange}
                      className="mt-2 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">URL Settings</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="slug">Custom URL</Label>
                    <div className="flex mt-2">
                      <div className="bg-muted rounded-l-md px-3 py-2 text-sm border border-r-0">
                        pmo.lol/
                      </div>
                      <Input
                        id="slug"
                        name="slug"
                        value={page.slug}
                        onChange={handlePageChange}
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="aliases">
                      URL Aliases{" "}
                      <span className="text-muted-foreground">
                        (optional, up to 3)
                      </span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add additional URLs that redirect to your page.
                    </p>
                    <div className="space-y-2">
                      {[0, 1, 2].map((index) => (
                        <Input
                          key={`alias-${index}`}
                          id={`alias-${index}`}
                          name={`alias-${index}`}
                          value={(page.aliases || [])[index] || ""}
                          onChange={(e) => {
                            const newAliases = [...(page.aliases || [])];
                            // Ensure array has enough elements up to current index, padded with empty strings if necessary
                            while (newAliases.length <= index) {
                              newAliases.push("");
                            }
                            newAliases[index] = e.target.value.trim();
                            // Filter out empty strings at the end, but keep initial empty strings if user is editing them
                            // This logic ensures that if a user clears an input, it becomes an empty string in the array
                            // and then we filter out truly empty aliases before saving or processing.
                            // For the state, we want to keep them to represent the input fields.
                            setPage((prev) => ({
                              ...prev,
                              aliases: newAliases.filter(
                                (alias) =>
                                  alias !== "" ||
                                  newAliases
                                    .slice(index + 1)
                                    .some((a) => a !== "")
                              ),
                            }));
                            setHasPendingPageChanges(true);
                          }}
                          className="font-mono text-sm"
                          placeholder={`your-alias-${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Preferences</h2>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showWatermark"
                    name="showWatermark"
                    checked={page.showWatermark}
                    onCheckedChange={(checked: boolean) => {
                      setPage((prev) => ({ ...prev, showWatermark: checked }));
                      setHasPendingPageChanges(true);
                    }}
                  />
                  <Label
                    htmlFor="showWatermark"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show &quot;Made with pmo.lol&quot; watermark on page
                  </Label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-3">
                <h2 className="text-xl font-semibold mb-4">Preview</h2>
                <div className="border rounded-md p-4 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">
                      {rootUrl}
                      {previewUrl.startsWith("/")
                        ? previewUrl
                        : `/${previewUrl}`}
                    </p>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`${rootUrl}${
                          previewUrl.startsWith("/")
                            ? previewUrl
                            : `/${previewUrl}`
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <div
                    className="min-h-[500px] border rounded-md overflow-auto"
                    style={
                      {
                        backgroundColor: page.backgroundColor || "#FFFFFF",
                        color: page.textColor || "#000000",
                        fontFamily: page.fontFamily || "sans-serif",
                        "--bg-color": page.backgroundColor || "#FFFFFF",
                        "--text-color": page.textColor || "#000000",
                        "--accent-color": page.accentColor || "#3B82F6",
                      } as React.CSSProperties
                    }
                  >
                    <div className="max-w-md mx-auto space-y-8 py-8 px-4 md:py-12">
                      {page.bannerImage && (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-lg">
                          <Image
                            src={page.bannerImage}
                            alt={`${page.title} banner preview`}
                            fill
                            sizes="(max-width: 768px) 100vw, 768px"
                            className="object-cover"
                            key={page.bannerImage}
                          />
                        </div>
                      )}

                      {(() => {
                        const editorHeaderBlock = contentBlocks.find(
                          (block) => block.type === ContentType.HEADER
                        );
                        const previewDisplayTitle = editorHeaderBlock
                          ? editorHeaderBlock.title
                          : page.title;
                        const previewDisplayDescription = editorHeaderBlock
                          ? editorHeaderBlock.textContent
                          : page.description;
                        return (
                          <div className="flex flex-col items-center text-center pt-4">
                            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-color)]">
                              {previewDisplayTitle || "Untitled Page"}
                            </h1>
                            {previewDisplayDescription && (
                              <p className="mt-3 text-base opacity-90 text-[var(--text-color)]">
                                {previewDisplayDescription}
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      <div className="space-y-4 pt-4">
                        {contentBlocks
                          .filter((block) => block.type !== ContentType.HEADER)
                          .map((block) => {
                            if (block.type === ContentType.LINK) {
                              return (
                                <div key={block.id}>
                                  <div
                                    className="block w-full p-4 rounded-xl shadow-md bg-[var(--accent-color)] text-white cursor-pointer truncate"
                                    style={{
                                      backgroundColor:
                                        page.accentColor || "#3B82F6",
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-lg truncate">
                                        {block.title || "Untitled Link"}
                                      </span>
                                      {block.icon && (
                                        <Suspense
                                          fallback={iconSkeleton(20, "text-xl")}
                                        >
                                          <DynamicLucideIcon
                                            name={block.icon}
                                            className="text-xl text-white"
                                            key={`preview-settings-${block.id}-${block.icon}`}
                                          />
                                        </Suspense>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            if (block.type === ContentType.TEXT) {
                              return (
                                <div
                                  key={block.id}
                                  className="p-4 rounded-lg bg-background/20 shadow text-[var(--text-color)]"
                                >
                                  {block.title && (
                                    <h2 className="text-xl font-semibold mb-2">
                                      {block.title}
                                    </h2>
                                  )}
                                  {block.textContent && (
                                    <div
                                      className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words"
                                      dangerouslySetInnerHTML={{
                                        __html: block.textContent.replace(
                                          /\n/g,
                                          "<br />"
                                        ),
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SortableContentBlock({
  block,
  onChange,
  onDelete,
}: {
  block: PrismaContentBlock;
  onChange: (
    id: string,
    field: keyof ClientContentBlock,
    value: string | number | null
  ) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleIconSelected = (iconName: string) => {
    onChange(block.id, "icon", iconName);
    setIsIconPickerOpen(false);
  };

  const buttonIconSize = 20; // h-5 w-5 translates to 20px

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div className="flex flex-col items-center justify-center h-full self-center">
              <div className="flex flex-col items-center gap-2">
                {/* Block type indicator with colored badge */}
                <div className="flex items-center justify-center">
                  {block.type === ContentType.LINK && (
                    <div className="bg-blue-100 text-blue-700 p-1.5 rounded-md border border-blue-200">
                      <LinkIcon className="h-3 w-3" />
                    </div>
                  )}
                  {block.type === ContentType.TEXT && (
                    <div className="bg-green-100 text-green-700 p-1.5 rounded-md border border-green-200">
                      <Type className="h-3 w-3" />
                    </div>
                  )}
                  {block.type === ContentType.HEADER && (
                    <div className="bg-purple-100 text-purple-700 p-1.5 rounded-md border border-purple-200">
                      <Heading1 className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Grab handle with distinct styling */}
                <button
                  {...attributes}
                  {...listeners}
                  className="touch-none cursor-grab active:cursor-grabbing p-1.5"
                >
                  <GripVertical className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                {block.type === ContentType.LINK ? (
                  // For links, show title input and icon button in same row
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id={`block-title-${block.id}`}
                      value={block.title || ""}
                      onChange={(e) =>
                        onChange(block.id, "title", e.target.value)
                      }
                      className="flex-1"
                      placeholder="Enter link title"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsIconPickerOpen(true)}
                      className="flex-shrink-0"
                      title={block.icon ? `Icon: ${block.icon}` : "Choose Icon"}
                    >
                      <Suspense
                        fallback={iconSkeleton(buttonIconSize, "flex-shrink-0")}
                      >
                        {block.icon ? (
                          <DynamicLucideIcon
                            name={block.icon}
                            className="h-4 w-4"
                            key={`editor-${block.id}-${block.icon}`}
                            size={16}
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Suspense>
                    </Button>
                  </div>
                ) : (
                  // For other block types, show normal input
                  <Input
                    id={`block-title-${block.id}`}
                    value={block.title || ""}
                    onChange={(e) =>
                      onChange(block.id, "title", e.target.value)
                    }
                    className="mt-1"
                    placeholder={
                      block.type === ContentType.TEXT
                        ? "Enter optional header for text block"
                        : "Enter main page title"
                    }
                  />
                )}
              </div>

              {/* Icon picker modal for links */}
              {block.type === ContentType.LINK && (
                <IconPicker
                  isOpen={isIconPickerOpen}
                  onOpenChange={setIsIconPickerOpen}
                  onSelectIcon={handleIconSelected}
                />
              )}

              {block.type === ContentType.LINK && (
                <div>
                  <Input
                    id={`block-url-${block.id}`}
                    value={block.url || ""}
                    onChange={(e) => onChange(block.id, "url", e.target.value)}
                    className="mt-1"
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {block.type === ContentType.TEXT && (
                <div>
                  <Label htmlFor={`block-text-${block.id}`}>Text Content</Label>
                  <Textarea
                    id={`block-text-${block.id}`}
                    value={block.textContent || ""}
                    onChange={(e) =>
                      onChange(block.id, "textContent", e.target.value)
                    }
                    className="mt-1 min-h-[120px]"
                    placeholder="Enter your text content here."
                  />
                </div>
              )}

              {block.type === ContentType.HEADER && (
                <div>
                  <Input
                    id={`block-text-${block.id}`}
                    value={block.textContent || ""}
                    onChange={(e) =>
                      onChange(block.id, "textContent", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Optional subheading"
                  />
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(block.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:cursor-pointer "
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
