const TEXT = 'STREETWEAR · LIMA · EDICIÓN LIMITADA · DROPEN · '

export default function MarqueeTicker() {
  return (
    <div className="bg-accent text-background overflow-hidden h-9 flex items-center select-none">
      <span
        className="animate-marquee whitespace-nowrap font-mono text-xs tracking-widest uppercase inline-block"
        style={{ animation: 'marquee 20s linear infinite' }}
        aria-hidden="true"
      >
        {TEXT.repeat(8)}
      </span>
    </div>
  )
}
