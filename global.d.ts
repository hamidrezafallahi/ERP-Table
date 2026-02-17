declare module '*.css';

declare namespace JSX {
    interface IntrinsicElements {
      marquee: any; // or you can define specific props if needed
    }
  }