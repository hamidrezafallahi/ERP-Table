import { useEffect, useRef, useState } from "react";

import { CustomButton } from "@components/atoms/defaultElements";
import { UploadMarker } from "@components/atoms/iconComponents";

import type { IProps } from "./type";

export const FormImage = ({ minimize }: IProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const ImageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAddClick = () => {
    ImageInputRef.current?.click();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setImageUrl("");
  };

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  return (
    <div
      className={`text-center ${minimize ? "" : "relative h-10 xxl:h-[135px]"}`}
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        title="افزودن تصویر"
        onClick={handleAddClick}
        className={`
          group z-20 flex justify-center items-center bg-gray-gray4 dark:bg-gray-gray8 
          
          ${minimize ? "cursor-pointer w-10 h-10" : "w-full h-full min-h-36"} 
          rounded transition-all duration-300 
          relative overflow-hidden
        `}
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <input
          type="file"
          ref={ImageInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        {!imageUrl && <UploadMarker />}

        {!minimize && (
          <div
            className={`
              absolute top-[50%] left-[50%] gap-2 opacity-0 group-hover:opacity-100 
              -translate-x-[50%] -translate-y-[50%] transition-all duration-500
              hidden lg:flex
            `}
          >
            <CustomButton
              className="px-4 py-2 hover:!border-gray-gray5 text-3xs hover:!text-gray-gray85"
              onClick={(e) => {
                e.stopPropagation();
                handleAddClick();
              }}
            >
              افزودن تصویر
            </CustomButton>
            <CustomButton
              className="px-4 py-2 hover:!border-gray-gray5 text-3xs hover:!text-gray-gray85"
              onClick={handleRemoveClick}
            >
              حذف تصویر
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
};
