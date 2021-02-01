import { useState, useEffect, useMemo } from 'react'

if (!useState) {
  throw new Error(
    `React.useState (added in 16.8.0) must be defined to use the hooks API`
  )
}

import {
  initCoreState,
  createPopupState,
  anchorRef,
  bindTrigger,
  bindContextMenu,
  bindToggle,
  bindHover,
  bindFocus,
  bindMenu,
  bindPopover,
  bindPopper,
} from './core'

export {
  anchorRef,
  bindTrigger,
  bindContextMenu,
  bindToggle,
  bindHover,
  bindFocus,
  bindMenu,
  bindPopover,
  bindPopper,
}

export function usePopupState({
  parentPopupState,
  popupId,
  variant,
  disableAutoFocus,
}) {
  const [state, setState] = useState(initCoreState)
  useEffect(() => {
    if (!disableAutoFocus && popupId && typeof document === 'object') {
      const popup = document.getElementById(popupId)
      if (popup) popup.focus()
    }
  }, [popupId, state.anchorEl])

  return useMemo(
    () =>
      createPopupState({
        state,
        setState,
        parentPopupState,
        popupId,
        variant,
        disableAutoFocus,
      }),
    [state, setState, parentPopupState, popupId, variant, disableAutoFocus]
  )
}
