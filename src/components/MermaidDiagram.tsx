// ============================================================
// Mermaid renderer for text-defined diagrams (sequence / ER /
// class / flowchart). The mermaid library (~large) is imported
// dynamically on first use so it lives in its own lazy chunk.
// The rendered SVG sits in a react-zoom-pan-pinch viewport
// (drag to pan, pinch / buttons to zoom, maximize to fullscreen
// — the pattern from aws-learn-app's DiagramViewport), and the
// "notes" underneath carry the deep analysis.
// ============================================================
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { MermaidVisual } from "../lib/diagrams/types";
import { Loading } from "./bits";

let mermaidPromise: Promise<typeof import("mermaid")["default"]> | null = null;

// Every render() call gets a globally-unique element id. Mermaid keys
// its temporary DOM node off this id; reusing an id across concurrent
// renders (as React StrictMode's double-invoked effects do) makes the
// second render collide and hang, leaving the loader stuck forever.
let renderSeq = 0;

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: "base",
        fontFamily: "Inter, sans-serif",
        themeVariables: {
          primaryColor: "#f4e9d2",
          primaryTextColor: "#14181f",
          primaryBorderColor: "#7a5a0a",
          secondaryColor: "#e4eefa",
          tertiaryColor: "#e0f3e9",
          lineColor: "#4b5563",
          textColor: "#14181f",
          background: "#ffffff",
          mainBkg: "#ffffff",
          nodeBorder: "#d8dce3",
          clusterBkg: "#eef0f4",
          actorBkg: "#f4e9d2",
          actorBorder: "#7a5a0a",
          signalColor: "#14181f",
          signalTextColor: "#14181f",
          noteBkgColor: "#e4eefa",
          noteBorderColor: "#1d5a95",
          labelBoxBkgColor: "#f4e9d2",
          attributeBackgroundColorOdd: "#ffffff",
          attributeBackgroundColorEven: "#eef0f4",
          fontSize: "14px",
        },
      });
      return m.default;
    });
  }
  return mermaidPromise;
}

// Serialize every render through one promise chain. Mermaid mutates
// shared global state during a render, so overlapping calls — several
// diagrams on a page, or StrictMode's paired effect invocations — can
// deadlock. Queuing guarantees one render completes before the next
// starts. A failed render still advances the chain.
let renderChain: Promise<unknown> = Promise.resolve();

function renderMermaid(id: string, chart: string): Promise<{ svg: string }> {
  const run = renderChain.then(() => loadMermaid().then((m) => m.render(id, chart)));
  renderChain = run.then(
    () => undefined,
    () => undefined
  );
  return run as Promise<{ svg: string }>;
}

function Viewport({ children, full }: { children: React.ReactNode; full: boolean }) {
  return (
    <TransformWrapper
      minScale={0.3}
      maxScale={4}
      initialScale={1}
      centerOnInit
      limitToBounds={false}
      wheel={{ activationKeys: full ? [] : ["Control"] }}
      doubleClick={{ mode: "reset" }}
      panning={{ velocityDisabled: true }}
    >
      {(utils) => (
        <>
          <div className="mmd-toolbar">
            <button type="button" className="mmd-btn" title="Zoom out" onClick={() => utils.zoomOut()}>
              −
            </button>
            <button type="button" className="mmd-btn" title="Zoom in" onClick={() => utils.zoomIn()}>
              +
            </button>
            <button type="button" className="mmd-btn" title="Reset view" onClick={() => utils.resetTransform()}>
              ⟲
            </button>
          </div>
          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%", cursor: "grab" }}
            contentStyle={{ padding: 12 }}
          >
            {children}
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  );
}

export function MermaidDiagram({ visual }: { visual: MermaidVisual }) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Fresh id per run so StrictMode's paired invocations never share one.
    const renderId = `mmd${(renderSeq += 1)}`;
    setSvg("");
    setError(null);
    renderMermaid(renderId, visual.chart)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
        // mermaid can leave an orphaned element behind on failure
        document.getElementById(`d${renderId}`)?.remove();
      });
    return () => {
      cancelled = true;
    };
  }, [visual.chart]);

  useEffect(() => {
    if (!maximized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMaximized(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [maximized]);

  const canvas = error ? (
    <div className="mmd-error">
      <b>Diagram failed to render.</b>
      <pre>{error}</pre>
    </div>
  ) : svg ? (
    <div className="mmd-svg" dangerouslySetInnerHTML={{ __html: svg }} />
  ) : (
    <Loading label="Rendering diagram…" />
  );

  const stage = (full: boolean) => (
    <div className={`mmd-stage${full ? " full" : ""}`}>
      <button
        type="button"
        className="diagram-max mono"
        title={full ? "Close full screen (Esc)" : "Full screen"}
        onClick={() => setMaximized(!full)}
      >
        {full ? "✕" : "⛶"}
      </button>
      {error || !svg ? canvas : <Viewport full={full}>{canvas}</Viewport>}
    </div>
  );

  return (
    <div className="diagram-block">
      <div className="diagram-head">
        <b>{visual.title}</b>
        <span className="diagram-hint mono">drag to pan · +/− zoom · ⛶ full screen</span>
      </div>
      {visual.caption && <p className="diagram-caption">{visual.caption}</p>}
      {maximized ? (
        <>
          <div className="diagram-placeholder mono">Opened in full screen — press Esc or ✕ to return.</div>
          {createPortal(
            <div className="diagram-modal">
              <div className="diagram-modal-head">
                <b>{visual.title}</b>
                <button type="button" className="btn small ghost" onClick={() => setMaximized(false)}>
                  ✕ Close
                </button>
              </div>
              <div className="diagram-modal-body">{stage(true)}</div>
            </div>,
            document.body
          )}
        </>
      ) : (
        stage(false)
      )}
      {visual.notes && visual.notes.length > 0 && (
        <div className="mmd-notes">
          {visual.notes.map((n, i) => (
            <div className="mmd-note" key={i}>
              <div className="mmd-note-label">{n.label}</div>
              <p>{n.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
