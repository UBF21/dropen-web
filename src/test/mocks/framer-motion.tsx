import { vi } from 'vitest'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: new Proxy({} as Record<string, React.FC>, {
    get: (_t, tag: string | symbol) => {
      const tagStr = String(tag)
      return ({ children, style: _s, initial: _i, animate: _a, transition: _tr,
         whileInView: _w, whileTap: _wt, viewport: _vp, ...props }:
        React.HTMLAttributes<HTMLElement> & Record<string, unknown>) => {
        return React.createElement(tagStr as React.ElementType, props as object, children as React.ReactNode)
      }
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => '0%',
  useReducedMotion: () => false,
  useAnimate: () => {
    const scope = { current: null }
    const animate = vi.fn()
    return [scope, animate]
  },
}))
