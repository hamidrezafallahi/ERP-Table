export function getFileType(fileType) {
  if (typeof fileType !== "number" || fileType <= 0) {
    throw new Error("Invalid file type number.");
  }
  const typeMap = {
    1: { extension: "jpg", mime: "image/jpeg" },
    2: { extension: "jpeg", mime: "image/jpeg" },
    3: { extension: "png", mime: "image/png" },
    4: { extension: "gif", mime: "image/gif" },
    5: { extension: "bmp", mime: "image/bmp" },
    22: { extension: "webp", mime: "image/webp" },
    6: { extension: "txt", mime: "text/plain" },
    7: { extension: "doc", mime: "application/msword" },
    8: {
      extension: "docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    9: { extension: "pdf", mime: "application/pdf" },
    10: { extension: "xls", mime: "application/vnd.ms-excel" },
    11: {
      extension: "xlsx",
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    12: { extension: "csv", mime: "text/csv" },
    13: { extension: "mp4", mime: "video/mp4" },
    14: { extension: "mkv", mime: "video/x-matroska" },
    15: { extension: "avi", mime: "video/x-msvideo" },
    23: { extension: "webm", mime: "video/webm" },
    16: { extension: "mp3", mime: "audio/mpeg" },
    17: { extension: "wav", mime: "audio/wav" },
    18: { extension: "aac", mime: "audio/aac" },
    19: { extension: "zip", mime: "application/zip" },
    20: { extension: "rar", mime: "application/x-rar-compressed" },
    21: { extension: "7z", mime: "application/x-7z-compressed" },
  };
  const fileInfo = typeMap[fileType];
  if (!fileInfo) {
    return "unknown";
  }
  if (fileInfo.mime.startsWith("image/")) {
    return "Image: " + fileInfo.mime;
  } else if (fileInfo.mime.startsWith("video/")) {
    return "Video: " + fileInfo.mime;
  } else if (fileInfo.mime.startsWith("audio/")) {
    return "Audio: " + fileInfo.mime;
  } else if (
    fileInfo.mime.startsWith("application/") ||
    fileInfo.mime.startsWith("text/")
  ) {
    return "Document/File: " + fileInfo.mime;
  } else {
    return "Other: " + fileInfo.mime;
  }
}

export function typeByExtension(filename) {
  const type = filename.split(".").pop();
  switch (type) {
    case "mp3":
    case "ogg":
    case "aac":
    case "flac":
    case "wma":
      return "audio";
    case "jpeg":
    case "jpg":
    case "png":
    case "gif":
    case "bmp":
    case "tiff":
    case "tif":
    case "svg":
    case "webp":
    case "heif":
    case "heic":
    case "ico":
      return "image";
    case "pdf":
    case "doc":
    case "docx":
    case "xls":
    case "xlsx":
    case "ppt":
    case "pptx":
    case "txt":
    case "rtf":
    case "odt":
    case "exe":
    case "dmg":
    case "apk":
      return "application";
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
    case "mkv":
    case "flv":
    case "webm":
    case "mpg":
    case "mpeg":
    case "3gp":
      return "video";
    case "ttf":
    case "otf":
    case "woff":
      return "font";
    default:
      return "application";
  }
}
