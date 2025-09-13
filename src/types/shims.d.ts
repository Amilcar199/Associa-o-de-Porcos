// Temporary module shims to satisfy TypeScript in environments without full Next/React types

declare module '*.png' { const src: any; export default src }
declare module '*.jpg' { const src: any; export default src }
declare module '*.jpeg' { const src: any; export default src }
declare module '*.webp' { const src: any; export default src }

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}

