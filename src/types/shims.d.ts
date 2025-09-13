// Temporary module shims to satisfy TypeScript in environments without full Next/React types
declare module 'next/link' {
  const Link: any
  export default Link
}
declare module 'next/image' {
  const Image: any
  export default Image
}
declare module 'next/navigation' {
  export const usePathname: any
  export const useRouter: any
}
declare module 'next-auth/react' {
  export const useSession: any
  export const signOut: any
}
declare module 'lucide-react' {
  export const Menu: any
  export const X: any
  export const User: any
  export const Users: any
  export const LogOut: any
  export const Settings: any
  export const Phone: any
  export const Mail: any
  export const MapPin: any
}
declare module 'framer-motion' {
  export const motion: any
  export const AnimatePresence: any
}

declare module 'react' {
  const React: any
  export default React
  export const useState: any
  export const useEffect: any
}

declare module '*.png' { const src: any; export default src }
declare module '*.jpg' { const src: any; export default src }
declare module '*.jpeg' { const src: any; export default src }
declare module '*.webp' { const src: any; export default src }

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}

