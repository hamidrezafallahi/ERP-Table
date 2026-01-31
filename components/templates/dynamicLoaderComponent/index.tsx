"use client";

import { FC, useEffect, useState } from "react";

import { componentsMap } from "./componentMap";
import type { IProps } from "./type";

export default function DynamicLoaderComponent({
  componentName,
  props,
}: IProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [Component, setComponent] = useState<FC<any> | null>(null);

  useEffect(() => {
    const loadComponent = () => {
      const LoadedComponent = componentsMap[componentName];

      if (LoadedComponent) {
        setComponent(() => LoadedComponent);
      } else {
        setComponent(null);
      }

      setIsLoading(false);
    };

    const timer = setTimeout(loadComponent, 500);

    return () => clearTimeout(timer);
  }, [componentName]);

  if (isLoading) {
    return <div>loading...</div>;
  }

  if (!Component) {
    return <div>Component not found</div>;
  }

  return (
    <div>
      <Component key={componentName} {...props} />
    </div>
  );
}
