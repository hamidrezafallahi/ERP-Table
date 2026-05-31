// useDarkMode.ts
import {
  useEffect,
  useRef,
} from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setTheme } from '@slice/config';
import { TTheme } from '@slice/config/type';

type Preference = TTheme | "system";
const PREFERENCE_KEY = "site-theme-preference";

export const useDarkMode = (): {
  setMode: (e: TTheme) => void;
  resetToSystem: () => void;
  mode: TTheme;
} => {
  const { theme } = useAppSelector(
    (state) => ({ theme: state.withPersist.config.theme ?? "light" }),
    shallowEqual
  );
  const dispatch = useDispatch();

  const userSelectedRef = useRef<boolean | null>(null);
  const mqRef = useRef<MediaQueryList | null>(null);

  const applyToDomAndStore = (t: TTheme) => {
    try {
      const root =
        typeof document !== "undefined" ? document.documentElement : null;
      if (root) {
        root.setAttribute("data-theme", t === "dark" ? "dark" : "light");
        if (t === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
      }
    } catch (err) {
      // ignore DOM errors
    }

    // update redux (single source for rest of app)
    dispatch(setTheme({ theme: t }));
  };

  const setMode = (newMode: TTheme) => {
    try {
      localStorage.setItem(PREFERENCE_KEY, newMode);
    } catch {}
    userSelectedRef.current = true;

    if (mqRef.current) {
      try {
        const mq = mqRef.current;
        if ("removeEventListener" in mq)
          mq.removeEventListener("change", systemListener);
        else (mq as any).removeListener(systemListener);
      } catch {}
      mqRef.current = null;
    }

    applyToDomAndStore(newMode);
  };

  const resetToSystem = () => {
    try {
      localStorage.setItem(PREFERENCE_KEY, "system");
    } catch {}
    userSelectedRef.current = false;
    const prefersDark =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false;
    const next: TTheme = prefersDark ? "dark" : "light";
    applyToDomAndStore(next);
    attachSystemListener();
  };

  function systemListener(e: MediaQueryListEvent) {
    if (!userSelectedRef.current) {
      const next = e.matches ? "dark" : "light";
      applyToDomAndStore(next);
    }
  }

  const attachSystemListener = () => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia === "undefined"
    )
      return;
    try {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mqRef.current = mq;
      if ("addEventListener" in mq)
        mq.addEventListener("change", systemListener);
      else (mq as any).addListener(systemListener);
    } catch {
      mqRef.current = null;
    }
  };

  useEffect(() => {
    let stored: Preference | null = null;
    try {
      const s = localStorage.getItem(PREFERENCE_KEY);
      if (s) stored = s as Preference;
    } catch {
      stored = null;
    }

    if (stored && stored !== "system") {
      userSelectedRef.current = true;
      applyToDomAndStore(stored as TTheme);
    } else {
      userSelectedRef.current = false;
      const prefersDark =
        typeof window !== "undefined" && window.matchMedia
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
          : false;
      applyToDomAndStore(prefersDark ? "dark" : "light");
      attachSystemListener();
    }

    return () => {
      if (mqRef.current) {
        try {
          const mq = mqRef.current;
          if ("removeEventListener" in mq)
            mq.removeEventListener("change", systemListener);
          else (mq as any).removeListener(systemListener);
        } catch {}
        mqRef.current = null;
      }
    };
  }, []);

  return { setMode, resetToSystem, mode: theme };
};
