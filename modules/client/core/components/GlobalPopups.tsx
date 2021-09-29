import type { ComponentType, SyntheticEvent } from "react";
import { useRef, useMemo, createContext, useState, useContext } from "react";

import type {
  PopupState,
  ReactChildren,
  ReactResult,
  bindTrigger,
} from "../../utils";
import { useMenuState, ReactMemo } from "../../utils";
import type { Item } from "../schema";

export type ItemPopupBinder = (item: Item) => ReturnType<typeof bindTrigger>;

interface GlobalPopupsState {
  addPopup: (popupId: string) => void;
  openPopup: <P>(
    popupId: string,
    component: ComponentType<P & PopupStateProps>,
    props: P,
    event: SyntheticEvent<any>,
  ) => void;
}

const GlobalPopupsContext = createContext<GlobalPopupsState | undefined>(
  undefined,
);

export interface PopupStateProps {
  state: PopupState;
}

export function useGlobalMenuTrigger<P>(
  popupId: string,
  component: ComponentType<P & PopupStateProps>,
  props: P,
): { onClick: (event: SyntheticEvent<any>) => void } {
  let context = useContext(GlobalPopupsContext);
  if (!context) {
    throw new Error("Attempt to use global popup outside of context.");
  }

  context.addPopup(popupId);

  return {
    onClick(event: SyntheticEvent<any>): void {
      context?.openPopup(popupId, component, props, event);
    },
  };
}

interface PopupComponent<P> {
  component: ComponentType<P & PopupStateProps>;
  props: P;
}

interface GlobalPopupProps<P> {
  popupId: string;
  popupStates: Record<string, PopupState | undefined>;
  component?: PopupComponent<P>;
}

const GlobalPopup = ReactMemo(function GlobalPopup<P>({
  popupId,
  popupStates,
  component,
}: GlobalPopupProps<P>): ReactResult {
  let state = useMenuState(popupId);
  popupStates[popupId] = state;

  if (!component) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  let { component: Component, props } = component;
  return <Component state={state} {...props} />;
});

export default ReactMemo(function GlobalPopups({
  children,
}: ReactChildren): ReactResult {
  let popupStates = useRef<Record<string, PopupState | undefined>>({});

  let [popups, setPopups] = useState<string[]>([]);
  let [components, setComponents] = useState<
    Record<string, PopupComponent<any>>
  >({});

  let state: GlobalPopupsState = useMemo(
    () => ({
      addPopup(popupId: string): void {
        setPopups((popups: string[]): string[] => {
          if (popups.includes(popupId)) {
            return popups;
          }
          return [...popups, popupId];
        });
      },

      openPopup<P>(
        popupId: string,
        component: ComponentType<P & PopupStateProps>,
        props: P,
        event: SyntheticEvent<any>,
      ): void {
        setComponents(
          (
            currentComponents: Record<string, PopupComponent<any>>,
          ): Record<string, PopupComponent<any>> => {
            return {
              ...currentComponents,
              [popupId]: {
                component,
                props,
              },
            };
          },
        );

        popupStates.current[popupId]?.open(event);
      },
    }),
    [],
  );

  return (
    <GlobalPopupsContext.Provider value={state}>
      {children}
      {popups.map((popupId: string) => (
        <GlobalPopup
          key={popupId}
          popupId={popupId}
          popupStates={popupStates.current}
          component={components[popupId]}
        />
      ))}
    </GlobalPopupsContext.Provider>
  );
});
