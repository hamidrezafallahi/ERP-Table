import {
  Excel,
  File,
  Media,
  Monitor,
  Pdf,
  PowerPoint,
  Sound,
  Word,
  Zip,
} from "@components/atoms/iconComponents";
import type { IIconConfig } from "@components/atoms/iconComponents/type";

interface IconByFileExtensionProps {
  fileName: string;
  config?: IIconConfig;
}

export function IconByFileExtension({
  fileName,
  config = null,
}: IconByFileExtensionProps) {
  const type = fileName.split(".").pop();
  switch (type) {
    case "mp3":
    case "ogg":
    case "aac":
    case "flac":
    case "wma":
      return <Sound config={config} />;
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
      return <Media config={config} />;
    case "pdf":
      return <Pdf />;
    case "doc":
    case "docx":
      return <Word config={config} />;
    case "xls":
    case "xlsx":
      return <Excel config={config} />;
    case "ppt":
    case "pptx":
      return <PowerPoint config={config} />;
    case "txt":
    case "rtf":
    case "odt":
      return <File config={config} />;
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
      return <Media config={config} />;
    case "zip":
    case "rar":
      return <Zip config={config} />;
    case "exe":
    case "dmg":
    case "apk":
      return <File config={config} />;
    case "ttf":
    case "otf":
    case "woff":
      return <File config={config} />;
    default:
      return <Monitor config={config} />;
  }
}
