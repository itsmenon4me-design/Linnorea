"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SplashScreen } from "@/components/layout/SplashScreen";

export function NavigationSplash() {
  const pathname = usePathname();
  const initialPathname = useRef(pathname);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (pathname !== initialPathname.current) {
      setHasNavigated(true);
    }
  }, [pathname]);

  return hasNavigated ? <SplashScreen key={pathname} mode="navigation" /> : null;
}
