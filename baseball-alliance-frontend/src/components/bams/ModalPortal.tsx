import { createPortal } from "react-dom";
import type { ReactNode } from "react";

/** Site nav uses z-[100]; render overlays on document.body to escape MarketingShell stacking. */
export const BAMS_MODAL_Z = "z-[1000]";

type Props = {
  children: ReactNode;
};

export default function ModalPortal({ children }: Props) {
  return createPortal(children, document.body);
}
