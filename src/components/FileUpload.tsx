import React, { useRef } from "react";
import { processFileUpload } from "../utils/diffUtils";
import "./FileUpload.css";

interface FileUploadProps {
  onFileUpload: (content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileData = await processFileUpload(file);
      onFileUpload(fileData.content);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file. Please make sure it's a valid text file.");
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.js,.ts,.jsx,.tsx,.json,.css,.html,.xml,.csv,.log"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <button
        onClick={handleClick}
        className="upload-button"
        title="Upload text file"
      >
        📁 Upload File
      </button>
    </div>
  );
};

export default FileUpload;

