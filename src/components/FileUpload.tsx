import { useState, useRef } from "react";
import { Upload, FileInput, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onUploadStart: () => void;
  onUploadComplete: (data: any) => void;
  onUploadError: (error: string) => void;
}

export const FileUpload = ({ onUploadStart, onUploadComplete, onUploadError }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addFiles = (newFiles: File[]) => {
    setSelectedFiles(prevFiles => {
      const existingFileNames = new Set(prevFiles.map(f => f.name));
      const uniqueNewFiles = newFiles.filter(f => !existingFileNames.has(f.name));
      
      if (uniqueNewFiles.length < newFiles.length) {
        toast.info("Duplicate files were ignored.");
      }
      
      return [...prevFiles, ...uniqueNewFiles];
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to process.");
      return;
    }
    onUploadStart();
    setIsProcessing(true);

    try {
      // Step 1: Upload all files in parallel
      const uploadPromises = selectedFiles.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        // Note: langflow requires the component_id in the upload url
        return fetch('http://localhost:7868/api/v2/files/', {
          method: 'POST',
          body: formData,
        });
      });

      const uploadResponses = await Promise.all(uploadPromises);

      // Step 2: Check for any upload failures
      const failedUploads = uploadResponses.filter(res => !res.ok);
      if (failedUploads.length > 0) {
        const errorData = await failedUploads[0].json();
        throw new Error(errorData.detail || `Failed to upload ${failedUploads.length} file(s).`);
      }

      // Step 3: Get JSON data from all successful responses
      const uploadResults = await Promise.all(
        uploadResponses.map(res => res.json())
      );
      
      // Log the full upload response to the browser console for debugging.
      console.log("File Upload API response:", JSON.stringify(uploadResults, null, 2));

      const uploadedFilePaths = uploadResults.map(result => result.file_path);

      const processFlowId = "5a0f4c4a-eba4-4a11-bdb3-11773506a0a2"; 
      const processResponse = await fetch(`http://localhost:7868/api/v1/run/${processFlowId}?stream=false`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // The API expects a string input, so we'll format our file data as a JSON string.
          "input_value": JSON.stringify({ "file_paths": uploadedFilePaths }),
          // The API requires 'chat', 'text', or 'any'.
          "input_type": "chat",
          "output_type": "chat",
          "tweaks": {}
        }),
      });

      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        let errorMessage;

        try {
          // Try to parse the text as JSON.
          const errorData = JSON.parse(errorText);
          let message = errorData.detail || errorText; // Fallback to text if detail is missing
          if (typeof message !== 'string') {
            message = JSON.stringify(message, null, 2);
          }
          errorMessage = message;
        } catch (e) {
          // If parsing fails, the response was plain text.
          errorMessage = errorText;
        }
        
        throw new Error(errorMessage);
      }
      
      const processResult = await processResponse.json();
      
      onUploadComplete(processResult);
      setSelectedFiles([]);

    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      onUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full text-gray-800">
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full h-64 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 transition-all duration-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 group ${isDragOver ? 'border-blue-500 bg-blue-100' : ''}`}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-500" />
          <p className="mt-4 text-lg font-semibold">
            <span className="text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Supports COBOL, JCL, and other legacy file types.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-8 animate-fade-in">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Selected Files:</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 transition-all hover:border-blue-400 hover:bg-gray-50">
                <div className="flex items-center space-x-3 text-sm">
                  <FileInput className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-gray-700">{file.name}</span>
                  <span className="text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
                <button 
                  onClick={() => handleRemoveFile(index)} 
                  className="p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleUpload} 
              disabled={isProcessing}
              className="w-full max-w-sm px-8 py-4 bg-blue-600 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Process {selectedFiles.length} File(s)</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
