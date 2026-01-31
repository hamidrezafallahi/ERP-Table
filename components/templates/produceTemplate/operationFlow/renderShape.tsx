import React from "react";

export default function RenderShape({ item, selected }) {
  const operationText = (
    <p
      title={item.title}
      className="flex justify-center items-center w-fit max-w-16 overflow-hidden text-sm text-center line-clamp-3 text-nowrap"
      style={{
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        textOverflow: "ellipsis",
        whiteSpace: "normal",
      }}
    >
      {item.title}
    </p>
  );

  if (item.type === "circle") {
    return (
      <div
        className={`flex justify-center items-center bg-blue-blue15 ${
          selected ? "border-[3px]" : "border"
        } border-gray-gray10 rounded-full w-[88px] h-[88px] text-gray-gray10 select-none`}
      >
        {operationText}
      </div>
    );
  } else if (item.type === "square") {
    return (
      <div
        className={`flex justify-center items-center bg-state-warning2 ${
          selected ? "border-[3px]" : "border"
        } border-gray-gray10 w-[88px] h-[88px] text-gray-gray10 select-none`}
      >
        {operationText}
      </div>
    );
  } else {
    return (
      <div className="relative flex justify-center items-center w-[90px] h-[90px] select-none">
        <div
          className={`absolute inset-0 bg-state-warning2 ${
            selected ? "border-[3px]" : "border"
          }  border-gray-gray10 rounded-md`}
        ></div>
        <div className="absolute flex justify-center items-center bg-blue-blue15 mx-auto border border-gray-gray10 rounded-full w-[88px] h-[88px] text-gray-gray10">
          {operationText}
        </div>
      </div>
    );
  }
}
