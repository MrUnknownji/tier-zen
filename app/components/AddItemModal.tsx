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
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" },
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
      y: 20,
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
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

  const inputClasses = `w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all outline-none`;
  const tabButtonBase = `flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none`;
  const activeTabClasses = `bg-white dark:bg-slate-700 text-[var(--accent-color)] shadow-sm ring-1 ring-slate-200 dark:ring-slate-600`;
  const inactiveTabClasses = `text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800`;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 opacity-0`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg opacity-0 border border-slate-200 dark:border-slate-800`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            {itemToEdit ? "Edit Item" : "Add New Item"}
            </h2>
            <button onClick={handleClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="itemName"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Name <span className="text-[var(--accent-color)]">*</span>
            </label>
            <input
              id="itemName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Awesome Character"
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              Image Source
            </label>
            <div
              className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4"
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
                <Link2 size={16} className="inline mr-2" /> Image URL
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
                <UploadCloud size={16} className="inline mr-2" /> Upload File
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
                className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer border-slate-300 dark:border-slate-700 hover:border-[var(--accent-color)] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
              >
                <UploadCloud
                  size={32}
                  className="text-slate-400 group-hover:text-[var(--accent-color)] mb-3 transition-colors"
                />
                <span
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-[var(--accent-color)] transition-colors"
                >
                  Click to upload or drag & drop
                </span>
                <span
                  className="text-xs text-slate-500 mt-1"
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

            {(imagePreview || (!imagePreview && imageInputMode === "upload")) && (
              <div
                className="mt-4 p-4 border rounded-xl border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center h-40 bg-slate-50 dark:bg-slate-800/50 overflow-hidden relative"
              >
                {imagePreview ? (
                   <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain rounded shadow-sm z-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                   </>
                ) : (
                    <div className="text-center text-slate-400">
                        <ImageIcon size={40} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No image selected</p>
                    </div>
                )}
              </div>
            )}
          </div>

          <div
            className="flex justify-end gap-3 pt-6 mt-2"
          >
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium rounded-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {itemToEdit ? (
                <span className="flex items-center gap-2">
                  <CheckSquare size={18} /> Save Changes
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <PlusCircle size={18} /> Add Item
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
