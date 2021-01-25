import type { BoxProps } from "@material-ui/core/Box";
import Box from "@material-ui/core/Box";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { forwardRef } from "react";

import type { ReactRef, ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";

type Classes = typeof useTextStyles extends () => Record<infer K, unknown> ? K : never;

export const useTextStyles = makeStyles(() =>
  createStyles({
    heading: {
      fontSize: "2rem",
    },
    subheading: {
      fontSize: "1.8rem",
    },
    text: {
      fontSize: "1rem",
    },
    info: {
      fontSize: "0.875rem",
    },
  }));

function textBlock(
  name: string,
  defaultComponent: BoxProps["component"],
  textClass: Classes,
): (props: BoxProps) => ReactResult {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let Element = ({
    className,
    ...boxProps
  }: BoxProps, ref: ReactRef | null): ReactResult => {
    let classes = useTextStyles();

    return <Box
      // @ts-ignore
      ref={ref}
      component={defaultComponent}
      className={clsx(className, classes[textClass])}
      {...boxProps}
    />;
  };

  // @ts-ignore
  Element.displayName = name;

  return ReactMemo(forwardRef(Element));
}

export const Heading = textBlock("Heading", "h1", "heading");
export const SubHeading = textBlock("SubHeading", "h2", "subheading");
export const Text = textBlock("Text", "p", "text");
export const Info = textBlock("Info", "p", "info");
