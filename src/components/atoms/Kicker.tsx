import type { ReactNode } from 'react'

type KickerProps = {
  children: ReactNode
  light?: boolean
}

function Kicker({ children, light = false }: KickerProps) {
  return (
    <span className={`kicker${light ? ' kicker--light' : ''}`}>
      <span className="kicker__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {children}
    </span>
  )
}

export default Kicker
