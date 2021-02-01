/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/naming-convention */
const printedWarnings = {};

function warn(key, message) {
  if (printedWarnings[key]) return;
  printedWarnings[key] = true;
  console.error("[material-ui-popup-state] WARNING", message); // eslint-disable-line no-console
}

export const initCoreState = {
  isOpen: false,
  setAnchorElUsed: false,
  anchorEl: null,
  hovered: false,
  _childPopupState: null,
};

export function createPopupState({
  state,
  setState: _setState,
  parentPopupState,
  popupId,
  variant,
  disableAutoFocus,
}) {
  const { isOpen, setAnchorElUsed, anchorEl, hovered, _childPopupState } = state;

  // use lastState to workaround cases where setState is called multiple times
  // in a single render (e.g. because of refs being called multiple times)
  let lastState = state;
  const setState = nextState => {
    if (hasChanges(lastState, nextState)) {
      _setState(lastState = { ...lastState, ...nextState });
    }
  };

  const setAnchorEl = _anchorEl => {
    setState({ setAnchorElUsed: true, anchorEl: _anchorEl });
  };

  const toggle = eventOrAnchorEl => {
    if (isOpen) close();
    else open(eventOrAnchorEl);
  };

  const open = eventOrAnchorEl => {
    if (!eventOrAnchorEl && !setAnchorElUsed) {
      warn(
        "missingEventOrAnchorEl",
        "eventOrAnchorEl should be defined if setAnchorEl is not used",
      );
    }

    if (parentPopupState) {
      if (!parentPopupState.isOpen) return;
      parentPopupState._setChildPopupState(popupState);
    }
    if (
      !disableAutoFocus &&
      typeof document === "object" &&
      document.activeElement
    ) {
      document.activeElement.blur();
    }

    const newState = {
      isOpen: true,
      hovered: eventOrAnchorEl && eventOrAnchorEl.type === "mouseover",
    };

    if (eventOrAnchorEl && eventOrAnchorEl.currentTarget) {
      if (!setAnchorElUsed) {
        newState.anchorEl = eventOrAnchorEl.currentTarget;
      }
    } else if (eventOrAnchorEl) {
      newState.anchorEl = eventOrAnchorEl;
    }

    setState(newState);
  };

  const close = () => {
    if (_childPopupState) _childPopupState.close();
    if (parentPopupState) parentPopupState._setChildPopupState(null);
    setState({ isOpen: false, hovered: false });
  };

  const setOpen = (
    nextOpen,
    eventOrAnchorEl,
  ) => {
    if (nextOpen) {
      open(eventOrAnchorEl);
    } else close();
  };

  const onMouseLeave = event => {
    const relatedTarget = event.relatedTarget;
    if (hovered && !isElementInPopup(relatedTarget, popupState)) {
      close();
    }
  };

  const _setChildPopupState = _childPopupState => setState({ _childPopupState });

  const popupState = {
    anchorEl,
    setAnchorEl,
    setAnchorElUsed,
    popupId,
    variant,
    isOpen,
    open,
    close,
    toggle,
    setOpen,
    onMouseLeave,
    disableAutoFocus: Boolean(disableAutoFocus),
    _childPopupState,
    _setChildPopupState,
  };

  return popupState;
}

/**
 * Creates a ref that sets the anchorEl for the popup.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function anchorRef({ setAnchorEl }) {
  return el => {
    if (el) setAnchorEl(el);
  };
}

/**
 * Creates props for a component that opens the popup when clicked.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindTrigger({
  isOpen,
  open,
  popupId,
  variant,
}) {
  return {
    // $FlowFixMe
    [variant === "popover" ? "aria-controls" : "aria-describedby"]: isOpen
      ? popupId
      : null,
    "aria-haspopup": variant === "popover" ? true : undefined,
    "onClick": open,
  };
}

/**
 * Creates props for a component that opens the popup on its contextmenu event (right click).
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindContextMenu({
  isOpen,
  open,
  popupId,
  variant,
}) {
  return {
    // $FlowFixMe
    [variant === "popover" ? "aria-controls" : "aria-describedby"]: isOpen
      ? popupId
      : null,
    "aria-haspopup": variant === "popover" ? true : undefined,
    "onContextMenu": e => {
      e.preventDefault();
      open(e);
    },
  };
}

/**
 * Creates props for a component that toggles the popup when clicked.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindToggle({
  isOpen,
  toggle,
  popupId,
  variant,
}) {
  return {
    // $FlowFixMe
    [variant === "popover" ? "aria-controls" : "aria-describedby"]: isOpen
      ? popupId
      : null,
    "aria-haspopup": variant === "popover" ? true : undefined,
    "onClick": toggle,
  };
}

/**
 * Creates props for a component that opens the popup while hovered.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindHover({
  isOpen,
  open,
  onMouseLeave,
  popupId,
  variant,
}) {
  return {
    // $FlowFixMe
    [variant === "popover" ? "aria-controls" : "aria-describedby"]: isOpen
      ? popupId
      : null,
    "aria-haspopup": variant === "popover" ? true : undefined,
    "onMouseOver": open,
    onMouseLeave,
  };
}

/**
 * Creates props for a component that opens the popup while focused.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindFocus({
  isOpen,
  open,
  close,
  popupId,
  variant,
}) {
  return {
    // $FlowFixMe
    [variant === "popover" ? "aria-controls" : "aria-describedby"]: isOpen
      ? popupId
      : null,
    "aria-haspopup": variant === "popover" ? true : undefined,
    "onFocus": open,
    "onBlur": close,
  };
}

/**
 * Creates props for a `Popover` component.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindPopover({
  isOpen,
  anchorEl,
  close,
  popupId,
  onMouseLeave,
  disableAutoFocus,
}) {
  return {
    id: popupId,
    anchorEl,
    open: isOpen,
    onClose: close,
    onMouseLeave,
    disableAutoFocus,
    disableEnforceFocus: disableAutoFocus,
    disableRestoreFocus: disableAutoFocus,
  };
}

/**
 * Creates props for a `Menu` component.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export const bindMenu = bindPopover;

/**
 * Creates props for a `Popper` component.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindPopper({
  isOpen,
  anchorEl,
  popupId,
}) {
  return {
    id: popupId,
    anchorEl,
    open: isOpen,
  };
}

function getPopup({ popupId }) {
  return popupId && typeof document !== "undefined"
    ? document.getElementById(popupId) // eslint-disable-line no-undef
    : null;
}

function isElementInPopup(
  element,
  popupState,
) {
  const { anchorEl, _childPopupState } = popupState;
  return (
    isAncestor(anchorEl, element) ||
    isAncestor(getPopup(popupState), element) ||
    _childPopupState != null && isElementInPopup(element, _childPopupState)
  );
}

function isAncestor(parent, child) {
  if (!parent) return false;
  while (child) {
    if (child === parent) return true;
    child = child.parentElement;
  }
  return false;
}

function hasChanges(state, nextState) {
  for (let key in nextState) {
    if (state.hasOwnProperty(key) && state[key] !== nextState[key]) {
      return true;
    }
  }
  return false;
}