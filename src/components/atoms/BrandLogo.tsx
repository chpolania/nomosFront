type BrandLogoProps = {
  className?: string
}

function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <a className={`brand-logo ${className}`.trim()} href="/" aria-label="Nomos Impresores, inicio">
      <img src="/assets/Frame-21965-1.png" alt="Nomos Impresores" />
    </a>
  )
}

export default BrandLogo
