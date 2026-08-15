export default function SendIcon({ color = '#BBBBBB' }: { color?: string }) {
  return (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
      <path d="M6.5 14.5V1M6.5 1L1 6.5M6.5 1L12 6.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
