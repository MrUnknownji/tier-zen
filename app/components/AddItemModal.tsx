// app/components/AddItemModal.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { PlusCircle, CheckSquare, UploadCloud, Link2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import type { Item } from '../types';
import { useSettings } from '../contexts/SettingsContext';

export interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveItem: (data: Omit<Item, "id">, id?: string) => void;
  itemToEdit: Item | null;
}

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function AddItemModal({
  isOpen, onClose, onSaveItem, itemToEdit,
}: AddItemModalProps) {
  const { themeClassNames } = useSettings();
  const [name, setName] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState(""); // For the URL input field
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For the <img src="...">
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedImageCache, setUploadedImageCache] = useState<string | null>(null); // Cache for uploaded base64

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (itemToEdit) {
        setName(itemToEdit.name);
        if (itemToEdit.imageUrl && itemToEdit.imageUrl.startsWith("data:image")) {
          setImageInputMode("upload");
          setImagePreview(itemToEdit.imageUrl);
          setUploadedImageCache(itemToEdit.imageUrl); // Cache it
          setImageUrlInput(""); // Clear URL input field
        } else {
          setImageInputMode("url");
          setImageUrlInput(itemToEdit.imageUrl || "");
          setImagePreview(itemToEdit.imageUrl || null);
          setUploadedImageCache(null); // Clear upload cache
        }
      } else { // Reset for new item
        setName("");
        setImageUrlInput("");
        setImagePreview(null);
        setUploadedImageCache(null);
        setImageInputMode("url");
      }
    }
  }, [itemToEdit, isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errorMessage && e.target.value.trim()) {
      setErrorMessage(null);
    }
  };

  const handleImageUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrlInput(url);
    setImagePreview(url.trim() || null); // Show preview from URL input
    if (errorMessage) setErrorMessage(null);
    setUploadedImageCache(null); // Changing URL input clears any cached upload
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`File is too large. Max size: ${MAX_FILE_SIZE_MB}MB.`);
        e.target.value = ""; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result); // Show preview of uploaded file
        setUploadedImageCache(result); // Cache the uploaded image data
        // setImageUrlInput(""); // Keep URL input separate, don't clear it here
      };
      reader.onerror = () => {
        setErrorMessage("Error reading file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Item name is required.");
      return;
    }
    setErrorMessage(null);

    let finalImageUrl: string | undefined;
    if (imageInputMode === "upload" && uploadedImageCache) {
      finalImageUrl = uploadedImageCache;
    } else if (imageInputMode === "url" && imageUrlInput.trim()) {
      finalImageUrl = imageUrlInput.trim();
    } else {
      finalImageUrl = undefined; // No image or empty URL
    }
    
    const itemData = { name: name.trim(), imageUrl: finalImageUrl };
    onSaveItem(itemData, itemToEdit?.id);
  };

  const switchImageInputMode = (mode: "url" | "upload") => {
    setImageInputMode(mode);
    setErrorMessage(null);
    if (mode === "url") {
      // If there's content in imageUrlInput, show that as preview.
      // Otherwise, if there's an uploaded image cached, don't show it in URL mode's preview.
      setImagePreview(imageUrlInput.trim() ? imageUrlInput.trim() : null);
    } else { // Switching to "upload"
      // If there's a cached uploaded image, show that.
      // Otherwise, don't show URL input content as preview for upload tab.
      setImagePreview(uploadedImageCache ? uploadedImageCache : null);
    }
  };

  if (!isOpen) return null;

  const inputClasses = `w-full p-3 border rounded-lg ${themeClassNames.inputBgColor} ${themeClassNames.inputBorderColor} ${themeClassNames.textColor} ${themeClassNames.placeholderColor} focus:ring-1 focus:ring-[var(--accent-color)] focus:${themeClassNames.inputFocusBorderColor} transition-colors`;
  const tabButtonBase = `flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:ring-offset-1 focus:ring-offset-[var(--raw-card-bg-value)]`;
  const activeTabClasses = `bg-[var(--accent-color)] text-black shadow-sm`;
  const inactiveTabClasses = `${themeClassNames.buttonInactiveBg} ${themeClassNames.buttonInactiveText} ${themeClassNames.buttonInactiveHoverBg}`;

  return (
    <div className={`fixed inset-0 ${themeClassNames.modalOverlayBg} backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300`}>
      <div className={`${themeClassNames.cardBgColor} p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100`}>
        <h2 className={`text-2xl sm:text-3xl font-semibold mb-4 ${themeClassNames.textColor} text-center`}>{itemToEdit ? "Edit Item" : "Add New Item"}</h2>
        {errorMessage && (
          <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-300 text-red-700 flex items-center gap-2">
            <AlertTriangle size={20} /> 
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="itemName" className={`block text-sm font-medium mb-1.5 ${themeClassNames.textColor}`}>Name <span className="text-red-500">*</span></label>
            <input id="itemName" type="text" value={name} onChange={handleNameChange} placeholder="Enter item name" required className={inputClasses} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClassNames.textColor}`}>Image Source</label>
            <div className={`flex gap-1 p-1 rounded-lg mb-3 ${themeClassNames.tabContainerBg}`}>
              <button type="button" onClick={() => switchImageInputMode("url")} className={`${tabButtonBase} ${imageInputMode === "url" ? activeTabClasses : inactiveTabClasses}`}><Link2 size={16} className="inline mr-1.5" /> URL</button>
              <button type="button" onClick={() => switchImageInputMode("upload")} className={`${tabButtonBase} ${imageInputMode === "upload" ? activeTabClasses : inactiveTabClasses}`}><UploadCloud size={16} className="inline mr-1.5" /> Upload</button>
            </div>
            {imageInputMode === "url" ? (
              <input id="itemImageUrl" type="url" value={imageUrlInput} onChange={handleImageUrlInputChange} placeholder="https://example.com/image.png" className={inputClasses} />
            ) : (
              <label htmlFor="itemImageFile" className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer ${themeClassNames.inputBorderColor} ${themeClassNames.buttonInactiveHoverBg} transition-colors`}>
                <UploadCloud size={32} className={`${themeClassNames.secondaryTextColor} mb-2`} />
                <span className={`text-sm font-medium ${themeClassNames.textColor}`}>Click to upload or drag & drop</span>
                <span className={`text-xs ${themeClassNames.secondaryTextColor}`}>SVG, PNG, JPG or GIF (Max: ${MAX_FILE_SIZE_MB}MB)</span>
                <input id="itemImageFile" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
              </label>
            )}
            {imagePreview && (
              <div className={`mt-4 p-2 border rounded-lg ${themeClassNames.borderColor} flex justify-center items-center h-32`}>
                <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded" onError={() => { setErrorMessage("Could not load image preview. Check URL or file."); setImagePreview(null); }} />
              </div>
            )}
            {!imagePreview && (imageInputMode === "upload" || (imageInputMode === "url" && !imageUrlInput.trim())) && (
              <div className={`mt-4 p-2 border-2 border-dashed rounded-lg ${themeClassNames.borderColor} flex flex-col justify-center items-center h-32 text-center ${themeClassNames.secondaryTextColor}`}><ImageIcon size={32} className="mb-1" /> <p className="text-sm">Image Preview</p></div>
            )}
          </div>
          <div className={`flex justify-end gap-3 pt-4 border-t ${themeClassNames.borderColor} mt-6`}>
            <button type="button" onClick={onClose} className={`px-5 py-2.5 text-sm font-medium rounded-lg ${themeClassNames.buttonInactiveBg} ${themeClassNames.buttonInactiveText} ${themeClassNames.buttonInactiveHoverBg} transition-colors shadow hover:shadow-md`}>Cancel</button>
            <button type="submit" className={`px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent-color)] text-black hover:bg-opacity-90 transition-colors shadow hover:shadow-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:ring-offset-1 focus:ring-offset-[var(--raw-card-bg-value)]`}>{itemToEdit ? (<><CheckSquare size={18} className="inline mr-1.5" /> Save Changes</>) : (<><PlusCircle size={18} className="inline mr-1.5" /> Add Item</>)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
