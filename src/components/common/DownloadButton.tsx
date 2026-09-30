"use client";

import React, { useState } from "react";

export default function DownloadButton({ title }: { title: string }) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    // Generate sample text file for simulation
    const content = `NIRMAAN Academic Prototype\nSimulated Document: ${title}\nGenerated on: ${new Date().toISOString()}\nNote: Sample educational resource.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus:ring-2 focus:ring-primary focus:outline-none rounded px-1.5 py-0.5"
    >
      <span className="material-symbols-outlined text-sm" aria-hidden="true">
        {downloaded ? "check" : "download"}
      </span>
      {downloaded ? "Downloaded" : "Download"}
    </button>
  );
}
