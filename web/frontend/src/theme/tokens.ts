export function tk(isLight: boolean) {
  return {
    text:        isLight ? '#111111' : '#ffffff',
    textMuted:   isLight ? '#555555' : '#aaaaaa',
    textFaint:   isLight ? '#888888' : '#666666',
    textOnCard:  isLight ? '#111111' : '#ffffff',
    border:      isLight ? 'rgba(0,0,0,0.12)'  : 'rgba(255,255,255,0.13)',
    borderFaint: isLight ? 'rgba(0,0,0,0.08)'  : 'rgba(255,255,255,0.08)',
    // glossy panel
    panelBg:     isLight ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.07)',
    panelShadow: isLight
      ? '0 8px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)'
      : '0 8px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
    // bubbles
    userBubbleBg: isLight ? 'rgba(0,0,0,0.08)'  : 'rgba(255,255,255,0.18)',
    userBubbleBorder: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.22)',
    userBubbleText: isLight ? '#111' : '#fff',
    asstBubbleBg: isLight ? 'rgba(0,0,0,0.05)'  : 'rgba(255,255,255,0.10)',
    asstBubbleBorder: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.14)',
    asstBubbleText: isLight ? '#333' : 'rgba(255,255,255,0.88)',
    // input
    inputBg:     isLight ? 'rgba(0,0,0,0.06)'  : 'rgba(255,255,255,0.10)',
    inputBorder: isLight ? 'rgba(0,0,0,0.12)'  : 'rgba(255,255,255,0.15)',
    inputText:   isLight ? '#111' : '#fff',
    inputPlaceholder: isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)',
    // send button
    sendBg:      isLight ? 'rgba(0,0,0,0.10)'  : 'rgba(255,255,255,0.18)',
    sendBorder:  isLight ? 'rgba(0,0,0,0.15)'  : 'rgba(255,255,255,0.25)',
    // nav/action buttons
    btnPrimaryBg:   isLight ? '#111' : '#fff',
    btnPrimaryText: isLight ? '#fff' : '#111',
    btnSecondaryBg:   isLight ? '#fff' : '#111',
    btnSecondaryText: isLight ? '#111' : '#fff',
    btnSecondaryBorder: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
    // customize button
    customizeBg:     isLight ? 'rgba(0,0,0,0.06)'  : 'rgba(255,255,255,0.06)',
    customizeBorder: isLight ? 'rgba(0,0,0,0.12)'  : 'rgba(255,255,255,0.12)',
    customizeText:   isLight ? '#444' : '#aaa',
    // divider
    divider: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.10)',
    // overlay for images
    imgOverlay: isLight ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.50)',
    // cursor
    cursor: isLight ? '#111' : '#fff',
    // card (summary)
    cardBg:     isLight ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,1)',
    cardText:   '#111',
    cardMuted:  '#888',
  }
}
