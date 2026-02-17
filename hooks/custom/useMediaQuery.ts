"use client";
import { useEffect, useState } from "react";

export const deviceSizeFinder = {
    XSUP: "(min-width: 320px)",
    SMUP: "(min-width: 640px)",
    MDUP: "(min-width: 768px)",
    LGUP: "(min-width: 992px)",
    XLUP: "(min-width: 1024px)",
    XXLUP: "(min-width: 1366px)",
} as const;

type QueryKey = keyof typeof deviceSizeFinder;

export function useMediaQuery(query: QueryKey) {
    const [match, setMatch] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const media = window.matchMedia(deviceSizeFinder[query]);
        setMatch(media.matches);
       
        const handler = (e: MediaQueryListEvent) => {
            setMatch(e.matches);
        };

        media.addEventListener("change", handler);
        return () => media.removeEventListener("change", handler);
    }, [query]);

    return {
        match,
        loading: match === undefined,
    };
}

// import { ReactNode } from 'react';
// import WebLayout from './webLayout/webLayout';
// import { useMediaQuery } from '@utils/hooks';
// import MobileLayout from './mobileLayout/mobileLayout';

// const Layout = ({ children }: { children: ReactNode | ReactNode[] }) => {
//   const { match, loading } = useMediaQuery('MDUP');

//   return loading ? (
//     'loading'
//   ) : match ? (
//     <WebLayout>{children}</WebLayout>
//   ) : (
//     <MobileLayout>{children}</MobileLayout>
//   );
// };

// export default Layout;
