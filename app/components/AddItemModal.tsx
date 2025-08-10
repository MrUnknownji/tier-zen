import React, { useState, useEffect, useRef } from "react";
import {
  PlusCircle,
  CheckSquare,
  UploadCloud,
  Link2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Item, ThemeClassNames } from "../lib/types";
import { gsap } from "gsap";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveItem: (data: Omit<Item, "id">, id?: string) => void;
  itemToEdit: Item | null;
  themeClassNames: ThemeClassNames;
}

export default function AddItemModal({
  isOpen,
  onClose,
  onSaveItem,
  itemToEdit,
  themeClassNames,
}: AddItemModalProps) {
  const [name, setName] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
      );

      if (itemToEdit) {
        setName(itemToEdit.name);
        if (
          itemToEdit.imageUrl &&
          itemToEdit.imageUrl.startsWith("data:image")
        ) {
          setImageInputMode("upload");
          setImagePreview(itemToEdit.imageUrl);
          setImageUrlInput("");
        } else {
          setImageInputMode("url");
          setImageUrlInput(itemToEdit.imageUrl || "");
          setImagePreview(itemToEdit.imageUrl || null);
        }
      } else {
        setName("");
        setImageUrlInput("");
        setImagePreview(null);
        setImageInputMode("url");
      }
    }
  }, [itemToEdit, isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, {
      y: 50,
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: onClose,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageUrlInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Item name is required.");
      return;
    }
    let finalImageUrl =
      imageInputMode === "upload" && imagePreview?.startsWith("data:image")
        ? imagePreview
        : imageUrlInput;
    const itemData = { name, imageUrl: finalImageUrl || undefined };
    itemToEdit ? onSaveItem(itemData, itemToEdit.id) : onSaveItem(itemData);
    handleClose();
  };

  if (!isOpen) return null;

  const inputClasses = `w-full p-3 border rounded-lg ${themeClassNames.inputBgColor} ${themeClassNames.inputBorderColor} ${themeClassNames.textColor} ${themeClassNames.placeholderColor} focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all`;
  const tabButtonBase = `flex-1 py-2.5 px-3 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--card-bg)] focus:ring-[var(--accent-color)]`;
  const activeTabClasses = `bg-[var(--accent-color)] text-black shadow-sm`;
  const inactiveTabClasses = `${themeClassNames.buttonInactiveBg} ${themeClassNames.buttonInactiveText} hover:bg-[var(--button-inactive-hover-bg)]`;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 ${themeClassNames.modalOverlayBg} flex items-center justify-center p-4 z-50 opacity-0`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`${themeClassNames.cardBgColor} p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg opacity-0`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl sm:text-3xl font-semibold ${themeClassNames.textColor}`}>
            {itemToEdit ? "Edit Item" : "Add New Item"}
            </h2>
            <button onClick={handleClose} className="p-1 rounded-full hover:bg-[var(--button-inactive-hover-bg)]">
                <X size={24} />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="itemName"
              className={`block text-sm font-medium mb-1.5 ${themeClassNames.textColor}`}
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="itemName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${themeClassNames.textColor}`}
            >
              Image Source
            </label>
            <div
              className={`flex gap-1 p-1 rounded-lg mb-3 ${themeClassNames.tabContainerBg}`}
            >
              <button
                type="button"
                onClick={() => {
                  setImageInputMode("url");
                  if (imageUrlInput) setImagePreview(imageUrlInput);
                  else if (!itemToEdit?.imageUrl?.startsWith("data:"))
                    setImagePreview(null);
                }}
                className={`${tabButtonBase} ${imageInputMode === "url" ? activeTabClasses : inactiveTabClasses}`}
              >
                <Link2 size={16} className="inline mr-1.5" /> URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageInputMode("upload");
                  if (!imagePreview?.startsWith("data:image"))
                    setImagePreview(null);
                }}
                className={`${tabButtonBase} ${imageInputMode === "upload" ? activeTabClasses : inactiveTabClasses}`}
              >
                <UploadCloud size={16} className="inline mr-1.5" /> Upload
              </button>
            </div>
            {imageInputMode === "url" ? (
              <input
                id="itemImageUrl"
                type="url"
                value={imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  setImagePreview(e.target.value || null);
                }}
                placeholder="https://example.com/image.png"
                className={inputClasses}
              />
            ) : (
              <label
                htmlFor="itemImageFile"
                className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer ${themeClassNames.inputBorderColor} hover:bg-[var(--button-inactive-hover-bg)] transition-colors`}
              >
                <UploadCloud
                  size={32}
                  className={`${themeClassNames.secondaryTextColor} mb-2`}
                />
                <span
                  className={`text-sm font-medium ${themeClassNames.textColor}`}
                >
                  Click to upload or drag & drop
                </span>
                <span
                  className={`text-xs ${themeClassNames.secondaryTextColor}`}
                >
                  SVG, PNG, JPG or GIF (Max 2MB)
                </span>
                <input
                  id="itemImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            )}
            {imagePreview && (
              <div
                className={`mt-4 p-2 border rounded-lg ${themeClassNames.borderColor} flex justify-center items-center h-32 bg-[var(--card-bg-subtle)]`}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            {!imagePreview && imageInputMode === "upload" && (
              <div
                className={`mt-4 p-2 border-2 border-dashed rounded-lg ${themeClassNames.borderColor} flex flex-col justify-center items-center h-32 text-center ${themeClassNames.secondaryTextColor} bg-[var(--card-bg-subtle)]`}
              >
                <ImageIcon size={32} className="mb-1" />{" "}
                <p className="text-sm">Image Preview</p>
              </div>
            )}
          </div>
          <div
            className={`flex justify-end gap-3 pt-4 border-t ${themeClassNames.borderColor} mt-8`}
          >
            <button
              type="button"
              onClick={handleClose}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg ${themeClassNames.buttonInactiveBg} ${themeClassNames.buttonInactiveText} ${themeClassNames.buttonInactiveHoverBg} transition-colors shadow hover:shadow-md`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent-color)] text-black hover:bg-opacity-90 transition-colors shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:ring-[var(--accent-color)]`}
            >
              {itemToEdit ? (
                <>
                  <CheckSquare size={18} className="inline mr-1.5" /> Save
                  Changes
                </>
              ) : (
                <>
                  <PlusCircle size={18} className="inline mr-1.5" /> Add Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
