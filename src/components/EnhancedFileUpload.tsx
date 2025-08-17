import React, { useState, useRef, useCallback } from "react";
import { processFileUpload, formatFileSize } from "../utils/diffUtils";
import "./EnhancedFileUpload.css";

interface EnhancedFileUploadProps {
  onFileUpload: (content: string, filename: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFileUpload,
  accept = ".txt,.md,.js,.ts,.jsx,.tsx,.json,.css,.html,.xml,.csv,.log,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt",
  maxSize = 10 * 1024 * 1024, // 10MB
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        // Check file size
        if (file.size > maxSize) {
          throw new Error(
            `File size (${formatFileSize(
              file.size
            )}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
          );
        }

        // Check file type
        const fileExtension = file.name.toLowerCase().split(".").pop();
        const acceptedExtensions = accept.replace(/\./g, "").split(",");

        if (!acceptedExtensions.includes(fileExtension || "")) {
          throw new Error(
            `File type not supported. Please upload a text file.`
          );
        }

        const fileData = await processFileUpload(file);
        onFileUpload(fileData.content, fileData.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to read file");
      } finally {
        setIsUploading(false);
      }
    },
    [accept, maxSize, onFileUpload]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const items = Array.from(event.clipboardData.items);
      const fileItem = items.find((item) => item.kind === "file");

      if (fileItem) {
        const file = fileItem.getAsFile();
        if (file) {
          handleFileSelect(file);
        }
      }
    },
    [handleFileSelect]
  );

  return (
    <div className="enhanced-file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      <div
        className={`upload-zone ${isDragOver ? "drag-over" : ""} ${
          isUploading ? "uploading" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label="Upload file"
      >
        <div className="upload-content">
          {isUploading ? (
            <>
              <div className="upload-icon">⏳</div>
              <div className="upload-text">Processing file...</div>
            </>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <strong>Click to upload</strong> or drag and drop
              </div>
              <div className="upload-hint">
                Supports: {accept.split(",").slice(0, 5).join(", ")}
                {accept.split(",").length > 5 && "..."}
              </div>
              <div className="upload-hint">
                Max size: {formatFileSize(maxSize)}
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      <div className="upload-tips">
        <div className="tip-item">
          <span className="tip-icon">💡</span>
          <span className="tip-text">You can also paste text directly</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">⌘</span>
          <span className="tip-text">Drag multiple files to compare</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFileUpload;

