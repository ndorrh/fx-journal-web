'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, Link as LinkIcon, X, Check, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
}

export function ImageUploader({ value, onChange, placeholder = "Image URL or Upload" }: ImageUploaderProps) {
    const [mode, setMode] = useState<'upload' | 'link'>('upload');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await uploadFile(e.target.files[0]);
        }
    };

    const deleteOldImage = async (url: string) => {
        // Only delete if it's an R2 URL (contains setups/ or similar, and not google/tradingview)
        if (!url || url.includes('drive.google.com') || url.includes('tradingview.com')) return;

        try {
            // Extract key from URL
            // URL: https://pub-xxx.r2.dev/setups/123.png
            // Key: setups/123.png
            const urlObj = new URL(url);
            const key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;

            await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
                method: 'DELETE',
            });
        } catch (e) {
            console.error("Failed to delete old image:", e);
        }
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        try {
            // 0. If there is an existing value that matches our R2 pattern, delete it first
            if (value) {
                await deleteOldImage(value);
            }

            // 1. Get presigned URL
            const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // 2. Upload to R2
            const uploadRes = await fetch(data.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadRes.ok) throw new Error('Upload failed');

            // 3. Update parent with public URL
            onChange(data.publicUrl);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image. Please try again or use a link.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await uploadFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-4">
            {/* Toggle */}
            <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700 w-fit">
                <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${mode === 'upload' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Upload size={14} /> Upload
                </button>
                <button
                    type="button"
                    onClick={() => setMode('link')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${mode === 'link' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <LinkIcon size={14} /> Link
                </button>
            </div>

            {mode === 'link' ? (
                <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={handleLinkChange}
                    className="bg-slate-950/50 border-slate-800"
                />
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${dragActive ? 'border-cyan-500 bg-cyan-950/20' : 'border-slate-700 bg-slate-900/30 hover:bg-slate-900/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2 text-cyan-400 animate-pulse">
                            <Loader2 className="animate-spin" size={24} />
                            <span className="text-sm font-medium">Uploading...</span>
                        </div>
                    ) : value && !value.includes('drive.google.com') && !value.includes('drive.google.com/thumbnail') ? (
                        // Show simple success state if a URL is present and it looks like a generic URL (likely our R2 one)
                        // We can also just show the preview below, but this box is for input.
                        // If a value is present, we allow replacing it.
                        <div className="text-center space-y-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-400 mx-auto">
                                <Check size={20} />
                            </div>
                            <p className="text-sm text-slate-300">Image Selected</p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-cyan-400 hover:text-cyan-300 h-8 text-xs"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Replace Image
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-slate-400 mx-auto">
                                <Upload size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-300">
                                    <span
                                        className="text-cyan-400 cursor-pointer hover:underline"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Click to upload
                                    </span> or drag and drop
                                </p>
                                <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
