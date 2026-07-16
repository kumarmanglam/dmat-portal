import type { TopicDiagramData } from "./types";

// The 7 OSI layers as a vertical stack, coloured by which of the
// 4 TCP/IP layers they collapse into. Data flows top → bottom.
export const OSI_TCP_IP_DIAGRAM: TopicDiagramData = {
  title: "OSI layers → TCP/IP model",
  caption:
    "Seven OSI layers, coloured by the TCP/IP layer they fold into (blue = Application, gold = Transport, green = Internet, grey = Link). Data flows top → bottom, each layer wrapping the one above in its own header — that's encapsulation. Tap a layer for its job, device, protocol and PDU.",
  nodes: [
    {
      id: "app",
      label: "7 · Application",
      desc: "App data — HTTP, DNS, SMTP",
      detail:
        "What the user's program actually speaks. In TCP/IP, layers 7–5 merge into ONE Application layer. PDU: data.",
      x: 150,
      y: 10,
      kind: "blue",
    },
    {
      id: "pres",
      label: "6 · Presentation",
      desc: "Encoding, encryption, compression",
      detail:
        "Translates data formats — TLS encryption, UTF-8, JPEG. Folded into TCP/IP's Application layer.",
      x: 150,
      y: 92,
      kind: "blue",
    },
    {
      id: "sess",
      label: "5 · Session",
      desc: "Dialog control between apps",
      detail:
        "Opens, maintains and closes conversations between two applications. Folded into TCP/IP's Application layer.",
      x: 150,
      y: 174,
      kind: "blue",
    },
    {
      id: "trans",
      label: "4 · Transport",
      desc: "End-to-end delivery — TCP / UDP",
      detail:
        "TCP = ordered, reliable, 3-way handshake (SYN → SYN-ACK → ACK). UDP = fire-and-forget, no guarantees. PDU: segment. → TCP/IP Transport.",
      x: 150,
      y: 256,
      kind: "accent",
    },
    {
      id: "net",
      label: "3 · Network",
      desc: "Routing across networks — IP",
      detail:
        "Logical (IP) addressing and forwarding between different networks. Device: router. PDU: packet. → TCP/IP Internet.",
      x: 150,
      y: 338,
      kind: "green",
    },
    {
      id: "link",
      label: "2 · Data Link",
      desc: "Local delivery by MAC",
      detail:
        "Frames on the local link, MAC addressing, error detection. Device: switch. PDU: frame. → TCP/IP Link.",
      x: 150,
      y: 420,
      kind: "muted",
    },
    {
      id: "phys",
      label: "1 · Physical",
      desc: "Raw bits on the wire",
      detail:
        "Voltages, light pulses, radio — the raw bitstream. Device: hub / cable / NIC. PDU: bits. → TCP/IP Link.",
      x: 150,
      y: 502,
      kind: "muted",
    },
  ],
  edges: [
    { id: "e1", from: "app", to: "pres" },
    { id: "e2", from: "pres", to: "sess" },
    { id: "e3", from: "sess", to: "trans", label: "encapsulate ↓" },
    { id: "e4", from: "trans", to: "net", label: "segment → packet" },
    { id: "e5", from: "net", to: "link", label: "packet → frame" },
    { id: "e6", from: "link", to: "phys", label: "frame → bits" },
  ],
};
