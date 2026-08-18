import { createVirtualizer } from "@tanstack/solid-virtual";
import { For, JSX, createSignal } from "solid-js";

interface VirtualStripProps<T> {
  items: T[];
  /** Estimated item size along the scroll axis (used before measurement). */
  estimateSize: number;
  /** Horizontal strip (true) or vertical list (false). Default: false. */
  horizontal?: boolean;
  /** Classes for the scrollable container (set a height for horizontal). */
  className?: string;
  /** Optional margin/width tweaks per virtual item (e.g. a gap). */
  itemClassName?: string;
  renderItem: (item: T, index: number) => JSX.Element;
}

/**
 * Windowed strip/list. Only the items near the viewport are rendered, so a
 * library with thousands of tracks/releases no longer creates one DOM node per
 * item (B4). Self-contained: owns its scroll container via a ref, so it does
 * not depend on the overlayscrollbars internals.
 */
export default function VirtualStrip<T>(props: VirtualStripProps<T>) {
  const [scrollEl, setScrollEl] = createSignal<HTMLElement | undefined>();
  const horizontal = props.horizontal ?? false;

  const virtualizer = createVirtualizer({
    count: props.items.length,
    getScrollElement: () => scrollEl() ?? null,
    horizontal,
    estimateSize: () => props.estimateSize,
    overscan: 6,
  });

  return (
    <div
      ref={setScrollEl}
      class={props.className}
      style={{
        overflow: horizontal ? "auto hidden" : "hidden auto",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          width: horizontal ? `${virtualizer.getTotalSize()}px` : "100%",
          height: horizontal ? "100%" : `${virtualizer.getTotalSize()}px`,
        }}
      >
        <For each={virtualizer.getVirtualItems()}>
          {(vitem) => (
            <div
              data-index={vitem.index}
              ref={(el) => virtualizer.measureElement(el)}
              class={props.itemClassName}
              style={{
                position: "absolute",
                top: horizontal ? 0 : `${vitem.start}px`,
                left: horizontal ? `${vitem.start}px` : 0,
                width: horizontal ? undefined : "100%",
              }}
            >
              {props.renderItem(props.items[vitem.index], vitem.index)}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}