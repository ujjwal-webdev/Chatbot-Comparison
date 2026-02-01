import { useEffect, useRef, useState } from 'react';
import { Send, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const ChatForm = ({ onSubmit }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be less than 5MB';
        }
        return null;
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        setError(null);

        if (file) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            setSelectedImage(file);
            if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(URL.createObjectURL(file));
        } else {
            setSelectedImage(null);
            if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt && !selectedImage) return;

        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit(prompt, selectedImage);
            setPrompt('');
            setSelectedImage(null);
            if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(err?.message || 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
                <div className="relative inline-block">
                    <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-40 rounded-lg border border-srh-blue/20"
                    />
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex gap-2">
                {/* Prompt Input */}
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                    className="flex-1 px-4 py-3 rounded-lg border border-srh-blue/20 focus:outline-none focus:ring-2 focus:ring-srh-blue focus:border-transparent"
                    disabled={isSubmitting}
                />

                {/* Image Upload Button */}
                <label className={`cursor-pointer px-4 py-3 bg-gray-50 text-gray-700 rounded-lg border border-srh-blue/20 hover:bg-gray-100 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                        ref={fileInputRef}
                        disabled={isSubmitting}
                    />
                    <ImageIcon className="w-5 h-5" />
                </label>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || (!prompt && !selectedImage)}
                    className="px-6 py-3 bg-srh-blue text-white rounded-lg hover:bg-srh-blue/90 focus:outline-none focus:ring-2 focus:ring-srh-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <Send className="w-5 h-5" />
                    {isSubmitting ? 'Sending...' : 'Send'}
                </button>
            </div>
        </form>
    );
};
