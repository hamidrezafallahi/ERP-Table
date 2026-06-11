"use client";
import {
  ReactNode,
  useEffect,
} from 'react';

import { useFullScreen } from '@hooks/custom/useFullScreen';

export default function Shortcuts(props: { children: ReactNode }) {
  const { children } = props;
  const toggleFullScreen = useFullScreen();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "v") {
        // event.preventDefault();
        toggleFullScreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <>{children}</>;
}
