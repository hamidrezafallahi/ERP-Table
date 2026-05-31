"use client";
import React from 'react';

export default function DateBox() {
  const now = new Date();

  const shamsi = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
  }).format(now);

  const miladi = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(now);

  const hijri = new Intl.DateTimeFormat("fa-IR-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
  }).format(now);

  return (
    <div className="flex justify-between gap-7 w-full">
      <div className="flex justify-end items-center h-full font-bold text-xl">
        <span>{shamsi}</span>
      </div>

      <div className="flex gap-2 font-semibold text-gray-gray9 text-sm">
        <div className="flex justify-end items-center h-full text-sm">
          <span>{hijri}</span>
        </div>
        <span className="flex items-center h-full">/</span>
        <div className="flex justify-end items-center h-full text-sm">
          <span>{miladi}</span>
        </div>
      </div>
    </div>
  );
}
